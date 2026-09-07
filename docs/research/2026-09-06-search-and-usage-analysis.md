# YTgify search, product usage, and next tools

Research date: September 6, 2026. Sources: authenticated Google Search Console in Chrome; PostHog project **Experimental Apps (422537)**, filtered to `ytgify.com`; live website; repository commit `194178b`. No product code or analytics settings were changed.

## Findings that matter

**Search is growing, the web converter has early usage, and discovery is the largest immediate opportunity.** Google traffic is growing around “YouTube to GIF no watermark.” The homepage captures almost all clicks. The new local-file converter records successful GIF creation, but Google currently reports it as unindexed, and repeat usage is unproven.

### Search growth is specific and measurable

Search Console, Web search, August 8–September 4 versus July 11–August 7:

| Metric           | Previous 28 days | Latest 28 days |                 Change |
| ---------------- | ---------------: | -------------: | ---------------------: |
| Clicks           |              122 |            224 |                 +83.6% |
| Impressions      |            3,792 |          6,284 |                 +65.7% |
| CTR, displayed   |             3.2% |           3.6% | +0.4 percentage points |
| Average position |             31.4 |           42.6 |          Worse overall |
| Homepage clicks  |              121 |            223 |                   +102 |

The aggregate position decline does not mean every important query lost rank. The winning query improved sharply, while low-ranking blog impressions expanded. The tutorial received 1,714 impressions versus 443, at position 64.3 versus 55.4, and still delivered only one click. The blog index received 862 impressions versus 167 and no clicks. This changing mix helps explain the worse sitewide position.

| Query                             | Latest clicks | Previous clicks | Latest impressions | Latest CTR | Position, previous → latest |
| --------------------------------- | ------------: | --------------: | -----------------: | ---------: | --------------------------: |
| youtube to gif no watermark       |            60 |               9 |                251 |      23.9% |                   9.9 → 4.2 |
| youtube to gif                    |            19 |              15 |                685 |       2.8% |                 20.8 → 22.4 |
| ytgify                            |            17 |              23 |                 32 |      53.1% |                   1.0 → 1.0 |
| youtube video to gif no watermark |             6 |               0 |                 37 |      16.2% |                   7.3 → 4.7 |
| youtube gif downloader            |             3 |               0 |                 61 |       4.9% |                  11.5 → 7.1 |

The first query alone accounts for 51 of the 102 additional sitewide clicks. Preserve the homepage’s accurate “free, no watermark” positioning. Broad “YouTube to GIF” remains a larger impression opportunity, but its average position is outside the first page. Do not treat its low CTR purely as a title-writing problem.

Across June 5–September 4, the site received 496 clicks and 13,284 impressions. The homepage received 494 clicks; the main tutorial received two. Current organic acquisition is overwhelmingly the product landing page, not the blog.

Source: [Search Console performance comparison](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aytgify.com&metrics=CLICKS%2CIMPRESSIONS%2CCTR%2CPOSITION&num_of_days=28&compare_date=PREV).

### The converter is usable but not currently indexed

Google’s stored inspection for `/video-to-gif` says **“Discovered – currently not indexed,”** with no recorded crawl and discovery through the sitemap. Its September 6 live test says **“URL is available to Google”**: smartphone fetch successful, crawling allowed, indexing allowed, correct self-canonical.

Therefore this is not an observed robots/noindex/fetch failure. The exact reason Google has deferred indexing is not established. Request indexing after reviewing the page, strengthen relevant editorial links, and check for an actual Google crawl and indexed status afterward. A live-test pass or indexing request does not guarantee indexing.

The performance table shows 98 converter impressions and zero clicks in the latest period, versus four impressions and zero clicks previously. Those impressions share the homepage’s `#demo` and `#install` figures exactly. They may reflect sitelink appearances or reporting differences; they do **not** establish that the converter ranks independently for “MP4 to GIF.” The current URL inspection is the stronger evidence of indexing status.

The September 3 coverage report lists five indexed URLs and ten excluded URLs. Relevant exclusions:

- Discovered, not indexed: converter; `/blog/youtube-to-gif-free-no-watermark`; terms of service.
- Crawled, not indexed: `/blog/best-gif-settings-for-social-media`; two tag archives.
- Three redirects and one noindex URL also exist. Exclusion counts alone are not proof of defects; intentional redirects and noindex pages can be correct.

Prioritize the converter and useful guides over tag archives and legal pages. Existing metadata, sitemap inclusion, and crawlability are already present; more meta keywords are not the missing fix.

