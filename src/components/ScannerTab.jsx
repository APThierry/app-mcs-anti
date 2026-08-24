import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Upload, Key, CheckCircle, Clock, AlertCircle, Sparkles, Receipt, Camera, CameraOff } from 'lucide-react';
import { nfeService } from '../services/nfeService';
import { dataService } from '../services/dataService';
import confetti from 'canvas-confetti';

export default function ScannerTab({ userData, setUserData, receipts, setReceipts, onOpenManualModal }) {
  const [isScanning, setIsScanning] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [successToast, setSuccessToast] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Inicia/Para a câmera real do dispositivo
  useEffect(() => {
    if (useRealCamera) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError('');
        })
        .catch((err) => {
          setCameraError('Não foi possível acessar a câmera do dispositivo. Usando visor simulado.');
          setUseRealCamera(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealCamera]);

  const handleProcessValidReceipt = async () => {
    setIsScanning(true);

    setTimeout(async () => {
      setIsScanning(false);
      
      // Gera uma chave NFC-e de MG 100% válida com Módulo 11
      const sampleKey = nfeService.generateSampleValidKey();
      const validation = nfeService.validateReceipt(sampleKey, receipts);

      if (validation.isValid) {
        const newReceipt = await dataService.addReceipt({
          store_name: validation.storeName,
          amount: validation.amount,
          points_earned: validation.pointsEarned,
          access_key_44: sampleKey,
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

        setSuccessToast({
          store: validation.storeName,
          amount: validation.amount.toFixed(2),
          points: validation.pointsEarned,
          key: sampleKey
        });

        setTimeout(() => setSuccessToast(null), 6500);
      }
    }, 1800);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
          Leitor de Nota Fiscal SEFAZ-MG
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Enquadre o QR Code impresso no cupom fiscal (NFC-e) das lojas do shopping.
        </p>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)', borderColor: '#10b981', marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={32} color="#10B981" />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Nota Validada pela SEFAZ-MG!</h4>
              <p style={{ fontSize: '12px', color: '#e2e8f0' }}>
                {successToast.store} • R$ {successToast.amount} → <strong style={{ color: 'var(--brand-gold)' }}>+{successToast.points} pontos</strong> creditados!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Viewport Container */}
      <div className="scanner-viewport-card" style={{ position: 'relative' }}>
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}

        <div className="scanner-overlay-grid" style={{ position: 'absolute', zIndex: 10 }}>
          <div className="scan-corner top-left" />
          <div className="scan-corner top-right" />
          <div className="scan-corner bottom-left" />
          <div className="scan-corner bottom-right" />
          <div className="scanner-laser" />

          {isScanning ? (
            <div style={{ textAlign: 'center', color: 'var(--brand-primary)' }}>
              <Sparkles size={36} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
              <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '800' }}>Validando com SEFAZ-MG...</div>
            </div>
          ) : (
            !useRealCamera && <QrCode size={64} color="rgba(16, 185, 129, 0.4)" />
          )}
        </div>

        <div className="scan-instruction" style={{ zIndex: 15 }}>
          {isScanning ? 'Consultando chave de 44 dígitos...' : 'Encaixe o QR Code do cupom fiscal na área'}
        </div>
      </div>

      {/* Toggle Camera Mode */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <button 
          onClick={() => setUseRealCamera(!useRealCamera)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-primary)',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {useRealCamera ? <CameraOff size={14} /> : <Camera size={14} />}
          {useRealCamera ? 'Desativar Câmera Real' : 'Ativar Câmera Real do Celular'}
        </button>
      </div>

      {/* Action Buttons */}
      <button 
        className="btn-primary-action"
        onClick={handleProcessValidReceipt}
        disabled={isScanning}
      >
        <QrCode size={20} />
        {isScanning ? 'Processando e Validando...' : 'Escanear QR Code da Nota Fiscal'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
        <button className="btn-secondary-action" onClick={handleProcessValidReceipt}>
          <Upload size={16} /> Enviar Foto da Nota
        </button>

        <button className="btn-secondary-action" onClick={onOpenManualModal}>
          <Key size={16} /> Digitar Chave 44 Dígitos
        </button>
      </div>

      {/* Submitted Receipts Section */}
      <div style={{ marginTop: '28px' }}>
        <div className="section-title-row">
          <h3 className="section-title">
            <Receipt size={18} color="#10B981" />
            Extrato de Notas Enviadas ({receipts.length})
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {receipts.map((nf) => (
            <div key={nf.id} className="glass-card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {nf.storeName || nf.store_name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {nf.id || nf.access_key_44?.substring(0, 10)} • {nf.date || nf.created_at?.substring(0, 10)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  marginBottom: '4px'
                }}>
                  {nf.status || 'Aprovada'}
                </span>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--brand-gold)' }}>
                  R$ {parseFloat(nf.amount).toFixed(2)} (+{nf.pointsEarned || nf.points_earned} pts)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
