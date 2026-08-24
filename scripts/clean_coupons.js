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

async function cleanCoupons() {
  console.log('🧹 Limpando todos os cupons de teste do Supabase...');
  
  // Exclui todos os cupons da tabela
  const { data, error } = await supabase
    .from('coupons')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros

  if (error) {
    console.error('❌ Erro ao limpar cupons:', error.message);
  } else {
    console.log('✅ Banco de dados limpo! 0 cupons no Supabase.');
    console.log('ℹ️ O banco agora só será preenchido quando os lojistas cadastrarem suas ofertas no Portal do Lojista.');
  }

  // Verifica contagem
  const { count } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
  console.log(`📊 Cupons Ativos no Supabase: ${count || 0}`);
}

cleanCoupons();
