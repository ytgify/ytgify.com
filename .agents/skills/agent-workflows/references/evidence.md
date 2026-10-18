# Screenshot evidence

## Mobile browser configuration

Apply this checklist whenever creating, exploring, training, replaying, or evaluating a mobile workflow, including resumed work.

- In Chrome, enable Chrome DevTools Device Mode and select the iPhone 16 preset at 393 × 852 CSS pixels. Verify both Device Mode and the selected preset visibly before testing; resizing the desktop window is insufficient. If the preset is unavailable or its dimensions differ, report the discrepancy instead of claiming the requested configuration.
- In the Codex built-in browser, use its supported viewport override to set 393 × 852 CSS pixels. Call this responsive viewport testing, not full iPhone emulation. Use only documented capabilities available in the current browser session.
- Verify the actual content viewport before testing, after every navigation or reload, and whenever work resumes in a new turn. Reapply the configuration if it reset. Record the browser, mode, selected preset when applicable, and observed CSS viewport. Screenshot pixel dimensions alone do not establish the CSS viewport or Device Mode because device pixel ratio may differ.
- Exercise the relevant user flows, inspect rendered results, and capture important states and failures. For runner-managed evidence, retain the original bytes and use issued slots under the existing lease contract.
- If Chrome automation clicks fail, try supported native Chrome controls and verify the visible result. If the mode, viewport, or required interaction cannot be verified, report the limitation and leave the affected checks unverified.
- Neither Chrome Device Mode nor the built-in browser viewport override establishes real iPhone/Safari compatibility.

Keep the runner's pinned viewport and authenticated-session isolation contract authoritative. If the requested configuration conflicts with that contract, report the mismatch before testing; do not silently change the run or switch an authenticated session to another browser. Reset any viewport override during host cleanup.

## Capture a checkpoint

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

## Downloaded GIF evidence

For a declared `download-artifact` checkpoint with an exact filename, `image/gif` MIME type, and minimum byte size, advertise `download-content` in the host capability. Issue an `agent.evidence` slot with `type: download-content` and the browser download's `filename`, then save the original downloaded bytes to the returned staging path. Register the slot immediately under its active lease and commit the returned artifact ID along with required screenshots.

The runner validates GIF headers, palettes, frame bounds, LZW pixels, animation limits, trailer, and declared minimum size. It retains content-hashed `.gif` bytes and records filename, dimensions, frame count, and duration. GIF evidence is distinct from screenshots and has no viewport geometry. Other download MIME types remain unsupported. Limits are 10 MiB (or the capability's lower limit), 1,000 frames and 100 million decoded pixels; plain-text GIF extensions are unsupported. Both protocol 1.0 and 1.1 use this contract. Never substitute a screenshot or host assertion for a required downloaded artifact.
