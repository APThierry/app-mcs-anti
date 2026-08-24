import React, { useState } from 'react';
import { X, QrCode, Check, Copy, Clock, MapPin, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { notificationService } from '../services/notificationService';

export default function CouponModal({ coupon, onClose, userData, setUserData }) {
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  const storeName = coupon.store_name || coupon.storeName || 'Monte Carmo Shopping';
  const pointsRequired = coupon.points_required !== undefined ? coupon.points_required : (coupon.pointsRequired || 0);
  const isFree = coupon.is_free || pointsRequired === 0;
  const couponCode = coupon.code_prefix || coupon.code || 'MC-PROMO';
  const expiryDate = coupon.expiry_date || coupon.expiryDate || '2026-12-31';
  const badgeColor = coupon.badge_color || coupon.badgeColor || '#10B981';

  const handleConfirmRedeem = () => {
    if (!isFree && (userData?.points || 0) < pointsRequired) {
      alert(`Você precisa de ${pointsRequired} pontos para resgatar este cupom. Seu saldo atual é de ${userData?.points || 0} pts.`);
      return;
    }

    if (!isFree && setUserData) {
      setUserData(prev => ({
        ...prev,
        points: (prev?.points || 0) - pointsRequired
      }));
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    notificationService.notifyCouponRedeemed(storeName, coupon.discount);
    setIsRedeemed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar" />

        <div className="modal-header-row">
          <span style={{ fontSize: '12px', fontWeight: '800', color: badgeColor, background: `${badgeColor}20`, padding: '4px 10px', borderRadius: '12px' }}>
            {coupon.discount}
          </span>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--brand-primary)', fontWeight: '700' }}>
            {storeName}
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0 8px 0' }}>
            {coupon.title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {coupon.description}
          </p>
        </div>

        {!isRedeemed ? (
          <div style={{ marginTop: '20px' }}>
            <div className="glass-card" style={{ marginBottom: '16px', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Custo do Resgate</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand-gold)' }}>
                  {isFree ? 'GRÁTIS' : `${pointsRequired} pontos`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Seu Saldo Atual</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {(userData?.points || 0).toLocaleString('pt-BR')} pts
                </div>
              </div>
            </div>

            <button className="btn-primary-action" onClick={handleConfirmRedeem}>
              <Ticket size={18} /> Confirmar Resgate
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', marginBottom: '10px' }}>
              <Check size={16} /> Cupom Ativado com Sucesso!
            </div>

            {/* Simulated QR Code Box */}
            <div className="qr-code-box">
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>
                Apresente este QR Code no caixa da loja:
              </div>
              <div className="qr-code-placeholder" />
              <div className="coupon-code-text">{couponCode}</div>
            </div>

            <button className="btn-secondary-action" onClick={handleCopyCode} style={{ marginBottom: '12px' }}>
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              {copied ? 'Código Copiado!' : 'Copiar Código de Validação'}
            </button>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Clock size={12} /> Válido até {expiryDate} nas lojas do MonteCarmo
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
