import React from 'react';
import { StormCell } from '../App';
import { Lightbulb, Award } from 'lucide-react';

interface XaiViewProps {
  selectedCell: StormCell | null;
}

const XaiView: React.FC<XaiViewProps> = ({ selectedCell }) => {
  const shap = selectedCell?.shap_explainability || {
    radar_reflectivity: 31,
    lightning_flash_rate: 27,
    satellite_cloud_cooling: 21,
    surface_cape: 12,
    bulk_wind_shear: 9
  };

  return (
    <div className="screen-2col">
      <div className="card-panel">
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb className="text-amber" size={18} /> SHAP Feature Impact Breakdown
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Doppler Radar Core Reflectivity</span>
              <strong className="text-danger">{shap.radar_reflectivity}%</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '4px' }}>
              <div style={{ width: `${shap.radar_reflectivity}%`, background: '#ef4444', height: '100%', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Lightning Stroke Density Trend</span>
              <strong className="text-amber">{shap.lightning_flash_rate}%</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '4px' }}>
              <div style={{ width: `${shap.lightning_flash_rate}%`, background: '#f59e0b', height: '100%', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>INSAT Cloud-Top Cooling Rate</span>
              <strong className="text-purple">{shap.satellite_cloud_cooling}%</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '4px' }}>
              <div style={{ width: `${shap.satellite_cloud_cooling}%`, background: '#a855f7', height: '100%', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>IMD AWS Surface CAPE / Moisture</span>
              <strong className="text-cyan">{shap.surface_cape}%</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '4px' }}>
              <div style={{ width: `${shap.surface_cape}%`, background: '#06b6d4', height: '100%', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award className="text-cyan" size={18} /> Verification Metrics vs Baselines
        </h3>
        
        <table className="clean-table" style={{ marginTop: '12px' }}>
          <thead>
            <tr>
              <th>Forecast Model</th>
              <th>POD (Hits) ↑</th>
              <th>FAR (False) ↓</th>
              <th>CSI Score ↑</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Persistence Baseline</td>
              <td>0.54</td>
              <td>0.38</td>
              <td>0.41</td>
            </tr>
            <tr>
              <td>Optical Flow Radar</td>
              <td>0.68</td>
              <td>0.29</td>
              <td>0.53</td>
            </tr>
            <tr style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
              <td><strong>VAJRA AI Multi-Source Fusion</strong></td>
              <td><strong>0.88</strong></td>
              <td><strong>0.14</strong></td>
              <td><strong>0.77</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default XaiView;
