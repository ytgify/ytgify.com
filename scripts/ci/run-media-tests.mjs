import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function mediaTestArgs(selection) {
  const names = selection?.split(',');
  const allowed = ['video', 'compressor', 'resize', 'mp4', 'screen'];
  if (!names?.length || names.some((name) => !allowed.includes(name))) {
    throw new Error('Missing or invalid media suite selection');
  }
  // Playwright matches grep against the full title, including the test filename.
  const patterns = names.map((name) => `@${name}\\b`);
  patterns.push('@gif-shared\\b');
  if (names.includes('video')) {
    patterns.push('(studio|video-to-gif-accessibility|video-to-gif-seo|converter-improvements)\\.spec\\.ts');
  }
  return [
    'playwright',
    'test',
    'tests/studio.spec.ts',
    'tests/video-to-gif-accessibility.spec.ts',
    'tests/video-to-gif-seo.spec.ts',
    'tests/converter-improvements.spec.ts',
    'tests/gif-tools.spec.ts',
    'tests/gif-corpus-exports.spec.ts',
    'tests/gif-lifecycle.spec.ts',
    'tests/screen-recorder.spec.ts',
    'tests/gif-replacement.spec.ts',
    'tests/gif-journeys.spec.ts',
    '--grep',
    patterns.join('|'),
  ];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  execFileSync('npx', [...mediaTestArgs(process.env.SELECTED_MEDIA), ...process.argv.slice(2)], { stdio: 'inherit' });
}
