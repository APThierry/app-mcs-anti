import React, { useState, useEffect } from 'react';
import { 
  QrCode, Ticket, Store, Share2, Car, Film, 
  ChevronRight, Calendar, Sparkles, Trophy, Gift
} from 'lucide-react';
import { bannersData, couponsData, eventsData } from '../data/mockData';

export default function HomeTab({ userData, setActiveTab, onSelectCoupon }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannersData.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* User Greeting Header Card */}
      <div className="user-greeting-card">
        <div>
          <h2 className="user-name">Olá, {userData.name.split(' ')[0]}!</h2>
          <div className="user-status-tag">
            <span>{userData.levelBadge}</span>
            <span>Cliente Nível {userData.level}</span>
          </div>
        </div>
        <div className="user-points-badge">
          <div className="points-num">{userData.points.toLocaleString('pt-BR')}</div>
          <div className="points-label">Pontos Acumulados</div>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="banner-carousel">
        {bannersData.map((banner, idx) => (
          <div 
            key={banner.id}
            className="banner-slide"
            style={{ 
              display: idx === currentSlide ? 'flex' : 'none',
              backgroundImage: `url(${banner.image})`
            }}
          >
            <div className="banner-content">
              <span className="banner-tag">{banner.tag}</span>
              <h3 className="banner-title">{banner.title}</h3>
              <p className="banner-sub">{banner.subtitle}</p>
              <button 
                className="banner-action-btn"
                onClick={() => {
                  if (banner.id === 1) setActiveTab('home');
                  else if (banner.id === 2) setActiveTab('scan');
                  else setActiveTab('coupons');
                }}
              >
                {banner.action} →
              </button>
            </div>
          </div>
        ))}
        <div className="carousel-indicators">
          {bannersData.map((_, idx) => (
            <div 
              key={idx}
              className={`indicator-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="section-title-row">
        <h3 className="section-title">
          <Sparkles size={18} color="#10B981" />
          Acesso Rápido
        </h3>
      </div>

      <div className="quick-actions-grid">
        <div className="quick-action-card" onClick={() => setActiveTab('scan')}>
          <div className="action-icon-wrapper">
            <QrCode size={22} />
          </div>
          <span className="action-label">Leia o cupom fiscal</span>
        </div>

        <div className="quick-action-card" onClick={() => setActiveTab('coupons')}>
          <div className="action-icon-wrapper">
            <Gift size={22} />
          </div>
          <span className="action-label">Prêmios & Cupons</span>
        </div>

        <div className="quick-action-card" onClick={() => setActiveTab('profile')}>
          <div className="action-icon-wrapper">
            <Share2 size={22} />
          </div>
          <span className="action-label">Indique Amigos</span>
        </div>

        <div className="quick-action-card" onClick={() => setActiveTab('stores')}>
          <div className="action-icon-wrapper">
            <Store size={22} />
          </div>
          <span className="action-label">Guia de Lojas</span>
        </div>

        <div className="quick-action-card" onClick={() => alert('Estacionamento MonteCarmo: Pague seu ticket via App com 10% de desconto no Nível Ouro!')}>
          <div className="action-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
            <Car size={22} />
          </div>
          <span className="action-label">Estacionamento</span>
        </div>

        <div className="quick-action-card" onClick={() => setActiveTab('stores')}>
          <div className="action-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
            <Film size={22} />
          </div>
          <span className="action-label">Cinema</span>
        </div>
      </div>

      {/* Offers & Rewards Slider */}
      <div className="section-title-row">
        <h3 className="section-title">
          <Trophy size={18} color="#F59E0B" />
          Promoções & Prêmios em Destaque
        </h3>
        <span className="section-link" onClick={() => setActiveTab('coupons')}>
          Ver Todos <ChevronRight size={14} style={{ display: 'inline' }} />
        </span>
      </div>

      <div className="coupons-scroll-container">
        {couponsData.slice(0, 4).map((coupon) => (
          <div key={coupon.id} className="coupon-mini-card">
            <div className="coupon-card-img" style={{ backgroundImage: `url(${coupon.image})` }}>
              <span className="coupon-badge" style={{ background: coupon.badgeColor }}>
                {coupon.discount}
              </span>
            </div>
            <div className="coupon-mini-body">
              <div>
                <span className="coupon-store-name">{coupon.storeName}</span>
                <h4 className="coupon-title">{coupon.title}</h4>
              </div>
              <div className="coupon-footer-row">
                <span className="coupon-points">
                  {coupon.isFree ? 'GRÁTIS' : `${coupon.pointsRequired} pts`}
                </span>
                <button className="claim-btn-sm" onClick={() => onSelectCoupon(coupon)}>
                  Resgatar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events List */}
      <div className="section-title-row">
        <h3 className="section-title">
          <Calendar size={18} color="#10B981" />
          Agenda de Eventos do Shopping
        </h3>
      </div>

      <div className="events-vertical-list">
        {eventsData.map((ev) => (
          <div key={ev.id} className="event-card">
            <div className="event-img" style={{ backgroundImage: `url(${ev.image})` }} />
            <div className="event-details">
              <span className="event-tag">{ev.category}</span>
              <h4 className="event-name">{ev.title}</h4>
              <div className="event-meta">
                <span>📅 {ev.date}</span>
                <span>•</span>
                <span>📍 {ev.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
