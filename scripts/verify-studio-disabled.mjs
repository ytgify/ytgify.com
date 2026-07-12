import { existsSync } from 'node:fs';

const forbiddenPaths = ['app/studio/page.tsx', 'out/studio.html', 'out/studio/index.html'];
const exposedPaths = forbiddenPaths.filter(existsSync);

if (exposedPaths.length > 0) {
  console.error(`Studio must remain disabled in production; found: ${exposedPaths.join(', ')}`);
  process.exit(1);
}

console.log('Studio production route is disabled.');
