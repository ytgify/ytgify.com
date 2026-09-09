import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { selectSuites, changedPaths } from './ci/select-suites.mjs';
import { mediaTestArgs } from './ci/run-media-tests.mjs';
import { checkGate } from './ci/check-gate.mjs';

const cases = [
  [[], false, false],
  [['README.md', 'docs/engineering-standards.md'], false, false],
  [['app/page.tsx', 'content/blog/post.mdx'], true, false],
  [['content/blog/post.md'], true, false],
  [['app/studio/StudioApp.tsx', 'lib/studio/timeline.ts'], false, true],
  [['app/video-to-gif/page.tsx', 'tests/fixtures/long-source.md'], false, true],
  [['tests/converter-improvements.spec.ts'], false, true],
  [['tests/smoke.spec.ts'], true, false],
  [['app/page.tsx', 'lib/studio/timeline.ts'], true, true],
];
for (const path of [
  'app/layout.tsx',
  'app/globals.css',
  'app/components/Logo.tsx',
  'hooks/useIsMobile.ts',
  'lib/schema.ts',
  'instrumentation-client.ts',
  'package-lock.json',
  'next.config.ts',
  'playwright.config.ts',
  '.github/workflows/ci.yml',
  '.github/actions/setup-node/action.yml',
  'scripts/ci/select-suites.mjs',
  'new.config.ts',
]) {
  cases.push([[path], true, true]);
}
for (const [paths, site, tool] of cases) {
  const selected = selectSuites(paths);
  assert.equal(selected.site, site, paths.join(', '));
  assert.equal(selected.tool, tool, paths.join(', '));
}

for (const [site, tool] of [
  [false, false],
  [true, false],
  [false, true],
  [true, true],
]) {
  const needs = {
    'detect-changes': { result: 'success', outputs: { site: String(site), tool: String(tool) } },
    quality: { result: 'success' },
    'build-test-app': { result: site || tool ? 'success' : 'skipped' },
    'site-browser-tests': { result: site ? 'success' : 'skipped' },
    'video-to-gif-browser-tests': { result: tool ? 'success' : 'skipped' },
  };
  checkGate(needs);
  for (const job of Object.keys(needs)) {
    for (const result of ['failure', 'cancelled', 'unexpected']) {
      assert.throws(() => checkGate({ ...needs, [job]: { ...needs[job], result } }));
    }
    const flipped = needs[job].result === 'success' ? 'skipped' : 'success';
    assert.throws(() => checkGate({ ...needs, [job]: { ...needs[job], result: flipped } }));
  }
  assert.throws(() => checkGate({ ...needs, 'detect-changes': { result: 'success', outputs: {} } }));
}
assert.throws(() => changedPaths('', 'HEAD'));

// Exercise real Git add/delete/rename and PR merge-base behavior without touching
// the working checkout. Queue candidates use the same diff with an ancestor base.
// Hooks export repository-local Git variables. Remove them before entering the
// fixture so Git cannot initialize or configure the caller's repository.
const gitEnvironment = execFileSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' }).trim().split('\n');
const savedEnvironment = new Map(gitEnvironment.map((key) => [key, process.env[key]]));
for (const key of gitEnvironment) delete process.env[key];
const original = process.cwd();
const fixture = mkdtempSync(join(tmpdir(), 'ytgify-ci-'));
try {
  process.chdir(fixture);
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'CI Test');
  git('config', 'user.email', 'ci@example.invalid');
  git('commit', '--allow-empty', '-qm', 'base');
  const base = git('rev-parse', 'HEAD');
  // Git plumbing permits unusual names without shell interpolation.
  const blob = execFileSync('git', ['hash-object', '-w', '--stdin'], { input: 'fixture', encoding: 'utf8' }).trim();
  git('update-index', '--add', '--cacheinfo', '100644', blob, 'app/studio/old name.tsx');
  git('commit', '-qm', 'tool');
  const beforeMove = git('rev-parse', 'HEAD');
  git('update-index', '--force-remove', 'app/studio/old name.tsx');
  git('update-index', '--add', '--cacheinfo', '100644', blob, 'app/page.tsx');
  git('commit', '-qm', 'move');
  const head = git('rev-parse', 'HEAD');
  assert.deepEqual(selectSuites(changedPaths(beforeMove, head)), { site: true, tool: true, media: 'screen,video' });
  git('checkout', '-q', base);
  git('commit', '--allow-empty', '-qm', 'base advanced');
  assert.deepEqual(changedPaths(git('rev-parse', 'HEAD'), head), ['app/page.tsx']);
} finally {
  process.chdir(original);
  for (const [key, value] of savedEnvironment) {
    if (value !== undefined) process.env[key] = value;
  }
  rmSync(fixture, { recursive: true, force: true });
}
const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
for (const entry of [
  'merge_group:',
  'github.event.merge_group.base_sha',
  'github.event.merge_group.head_sha',
  'node scripts/ci/select-suites.mjs',
  'node scripts/ci/check-gate.mjs',
  'npm audit --omit=dev --audit-level=critical',
  'npx playwright install chromium firefox webkit --with-deps',
  'npm run verify:public-tool',
]) {
  assert.ok(workflow.includes(entry), `Missing workflow contract: ${entry}`);
}
assert.ok(!workflow.includes('paths-ignore:'));
assert.ok(
  workflow.includes('needs: [detect-changes, quality, build-test-app, site-browser-tests, video-to-gif-browser-tests]'),
);
console.log(`${cases.length} path cases, all gate states, and real Git move/base fixtures passed.`);

for (const [path, media] of [
  ['app/gif-compressor/page.tsx', 'compressor'],
  ['lib/media/gif/compress.ts', 'compressor'],
  ['app/resize-gif/page.tsx', 'resize'],
  ['app/gif-tools/ResizeControls.tsx', 'resize'],
  ['lib/media/mp4/encode.ts', 'mp4'],
  ['lib/media/gif/geometry.ts', 'compressor,resize'],
  ['app/screen-to-gif/ScreenRecorder.tsx', 'screen'],
  ['app/studio/StudioApp.tsx', 'screen,video'],
  ['lib/media/gif/decode.ts', 'compressor,mp4,resize,screen,video'],
  ['app/gif-tools/useGifJob.ts', 'compressor,mp4,resize,screen,video'],
]) {
  assert.deepEqual(selectSuites([path]), { site: false, tool: true, media });
}
assert.equal(selectSuites(['app/resize-gif/page.tsx', 'app/gif-compressor/page.tsx']).media, 'compressor,resize');
assert.throws(() => mediaTestArgs(''));
assert.throws(() => mediaTestArgs('unknown'));
assert.ok(mediaTestArgs('resize').at(-1).includes('@resize'));
assert.ok(!mediaTestArgs('resize').at(-1).includes('@mp4'));
console.log('Per-tool ownership, shared dependencies, and runner validation passed.');

// Ask Playwright itself to enumerate tests so a new untagged test cannot silently
// disappear from CI. This lists tests only; it never launches a browser or build.
const selectedArgs = mediaTestArgs('video,compressor,resize,mp4,screen');
const listTests = (args) =>
  execFileSync('npx', [...args, '--list'], { encoding: 'utf8' })
    .split('\n')
    .filter((line) => line.startsWith('  ['))
    .sort();
const unfilteredTests = listTests(selectedArgs.slice(0, -2));
assert.ok(unfilteredTests.length > 0);
assert.deepEqual(listTests(selectedArgs), unfilteredTests, 'Media selection must retain every existing test');
console.log(`All ${unfilteredTests.length} media browser tests remain selected for shared changes.`);
