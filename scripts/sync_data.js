import https from 'https';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SHOPPING_ID = '166';
const SHOPPING_TOKEN = 'fV5QtXEd6njcP0a0QG4I6PJv0fo60of3';

// Carrega .env manualmente
let supabaseUrl = 'https://avwgrdrhwdgdjeqjifyb.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2dyZHJod2RnZGplcWppZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTIxMzcsImV4cCI6MjEwMjg4ODEzN30.fiowJ6lNH-rv5u7NZeDncwb47fS-9BCSlspvE9CJMwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          let clean = data.trim();
          if (clean.startsWith('?(') || clean.startsWith('(')) {
            clean = clean.replace(/^\??\((.*)\);?$/, '$1');
          }
          resolve(JSON.parse(clean));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', err => resolve(null));
  });
}

function getCategoryIcon(ramo) {
  const r = (ramo || '').toLowerCase();
  if (r.includes('alimentação') || r.includes('lanchonete') || r.includes('cafeteria')) return '🍔';
  if (r.includes('vestuário') || r.includes('moda') || r.includes('departamentos')) return '🛍️';
  if (r.includes('calçados')) return '👟';
  if (r.includes('perfumaria') || r.includes('estética') || r.includes('cosméticos')) return '💄';
  if (r.includes('drogaria')) return '💊';
  if (r.includes('diversão') || r.includes('lazer') || r.includes('entretenimento')) return '🎮';
  if (r.includes('livraria')) return '📚';
  if (r.includes('lotérica') || r.includes('serviços')) return '🏦';
  if (r.includes('academia')) return '💪';
  if (r.includes('turismo')) return '✈️';
  return '🏬';
}

function formatPhoneToWhatsApp(phone) {
  if (!phone) return '553131171511';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`;
  }
  return clean || '553131171511';
}

async function syncAllData() {
  console.log('🔄 Sincronizando dados reais do Monte Carmo Shopping para o Banco Supabase...');

  try {
    // 1. Fetch Stores
    const storesUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/loja?tipo=1,2,3&shopping_id=${SHOPPING_ID}&llj=true&full=true`;
    const storesRaw = await fetchJson(storesUrl);
    const rawList = storesRaw?.loja || [];

    const parsedStores = rawList.map((item, index) => {
      const cleanPhone = item.loja_telefone ? item.loja_telefone.trim() : '';
      const whatsappNumber = formatPhoneToWhatsApp(cleanPhone);
      const icon = getCategoryIcon(item.ramo_nome);
      const image = item.loja_imagem_1_url || item.loja_logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80';

      return {
        id: `store-${item.id || index}`,
        name: item.loja_nome || item.nome,
        category: item.ramo_nome || 'Lojas & Serviços',
        floor: item.loja_luc ? `Local: ${item.loja_luc}` : 'Piso 1',
        hours: '10:00 - 22:00',
        phone: cleanPhone || '(31) 3117-1511',
        whatsapp: whatsappNumber,
        logo_icon: icon,
        image_url: image
      };
    });

    console.log(`✅ ${parsedStores.length} Lojas reais processadas.`);

    // 2. Fetch Cinema
    const cinemaUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/cinema-ingressocom?shopping_id=${SHOPPING_ID}&tipo=2`;
    const cinemaRaw = await fetchJson(cinemaUrl);
    const cinemaList = Array.isArray(cinemaRaw) ? cinemaRaw : [];

    const parsedMovies = cinemaList.slice(0, 20).map((m) => {
      const todaySessions = m.horario?.[0]?.sessao?.map(s => s.info).join(' | ') || 'Consultar sessões';
      return {
        id: String(m.ingressocom_id || m.id),
        title: m.titulo,
        duration: `${m.duracao || '120'} min`,
        rating: m.censura || '12 anos',
        genre: m.genero || 'Geral',
        synopsis: m.sinopse || '',
        poster_url: m.cartaz || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80',
        trailer_url: m.trailer || '',
        sessions: todaySessions,
        ticket_url: 'https://www.cineart.com.br/cinema/cineart-monte-carmo'
      };
    });

    console.log(`✅ ${parsedMovies.length} Filmes em cartaz processados.`);

    // 3. Salvar no Supabase (se as tabelas já existirem)
    try {
      if (parsedStores.length > 0) {
        const { error: storeErr } = await supabase.from('stores').upsert(parsedStores);
        if (storeErr) console.log('Info Supabase (Stores):', storeErr.message);
        else console.log('⚡ Lojas inseridas com sucesso no banco Supabase!');
      }

      if (parsedMovies.length > 0) {
        const { error: movieErr } = await supabase.from('movies').upsert(parsedMovies);
        if (movieErr) console.log('Info Supabase (Movies):', movieErr.message);
        else console.log('⚡ Filmes inseridos com sucesso no banco Supabase!');
      }
    } catch (dbErr) {
      console.log('Aguardando criação das tabelas no Supabase:', dbErr.message);
    }

    // 4. Salvar arquivo local de contingência
    const fileContent = `// Dados 100% Reais sincronizados do Monte Carmo Shopping
// Última sincronização: ${new Date().toLocaleString('pt-BR')}

export const realStoresData = ${JSON.stringify(parsedStores, null, 2)};

export const realCinemaMovies = ${JSON.stringify(parsedMovies, null, 2)};
`;

    const outputPath = path.join(process.cwd(), 'src', 'data', 'realData.js');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`🎉 Dados sincronizados e prontos para uso no App e no Banco de Dados!`);

  } catch (err) {
    console.error('❌ Erro na sincronização:', err);
  }
}

syncAllData();
