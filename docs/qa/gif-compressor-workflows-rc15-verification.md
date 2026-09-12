# GIF compressor Workflows rc.15 verification

Date: 2026-09-12

## Result

The GIF compressor journey completed training and evaluation on desktop and mobile with synthetic repository media. Independent neutral, UX, mobile UX, and adversarial perspectives retained their own journey outcomes, quality assessments, criterion coverage, evidence, and provenance. Agent execution and quality assessment were never presented as human acceptance; no human acceptance was recorded.

The final consumer check installed exact `@lineagehq/workflows@0.2.0-rc.15` from GitHub Packages. Package provenance, generated guidance, project configuration, workflow definitions, Studio assets, and the local evidence store passed Workflows doctor checks.

Studio reused the durable rc.13 evidence store without rerunning the converter lifecycle. Desktop UX versus adversarial preserved passed/clear 5/5 required coverage versus passed/unassessed 6/7, including the explicit missing racing-actions scenario. Mobile UX versus neutral preserved passed/clear 3/3 versus passed/clear 1/1. Both responsive comparisons showed **Independent Results · No Combined Verdict**, retained exact run evidence, and did not infer human acceptance.

## Application findings and fixes

Dogfooding found and fixed two GIF compressor issues:

- The loaded GIF now identifies its filename without simultaneously showing an empty picker message.
- Invalid target values remain editable, receive an accessible error, do not start compression, and recover through a valid preset.

The browser tests cover empty, zero, negative, over-maximum, and sub-byte targets; focus and `aria-invalid`; worker non-execution; successful recovery; smaller output; and retained frame timing.

## Evidence boundaries

The responsive mobile pass used a 393 by 852 browser viewport with no horizontal document overflow and ordinary vertical access to the download action. This is browser viewport evidence, not a physical-device or hardware claim. The preserved adversarial racing-actions gap remains unassessed coverage, not an observed application failure.

## Verification

- Exact rc.15 package installation and Workflows doctor: passed.
- TypeScript, formatting, and repository preservation checks: passed.
- Desktop and mobile persona comparison: passed.
- Existing durable store checksums remained stable apart from the ephemeral Studio broker binding.
- No new Ytgify defect remained after the two bounded fixes.
