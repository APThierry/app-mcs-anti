import { supabase, isSupabaseConfigured } from './supabase';
import { initialUserData, initialReceiptsData, notificationsData } from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'mcs_user_profile',
  RECEIPTS: 'mcs_receipts',
  COUPONS: 'mcs_coupons',
  REDEMPTIONS: 'mcs_redemptions',
  NOTIFICATIONS: 'mcs_notifications'
};

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
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Fallback perfil:', e.message);
      }
    }
    return getLocalItem(STORAGE_KEYS.USER, initialUserData);
  },

  async updateUserProfile(updates) {
    if (isSupabaseConfigured && updates.email) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([updates], { onConflict: 'email' })
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Erro ao atualizar perfil no Supabase:', e.message);
      }
    }
    const current = getLocalItem(STORAGE_KEYS.USER, initialUserData);
    const updated = { ...current, ...updates };
    setLocalItem(STORAGE_KEYS.USER, updated);
    return updated;
  },

  async addPoints(pointsToAdd) {
    const current = await this.getUserProfile();
    const newPoints = (current.points || 0) + pointsToAdd;
    
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
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Erro ao buscar notas do Supabase:', e.message);
      }
    }
    return getLocalItem(STORAGE_KEYS.RECEIPTS, initialReceiptsData);
  },

  async addReceipt(receiptData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .insert([{
            store_name: receiptData.store_name || receiptData.storeName || 'Loja Monte Carmo',
            amount: parseFloat(receiptData.amount) || 50.00,
            points_earned: parseInt(receiptData.points_earned || receiptData.pointsEarned) || 50,
            access_key_44: receiptData.access_key_44 || null,
            status: receiptData.status || 'Aprovada'
          }])
          .select()
          .single();

        if (!error && data) {
          await this.addPoints(data.points_earned || 0);
          return data;
        }
      } catch (e) {
        console.warn('Fallback ao inserir nota:', e.message);
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

  // =========================================================================
  // CUPONS & PROMOÇÕES CADASTRADAS PELOS LOJISTAS NO BANCO DE DADOS
  // =========================================================================
  async getCoupons() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setLocalItem(STORAGE_KEYS.COUPONS, data);
          return data;
        }
      } catch (e) {
        console.warn('Erro ao buscar cupons do Supabase:', e.message);
      }
    }

    const local = getLocalItem(STORAGE_KEYS.COUPONS, []);
    return local;
  },

  // Cadastra um novo cupom no Supabase quando o Lojista salva
  async addCoupon(couponData) {
    const cleanPayload = {
      store_name: couponData.store_name,
      store_category: couponData.store_category || 'Lojas & Serviços',
      title: couponData.title,
      description: couponData.description,
      discount: couponData.discount,
      points_required: parseInt(couponData.points_required, 10) || 0,
      is_free: Boolean(couponData.is_free),
      min_level: couponData.min_level || 'Bronze',
      code_prefix: (couponData.code_prefix || 'MC').toUpperCase(),
      expiry_date: couponData.expiry_date || '2026-12-31',
      badge_color: couponData.badge_color || '#10B981',
      image_url: couponData.image_url || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
      is_active: true
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .insert([cleanPayload])
          .select()
          .single();

        if (!error && data) {
          const current = await this.getCoupons();
          setLocalItem(STORAGE_KEYS.COUPONS, [data, ...current]);
          return data;
        }
      } catch (e) {
        console.warn('Erro ao cadastrar cupom no Supabase:', e.message);
      }
    }

    const localObj = { ...cleanPayload, id: `local-${Date.now()}` };
    const current = await this.getCoupons();
    const updated = [localObj, ...current];
    setLocalItem(STORAGE_KEYS.COUPONS, updated);
    return localObj;
  },

  // Remove ou desativa um cupom do lojista no Supabase
  async deleteCoupon(couponId) {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('coupons')
          .delete()
          .eq('id', couponId);
      } catch (e) {
        console.warn('Erro ao deletar cupom no Supabase:', e.message);
      }
    }

    const current = await this.getCoupons();
    const updated = current.filter(c => c.id !== couponId);
    setLocalItem(STORAGE_KEYS.COUPONS, updated);
    return updated;
  },

  async redeemCoupon(coupon) {
    const user = await this.getUserProfile();
    const pointsRequired = coupon.points_required !== undefined ? coupon.points_required : (coupon.pointsRequired || 0);
    const isFree = coupon.is_free || pointsRequired === 0;

    if (!isFree && (user.points || 0) < pointsRequired) {
      throw new Error(`Pontos insuficientes. Você possui ${user.points || 0} pts.`);
    }

    if (!isFree) {
      await this.updateUserProfile({
        ...user,
        points: (user.points || 0) - pointsRequired
      });
    }

    const voucherCode = `${coupon.code_prefix || coupon.code || 'MC'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const redemption = {
      id: `RED-${Date.now()}`,
      couponId: coupon.id,
      storeName: coupon.store_name || coupon.storeName,
      title: coupon.title,
      voucherCode: voucherCode,
      status: 'Ativo',
      redeemedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('coupon_redemptions').insert([{
          coupon_id: coupon.id?.includes('-') ? coupon.id : null,
          store_name: coupon.store_name || coupon.storeName,
          voucher_code: voucherCode,
          customer_name: user.name || 'Cliente Monte Carmo',
          customer_email: user.email,
          status: 'Ativo'
        }]);
      } catch (e) {
        console.warn('Erro ao salvar resgate no Supabase:', e.message);
      }
    }

    const currentRedemptions = getLocalItem(STORAGE_KEYS.REDEMPTIONS, []);
    setLocalItem(STORAGE_KEYS.REDEMPTIONS, [redemption, ...currentRedemptions]);
    return redemption;
  },

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================
  async getNotifications() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Erro ao buscar notificações:', e.message);
      }
    }
    return getLocalItem(STORAGE_KEYS.NOTIFICATIONS, notificationsData);
  }
};
