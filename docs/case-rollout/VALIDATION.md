# Complete premium case-study rollout — validation

Application source: `e50d7269f9e91b89a786a30c2d164b7a38277cc2`. The owner approved the five pilots at `dded916353a8f2e85426b3f8acf85180e763aac3`; the same branch and draft PR #19 now contain all eleven approved presentations. Original pilot evidence and reports remain unchanged under `artifacts/case-premium/`.

## Required checks

| Command                                                         | Actual result                                     |
| --------------------------------------------------------------- | ------------------------------------------------- |
| `npm run build`                                                 | PASS — 22 routes                                  |
| `npm run check`                                                 | PASS — 178 files; zero errors, warnings or hints  |
| `npm run lint`                                                  | PASS                                              |
| `npm run format:check`                                          | PASS                                              |
| `npm test`                                                      | PASS — 46 tests                                   |
| `npm run test:build`                                            | PASS — 6 tests                                    |
| `npm run test:publication`                                      | PASS — 1 isolated publication/withdrawal workflow |
| `playwright test --config playwright.case-rollout.config.ts`    | PASS — 42 tests                                   |
| `playwright test --config playwright.case-regression.config.ts` | PASS — 74 tests                                   |
| Homepage image-expansion checks in `motion.spec.ts`             | PASS — 3 tests, 390/768/1440px                    |

The all-case suite passed on its first frozen-build run with zero failures, skips or flaky results. It covers all eleven presentations at 320, 390, 768, 1024, 1440 and 1920px; unique loaded artwork, captions and responsive bounds; all eleven mosaics and accessibility at mobile/desktop; canonical routes and neighbors; metadata/publication gates; all six existing case loops and five static cases; keyboard/touch; one-time reveals and native reverse scrolling; live preference changes; reduced motion, Save Data, no JavaScript and blocked scripts. Wide-lead image tests inspect the actual selected `srcset` resource descriptor against the rendered width and original source limit.

The preservation suite covers the approved immersive Work index, categories and URL history, static/animated rhythm, existing Home/Work motion budgets, case links, Contact behavior, official social links/attribution and signature footer. Generic case-mask assertions were retired because every current case now uses the premium arrival runtime; its once/reverse/focus behavior is tested directly. The retained homepage expansion tests still pass at all three widths.

## Artwork and source preservation

The [preservation audit](../../artifacts/case-rollout/preservation-checks.json) verifies byte-for-byte equality of the five approved presentation-plan blocks against the approved pilot commit. Canonical project records, approval selectors, original/optimized images, video exports, Work index, About, Services, Contact, header/footer and layout source remain unchanged.

All eleven records retain `contentVerified:false`, `creditApproved:false`, `projectType:unknown` and the existing display approval. Custom SEO proposals remain inactive; default metadata and `noindex,nofollow` remain. Publication checks use real isolated builds, including withdrawal and exclusion of unique image/media output, without changing real records.

The full curation uses 34 selected still placements. Churros has three distinct boards; its retail crop repeats the applications board and is excluded. Khalo/FK use wide three-image compositions, Feed/Abacus two-image compositions, and Churros/Smoothie three-image compositions with their existing motion. Source-board overlap, crop provenance and embedded-text restrictions are documented in [ASSET_CURATION.md](ASSET_CURATION.md).

## Review observations and corrections

No application or test-harness fixes were required after the frozen all-case browser run began. Visual inspection found no title overflow, clipped captions or unusable controls in the six added cases. Abacus fits at 320px without changing its font. Khalo/FK selected 1440px images for 1382px wide frames. New category accents measured 5.91:1–7.93:1 contrast against the page background.

One supplementary homepage-test command initially selected zero tests because its regex was anchored against the fully qualified test name. The selector was corrected; the actual three checks passed. This was a command-selection issue, not an application failure. Prior five-pilot failures/corrections remain recorded in [the pilot validation report](../case-premium/VALIDATION.md).

Raw reports: [all-case acceptance](../../artifacts/case-rollout/browser-tests.json), [preservation regression](../../artifacts/case-rollout/regression-tests.json), [homepage motion](../../artifacts/case-rollout/home-motion-tests.json).

## Captured review evidence

70 full-resolution PNGs and two H.264 browser recordings were captured at the frozen source. Desktop journey: 55.12s; mobile journey: 41.60s. Both show more than nine seconds of actual decoded Churros and Smoothie playback, native forward/reverse scrolling, next/previous project navigation and return to Work. The capture completed with zero page errors and zero failed requests. All screenshots and recordings fully decode; source hashes match the application commit.

All six added cases have desktop 1440×900 and mobile 390×844 arrivals, mosaics, editorial views and full-page stills. Additional Churros views cover 320/768/1024px and reduced-motion, Save Data and no-JavaScript fallbacks. All 70 screenshots and both recordings are linked from the gallery. The 58 approved pilot screenshots and two original pilot recordings remain untouched.

## Evidence and limitations

The [rollout gallery](../../artifacts/case-rollout/README.md) supplements the [approved pilot gallery](../../artifacts/case-premium/README.md). Capture metadata records actual browser input, source hashes, viewports, artwork and decoded playback state. No video seeking, synthesized frames or injected presentation CSS is used. Full-page stills use a separate software compositor to avoid the cloud GPU backend's tall-image repetition.

Browser testing uses Chromium desktop and touch/viewport emulation. Physical iOS Safari/Android, other browser engines and field performance remain unverified. Original raster resolution limits detail; crops are visual perspectives rather than independently verified deliverables. Existing embedded source claims/contact strings/menu history are not transcribed into editorial claims, metadata or structured data. Live Contact email remains unconfigured/unverified; provider response tests are mocked. The signature hand/plaque remains its layered raster prototype.

No merge, deployment, Netlify mirror update, new project facts, credit verification or custom SEO approval was performed.
