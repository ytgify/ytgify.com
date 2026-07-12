import { existsSync } from 'node:fs';

const duplicateToolPaths = ['app/studio/page.tsx', 'out/studio.html', 'out/studio/index.html'];
const exposedPaths = duplicateToolPaths.filter(existsSync);
const publicToolPath = 'out/video-to-gif.html';

if (exposedPaths.length > 0) {
  console.error(`Duplicate video-to-GIF route found: ${exposedPaths.join(', ')}`);
  process.exit(1);
}

if (!existsSync(publicToolPath)) {
  console.error(`Public video-to-GIF route is missing: ${publicToolPath}`);
  process.exit(1);
}

console.log('Canonical video-to-GIF route exists and no duplicate /studio route is present.');
