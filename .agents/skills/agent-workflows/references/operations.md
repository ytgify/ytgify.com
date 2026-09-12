# Operate a run

Read [protocol.md](protocol.md) for transaction shapes and [lifecycle.md](lifecycle.md) for proof and recovery requirements.

For a bounded candidate loop, use `workflow evaluate desktop|mobile --journey "stable product words" --json` after Ready discovery. The positional forms `workflow evaluate desktop PATH` and `workflow evaluate mobile PATH` remain compatibility interfaces for existing automation that already holds a trusted definition path; they are not the human-to-agent handoff. The workflow must declare exact `routineActionBatches` for every step; the fresh 1440x900 desktop or 393x852 mobile run starts without launch approval and pins runner-only `routine-codex-browser-v1`. After completion, use the returned run identity internally with `workflow report RUN_ID --store PATH`; never ask the person to copy it. The report and Studio report endpoint are restart-stable projections of durable events and reverified screenshots, not acceptance.

1. Create one stable `host_...` ID for this host session.
2. Send `agent.inspect` and use only its immutable `target.url`. Use the current CUA Chrome API and the documentation returned by its browser entry point. Select `chrome` explicitly, create a fresh controlled Chrome tab for this run, and retain that tab/session handle through cleanup. Do not reuse a pre-existing or user-owned tab for workflow execution or evidence capture. A separate Chrome skill is not required; do not stop because it is absent from the catalog. Follow the available API documentation for controls and uploads, without inventing methods.
3. Set the manifest viewport and capture a `fullPage: false` probe from the same handle. Parse untouched raw bytes with `inspectScreenshotBytes` and record actual dimensions. A viewport mismatch alone does not block claim or functional execution. Advertise only demonstrated capabilities. If capture is unavailable or malformed, omit screenshot capability and continue independent actions; record affected screenshot-dependent steps as blocked. Never crop, resize, convert, or substitute bytes.
4. Claim the unowned run and register only capabilities proved by that pre-claim probe. Read the returned pinned `leasePolicy`; never request or invent a policy.
5. Follow the runner's current step. Send `agent.propose` before every browser mutation and continue only when it returns an unexpired allowed lease.
6. Execute one bounded Chrome action batch under that lease. After every navigation, reassert the manifest viewport on the retained Chrome tab before observing or capturing evidence. Stop on an unexpected state or expired lease.
7. For declared screenshot checkpoints, read [evidence.md](evidence.md). Stage only untouched, structurally validated captures from this run and tab. The runner records actual dimensions and capture geometry. A mismatch cannot prove exact-size or visual-layout expectations; assess those as blocked, and continue independent work.
   The runner derives actual dimensions from bytes; caller-supplied dimensions cannot override them.
8. Commit only runner-returned artifact IDs and assess every expectation once, in order. Never supply artifact paths, hashes, sizes, timestamps, or IDs.
9. Inspect after each transaction and use the returned revision for the next mutation.
10. Use only response `timing.runnerNow` and `timing.activeLease` for the lease budget. When `remainingSeconds` is at or below `heartbeatThresholdSeconds` (or `heartbeatRecommended` is true), send one identical-scope heartbeat before expiry. It extends only to `min(runnerNow + rollingSeconds, hardExpiresAt)`.

Propose the actions needed for the current step. When using a declared routine action batch, copy its executor fields exactly so the runner can validate the batch. Other proposals receive leases without approval prompts. Available capabilities, step order, lease timing, and evidence requirements still apply.

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
