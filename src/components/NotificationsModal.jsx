import React from 'react';
import { X, Bell, CheckCircle2, Gift, Users } from 'lucide-react';
import { notificationsData } from '../data/mockData';

export default function NotificationsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar" />

        <div className="modal-header-row">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#10B981" /> Central de Notificações
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {notificationsData.map((n) => (
            <div 
              key={n.id} 
              className="glass-card" 
              style={{ 
                padding: '12px 14px', 
                background: n.read ? 'var(--bg-card)' : 'rgba(16, 185, 129, 0.1)',
                borderColor: n.read ? 'var(--border-glass)' : 'rgba(16, 185, 129, 0.4)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--brand-primary)' }}>
                  {n.id === 1 && <CheckCircle2 size={18} color="#10B981" />}
                  {n.id === 2 && <Gift size={18} color="#F59E0B" />}
                  {n.id === 3 && <Users size={18} color="#6366F1" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{n.title}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
