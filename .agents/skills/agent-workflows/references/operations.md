# Operate a run

Read [protocol.md](protocol.md) for transaction shapes and [lifecycle.md](lifecycle.md) for proof and recovery requirements.

For a bounded candidate loop, use `workflow evaluate desktop|mobile --journey "stable product words" --json` after Ready discovery. The positional forms `workflow evaluate desktop PATH` and `workflow evaluate mobile PATH` remain compatibility interfaces for existing automation that already holds a trusted definition path; they are not the human-to-agent handoff. The workflow must declare exact reviewed `routineActionBatches` for every step; the fresh run starts without launch approval at the platform viewport pinned in the immutable manifest (`default-desktop` resolves to 1440x900, while explicit geometry is preserved) and pins runner-only `routine-codex-browser-v1`. After completion, use the returned run identity internally with `workflow report RUN_ID --store PATH`; never ask the person to copy it. The report and Studio report endpoint are restart-stable projections of durable events and reverified screenshots, not acceptance.

1. Create one stable `host_...` ID for this host session.
2. Send `agent.inspect` and use only its immutable `target.url`. If the manifest pins `authentication.mode: user-session`, follow [authentication.md](authentication.md): use only `workflow browser execute` and `workflow browser stage-upload`, which resolve the Studio-owned opaque session and its leased tab; never create or substitute a generic browser tab. Otherwise use the current CUA Chrome API, select `chrome` explicitly, create a fresh controlled tab for this run, and retain it through cleanup. Do not reuse a pre-existing or user-owned tab.
3. For a user-session run, verify Studio broker and opaque-session readiness without capturing evidence or opening a generic browser. Register only the Studio broker's verified `browser.user-session`, `browser.control`, screenshot, and optional `file-upload` contracts. Exact screenshot evidence is available only after claim, proposal, lease, and slot issuance; the authenticated broker applies the immutable manifest viewport and writes its `fullPage: false` capture only to that slot. For other runs, set the manifest viewport and capture a `fullPage: false` pre-claim probe from the retained handle. Parse untouched raw bytes with `inspectScreenshotBytes` and record actual dimensions. Never crop, resize, convert, or substitute bytes.
4. Claim the unowned run and register only capabilities demonstrated by the applicable readiness check: Studio-owned broker/session verification for a user-session run, or the retained-tab pre-claim probe for another run. Read the returned pinned `leasePolicy`; never request or invent a policy.
5. Follow the runner's current step. Send `agent.propose` before every browser mutation and continue only when it returns an unexpired allowed lease.
6. Execute one bounded action batch under that lease. User-session actions, uploads, and their screenshot must use the authenticated broker; other runs use the retained Chrome tab and reassert the manifest viewport after navigation. Stop on an unexpected state or expired lease.
7. For declared screenshot checkpoints, read [evidence.md](evidence.md). Stage only untouched, structurally validated captures from this run and tab. The runner records actual dimensions and capture geometry. A mismatch cannot prove exact-size or visual-layout expectations; assess those as blocked, and continue independent work.
   The runner derives actual dimensions from bytes; caller-supplied dimensions cannot override them.
8. Commit only runner-returned artifact IDs and assess every expectation once, in order. Never supply artifact paths, hashes, sizes, timestamps, or IDs.
9. Inspect after each transaction and use the returned revision for the next mutation.
10. Use only response `timing.runnerNow` and `timing.activeLease` for the lease budget. When `remainingSeconds` is at or below `heartbeatThresholdSeconds` (or `heartbeatRecommended` is true), send one identical-scope heartbeat before expiry. It extends only to `min(runnerNow + rollingSeconds, hardExpiresAt)`.

Propose the actions needed for the current step. Routine evaluation accepts only a declared immutable batch copied exactly from inspection; a missing or unmatched batch is denied. Available capabilities, authentication, step order, lease timing, and evidence requirements still apply.

To author those batches from reviewed supervised work, export a clean completed Training run with `workflow routine-actions export RUN_ID --output REVIEW.json`. Review the exact recorded batches and change only the top-level `reviewed` flag to `true`, then run `workflow routine-actions apply WORKFLOW_PATH --review REVIEW.json --output NEW_WORKFLOW_PATH`. The runner validates the source run, exact committed actions, workflow hash, authenticated action vocabulary, and synthetic-input policy, writes a new candidate revision, and stores its durable review attestation. Authenticated candidate evaluation rejects a missing or mismatched attestation. It never infers selector actions from natural-language journey text and never records human acceptance.

