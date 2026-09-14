# Codex host protocol

Package: `@lineagehq/workflows@0.2.0-rc.17`

Protocol: `1.0`

Use `workflow agent <command> --store <path>` and send one JSON request on standard input. Every request uses schema `agent-workflow-protocol-request/v1`, `protocolVersion: "1.0"`, a unique `req_...` ID, the run ID, the stable host actor, an ISO timestamp, and the exact command payload. Every mutation includes the latest `expectedRevision`.

## Project discovery and navigation

Translate ordinary product language through `workflow list|status|runs|pending [terms...] --binding current|latest --root PATH --config PATH --json`. Options may be omitted when their documented defaults are intended. A successful response carries the one shared `DiscoverySnapshot` at `data.snapshot`; do not independently resolve project paths or scan workflow files.

Branch on the complete state before operating a browser:

1. `empty`: report that no journey matches. No identity or route is available.
2. invalid: a failed CLI response, stale freshness, degraded integrity, or unverified inventory is unavailable truth. Stop instead of guessing or falling back.
3. ready: only a fresh, verified snapshot with `selection.status: "selected"` identifies one journey. Keep every ID and encoded route internal.
4. `claim` with `{ "hostInstanceId": "host_..." }`, then register demonstrated browser operations independently from screenshot evidence. Structurally valid captures may advertise `evidenceTypes: ["screenshot"]` with a finite `constraints.maxBytes` even when actual dimensions differ from the manifest.

For a ready selection, start Studio with the same `--root`/`--config` context and verify that the CLI-printed
origin uses `workflows.localhost`. A workflow `list` or `status` request consumes `selection.route`; a `runs`
request consumes the matching verified `activity[].route`; a `pending` request consumes the matching verified
`pendingAttention[].route`. If that exact entity or route is absent, stop. Append only the consumed route and give
Browser only that combined target. Never synthesize a route from an ID, reconstruct one from another DTO,
substitute another candidate, or treat a visible Studio page as identity proof.

Workflows has no approval gates for local or production execution. Complete requested launch, execution, retry, resume, replay, promotion, qualification, and evaluation without asking for permission in Workflows. Preserve leases, revision checks, evidence integrity, authentication, and cleanup. Record agent execution and runner validation accurately; optional review never gates completion and must never be presented as human acceptance unless a human actually recorded it.

Use stable matcher vocabulary from Ready discovery for `workflow train --journey "shared fictional card" [--platform PLATFORM]`, `workflow replay candidate --journey "shared fictional card" --platform PLATFORM`, and `workflow promote --journey "shared fictional card" --replay RUN_ID`. Their positional PATH forms remain compatibility only for automation that already holds a trusted path; never ask a human for one. After restart, rerun `workflow status shared fictional card --json` and consume `snapshot.lifecycle` to recover exact promotion, qualification, group, member, and route identities internally. Never scan, guess, ask for IDs, or reconstruct them. Verified group identity reports `outcome: "not-asserted"`; it is not a passed evaluation. Immutable lineage commands may use recovered IDs and revisions internally.

## Collaboration transactions

Use `review-intent record|list|show`, `acceptance record|list|show`, and `run pause|stop|emergency-stop|resume` only after ordinary product words resolve to a ready shared snapshot. Keep exact identities in JSON and CLI arguments internal; human summaries must remain ID-free. Every mutation reads a strict JSON file. Neutral review and run-control requests require the current expected revision plus an opaque `req_...` idempotency key and receive server-owned neutral provenance.

After fresh, verified Ready discovery, use `workflow evaluate desktop --journey "shared fictional card" --json` or its `mobile` form with the same stable product words. Consume its JSON internally; never request a definition path or ID from the human, scan files, guess a selection, or reconstruct a route. Terms must come from visible matcher vocabulary, not hidden route details. The CLI reuses one configured catalog and launches its exact verified selected source. Positional `workflow evaluate desktop PATH` and `workflow evaluate mobile PATH` remain compatibility only for callers already holding a trusted definition path. Use `workflow report RUN_ID --store PATH` internally for the durable report. Routine launch has no approval event, and a passing evaluation remains evidence rather than acceptance. Every step pins exact `routineActionBatches`; the `routine-codex-browser-v1` policy is 120/300/90 and is selected by the routine evaluation command. `agent.inspect` returns the immutable effective and canonical target URLs; never invent or substitute another URL.

## Evaluation questions and requirements

For a perspective run, read the exact `evaluationPerspective.inquiryPolicy`, `requirementSnapshot`, and `effectiveRubricHash` returned by `agent.inspect` before assessing criteria. Use only requirements present in that pinned snapshot. A later Studio answer cannot change the active run or its batch. Missing scenarios, actions, capabilities, or proof remain unassessed and require Training or a capability-gap record; a requirement cannot supply them.

