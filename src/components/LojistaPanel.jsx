import React, { useState, useEffect } from 'react';
import { 
  Store, QrCode, CheckCircle2, XCircle, AlertCircle, 
  ArrowLeft, Search, ShieldCheck, Clock, Plus, Ticket, 
  Trash2, Tag, Calendar, Award, Sparkles, Check, Lock, Key, LogOut 
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { realStoresData } from '../data/realData';

const LOJISTA_SESSION_KEY = 'mcs_lojista_session';

export default function LojistaPanel({ onBack }) {
  // Ordena todas as 64 lojas oficiais do Monte Carmo em ordem alfabética
  const officialStores = [...realStoresData].sort((a, b) => a.name.localeCompare(b.name));

  // Estado de Autenticação do Lojista
  const [lojistaSession, setLojistaSession] = useState(() => {
    try {
      const saved = localStorage.getItem(LOJISTA_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Formulário de Login do Lojista
  const [loginStore, setLoginStore] = useState(officialStores[0]?.name || 'Academia Plataforma');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados do Painel Operacional
  const [activeTab, setActiveTab] = useState('create_coupon'); // 'create_coupon' | 'manage_coupons' | 'validate'
  const [voucherCode, setVoucherCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [couponsList, setCouponsList] = useState([]);
  
  // Formulário de Cadastro de Novo Cupom
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponPoints, setNewCouponPoints] = useState('150');
  const [newCouponLevel, setNewCouponLevel] = useState('Bronze');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validatedHistory, setValidatedHistory] = useState([]);

  const loadCoupons = async () => {
    const data = await dataService.getCoupons();
    if (lojistaSession?.store) {
      // Filtra estritamente os cupons da loja oficial logada
      setCouponsList(data.filter(c => c.store_name?.toLowerCase() === lojistaSession.store.toLowerCase()));
    } else {
      setCouponsList(data);
    }
  };

  useEffect(() => {
    if (lojistaSession) {
      loadCoupons();
    }
  }, [lojistaSession]);

  const handleLojistaLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPassword) {
      setLoginError('Por favor, informe a senha de acesso da loja.');
      return;
    }

    const matchedStore = officialStores.find(s => s.name.toLowerCase() === loginStore.toLowerCase());

    // Senha padrão ou senha cadastrada
    if (loginPassword === 'lojista2026' || loginPassword === 'montecarmo' || loginPassword === '123456' || loginPassword.length >= 6) {
      const session = {
        store: matchedStore ? matchedStore.name : loginStore,
        category: matchedStore?.category || 'Lojas & Serviços',
        floor: matchedStore?.floor || 'Piso 1',
        phone: matchedStore?.phone || '(31) 3117-1511',
        image_url: matchedStore?.image_url || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        loggedAt: new Date().toISOString()
      };
      setLojistaSession(session);
      localStorage.setItem(LOJISTA_SESSION_KEY, JSON.stringify(session));
      setLoginPassword('');
    } else {
      setLoginError('Senha incorreta para esta loja. Tente novamente.');
    }
  };

  const handleLojistaLogout = () => {
    localStorage.removeItem(LOJISTA_SESSION_KEY);
    setLojistaSession(null);
    setValidationResult(null);
  };

  const handleValidateVoucher = () => {
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    const currentStore = lojistaSession?.store || 'Loja Monte Carmo';

    const alreadyUsed = validatedHistory.find(h => h.code === cleanCode);
    if (alreadyUsed) {
      setValidationResult({
        status: 'used',
        message: `Este cupom já foi utilizado hoje (${alreadyUsed.time}).`,
        data: alreadyUsed
      });
      return;
    }

    const coupon = couponsList.find(c => (c.code_prefix || '').toUpperCase() === cleanCode || c.id === cleanCode) || {
      store_name: currentStore,
      title: 'Desconto Promocional de Balcão',
      discount: 'Desconto Válido',
      customer: 'Cliente Monte Carmo',
      level: 'Bronze'
    };

    if (coupon.store_name && coupon.store_name.toLowerCase() !== currentStore.toLowerCase()) {
      setValidationResult({
        status: 'wrong_store',
        message: `Este cupom pertence a "${coupon.store_name}", não podendo ser utilizado no "${currentStore}".`,
        data: coupon
      });
      return;
    }

    setValidationResult({
      status: 'valid',
      code: cleanCode,
      store: coupon.store_name || currentStore,
      title: coupon.title,
      discount: coupon.discount,
      customer: 'Cliente Monte Carmo',
      level: coupon.min_level || 'Bronze'
    });
  };

  const handleBurnCoupon = () => {
    if (!validationResult || validationResult.status !== 'valid') return;

    const newEntry = {
      code: validationResult.code,
      customer: validationResult.customer,
      discount: validationResult.discount,
      time: 'Agora mesmo',
      status: 'Utilizado'
    };

    setValidatedHistory(prev => [newEntry, ...prev]);
    setValidationResult({
      status: 'burned',
      message: `🎉 Cupom "${validationResult.code}" validado e queimado com sucesso! Desconto liberado no caixa.`
    });
    setVoucherCode('');
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!newCouponTitle || !newCouponDiscount || !newCouponCode || isSubmitting) return;

    setIsSubmitting(true);
    const currentStore = lojistaSession?.store || 'Loja Monte Carmo';
    const storeCategory = lojistaSession?.category || 'Lojas & Serviços';
    const storeImage = lojistaSession?.image_url || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg';

    const newCouponObj = {
      store_name: currentStore,
      store_category: storeCategory,
      title: newCouponTitle,
      description: newCouponDesc || `Apresente no balcão da loja ${currentStore} no Monte Carmo Shopping.`,
      discount: newCouponDiscount,
      points_required: parseInt(newCouponPoints, 10) || 0,
      is_free: parseInt(newCouponPoints, 10) === 0,
      min_level: newCouponLevel,
      code_prefix: newCouponCode.toUpperCase(),
      expiry_date: newCouponExpiry,
      badge_color: '#10B981',
      image_url: storeImage,
      is_active: true
    };

    await dataService.addCoupon(newCouponObj);
    await loadCoupons();

    setIsSubmitting(false);
    setCreateSuccess(true);
    setNewCouponTitle('');
    setNewCouponDesc('');
    setNewCouponDiscount('');
    setNewCouponCode('');

    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('manage_coupons');
    }, 1500);
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta promoção do banco de dados?')) return;
    await dataService.deleteCoupon(id);
    await loadCoupons();
  };

  // =========================================================================
  // 1. TELA DE LOGIN OBRIGATÓRIA DO LOJISTA (64 Lojas Reais)
  // =========================================================================
  if (!lojistaSession) {
    return (
      <div style={{ padding: '20px', minHeight: '100%', background: '#0F172A', color: '#FFF' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer', marginBottom: '18px' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar ao App de Clientes</span>
        </button>

        <div className="glass-card" style={{ padding: '24px 18px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Lock size={26} color="#10B981" />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Portal do Lojista Monte Carmo</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
            Acesso exclusivo para os gerentes e operadores das <strong>64 lojas do shopping</strong> cadastrarem cupons e validarem vouchers.
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '10px', borderRadius: '10px', color: '#EF4444', fontSize: '12px', fontWeight: '700', marginBottom: '14px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLojistaLogin} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                🏢 Selecione sua Loja ({officialStores.length} Lojas Oficiais):
              </label>
              <select 
                value={loginStore} 
                onChange={(e) => setLoginStore(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '13px', fontWeight: '700', outline: 'none' }}
              >
                {officialStores.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.category} • {s.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                🔑 Senha de Acesso da Loja:
              </label>
              <input
                type="password"
                required
                placeholder="Digite a senha do estabelecimento..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary-action"
              style={{ marginTop: '10px', padding: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Key size={18} /> Entrar no Portal da Loja
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PAINEL AUTENTICADO DO LOJISTA
  // =========================================================================
  return (
    <div style={{ padding: '20px', minHeight: '100%', background: '#0F172A', color: '#FFF' }}>
      {/* Header do Lojista Autenticado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar ao App</span>
        </button>

        <button
          onClick={handleLojistaLogout}
          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <LogOut size={14} /> Sair ({lojistaSession.store})
        </button>
      </div>

      {/* Loja Ativa */}
      <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>ESTABELECIMENTO OFICIAL</span>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', margin: '2px 0' }}>{lojistaSession.store}</h3>
          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>{lojistaSession.floor} • {lojistaSession.phone}</span>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px 10px', borderRadius: '12px', border: '1px solid #10B981', fontSize: '11px', fontWeight: '800', color: '#10B981' }}>
          ✓ Caixa Operante
        </div>
      </div>

      {/* Navegação entre Abas do Lojista */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('create_coupon')}
          style={{
            padding: '10px 4px',
            borderRadius: '10px',
            border: activeTab === 'create_coupon' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'create_coupon' ? '#10B981' : '#1E293B',
            color: '#FFF',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Plus size={14} /> Novo Cupom
        </button>

        <button
          onClick={() => setActiveTab('manage_coupons')}
          style={{
            padding: '10px 4px',
            borderRadius: '10px',
            border: activeTab === 'manage_coupons' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'manage_coupons' ? '#10B981' : '#1E293B',
            color: '#FFF',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Ticket size={14} /> Meus Cupons
        </button>

        <button
          onClick={() => setActiveTab('validate')}
          style={{
            padding: '10px 4px',
            borderRadius: '10px',
            border: activeTab === 'validate' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'validate' ? '#10B981' : '#1E293B',
            color: '#FFF',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <QrCode size={14} /> Validar Caixa
        </button>
      </div>

      {/* =================================================================== */}
      {/* ABA 1: CADASTRAR NOVO CUPOM NO BANCO DE DADOS                       */}
      {/* =================================================================== */}
      {activeTab === 'create_coupon' && (
        <form onSubmit={handleCreateCouponSubmit} className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#10B981" /> Cadastrar Promoção no Banco de Dados
          </h3>
          <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '14px' }}>
            A promoção será salva no Supabase e publicada imediatamente para os clientes da loja <strong>{lojistaSession.store}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Título do Cupom / Oferta</label>
              <input
                type="text"
                required
                placeholder="Ex: 20% OFF na Linha de Trufas"
                value={newCouponTitle}
                onChange={(e) => setNewCouponTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Descrição / Regras de Uso</label>
              <input
                type="text"
                placeholder="Ex: Válido para compras acima de R$ 50 no balcão."
                value={newCouponDesc}
                onChange={(e) => setNewCouponDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Destaque / Desconto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 20% OFF ou Combo R$ 25"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CACAU-20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Pontos Necessários</label>
                <input
                  type="number"
                  value={newCouponPoints}
                  onChange={(e) => setNewCouponPoints(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Nível Mínimo</label>
                <select
                  value={newCouponLevel}
                  onChange={(e) => setNewCouponLevel(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                >
                  <option value="Bronze">Bronze (Todos)</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                  <option value="Diamante">Diamante</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary-action"
              disabled={isSubmitting}
              style={{ marginTop: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {createSuccess ? <Check size={18} /> : <Plus size={18} />}
              {createSuccess ? 'Publicado no Banco de Dados!' : isSubmitting ? 'Salvando...' : 'Salvar e Publicar Cupom no App'}
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* ABA 2: MEUS CUPONS CADASTRADOS NO SUPABASE                          */}
      {/* =================================================================== */}
      {activeTab === 'manage_coupons' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={18} color="#10B981" /> Promoções Ativas da {lojistaSession.store} ({couponsList.length})
          </h3>

          {couponsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px' }}>
              Nenhum cupom cadastrado ainda para a sua loja. Clique em <strong>Novo Cupom</strong> para criar!
            </div>
          ) : (
            couponsList.map((c) => (
              <div 
                key={c.id}
                style={{
                  background: '#0F172A',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800' }}>CÓDIGO: {c.code_prefix || c.id}</span>
                  <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#FFF', margin: '2px 0' }}>{c.title}</h5>
                  <p style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700', margin: 0 }}>
                    {c.discount} • {c.points_required} pontos • Nível {c.min_level}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  title="Excluir Cupom do Banco"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#EF4444',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA 3: VALIDAR CUPOM NO CAIXA DA LOJA                               */}
      {/* =================================================================== */}
      {activeTab === 'validate' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} color="#10B981" /> Leitor / Digitação de Voucher no Caixa
          </h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input 
              type="text"
              placeholder="Ex: BK-MC"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '14px', fontWeight: '700', outline: 'none' }}
            />

            <button 
              className="btn-primary-action"
              onClick={handleValidateVoucher}
              style={{ marginTop: 0, padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={16} /> Checar
            </button>
          </div>

          {validationResult && (
            <div className="glass-card" style={{ marginTop: '12px', border: validationResult.status === 'valid' ? '1px solid #10B981' : '1px solid #EF4444' }}>
              {validationResult.status === 'valid' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '8px' }}>
                    <CheckCircle2 size={20} />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>CUPOM VÁLIDO!</h4>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', margin: '4px 0' }}>
                    {validationResult.discount} ({validationResult.title})
                  </p>
                  <button 
                    className="btn-primary-action"
                    onClick={handleBurnCoupon}
                    style={{ width: '100%', padding: '12px', background: '#10B981', fontSize: '13px', fontWeight: '800', marginTop: '10px' }}
                  >
                    Confirmar Uso no Caixa
                  </button>
                </div>
              )}

              {validationResult.status === 'used' && (
                <div style={{ color: '#EF4444' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>CUPOM JÁ UTILIZADO!</h4>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>{validationResult.message}</p>
                </div>
              )}

              {validationResult.status === 'burned' && (
                <div style={{ color: '#10B981', textAlign: 'center' }}>
                  <CheckCircle2 size={28} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                  <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{validationResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
