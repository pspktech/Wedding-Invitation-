import { cp, mkdir, rm } from 'node:fs/promises';

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'music.mp3']) {
  await cp(file, `www/${file}`);
}
await cp('images', 'www/images', { recursive: true });
await cp('sections', 'www/sections', { recursive: true });
console.log('Prepared www/ for Capacitor Android build.');
