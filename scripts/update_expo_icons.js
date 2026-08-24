import fs from 'fs';
import path from 'path';

const sourceLogo = path.join(process.cwd(), 'imag', 'logo.png');
const mobileAssetsDir = path.join(process.cwd(), 'app-mobile', 'assets');

if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Arquivo de logo de origem não encontrado em imag/logo.png');
  process.exit(1);
}

const targets = [
  'icon.png',
  'adaptive-icon.png',
  'splash.png',
  'favicon.png',
  'logo.png'
];

targets.forEach(targetFile => {
  const dest = path.join(mobileAssetsDir, targetFile);
  fs.copyFileSync(sourceLogo, dest);
  console.log(`✅ Copiado com sucesso para: app-mobile/assets/${targetFile}`);
});

console.log('🎉 Todos os ícones e logos do aplicativo Expo foram atualizados para a logo oficial!');
