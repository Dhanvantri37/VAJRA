import React from 'react';
import { Database } from 'lucide-react';

interface DataLineageViewProps {
  simMode: string;
  onSimChange: (mode: string) => void;
}

const DataLineageView: React.FC<DataLineageViewProps> = ({ simMode, onSimChange }) => {
  return (
    <div className="card-panel" style={{ margin: '16px', height: 'calc(100% - 32px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database className="text-cyan" size={18} /> Authoritative Data Citation Matrix
        </h3>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Jury Simulation:</span>
          <button 
            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: simMode === 'all_ok' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}
            onClick={() => onSimChange('all_ok')}
          >
            All Active
          </button>
          <button 
            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: simMode === 'no_radar' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: '#ef4444', cursor: 'pointer' }}
            onClick={() => onSimChange('no_radar')}
          >
            Simulate Radar Outage
          </button>
          <button 
            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: simMode === 'no_lightning' ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: '#f59e0b', cursor: 'pointer' }}
            onClick={() => onSimChange('no_lightning')}
          >
            Simulate Lightning Outage
          </button>
        </div>
      </div>

      <table className="clean-table" style={{ marginTop: '12px' }}>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Authoritative Provider</th>
            <th>Parameters Extracted</th>
            <th>Operational Purpose</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>📡 <strong>Radar</strong></td>
            <td>MOSDAC / ISRO TERLS DWR</td>
            <td>3D Reflectivity (dBZ), Radial velocity</td>
            <td>Storm intensity & convective core velocity</td>
            <td>
              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: simMode === 'no_radar' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: simMode === 'no_radar' ? '#ef4444' : '#10b981' }}>
                {simMode === 'no_radar' ? 'OFFLINE (Simulated)' : 'ONLINE'}
              </span>
            </td>
          </tr>
          <tr>
            <td>🛰️ <strong>Satellite</strong></td>
            <td>MOSDAC – INSAT-3DS</td>
            <td>Cloud-top temp (TIR1), Motion vectors</td>
            <td>Early cloud cooling detection & steering</td>
            <td><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>ONLINE</span></td>
          </tr>
          <tr>
            <td>⚡ <strong>Lightning</strong></td>
            <td>IITM / NCESS / NRSC</td>
            <td>Stroke Lat/Lon, Flash count rate</td>
            <td>Stroke density & lightning probability fields</td>
            <td>
              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: simMode === 'no_lightning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: simMode === 'no_lightning' ? '#f59e0b' : '#10b981' }}>
                {simMode === 'no_lightning' ? 'DELAYED (Simulated)' : 'ONLINE'}
              </span>
            </td>
          </tr>
          <tr>
            <td>🌡️ <strong>Weather Stations</strong></td>
            <td>IMD AWS / ARG Network</td>
            <td>Temp, Humidity, Pressure, Wind</td>
            <td>Surface moisture convergence & CAPE</td>
            <td><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>ONLINE</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DataLineageView;
