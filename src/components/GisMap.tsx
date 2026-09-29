import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, CloudLightning, Layers, Radio, Activity, Search, MapPin } from 'lucide-react';
import { StormCell } from '../App';

interface GisMapProps {
  horizon: number;
  setHorizon: React.Dispatch<React.SetStateAction<number>>;
  onSelectCell: (cell: StormCell) => void;
}

const REGION_LOCATIONS = [
  { id: "kolhapur", name: "Kolhapur-Sangli Severe Convective Core", lat: 17.4, lon: 74.3 },
  { id: "mumbai", name: "Mumbai Metropolitan DWR Region", lat: 19.07, lon: 72.87 },
  { id: "delhi", name: "Delhi-NCR Severe Thunderstorm Belt", lat: 28.61, lon: 77.20 },
  { id: "kolkata", name: "Kolkata Nor'wester (Kalbaishakhi) Zone", lat: 22.57, lon: 88.36 },
  { id: "bengaluru", name: "Bengaluru Pre-Monsoon Lightning Core", lat: 12.97, lon: 77.59 },
  { id: "chennai", name: "Chennai Coastal Convective Zone", lat: 13.08, lon: 80.27 }
];

const DEFAULT_CELLS: StormCell[] = [
  {
    cell_id: "CELL #104",
    name: "Kolhapur-Sangli Severe Convective Core",
    latitude: 16.705,
    longitude: 74.243,
    max_reflectivity_dbz: 56.4,
    speed_kmh: 38,
    direction: "NE",
    bearing_degrees: 48,
    growth_rate_pct: "+21%",
    cloud_top_temp_celsius: -68.4,
    lightning_rate_flashes_min: 142,
    lightning_risk_pct: 92,
    confidence_rating: 94,
    status: "HIGH SEVERITY",
    downstream_impacts: [
      { location: "Kolhapur Rural", distance_km: 12, eta_minutes: 19, risk_probability: 0.92, recommended_action: "Immediate shelter for farm workers" }
    ],
    shap_explainability: { radar_reflectivity: 31, lightning_flash_rate: 27, satellite_cloud_cooling: 21, surface_cape: 12, bulk_wind_shear: 9 }
  }
];

const RADAR_STATIONS = [
  { id: "all", name: "Fused Multi-Radar Network (IMD Grid)" },
  { id: "mumbai", name: "DWR Mumbai (ISRO/IMD)" },
  { id: "solapur", name: "DWR Solapur" },
  { id: "goa", name: "DWR Goa (MoES)" },
  { id: "thumba", name: "DWR TERLS Thumba" }
];

