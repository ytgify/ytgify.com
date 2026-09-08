import { existsSync } from 'node:fs';

const duplicateToolPaths = ['app/studio/page.tsx', 'out/studio.html', 'out/studio/index.html'];
const exposedPaths = duplicateToolPaths.filter(existsSync);
const publicToolPaths = ['video-to-gif', 'gif-compressor', 'resize-gif', 'gif-to-mp4', 'screen-to-gif'].map(
  (route) => `out/${route}.html`,
);

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
