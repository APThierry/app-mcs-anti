import https from 'https';

const testUrls = [
  `https://api-public.madnezz.com.br/api/v1/public/sites/loja/35476?shopping_id=166&token=fV5QtXEd6njcP0a0QG4I6PJv0fo60of3`,
  `https://api-public.madnezz.com.br/api/v1/public/sites/loja?shopping_id=166&token=fV5QtXEd6njcP0a0QG4I6PJv0fo60of3&id=35476`,
  `https://api-public.madnezz.com.br/api/v1/public/sites/loja?shopping_id=166&token=fV5QtXEd6njcP0a0QG4I6PJv0fo60of3&loja_id=35476`
];

async function test(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

for (const u of testUrls) {
  const res = await test(u);
  console.log(res.url, res.status, res.data?.substring(0, 200));
}
