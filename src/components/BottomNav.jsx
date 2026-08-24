import React from 'react';
import { Home, Ticket, QrCode, Store, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="app-bottom-nav">
      <button 
        className={`nav-item-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={20} className="nav-icon" />
        <span>Início</span>
      </button>

      <button 
        className={`nav-item-btn ${activeTab === 'coupons' ? 'active' : ''}`}
        onClick={() => setActiveTab('coupons')}
      >
        <Ticket size={20} className="nav-icon" />
        <span>Cupons</span>
      </button>

      <div className="nav-item-btn center-scan">
        <button 
          className="scan-fab-button"
          onClick={() => setActiveTab('scan')}
          title="Escanear Nota Fiscal"
        >
          <QrCode size={26} />
        </button>
      </div>

      <button 
        className={`nav-item-btn ${activeTab === 'stores' ? 'active' : ''}`}
        onClick={() => setActiveTab('stores')}
      >
        <Store size={20} className="nav-icon" />
        <span>Lojas</span>
      </button>

      <button 
        className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <User size={20} className="nav-icon" />
        <span>Mais</span>
      </button>
    </nav>
  );
}
