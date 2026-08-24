import React from 'react';
import { Bell, Moon, Sun, ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';

export default function Header({ 
  theme, 
  toggleTheme, 
  onOpenNotifications, 
  unreadCount, 
  userData, 
  onBack, 
  currentSubView,
  onOpenGeminiChat
}) {
  return (
    <header className="app-header">
      {currentSubView ? (
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-primary)',
            fontSize: '14px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      ) : (
        <div className="brand-logo">
          <img 
            src="/imag/logo.png" 
            alt="MonteCarmo Shopping" 
            style={{ height: '36px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="header-actions">
        {/* Botão Assistente IA Gemini */}
        <button 
          className="icon-btn" 
          onClick={onOpenGeminiChat} 
          title="Monte Carmo IA (Gemini)"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981' }}
        >
          <Sparkles size={16} color="#10B981" />
        </button>

        {/* WhatsApp Oficial do Shopping (31) 3117-1511 */}
        <a 
          href="https://wa.me/553131171511?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Monte%20Carmo%20Shopping!"
          target="_blank"
          rel="noreferrer"
          className="icon-btn"
          title="WhatsApp Oficial (31) 3117-1511"
          style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)', border: '1px solid #25D366' }}
        >
          <MessageCircle size={16} color="#25D366" />
        </a>

        <button className="icon-btn" onClick={toggleTheme} title="Alternar Tema">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-btn" onClick={onOpenNotifications} title="Notificações">
          <Bell size={18} />
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        {userData && (
          <div className="user-status-tag" style={{ margin: 0, padding: '4px 8px', fontSize: '11px' }}>
            <span>👑</span>
            <span>{userData.points || 0} pts</span>
          </div>
        )}
      </div>
    </header>
  );
}
