import React, { useState } from 'react';
import { 
  User, Key, HelpCircle, FileText, Bell, QrCode, Receipt, 
  MessageCircle, LogOut, Copy, Share2, Award, ChevronRight, Check, Sparkles, Phone
} from 'lucide-react';

export default function ProfileTab({ userData, setUserData, setActiveTab, onOpenAuthModal, onNavigateSubView }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(userData?.referralLink || 'https://montecarmoshopping.com.br');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MonteCarmo Shopping',
        text: 'Cadastre-se no App do MonteCarmo Shopping com meu código e ganhe prêmios!',
        url: userData?.referralLink || 'https://montecarmoshopping.com.br'
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=Baixe%20o%20App%20do%20MonteCarmo%20Shopping%20e%20ganhe%20pr%C3%AAmios!%20Acesse:%20${encodeURIComponent(userData?.referralLink || '')}`);
    }
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '24px 16px', marginBottom: '20px' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 12px auto', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#FFF' }}>
          👑
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2px' }}>
          {userData?.name || 'Cliente Monte Carmo'}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {userData?.email} • {userData?.phone || '(31) 98765-4321'}
        </p>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-emerald)', borderRadius: '16px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Nível Atual</span>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--brand-gold)' }}>
              👑 Cliente {userData?.level || 'Bronze'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Saldo de Pontos</span>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary)' }}>
              {userData?.points || 0} pts
            </div>
          </div>
        </div>
      </div>

      {/* Referral Card (Indique Amigos e Ganhe) */}
      <div className="glass-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%)', borderColor: '#10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Award size={28} color="#F59E0B" />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>Indique amigos e ganhe!</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Compartilhe seu link. Quando seus amigos se cadastram, você ganha +100 pts!
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', wordBreak: 'break-all', color: 'var(--brand-primary)', fontWeight: '700', marginBottom: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
          {userData?.referralLink}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-secondary-action" onClick={handleCopyLink} style={{ marginTop: '0' }}>
            {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </button>

          <button className="btn-primary-action" onClick={handleShare}>
            <Share2 size={16} /> Compartilhar
          </button>
        </div>
      </div>

      {/* Profile Navigation List */}
      <div className="glass-card" style={{ padding: '6px 12px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
          onClick={() => onNavigateSubView && onNavigateSubView('profile_dados')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' }}>
            <User size={18} color="#10B981" /> Meus Dados Cadastrais
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
          onClick={() => onNavigateSubView && onNavigateSubView('profile_regras')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' }}>
            <HelpCircle size={18} color="#6366F1" /> Como Funciona o Clube
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        {/* WhatsApp Oficial do Shopping */}
        <a 
          href="https://wa.me/553131171511?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Monte%20Carmo%20Shopping!"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--border-glass)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' }}>
            <MessageCircle size={18} color="#25D366" /> WhatsApp Oficial: (31) 3117-1511
          </div>
          <span style={{ fontSize: '11px', color: '#25D366', fontWeight: '800' }}>ABRIR</span>
        </a>

        {/* Telefone Fixo Geral */}
        <a 
          href="tel:3131171511"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--border-glass)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' }}>
            <Phone size={18} color="#06B6D4" /> Telefone Geral: (31) 3117-1511
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </a>

        {/* Acesso do Lojista (Login & Cadastro de Cupons) */}
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
          onClick={() => onNavigateSubView && onNavigateSubView('lojista_panel')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
            <Store size={18} color="#10B981" /> 🔐 Portal do Lojista (Cupons & Caixa)
          </div>
          <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>ENTRAR</span>
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', cursor: 'pointer' }}
          onClick={onOpenAuthModal}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700', color: '#EF4444' }}>
            <LogOut size={18} /> Sair da Conta
          </div>
          <ChevronRight size={18} color="#EF4444" />
        </div>
      </div>
    </div>
  );
}
