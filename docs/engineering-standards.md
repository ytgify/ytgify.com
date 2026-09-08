# Engineering Standards

These rules keep the landing site and browser-based video-to-GIF converter independently maintainable while they share one Next.js deployment and domain.

## Module boundaries

- Application, hook, and library source files are limited to 300 effective lines by ESLint.
- Functions over 120 effective lines, complexity over 20, and nesting deeper than four levels produce refactoring warnings.
- Tests may reach 500 effective lines when a cohesive workflow benefits from staying together.
- Existing oversized files use exact debt-ratchet ceilings in `eslint.config.mjs`. Those ceilings must never increase. Refactors should lower or delete them.
- Prefer feature ownership: converter UI belongs under `app/studio`, reusable media logic under `lib/studio`, and converter browser coverage in `tests/studio.spec.ts`.
- Animated GIF parsing, geometry, compression and MP4 adapters belong under `lib/media`; shared file-tool UI belongs under `app/gif-tools`, and native recording UI under `app/screen-to-gif`.
- Keep browser/platform adapters separate from framework-independent calculations and encoders.

## Required local gates

Husky is enabled by `npm ci` through the `prepare` script (`git config core.hooksPath` should report `.husky/_`).

- **Commit:** `npm run pre-commit` runs lint-staged's ESLint/Prettier fixes on staged files, then the fast unit suite. No build or browser launch.
- **Push:** `npm run pre-push` fails at the first failed gate, builds once, and runs four Chromium smoke checks against that output (homepage loading/headline and converter keyboard access/error recovery).
- **Full validation:** run `npm run test:e2e` for the broader browser matrix; media changes also need a real fixture export. The push smoke suite does not replace these checks.

Install the pinned Playwright browser runtimes with `npm run test:browsers:install` after the first `npm ci` or a Playwright upgrade. Linux CI may use `npx playwright install --with-deps chromium firefox webkit`. Browser installation is explicit, so hooks never download browsers unexpectedly. HTML reports are saved without opening a server that would keep failed hooks running.

`PLAYWRIGHT_PORT` can select a free local port when validating concurrent worktrees (default 3217).

Stop the local dev server before building or running production browser tests. `PLAYWRIGHT_SKIP_BUILD=1` is used by pre-push and validate only after their successful build; ordinary test commands build fresh output. `PLAYWRIGHT_BASE_URL` is available for deliberate testing against an existing server, and is cleared by the push gate to ensure it tests the local build.

`npm run pre-push` runs the same core checks expected by CI:

1. ESLint, including module-size limits.
2. Prettier formatting.
3. Strict TypeScript checking.
4. Knip's production dependency and unused-code graph.
5. Fast Vitest unit tests.
6. A production Next.js build.
7. Verification that the canonical converter route is present and the retired `/studio` route is absent.
8. A bounded Chromium smoke suite against the same production build.

Use `npm run test:e2e` for the complete browser suite or `npm run test:video-to-gif` for the public converter workflow, accessibility, and SEO coverage. Both exercise the canonical `/video-to-gif` route from the normal production-shaped build.

## Test layers

- Unit tests cover deterministic calculations, validation, sanitization, and state transitions.
- Site browser tests cover landing, install, blog/SEO, welcome, and responsive behavior.
- Converter browser tests use real video fixtures and verify export, download, privacy, cancellation, and recovery behavior.
- A feature is not accepted only because it renders. Test the user outcome and its most likely failure modes.

## CI boundaries

- Quality checks run for every code pull request and merge-group candidate.
- Site browser tests run for site or shared-framework changes.
- Converter browser tests run for converter or shared-framework changes.
- Shared dependency, Next.js, TypeScript, styling, Playwright, analytics, and workflow changes run both browser suites.
- PR and merge-group diffs use the same tested selector (`scripts/ci/select-suites.mjs`). Moves include both old and new paths; unknown/shared paths select both suites. Documentation-only candidates still report quality and the required gate.
- Build and quality run concurrently after path detection; browser jobs consume that candidate's verified static artifact. Quality remains mandatory at the final gate.
- `CI Gate` requires successful detection and quality, successful selected jobs, and exactly skipped unselected jobs. Failed detection or missing outputs cannot silently skip acceptance.
- npm's download cache is reused, but locked dependencies are installed fresh. CI skips the manual OG generator's Puppeteer download; Playwright still installs its own full required browser runtimes.
- PR acceptance is repeated for the merge-group candidate because its combined Git tree may differ. No PR result or production artifact is reused across candidates.
- Production remains one GitHub Pages artifact. Every main deployment verifies that `/video-to-gif` exists and that no duplicate `/studio` route is included.

## Knip policy

Do not make every source file a Knip entry; that masks unused files. Entry points should represent framework routes, executable scripts, and configuration. Dependencies used only through Next.js build configuration or dynamic loading are listed explicitly in `ignoreDependencies`.

When Knip reports an issue, prefer deleting unused code or narrowing exports before adding an exception.

## Acceptance evidence

For meaningful work, record the three most realistic failure modes and evidence against each one. Examples include focused tests, a fixture export, a desktop/mobile browser pass, production-output inspection, an analytics query, or a deployed smoke check. State residual risk when a failure mode cannot be tested directly.

## GIF tool acceptance runtime

`npm run test:gif-tools` exercises actual GIF/MP4 downloads and cross-tool journeys. Install FFmpeg/FFprobe and Pillow (`scripts/gif-fixtures/requirements.txt`); `GIF_ORACLE_PYTHON` selects the Python runtime containing Pillow. The `chrome-media` project uses installed Chrome because the bundled Chromium build can lack H.264 encoding.

`npm run test:gif-privacy` makes a dedicated local test-key build and intercepts the enabled PostHog SDK's network requests. Rebuild normally afterward; never deploy the test-key artifact. Native capture uses the opt-in `native-capture` project and a controlled tab only. Run each native case serially with other browser work so document focus remains valid. Engine emulation is not evidence of native mobile saving.

The experimental acceptance ledger and unresolved production/device gates are in `docs/research/2026-09-08-tool-opportunities/implementation-receipt.md`. Generated `.ytgify-runtime` evidence and rollback artifacts are excluded from lint, type and unit-source discovery.
