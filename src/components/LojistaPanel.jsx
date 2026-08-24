import React, { useState } from 'react';
import { 
  Store, QrCode, CheckCircle2, XCircle, AlertCircle, 
  ArrowLeft, Search, ShieldCheck, Clock, User, Award, RefreshCw 
} from 'lucide-react';
import { realStoresData } from '../data/realData';

export default function LojistaPanel({ onBack }) {
  const [selectedStore, setSelectedStore] = useState('Burger King');
  const [voucherCode, setVoucherCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validatedHistory, setValidatedHistory] = useState([
    {
      code: 'BK-MC25',
      customer: 'Thierry Silva',
      discount: 'Combo 2 Whopper Jr. por R$ 25',
      time: 'Há 12 minutos',
      status: 'Utilizado'
    }
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Simulação de Cupons Ativos no Banco de Dados
  const couponsCatalog = {
    'BK-MC25': {
      store: 'Burger King',
      title: 'Combo 2 Whopper Jr. + 2 Batatas Média + Refil',
      discount: 'Combo R$ 25,00',
      customer: 'Thierry Anthony Sousa Silva',
      cpf: '***.482.916-**',
      level: 'Bronze',
      status: 'Ativo'
    },
    'CACAU-MC20': {
      store: 'Cacau Show',
      title: '20% OFF em Trufas e Linha LaCreme',
      discount: '20% de Desconto',
      customer: 'Maria Fernanda Santos',
      cpf: '***.109.836-**',
      level: 'Prata',
      status: 'Ativo'
    },
    'BOLIXE-MC30': {
      store: 'BoliXe Monte Carmo',
      title: '30% de Desconto na 1ª Hora de Boliche',
      discount: '30% OFF',
      customer: 'Carlos Eduardo Lima',
      cpf: '***.934.126-**',
      level: 'Ouro',
      status: 'Ativo'
    },
    'CINEART-MC': {
      store: 'Cineart Monte Carmo',
      title: '1 Pipoca Grande Salgada Grátis',
      discount: 'Pipoca Grátis',
      customer: 'Aline Souza Barbosa',
      cpf: '***.551.406-**',
      level: 'Diamante',
      status: 'Ativo'
    }
  };

  const handleValidateVoucher = () => {
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    // Checa se já foi utilizado no histórico recente da loja
    const alreadyUsed = validatedHistory.find(h => h.code === cleanCode);
    if (alreadyUsed) {
      setValidationResult({
        status: 'used',
        message: `Este cupom já foi utilizado hoje (${alreadyUsed.time}).`,
        data: alreadyUsed
      });
      return;
    }

    const coupon = couponsCatalog[cleanCode];

    if (!coupon) {
      setValidationResult({
        status: 'not_found',
        message: 'Código de voucher não encontrado no sistema.'
      });
      return;
    }

    // Checa se pertence à loja selecionada
    if (coupon.store.toLowerCase() !== selectedStore.toLowerCase()) {
      setValidationResult({
        status: 'wrong_store',
        message: `Este cupom é exclusivo da loja "${coupon.store}", não podendo ser utilizado no "${selectedStore}".`,
        data: coupon
      });
      return;
    }

    setValidationResult({
      status: 'valid',
      code: cleanCode,
      ...coupon
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
      message: `🎉 Cupom "${validationResult.code}" validado com sucesso! Desconto aplicado ao cliente.`
    });
    setVoucherCode('');
  };

  return (
    <div style={{ padding: '20px', minHeight: '100%', background: '#0F172A', color: '#FFF' }}>
      {/* Header do Lojista */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
          <span>Voltar ao App do Cliente</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #10B981' }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#10B981' }}>PORTAL DO LOJISTA</span>
        </div>
      </div>

      {/* Seleção da Loja Operadora */}
      <div className="glass-card" style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
          🏢 Selecione o Caixa / Balcão da sua Loja:
        </label>
        <select 
          value={selectedStore} 
          onChange={(e) => {
            setSelectedStore(e.target.value);
            setValidationResult(null);
          }}
          style={{ width: '100%', padding: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '14px', fontWeight: '700', outline: 'none' }}
        >
          {['Burger King', 'Cacau Show', 'BoliXe Monte Carmo', 'Cineart Monte Carmo', 'Lojas Renner', 'Artesanato do Japa'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Formulário de Validação */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={20} color="#10B981" /> Validar Cupom do Cliente
        </h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <input 
            type="text"
            placeholder="Digite o código (ex: BK-MC25)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '12px 14px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', outline: 'none' }}
          />

          <button 
            className="btn-primary-action"
            onClick={handleValidateVoucher}
            style={{ marginTop: 0, padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={18} /> Verificar
          </button>
        </div>

        {/* Atalhos de Demonstração Rápida */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8', alignSelf: 'center' }}>Testar códigos:</span>
          {['BK-MC25', 'CACAU-MC20', 'BOLIXE-MC30', 'CINEART-MC'].map(code => (
            <button 
              key={code}
              onClick={() => {
                setVoucherCode(code);
                // auto seleciona a loja correspondente se necessário
                if (code === 'BK-MC25') setSelectedStore('Burger King');
                if (code === 'CACAU-MC20') setSelectedStore('Cacau Show');
                if (code === 'BOLIXE-MC30') setSelectedStore('BoliXe Monte Carmo');
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
        <div className="glass-card" style={{ marginBottom: '20px', border: validationResult.status === 'valid' ? '1px solid #10B981' : '1px solid #EF4444' }}>
          {validationResult.status === 'valid' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', marginBottom: '10px' }}>
                <CheckCircle2 size={24} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>CUPOM VÁLIDO E ATIVO!</h4>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B', marginBottom: '4px' }}>
                  {validationResult.discount} ({validationResult.title})
                </p>
                <p style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '2px' }}>
                  <strong>Cliente:</strong> {validationResult.customer}
                </p>
                <p style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  <strong>CPF:</strong> {validationResult.cpf} • <strong>Nível:</strong> 👑 {validationResult.level}
                </p>
              </div>

              <button 
                className="btn-primary-action"
                onClick={handleBurnCoupon}
                style={{ width: '100%', padding: '14px', background: '#10B981', fontSize: '14px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={20} /> Confirmar Queima / Uso do Cupom no Caixa
              </button>
            </div>
          )}

          {validationResult.status === 'used' && (
            <div style={{ color: '#EF4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <XCircle size={24} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>CUPOM JÁ UTILIZADO!</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1' }}>{validationResult.message}</p>
            </div>
          )}

          {validationResult.status === 'wrong_store' && (
            <div style={{ color: '#F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <AlertCircle size={24} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>LOJA INCORRETA</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1' }}>{validationResult.message}</p>
            </div>
          )}

          {validationResult.status === 'not_found' && (
            <div style={{ color: '#EF4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <XCircle size={24} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>CÓDIGO INVÁLIDO</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1' }}>{validationResult.message}</p>
            </div>
          )}

          {validationResult.status === 'burned' && (
            <div style={{ color: '#10B981', textAlign: 'center', padding: '10px 0' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <p style={{ fontSize: '14px', fontWeight: '800' }}>{validationResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Cupons Validados Hoje */}
      <div className="glass-card">
        <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#10B981" /> Cupons Validados Hoje no {selectedStore} ({validatedHistory.length})
        </h4>

        {validatedHistory.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B' }}>{item.code}</span>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{item.customer} • {item.discount}</p>
            </div>
            <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
              {item.status} ({item.time})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
