import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import CouponsTab from './components/CouponsTab';
import ScannerTab from './components/ScannerTab';
import StoresTab from './components/StoresTab';
import ProfileTab from './components/ProfileTab';
import CouponModal from './components/CouponModal';
import ManualKeyModal from './components/ManualKeyModal';
import NotificationsModal from './components/NotificationsModal';
import AuthModal from './components/AuthModal';
import LojistaPanel from './components/LojistaPanel';
import GeminiChatModal from './components/GeminiChatModal';

import { dataService } from './services/dataService';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { sefazParser } from './services/sefazParser';
import { notificationService } from './services/notificationService';
import { geminiService } from './services/geminiService';
import { formatCPF, validateCPF, cleanCPF } from './utils/cpfValidator';
import { initialUserData, initialReceiptsData, notificationsData } from './data/mockData';
import { Smartphone, Monitor, ArrowLeft, LogIn, UserPlus, Sparkles, Store, ShieldCheck, MessageCircle } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [viewMode, setViewMode] = useState('phone');
  const [isLojistaMode, setIsLojistaMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentSubView, setCurrentSubView] = useState(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [receipts, setReceipts] = useState(initialReceiptsData);
  const [notifications, setNotifications] = useState(notificationsData);

  // Form Auth Inicial
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCpf, setAuthCpf] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Modals state
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isManualKeyOpen, setIsManualKeyOpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await dataService.getUserProfile();
          setUserData(profile);
          setIsLoggedIn(true);
        }
      }
    }
    checkAuth();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'phone' ? 'fullscreen' : 'phone'));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    if (isRegisterMode) {
      if (!validateCPF(authCpf)) {
        alert('Por favor, informe um CPF válido com 11 dígitos.');
        return;
      }

      setAuthLoading(true);

      // Checa se o CPF já está cadastrado no banco de dados
      const cpfExists = await dataService.checkCpfExists(authCpf);
      if (cpfExists) {
        alert('⚠️ Este CPF já está cadastrado no Monte Carmo Shopping! Cada cliente só pode ter 1 conta por CPF. Por favor, faça login com seu e-mail e senha.');
        setAuthLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { name: authName, phone: authPhone, cpf: cleanCPF(authCpf) }
          }
        });

        if (error) {
          alert('Erro no cadastro: ' + error.message);
          setAuthLoading(false);
          return;
        }
      }

      const refCode = `MC${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser = {
        name: authName || 'Cliente Monte Carmo',
        email: authEmail,
        cpf: cleanCPF(authCpf),
        phone: authPhone || '(31) 98765-4321',
        points: 100,
        level: 'Bronze',
        referralLink: `https://montecarmoshopping.com.br/cadastro?ref=${refCode}`
      };

      await dataService.updateUserProfile(newUser);
      setUserData(newUser);
      setIsLoggedIn(true);
      notificationService.sendPushNotification(null, '🎉 Bem-vindo ao Monte Carmo!', 'Você ganhou 100 pontos de boas-vindas.');
      alert('🎉 Cadastro realizado com sucesso! Você ganhou 100 pontos de boas-vindas.');
    } else {
      setAuthLoading(true);
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) {
          console.log('Tentativa de login offline:', error.message);
        }
      }

      const existingUser = await dataService.getUserProfile();
      const user = existingUser?.email ? existingUser : {
        name: authEmail.split('@')[0],
        email: authEmail,
        cpf: cleanCPF(authCpf) || '12345678900',
        phone: '(31) 98765-4321',
        points: 250,
        level: 'Prata',
        referralLink: `https://montecarmoshopping.com.br/cadastro?ref=MC${Math.floor(1000 + Math.random() * 9000)}`
      };

      setUserData(user);
      setIsLoggedIn(true);
    }

    setAuthLoading(false);
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Visitante',
      email: 'visitante@montecarmoshopping.com.br',
      phone: '(31) 3117-1511',
      points: 100,
      level: 'Bronze',
      referralLink: 'https://montecarmoshopping.com.br'
    };
    setUserData(guestUser);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentSubView(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`app-viewport-wrapper ${viewMode === 'fullscreen' ? 'full-screen' : ''}`}>
      {/* Botões Flutuantes de Controle */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        {/* Assistente IA Gemini */}
        <button 
          onClick={() => setIsGeminiChatOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFF',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(16,185,129,0.4)'
          }}
        >
          <Sparkles size={16} />
          <span>Monte Carmo IA</span>
        </button>

        {/* WhatsApp Oficial (31) 3117-1511 */}
        <a 
          href="https://wa.me/553131171511?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20no%20Monte%20Carmo%20Shopping!"
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#25D366',
            color: '#FFF',
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
          }}
        >
          <MessageCircle size={16} />
          <span>WhatsApp (31) 3117-1511</span>
        </a>

        {/* Alternador de Modo Lojista vs Cliente */}
        <button 
          onClick={() => setIsLojistaMode(!isLojistaMode)}
          style={{
            background: isLojistaMode ? '#10B981' : '#1E293B',
            color: '#FFF',
            border: '1px solid #10B981',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <ShieldCheck size={16} />
          <span>{isLojistaMode ? 'Modo App Cliente' : 'Painel do Lojista'}</span>
        </button>

        {/* Alternador Tela Cheia vs Celular */}
        <button className="device-toggle-float" style={{ position: 'static' }} onClick={toggleViewMode}>
          {viewMode === 'phone' ? <Monitor size={16} /> : <Smartphone size={16} />}
          <span>{viewMode === 'phone' ? 'Tela Cheia' : 'Celular'}</span>
        </button>
      </div>

      {/* Moldura de Smartphone */}
      <div className="mobile-phone-frame">
        <div className="phone-notch">
          <div className="phone-camera" />
          <div className="phone-speaker" />
        </div>

        <div className="app-screen-container">
          {isLojistaMode ? (
            <LojistaPanel onBack={() => setIsLojistaMode(false)} />
          ) : !isLoggedIn ? (
            <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img 
                  src="/imag/logo.png" 
                  alt="MonteCarmo Shopping" 
                  style={{ width: '200px', maxWidth: '80%', margin: '0 auto 8px auto', display: 'block' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: '800', letterSpacing: '1px' }}>
                  CLUBE DE BENEFÍCIOS & FIDELIDADE
                </span>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isRegisterMode ? 'Criar Nova Conta' : 'Entrar no Aplicativo'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {isRegisterMode 
                    ? 'Cadastre-se para acumular pontos em compras e resgatar prêmios!'
                    : 'Acesse seus cupons, saldo de pontos e histórico de notas fiscais.'}
                </p>

                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {isRegisterMode && (
                    <>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Nome Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="Seu nome"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>CPF (Apenas 1 cadastro por CPF)</label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          maxLength={14}
                          value={authCpf}
                          onChange={(e) => setAuthCpf(formatCPF(e.target.value))}
                          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>WhatsApp / Telefone</label>
                        <input
                          type="text"
                          required
                          placeholder="(31) 98765-4321"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Sua senha"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', marginTop: '4px' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary-action" style={{ marginTop: '10px' }} disabled={authLoading}>
                    {isRegisterMode ? <UserPlus size={16} /> : <LogIn size={16} />}
                    {isRegisterMode ? 'Concluir Cadastro' : 'Entrar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
                  >
                    {isRegisterMode ? 'Já tem conta? Clique para Entrar' : 'Não tem conta? Cadastre-se e ganhe 100 pts'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Continuar como Visitante →
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <Header 
                theme={theme}
                toggleTheme={toggleTheme}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenGeminiChat={() => setIsGeminiChatOpen(true)}
                unreadCount={unreadCount}
                userData={userData}
                currentSubView={currentSubView}
                onBack={() => setCurrentSubView(null)}
              />

              <main className="tab-content-body">
                {currentSubView === 'profile_dados' && (
                  <div className="glass-card">
                    <button 
                      onClick={() => setCurrentSubView(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '14px' }}
                    >
                      <ArrowLeft size={16} /> Voltar para Perfil
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Meus Dados Cadastrais</h3>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}><strong>Nome:</strong> {userData?.name}</p>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}><strong>CPF:</strong> {formatCPF(userData?.cpf) || 'Não informado'}</p>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}><strong>E-mail:</strong> {userData?.email}</p>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}><strong>Telefone:</strong> {userData?.phone}</p>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}><strong>Nível:</strong> 👑 {userData?.level}</p>
                  </div>
                )}

                {currentSubView === 'profile_regras' && (
                  <div className="glass-card">
                    <button 
                      onClick={() => setCurrentSubView(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '14px' }}
                    >
                      <ArrowLeft size={16} /> Voltar para Perfil
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Como Funciona o Clube</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      1. Compre em qualquer loja física do Monte Carmo Shopping.<br/>
                      2. Abra a câmera do app e leia o QR Code do cupom fiscal.<br/>
                      3. Cada R$ 1,00 aprovado gera 1 Ponto de Fidelidade no seu saldo.<br/>
                      4. Troque seus pontos por cupons e descontos exclusivos no shopping!
                    </p>
                  </div>
                )}

                {currentSubView === 'lojista_panel' && (
                  <LojistaPanel onBack={() => setCurrentSubView(null)} />
                )}

                {!currentSubView && (
                  <>
                    {activeTab === 'home' && (
                      <HomeTab 
                        userData={userData}
                        setActiveTab={setActiveTab}
                        onSelectCoupon={(coupon) => setSelectedCoupon(coupon)}
                      />
                    )}

                    {activeTab === 'coupons' && (
                      <CouponsTab 
                        userData={userData}
                        onSelectCoupon={(coupon) => setSelectedCoupon(coupon)}
                      />
                    )}

                    {activeTab === 'scan' && (
                      <ScannerTab 
                        userData={userData}
                        setUserData={setUserData}
                        receipts={receipts}
                        setReceipts={setReceipts}
                        onOpenManualModal={() => setIsManualKeyOpen(true)}
                      />
                    )}

                    {activeTab === 'stores' && (
                      <StoresTab setActiveTab={setActiveTab} />
                    )}

                    {activeTab === 'profile' && (
                      <ProfileTab 
                        userData={userData}
                        setUserData={setUserData}
                        setActiveTab={setActiveTab}
                        onOpenAuthModal={handleLogout}
                        onNavigateSubView={(view) => setCurrentSubView(view)}
                      />
                    )}
                  </>
                )}
              </main>

              <BottomNav activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setCurrentSubView(null); }} />

              {selectedCoupon && (
                <CouponModal 
                  coupon={selectedCoupon}
                  onClose={() => setSelectedCoupon(null)}
                  userData={userData}
                  setUserData={setUserData}
                />
              )}

              <ManualKeyModal 
                isOpen={isManualKeyOpen}
                onClose={() => setIsManualKeyOpen(false)}
                setUserData={setUserData}
                receipts={receipts}
                setReceipts={setReceipts}
              />

              <NotificationsModal 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />

              {/* Modal de Chat IA Gemini */}
              <GeminiChatModal 
                isOpen={isGeminiChatOpen}
                onClose={() => setIsGeminiChatOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
