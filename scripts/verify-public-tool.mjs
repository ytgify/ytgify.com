import { existsSync } from 'node:fs';

const duplicateToolPaths = [
  'app/studio/page.tsx',
  'out/studio.html',
  'out/studio/index.html',
  ...['resize-gif', 'gif-to-mp4', 'screen-to-gif'].flatMap((route) => [
    `app/${route}/page.tsx`,
    `out/${route}.html`,
    `out/${route}/index.html`,
  ]),
];
const exposedPaths = duplicateToolPaths.filter(existsSync);
const publicToolPaths = ['video-to-gif', 'gif-compressor'].map((route) => `out/${route}.html`);

if (exposedPaths.length > 0) {
  console.error(`Duplicate video-to-GIF route found: ${exposedPaths.join(', ')}`);
  process.exit(1);
}

if (publicToolPaths.some((path) => !existsSync(path))) {
  console.error(
    `Public video-to-GIF route is missing: ${publicToolPaths.filter((path) => !existsSync(path)).join(', ')}`,
  );
  process.exit(1);
}

console.log('Canonical video-to-GIF route exists and no duplicate /studio route is present.');
