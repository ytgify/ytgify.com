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
