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

const pages = ['loja.php', 'alimentacao.php', 'servico.php', 'cinema.php', 'novidade.php'];

for (const p of pages) {
  const html = await fetchText(`https://www.montecarmoshopping.com.br/${p}`);
  fs.writeFileSync(`scripts/page_${p}.html`, html, 'utf-8');
  console.log(`Baixado ${p} (tamanho: ${html.length})`);
}
