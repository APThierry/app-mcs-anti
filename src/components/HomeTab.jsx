import React, { useState } from 'react';
import { 
  QrCode, Ticket, Share2, Store, Film, Sparkles, Car, 
  ChevronRight, Calendar, ArrowRight, ExternalLink 
} from 'lucide-react';
import { realBannersData, realCinemaMovies } from '../data/realData';

export default function HomeTab({ userData, setActiveTab, onSelectCoupon }) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleBannerAction = (banner) => {
    if (banner.action === 'cinema_redirect' || banner.link?.includes('cineart')) {
      window.open('https://www.cineart.com.br/cinema/cineart-monte-carmo', '_blank');
    } else if (banner.action === 'parking_redirect' || banner.link?.includes('zuldigital')) {
      window.open('https://play.google.com/store/apps/details?id=br.com.zuldigital', '_blank');
    } else if (banner.link) {
      window.open(banner.link, '_blank');
    } else {
      setActiveTab('stores');
    }
  };

  const handleCinemaClick = () => {
    window.open('https://www.cineart.com.br/cinema/cineart-monte-carmo', '_blank');
  };

  const handleParkingClick = () => {
    window.open('https://play.google.com/store/apps/details?id=br.com.zuldigital', '_blank');
  };

  return (
    <div>
      {/* 1. Status Card do Usuário com Visual Glassmórfico */}
      <div className="user-status-card">
        <div className="user-info">
          <h2>Olá, {userData?.name?.split(' ')[0] || 'Thierry'}!</h2>
          <div className="user-status-tag">
            <span>👑 Cliente Nível {userData?.level || 'Bronze'}</span>
          </div>
        </div>

        <div className="user-points">
          <span className="points-value">{userData?.points !== undefined ? userData.points : 100}</span>
          <span className="points-label">Pontos Acumulados</span>
        </div>
      </div>

      {/* 2. Carrossel de Banners Oficiais do Monte Carmo */}
      <div 
        className="promo-hero-card"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%), url(${realBannersData[activeBannerIndex]?.bgImage || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '190px'
        }}
      >
        <span className="promo-tag">{realBannersData[activeBannerIndex]?.tag || 'Monte Carmo'}</span>
        <h3>{realBannersData[activeBannerIndex]?.title || 'Monte Carmo Shopping'}</h3>
        <p>{realBannersData[activeBannerIndex]?.subtitle || 'Confira lojas, cinema e benefícios exclusivos!'}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <button 
            className="btn-pill"
            onClick={() => handleBannerAction(realBannersData[activeBannerIndex])}
          >
            {realBannersData[activeBannerIndex]?.buttonText || 'Saiba Mais →'}
          </button>

          {/* Dots de Paginação */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {realBannersData.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBannerIndex(i)}
                style={{
                  width: activeBannerIndex === i ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: activeBannerIndex === i ? '#10B981' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Seção Acesso Rápido */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '6px' }}>
        <Sparkles size={18} color="#10B981" />
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>Acesso Rápido</span>
      </div>

      {/* 4. Grade de Acesso Rápido (6 Cards Estilizados) */}
      <div className="quick-actions-grid">
        {/* 1. Leia o Cupom Fiscal */}
        <div className="quick-action-card" onClick={() => setActiveTab('scan')}>
          <div className="quick-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <QrCode size={24} />
          </div>
          <span>Leia o cupom<br/>fiscal</span>
        </div>

        {/* 2. Prêmios & Cupons */}
        <div className="quick-action-card" onClick={() => setActiveTab('coupons')}>
          <div className="quick-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Ticket size={24} />
          </div>
          <span>Prêmios &<br/>Cupons</span>
        </div>

        {/* 3. Indique Amigos */}
        <div className="quick-action-card" onClick={() => setActiveTab('profile')}>
          <div className="quick-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
            <Share2 size={24} />
          </div>
          <span>Indique<br/>Amigos</span>
        </div>

        {/* 4. 64 Lojas */}
        <div className="quick-action-card" onClick={() => setActiveTab('stores')}>
          <div className="quick-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
            <Store size={24} />
          </div>
          <span>64 Lojas &<br/>Serviços</span>
        </div>

        {/* 5. Cinema Cineart (Redirecionamento Oficial) */}
        <div className="quick-action-card" onClick={handleCinemaClick}>
          <div className="quick-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
            <Film size={24} />
          </div>
          <span>Cinema<br/>Cineart ↗</span>
        </div>

        {/* 6. Estacionamento Zul+ (Redirecionamento Oficial) */}
        <div className="quick-action-card" onClick={handleParkingClick}>
          <div className="quick-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <Car size={24} />
          </div>
          <span>Estacionamento<br/>Zul+ ↗</span>
        </div>
      </div>
    </div>
  );
}