Sources: [Converter inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aytgify.com&id=ZScrKIqP2o0G9prtDvqACw), [Index coverage](https://search.google.com/search-console/index?resource_id=sc-domain%3Aytgify.com), [converter source](https://github.com/ytgify/ytgify.com/blob/194178b/app/video-to-gif/page.tsx).

## Is the new web tool being used?

**Yes: telemetry records successful exports and download clicks from a small set of browser identities.** July 12–September 4, including the launch period:

| Step                 | Unique visitors | Events |
| -------------------- | --------------: | -----: |
| Open converter       |              94 |    151 |
| Select a source file |              29 |     41 |
| Source loads         |              23 |     31 |
| Start GIF export     |              15 |     27 |
| Export succeeds      |              13 |     24 |
| Click Download GIF   |              12 |     20 |

An ordered, one-hour, person-based funnel produces the same unique counts. Page-to-download conversion is 12.8%; file-selection-to-download conversion is 41.4%; export-start-to-success conversion is 86.7%. The biggest measured loss is before selecting a source: 65 of 94 visitors do not do so. The reasons for abandonment are not directly recorded.

Recent activity is increasing:

| Measure                  | July 11–August 7 | August 8–September 4 |
| ------------------------ | ---------------: | -------------------: |
| Converter visitors       |               25 |                   69 |
| Visitors selecting files |                8 |                   21 |
| Successful exports       |                3 |                   21 |
| Unique exporters         |                2 |                   11 |
| Download clicks          |                2 |                   18 |
| Unique downloaders       |                2 |                   10 |

This is early traction, not established repeat adoption. Four visitors opened the converter on multiple days. Five exporters made multiple exports, but **none of the 13 exporters exported on more than one calendar day** in the observed window. This is descriptive, not a fully matured retention cohort; recent visitors have less follow-up time, and anonymous identities can reset.

Mobile is already viable: 19 converter visitors, six file selectors, three exporters, and three downloaders. In Search Console, mobile supplied 69 of 224 latest-period clicks (30.8%); desktop supplied 153 and tablet two. The desktop-only extension path leaves a meaningful mobile audience to serve, although their YouTube intent may differ from the local-file converter’s capabilities.

### Measurement caveats, investigated rather than ignored

All 151 converter page events and 24 successful exports classify as `Automation / no_user_agent`. This is explained by the converter privacy filter removing `$raw_user_agent`; those events have no raw user agent, while ordinary site pageviews retain it. PostHog explicitly categorizes missing user agents this way. This label should not be used to discard all converter usage. Of 94 converter identities, 93 also had ordinary site activity classified Regular; all 12 downloaders did. That supports legitimate early use but does not certify that every identity is an external human customer.

Standard `$pageview` events are deliberately suppressed on converter paths. Use `studio_page_view` for the converter denominator. Otherwise standard web analytics can make the tool appear unused.

`source_page` is derived from `document.referrer`. During client-side navigation, that can remain the original external referrer instead of the immediately previous site route. Consequently “external” is not a reliable measure of direct entry to the converter. Track the actual internal entry placement with a coarse category, and keep media, filenames, captions, full referrer URLs, and precise location private.

Caption events are also misleading as totals: 115 `studio_caption_added` events came from just three visitors. The code emits on non-empty text updates; only two of 24 successful exports actually contained captions. Do not read those 115 events as 115 caption users or a strong reason to build a separate caption product.

The success screen already asks what tool to add next, but `studio_next_tool_selected` was absent from the discovered event taxonomy. There is no recorded preference evidence here to choose an optimizer versus screen recording or sharing.

Sources: [PostHog project](https://us.posthog.com/project/422537), [privacy filter](https://github.com/ytgify/ytgify.com/blob/194178b/lib/studio/posthog-privacy.ts), [controller](https://github.com/ytgify/ytgify.com/blob/194178b/app/studio/useStudioController.ts), [PostHog traffic classification](https://github.com/PostHog/posthog.com/blob/master/contents/docs/web-analytics/bot-detection.mdx).

## What is working across the existing product?

The website recorded 578 distinct pageview visitors and 97 extension download-click visitors in the launch-period window. These are website/ZIP-download signals, not proof of successful extension installation or in-YouTube GIF creation. The 24 visitors with install-step-completed events are checklist interaction, not verified installations.

Exploratory attribution using each identity’s first recorded site pageview in this window shows:

| Referrer     | Site visitors | Converter visitors | Converter downloaders | Extension downloaders |
| ------------ | ------------: | -----------------: | --------------------: | --------------------: |
| Google       |           378 |                 66 |                     9 |                    66 |
| Direct       |            81 |                 10 |                     2 |                    10 |
| Brave Search |            42 |                  3 |                     0 |                     7 |
| Bing         |            25 |                  5 |                     1 |                     1 |
| ChatGPT      |            23 |                  5 |                     0 |                     6 |

Google is already connected to nine of the 12 converter downloaders, even though the converter has no direct Google clicks. This supports a homepage-to-tool acquisition path. ChatGPT contributes some extension intent, but the sample is too small to declare a separate AI acquisition strategy successful. Attribution is first observed within the window, not lifetime first touch, and does not join individual Google search queries to people.

## Recommended order of work

1. **Make current demand easier to satisfy.** Preserve the YouTube/no-watermark homepage. Present two clear routes near the primary action: “From YouTube — extension” and “From a video file — use online.” Give mobile visitors an accessible local-file route. The current desktop navigation is hidden below its medium breakpoint. Do not imply that the web tool accepts a YouTube URL; it does not.
2. **Resolve discovery of the converter and strongest guides.** Request indexing for the valid converter; add useful, contextual links from the tutorial and settings guide; improve those guides with actual examples and practical troubleshooting. Verify indexed status and non-branded converter query impressions before creating many new landing pages. Existing guides delivered almost no clicks, so a bulk blog expansion is not yet supported by this site’s results.
3. **Improve first-file success.** Ten recorded selection failures comprise four `source_too_long`, four `decode_failed`, and two `unsupported_file`. Clarify browser codec limitations and recovery; explore selecting a short segment from a longer local source while retaining bounded frame processing and memory safeguards. Do not simply remove safety limits.
4. **Build file-size targeting into the existing converter.** Twelve of 24 successful exports are 5–25 MB; the other 12 are 0–5 MB. Add an estimated size, a user-chosen size target, automatic resolution/FPS tradeoffs, and a preview of the result. This is the strongest adjacent-tool hypothesis from output data, although users have not directly said file size was a problem. A standalone GIF optimizer can follow if people use and return to this feature.
5. **Add cropping/resizing and reusable export presets next.** Let users keep the relevant region and export for their intended destination. Reuse the current trim/render pipeline. Validate demand with actual selections and downloads. Caption polish can fit here; a separate caption product is premature.
6. **Treat screen-to-GIF as a later experiment.** It could remove the need to locate a source file for product demos, but current search data is predominantly YouTube-related and provides little direct evidence for screen recording. YouTube Shorts, high-quality output, subtitles, sound, and longer GIF queries exist only in tiny counts; none justifies a large standalone build yet. GIFs do not carry audio; a sound-preserving feature would require a video output format.

Keep the product promise consistent: fast, free, no watermark, local processing, and a usable result with few decisions. Avoid adding accounts or cloud sharing before there is evidence that users need them.

## A practical validation cycle

Start with measurement cleanup and entry-path clarity, then ship the file-size improvement as one focused iteration. Track weekly unique successful exporters; ordered converter-view → file-load → export → download conversion; upload failures by reason; exports using size targets; and repeat exports on another day with adequate follow-up time. Keep extension download intent separate from verified extension activation.

With only 12 observed downloaders, a fragmented multi-variant A/B test would be hard to interpret. Prefer a focused release, before/after counts with explicit dates, and a short optional post-export feedback question. Label demo/sample-file usage separately if adding a “try an example” flow, so demonstrations do not inflate customer exports.

## Method and limits

- PostHog’s governed metric catalog was empty. These are exploratory, noncanonical definitions, not saved or approved KPIs.
- Trends/funnel calls explicitly enabled the project’s test-account filter (cohort 307192). This is not proof that all personal QA is excluded. SQL diagnostics reproduce the principal counts but do not apply a new inferred customer cohort.
- All product data is restricted to the production hostname and dates before this research session. Current research browsing cannot inflate the reported counts.
- The typed trends response labels end dates at midnight despite explicit end-of-day input. The ordered funnel reports the explicit end-of-day boundary, and independent SQL using `timestamp < '2026-09-05'` reproduces 151 views, 24 exports, and 20 download clicks. Previous-period totals were separately checked with explicit dates.
- Search Console date boundaries and PostHog UTC boundaries differ. They are compared directionally, not reconciled as identical click/session totals. Search Console hides some queries, and per-page impression totals need not sum to property totals.
- Download clicks do not verify successful filesystem saves; an export event does not certify visual quality or customer satisfaction. No customer media or session recordings were accessed.
- The repository launch merge is July 12; that is the analysis anchor, not a verified deployment timestamp.
- Code inspection, Google’s live crawl test, event-schema checks, cross-event identity aggregation, and explicit date checks support the findings. No end-to-end media QA or production modifications were performed for this research request.
