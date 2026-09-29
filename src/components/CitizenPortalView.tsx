import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Bell, ShieldCheck, MapPin, CheckCircle2, 
  AlertTriangle, PhoneCall, Navigation, ToggleLeft, ToggleRight, Radio 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CitizenPortalView: React.FC = () => {
  const [registered, setRegistered] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 16.7050, lng: 74.2433 }); // Kolhapur/Sangli default

  const [formData, setFormData] = useState({
    name: 'Sangli Model Public High School',
    phone: '+91 98765 43210',
    type: 'school',
    state: 'Maharashtra',
    district: 'Kolhapur / Sangli Rural',
    block: 'Shirol / Miraj Tehsil',
    orangeAlertsOnly: true,
    smsEnabled: true,
    audioSiren: false
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet map thumbnail for Screen 2 Map Visualizer
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
        center: [coords.lat, coords.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);

      const customPin = L.divIcon({
        className: 'custom-location-pin',
        html: `<div style="
          width: 18px; 
          height: 18px; 
          background: #0284c7; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 14px #0284c7;
          animation: pulse 1.5s infinite;
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customPin }).addTo(map);
      marker.bindPopup(`<b>${formData.name}</b><br>${formData.block}, ${formData.district}`).openPopup();

      markerRef.current = marker;
      leafletInstance.current = map;
    } catch (err) {
      console.warn("Leaflet thumbnail init info:", err);
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [coords]);

  const handleDetectLocation = () => {
    setDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(newCoords);
          setDetecting(false);
        },
        () => {
          // Fallback location simulated
          setTimeout(() => {
            setCoords({ lat: 16.7050, lng: 74.2433 });
            setDetecting(false);
          }, 800);
        }
      );
    } else {
      setTimeout(() => {
        setCoords({ lat: 16.7050, lng: 74.2433 });
        setDetecting(false);
      }, 800);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="safety-container">
      {/* Title Header */}
      <div className="safety-header">
        <div className="safety-title-box">
          <UserCheck size={24} className="text-cyan" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Register Your Location for Automated VAJRA Alerts</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              High-Trust Early-Warning System — Automated SMS & WhatsApp Warning Payload Delivery
            </p>
          </div>
        </div>
        <div className="emergency-chip">
          <span>PUBLIC SERVICE: <strong style={{ color: 'var(--accent-blue)' }}>FREE 30-MIN EARLY SMS WARNINGS</strong></span>
        </div>
      </div>

      {/* Screen 2 2-Column Registration & Map Visualizer Layout */}
      <div className="screen-2col" style={{ padding: 0, height: 'calc(100% - 75px)', gridTemplateColumns: '460px 1fr' }}>
        
        {/* Left Form Panel */}
        <div className="card-panel" style={{ height: '100%', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell className="text-amber" size={16} /> User Registration & Location Setup
          </h3>

          {!registered ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name / Institution Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="radar-dropdown" 
                  style={{ width: '100%', padding: '9px 12px', marginTop: '4px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contact Number (SMS / WhatsApp)</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="radar-dropdown" 
                  style={{ width: '100%', padding: '9px 12px', marginTop: '4px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="radar-dropdown" 
                  style={{ width: '100%', padding: '9px 12px', marginTop: '4px' }}
                >
                  <option value="school">School Administrator / Educational Institute</option>
                  <option value="farmer">Farmer / Agricultural Field Worker</option>
                  <option value="citizen">Individual Citizen / Household</option>
                  <option value="responder">Emergency Responder / NDRF Official</option>
                </select>
              </div>

              {/* Geolocation Section */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>LOCATION GEOFENCE</span>
                  <button 
                    type="button" 
                    onClick={handleDetectLocation}
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid #bae6fd',
                      color: 'var(--primary-dark)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Navigation size={12} /> {detecting ? 'Detecting GPS...' : 'Detect My Live Location'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>STATE</label>
                    <select 
                      value={formData.state} 
                      onChange={e => setFormData({...formData, state: e.target.value})}
                      className="radar-dropdown" 
                      style={{ width: '100%', padding: '6px 10px', marginTop: '2px', fontSize: '12px' }}
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Delhi-NCR">Delhi-NCR</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>DISTRICT</label>
                    <select 
                      value={formData.district} 
                      onChange={e => setFormData({...formData, district: e.target.value})}
                      className="radar-dropdown" 
                      style={{ width: '100%', padding: '6px 10px', marginTop: '2px', fontSize: '12px' }}
                    >
                      <option value="Kolhapur / Sangli Rural">Kolhapur / Sangli Rural</option>
                      <option value="Nagpur District">Nagpur District</option>
                      <option value="Pune Rural">Pune Rural</option>
                      <option value="South 24 Parganas">South 24 Parganas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Alert Preferences Toggle Switches */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>ALERT PREFERENCES</span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Notify me for Orange Alerts & above</span>
                  <div onClick={() => setFormData({...formData, orangeAlertsOnly: !formData.orangeAlertsOnly})} style={{ cursor: 'pointer' }}>
                    {formData.orangeAlertsOnly ? <ToggleRight size={26} className="text-cyan" /> : <ToggleLeft size={26} className="text-muted" />}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Receive automated SMS & WhatsApp alerts</span>
                  <div onClick={() => setFormData({...formData, smsEnabled: !formData.smsEnabled})} style={{ cursor: 'pointer' }}>
                    {formData.smsEnabled ? <ToggleRight size={26} className="text-green" /> : <ToggleLeft size={26} className="text-muted" />}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-alert" style={{ marginTop: '4px', background: 'var(--primary-blue)', justifyContent: 'center', padding: '11px' }}>
                <ShieldCheck size={16} /> Confirm Location & Activate Early Warning Alerts
              </button>
            </form>
          ) : (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '20px', color: '#047857' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '15px' }}>
                <CheckCircle2 size={22} /> Location Registration Active!
              </div>
              <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: 1.5 }}>
                Automated VAJRA Lightning SMS alerts are active for <strong>{formData.name}</strong> at coordinates [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]. You will receive instant SMS warnings 30 minutes before severe convective strikes reach your area.
              </p>
              <button 
                onClick={() => setRegistered(false)}
                style={{ marginTop: '14px', background: '#ffffff', border: '1px solid #a7f3d0', color: '#047857', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                Edit Location Registration
              </button>
            </div>
          )}
        </div>

        {/* Right Map Visualizer Panel */}
        <div className="card-panel" style={{ height: '100%', position: 'relative', overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 500, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} className="text-cyan" /> Registered Facility Geo-Pin: [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]
          </div>

          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          <div style={{ position: 'absolute', bottom: '14px', right: '14px', zIndex: 500, background: '#ffffff', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>ACTIVE COVERAGE ZONE</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} /> DWR Solapur & DWR Mumbai Grid Sync
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CitizenPortalView;

