import { cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

cpSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
cpSync(join(root, 'public', 'icons'), join(dist, 'icons'), { recursive: true });

console.log('Static files copied to dist/');
