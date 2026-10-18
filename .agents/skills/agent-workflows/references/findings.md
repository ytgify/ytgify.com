# Capture evaluation findings

After an evaluation run is completed, use `workflow report RUN_ID --store PATH` to select an exact durable step note. Write a strict `agent-workflow-finding-input/v1` JSON file containing only `schema`, `stepId`, `noteIndex`, `lens` (`id` and `label`), `severity`, `title`, and `recommendation` (plus optional `verification` as described below), then run `workflow findings create RUN_ID --file PATH --store PATH --json`. UX, security, accessibility, reliability, and custom lens IDs follow the same contract.

Never copy note text, evidence metadata, hashes, timestamps, workflow revision, platform, status, or finding identity into the input; the CLI derives them from the completed evaluation. An identical retry is safe and returns the same finding. Use `workflow findings list WORKFLOW_ID --store PATH --json` or `workflow findings show WORKFLOW_ID FINDING_ID --store PATH --json` to reread the independently verified projection. Do not use this command for training, replay, incomplete, or non-evaluation runs.

## Correction contracts and verification

New finding input may additionally contain `verification: {criteria:[...]}`. Each criterion has `id`, `expectedCorrection`, `applicablePlatforms` and `evidenceRequirements`. State the actual defect correction; for a missing filename, require the loaded filename and removal of the contradictory empty-selection message. Canonical preview checks alone do not verify that correction.

For an existing finding, write `{ "criteria": [...] }` and run `workflow findings verification WORKFLOW_ID FINDING_ID --file CONTRACT.json --store PATH --json`. This appends an immutable agent-authored contract; it does not rewrite the original finding or claim a fix. Missing historical contracts are “Correction criteria not recorded.”

After the authorized implementation fix and any required Training revision, execute targeted verification against the corrected candidate on every applicable platform. Record and persist targeted assessments before launching fresh full desktop/mobile evaluations. Use `workflow findings verify WORKFLOW_ID FINDING_ID --run RUN_ID --file CHECKS.json --store PATH --json`, where the file contains `checks`, each with `criterionId`, `stepId`, `noteIndex`, `artifactIds`, and `assessment: {outcome:"passed",actor:{kind:"agent",id:"host_example"},statement:"Observed correction",implementationCommit:"40-character git commit"}`. The implementation commit is agent-supplied provenance, not a runner attestation of deployment.

Retain the returned verification receipt IDs. After both fresh full runs finish on that same newer candidate, place those IDs in a JSON array and call `workflow findings resolve WORKFLOW_ID FINDING_ID --desktop-run RUN_ID --mobile-run RUN_ID --commit SHA --verification RECEIPTS.json --store PATH --json`. Canonical-only reruns cannot close new findings. Historical canonical-only resolutions remain historical; never claim they satisfy new contracts. Reinspect after recording to verify current evidence remains intact.

To relate two findings from the same issue, use `workflow findings relate WORKFLOW_ID --file RELATION.json --store PATH --json` with `{findingIds:[...],reason:"Shared observed issue"}`. Each finding remains independent: resolving one never automatically resolves its sibling. Agent correction assessments are not human acceptance.
