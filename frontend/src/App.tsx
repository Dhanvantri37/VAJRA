import React, { useState, useEffect } from 'react';
import { Shield, Zap, Map, Crosshairs, Lightbulb, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import GisMap from './components/GisMap';
import StormTrackerView from './components/StormTrackerView';
import XaiView from './components/XaiView';
import DataLineageView from './components/DataLineageView';
import AlertModal from './components/AlertModal';

export interface StormCell {
  cell_id: str;
  name: string;
  latitude: number;
  longitude: number;
  max_reflectivity_dbz: number;
  speed_kmh: number;
  direction: string;
  bearing_degrees: number;
  growth_rate_pct: string;
  cloud_top_temp_celsius: number;
  lightning_rate_flashes_min: number;
  lightning_risk_pct: number;
  confidence_rating: number;
  status: string;
  downstream_impacts: Array<{
    location: string;
    distance_km: number;
    eta_minutes: number;
    risk_probability: number;
    recommended_action: string;
  }>;
  shap_explainability: {
    radar_reflectivity: number;
    lightning_flash_rate: number;
    satellite_cloud_cooling: number;
    surface_cape: number;
    bulk_wind_shear: number;
  };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'tracking' | 'xai' | 'data'>('map');
  const [forecastHorizon, setForecastHorizon] = useState<number>(30);
  const [selectedCell, setSelectedCell] = useState<StormCell | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [adaptiveMode, setAdaptiveMode] = useState<string>('Mode 1: Primary Fusion (All Available)');
  const [simMode, setSimMode] = useState<string>('all_ok');

  const handleSimChange = (mode: string) => {
    setSimMode(mode);
    fetch(`/api/degradation-sim?mode=${mode}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (mode === 'all_ok') {
          setAdaptiveMode('Mode 1: Primary Fusion (Full Precision)');
        } else if (mode === 'no_radar') {
          setAdaptiveMode('Mode 2: Satellite INSAT + Lightning Fallback (Radar Outage)');
        } else if (mode === 'no_lightning') {
          setAdaptiveMode('Mode 3: AWS Surface + ERA5 Fallback (LLN Outage)');
        }
      })
      .catch(err => console.log('Simulation update:', err));
  };

  return (
    <div className="dark-app">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-logo-group">
          <div className="brand-icon"><Zap size={22} className="text-amber" /></div>
          <div>
            <h1 className="brand-title">VAJRA <span className="sih-badge">SIH26072</span></h1>
            <p className="brand-sub">Visionary AI for Joint Radar & Atmospheric Nowcasting</p>
          </div>
        </div>

        <nav className="tab-nav">
          <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <Map size={16} /> Live Hazard Map
          </button>
          <button className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
            <Crosshairs size={16} /> Storm Tracking
          </button>
          <button className={`tab-btn ${activeTab === 'xai' ? 'active' : ''}`} onClick={() => setActiveTab('xai')}>
            <Lightbulb size={16} /> Explain Risk (XAI)
          </button>
          <button className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            <Database size={16} /> Data Lineage
          </button>
        </nav>

        <div className="header-right">
          <div className="status-chip" onClick={() => setActiveTab('data')}>
            <span className="pulse-dot green"></span>
            <span>{adaptiveMode}</span>
          </div>
          <button className="btn-alert" onClick={() => setShowAlert(true)}>
            <AlertTriangle size={16} /> Emergency Alert
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="viewport">
        {activeTab === 'map' && (
          <GisMap 
            horizon={forecastHorizon} 
            setHorizon={setForecastHorizon}
            onSelectCell={(cell) => { setSelectedCell(cell); setActiveTab('tracking'); }}
          />
        )}
        {activeTab === 'tracking' && (
          <StormTrackerView 
            selectedCell={selectedCell} 
            onSelectCell={setSelectedCell}
          />
        )}
        {activeTab === 'xai' && (
          <XaiView selectedCell={selectedCell} />
        )}
        {activeTab === 'data' && (
          <DataLineageView simMode={simMode} onSimChange={handleSimChange} />
        )}
      </main>

      {/* Emergency Alert Modal */}
      {showAlert && <AlertModal onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default App;
