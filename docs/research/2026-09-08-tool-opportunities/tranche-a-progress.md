# Tranche A — initial implementation receipt

Historical first checkpoint. See [implementation-receipt.md](implementation-receipt.md) for the subsequent implementation and current evidence.

Started September 8, 2026, on `codex/gif-tools-foundation`, a fresh worktree based on `origin/main` commit `a338f3f`. No product implementation or release gate is claimed complete.

## Work delivered

- Carried forward the accepted dependency/acceptance plan and research context.
- Built a deterministic fixture-only GIF writer, original-artwork generator, and manifest.
- Generated 19 real binary GIF files: 16 decoded positive cases and three intentionally unsafe/invalid inputs reserved for bounded rejection tests.
- Added 13 diagnostic cases with independently drawn RGBA canvas goldens, plus three larger original tutorial/motion/sticker animations.
- Implemented separate Pillow and gifuct-js inspection paths. All 16 positive files agree frame-by-frame, in raw delays and loop fields; diagnostic output also matches authored goldens.
- Added negative controls that modify actual encoded palette, delay, and loop bytes. Each is caught by the intended assertion; a one-byte-over output fails the byte-limit check.
- Repeated focused Keyword Planner research and three live compressor SERPs. Local processing and size targeting already exist in competitors; differentiation must be demonstrated in the complete experience.

## Three realistic failure modes and evidence

| Failure mode                                                                     | Direct evidence                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The fixture writer and decoder agree on the same wrong animation                 | Independently drawn full-canvas PNGs match Pillow's decoded frames for 13 diagnostic files; a separately implemented gifuct-js adapter agrees. Disposal 2 and 3 intentionally produce different canvases.                                       |
| A harness reports green while ignoring timing, loops, pixels, or size            | Actual encoded palette/delay/loop mutations fail their respective checks; the exact byte-budget negative control fails by one byte.                                                                                                             |
| Test inputs cause unbounded allocation or get mistaken for production acceptance | Huge-canvas and malformed fixtures are marked `decodeForOracle: false`; the manifest inventories their hashes without passing them to unbounded decoders. The receipt explicitly leaves product rejection, performance, and release gates open. |

Machine-readable results are in `fixture-harness-receipt.json`. Reported elapsed time is local fixture inspection time, not a browser benchmark. Dependency setup used the locked Node tree and Pillow 12.2.0; reproduction instructions are in the corpus README.

Validation: all 59 generated GIF/PNG binary hashes reproduced exactly on regeneration. The fixture verifier passed again after regeneration. Repository lint (six pre-existing warnings), formatting, TypeScript, Knip, CI boundary checks, and the 63-test unit suite in this fresh worktree passed. The fixture verifier currently runs through the documented Python command; wiring it into required CI remains an A3 task. No production module changed, so these results are not reported as a new converter export test.

## Gate state and next work

| Node | Status      | Remaining acceptance work                                                                                                                                                                                                                                        |
| ---- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | In progress | Expand resize, MP4, and screen keyword groups and three SERPs each; finish comparable evidence capture and acquisition briefs. Compressor size-specific volume is not yet established.                                                                           |
| A2   | In progress | Complete numbered crop-grid, already-optimized holdout, additional malformed/LZW and frame-count cases; six natural-content samples with verified redistribution provenance. The current three larger samples are original rendered artwork, not camera footage. |
| A3   | In progress | Native browser playback checks, benchmark resource/cancellation/SSIM targets on named desktop/mobile hardware, freeze normalization and support tiers. The independent oracle and negative controls are implemented.                                             |
| G0   | Open        | All A1–A3 receipts must pass before B/C implementation is accepted.                                                                                                                                                                                              |

Existing site GIFs remain a local comparison baseline; their provenance has not been established for new redistribution. No user media was uploaded to competitor tools. No campaigns, accounts, production routes, or deployment settings changed.
