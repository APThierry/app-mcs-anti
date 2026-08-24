import React, { useState } from 'react';
import { Ticket, Sparkles, Tag, Clock } from 'lucide-react';
import { couponsData } from '../data/mockData';

export default function CouponsTab({ userData, onSelectCoupon }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Gastronomia', 'Moda & Vestuário', 'Jóias & Acessórios', 'Lazer & Entretenimento'];

  const filteredCoupons = selectedCategory === 'Todos'
    ? couponsData
    : couponsData.filter(c => c.category === selectedCategory);

  return (
    <div>
      {/* Loyalty Status Bar */}
      <div className="glass-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Seus Pontos de Fidelidade</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--brand-gold)' }}>
              {userData.points.toLocaleString('pt-BR')} pts
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '12px', color: 'var(--brand-gold)', fontWeight: '700' }}>
              👑 Nível {userData.level}
            </span>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${(userData.points / userData.nextLevelPoints) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '3px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Progresso para {userData.nextLevelName}</span>
          <span>{userData.points} / {userData.nextLevelPoints} pts</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="filter-pills-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Coupons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '120px', backgroundImage: `url(${coupon.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', left: '10px', background: coupon.badgeColor, color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>
                {coupon.discount}
              </span>
              {coupon.isFree && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ec4899', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '10px' }}>
                  GRÁTIS Ouro
                </span>
              )}
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: '700' }}>
                  {coupon.storeName}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Validade: {coupon.expiryDate}
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                {coupon.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                {coupon.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed var(--border-glass)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Custo em Pontos</span>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-gold)' }}>
                    {coupon.isFree ? '0 pts (Benefício Exclusivo)' : `${coupon.pointsRequired} pts`}
                  </div>
                </div>

                <button 
                  className="btn-primary-action" 
                  style={{ width: 'auto', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => onSelectCoupon(coupon)}
                >
                  <Ticket size={16} /> Resgatar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
