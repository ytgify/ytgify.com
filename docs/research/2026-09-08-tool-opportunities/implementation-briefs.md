# Four tool work packages

Selected by the owner: GIF compressor, GIF crop/resize, GIF-to-MP4, and screen-to-GIF. Animated emotes and accounts are outside this implementation scope. Each package begins with focused acquisition research, then implements a bounded useful tool with real media verification. Separate research may proceed independently; shared media infrastructure should be integrated in sequence.

## Common research deliverable

Use the existing September 8 report as a baseline, not as a new traffic forecast. Current Keyword Planner settings were United States, English, Google, August 2025–July 2026. Compressor, resizer and GIF-to-MP4 displayed 10k–100k average monthly searches each; crop GIF and screen-to-GIF displayed 1k–10k. These overlapping ranges must not be added together as total traffic.

For each package:

1. Expand a bounded set of exact, task-specific keyword seeds and inspect Search Console for related existing impressions. Use Keyword Planner historical metrics with explicit location, language, network and dates. Preserve displayed ranges and missing values. If useful, run a separately labeled global comparison; never combine it with the US totals.
2. Group synonyms and close variants by underlying job. Keep branded/navigation, informational and tool-intent searches separate. Record which variants share metrics and avoid double counting. Report an observed demand envelope only where the evidence supports it; explain unresolved overlap rather than inventing an exact total.
3. Inspect representative live Google results for the broad task and two focused intents, if accessible. Record date, visible location/device context, leading tool URLs, ads and other result features, and whether the query expects a file upload, desktop application or tutorial. Read the most relevant competitors directly. Do not equate advertiser competition with SEO difficulty.
4. Separate category search demand from obtainable site traffic. If presenting low/base/high traffic scenarios, show the assumed ranking distribution and click-through rate; label those inputs as assumptions, not measured forecasts. Do not multiply every keyword by the same optimistic CTR.
5. Recommend a canonical route, one useful MVP, the clearest differentiation and a concise acquisition measurement plan. Competitor claims are not verified output quality unless tested. Do not create campaigns, change bids, buy data subscriptions or publish media for research.

## Package 1 GIF compressor

Research seeds: gif compressor, reduce gif size, optimize gif, compress animated gif, compress gif to 5mb, gif under 1mb, gif compressor for discord. Check whether size-specific queries are one shared intent or distinct tasks before creating pages.

Product outcome: open an existing animated GIF, set a size budget, preview and download a measured result. Support a bounded re-encoding strategy and honest reporting when acceptable settings cannot meet the target. Offer a useful result even if an already-optimized input cannot be made smaller. Preserve timing, loop behavior and transparency where supported; disclose any intentional changes.

Own the reusable animated-GIF decoder/compositor and its source metadata contract, in a clearly named shared media module, alongside compressor-specific UI, optimization logic and tests. The existing converter reads HTMLVideoElement sources; it does not supply animated-GIF decoding. The current GIF encoder is RGB-oriented and does not configure an explicit transparent index, so transparency preservation needs deliberate implementation and fixtures.

Acceptance evidence: (1) actual bytes meet the requested limit or the UI honestly reports failure; (2) partial-frame/disposal/transparency and variable-delay fixtures animate correctly; (3) malformed or oversized inputs and cancellation recover without freezing the page. Also preserve existing video-to-GIF exports.

## Package 2 GIF crop and resize

Research seeds: gif resizer, resize animated gif, crop gif, gif dimensions, resize gif online, crop animated gif, resize gif for discord. Distinguish changing pixel dimensions from reducing bytes.

Product outcome: accept an animated GIF, crop a region or specify dimensions, choose fit/pad behavior, and preview the animated output at useful sizes. Crop and resize are one coherent tool. Reuse Package 1's decoder contract once integrated rather than introducing another decoder. Own geometry transforms, crop interaction, route content and relevant fixtures; propose shared changes explicitly.

Acceptance evidence: (1) exported dimensions and selected crop match the preview, including scaled pointer coordinates; (2) animation timing, transparency and aspect-ratio behavior remain correct; (3) keyboard/mobile controls and extreme dimensions recover safely under the memory budget.

## Package 4 GIF to MP4

Research seeds: gif to mp4, convert gif to video, animated gif to mp4, gif to mp4 online, gif to video converter. Separate reverse MP4-to-GIF and unrelated video editing searches.

Product outcome: accept animated GIF input, choose sensible loop repetition and an opaque background, and download a real playable MP4. GIF input has no audio to recover. Do not substitute WebM bytes with an MP4 filename or promise universal encoding support without testing. Reuse Package 1's decoder/compositor. Own video encoding/muxing adapter, capability detection, GIF-to-MP4 UI and tests.

Acceptance evidence: (1) inspect the actual container/codec and play the export in the supported browser matrix; (2) variable frame durations, repeated loops and transparent source backgrounds produce the intended result; (3) unavailable codec support, large input and cancellation have a usable recovery path. Verify current primary browser/library documentation before selecting the encoder.

## Package 5 Screen to GIF

Research seeds: screen to gif online, record screen as gif, browser screen recorder gif, screen capture gif, screen to gif mac. Separate navigational searches for the ScreenToGif desktop product and software-install intent from demand for an online tool.

Product outcome: explicitly start a short screen/window/tab capture, stop it, trim and export through the existing video-to-GIF path. Do not request capture permissions on page load. Display support limits and keep capture local. Own screen-capture adapter, recording controls, route content and tests. Avoid duplicating the converter's export pipeline.

Acceptance evidence: (1) permission denial, user cancellation and browser-level Stop Sharing leave no active tracks or stuck UI; (2) a real moving-screen recording exports as a correctly timed GIF; (3) unsupported browsers/mobile and long recordings have clear limits and recovery. Automated permission mocks alone do not constitute a real capture test; arrange a supported manual fixture when necessary.

## Integration and execution

Research for all four packages can proceed independently. Integrate the GIF decoding/compositing contract from Package 1 before Packages 2 and 4 consume it. Package 5 can build independently around the existing video input/export flow, with final converter integration coordinated after shared changes settle. Separate worktrees isolate edits but do not remove contract or merge dependencies.

All packages follow AGENTS.md and docs/engineering-standards.md, keep conversion anonymous and local, preserve analytics privacy, and include a working indexed-route candidate with useful copy and internal links. Indexability can be verified locally; Google indexing and rankings require post-deployment evidence. Do not declare meaningful media work complete on a build alone. Deliver a reviewable implementation and validation receipt; deployment is a separate action.

Planning verification: code inspection confirms video-only extraction, a reusable frame delay field and RGB palette encoding; this prevents treating all four as mere page wrappers. Keyword overlap and branded screen-capture intent are explicit research risks. Shared ownership and sequencing address duplicate decoder implementations and merge conflict risk. No production behavior changed in preparing these briefs.
