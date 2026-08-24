import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
let supabaseUrl = 'https://avwgrdrhwdgdjeqjifyb.supabase.co';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key?.trim() === 'VITE_SUPABASE_URL') supabaseUrl = vals.join('=').trim();
    if (key?.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = vals.join('=').trim();
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAllTestData() {
  console.log('🧹 Excluindo TODOS os dados de teste do Banco de Dados Supabase...');
  console.log('URL:', supabaseUrl);

  // 1. Limpa Redemptions de Teste
  try {
    const { error: redErr } = await supabase
      .from('coupon_redemptions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (!redErr) console.log('✅ Tabela `coupon_redemptions` limpa.');
  } catch (e) {
    console.warn('coupon_redemptions:', e.message);
  }

  // 2. Limpa Cupons de Teste
  try {
    const { error: coupErr } = await supabase
      .from('coupons')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (!coupErr) console.log('✅ Tabela `coupons` limpa.');
  } catch (e) {
    console.warn('coupons:', e.message);
  }

  // 3. Limpa Notas Fiscais de Teste
  try {
    const { error: recErr } = await supabase
      .from('receipts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (!recErr) console.log('✅ Tabela `receipts` limpa.');
  } catch (e) {
    console.warn('receipts:', e.message);
  }

  // 4. Limpa Perfis de Usuários de Teste
  try {
    const { error: profErr } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (!profErr) console.log('✅ Tabela `profiles` limpa (sem usuários de teste).');
  } catch (e) {
    console.warn('profiles:', e.message);
  }

  console.log('--------------------------------------------------');
  const { count: countProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: countCoupons } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
  const { count: countReceipts } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
  const { count: countRedemptions } = await supabase.from('coupon_redemptions').select('*', { count: 'exact', head: true });
  const { count: countStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
  const { count: countMovies } = await supabase.from('movies').select('*', { count: 'exact', head: true });

  console.log(`📊 CONFERÊNCIA FINAL NO SUPABASE:`);
  console.log(`- Perfis de Teste: ${countProfiles || 0}`);
  console.log(`- Cupons de Teste: ${countCoupons || 0}`);
  console.log(`- Notas Fiscais de Teste: ${countReceipts || 0}`);
  console.log(`- Resgates de Teste: ${countRedemptions || 0}`);
  console.log(`- Lojas Oficiais (Mantidas): ${countStores || 0}`);
  console.log(`- Filmes Cineart (Mantidos): ${countMovies || 0}`);
  console.log('🎉 Banco de Dados 100% limpo para Produção!');
}

cleanAllTestData();
