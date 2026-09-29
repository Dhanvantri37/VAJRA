import React from 'react';
import { AlertTriangle, Megaphone, X } from 'lucide-react';

interface AlertModalProps {
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ onClose }) => {
  return (
    <div className="modal-bg">
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 800, fontSize: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> HIGH SEVERITY SEVERE NOWCAST ALERT
          </span>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge-red">SEVERE THUNDERSTORM + LIGHTNING</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#9ca3af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Target: Kolhapur Rural</span>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
          <div><strong>Expected Arrival:</strong> 25 - 40 minutes (21:15 IST)</div>
          <div><strong>Peak Risk Probability:</strong> <span className="text-danger font-bold">92%</span> (Confidence: 94%)</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }} onClick={onClose}>Close</button>
          <button className="btn-alert" onClick={() => alert('CAP (Common Alerting Protocol) JSON broadcast triggered to District Authorities.')}>
            <Megaphone size={14} /> Broadcast CAP Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
