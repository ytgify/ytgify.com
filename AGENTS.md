# Agent Notes

## Persistent Local QA Server

- Use `make start-dev-bg` when the user wants to manually QA the app locally. This mirrors the Lineage project pattern: start the Next.js dev server in a detached tmux session when tmux is installed, with a nohup/PID-file fallback otherwise.
- The default manual QA URL is `http://localhost:3000`.
- Use `make status-dev` to confirm the server is running, `make logs-dev` to inspect the latest output, and `make stop-dev` to stop it.
- Prefer these Make targets over a raw foreground `npm run dev` when restarting for the user, because the server stays alive after the Codex terminal command finishes.
- Do not run `npm run build` while the dev server is active. If Next.js reports a client manifest or devtools module error after switching between build and dev, run `make stop-dev`, remove `.next`, then run `make start-dev-bg`.

## Engineering Acceptance

- Follow `docs/engineering-standards.md` for module boundaries and required checks.
- Before declaring meaningful work complete, identify the three most realistic failure modes and collect direct evidence against each one.
- Treat a successful build or happy-path test as one signal, not complete acceptance evidence. UX changes require browser verification; media changes require a real fixture export; analytics changes require event/property verification.
- Do not increase a legacy ESLint file-size ceiling. Split the file and lower or remove its debt-ratchet override instead.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
