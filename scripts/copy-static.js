import { cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

cpSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
cpSync(join(root, 'public', 'icons'), join(dist, 'icons'), { recursive: true });
cpSync(join(root, 'public', 'service-worker.js'), join(dist, 'service-worker.js'));

console.log('Static files copied to dist/');
