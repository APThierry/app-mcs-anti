import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'src', 'data', 'realData.js');
const dest = path.join(process.cwd(), 'app-mobile', 'src', 'data', 'realData.js');

const destDir = path.dirname(dest);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Successfully copied realData.js to app-mobile/src/data/realData.js');
