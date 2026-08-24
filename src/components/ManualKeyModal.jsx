import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertTriangle, Building2, Calendar, FileCheck, Sparkles } from 'lucide-react';
import { nfeService } from '../services/nfeService';
import { dataService } from '../services/dataService';
import confetti from 'canvas-confetti';

export default function ManualKeyModal({ isOpen, onClose, setUserData, receipts, setReceipts }) {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  if (!isOpen) return null;

  const handleKeyChange = (val) => {
    // Tenta extrair a chave caso o usuário cole a URL inteira do QR Code da SEFAZ
    const extracted = nfeService.extractKeyFromQrCode(val) || val.replace(/\D/g, '');
    setAccessKey(extracted);
    setError('');

    if (extracted.length === 44) {
      const result = nfeService.validateReceipt(extracted, receipts);
      if (result.isValid) {
        setParsedPreview(result);
        setError('');
      } else {
        setParsedPreview(null);
        setError(result.error);
      }
    } else {
      setParsedPreview(null);
    }
  };

  const handleFillSample = () => {
    const validKey = nfeService.generateSampleValidKey('12345678000101');
    handleKeyChange(validKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = nfeService.validateReceipt(accessKey, receipts);

    if (!result.isValid) {
      setError(result.error);
      return;
    }

    try {
      const newReceipt = await dataService.addReceipt({
        store_name: result.storeName,
        amount: result.amount,
        points_earned: result.pointsEarned,
        access_key_44: accessKey,
        status: 'Aprovada'
      });

      const updatedReceipts = await dataService.getReceipts();
      setReceipts(updatedReceipts);

      const updatedUser = await dataService.getUserProfile();
      setUserData(updatedUser);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      alert(`🎉 Nota Fiscal da SEFAZ-MG Aprovada com Sucesso!\n\nLoja: ${result.storeName}\nValor: R$ ${result.amount.toFixed(2)}\nPontos Creditados: +${result.pointsEarned} pts\nChave: ${accessKey}`);

      setAccessKey('');
      setParsedPreview(null);
      setError('');
      onClose();
    } catch (err) {
      setError('Erro ao salvar nota no banco de dados.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar" />

        <div className="modal-header-row">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#10B981" /> Validador SEFAZ-MG
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Digite os 44 números da Chave de Acesso ou cole o link do QR Code impresso no cupom fiscal.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            rows="3"
            placeholder="Ex: 31260812345678000101650010000123451009876547 ou link http://nfce.fazenda.mg.gov.br/..."
            value={accessKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg-primary)',
              border: error ? '1px solid #EF4444' : (parsedPreview ? '1px solid #10B981' : '1px solid var(--border-glass)'),
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontFamily: 'monospace',
              outline: 'none',
              marginBottom: '8px',
              resize: 'none'
            }}
          />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#EF4444', marginBottom: '12px', fontWeight: '600' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {parsedPreview && (
            <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981', marginBottom: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10B981', fontWeight: '800', fontSize: '12px' }}>
                <FileCheck size={16} /> Chave Validada pela SEFAZ-MG (Módulo 11 OK)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div><Building2 size={12} style={{ display: 'inline' }} /> Loja: <strong style={{ color: 'var(--text-main)' }}>{parsedPreview.storeName}</strong></div>
                <div><Calendar size={12} style={{ display: 'inline' }} /> Emissão: <strong style={{ color: 'var(--text-main)' }}>{parsedPreview.parsedDetails.dataEmissao}</strong></div>
                <div>UF: <strong style={{ color: 'var(--text-main)' }}>Minas Gerais (31)</strong></div>
                <div>Modelo: <strong style={{ color: 'var(--text-main)' }}>{parsedPreview.parsedDetails.modelo}</strong></div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px' }}>Valor da Compra: <strong>R$ {parsedPreview.amount.toFixed(2)}</strong></span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-gold)' }}>+{parsedPreview.pointsEarned} pontos</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            <span>Dígitos: {accessKey.length} / 44</span>
            <button 
              type="button" 
              onClick={handleFillSample}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Sparkles size={12} /> Gerar Chave SEFAZ-MG Válida
            </button>
          </div>

          <button type="submit" className="btn-primary-action" disabled={!parsedPreview}>
            <CheckCircle size={18} /> Validar e Enviar Nota
          </button>
        </form>
      </div>
    </div>
  );
}
