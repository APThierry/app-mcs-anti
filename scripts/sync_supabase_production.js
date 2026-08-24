import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { realStoresData, realCinemaMovies } from '../src/data/realData.js';

// Lê o arquivo .env manualmente
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

if (!supabaseKey) {
  console.error('❌ Supabase Key não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncProductionDatabase() {
  console.log('🚀 Conectando ao Supabase:', supabaseUrl);
  console.log('--------------------------------------------------');

  // 1. SINCRONIZAR 69 LOJAS OFICIAIS (COM RIACHUELO, MOREIRA, BRASIL CACAU, CADILLAC PIZZA, NATURA, MODA)
  console.log(`🏬 Sincronizando ${realStoresData.length} Lojas Oficiais no Supabase...`);
  try {
    const storesPayload = realStoresData.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      floor: s.floor,
      hours: s.hours || '10:00 - 22:00',
      phone: s.phone || '(31) 3117-1511',
      logo_icon: s.logo_icon || '🏬',
      image_url: s.image_url
    }));

    const { data: storesRes, error: storesErr } = await supabase
      .from('stores')
      .upsert(storesPayload, { onConflict: 'id' });

    if (storesErr) {
      console.warn('ℹ️ Tabela stores:', storesErr.message);
    } else {
      console.log(`✅ ${realStoresData.length} Lojas oficiais sincronizadas com sucesso no Supabase!`);
    }
  } catch (e) {
    console.warn('ℹ️ Erro stores:', e.message);
  }

  // 2. SINCRONIZAR FILMES DO CINEART
  console.log(`🎬 Sincronizando ${realCinemaMovies.length} Filmes do Cineart...`);
  try {
    const moviesPayload = realCinemaMovies.map(m => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
      rating: m.rating,
      genre: m.genre,
      synopsis: m.synopsis,
      poster_url: m.poster_url,
      sessions: m.sessions,
      ticket_url: m.ticket_url
    }));

    const { data: moviesRes, error: moviesErr } = await supabase
      .from('movies')
      .upsert(moviesPayload, { onConflict: 'id' });

    if (moviesErr) {
      console.warn('ℹ️ Tabela movies:', moviesErr.message);
    } else {
      console.log(`✅ ${realCinemaMovies.length} Filmes do Cineart sincronizados com sucesso no Supabase!`);
    }
  } catch (e) {
    console.warn('ℹ️ Erro movies:', e.message);
  }

  // 3. SINCRONIZAR CUPONS OFICIAIS DO SHOPPING
  console.log('🎟️ Sincronizando Cupons Oficiais no Supabase...');
  try {
    const initialCoupons = [
      {
        store_name: 'Burger King',
        store_category: 'Alimentação',
        title: '2 Whopper Jr. + 2 Batatas Média + Refil Grátis',
        description: 'Apresente este código no caixa do Burger King no Monte Carmo Shopping para validar a oferta.',
        discount: 'Combo R$ 25,00',
        points_required: 150,
        is_free: false,
        min_level: 'Bronze',
        code_prefix: 'BK-MC25',
        expiry_date: '2026-12-31',
        badge_color: '#F59E0B',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      },
      {
        store_name: 'Cacau Show',
        store_category: 'Alimentação',
        title: '20% OFF em Trufas Artesanais e Linha LaCreme',
        description: 'Desconto exclusivo de balcão válido para compras acima de R$ 50,00.',
        discount: '20% OFF',
        points_required: 200,
        is_free: false,
        min_level: 'Bronze',
        code_prefix: 'CACAU-MC20',
        expiry_date: '2026-12-31',
        badge_color: '#10B981',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      },
      {
        store_name: 'BoliXe Monte Carmo',
        store_category: 'Diversão',
        title: '30% de Desconto na 1ª Hora de Boliche',
        description: 'Válido de terça a quinta-feira para pistas com até 6 jogadores.',
        discount: '30% OFF',
        points_required: 300,
        is_free: false,
        min_level: 'Bronze',
        code_prefix: 'BOLIXE-MC30',
        expiry_date: '2026-12-31',
        badge_color: '#6366F1',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      },
      {
        store_name: 'Cineart Monte Carmo',
        store_category: 'Diversão',
        title: '1 Pipoca Grande Salgada Grátis',
        description: 'Válido na bomboniere do Cineart na compra de 2 ingressos para qualquer sessão.',
        discount: 'Pipoca Grátis',
        points_required: 100,
        is_free: false,
        min_level: 'Bronze',
        code_prefix: 'CINEART-MC',
        expiry_date: '2026-12-31',
        badge_color: '#EC4899',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      },
      {
        store_name: 'Riachuelo',
        store_category: 'Moda',
        title: 'R$ 30 OFF em Compras acima de R$ 150',
        description: 'Válido para todo o setor de moda masculina, feminina e infantil no Monte Carmo.',
        discount: 'R$ 30 OFF',
        points_required: 250,
        is_free: false,
        min_level: 'Prata',
        code_prefix: 'RIACH-30',
        expiry_date: '2026-12-31',
        badge_color: '#3B82F6',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      },
      {
        store_name: 'Natura',
        store_category: 'Perfumaria',
        title: '15% OFF na Linha Ekos e Tododia',
        description: 'Desconto direto no balcão da loja oficial Natura Monte Carmo.',
        discount: '15% OFF',
        points_required: 150,
        is_free: false,
        min_level: 'Bronze',
        code_prefix: 'NATURA-15',
        expiry_date: '2026-12-31',
        badge_color: '#10B981',
        image_url: 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
        is_active: true
      }
    ];

    // Checa cupons existentes
    const { data: existingCoupons } = await supabase.from('coupons').select('id, code_prefix');
    const existingPrefixes = new Set((existingCoupons || []).map(c => c.code_prefix));

    const toInsert = initialCoupons.filter(c => !existingPrefixes.has(c.code_prefix));

    if (toInsert.length > 0) {
      const { data: inserted, error: coupErr } = await supabase.from('coupons').insert(toInsert).select();
      if (coupErr) {
        console.warn('ℹ️ Inserção de cupons:', coupErr.message);
      } else {
        console.log(`✅ ${inserted.length} Novos Cupons inseridos no Supabase!`);
      }
    } else {
      console.log('ℹ️ Todos os cupons oficiais já existem no Supabase.');
    }
  } catch (e) {
    console.warn('ℹ️ Erro cupons:', e.message);
  }

  // 4. CONSULTA E VERIFICAÇÃO FINAL
  console.log('--------------------------------------------------');
  try {
    const { count: countCoupons } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
    const { count: countStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    console.log(`📊 TOTAL NO BANCO DE DADOS: ${countStores || 0} Lojas | ${countCoupons || 0} Cupons Ativos`);
  } catch (e) {}

  console.log('🎉 Sincronização do Banco de Dados Supabase concluída!');
}

syncProductionDatabase();
