import fs from 'fs';
import path from 'path';

// 1. Copy to public/imag for Web App
const publicImagDir = path.join(process.cwd(), 'public', 'imag');
if (!fs.existsSync(publicImagDir)) {
  fs.mkdirSync(publicImagDir, { recursive: true });
}

// 2. Copy to app-mobile/assets for Mobile App
const mobileAssetsDir = path.join(process.cwd(), 'app-mobile', 'assets');
if (!fs.existsSync(mobileAssetsDir)) {
  fs.mkdirSync(mobileAssetsDir, { recursive: true });
}

const sourceDir = path.join(process.cwd(), 'imag');
const files = fs.readdirSync(sourceDir);

for (const file of files) {
  const src = path.join(sourceDir, file);
  fs.copyFileSync(src, path.join(publicImagDir, file));
  fs.copyFileSync(src, path.join(mobileAssetsDir, file));
  console.log(`Copied ${file} to public/imag and app-mobile/assets`);
}
