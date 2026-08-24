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

const jsLoja = await fetchText('https://www.montecarmoshopping.com.br/assets/js/loja.js?v=1.1');
console.log('=== loja.js ===');
console.log(jsLoja);

const jsCinema = await fetchText('https://www.montecarmoshopping.com.br/assets/js/cinema.js');
console.log('=== cinema.js ===');
console.log(jsCinema);
