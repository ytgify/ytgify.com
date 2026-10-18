# Ytgify managed workflows

This setup covers **Basic video conversion**, **Edit and regenerate GIF**, and **Unsupported file recovery** on desktop (1440×900) and mobile (393×852). Mobile results are Chromium responsive testing, not real iPhone/Safari coverage.

## Install and start

Use Node 22.13 or newer and `npm ci`. Workflows 0.4.0 is pinned to the repository-local candidate tarball built from source `a6a16ad434a7f18c4a87e18d9bb67ef09fe720a5` on `codex/recovery-fixture-files`, based on merged Workflows PR #133. The additional-file extension is a local committed candidate and is not yet merged upstream. Keep `.workflows/packages/a6a16ad/candidate.tgz` in Git: it is required by the lockfile. Its SHA-256 is `8a6f8758c8d54c198189856ff91a7f18130ff9017fe6ebee9e62371ba7187fa3`. This is a local candidate install, not a registry publication.

```sh
make start-dev-bg YTGIFY_DEV_PORT=3001
mkdir -p .workflows/local
npx workflow doctor --json
npx workflow status Basic video conversion --json
npx workflow studio --headless
```

The configured app target is `http://localhost:3001`; use port 3001 explicitly because the project's default manual QA port is 3000. Use the `workflows.localhost` Studio origin printed by the CLI. Production is separately configured and never selected implicitly; the repository-file recipes are local-only.

The checked-in `.agents/skills/agent-workflows/` is generated, hash-pinned guidance. Refresh it with `npx workflow init --host codex` after a package update, then verify `doctor`. Do not format these files independently.

## Fixtures and lifecycle

All three workflows use the Git-tracked `tests/fixtures/visual-timeline.webm`. Recipes pin its filename, MIME type, size, hash, upload control, target and identity. The ordinary recipes match the implicit configured local default. The `*-explicit-local.yaml` recipes match an explicit `--target Local`; target-selection provenance is part of the contract.

For example, launch a candidate replay with:

```sh
npx workflow replay candidate --journey "Basic video conversion" --platform desktop-web --fixture-recipe .workflows/fixtures/basic-conversion-explicit-local.yaml --target Local --root . --json
```

A launch is only an execution queue. Follow the installed skill to execute every leased step, register original screenshots and downloaded GIF bytes, and complete cleanup. Repository-file uploads require one retained host-controlled Playwright Chromium page and the runner's `uploadFixtureForLease` API. Serialize fixture-backed runs sharing this store to avoid lock contention. Reverify the actual mobile CSS viewport after navigation; the blank page can have a different default layout width.

Finalize the clean candidate replay, promote it, then execute and finalize promoted replays for **both** platforms before qualification. Recover promotion, qualification and group IDs through fresh `workflow status` discovery. Pass the corresponding explicit-local recipe, `--target Local` and `--root .` to promoted replay and `evaluate launch`. Execute both evaluation group members and finalize each with `evaluate finalize GROUP RUN`. Do not substitute Training results for these phases.

These candidates support supervised lifecycle execution; they do not declare routine batches for every step and are not inputs to the separate `evaluate desktop|mobile` routine shortcut.

## Unsupported file recovery

Use `.workflows/fixtures/error-recovery-explicit-local.yaml` with `--target Local`. It pins `tests/fixtures/not-a-video.txt` as an additional file alongside the valid timeline video. Both files must match Git index bytes. The managed run rejects the text upload, checks the error and recovery guidance, activates Start over, verifies the cleared upload state, and then uploads the valid video on the same page. It trims, exports and verifies a three-second animated GIF before cleanup. Every step requires its own screenshot.

## Evidence

Both journeys completed promotion, desktop/mobile qualification and finalized evaluations locally on 2026-10-18. The four evaluation runs passed 32 steps with 32 registered screenshots and four verified GIF downloads. Those results establish the tested local flows, not specialist perspective coverage or human acceptance.

`.workflows/local/` contains machine-local runs, immutable promotions, qualification/evaluation receipts and evidence. It is deliberately ignored, so fresh checkouts must create their own lifecycle proof. Generated backups and older package candidates are also excluded. No credentials or historical run evidence are required in this commit.

Unsupported file recovery also completed clean desktop and mobile candidate replays on 2026-10-18: 16 passed steps, 16 registered screenshots and two verified three-second GIF downloads. Both replay receipts were finalized. This records candidate replay evidence; promotion, qualification and evaluation remain separate lifecycle phases.
