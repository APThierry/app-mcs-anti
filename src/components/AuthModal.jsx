import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, CreditCard, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, setUserData }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Thierry Anthony Sousa Silva',
    email: 'thierry.silva@email.com',
    phone: '(31) 98765-4321',
    password: '••••••••'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      name: formData.name || 'Thierry Anthony Sousa Silva',
      email: formData.email || 'thierry.silva@email.com',
      phone: formData.phone || '(31) 98765-4321'
    }));

    alert(isRegister ? 'Cadastro realizado com sucesso! Seja bem-vindo ao Clube MonteCarmo Shopping.' : 'Login realizado com sucesso!');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar" />

        <div className="modal-header-row">
          <div className="brand-logo">
            <div className="logo-gem">M</div>
            <div>
              <h3 className="brand-text-title">MonteCarmo</h3>
              <span className="brand-text-sub">CLUBE DE BENEFÍCIOS</span>
            </div>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ textAlign: 'center', margin: '14px 0 20px 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
            {isRegister ? 'Criar Conta no App' : 'Entrar na sua Conta'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {isRegister ? 'Cadastre-se para ganhar pontos em todas as suas compras no shopping!' : 'Acesse seus prêmios, notas enviadas e cupons de desconto.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Nome Completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              E-mail ou CPF
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                WhatsApp / Celular
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Senha de Acesso
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-action" style={{ marginTop: '8px' }}>
            {isRegister ? 'Concluir Cadastro' : 'Entrar no aplicativo'} <ArrowRight size={16} />
          </button>

          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}
          >
            {isRegister ? 'Já possui conta? Clique para Fazer Login' : 'Ainda não tem conta? Clique para Cadastrar-se'}
          </button>
        </form>
      </div>
    </div>
  );
}
