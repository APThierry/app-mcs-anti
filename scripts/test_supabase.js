import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avwgrdrhwdgdjeqjifyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2dyZHJod2RnZGplcWppZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTIxMzcsImV4cCI6MjEwMjg4ODEzN30.fiowJ6lNH-rv5u7NZeDncwb47fS-9BCSlspvE9CJMwM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');

  const { data: coupons, error: cErr } = await supabase.from('coupons').select('*');
  console.log('Tabela coupons:', cErr ? `Erro: ${cErr.message}` : `${coupons?.length || 0} registros encontrados`);

  const { data: stores, error: sErr } = await supabase.from('stores').select('*');
  console.log('Tabela stores:', sErr ? `Erro: ${sErr.message}` : `${stores?.length || 0} registros encontrados`);

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('Tabela profiles:', pErr ? `Erro: ${pErr.message}` : `${profiles?.length || 0} registros encontrados`);

  const { data: receipts, error: rErr } = await supabase.from('receipts').select('*');
  console.log('Tabela receipts:', rErr ? `Erro: ${rErr.message}` : `${receipts?.length || 0} registros encontrados`);
}

testConnection();
