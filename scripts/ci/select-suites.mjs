import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Only known feature-owned paths may omit a browser suite. Unknown/shared paths
// fail closed to both, including new config files and shared components/hooks.
export function selectSuites(paths) {
  let site = false;
  const media = new Set();
  const allMedia = () => ['video', 'compressor', 'resize', 'mp4', 'screen'].forEach((name) => media.add(name));
  for (const path of paths) {
    if (/^app\/gif-compressor\//.test(path) || /^lib\/media\/gif\/(compress|quality|sample)\./.test(path)) {
      media.add('compressor');
    } else if (
      /^app\/resize-gif\//.test(path) ||
      /^app\/gif-tools\/ResizeControls\./.test(path) ||
      /^lib\/media\/gif\/geometry\./.test(path)
    ) {
      media.add('resize');
      if (/^lib\/media\/gif\/geometry\./.test(path)) media.add('compressor');
    } else if (/^(app\/gif-to-mp4\/|lib\/media\/mp4\/)/.test(path)) {
      media.add('mp4');
    } else if (
      /^app\/screen-to-gif\//.test(path) ||
      /^lib\/media\/(capture-ready|finalize-recording)\./.test(path) ||
      /^tests\/(screen-recorder|native-capture)\.spec\.ts$/.test(path)
    ) {
      media.add('screen');
    } else if (
      /^(app\/(studio|video-to-gif)\/|lib\/studio\/)/.test(path) ||
      /^tests\/(studio|video-to-gif-accessibility|video-to-gif-seo|converter-improvements)\.spec\.ts$/.test(path)
    ) {
      media.add('video');
      // Screen recording hands off to the existing video editor.
      media.add('screen');
    } else if (
      /^(app\/gif-tools\/|lib\/media\/|tests\/fixtures\/|scripts\/gif-fixtures\/)/.test(path) ||
      /^tests\/gif-.*\.spec\.ts$/.test(path)
    ) {
      allMedia();
    } else if (
      /^(content\/|app\/(blog|welcome|share|privacy-policy|terms-of-service)\/)/.test(path) ||
      /^(app\/page\.tsx|lib\/(blog|formspree)\.ts|tests\/(smoke|blog-seo|welcome)\.spec\.ts)$/.test(path)
    ) {
      site = true;
    } else if (/^(docs|plans)\//.test(path) || /^[^/]+\.md$/.test(path)) {
      continue;
    } else {
      site = true;
      allMedia();
    }
  }
  return { site, tool: media.size > 0, media: [...media].sort().join(',') };
}

export function changedPaths(base, head) {
  if (![base, head].every((sha) => /^[a-f0-9]{40}$/.test(sha || ''))) {
    throw new Error('Both candidate SHAs must be complete Git object IDs');
  }
  // Three-dot excludes unrelated base updates for PRs; queue heads contain base.
  // No rename detection means both sides of moves select their respective suites.
  return execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${base}...${head}`], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const suites = selectSuites(changedPaths(process.env.BASE_SHA, process.env.HEAD_SHA));
  console.log(suites);
  appendFileSync(process.env.GITHUB_OUTPUT, `site=${suites.site}\ntool=${suites.tool}\nmedia=${suites.media}\n`);
}
