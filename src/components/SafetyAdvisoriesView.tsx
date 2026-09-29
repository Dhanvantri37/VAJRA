import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Home, Zap, Radio, CloudRain, Trees, AlertCircle } from 'lucide-react';

const SafetyAdvisoriesView: React.FC = () => {
  const dosList = [
    { title: "Seek Indoor Shelter Immediately", desc: "Move inside a sturdy building, house, or hard-topped vehicle as soon as thunder is heard.", icon: Home },
    { title: "Stay Indoors 30 Mins After Thunder", desc: "Remain inside for at least 30 minutes after hearing the last thunderclap.", icon: ShieldAlert },
    { title: "Monitor Real-Time Alerts", desc: "Keep track of live nowcast updates via VAJRA and official emergency broadcast channels.", icon: Radio },
    { title: "Unplug Sensitive Electrical Devices", desc: "Disconnect high-voltage electronics, televisions, and computers before storm arrival.", icon: Zap }
  ];

  const dontsList = [
    { title: "Do NOT Stand Under Isolated Trees", desc: "Trees act as primary natural lightning conductors and can explode or flash discharge.", icon: Trees },
    { title: "Avoid Water Bodies & Indoor Plumbing", desc: "Do not take showers, wash dishes, or stand near open lakes and rivers during lightning strikes.", icon: CloudRain },
    { title: "Avoid Metal Objects & Fences", desc: "Stay away from metal poles, corrugated sheets, fences, and farm machinery.", icon: AlertCircle },
    { title: "Do NOT Lie Flat on Open Ground", desc: "Never lie flat; crouch on the balls of your feet with heels touching and head tucked.", icon: XCircle }
  ];

  return (
    <div className="safety-container">
      <div className="safety-header">
        <div className="safety-title-box">
          <ShieldAlert size={22} className="text-amber" />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Thunderstorm & Lightning Disaster Guidelines</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Official IMD / NDMA Public Safety Rules & Precautionary Measures</p>
          </div>
        </div>
        <div className="emergency-chip">
          <span>NATIONAL HELPLINE: <strong style={{ color: 'var(--accent-cyan)' }}>112 / 1077</strong></span>
        </div>
      </div>

      <div className="safety-grid">
        {/* DO's Column */}
        <div className="safety-card do-card">
          <div className="card-header do-header">
            <CheckCircle2 size={18} className="text-green" />
            <h3>RECOMMENDED SAFETY ACTIONS (DO'S)</h3>
          </div>
          <div className="advisory-list">
            {dosList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="advisory-item">
                  <div className="item-icon do-icon-bg">
                    <Icon size={18} className="text-green" />
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DONT's Column */}
        <div className="safety-card dont-card">
          <div className="card-header dont-header">
            <XCircle size={18} className="text-red" />
            <h3>DANGEROUS ACTIONS TO AVOID (DON'TS)</h3>
          </div>
          <div className="advisory-list">
            {dontsList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="advisory-item">
                  <div className="item-icon dont-icon-bg">
                    <Icon size={18} className="text-red" />
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyAdvisoriesView;
