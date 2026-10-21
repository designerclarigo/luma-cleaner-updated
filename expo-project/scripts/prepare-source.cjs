const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, '../src/services/mediaService.ts'), 'utf8');
const start = source.indexOf('const DEMO_MEDIA_SEED');
const end = source.indexOf('\n];', start) + 3;
if (start < 0 || end < start) throw new Error('Approved demo catalog was not found');
fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/data/demoMedia.ts'),
  "import type { MediaItem } from '../core/model';\n" +
  source.slice(start, end).replace('const DEMO_MEDIA_SEED', 'export const DEMO_MEDIA_SEED'));
console.log('Copied approved demo catalog without importing the web app');

