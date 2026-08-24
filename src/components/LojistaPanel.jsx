import React, { useState, useEffect } from 'react';
import { 
  Store, QrCode, CheckCircle2, XCircle, AlertCircle, 
  ArrowLeft, Search, ShieldCheck, Clock, Plus, Ticket, 
  Trash2, Tag, Calendar, Award, Sparkles, Check 
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { realStoresData } from '../data/realData';

export default function LojistaPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('validate'); // 'validate' | 'create_coupon' | 'manage_coupons'
  const [selectedStore, setSelectedStore] = useState('Burger King');
  const [voucherCode, setVoucherCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  
  // Lista de cupons cadastrados pelos lojistas no Supabase
  const [couponsList, setCouponsList] = useState([]);
  
  // Formulário de Cadastro de Novo Cupom pelo Lojista
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponPoints, setNewCouponPoints] = useState('150');
  const [newCouponLevel, setNewCouponLevel] = useState('Bronze');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validatedHistory, setValidatedHistory] = useState([
    {
      code: 'BK-MC25',
      customer: 'Thierry Silva',
      discount: 'Combo 2 Whopper Jr. por R$ 25',
      time: 'Hoje às 14:32',
      status: 'Utilizado'
    }
  ]);

  const loadCoupons = async () => {
    const data = await dataService.getCoupons();
    setCouponsList(data);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleValidateVoucher = () => {
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    // Checa histórico de queima
    const alreadyUsed = validatedHistory.find(h => h.code === cleanCode);
    if (alreadyUsed) {
      setValidationResult({
        status: 'used',
        message: `Este cupom já foi utilizado hoje (${alreadyUsed.time}).`,
        data: alreadyUsed
      });
      return;
    }

    // Busca cupom no catálogo cadastrado pelos lojistas
    const coupon = couponsList.find(c => (c.code_prefix || '').toUpperCase() === cleanCode || c.id === cleanCode) || {
      store_name: selectedStore,
      title: 'Desconto Promocional de Balcão',
      discount: 'Desconto Válido',
      customer: 'Cliente Monte Carmo',
      level: 'Bronze'
    };

    if (coupon.store_name && coupon.store_name.toLowerCase() !== selectedStore.toLowerCase()) {
      setValidationResult({
        status: 'wrong_store',
        message: `Este cupom pertence a "${coupon.store_name}", não podendo ser utilizado no "${selectedStore}".`,
        data: coupon
      });
      return;
    }

    setValidationResult({
      status: 'valid',
      code: cleanCode,
      store: coupon.store_name || selectedStore,
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

    const newCouponObj = {
      store_name: selectedStore,
      store_category: 'Alimentação / Lazer',
      title: newCouponTitle,
      description: newCouponDesc || `Apresente no balcão da loja ${selectedStore} no Monte Carmo Shopping.`,
      discount: newCouponDiscount,
      points_required: parseInt(newCouponPoints, 10) || 0,
      is_free: parseInt(newCouponPoints, 10) === 0,
      min_level: newCouponLevel,
      code_prefix: newCouponCode.toUpperCase(),
      expiry_date: newCouponExpiry,
      badge_color: '#10B981',
      image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
      is_active: true
    };

    // Insere diretamente no Banco de Dados Supabase
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

  return (
    <div style={{ padding: '20px', minHeight: '100%', background: '#0F172A', color: '#FFF' }}>
      {/* Header do Lojista */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar ao App</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #10B981' }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#10B981' }}>PORTAL DO LOJISTA</span>
        </div>
      </div>

      {/* Seleção do Caixa da Loja */}
      <div className="glass-card" style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
          🏢 Selecione o Balcão / Loja que está operando:
        </label>
        <select 
          value={selectedStore} 
          onChange={(e) => {
            setSelectedStore(e.target.value);
            setValidationResult(null);
          }}
          style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '14px', fontWeight: '700', outline: 'none' }}
        >
          {['Burger King', 'Cacau Show', 'BoliXe Monte Carmo', 'Cineart Monte Carmo', 'Lojas Renner', 'Artesanato do Japa', 'Academia Plataforma'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Navegação entre Abas do Lojista */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
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
          <Ticket size={14} /> Banco de Cupons
        </button>
      </div>

      {/* =================================================================== */}
      {/* ABA 1: VALIDAR CUPOM NO BALCÃO DO CAIXA                             */}
      {/* =================================================================== */}
      {activeTab === 'validate' && (
        <>
          <div className="glass-card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="#10B981" /> Leitor / Digitação de Voucher
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text"
                placeholder="Ex: BK-MC25"
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

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', alignSelf: 'center' }}>Testar:</span>
              {['BK-MC', 'CACAU-MC', 'BOLIXE-MC', 'CINEART-MC'].map(code => (
                <button 
                  key={code}
                  onClick={() => {
                    setVoucherCode(code);
                    if (code === 'BK-MC') setSelectedStore('Burger King');
                    if (code === 'CACAU-MC') setSelectedStore('Cacau Show');
                    if (code === 'BOLIXE-MC') setSelectedStore('BoliXe Monte Carmo');
                    if (code === 'CINEART-MC') setSelectedStore('Cineart Monte Carmo');
                  }}
                  style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#10B981', fontWeight: '700', cursor: 'pointer' }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado da Validação */}
          {validationResult && (
            <div className="glass-card" style={{ marginBottom: '16px', border: validationResult.status === 'valid' ? '1px solid #10B981' : '1px solid #EF4444' }}>
              {validationResult.status === 'valid' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '8px' }}>
                    <CheckCircle2 size={20} />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>CUPOM VÁLIDO E ATIVO!</h4>
                  </div>

                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', marginBottom: '4px' }}>
                      {validationResult.discount} ({validationResult.title})
                    </p>
                    <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                      Loja: <strong>{validationResult.store}</strong> • Nível: <strong>👑 {validationResult.level}</strong>
                    </p>
                  </div>

                  <button 
                    className="btn-primary-action"
                    onClick={handleBurnCoupon}
                    style={{ width: '100%', padding: '12px', background: '#10B981', fontSize: '13px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <CheckCircle2 size={18} /> Confirmar Queima / Uso do Cupom no Caixa
                  </button>
                </div>
              )}

              {validationResult.status === 'used' && (
                <div style={{ color: '#EF4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <XCircle size={20} />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>CUPOM JÁ UTILIZADO!</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>{validationResult.message}</p>
                </div>
              )}

              {validationResult.status === 'wrong_store' && (
                <div style={{ color: '#F59E0B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <AlertCircle size={20} />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>LOJA INCORRETA</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>{validationResult.message}</p>
                </div>
              )}

              {validationResult.status === 'burned' && (
                <div style={{ color: '#10B981', textAlign: 'center', padding: '8px 0' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 6px auto', display: 'block' }} />
                  <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{validationResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Histórico do Dia */}
          <div className="glass-card">
            <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#10B981" /> Cupons Atendidos Hoje no {selectedStore} ({validatedHistory.length})
            </h4>

            {validatedHistory.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B' }}>{item.code}</span>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{item.customer} • {item.discount}</p>
                </div>
                <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>
                  {item.status} ({item.time})
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* ABA 2: CADASTRAR NOVO CUPOM NO BANCO DE DADOS                       */}
      {/* =================================================================== */}
      {activeTab === 'create_coupon' && (
        <form onSubmit={handleCreateCouponSubmit} className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#10B981" /> Cadastrar Promoção no Banco de Dados
          </h3>
          <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '14px' }}>
            Esta promoção será salva no Supabase e publicada imediatamente no app dos clientes para o <strong>{selectedStore}</strong>.
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
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Prefixo / Código do Cupom</label>
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
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>Nível Mínimo do Cliente</label>
                <select
                  value={newCouponLevel}
                  onChange={(e) => setNewCouponLevel(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                >
                  <option value="Bronze">Bronze (Todos os clientes)</option>
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
      {/* ABA 3: BANCO DE CUPONS CADASTRADOS NO SUPABASE                     */}
      {/* =================================================================== */}
      {activeTab === 'manage_coupons' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={18} color="#10B981" /> Cupons no Banco de Dados ({couponsList.length})
          </h3>

          {couponsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px' }}>
              Nenhum cupom cadastrado ainda no banco. Clique em <strong>Novo Cupom</strong> para criar o primeiro!
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
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800' }}>{c.store_name} • CÓDIGO: {c.code_prefix || c.id}</span>
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
    </div>
  );
}
