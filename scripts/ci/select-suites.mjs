import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Only known feature-owned paths may omit a browser suite. Unknown/shared paths
// fail closed to both, including new config files and shared components/hooks.
export function selectSuites(paths) {
  let site = false;
  let tool = false;
  let compressor = false;
  for (const path of paths) {
    if (/^lib\/studio\/(posthog-privacy|gifenc)\./.test(path)) {
      tool = true;
      compressor = true;
    } else if (
      /^(app\/(gif-compressor|gif-tools)\/|lib\/media\/|tests\/fixtures\/gif\/|scripts\/gif-fixtures\/)/.test(path) ||
      /^tests\/gif-.*\.spec\.ts$/.test(path)
    ) {
      compressor = true;
    } else if (
      /^(app\/(studio|video-to-gif)\/|lib\/studio\/|tests\/fixtures\/)/.test(path) ||
      /^tests\/(studio|video-to-gif-accessibility|video-to-gif-seo|converter-improvements)\.spec\.ts$/.test(path)
    ) {
      tool = true;
    } else if (
      /^(content\/|app\/(blog|welcome|share|privacy-policy|terms-of-service)\/)/.test(path) ||
      /^(app\/page\.tsx|lib\/(blog|formspree)\.ts|tests\/(smoke|blog-seo|welcome)\.spec\.ts)$/.test(path)
    ) {
      site = true;
    } else if (/^(docs|plans)\//.test(path) || /^[^/]+\.md$/.test(path)) {
      continue;
    } else {
      site = true;
      tool = true;
      compressor = true;
    }
  }
  return { site, tool, compressor };
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
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `site=${suites.site}\ntool=${suites.tool}\ncompressor=${suites.compressor}\n`,
  );
}
