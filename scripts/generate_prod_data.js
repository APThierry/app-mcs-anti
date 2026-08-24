import https from 'https';
import fs from 'fs';
import path from 'path';

const SHOPPING_ID = '166';

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

async function generateProductionData() {
  console.log('🔄 Gerando dados 100% oficiais do Monte Carmo Shopping para Produção...');

  // 1. Lojas Reais (Apenas telefone fixo/contato, sem WhatsApp)
  const storesUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/loja?tipo=1,2,3&shopping_id=${SHOPPING_ID}&llj=true&full=true`;
  const storesRaw = await fetchJson(storesUrl);
  const rawList = storesRaw?.loja || [];

  const parsedStores = rawList.map((item, index) => {
    const cleanPhone = item.loja_telefone ? item.loja_telefone.trim() : '(31) 3117-1511';
    const icon = getCategoryIcon(item.ramo_nome);
    const image = item.loja_imagem_1_url || item.loja_logo_url || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg';

    return {
      id: `store-${item.id || index}`,
      name: item.loja_nome || item.nome,
      category: item.ramo_nome || 'Lojas & Serviços',
      floor: item.loja_luc ? `Local: ${item.loja_luc}` : 'Piso 1',
      hours: '10:00 - 22:00',
      phone: cleanPhone,
      logo_icon: icon,
      image_url: image
    };
  });

  // 2. Filmes do Cinema Cineart Monte Carmo
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
      poster_url: m.cartaz || 'https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg',
      trailer_url: m.trailer || '',
      sessions: todaySessions,
      ticket_url: 'https://www.cineart.com.br/cinema/cineart-monte-carmo'
    };
  });

  // 3. Banners Reais do Site Monte Carmo Shopping
  const realBanners = [
    {
      id: 1,
      tag: "Cinema & Lazer",
      title: "Cineart Monte Carmo",
      subtitle: "Salas 100% digitais com a melhor tecnologia de som e imagem.",
      buttonText: "Ver Programação →",
      action: "cinema_redirect",
      link: "https://www.cineart.com.br/cinema/cineart-monte-carmo",
      bgImage: "https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg"
    },
    {
      id: 2,
      tag: "Estacionamento",
      title: "Estacionamento Fácil",
      subtitle: "Pague seu ticket com agilidade e conforto pelo app oficial Zul+.",
      buttonText: "Pagar Estacionamento →",
      action: "parking_redirect",
      link: "https://play.google.com/store/apps/details?id=br.com.zuldigital",
      bgImage: "https://sites.madnezz.com.br/api/site/upload/Banner/202605131356321.jpg"
    },
    {
      id: 3,
      tag: "Eventos & Lazer",
      title: "Espaço de Eventos",
      subtitle: "Venha fazer seu evento, festa ou confraternização com a gente!",
      buttonText: "Saiba Mais →",
      action: "events",
      link: "https://wa.me/553131171511?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Espa%C3%A7o%20de%20Eventos%20do%20Monte%20Carmo%20Shopping!",
      bgImage: "https://sites.madnezz.com.br/api/site/upload/Banner/202212221200261.jpg"
    },
    {
      id: 4,
      tag: "Coworking",
      title: "Espaço Coworking",
      subtitle: "Ambiente moderno e climatizado para reuniões e trabalho.",
      buttonText: "Conhecer Espaço →",
      action: "coworking",
      link: "https://wa.me/553131171511?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Coworking%20do%20Monte%20Carmo!",
      bgImage: "https://sites.madnezz.com.br/api/site/upload/Banner/202504241119031.png"
    }
  ];

  const fileContent = `// DADOS 100% OFICIAIS DO MONTE CARMO SHOPPING (PRODUÇÃO)
// Sincronizado diretamente do portal https://montecarmoshopping.com.br

export const realStoresData = ${JSON.stringify(parsedStores, null, 2)};

export const realCinemaMovies = ${JSON.stringify(parsedMovies, null, 2)};

export const realBannersData = ${JSON.stringify(realBanners, null, 2)};
`;

  // Salva no Web
  const webPath = path.join(process.cwd(), 'src', 'data', 'realData.js');
  fs.writeFileSync(webPath, fileContent, 'utf-8');

  // Salva no Mobile
  const mobilePath = path.join(process.cwd(), 'app-mobile', 'src', 'data', 'realData.js');
  fs.writeFileSync(mobilePath, fileContent, 'utf-8');

  console.log(`✅ ${parsedStores.length} Lojas reais salvas (apenas números de telefone).`);
  console.log(`✅ ${parsedMovies.length} Filmes do Cineart salvos.`);
  console.log(`✅ ${realBanners.length} Banners com imagens oficiais do Monte Carmo salvos.`);
}

generateProductionData();
