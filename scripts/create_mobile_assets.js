import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'app-mobile', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 transparent PNG as default fallback
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
for (const f of files) {
  const target = path.join(assetsDir, f);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, dummyPng);
    console.log('Created asset:', f);
  }
}
