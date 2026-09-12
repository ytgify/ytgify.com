# Screenshot evidence

For a screenshot requirement, call `evidence` with:

```json
{
  "action": "issue",
  "leaseId": "lease_...",
  "stepId": "current-step",
  "checkpoint": "declared-checkpoint",
  "capabilityId": "browser.control",
  "type": "screenshot"
}
```

Using the retained Chrome tab handle that passed the pre-claim probe, capture and parse the bytes before every staging write:

```js
const screenshotOutput = await tab.screenshot({ fullPage: false });
if (
  !ArrayBuffer.isView(screenshotOutput) ||
  screenshotOutput.BYTES_PER_ELEMENT !== 1 ||
  Object.prototype.toString.call(screenshotOutput) !== "[object Uint8Array]"
) throw new Error("Browser screenshot did not return bytes");
const screenshotBytes = new Uint8Array(
  screenshotOutput.buffer,
  screenshotOutput.byteOffset,
  screenshotOutput.byteLength,
);
const { inspectScreenshotBytes } = await import("@lineagehq/workflows/evidence");
const screenshot = inspectScreenshotBytes(screenshotBytes);
// Keep actual dimensions; the runner labels viewport mismatches.
const { writeFile } = await import("node:fs/promises");
await writeFile(slot.stagingPath, screenshotBytes, { flag: "wx" });
```

The inspector validates structure and derives dimensions from untouched bytes; it does not certify visual correctness. Never capture through a different handle. Keep the configured viewport on the retained tab, reassert it after navigation, and reset it during cleanup. Registration preserves actual dimensions and labels `captureGeometry` as `viewport-match`, `viewport-mismatch`, or `unbound`. A mismatch is retained as deficient evidence, not rejected globally. Visually inspect captures: malformed-looking content cannot prove visual assertions even when structural validation passes.

Only screenshot requirements explicitly declaring `exactViewport: true` require matching pixel dimensions. Never mark exact-size or visual expectations passed using deficient captures. If required screenshot proof is unavailable, commit a blocked assessment with `block: {code: "evidence_unavailable", capability: "screenshot"}` and blocked expectations, recording the precise adapter limitation in notes. Continue independent steps according to the workflow dependency graph. Never silently remove a required checkpoint or rewrite a historical run. Do not substitute standalone test screenshots.

A screenshot evidence declaration with `required: false` is still an eligible checkpoint: issue and register it under the active lease when the observation is useful, and include its artifact ID in the same step commit. Omitting that optional checkpoint does not block an otherwise valid pass. Required evidence remains the smaller set returned by inspection and is the only set used for required-evidence completeness.

Use the dependency-light `@lineagehq/workflows/evidence` export in CUA. If its module resolver cannot resolve package exports, resolve that subpath in ordinary project Node, then import its returned absolute file URL in CUA. Do not import the top-level runner package into CUA; run runner transactions in ordinary Node or the CLI. If parsing fails, preserve raw diagnostic captures separately, without staging corrupt bytes as evidence.

Then register the issued slot:

Workflows has no approval gates for local or production execution. Complete requested launch, execution, retry, resume, replay, promotion, qualification, and evaluation without asking for permission in Workflows. Preserve leases, revision checks, evidence integrity, authentication, and cleanup. Record agent execution and runner validation accurately; optional review never gates completion and must never be presented as human acceptance unless a human actually recorded it.

```json
{ "action": "register", "leaseId": "lease_...", "slotId": "slot_..." }
```

The runner validates the neutral slot and exact bytes as either conforming PNG (including clear chunk reserved bits) or bounded 8-bit baseline JFIF JPEG. JFIF permits only APP0(JFIF), DQT, SOF0, DHT, SOS, and EOI markers; extensions and other JPEG processes are rejected. The runner does not convert Browser output and alone derives canonical `mimeType` (`image/png` or `image/jpeg`) and the durable `.png` or `.jpg` extension. Do not infer format from `slot.stagingPath` or add an extension.

## Classify recorded screen captures

After completing the lease-bound evidence registration and action commit, use
`workflow app-map inspect --run RUN_ID --root PROJECT --json` with the same
project/store context. This read-only queue is derived from registered evidence;
reinspection after interruption recovers exact visits without recreating them.
For each verified unclassified visit, inspect its actual screenshot and use the
app-map proposal protocol in discovery.md. Reuse matching pending proposals;
resolve conflicting proposals against current assignments before creating changes.
If proposal inventory diagnostics are present, recover inventory before proposing.
Classify the actual visible result, including loading or unexpected states, rather
than the expected step outcome. Reuse stable core screens and named variants across
journeys; keep repeated captures as separate visits. A return to a populated screen
usually reuses its populated variant with a contextual state label such as Search
cleared. Classification failure leaves the capture unresolved and never changes
execution evidence, consumes run authority, or blocks a required action commit.
