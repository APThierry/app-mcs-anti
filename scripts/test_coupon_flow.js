import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avwgrdrhwdgdjeqjifyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2dyZHJod2RnZGplcWppZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTIxMzcsImV4cCI6MjEwMjg4ODEzN30.fiowJ6lNH-rv5u7NZeDncwb47fS-9BCSlspvE9CJMwM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCouponFlow() {
  console.log('🧪 Testando inserção de novo cupom no Supabase...');

  const newCoupon = {
    store_name: 'Burger King',
    store_category: 'Alimentação',
    title: 'Cupom de Teste Sistema 100%',
    description: 'Válido para consumo no local no Monte Carmo.',
    discount: '15% OFF',
    points_required: 100,
    is_free: false,
    min_level: 'Bronze',
    code_prefix: 'BK-TESTE',
    expiry_date: '2026-12-31',
    badge_color: '#10B981',
    image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
    is_active: true
  };

  const { data, error } = await supabase.from('coupons').insert([newCoupon]).select();
  if (error) {
    console.error('❌ Erro ao inserir cupom:', error.message);
  } else {
    console.log('✅ Cupom inserido com sucesso no banco de dados Supabase:', data);
    // Limpa o cupom de teste para manter a base limpa
    await supabase.from('coupons').delete().eq('id', data[0].id);
    console.log('🧹 Cupom de teste removido após validação.');
  }
}

testCouponFlow();
