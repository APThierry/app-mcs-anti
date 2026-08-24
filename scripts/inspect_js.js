import https from 'https';

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => resolve(err.message));
  });
}

const js = await fetchText('https://www.montecarmoshopping.com.br/assets/js/default.js?v=1.21');
console.log('Tamanho do default.js:', js.length);

// Search for 'apis.loja' or 'loja'
const matches = js.match(/apis\.\w+/g);
console.log('APIs usadas:', [...new Set(matches)]);

const lojaCode = js.substring(js.indexOf('apis.loja'), js.indexOf('apis.loja') + 400);
console.log('Trecho loja:', lojaCode);
