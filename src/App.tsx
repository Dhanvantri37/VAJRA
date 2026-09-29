import React, { useState } from 'react';
import { 
  Zap, Home, Globe, Radio, User, 
  Map, Crosshair, Cpu, Database, 
  ShieldAlert, AlertTriangle, BookOpen, Bell 
} from 'lucide-react';
import LandingHeroView from './components/LandingHeroView';
import NationalOverviewView from './components/NationalOverviewView';
import GisMap from './components/GisMap';
import StormTrackerView from './components/StormTrackerView';
import XaiView from './components/XaiView';
import DataLineageView from './components/DataLineageView';
import CitizenPortalView from './components/CitizenPortalView';
import SafetyAdvisoriesView from './components/SafetyAdvisoriesView';
import AlertModal from './components/AlertModal';

export interface StormCell {
  cell_id: string;
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
  const [mainRole, setMainRole] = useState<'home' | 'national' | 'regional' | 'citizen'>('home');
  const [regionalTab, setRegionalTab] = useState<'map' | 'tracking' | 'xai' | 'data'>('map');
  const [citizenTab, setCitizenTab] = useState<'registration' | 'safety'>('registration');
  const [forecastHorizon, setForecastHorizon] = useState<number>(30);
  const [selectedCell, setSelectedCell] = useState<StormCell | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [adaptiveMode, setAdaptiveMode] = useState<string>('Primary Ingestion Active');
  const [simMode, setSimMode] = useState<string>('all_ok');

  const handleSimChange = (mode: string) => {
    setSimMode(mode);
    fetch(`/api/degradation-sim?mode=${mode}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        if (mode === 'all_ok') {
          setAdaptiveMode('Primary Ingestion Active');
        } else if (mode === 'no_radar') {
          setAdaptiveMode('INSAT + Lightning Fallback');
        } else if (mode === 'no_lightning') {
          setAdaptiveMode('AWS + Radar Fallback');
        }
      })
      .catch(() => {
        if (mode === 'all_ok') setAdaptiveMode('Primary Ingestion Active');
        else if (mode === 'no_radar') setAdaptiveMode('INSAT + Lightning Fallback');
        else if (mode === 'no_lightning') setAdaptiveMode('AWS + Radar Fallback');
      });
  };

  return (
    <div className="dark-app">
      {/* Primary Top Header Navigation */}
      <header className="app-header">
        <div className="brand-logo-group" onClick={() => setMainRole('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Zap size={20} className="text-amber" />
          </div>
          <div>
            <h1 className="brand-title">
              VAJRA <span className="sih-badge">SIH26072</span>
            </h1>
            <p className="brand-sub">Atmospheric AI Nowcasting Platform</p>
          </div>
        </div>

        {/* 4 Main Role Portals */}
        <nav className="tab-nav">
          <button
            className={`tab-btn ${mainRole === 'home' ? 'active' : ''}`}
            onClick={() => setMainRole('home')}
          >
            <Home size={15} /> Screen 1: Public Safety Front
          </button>
          <button
            className={`tab-btn ${mainRole === 'citizen' ? 'active' : ''}`}
            onClick={() => setMainRole('citizen')}
          >
            <Bell size={15} /> Screen 2: Alert Setup Portal
          </button>
          <button
            className={`tab-btn ${mainRole === 'national' ? 'active' : ''}`}
            onClick={() => setMainRole('national')}
          >
            <Globe size={15} /> Screen 3: National Macro View
          </button>
          <button
            className={`tab-btn ${mainRole === 'regional' ? 'active' : ''}`}
            onClick={() => setMainRole('regional')}
          >
            <Radio size={15} /> Screen 4: State Micro Tactical
          </button>
        </nav>

        <div className="header-right">
          <div 
            className="status-chip" 
            onClick={() => { setMainRole('regional'); setRegionalTab('data'); }} 
            title="Click to inspect Data Feeds"
          >
            <span className="pulse-dot green"></span>
            <span>{adaptiveMode}</span>
          </div>
          <button className="btn-alert" onClick={() => setShowAlert(true)}>
            <AlertTriangle size={15} /> Issue CAP Alert
          </button>
        </div>
      </header>

      {/* Sub-Header Navigation for Regional Telemetry */}
      {mainRole === 'regional' && (
        <div className="sub-header-bar">
          <nav className="sub-tab-nav">
            <button
              className={`sub-tab-btn ${regionalTab === 'map' ? 'active' : ''}`}
              onClick={() => setRegionalTab('map')}
            >
              <Map size={14} /> Live GIS Radar Map
            </button>
            <button
              className={`sub-tab-btn ${regionalTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setRegionalTab('tracking')}
            >
              <Crosshair size={14} /> Storm Telemetry
            </button>
            <button
              className={`sub-tab-btn ${regionalTab === 'xai' ? 'active' : ''}`}
              onClick={() => setRegionalTab('xai')}
            >
              <Cpu size={14} /> Explain Risk (XAI)
            </button>
            <button
              className={`sub-tab-btn ${regionalTab === 'data' ? 'active' : ''}`}
              onClick={() => setRegionalTab('data')}
            >
              <Database size={14} /> Data Feeds & Sensors
            </button>
          </nav>
        </div>
      )}

