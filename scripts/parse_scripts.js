import fs from 'fs';

const htmlLoja = fs.readFileSync('scripts/page_loja.php.html', 'utf-8');
const htmlCinema = fs.readFileSync('scripts/page_cinema.php.html', 'utf-8');
const htmlNovidade = fs.readFileSync('scripts/page_novidade.php.html', 'utf-8');

console.log('--- Scripts em loja.php ---');
const lojaScripts = htmlLoja.match(/<script[\s\S]*?<\/script>/gi) || [];
lojaScripts.forEach((s, idx) => console.log(`Script ${idx}:`, s.substring(0, 300)));

console.log('--- Scripts em cinema.php ---');
const cinemaScripts = htmlCinema.match(/<script[\s\S]*?<\/script>/gi) || [];
cinemaScripts.forEach((s, idx) => console.log(`Script ${idx}:`, s.substring(0, 300)));
