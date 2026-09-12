# Current-tool keyword messaging

Updated locally on September 8, 2026; not deployed.

The homepage reinforces the proven Search Console query “YouTube to GIF” with “free” and “no watermark,” and explicitly identifies the Chrome extension. The local-file converter and homepage promotion now include “MP4 to GIF,” “video to GIF online,” and “animated GIF maker.” Keyword Planner demand informed these additions; demand ranges are not forecasts of traffic to YTgify.

Changes cover visible descriptions, FAQs, the converter promotion, and shared search/social descriptions. Existing descriptive titles and canonical URLs remain intact. No claims were added for planned tools.

## Acceptance evidence

| Realistic failure mode                                              | Evidence                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keywords imply unsupported capabilities or confuse the two products | Inspected all copy changes. YouTube conversion explicitly requires the Chrome extension; the web tool describes local MP4, MOV, and WebM files. Browser navigation from the homepage promotion reached the converter with its existing entry parameter. |
| Search metadata, structured data, or discovery links regress        | All 26 Chromium tests in smoke, converter SEO, and converter accessibility suites passed against fresh production output. These include titles, descriptions, canonical URLs, FAQ/application schemas, links, and sitemap discovery.                    |
| Longer copy clips on mobile or obstructs the workflow               | Visually reviewed both pages at desktop size and 390 × 844. Text wraps within the page; document width was 380 px against a 390 px viewport on both mobile pages. The homepage converter link remained usable and the upload page rendered correctly.   |

Other checks passed: ESLint (six existing warnings), Prettier, TypeScript, Knip, CI boundaries, 105 unit tests, production build, and public-route verification. The standard pre-push command encountered unrelated generated files under `.worktrees`; equivalent lint and formatting commands passed with that directory excluded. Updated the existing homepage metadata test to match the revised description.

Rebased onto current main before PR creation. Preserved the compact mobile upload layout and shortened its description to “Convert MP4 to GIF online. Trim a moment, add a caption, and download for free.” Repeated all checks above with the updated dependencies, plus desktop and 390 × 844 visual verification of the final converter page.

Residual limitation: these checks establish accuracy and rendering, not a ranking or traffic lift. Search impact can only be evaluated after deployment and recrawling.
