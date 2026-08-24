import https from 'https';
import fs from 'fs';

const SHOPPING_ID = '166';
const SHOPPING_TOKEN = 'fV5QtXEd6njcP0a0QG4I6PJv0fo60of3';

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Remove jsoncallback if present
          let clean = data.trim();
          if (clean.startsWith('?(') || clean.startsWith('(')) {
            clean = clean.replace(/^\??\((.*)\);?$/, '$1');
          }
          resolve(JSON.parse(clean));
        } catch (e) {
          resolve({ raw: data.substring(0, 300), error: e.message });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

// 1. Full Lojas
const storesUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/loja?tipo=1,2,3&shopping_id=${SHOPPING_ID}&llj=true&full=true`;
console.log('Buscando lojas completas...');
const storesData = await fetchJson(storesUrl);
fs.writeFileSync('scripts/real_stores_full.json', JSON.stringify(storesData, null, 2));
console.log('Lojas encontradas:', storesData?.loja?.length);

// 2. Cinema Ingresso.com
const cinemaUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/cinema-ingressocom?shopping_id=${SHOPPING_ID}&tipo=2`;
console.log('Buscando filmes em cartaz...');
const cinemaData = await fetchJson(cinemaUrl);
fs.writeFileSync('scripts/real_cinema_full.json', JSON.stringify(cinemaData, null, 2));
console.log('Filmes encontrados:', Array.isArray(cinemaData) ? cinemaData.length : cinemaData);

// 3. Banners
const bannersUrl = `https://api-public.madnezz.com.br/api/v1/public/sites/banner?shopping_id=${SHOPPING_ID}&token=${SHOPPING_TOKEN}`;
console.log('Buscando banners...');
const bannersData = await fetchJson(bannersUrl);
fs.writeFileSync('scripts/real_banners_full.json', JSON.stringify(bannersData, null, 2));
console.log('Banners encontrados:', Array.isArray(bannersData) ? bannersData.length : bannersData);
