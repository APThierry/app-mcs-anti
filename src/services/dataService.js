import { supabase, isSupabaseConfigured } from './supabase';
import { initialUserData, initialReceiptsData, couponsData, notificationsData } from '../data/mockData';

// Chaves do LocalStorage para modo offline/local
const STORAGE_KEYS = {
  USER: 'mcs_user_profile',
  RECEIPTS: 'mcs_receipts',
  COUPONS: 'mcs_coupons',
  REDEMPTIONS: 'mcs_redemptions',
  NOTIFICATIONS: 'mcs_notifications'
};

// Helpers para LocalStorage
function getLocalItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar no LocalStorage:', e);
  }
}

export const dataService = {
  // ==========================================
  // PERFIL DO USUÁRIO
  // ==========================================
  async getUserProfile() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (!error && data) return data;
    }
    return getLocalItem(STORAGE_KEYS.USER, initialUserData);
  },

  async updateUserProfile(updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('email', updates.email)
        .select()
        .single();
      if (!error && data) return data;
    }
    const current = getLocalItem(STORAGE_KEYS.USER, initialUserData);
    const updated = { ...current, ...updates };
    setLocalItem(STORAGE_KEYS.USER, updated);
    return updated;
  },

  async addPoints(pointsToAdd) {
    const current = await this.getUserProfile();
    const newPoints = (current.points || 0) + pointsToAdd;
    
    // Atualiza nível conforme pontuação
    let newLevel = 'Bronze';
    let nextLevel = 'Prata';
    let nextPoints = 500;

    if (newPoints >= 2000) {
      newLevel = 'Diamante';
      nextLevel = 'Diamante Max';
      nextPoints = 5000;
    } else if (newPoints >= 1000) {
      newLevel = 'Ouro';
      nextLevel = 'Diamante';
      nextPoints = 2000;
    } else if (newPoints >= 400) {
      newLevel = 'Prata';
      nextLevel = 'Ouro';
      nextPoints = 1000;
    }

    return await this.updateUserProfile({
      ...current,
      points: newPoints,
      level: newLevel,
      nextLevelName: nextLevel,
      nextLevelPoints: nextPoints
    });
  },

  // ==========================================
  // NOTAS FISCAIS
  // ==========================================
  async getReceipts() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItem(STORAGE_KEYS.RECEIPTS, initialReceiptsData);
  },

  async addReceipt(receiptData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('receipts')
        .insert([receiptData])
        .select()
        .single();
      if (!error && data) {
        await this.addPoints(receiptData.points_earned || 0);
        return data;
      }
    }

    const currentReceipts = getLocalItem(STORAGE_KEYS.RECEIPTS, initialReceiptsData);
    const newReceipt = {
      id: receiptData.id || `NF-${Math.floor(100000 + Math.random() * 900000)}`,
      storeName: receiptData.store_name || receiptData.storeName,
      amount: parseFloat(receiptData.amount),
      pointsEarned: parseInt(receiptData.points_earned || receiptData.pointsEarned),
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: receiptData.status || 'Aprovada',
      statusColor: '#10B981'
    };

    const updatedList = [newReceipt, ...currentReceipts];
    setLocalItem(STORAGE_KEYS.RECEIPTS, updatedList);
    await this.addPoints(newReceipt.pointsEarned);
    return newReceipt;
  },

  // ==========================================
  // CUPONS & PRÊMIOS
  // ==========================================
  async getCoupons() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);
      if (!error && data && data.length > 0) return data;
    }
    return couponsData;
  },

  async redeemCoupon(coupon) {
    const user = await this.getUserProfile();
    if (!coupon.isFree && user.points < coupon.pointsRequired) {
      throw new Error(`Pontos insuficientes. Você possui ${user.points} pts.`);
    }

    // Deduz pontos se não for grátis
    if (!coupon.isFree) {
      await this.updateUserProfile({
        ...user,
        points: user.points - coupon.pointsRequired
      });
    }

    const redemption = {
      id: `RED-${Date.now()}`,
      couponId: coupon.id,
      storeName: coupon.storeName,
      title: coupon.title,
      voucherCode: `${coupon.code || 'MC'}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Ativo',
      redeemedAt: new Date().toISOString()
    };

    const currentRedemptions = getLocalItem(STORAGE_KEYS.REDEMPTIONS, []);
    setLocalItem(STORAGE_KEYS.REDEMPTIONS, [redemption, ...currentRedemptions]);
    return redemption;
  },

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================
  async getNotifications() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItem(STORAGE_KEYS.NOTIFICATIONS, notificationsData);
  }
};
