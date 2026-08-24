import https from 'https';
import fs from 'fs';
import path from 'path';

const SHOPPING_ID = '166';
const SHOPPING_TOKEN = 'fV5QtXEd6njcP0a0QG4I6PJv0fo60of3';

const endpoints = {
  stores: `https://api-public.madnezz.com.br/api/v1/public/sites/loja?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`,
  banners: `https://api-public.madnezz.com.br/api/v1/public/sites/banner?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`,
  events: `https://api-public.madnezz.com.br/api/v1/public/sites/novidade?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`,
  cinema: `https://api-public.madnezz.com.br/api/v1/public/sites/cinema?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`,
  coupons: `https://api-public.madnezz.com.br/api/v1/public/sites/cupom?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data, error: e.message });
        }
      });
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  console.log('--- Iniciando Extração de Dados Reais do Monte Carmo Shopping ---');

  for (const [key, url] of Object.entries(endpoints)) {
    try {
      console.log(`Buscando ${key}... (${url})`);
      const result = await fetchJson(url);
      const filename = path.join('scripts', `data_${key}.json`);
      fs.writeFileSync(filename, JSON.stringify(result, null, 2), 'utf-8');
      console.log(`✔ Salvo em ${filename} (${Array.isArray(result) ? result.length : (result.data ? result.data.length : 'OK')})`);
    } catch (err) {
      console.error(`Erro ao buscar ${key}:`, err.message);
    }
  }

  console.log('--- Concluído com sucesso! ---');
}

run();