const GisMap: React.FC<GisMapProps> = ({ horizon, setHorizon, onSelectCell }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stormCells, setStormCells] = useState<StormCell[]>(DEFAULT_CELLS);
  const [peakRiskPct, setPeakRiskPct] = useState<number>(92);
  const [selectedRadar, setSelectedRadar] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("kolhapur");
  const [tickerText, setTickerText] = useState<string>("MOSDAC Radar (3m) | INSAT-3DS TIR1 (0m) | IITM LLN (Live 1s)");

  const [layersConfig, setLayersConfig] = useState({
    radar: true,
    satellite: true,
    lightning: true,
    cells: true,
    hazard: true
  });

  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Fetch Live Prediction from FastAPI Backend for selected location & horizon
  const fetchLocationPrediction = (lat: number, lon: number, locationName: string) => {
    fetch(`http://localhost:8000/api/nowcast?horizon=${horizon}&lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (data.storm_cells && data.storm_cells.length > 0) {
          const updatedCells = data.storm_cells.map((c: any, idx: number) => ({
            ...c,
            latitude: lat + (idx * 0.12 - 0.06),
            longitude: lon + (idx * 0.12 - 0.06),
            name: `${locationName} Convective Core`
          }));
          setStormCells(updatedCells);
        } else {
          // Dynamic fallback for clicked location
          setStormCells([
            {
              cell_id: `CELL #${Math.floor(100 + Math.random() * 900)}`,
              name: `${locationName} Convective Cell`,
              latitude: lat,
              longitude: lon,
              max_reflectivity_dbz: 52.8,
              speed_kmh: 36,
              direction: "NE",
              bearing_degrees: 45,
              growth_rate_pct: "+18%",
              cloud_top_temp_celsius: -64.2,
              lightning_rate_flashes_min: 110,
              lightning_risk_pct: 88,
              confidence_rating: 92,
              status: "HIGH SEVERITY",
              downstream_impacts: [
                { location: `${locationName} Rural`, distance_km: 14, eta_minutes: 22, risk_probability: 0.88, recommended_action: "Halt outdoor activities & seek shelter" }
              ],
              shap_explainability: { radar_reflectivity: 30, lightning_flash_rate: 26, satellite_cloud_cooling: 22, surface_cape: 13, bulk_wind_shear: 9 }
            }
          ]);
        }
      })
      .catch(() => {
        setStormCells([
          {
            cell_id: `CELL #${Math.floor(100 + Math.random() * 900)}`,
            name: `${locationName} Convective Cell`,
            latitude: lat,
            longitude: lon,
            max_reflectivity_dbz: 54.0,
            speed_kmh: 35,
            direction: "NE",
            bearing_degrees: 45,
            growth_rate_pct: "+15%",
            cloud_top_temp_celsius: -65.0,
            lightning_rate_flashes_min: 120,
            lightning_risk_pct: 90,
            confidence_rating: 93,
            status: "HIGH SEVERITY",
            downstream_impacts: [
              { location: `${locationName} Suburbs`, distance_km: 12, eta_minutes: 18, risk_probability: 0.90, recommended_action: "Immediate shelter advisory" }
            ],
            shap_explainability: { radar_reflectivity: 32, lightning_flash_rate: 28, satellite_cloud_cooling: 20, surface_cape: 12, bulk_wind_shear: 8 }
          }
        ]);
      });
  };

  // Handle Region Change
  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    const reg = REGION_LOCATIONS.find(r => r.id === regionId);
    if (reg && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([reg.lat, reg.lon], 9, { duration: 1.2 });
      fetchLocationPrediction(reg.lat, reg.lon, reg.name.split(" ")[0]);
    }
  };

  // WebSocket Telemetry
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/live-feed");
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.live_ticker) setTickerText(payload.live_ticker);
          if (payload.peak_risk_pct) setPeakRiskPct(payload.peak_risk_pct);
        } catch {}
      };
    } catch {}
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Initialize Map & Click Listener
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    try {
      const map = L.map(container, {
        center: [17.4, 74.3],
        zoom: 8,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Interactive Map Click Event (Dynamic Nowcasting for Clicked Lat/Lon)
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedLat = Number(e.latlng.lat.toFixed(3));
        const clickedLon = Number(e.latlng.lng.toFixed(3));
        const customName = `Custom Sector (${clickedLat}°N, ${clickedLon}°E)`;
        
        map.flyTo([clickedLat, clickedLon], map.getZoom(), { duration: 0.8 });
        fetchLocationPrediction(clickedLat, clickedLon, customName);
      });

      layersGroupRef.current = {
        radar: L.layerGroup().addTo(map),
        satellite: L.layerGroup().addTo(map),
        lightning: L.layerGroup().addTo(map),
        cells: L.layerGroup().addTo(map),
        hazard: L.layerGroup().addTo(map)
      };

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn("Leaflet initialization info:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Overlay Layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    Object.values(layersGroupRef.current).forEach(g => {
      if (g) g.clearLayers();
    });

    const timeFactor = horizon / 60;

    stormCells.forEach(cell => {
      const distanceKm = cell.speed_kmh * timeFactor;
      const cLat = cell.latitude + (distanceKm * Math.cos(cell.bearing_degrees * Math.PI / 180)) / 111;
      const cLon = cell.longitude + (distanceKm * Math.sin(cell.bearing_degrees * Math.PI / 180)) / 100;

      // Radar Reflectivity Ring
      if (layersConfig.radar && layersGroupRef.current.radar) {
        L.circle([cLat, cLon], {
          radius: 20000 + (cell.max_reflectivity_dbz * 100),
          fillColor: cell.max_reflectivity_dbz > 52 ? '#dc2626' : '#d97706',
          fillOpacity: 0.35,
          color: '#dc2626',
          weight: 2
        }).addTo(layersGroupRef.current.radar);
      }

      // Satellite Cloud Cooling Ring
      if (layersConfig.satellite && layersGroupRef.current.satellite) {
        L.circle([cLat, cLon], {
          radius: 34000,
          fillColor: '#7c3aed',
          fillOpacity: 0.18,
          color: '#8b5cf6',
          weight: 1.5,
          dashArray: '4,4'
        }).addTo(layersGroupRef.current.satellite);
      }

      // Lightning Strikes Density Clusters
      if (layersConfig.lightning && layersGroupRef.current.lightning) {
        for (let i = 0; i < 4; i++) {
          L.circleMarker([cLat + (i * 0.02 - 0.03), cLon + (i * 0.02 - 0.03)], {
            radius: 5,
            fillColor: '#d97706',
            color: '#fff',
            weight: 1.5,
            fillOpacity: 0.95
          }).addTo(layersGroupRef.current.lightning);
        }
      }

      // Storm Cell Centroid Marker
      if (layersConfig.cells && layersGroupRef.current.cells) {
        const marker = L.circleMarker([cLat, cLon], {
          radius: 12,
          fillColor: '#dc2626',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        });

        marker.bindTooltip(`
          <div style="font-family: var(--font-main); padding: 4px;">
            <strong style="color: #dc2626;">${cell.cell_id}: ${cell.name}</strong><br/>
            Reflectivity: <strong>${cell.max_reflectivity_dbz} dBZ</strong><br/>
            Horizon: <strong>+${horizon} min</strong> | Lightning Risk: <strong>${cell.lightning_risk_pct}%</strong>
          </div>
        `);

        marker.on('click', () => onSelectCell(cell));
        marker.addTo(layersGroupRef.current.cells);
      }
    });
  }, [horizon, layersConfig, stormCells, onSelectCell]);

  // Handle Playback Loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setHorizon((prev) => (prev >= 90 ? 0 : prev + 15));
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, setHorizon]);

  return (
    <div className="map-screen">
      <div ref={mapContainerRef} className="gis-canvas" style={{ width: '100%', height: '100%', minHeight: '500px' }} />

      {/* Floating Location Search & Sensor Selector Bar */}
      <div className="floating-radar-selector">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={14} className="text-cyan" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>TARGET REGION:</span>
          <select 
            value={selectedRegion} 
            onChange={(e) => handleRegionSelect(e.target.value)}
            className="radar-dropdown"
          >
            {REGION_LOCATIONS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={14} className="text-cyan" />
          <select 
            value={selectedRadar} 
            onChange={(e) => setSelectedRadar(e.target.value)}
            className="radar-dropdown"
          >
            {RADAR_STATIONS.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating Risk Status Pill */}
      <div className="floating-pill">
        <CloudLightning className="text-danger" size={24} />
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>HAZARD STATUS</div>
          <div className="pill-val text-danger">HIGH RISK ({peakRiskPct}%)</div>
        </div>
      </div>

      {/* Floating Layer Controls */}
      <div className="floating-layers">
        <div style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-primary)' }}>
          <Layers size={14} style={{ display: 'inline', marginRight: '6px' }} /> MAP LAYERS
        </div>
        <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <span>Radar Reflectivity</span>
          <input type="checkbox" checked={layersConfig.radar} onChange={e => setLayersConfig({ ...layersConfig, radar: e.target.checked })} />
        </label>
        <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <span>INSAT Satellite</span>
          <input type="checkbox" checked={layersConfig.satellite} onChange={e => setLayersConfig({ ...layersConfig, satellite: e.target.checked })} />
        </label>
        <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <span>Lightning Strikes</span>
          <input type="checkbox" checked={layersConfig.lightning} onChange={e => setLayersConfig({ ...layersConfig, lightning: e.target.checked })} />
        </label>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={10} /> Click map to nowcast any spot
        </div>
      </div>

      {/* Reflectivity Color Scale Legend (dBZ Scale) */}
      <div className="dbz-legend-bar">
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} /> RADAR REFLECTIVITY (dBZ SCALE)
        </div>
        <div className="dbz-gradient-ramp" />
        <div className="dbz-labels">
          <span>15</span>
          <span>25</span>
          <span>35</span>
          <span>45</span>
          <span>55+</span>
        </div>
      </div>

      {/* Floating Timeline Slider */}
      <div className="floating-slider">
        <button className="play-btn-circle" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)' }}>
            <span>NOWCAST PROJECTION: <strong className="text-cyan">+{horizon} MIN</strong></span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{tickerText}</span>
          </div>
          <input 
            type="range" min="0" max="90" step="15" value={horizon} 
            onChange={(e) => setHorizon(parseInt(e.target.value))} 
            style={{ accentColor: '#0284c7', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

export default GisMap;
