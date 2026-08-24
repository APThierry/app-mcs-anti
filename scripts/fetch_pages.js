import https from 'https';
import fs from 'fs';

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => resolve(err.message));
  });
}

const htmlLojas = await fetchText('https://www.montecarmoshopping.com.br/lojas');
fs.writeFileSync('scripts/page_lojas.html', htmlLojas, 'utf-8');
console.log('Salvo page_lojas.html (tamanho:', htmlLojas.length, ')');

const htmlCinema = await fetchText('https://www.montecarmoshopping.com.br/cinema');
fs.writeFileSync('scripts/page_cinema.html', htmlCinema, 'utf-8');
console.log('Salvo page_cinema.html (tamanho:', htmlCinema.length, ')');