If a referenced optional handler appears under an automatic routine lease, issue its declared before-state screenshot with the exact attached `optionalHandlerId`, capture and register it, then send `agent.optional-state.authorize` with only parent lease, handler, and evidence IDs. Ordinary evidence omits `optionalHandlerId`; never reuse one kind for the other even when checkpoints match. Apply only the returned workflow-derived named-dialog `Close` scope, and immediately send `agent.optional-state.complete` with the issued authorization ID and identical IDs. Never replay, generalize, or apply it twice; include its evidence in the step commit.


## Local synthetic training

When the user has authorized disposable local testing, configure `localDogfood: { syntheticData: true, workflowIds: [exact-workflow-id] }` on that config-v1 local application target. Use the existing `workflow train --journey "stable product words" --json` with the standard lease policy and no target URL override. Only explicit local loopback origins and listed workflows qualify. The runner pins `local-synthetic-v1`, records the launch directly without approval events, and returns a run ready to claim without a terminal challenge.

Copy only the current step's exact `routineActionBatches`; synthetic fixture create/delete actions can use those pinned browser batches. Credentials, input references, arbitrary adapters, unmatched actions, and off-origin navigation do not inherit local authority. Current configuration is rechecked before leases and Studio-owned browser execution; removed or changed scope blocks work. Inspect failure instead of requesting terminal approval. Keep the existing lease, evidence, authentication, and cleanup contracts. The completed training run is local dogfood evidence, not human lifecycle acceptance. Do not promote it or rewrite an old manifest to add this policy.

## Record perspective coverage

For each independent batch member, use its pinned rubric and the ordinary lease/reset/cleanup protocol above. Perspective text never grants new browser actions. The workflow's `evaluation.perspectiveScenarios` maps scenario IDs to declared step IDs. Missing mappings are coverage gaps; changing action scope requires revising the definition through Training. Do not equate a canonical empty-input check with malformed-file, boundary-value, repeated-action or race coverage.

After observing the exact run, record each criterion with `workflow perspectives assess RUN_ID --file ASSESSMENT.json --store PATH --json`. Input contains `criterionId`, `outcome` (`satisfied`, `finding`, `unassessed`, or `out-of-scope`), a specific `reason`, and `observations`. Each observation references `scenarioId`, `stepId`, and exact `noteIndex` or `artifactId` from this run. A finding assessment puts its native `findingId` inside each matching `observations[]` entry alongside the exact source step and note; `findingId` is not a top-level input field. Do not copy evidence from another member. Use `supersedesAssessmentId` only to explicitly correct the current recorded assessment; reread conflicts instead of overwriting.

Semantic input failures return `VALIDATION_FAILED` with structured details, including missing scenario IDs when evidence does not cover the pinned criterion. Correct the input against the same run; do not treat validation failure as an internal runner fault. For newly created assessments, immutable `createdAt` records when the assessment was first persisted. Exact retries and preexisting records retain their stored timestamp. Legacy records may contain the run launch time; do not reinterpret that field as fresh assessment activity.

When no declared malformed-file scenario exists, record that criterion as `unassessed` with that reason and no invented evidence. Missing criteria are never automatically satisfied. Required missing or out-of-scope coverage blocks quality clearance without changing a passed journey's canonical outcome. Inspect the batch and report canonical, quality, and coverage separately. Captured viewport evidence cannot establish physical-device behavior or exact layout when dimensions mismatch.


### Finding assessment input example

Save this shape as `ASSESSMENT.json` and pass it to `workflow perspectives assess RUN_ID --file ASSESSMENT.json --store PATH --json`. Replace the example finding ID, step and note with the verified native finding from that same run. The example assumes the pinned workflow maps both `load-source` and `loaded-state` to `upload-synthetic`; use the actual declared mapping. IDs below illustrate input shape and are not evidence.

```json
{
  "criterionId": "loaded-source-identity",
  "outcome": "finding",
  "reason": "The preview shows loaded media while the source control still says No file chosen.",
  "observations": [
    {
      "scenarioId": "load-source",
      "stepId": "upload-synthetic",
      "noteIndex": 0,
      "findingId": "finding_00000000000000000000000000000000"
    },
    {
      "scenarioId": "loaded-state",
      "stepId": "upload-synthetic",
      "noteIndex": 0,
      "findingId": "finding_00000000000000000000000000000000"
    }
  ]
}
```
