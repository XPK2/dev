import React from 'react';
import { ClipboardList, Star } from 'lucide-react';

const FamilyRules = () => {
  const rules = [
    "Never go to sleep angry.",
    "Always say 'I love you' before leaving.",
    "If one cooks, the other cleans the dishes.",
    "Surprise each other at least once a month.",
    "Honesty is our best policy, always.",
    "No phones during our special dinner dates."
  ];

  return (
    <div className="fade-in pb-20">
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <ClipboardList color="var(--primary)" size={32} className="animate-float" />
        <h2 style={{ fontSize: '1.5rem', marginTop: '12px' }}>Family Rules</h2>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
          Promises we keep for a happy home.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '8px' }}>
        <div className="milestone-list">
          {rules.map((rule, index) => (
            <div key={index} className="milestone-item" style={{ borderBottom: index !== rules.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
              <div className="milestone-date" style={{ background: 'var(--primary)', minWidth: '40px' }}>{index + 1}</div>
              <div className="milestone-info" style={{ flex: 1 }}>
                <p style={{ fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '500' }}>{rule}</p>
              </div>
              <Star color="var(--primary-light)" size={16} style={{ marginLeft: 'auto', minWidth: '16px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyRules;
