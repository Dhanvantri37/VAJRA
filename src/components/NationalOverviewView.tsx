import React, { useEffect, useRef, useState } from 'react';
import { Globe, AlertTriangle, ShieldCheck, MapPin, Radio, Activity, Layers, Zap, Cpu, ArrowRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface NationalOverviewViewProps {
  onSelectRegion: () => void;
}

const NATIONAL_STORM_CLUSTERS = [
  { id: 'nagpur', name: 'Nagpur & East Vidarbha', lat: 21.1458, lng: 79.0882, cells: 3, risk: 94, severity: 'HIGH SEVERITY', dwr: 'DWR Nagpur' },
  { id: 'kolhapur', name: 'Kolhapur & Sangli Rural', lat: 16.7050, lng: 74.2433, cells: 3, risk: 92, severity: 'HIGH SEVERITY', dwr: 'DWR Solapur / Mumbai' },
  { id: 'kolkata', name: 'Kolkata & Gangetic West Bengal', lat: 22.5726, lng: 88.3639, cells: 4, risk: 89, severity: 'HIGH SEVERITY', dwr: 'DWR Kolkata' },
  { id: 'delhi', name: 'Delhi-NCR & Western UP', lat: 28.6139, lng: 77.2090, cells: 2, risk: 85, severity: 'SEVERE THUNDERSTORM', dwr: 'DWR Palam / Delhi' },
  { id: 'bengaluru', name: 'Pre-Monsoon Bengaluru', lat: 12.9716, lng: 77.5946, cells: 2, risk: 78, severity: 'MODERATE RISK', dwr: 'DWR Bengaluru' }
];

const NationalOverviewView: React.FC<NationalOverviewViewProps> = ({ onSelectRegion }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    radar: true,
    sat: true,
    lightning: true
  });

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    try {
      const map = L.map(container, {
        center: [21.5937, 78.9629],
        zoom: 5,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | MoES IMD AI Fusion'
      }).addTo(map);

      // Render glowing lightning iconography pins over active national storm clusters
      NATIONAL_STORM_CLUSTERS.forEach(cluster => {
        const isHigh = cluster.risk > 90;

        const lightningIcon = L.divIcon({
          className: 'national-storm-pin',
          html: `
            <div style="
              position: relative; 
              width: 32px; 
              height: 32px; 
              background: ${isHigh ? 'rgba(220, 38, 38, 0.9)' : 'rgba(217, 119, 6, 0.9)'}; 
              border: 2px solid #ffffff; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              box-shadow: 0 0 18px ${isHigh ? '#ef4444' : '#f59e0b'};
              cursor: pointer;
            ">
              <span style="font-size: 16px; color: #fef08a;">⚡</span>
              <div style="
                position: absolute; 
                top: -6px; 
                right: -6px; 
                background: #0f172a; 
                color: #ffffff; 
                font-size: 9px; 
                font-weight: 800; 
                padding: 1px 5px; 
                border-radius: 8px; 
                border: 1px solid #38bdf8;
              ">
                ${cluster.risk}%
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: lightningIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <h4 style="margin: 0; font-weight: 800; font-size: 13px; color: #0f172a;">${cluster.name}</h4>
            <div style="font-size: 11px; color: #dc2626; font-weight: 700; margin-top: 2px;">Threat Index: ${cluster.risk}% (${cluster.severity})</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Active Cores: ${cluster.cells} Cells | Sensor: ${cluster.dwr}</div>
            <button id="btn-drill-${cluster.id}" style="
              margin-top: 8px; 
              width: 100%; 
              background: #0284c7; 
              color: #ffffff; 
              border: none; 
              padding: 6px; 
              border-radius: 6px; 
              font-size: 11px; 
              font-weight: 700; 
              cursor: pointer;
            ">Drill Down to State Micro View →</button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-drill-${cluster.id}`);
          if (btn) {
            btn.onclick = () => onSelectRegion();
          }
        });
      });

      leafletInstance.current = map;
    } catch (err) {
      console.warn("National map init info:", err);
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="safety-container" style={{ padding: '16px 24px' }}>
      {/* Top Header Banner */}
      <div className="safety-header">
        <div className="safety-title-box">
          <Globe size={24} className="text-cyan" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Pan-India National Macro Command View</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              National Meteorological Center (NMC New Delhi) — Multi-Radar & Satellite Atmospheric Fusion
            </p>
          </div>
        </div>
        <div className="emergency-chip">
          <span>NATIONAL MONITORING: <strong style={{ color: 'var(--accent-green)' }}>OPERATIONAL (35 DWR Radars Online)</strong></span>
        </div>
      </div>

      {/* Screen 3 Main Map & Floating Widgets Layout */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Full Screen India Map */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Glassmorphism Metric Widgets (Top Left) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px',
          width: '280px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} className="text-cyan" /> Live National Telemetry
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE CELLS</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '2px' }}>14 Cores</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>THREAT INDEX</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '2px' }}>88 / 100</div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Doppler Radars Active:</span>
              <strong style={{ color: 'var(--accent-green)' }}>35 / 37</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>INSAT-3DS Channels:</span>
              <strong style={{ color: 'var(--accent-purple)' }}>18 Bands</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Lightning Stations:</span>
              <strong style={{ color: 'var(--primary-dark)' }}>112 Sites</strong>
            </div>
          </div>

          <button 
            className="btn-alert" 
            style={{ width: '100%', justifyContent: 'center', background: 'var(--primary-blue)', fontSize: '12px', padding: '8px' }}
            onClick={onSelectRegion}
          >
            Drill Down to State Micro View <ArrowRight size={14} />
          </button>
        </div>

        {/* Floating Layer Control Panel (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ATMOSPHERIC LAYERS</span>

          <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={activeLayers.radar} onChange={e => setActiveLayers({...activeLayers, radar: e.target.checked})} />
            <span>Doppler Weather Radar (3D Reflectivity dBZ)</span>
          </label>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={activeLayers.sat} onChange={e => setActiveLayers({...activeLayers, sat: e.target.checked})} />
            <span>INSAT-3DS Satellite IR Cloud Tops</span>
          </label>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={activeLayers.lightning} onChange={e => setActiveLayers({...activeLayers, lightning: e.target.checked})} />
            <span>IITM Lightning Flash Density</span>
          </label>
        </div>

        {/* Floating Active Convective Zones Drawer (Bottom Left) */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> LIVE THREAT CLUSTERS:
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {NATIONAL_STORM_CLUSTERS.slice(0, 3).map((c, i) => (
              <span key={i} onClick={onSelectRegion} style={{ fontSize: '11px', fontWeight: 700, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                📍 {c.name} ({c.risk}%)
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NationalOverviewView;

