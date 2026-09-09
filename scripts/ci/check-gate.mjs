import { pathToFileURL } from 'node:url';

export function checkGate(needs) {
  const detection = needs['detect-changes'];
  if (detection?.result !== 'success' || needs.quality?.result !== 'success') {
    throw new Error('Path detection and quality must succeed');
  }
  const { site, tool, compressor } = detection.outputs || {};
  if (![site, tool, compressor].every((value) => value === 'true' || value === 'false')) {
    throw new Error('Missing or invalid suite selection');
  }
  const expected = {
    'build-test-app': site === 'true' || tool === 'true' || compressor === 'true',
    'gif-compressor-browser-tests': compressor === 'true',
    'site-browser-tests': site === 'true',
    'video-to-gif-browser-tests': tool === 'true',
  };
  for (const [job, required] of Object.entries(expected)) {
    const result = needs[job]?.result;
    if (result !== (required ? 'success' : 'skipped')) {
      throw new Error(`${job}: unexpected ${result}; selected=${required}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkGate(JSON.parse(process.env.NEEDS_JSON));
  console.log('All required jobs passed; only unselected suites were skipped.');
}
