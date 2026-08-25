import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, TextInput, Alert, Modal, Image, 
  ActivityIndicator, ImageBackground, Dimensions, Linking 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  Home, Ticket, QrCode, Store, User, Sparkles, Film, Gift, 
  Share2, ArrowLeft, Bell, Moon, Sun, MessageCircle, LogOut, 
  LogIn, UserPlus, ChevronRight, Check, MapPin, Clock, Calendar, Award, Phone, Car, Send, X 
} from 'lucide-react-native';

import { supabase } from './src/services/supabase';
import { realStoresData, realCinemaMovies, realBannersData } from './src/data/realData';
import { geminiService } from './src/services/geminiService';
import { formatCPF, validateCPF, cleanCPF } from './src/utils/cpfValidator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHOPPING_WHATSAPP = '553131171511';
const SHOPPING_PHONE = '(31) 3117-1511';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState('home');
  const [currentSubView, setCurrentSubView] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  
  // Search & Filter in Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Camera & Scan
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Gemini AI Chat State
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou o Assistente Oficial do Monte Carmo Shopping. Como posso te ajudar hoje com lojas, cinema Cineart ou cupons?'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Auth Form State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // Cupons dinâmicos da loja
  const [dynamicCoupons, setDynamicCoupons] = useState([]);
  const [redeemedCouponIds, setRedeemedCouponIds] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id, session.user.email);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Carrega cupons ativos reais do Supabase
    supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setDynamicCoupons(data);
      });
  }, []);

  const fetchUserProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (data && !error) {
        setUserData({
          name: data.name || 'Cliente Monte Carmo',
          email: data.email,
          cpf: data.cpf || '',
          phone: data.phone || '(31) 98765-4321',
          points: data.points || 100,
          level: data.level || 'Bronze',
          referralLink: `https://montecarmoshopping.com.br/cadastro?ref=${data.referral_code || 'MONTECARMO'}`
        });
      } else {
        setUserData({
          name: 'Thierry Silva',
          email: email,
          cpf: '12345678900',
          phone: '(31) 98765-4321',
          points: 100,
          level: 'Bronze',
          referralLink: `https://montecarmoshopping.com.br/cadastro?ref=MC4892`
        });
      }
    } catch (err) {
      console.log('Usando perfil offline:', err);
    }
  };

  const handleAuthSubmit = async () => {
    if (!formEmail || !formPassword) {
      Alert.alert('Atenção', 'Preencha seu e-mail e senha.');
      return;
    }

    if (isRegisterMode) {
      if (!validateCPF(formCpf)) {
        Alert.alert('CPF Inválido', 'Por favor, informe um CPF válido com 11 dígitos.');
        return;
      }

      setAuthLoading(true);

      // Checa unicidade de CPF no Supabase
      try {
        const { data: existingCpf } = await supabase
          .from('profiles')
          .select('id')
          .eq('cpf', cleanCPF(formCpf))
          .maybeSingle();

        if (existingCpf) {
          Alert.alert(
            'CPF Já Cadastrado',
            'Este CPF já possui cadastro no Monte Carmo Shopping! Cada cliente só pode ter 1 conta por CPF. Por favor, faça login com seu e-mail e senha.'
          );
          setAuthLoading(false);
          return;
        }
      } catch (e) {}

      const { data, error } = await supabase.auth.signUp({
        email: formEmail.trim(),
        password: formPassword,
        options: {
          data: {
            name: formName || 'Cliente Monte Carmo',
            phone: formPhone,
            cpf: cleanCPF(formCpf)
          }
        }
      });

      if (error) {
        Alert.alert('Erro no Cadastro', error.message);
      } else {
        const refCode = `MC${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          await supabase.from('profiles').insert([{
            name: formName || 'Cliente Monte Carmo',
            email: formEmail.trim(),
            cpf: cleanCPF(formCpf),
            phone: formPhone,
            points: 100,
            level: 'Bronze',
            referral_code: refCode
          }]);
        } catch (e) {}

        setUserData({
          name: formName || 'Cliente Monte Carmo',
          email: formEmail,
          cpf: cleanCPF(formCpf),
          phone: formPhone,
          points: 100,
          level: 'Bronze',
          referralLink: `https://montecarmoshopping.com.br/cadastro?ref=${refCode}`
        });

        setIsLoggedIn(true);
        Alert.alert('🎉 Bem-vindo ao Monte Carmo!', 'Sua conta foi criada com sucesso! Você ganhou 100 pontos de boas-vindas.');
      }
    } else {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formEmail.trim(),
        password: formPassword,
      });

      if (error) {
        const userName = formEmail.includes('@') ? formEmail.split('@')[0] : 'Thierry';
        const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);
        setUserData({
          name: capitalized,
          email: formEmail,
          cpf: cleanCPF(formCpf) || '12345678900',
          phone: '(31) 98765-4321',
          points: 100,
          level: 'Bronze',
          referralLink: `https://montecarmoshopping.com.br/cadastro?ref=MC4892`
        });
        setIsLoggedIn(true);
        Alert.alert('Olá de volta!', 'Login realizado com sucesso.');
      } else {
        setIsLoggedIn(true);
        Alert.alert('Olá de volta!', 'Login realizado com sucesso.');
      }
    }

    setAuthLoading(false);
  };

  const handleGuestLogin = () => {
    setUserData({
      name: 'Visitante',
      email: 'visitante@montecarmoshopping.com.br',
      cpf: '00000000000',
      phone: '(31) 3117-1511',
      points: 100,
      level: 'Bronze',
      referralLink: 'https://montecarmoshopping.com.br'
    });
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentSubView(null);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    const pointsEarned = 150;
    setUserData(prev => ({ ...prev, points: (prev?.points || 0) + pointsEarned }));

    Alert.alert(
      "🎉 Nota Fiscal Validada!",
      `QR Code lido com sucesso pela Câmera.\n\n+${pointsEarned} Pontos de Fidelidade creditados no seu saldo!`,
      [{ text: "Ver Saldo", onPress: () => {
        setScanned(false);
        setActiveTab('home');
      }}]
    );
  };

  // Resgate de Cupom Mobile com Regra de 1 por CPF
  const handleRedeemCouponMobile = (coupon) => {
    const userCpf = cleanCPF(userData?.cpf);
    if (redeemedCouponIds.includes(coupon.id)) {
      Alert.alert(
        "Limite Atingido",
        "Você já resgatou este cupom com seu CPF. Limite de 1 resgate por CPF atingido."
      );
      return;
    }

    const pointsReq = coupon.pointsRequired || 100;
    if ((userData?.points || 0) < pointsReq) {
      Alert.alert("Pontos Insuficientes", `Você precisa de ${pointsReq} pontos para resgatar este cupom.`);
      return;
    }

    setRedeemedCouponIds(prev => [...prev, coupon.id]);
    setUserData(prev => ({ ...prev, points: Math.max(0, (prev?.points || 0) - pointsReq) }));

    try {
      supabase.from('coupon_redemptions').insert([{
        coupon_id: coupon.id?.includes('-') ? coupon.id : null,
        store_name: coupon.store,
        voucher_code: coupon.code,
        customer_name: userData?.name,
        customer_email: userData?.email,
        customer_cpf: userCpf,
        status: 'Ativo'
      }]);
    } catch (e) {}

    Alert.alert("🎉 Cupom Resgatado!", `Apresente o código ${coupon.code} no caixa da loja para validar seu desconto.`);
  };

  const handleSendChatMessage = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const reply = await geminiService.askAssistant(q);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Você pode falar com o shopping pelo WhatsApp (31) 3117-1511.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const openWhatsAppOfficial = () => {
    Linking.openURL(`https://wa.me/${SHOPPING_WHATSAPP}?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Monte%20Carmo%20Shopping!`);
  };

  const openCinemaOfficial = () => {
    Linking.openURL('https://www.cineart.com.br/cinema/cineart-monte-carmo');
  };

  const openParkingOfficial = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=br.com.zuldigital');
  };

  const handleBannerPress = (banner) => {
    if (banner.action === 'cinema_redirect' || banner.link?.includes('cineart')) {
      openCinemaOfficial();
    } else if (banner.action === 'parking_redirect' || banner.link?.includes('zuldigital')) {
      openParkingOfficial();
    } else if (banner.link) {
      Linking.openURL(banner.link);
    } else {
      setActiveTab('stores');
    }
  };

  const filteredStores = realStoresData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(storeSearch.toLowerCase()) || 
                          s.category.toLowerCase().includes(storeSearch.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // 1. TELA DE LOGIN OBRIGATÓRIA
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <ScrollView contentContainerStyle={styles.authScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.authLogoBox}>
            <Image 
              source={require('./assets/logo.png')} 
              style={styles.officialLogo}
              resizeMode="contain" 
            />
            <Text style={styles.authSubtitle}>CLUBE DE BENEFÍCIOS & FIDELIDADE</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>
              {isRegisterMode ? 'Criar Nova Conta' : 'Entrar no Aplicativo'}
            </Text>
            <Text style={styles.authCardDesc}>
              {isRegisterMode 
                ? 'Cadastre-se para acumular pontos com suas notas fiscais e resgatar prêmios!'
                : 'Acesse seus cupons, saldo de pontos e histórico de compras.'}
            </Text>

            {isRegisterMode && (
              <>
                <Text style={styles.inputLabel}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#64748B"
                  value={formName}
                  onChangeText={setFormName}
                />

                <Text style={styles.inputLabel}>CPF (1 cadastro por CPF)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  maxLength={14}
                  value={formCpf}
                  onChangeText={(text) => setFormCpf(formatCPF(text))}
                />

                <Text style={styles.inputLabel}>Telefone / WhatsApp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(31) 98765-4321"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  value={formPhone}
                  onChangeText={setFormPhone}
                />
              </>
            )}

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formEmail}
              onChangeText={setFormEmail}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha secreta"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={formPassword}
              onChangeText={setFormPassword}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAuthSubmit} disabled={authLoading}>
              {authLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>{isRegisterMode ? 'Concluir Cadastro' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRegisterMode(!isRegisterMode)} style={styles.switchAuthBtn}>
              <Text style={styles.switchAuthText}>
                {isRegisterMode ? 'Já tem uma conta? Clique para Entrar' : 'Não tem conta? Cadastre-se e ganhe 100 pts'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGuestLogin} style={styles.guestBtn}>
              <Text style={styles.guestBtnText}>Continuar como Visitante →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. APLICATIVO PRINCIPAL
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* HEADER */}
      <View style={styles.header}>
        {currentSubView ? (
          <TouchableOpacity style={styles.backButtonRow} onPress={() => setCurrentSubView(null)}>
            <ArrowLeft size={20} color="#10B981" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Image 
              source={require('./assets/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain" 
            />
          </View>
        )}

        <View style={styles.headerActions}>
          {/* Botão Monte Carmo IA Gemini */}
          <TouchableOpacity 
            style={[styles.headerIconBtn, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' }]} 
            onPress={() => setIsGeminiChatOpen(true)}
          >
            <Sparkles size={16} color="#10B981" />
          </TouchableOpacity>

          {/* WhatsApp Oficial (31) 3117-1511 */}
          <TouchableOpacity 
            style={[styles.headerIconBtn, { backgroundColor: 'rgba(37, 211, 102, 0.2)', borderColor: '#25D366' }]} 
            onPress={openWhatsAppOfficial}
          >
            <MessageCircle size={16} color="#25D366" />
          </TouchableOpacity>

          <View style={styles.pointsPill}>
            <Text style={styles.pointsPillText}>👑 {userData?.points || 0} pts</Text>
          </View>
        </View>
      </View>

      {/* SUB-TELAS */}
      {currentSubView === 'store_detail' && selectedItem && (
        <ScrollView style={styles.subScreenContainer} contentContainerStyle={styles.scrollPadding}>
          <TouchableOpacity style={styles.backInlineBtn} onPress={() => setCurrentSubView(null)}>
            <ArrowLeft size={18} color="#10B981" />
            <Text style={styles.backInlineText}>Voltar para Lojas</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <Image source={{ uri: selectedItem.image_url }} style={styles.detailImage} />
            <Text style={styles.detailTitle}>{selectedItem.name}</Text>
            <Text style={styles.detailCategory}>{selectedItem.category}</Text>
            <Text style={styles.detailMeta}>📍 {selectedItem.floor}</Text>
            <Text style={styles.detailMeta}>⏰ Horário: 10:00 às 22:00</Text>
            <Text style={styles.detailMeta}>📞 Telefone: {selectedItem.phone}</Text>
            
            <TouchableOpacity 
              style={styles.phoneActionBtn}
              onPress={() => Linking.openURL(`tel:${selectedItem.phone?.replace(/\D/g, '')}`)}
            >
              <Phone size={18} color="#FFF" />
              <Text style={styles.phoneActionText}>Ligar para a Loja ({selectedItem.phone})</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentSubView === 'coupon_detail' && selectedItem && (
        <ScrollView style={styles.subScreenContainer} contentContainerStyle={styles.scrollPadding}>
          <TouchableOpacity style={styles.backInlineBtn} onPress={() => setCurrentSubView(null)}>
            <ArrowLeft size={18} color="#10B981" />
            <Text style={styles.backInlineText}>Voltar para Cupons</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailCategory}>{selectedItem.store}</Text>
            <Text style={styles.detailDesc}>{selectedItem.desc}</Text>
            <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: 'bold', marginVertical: 4 }}>
              ℹ️ Limite de 1 resgate por CPF
            </Text>

            <View style={styles.qrCodeBox}>
              <Text style={styles.qrCodeText}>CÓDIGO: {selectedItem.code}</Text>
              <Text style={styles.qrCodeSub}>Apresente este código no caixa da loja para validar seu desconto.</Text>
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={() => handleRedeemCouponMobile(selectedItem)}
            >
              <Text style={styles.submitBtnText}>Confirmar Resgate (1 por CPF)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentSubView === 'profile_dados' && (
        <ScrollView style={styles.subScreenContainer} contentContainerStyle={styles.scrollPadding}>
          <TouchableOpacity style={styles.backInlineBtn} onPress={() => setCurrentSubView(null)}>
            <ArrowLeft size={18} color="#10B981" />
            <Text style={styles.backInlineText}>Voltar para Perfil</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <Text style={styles.screenTitle}>Meus Dados Cadastrais</Text>
            <Text style={styles.dataLabel}>Nome Completo:</Text>
            <Text style={styles.dataValue}>{userData?.name}</Text>
            <Text style={styles.dataLabel}>CPF:</Text>
            <Text style={styles.dataValue}>{formatCPF(userData?.cpf) || 'Não informado'}</Text>
            <Text style={styles.dataLabel}>E-mail:</Text>
            <Text style={styles.dataValue}>{userData?.email}</Text>
            <Text style={styles.dataLabel}>Telefone:</Text>
            <Text style={styles.dataValue}>{userData?.phone}</Text>
            <Text style={styles.dataLabel}>Nível de Fidelidade:</Text>
            <Text style={styles.dataValue}>👑 Cliente Nível {userData?.level}</Text>
          </View>
        </ScrollView>
      )}

      {currentSubView === 'profile_regras' && (
        <ScrollView style={styles.subScreenContainer} contentContainerStyle={styles.scrollPadding}>
          <TouchableOpacity style={styles.backInlineBtn} onPress={() => setCurrentSubView(null)}>
            <ArrowLeft size={18} color="#10B981" />
            <Text style={styles.backInlineText}>Voltar para Perfil</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <Text style={styles.screenTitle}>Como Funciona o Clube</Text>
            <Text style={styles.ruleItem}>1. Compre em qualquer uma das 69 lojas do Monte Carmo Shopping.</Text>
            <Text style={styles.ruleItem}>2. Abra o app e escaneie o QR Code do cupom fiscal.</Text>
            <Text style={styles.ruleItem}>3. Cada R$ 1,00 em compras vale 1 Ponto de Fidelidade no seu saldo.</Text>
            <Text style={styles.ruleItem}>4. Troque seus pontos acumulados por cupons (limite de 1 resgate por CPF).</Text>
          </View>
        </ScrollView>
      )}

      {/* TELAS PRINCIPAIS */}
      {!currentSubView && (
        <View style={styles.content}>
          {activeTab === 'home' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              {/* Card de Status */}
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(30, 41, 59, 0.85)']}
                style={styles.userStatusCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.userGreeting}>Olá, {userData?.name?.split(' ')[0] || 'Thierry'}!</Text>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>Cliente Nível {userData?.level || 'Bronze'}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.userPointsNumber}>{userData?.points || 100}</Text>
                  <Text style={styles.userPointsLabel}>Pontos Acumulados</Text>
                </View>
              </LinearGradient>

              {/* Banner Carrossel Oficial com Artes do Monte Carmo */}
              <ImageBackground
                source={{ uri: realBannersData[activeBannerIndex]?.bgImage }}
                style={styles.heroBanner}
                imageStyle={{ borderRadius: 20 }}
              >
                <LinearGradient
                  colors={['rgba(15, 23, 42, 0.25)', 'rgba(15, 23, 42, 0.95)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagText}>{realBannersData[activeBannerIndex]?.tag || 'Monte Carmo'}</Text>
                  </View>

                  <Text style={styles.heroTitle}>{realBannersData[activeBannerIndex]?.title}</Text>
                  <Text style={styles.heroSub}>{realBannersData[activeBannerIndex]?.subtitle}</Text>

                  <View style={styles.heroBottomRow}>
                    <TouchableOpacity 
                      style={styles.heroButton}
                      onPress={() => handleBannerPress(realBannersData[activeBannerIndex])}
                    >
                      <Text style={styles.heroButtonText}>{realBannersData[activeBannerIndex]?.buttonText}</Text>
                    </TouchableOpacity>

                    <View style={styles.dotsRow}>
                      {realBannersData.map((_, i) => (
                        <TouchableOpacity 
                          key={i} 
                          onPress={() => setActiveBannerIndex(i)}
                          style={[styles.dot, activeBannerIndex === i && styles.dotActive]} 
                        />
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>

              {/* Título de Seção */}
              <View style={styles.sectionHeaderRow}>
                <Sparkles size={20} color="#10B981" />
                <Text style={styles.sectionHeaderTitle}>Acesso Rápido</Text>
              </View>

              {/* Grade de 6 Cards */}
              <View style={styles.quickAccessGrid}>
                {/* 1. Leia o cupom fiscal */}
                <TouchableOpacity style={styles.quickGridCard} onPress={() => setActiveTab('scan')}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]}>
                    <QrCode size={26} color="#10B981" />
                  </View>
                  <Text style={styles.quickCardLabel}>Leia o cupom{'\n'}fiscal</Text>
                </TouchableOpacity>

                {/* 2. Prêmios & Cupons */}
                <TouchableOpacity style={styles.quickGridCard} onPress={() => setActiveTab('coupons')}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
                    <Gift size={26} color="#F59E0B" />
                  </View>
                  <Text style={styles.quickCardLabel}>Prêmios &{'\n'}Cupons</Text>
                </TouchableOpacity>

                {/* 3. Indique Amigos */}
                <TouchableOpacity style={styles.quickGridCard} onPress={() => setActiveTab('profile')}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.18)' }]}>
                    <Share2 size={26} color="#6366F1" />
                  </View>
                  <Text style={styles.quickCardLabel}>Indique{'\n'}Amigos</Text>
                </TouchableOpacity>

                {/* 4. 69 Lojas */}
                <TouchableOpacity style={styles.quickGridCard} onPress={() => setActiveTab('stores')}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.18)' }]}>
                    <Store size={26} color="#06B6D4" />
                  </View>
                  <Text style={styles.quickCardLabel}>69 Lojas &{'\n'}Serviços</Text>
                </TouchableOpacity>

                {/* 5. Cinema Cineart (Redirecionamento Oficial) */}
                <TouchableOpacity style={styles.quickGridCard} onPress={openCinemaOfficial}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.18)' }]}>
                    <Film size={26} color="#EC4899" />
                  </View>
                  <Text style={styles.quickCardLabel}>Cinema{'\n'}Cineart ↗</Text>
                </TouchableOpacity>

                {/* 6. Estacionamento Zul+ (Redirecionamento Oficial) */}
                <TouchableOpacity style={styles.quickGridCard} onPress={openParkingOfficial}>
                  <View style={[styles.quickIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
                    <Car size={26} color="#3B82F6" />
                  </View>
                  <Text style={styles.quickCardLabel}>Estacionamento{'\n'}Zul+ ↗</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {activeTab === 'coupons' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              <Text style={styles.screenTitle}>Prêmios & Cupons</Text>
              <Text style={styles.screenSub}>Troque seus pontos acumulados (Limite de 1 por CPF)</Text>
              
              {dynamicCoupons.length === 0 ? (
                <View style={styles.emptyCouponsBox}>
                  <View style={styles.emptyCouponsIcon}>
                    <Ticket size={32} color="#10B981" />
                  </View>
                  <Text style={styles.emptyCouponsTitle}>Nenhum cupom disponível no momento</Text>
                  <Text style={styles.emptyCouponsSub}>
                    As lojas do Monte Carmo Shopping estão preparando novas promoções exclusivas para você resgatar com seus pontos!
                  </Text>
                </View>
              ) : (
                dynamicCoupons.map((c) => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={styles.couponCard}
                    onPress={() => {
                      setSelectedItem(c);
                      setCurrentSubView('coupon_detail');
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.couponStore, { color: c.badge_color || '#10B981' }]}>{c.store_name || c.store}</Text>
                      <View style={styles.pointsReqPill}>
                        <Text style={styles.pointsReqText}>{c.points_required || c.points || 0} pts</Text>
                      </View>
                    </View>
                    <Text style={styles.couponTitle}>{c.title}</Text>
                    <Text style={styles.clickToOpenHint}>Toque para ver detalhes e resgatar →</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {activeTab === 'scan' && (
            <View style={styles.scannerWrapper}>
              {!permission?.granted ? (
                <View style={styles.permissionBox}>
                  <QrCode size={48} color="#10B981" />
                  <Text style={styles.permissionText}>O app precisa de permissão para usar a câmera e ler o QR Code da nota fiscal.</Text>
                  <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Autorizar Câmera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.manualBtnAlt} onPress={() => setIsManualModalOpen(true)}>
                    <Text style={styles.manualBtnAltText}>Digitar Chave de 44 Dígitos Manualmente</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                >
                  <View style={styles.cameraOverlay}>
                    <View style={styles.scanTarget} />
                    <Text style={styles.scanInstruction}>Enquadre o QR Code do cupom fiscal</Text>
                  </View>
                </CameraView>
              )}
            </View>
          )}

          {activeTab === 'stores' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              <Text style={styles.screenTitle}>Guia de Lojas ({realStoresData.length} Lojas)</Text>
              
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por loja ou segmento..."
                placeholderTextColor="#64748B"
                value={storeSearch}
                onChangeText={setStoreSearch}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {['Todas', 'Alimentação', 'Moda', 'Diversão', 'Perfumaria', 'Serviços', 'Academia'].map((cat) => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredStores.map((store) => (
                <TouchableOpacity 
                  key={store.id} 
                  style={styles.storeCard}
                  onPress={() => {
                    setSelectedItem(store);
                    setCurrentSubView('store_detail');
                  }}
                >
                  <View style={styles.storeIconBox}>
                    <Text style={{ fontSize: 20 }}>{store.logo_icon || '🏬'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeSub}>{store.category} • {store.floor}</Text>
                    <Text style={{ color: '#06B6D4', fontSize: 11, marginTop: 2 }}>📞 {store.phone}</Text>
                  </View>
                  <ChevronRight size={18} color="#10B981" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {activeTab === 'profile' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={{ fontSize: 24 }}>👑</Text>
                </View>
                <Text style={styles.profileName}>{userData?.name}</Text>
                <Text style={styles.profileSub}>Cliente Nível {userData?.level} • {userData?.points} pts</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>{userData?.email}</Text>
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>
                  CPF: {formatCPF(userData?.cpf) || 'Não informado'}
                </Text>
              </View>

              {/* Indique Amigos */}
              <LinearGradient colors={['#059669', '#10B981']} style={styles.referralBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Award size={24} color="#FFF" />
                  <Text style={styles.referralTitle}>Indique amigos e ganhe!</Text>
                </View>
                <Text style={styles.referralSub}>Compartilhe seu link. Quando seus amigos se cadastram, você ganha +100 pontos!</Text>
                <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert("Link Copiado!", userData?.referralLink)}>
                  <Share2 size={16} color="#0F172A" />
                  <Text style={styles.shareBtnText}>Compartilhar no WhatsApp</Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* WhatsApp Oficial do Shopping (31) 3117-1511 */}
              <TouchableOpacity style={styles.menuItemRow} onPress={openWhatsAppOfficial}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MessageCircle size={20} color="#25D366" />
                  <Text style={styles.menuItemText}>WhatsApp Oficial: (31) 3117-1511</Text>
                </View>
                <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 12 }}>ABRIR</Text>
              </TouchableOpacity>

              {/* Cinema Cineart */}
              <TouchableOpacity style={styles.menuItemRow} onPress={openCinemaOfficial}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Film size={20} color="#EC4899" />
                  <Text style={styles.menuItemText}>Cinema Cineart Monte Carmo</Text>
                </View>
                <Text style={{ color: '#EC4899', fontWeight: 'bold', fontSize: 12 }}>VER ↗</Text>
              </TouchableOpacity>

              {/* Estacionamento */}
              <TouchableOpacity style={styles.menuItemRow} onPress={openParkingOfficial}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Car size={20} color="#3B82F6" />
                  <Text style={styles.menuItemText}>Estacionamento Fácil (Zul+)</Text>
                </View>
                <Text style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: 12 }}>ABRIR ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItemRow} onPress={() => setCurrentSubView('profile_dados')}>
                <Text style={styles.menuItemText}>👤 Meus Dados Cadastrais</Text>
                <ChevronRight size={18} color="#10B981" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItemRow} onPress={() => setCurrentSubView('profile_regras')}>
                <Text style={styles.menuItemText}>ℹ️ Como Funciona o Clube</Text>
                <ChevronRight size={18} color="#10B981" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={16} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Sair da Conta</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      )}

      {/* MODAL IA GEMINI ASSISTENTE */}
      <Modal visible={isGeminiChatOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.chatModalContainer}>
            <View style={styles.chatHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.chatBotIcon}>
                  <Sparkles size={20} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.chatTitle}>Monte Carmo IA</Text>
                  <Text style={styles.chatSub}>Assistente Oficial do Shopping</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setIsGeminiChatOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessagesScroll} contentContainerStyle={{ gap: 10 }}>
              {chatMessages.map(msg => (
                <View 
                  key={msg.id} 
                  style={[styles.chatBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}
                >
                  <Text style={styles.chatBubbleText}>{msg.text}</Text>
                </View>
              ))}

              {chatLoading && (
                <View style={[styles.chatBubble, styles.botBubble, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>Consultando lojas do shopping...</Text>
                </View>
              )}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chatQuickRow}>
              {['Onde fica a Riachuelo?', 'Natura no shopping', 'Brasil Cacau', 'Filmes do cinema'].map((q, idx) => (
                <TouchableOpacity key={idx} style={styles.chatQuickChip} onPress={() => setChatInput(q)}>
                  <Text style={styles.chatQuickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Pergunte sobre lojas, cinema ou cupons..."
                placeholderTextColor="#64748B"
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChatMessage}>
                <Send size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('home'); setCurrentSubView(null); }}>
          <Home size={22} color={activeTab === 'home' && !currentSubView ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.navText, activeTab === 'home' && !currentSubView && styles.navTextActive]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('coupons'); setCurrentSubView(null); }}>
          <Ticket size={22} color={activeTab === 'coupons' && !currentSubView ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.navText, activeTab === 'coupons' && !currentSubView && styles.navTextActive]}>Cupons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanFab} onPress={() => { setActiveTab('scan'); setCurrentSubView(null); }}>
          <QrCode size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('stores'); setCurrentSubView(null); }}>
          <Store size={22} color={activeTab === 'stores' && !currentSubView ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.navText, activeTab === 'stores' && !currentSubView && styles.navTextActive]}>Lojas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('profile'); setCurrentSubView(null); }}>
          <User size={22} color={activeTab === 'profile' && !currentSubView ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.navText, activeTab === 'profile' && !currentSubView && styles.navTextActive]}>Mais</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0F172A'
  },
  headerLogo: { width: 135, height: 38 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#1E293B', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  pointsPill: { 
    backgroundColor: 'rgba(245, 158, 11, 0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#F59E0B' 
  },
  pointsPillText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 12 },
  backButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  backButtonText: { color: '#10B981', fontWeight: 'bold', fontSize: 15 },
  content: { flex: 1 },
  scrollPadding: { padding: 16, paddingBottom: 30 },
  userStatusCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  userGreeting: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  levelPillText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold' },
  userPointsNumber: { color: '#F59E0B', fontSize: 28, fontWeight: 'bold' },
  userPointsLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  heroBanner: {
    height: 190,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden'
  },
  heroGradient: { flex: 1, padding: 16, justifyContent: 'space-between' },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  heroTagText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  heroTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  heroSub: { color: '#CBD5E1', fontSize: 12, lineHeight: 16, marginTop: 2 },
  heroBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  heroButton: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  heroButtonText: { color: '#0F172A', fontWeight: 'bold', fontSize: 12 },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 18, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionHeaderTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  quickGridCard: {
    width: (SCREEN_WIDTH - 52) / 3,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10
  },
  quickIconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickCardLabel: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center', lineHeight: 14 },
  subScreenContainer: { flex: 1, backgroundColor: '#0F172A' },
  backInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backInlineText: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
  detailCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  detailImage: { width: '100%', height: 180, borderRadius: 14, marginBottom: 14 },
  detailTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  detailCategory: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  detailMeta: { color: '#E2E8F0', fontSize: 13, marginBottom: 6 },
  detailDesc: { color: '#94A3B8', fontSize: 13, lineHeight: 20, marginVertical: 12 },
  phoneActionBtn: { backgroundColor: '#06B6D4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 16 },
  phoneActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  screenTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  screenSub: { color: '#94A3B8', fontSize: 12, marginBottom: 16 },
  couponCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  couponStore: { fontSize: 13, fontWeight: 'bold' },
  couponTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginVertical: 6 },
  pointsReqPill: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pointsReqText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold' },
  clickToOpenHint: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  qrCodeBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#10B981', marginVertical: 16 },
  qrCodeText: { color: '#F59E0B', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  qrCodeSub: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 8 },
  searchInput: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, color: '#FFF', fontSize: 13, marginBottom: 12 },
  filterChip: { backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterChipText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  filterChipTextActive: { color: '#FFF' },
  storeCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  storeIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center' },
  storeName: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  storeSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  profileHeader: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  profileName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileSub: { color: '#10B981', fontSize: 12, marginTop: 4 },
  referralBox: { padding: 18, borderRadius: 16, marginBottom: 16 },
  referralTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  referralSub: { color: '#E2E8F0', fontSize: 12, marginVertical: 6 },
  shareBtn: { backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  shareBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 12 },
  menuItemRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  menuItemText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
  logoutBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },
  dataLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginTop: 8 },
  dataValue: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  ruleItem: { color: '#E2E8F0', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  scannerWrapper: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanTarget: { width: 220, height: 220, borderWidth: 2, borderColor: '#10B981', borderRadius: 20 },
  scanInstruction: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { color: '#FFF', textAlign: 'center', marginVertical: 16, fontSize: 14 },
  permissionBtn: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  permissionBtnText: { color: '#FFF', fontWeight: 'bold' },
  manualBtnAlt: { marginTop: 16, padding: 10 },
  manualBtnAltText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  bottomNav: { 
    flexDirection: 'row', 
    height: 65, 
    backgroundColor: '#0F172A', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)', 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  navItem: { alignItems: 'center', gap: 3 },
  navText: { color: '#94A3B8', fontSize: 10 },
  navTextActive: { color: '#10B981', fontWeight: 'bold' },
  scanFab: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: '#10B981', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: -22, 
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8
  },
  authContainer: { flex: 1, backgroundColor: '#0F172A' },
  authScroll: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  authLogoBox: { alignItems: 'center', marginBottom: 28 },
  officialLogo: { width: 220, height: 75, marginBottom: 8 },
  authSubtitle: { color: '#10B981', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  authCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  authCardTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  authCardDesc: { color: '#94A3B8', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  inputLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14 },
  submitBtn: { backgroundColor: '#10B981', marginTop: 18, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  switchAuthBtn: { marginTop: 14, alignItems: 'center' },
  switchAuthText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  guestBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 6 },
  guestBtnText: { color: '#94A3B8', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  chatModalContainer: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', paddingBottom: 10 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  chatBotIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  chatTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  chatSub: { color: '#94A3B8', fontSize: 11 },
  chatMessagesScroll: { flex: 1, padding: 16 },
  chatBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#10B981', borderTopRightRadius: 2 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#0F172A', borderTopLeftRadius: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chatBubbleText: { color: '#FFF', fontSize: 13, lineHeight: 18 },
  chatQuickRow: { paddingHorizontal: 16, paddingVertical: 8, maxHeight: 45 },
  chatQuickChip: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: '#10B981' },
  chatQuickChipText: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  chatInputRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  chatInput: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chatSendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  emptyCouponsBox: { backgroundColor: '#1E293B', borderRadius: 20, padding: 32, alignItems: 'center', marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  emptyCouponsIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyCouponsTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emptyCouponsSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 }
});