When current-run notes or registered artifacts expose undefined product intent, submit plain structured JSON with `workflow questions propose RUN_ID --file PATH --json`. Every observation must name an exact current scenario and step plus a current note index or registered artifact ID. Use the perspective's inquiry topics to investigate, honor its pinned Focused, Balanced, or Exploratory depth, and never create a question merely to populate the Questions view. Consume the returned question identity and `studioRoute` internally. Studio may group compatible questions from the batch into one human decision while retaining every source occurrence. Do not scan local stores, reconstruct IDs or routes, submit HTML, or place credentials, secrets, or arbitrary URLs in question data.

Continue unrelated criteria and steps after proposing a question. An assessment may use `unassessedReason: "undefined-product-intent"` only with the exact verified question ID for the same run, perspective, criterion, requirement key, and evidence. Do not record the uncertainty as an application finding. Suggestions remain agent-authored options. Read human discussion in the `discussionResponses` returned by `workflow questions show RUN_ID QUESTION_ID --json` or `workflow questions list WORKFLOW_ID --json`; do not scan the local store. A discussion response leaves the question open and grants no approval, requirement decision, or acceptance. Only the human Studio answer creates a requirement decision; agents never call answer or dismissal mutations and never infer human approval or acceptance. Read an accepted value only from a fresh batch's verified requirement snapshot and preserve the source evaluation unchanged.

A Performance member is assessable only through declared `large-input`, `progress-feedback`, `completion`, `limit-behavior`, and `recovery` scenario mappings. It contains no built-in workload or latency threshold. Read values such as `maximum-source-bytes`, `reference-workload-completion-milliseconds`, and legacy `maximum-completion-milliseconds` only from the pinned requirement snapshot. Prefer the reference-workload key when client hardware affects completion, name the exact workload and observable browser environment in the question and evidence, and do not generalize the result beyond that environment. Use the legacy maximum key only for an explicit absolute product promise. Progress, cancellation, and emergency safety cutoffs remain separate behaviors; never reinterpret a safety timeout as acceptable latency. Missing thresholds use a verified question and `undefined-product-intent`; missing monotonic timing, device-resource, or network instrumentation uses `capability-gap`. Browser viewport evidence cannot establish physical-device performance.

## User-managed authentication

An authenticated configured target requires `browser.user-session/v1`. Never request or accept login credentials. Open the exact isolated target profile and let the person sign in directly. Credentials are forbidden in chat, flags, standard input, environment variables, protocol payloads, screenshots, recordings, and evidence. Callers receive only the opaque local `browserProfileId`; they never receive a filesystem path, cookie, token, storage state, authorization header, account name, or form value.

Studio provisions the exact project/target/environment/origin binding and opens only its named persistent profile. The concrete Playwright adapter derives its contained directory from `workflows-<project-id>-<target-id>-<random-suffix>` below the ignored local-store root. Never reuse a profile across targets or fall back to the ordinary agent browser. Missing Playwright or a configured headed browser that cannot launch is `AUTH_SESSION_CAPABILITY_UNAVAILABLE`, not permission to bypass the gate.

Studio remains the sole long-lived owner of the persistent context and exposes only a private loopback broker plus an opaque `usersession_…` lease target. Register `browser.user-session` contract version `1.0` and `browser.control` with the same adapter identity. CLI verification delegates to that owner and fails closed when it is unavailable. Browser actions and evidence must resolve the leased opaque reference through the same owner; a generic browser is never a substitute. Studio shutdown disposes its contexts and matching broker descriptor.

After direct sign-in, request bounded non-secret marker candidates and let the person confirm one route, accessible role, and accessible name. Verify the confirmed non-secret marker before requesting the first action lease and after any authentication challenge. The runner independently verifies that exact marker before each run and immediately before every already-governed consequential action; the existence of a profile or a prior `lastVerifiedAt` value is not readiness proof.

On a clear marker failure with no uncertain lease, the runner records `authentication.required` and enters `awaiting-authentication`. Reopen the same profile through Studio, let the person sign in, then send `agent.authentication.verify` with the current run revision from the same owning host. Do not capture evidence while setup or reauthentication is incomplete. If an action outcome is uncertain, reconcile first and never replay it: `completed` records the classification without advancing the workflow step; training remains paused. Only `not-executed` may return to authentication verification. If continuation is unavailable, safely stop and start a fresh run. Clear the browser-owned profile before removing its binding; retain `clear-failed` and expose retry when browser cleanup fails.

## Sequence