      {/* Sub-Header Navigation for Public Safety */}
      {mainRole === 'citizen' && (
        <div className="sub-header-bar">
          <nav className="sub-tab-nav">
            <button
              className={`sub-tab-btn ${citizenTab === 'registration' ? 'active' : ''}`}
              onClick={() => setCitizenTab('registration')}
            >
              <Bell size={14} /> Institution / Farmer Alert Signup
            </button>
            <button
              className={`sub-tab-btn ${citizenTab === 'safety' ? 'active' : ''}`}
              onClick={() => setCitizenTab('safety')}
            >
              <BookOpen size={14} /> Safety Guidelines (Do's & Don'ts)
            </button>
          </nav>
        </div>
      )}

      {/* Viewport Area */}
      <main className="viewport" style={{ height: (mainRole === 'regional' || mainRole === 'citizen') ? 'calc(100vh - 104px)' : 'calc(100vh - 62px)' }}>
        {mainRole === 'home' && (
          <LandingHeroView
            onSelectRole={(role) => {
              if (role === 'national') setMainRole('national');
              else if (role === 'regional') { setMainRole('regional'); setRegionalTab('map'); }
              else if (role === 'citizen') { setMainRole('citizen'); setCitizenTab('registration'); }
            }}
          />
        )}
        {mainRole === 'national' && (
          <NationalOverviewView
            onSelectRegion={() => { setMainRole('regional'); setRegionalTab('map'); }}
          />
        )}
        {mainRole === 'regional' && regionalTab === 'map' && (
          <GisMap
            horizon={forecastHorizon}
            setHorizon={setForecastHorizon}
            onSelectCell={(cell) => { setSelectedCell(cell); setRegionalTab('tracking'); }}
          />
        )}
        {mainRole === 'regional' && regionalTab === 'tracking' && (
          <StormTrackerView
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
          />
        )}
        {mainRole === 'regional' && regionalTab === 'xai' && (
          <XaiView selectedCell={selectedCell} />
        )}
        {mainRole === 'regional' && regionalTab === 'data' && (
          <DataLineageView simMode={simMode} onSimChange={handleSimChange} />
        )}
        {mainRole === 'citizen' && citizenTab === 'registration' && (
          <CitizenPortalView />
        )}
        {mainRole === 'citizen' && citizenTab === 'safety' && (
          <SafetyAdvisoriesView />
        )}
      </main>

      {/* Emergency CAP 1.2 Alert Dispatch Modal */}
      {showAlert && <AlertModal onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default App;

