// ============================================================================
// SERVIÇO DE NOTIFICAÇÕES PUSH 100% GRATUITO (EXPO PUSH API)
// ============================================================================

export const notificationService = {
  /**
   * Envia uma notificação push para o celular do usuário via Expo Push API gratuita
   * Endpoint oficial: https://exp.host/--/api/v2/push/send
   */
  async sendPushNotification(expoPushToken, title, body, data = {}) {
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
      console.log('Push local emitido:', { title, body });
      this.triggerLocalNotification(title, body);
      return { success: true, mode: 'local' };
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: 'default',
          title: title,
          body: body,
          data: data,
          badge: 1,
          priority: 'high',
          channelId: 'monte-carmo-alerts'
        }),
      });

      const result = await response.json();
      console.log('Push enviado via Expo API:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Erro ao enviar push via Expo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Dispara notificação no navegador (Web) ou alerta sonoro
   */
  triggerLocalNotification(title, body) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/imag/logo.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: body,
              icon: '/imag/logo.png'
            });
          }
        });
      }
    }
  },

  /**
   * Mensagens pré-configuradas para eventos do app
   */
  notifyReceiptApproved(amount, pointsEarned, token) {
    const title = '🎉 Nota Fiscal Aprovada!';
    const body = `Sua compra de R$ ${amount.toFixed(2)} foi validada. +${pointsEarned} pontos creditados no seu saldo!`;
    return this.sendPushNotification(token, title, body, { type: 'receipt_approved' });
  },

  notifyCouponRedeemed(storeName, discount, token) {
    const title = '🎟️ Cupom Ativado com Sucesso!';
    const body = `Você ativou ${discount} no ${storeName}. Apresente o QR Code no balcão do shopping.`;
    return this.sendPushNotification(token, title, body, { type: 'coupon_redeemed' });
  },

  notifyLevelUpgrade(newLevel, token) {
    const title = '👑 Parabéns! Novo Nível Alcançado';
    const body = `Você agora é um Cliente Nível ${newLevel} no Monte Carmo Shopping!`;
    return this.sendPushNotification(token, title, body, { type: 'level_upgrade' });
  }
};
