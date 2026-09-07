# CI runtime efficiency

Base: `62f76298b19c469f247ff3a6d253053bbfa0c709` (merged PR #31).

## Baseline

GitHub Actions observations from September 7, 2026 (job timestamps, not estimates):

| Run                                                                          | Event       | End-to-end | Quality | Build | Site browsers | Converter browsers |
| ---------------------------------------------------------------------------- | ----------- | ---------- | ------- | ----- | ------------- | ------------------ |
| [34152648052](https://github.com/ytgify/ytgify.com/actions/runs/34152648052) | PR #31      | 301s       | 54s     | 49s   | 81s           | 178s               |
| [34161805343](https://github.com/ytgify/ytgify.com/actions/runs/34161805343) | Merge group | 274s       | 43s     | 42s   | 81s           | 172s               |

The queue run installed dependencies four times (20–22s each, with npm cache hits). Browser installation cost 20s for site and 41s for converter; execution cost 25s and 99s. Build compilation/export cost only 11s. Quality blocked build, adding almost an entire quality job to the critical path.

## Changes and expected effect

- Overlap build with quality after path detection: approximately 35–45s lower shared-change wall time after allowing for detection and scheduling. Against the latest queue baseline, roughly 230–240s is expected before any installation improvement; this is an estimate, not a benchmark guarantee.
- Apply the same conservative path selector to PR and merge-group candidates. A site-only queue candidate avoids the 172s converter job (roughly 91s shorter browser critical path); tool-only changes avoid the 81s site job in billed runner time. Shared/unknown paths still select both.
- Remove workflow-level documentation filtering so required checks report for documentation-only PRs. They run quality, then intentionally skip build/browser jobs. Markdown content and fixture documentation retain their owning suite.
- Keep npm's existing download cache and fresh lockfile installs. Skip Puppeteer's unused manual-image-generator download and redundant install-time audit; the explicit critical production security audit remains mandatory. Installation savings must be measured on GitHub runners.
- Keep all Chromium, Firefox, WebKit, and mobile Chromium test coverage and the one-worker configuration. No evidence justifies reducing platform acceptance or increasing concurrent media exports. Browser caches and Next build caches are deferred: browser OS dependencies still need installation, and the observed build is only 11s.
- Keep Husky's fast staged fixes/unit commit tier and fail-fast quality/build/four-test Chromium push tier. `validate` now builds once, verifies public routes, and reuses that build for its full browser run instead of building twice.
- Keep fresh PR and queue acceptance because their combined source trees can differ. No cross-candidate artifacts, test results, credentials, or dependency directories are reused.

## Acceptance risks and evidence

1. **Changed paths omit necessary acceptance.** Executable selector fixtures cover site/tool/shared/unknown paths, mixed changes, content Markdown, fixture Markdown, and documentation-only changes. A temporary real Git repository verifies both sides of moves and diverged PR bases. Full history permits merge-base resolution; missing or invalid SHAs fail detection.
2. **A failed prerequisite produces a green required gate.** Gate fixtures exercise all four suite combinations and reject failure, cancellation, unknown status, missing outputs, unexpected skips, and unexpected successes for unselected jobs. Detection and quality must succeed. `CI Gate` retains its stable name and includes every prerequisite.
3. **Faster setup/build changes weaken production or browser acceptance.** The same candidate artifact is built once and now verified for canonical/retired routes before upload; missing artifacts fail. Security audit, coverage thresholds, quality checks, full browser matrix, and push smoke remain. Workflow syntax is checked with actionlint; local pre-push and GitHub Actions provide execution evidence.

Tradeoff: a build may do work even when concurrent quality later fails. This exchanges some failed-run compute for faster successful runs. Hosted runner load and queue scheduling make single-run comparisons noisy. Merge-group execution of the new workflow cannot be observed until a maintainer queues this PR; no merge or deployment is authorized by this task.

## Local execution

- `actionlint`: passed, including shellcheck.
- `PLAYWRIGHT_PORT=33217 npm run pre-push`: passed all gates; 42 unit tests and all four Chromium smoke checks (3.7s browser run).
- `npm run test:unit:coverage`: passed existing thresholds (96.8% lines, 89.52% branches).
- `npm audit --omit=dev --audit-level=critical`: passed the unchanged critical threshold; reported existing 2 moderate and 7 high production findings. Dependency remediation remains outside this CI-only change.
- `git diff --check`: passed. Existing six ESLint function-length warnings remain unchanged.
- Initial smoke attempt correctly rejected occupied port 3217; the configurable port permits isolated worktree validation without reusing another task's output.
