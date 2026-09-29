import React, { useEffect, useState } from 'react';
import { StormCell } from '../App';
import { Crosshair, Clock, Compass } from 'lucide-react';

interface StormTrackerViewProps {
  selectedCell: StormCell | null;
  onSelectCell: (cell: StormCell) => void;
}

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
      { location: "Kolhapur Rural", distance_km: 12, eta_minutes: 19, risk_probability: 0.92, recommended_action: "Immediate shelter for farm workers" },
      { location: "Ichalkaranji Town", distance_km: 24, eta_minutes: 38, risk_probability: 0.88, recommended_action: "Halt high-voltage line repairs" }
    ],
    shap_explainability: { radar_reflectivity: 31, lightning_flash_rate: 27, satellite_cloud_cooling: 21, surface_cape: 12, bulk_wind_shear: 9 }
  },
  {
    cell_id: "CELL #108",
    name: "Satara-Karad Convective System",
    latitude: 17.283,
    longitude: 74.182,
    max_reflectivity_dbz: 49.2,
    speed_kmh: 32,
    direction: "NE",
    bearing_degrees: 42,
    growth_rate_pct: "+14%",
    cloud_top_temp_celsius: -62.1,
    lightning_rate_flashes_min: 88,
    lightning_risk_pct: 84,
    confidence_rating: 91,
    status: "MODERATE SEVERITY",
    downstream_impacts: [
      { location: "Karad Industrial Zone", distance_km: 15, eta_minutes: 28, risk_probability: 0.84, recommended_action: "Secure outdoor inventory" }
    ],
    shap_explainability: { radar_reflectivity: 28, lightning_flash_rate: 25, satellite_cloud_cooling: 24, surface_cape: 15, bulk_wind_shear: 8 }
  }
];

const StormTrackerView: React.FC<StormTrackerViewProps> = ({ selectedCell, onSelectCell }) => {
  const [cells, setCells] = useState<StormCell[]>(DEFAULT_CELLS);

  useEffect(() => {
    fetch("http://localhost:8000/api/storms")
      .then(res => res.json())
      .then(data => {
        if (data.storm_cells && data.storm_cells.length > 0) {
          setCells(data.storm_cells);
        }
      })
      .catch(err => {
        console.warn("Backend API offline, using cached telemetry:", err);
      });
  }, []);

  const currentCell = selectedCell || cells[0] || DEFAULT_CELLS[0];

  return (
    <div className="screen-2col">
      {/* Left List */}
      <div className="card-panel">
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair className="text-cyan" size={16} /> Active Convective Storm Cores
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cells.map(cell => (
            <div 
              key={cell.cell_id}
              style={{
                background: cell.cell_id === currentCell.cell_id ? '#e0f2fe' : '#f8fafc',
                border: `1px solid ${cell.cell_id === currentCell.cell_id ? '#0284c7' : 'var(--border-color)'}`,
                padding: '12px 14px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
              onClick={() => onSelectCell(cell)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px' }}>
                <span>{cell.cell_id}</span>
                <span className="text-danger">{cell.lightning_risk_pct}% Risk</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{cell.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Details */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><Compass className="text-danger" size={18} style={{ display: 'inline', marginRight: '6px' }} /> Cell Telemetry — <strong>{currentCell.cell_id}</strong></h3>
          <span className="badge-red">{currentCell.status}</span>
        </div>

        {/* Downstream Table */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Projected Downstream Arrival Times
          </h4>
          <table className="clean-table">
            <thead>
              <tr>
                <th>Target Location</th>
                <th>Distance</th>
                <th>Estimated Arrival</th>
                <th>Risk Probability</th>
                <th>Advisory Action</th>
              </tr>
            </thead>
            <tbody>
              {currentCell.downstream_impacts.map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.location}</strong></td>
                  <td>{d.distance_km} km</td>
                  <td><span className="text-cyan font-bold">{d.eta_minutes} min</span></td>
                  <td><span className="text-danger font-bold">{(d.risk_probability * 100).toFixed(0)}%</span></td>
                  <td><span className="text-warning">{d.recommended_action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StormTrackerView;
