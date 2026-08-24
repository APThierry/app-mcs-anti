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
console.log(jsLoja.substring(0, 1500));
