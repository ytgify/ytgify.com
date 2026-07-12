import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const siteFilter = sectionBetween(workflow, '            site:\n', '            studio:\n');
const studioFilter = sectionBetween(workflow, '            studio:\n', '\n  quality:');
const siteJob = sectionBetween(workflow, '  site-browser-tests:\n', '\n  studio-browser-tests:');
const studioJob = sectionBetween(workflow, '  studio-browser-tests:\n', '\n  ci-gate:');

requireEntries(siteFilter, [
  "- '!app/studio/**'",
  "- '!app/video-to-gif/**'",
  "- '!lib/studio/**'",
  "- '!tests/studio.spec.ts'",
  "- '!tests/video-to-gif-accessibility.spec.ts'",
  "- '!tests/video-to-gif-seo.spec.ts'",
]);

requireEntries(studioFilter, [
  "- 'app/studio/**'",
  "- 'app/video-to-gif/**'",
  "- 'lib/studio/**'",
  "- 'lib/schema.ts'",
  "- 'tests/studio.spec.ts'",
  "- 'tests/video-to-gif-accessibility.spec.ts'",
  "- 'tests/video-to-gif-seo.spec.ts'",
  "- 'package.json'",
  "- '.github/workflows/**'",
]);

requireEntries(studioJob, [
  'npx playwright install chromium firefox webkit --with-deps',
  'http://localhost:3217/video-to-gif',
]);
requireEntries(siteJob, ['npx playwright install chromium --with-deps']);
rejectEntries(siteJob, ['npx playwright install chromium firefox webkit --with-deps']);

console.log('CI boundaries separate site-only and tool-only changes while retaining shared triggers.');

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Cannot locate CI filter section: ${startMarker.trim()}`);
  return source.slice(start, end);
}

function requireEntries(source, entries) {
  const missing = entries.filter((entry) => !source.includes(entry));
  if (missing.length > 0) throw new Error(`Missing CI boundary entries: ${missing.join(', ')}`);
}

function rejectEntries(source, entries) {
  const unexpected = entries.filter((entry) => source.includes(entry));
  if (unexpected.length > 0) throw new Error(`Misplaced CI boundary entries: ${unexpected.join(', ')}`);
}