1. `inspect` with `{}`. It does not require `expectedRevision`; use only its immutable target and manifest viewport.
2. Use the current CUA Chrome API and the documentation returned by its browser entry point. Select `chrome` explicitly, create a fresh controlled Chrome tab for this run, and retain that tab/session handle through cleanup. Do not reuse a pre-existing or user-owned tab for workflow execution or evidence capture. A separate Chrome skill is not required; do not stop because it is absent from the catalog. Follow the available API documentation for controls and uploads, without inventing methods.
3. Set the manifest viewport and capture a `fullPage: false` probe from the same handle. Parse untouched raw bytes with `inspectScreenshotBytes` and record actual dimensions. A viewport mismatch alone does not block claim or functional execution. Advertise only demonstrated capabilities. If capture is unavailable or malformed, omit screenshot capability and continue independent actions; record affected screenshot-dependent steps as blocked. Never crop, resize, convert, or substitute bytes.
4. `claim` with `{ "hostInstanceId": "host_..." }`, then register demonstrated browser operations independently from screenshot evidence. Structurally valid captures may advertise `evidenceTypes: ["screenshot"]` with a finite `constraints.maxBytes` even when actual dimensions differ from the manifest.
5. For each step, `propose` one reversible action batch. Use only a returned lease whose decision is `allowed` and whose `expiresAt` has not passed.
   Verify its `leasePolicy` equals the inspection/manifest snapshot. New Training, replay, and evaluation launches use runner-selected `authorized-codex-browser-v1` rolling/hard/threshold 120/300/90 seconds. Explicit legacy Training policies remain 30/120/15 for `standard` and 120/300/90 for `supervised-codex-browser`; use the runner-returned policy hash. Use the selected timing policy; do not forge lease timestamps.
6. Execute that batch with the documented CUA Chrome API on the retained tab. After every navigation, reassert the manifest viewport on that same tab before observation or evidence capture.

Propose the actions needed for the current step. When using a declared routine action batch, copy its executor fields exactly so the runner can validate the batch. Other proposals receive leases without approval prompts. Available capabilities, step order, lease timing, and evidence requirements still apply.

For a referenced routine dismissal, issue its exact before-state screenshot with `optionalHandlerId` set to the attached handler, then register it under the automatic parent lease. Ordinary evidence omits this field; shared checkpoint text does not make artifacts interchangeable. Authorize with parent lease, handler, and evidence IDs only; the runner returns the pinned named-dialog/Close scope and contract hash. Apply exactly that scope and complete it at the immediately next revision using the authorization ID and identical IDs. Include the handler evidence in commit. Generic Close/Escape, extra capabilities, caller-authored executor fields, stale or replayed authority, and second application fail closed.
7. For screenshot evidence, read [evidence.md](evidence.md) before issuing a slot or staging bytes.

8. `commit` the lease result and complete step assessment. Set `artifacts` and every evidence reference to registered artifact ID strings only.
   Optional structured `notes` have a `kind`, `text`, and same-commit evidence IDs.
9. Repeat from `inspect`. Release only when no lease is active.

Use only response `timing.runnerNow` and `timing.activeLease` for lease decisions. Heartbeat before expiry when `remainingSeconds` is at or below the pinned threshold or `heartbeatRecommended` is true. The runner derives the new expiry as `min(runnerNow + rollingSeconds, hardExpiresAt)`. At runner time `>= expiresAt`, do not heartbeat, issue/register evidence, or commit. An identical request that was already durable may be retried with the same request ID and replay the exact cached response, including its original timing, after expiry.

## Honest capability boundary

For recorded training capability gaps, read [capability-gaps.md](capability-gaps.md). Screenshot capability gaps can be recorded in any phase; continue independent steps and block only steps that need unavailable proof.

## Recovery

- On `REVISION_CONFLICT`, inspect and rebuild the request against current state; do not reuse the request ID with changed input.
- Retry an identical evidence request with the same request ID after interrupted response delivery. The runner reconstructs the exact response.
- On `LEASE_EXPIRED`, stop browser mutation and inspect. The first fresh request at or after the exact expiry durably records the runner-owned expiry; this never asserts whether the external action executed. If that request is inspect, it returns the reconciliation state. Any other command records expiry, returns `LEASE_EXPIRED`, and must be followed by inspect. Lease-scoped evidence slots and optional authority are invalidated. Reconcile the named uncertain lease. A non-resumable evaluation is then closed as abandoned so it cannot enter a release-and-claim loop; preserve it and launch a fresh evaluation rather than retrying the possibly executed action.
- On ownership or reconciliation errors, do not claim success from visible state alone.

## Fresh-agent handoff

Before a production run, start a new Codex agent in the repository root. Ask it to report whether `agent-workflows` appears in the skill catalog supplied to that fresh session and to read the installed contract through `$agent-workflows`. Keep that report with the readiness audit. Do not treat a directory listing or the installer test as runtime discovery evidence.

An execution error can coexist with an active lease: the durable attempt receipt prevents replay before the lease expires. Do not heartbeat or repeat an uncertain attempt. Use `run emergency-stop` with the current revision and active lease, then inspect and reconcile; otherwise inspect after expiry to trigger lease recovery. A `preparation` diagnostic alone is not proof of nonexecution after a crash. For a completed execution interrupted before commit, retrieve its existing screenshot slot and register the staged evidence before committing while the lease remains valid. Preserve uncertain attempts and check owned fixture cleanup before a fresh run.
