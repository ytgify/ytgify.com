# Engineering Standards

These rules keep the landing site and browser-based Studio independently maintainable while they share one Next.js deployment and domain.

## Module boundaries

- Application, hook, and library source files are limited to 300 effective lines by ESLint.
- Functions over 120 effective lines, complexity over 20, and nesting deeper than four levels produce refactoring warnings.
- Tests may reach 500 effective lines when a cohesive workflow benefits from staying together.
- Existing oversized files use exact debt-ratchet ceilings in `eslint.config.mjs`. Those ceilings must never increase. Refactors should lower or delete them.
- Prefer feature ownership: Studio UI belongs under `app/studio`, reusable media logic under `lib/studio`, and Studio browser coverage in `tests/studio.spec.ts`.
- Keep browser/platform adapters separate from framework-independent calculations and encoders.

## Required local gates

`npm run pre-push` runs the same core checks expected by CI:

1. ESLint, including module-size limits.
2. Prettier formatting.
3. Strict TypeScript checking.
4. Knip's production dependency and unused-code graph.
5. Fast Vitest unit tests.
6. A production Next.js build.
7. Verification that the dormant Studio route is absent from production output.

Use `npm run test:e2e` for the complete browser suite or `npm run test:studio` for the public video-to-GIF workflow, accessibility, and SEO coverage. Both exercise the canonical `/video-to-gif` route from the normal production-shaped build.

## Test layers

- Unit tests cover deterministic calculations, validation, sanitization, and state transitions.
- Site browser tests cover landing, install, blog/SEO, welcome, and responsive behavior.
- Studio browser tests use real video fixtures and verify export, download, privacy, cancellation, and recovery behavior.
- A feature is not accepted only because it renders. Test the user outcome and its most likely failure modes.

## CI boundaries

- Quality checks run for every code pull request and merge-group candidate.
- Site browser tests run for site or shared-framework changes.
- Studio browser tests run for Studio or shared-framework changes.
- Shared dependency, Next.js, TypeScript, styling, Playwright, analytics, and workflow changes run both browser suites.
- `CI Gate` is the stable required check and accepts only successful or intentionally path-skipped jobs.
- Production remains one GitHub Pages artifact. Every main deployment verifies that `/video-to-gif` exists and that no duplicate `/studio` route is included.

## Knip policy

Do not make every source file a Knip entry; that masks unused files. Entry points should represent framework routes, executable scripts, configuration, and explicitly dormant product roots. Dependencies used only through Next.js build configuration, dynamic encoder loading, or dormant Studio roots are listed explicitly in `ignoreDependencies`.

When Knip reports an issue, prefer deleting unused code or narrowing exports before adding an exception.

## Acceptance evidence

For meaningful work, record the three most realistic failure modes and evidence against each one. Examples include focused tests, a fixture export, a desktop/mobile browser pass, production-output inspection, an analytics query, or a deployed smoke check. State residual risk when a failure mode cannot be tested directly.
