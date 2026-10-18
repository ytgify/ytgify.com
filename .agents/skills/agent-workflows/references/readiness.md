# Verify project readiness

Run `workflow doctor --json` from the repository root after installation or an update. Continue when `data.localStatus` is `ready`, `data.compatibility.status` is `ready`, and the `codex-skill` check is `ready`. The compatibility report identifies the package version, supported protocol versions, preferred version, and generated-skill pins; resolve a mismatch before browser work. Use `workflow doctor --registry --json` only when diagnosing package installation or registry access.

Do not require a fresh task, a copied skill catalog, a contract-read transcript, or a production probe as readiness evidence. If Codex has not loaded a newly installed plugin in the current task, start a new task once to refresh the runtime; that refresh is not approval, acceptance, or a lifecycle gate.
