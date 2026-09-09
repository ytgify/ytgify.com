# Compressor research follow-up

Observed September 8, 2026, in the existing signed-in Google Ads and Google Search browser context. This begins A1; the corresponding three-query expansions for resize, MP4, and capture remain outstanding.

## Keyword Planner

Current controls: United States, English, Google, Last 12 months; adult ideas excluded. The earlier same-day date-range inspection established August 2025–July 2026. Reused those controls for this narrower query. Submitted: gif compressor, reduce gif size, optimize gif, compress animated gif, compress gif to 5mb, gif under 1mb, gif compressor for discord.

| Visible keyword            | Average monthly searches |
| -------------------------- | ------------------------ |
| gif compressor             | 10k–100k                 |
| compress animated gif      | 10k–100k                 |
| change size of a gif       | 10k–100k                 |
| reduce gif size            | 1k–10k                   |
| optimize gif               | 1k–10k                   |
| gif compressor for discord | 1k–10k                   |
| gif file size reducer      | 1k–10k                   |
| animated gif optimizer     | 1k–10k                   |

Do not sum these ranges. The first two share displayed metrics and plausibly overlap substantially. “Change size” can mean pixel dimensions or bytes. The two size-specific seeds did not appear among the captured visible rows; that is not evidence of zero search volume. Advertiser competition was Low for the displayed rows, which is not an organic-ranking difficulty metric.

## Three live Google queries

Desktop browser; results explicitly labeled personalized. No controlled location or device-emulation claim. These are an observed result ordering, not a universal ranking report. No sponsored block appeared in the captured accessibility result text; that does not establish ad-free results elsewhere.

| Query                      | Observed leading organic tool destinations                                                                                                                                                                                                                                                                       | Other result features                                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| gif compressor             | [Ezgif](https://ezgif.com/optimize), [Cloudinary 1 MB](https://cloudinary.com/tools/compress-gif-to-1mb), [ImageKit](https://imagekit.io/tools/compress-gif/), [PicsSizer](https://www.picssizer.com/gif-compressor), [VEED](https://www.veed.io/tools/video-compressor/gif-compressor)                          | Image results mixed GIF tools with mechanical compressors; related searches included precise byte targets and Discord.                                                                                 |
| compress gif to 5mb        | [Cloudinary 5 MB](https://cloudinary.com/tools/compress-gif-to-5mb), [HTML5 Animation to GIF](https://html5animationtogif.com/OptimizeCreative), [Ezgif](https://ezgif.com/optimize), [XConvert](https://www.xconvert.com/compress-gif)                                                                          | Videos and Reddit discussions intervened. A fifth standalone organic tool was not established; FreeConvert appeared in an additional result feature and is not counted as a fifth ranked organic tool. |
| gif compressor for discord | [Ezgif](https://ezgif.com/optimize), [BulkPicTools](https://bulkpictools.com/tools/gif/gif-compressor), [Cloudinary 256 KB](https://cloudinary.com/tools/compress-gif-to-256kb), [PicsSizer](https://www.picssizer.com/gif-compressor), [Gumlet](https://www.gumlet.com/image-tools/gif-compressor-for-discord/) | Reddit discussions appeared between tools; image/video material and related searches referenced 256 KB, banners, and larger attachments.                                                               |

The intent is predominantly a file-processing tool, with tutorial/discussion content around quality and fitting limits. Platform names alone do not identify one stable size limit, so the MVP should keep numeric presets generic and allow a custom target.

## Competitor pages inspected directly

[Ezgif](https://ezgif.com/optimize) documents upload/URL input, several compression strategies, duplicate-frame removal, and a separate target-size compressor. Its page says uploads are deleted after one hour. [ImageKit](https://imagekit.io/tools/compress-gif/) already advertises local browser processing, no registration, and batch ZIP download. These are published claims, not outputs or network behavior we independently tested. [Cloudinary](https://cloudinary.com/tools/compress-gif-to-1mb) provides a dedicated size-target landing page.

Implication: neither “local processing” nor “choose a target size” is unique. The proposed advantage is the complete experience: straightforward measured target fitting, explicit quality/dimension tradeoffs, reliable transparent animation, honest failure reporting, and useful handoff to the existing converter and future tools. We must prove that experience with our corpus before claiming superior quality or privacy.

## Scope recommendation

Keep `/gif-compressor` as the primary candidate. Use reduce/optimize/target-size wording naturally on one useful page; avoid numerous thin size-specific pages. Keep resize as a separate user job and route. Maintain anonymous local processing; login offers no demonstrated advantage for this one-file task.

No exact traffic forecast is defensible from overlapping broad ranges. Measure route impressions/clicks and coarse upload→export→download outcomes after launch. This document does not close A1: the remaining tools, full evidence capture, and final demand envelope are still needed at G0.
