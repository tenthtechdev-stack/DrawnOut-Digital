# Phase 4 validation — cinematic motion

Phase 4 extends the approved Phase 3 merge `8ae8de991b6768564b92b61ed4078d3e84a9a731` on `phase4/cinematic-motion`. Validation uses Node 24.19.0, npm 11.9.0 and installed Chromium in the managed cloud workspace.

## Actual final results

| Check                      | Observed result                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run verify`           | Passed: Astro/TypeScript, ESLint, unit tests and production build |
| Astro / strict TypeScript  | 65 files; 0 errors, 0 warnings, 0 hints                           |
| ESLint                     | Passed, no diagnostics                                            |
| `npm test`                 | 23 passed; 0 failed or skipped                                    |
| Production build           | Passed; 6 static routes                                           |
| `npm run test:build`       | 3 passed; 0 failed or skipped                                     |
| `npm run test:publication` | 1 integration test passed, exercising 3 isolated builds           |
| Complete Playwright suite  | 75 passed; 0 failed or skipped; 1.2 minutes                       |
| `npm run format:check`     | Passed after final documentation assembly                         |
| `git diff --check`         | Passed                                                            |

The four automated suites total **102 passing tests**: 23 unit/content/policy, 3 production-output, 1 publication integration and 75 browser cases. The three isolated publication builds are steps of one test; focused/diagnostic runs are not counted again.

The production build logs two expected Astro empty-collection notices because no project is approved for production. It emits six static routes and zero portfolio WebPs. These notices are separate from the clean Astro/TypeScript diagnostics.

## Publication and approved-layout preservation

All eleven records remain private drafts with unknown commissioning status, false publication/credit/factual approvals and empty services. Content records, source originals, existing derivatives, public selectors, schema, publication loader, MediaSlot, global design tokens and static footer have no changes from the Phase 3 baseline. No video-placeholder section was redesigned. There is no stock or fabricated footage.

The production output suite inspects generated routes, HTML/CSS/JavaScript, metadata and asset names for private content. The publication integration test performs three isolated builds with a synthetic record: visual-only approval, verified factual content, and withdrawal. Actual project records are never edited by that test.

A cold-load mobile check caught an inherited Triarch wrapper shrink-to-fit issue, also reproduced with reduced motion and no GSAP. Setting its width explicitly to the existing final 85% composition reserves the correct geometry before lazy decoding; the prior 125px page-height jump is covered by the expansion geometry check.

All **75** historical committed PNG screenshots retain their SHA-256 hashes. Browser runs use a temporary working directory; only new Phase 4 evidence is copied into this branch. Existing navigation, homepage, Work filters/history, private case previews and accessibility regression tests remain intact.

## Browser and recording reproduction

Run standalone checks and builds before starting development. The publication-aware Astro image map differs by mode; restart development after changing modes. Do not enable project approvals to obtain private previews.

```sh
npm run verify
npm run test:build
npm run test:publication
npm run format:check
npm run dev -- --port 4321
```

In a second shell:

```sh
mkdir -p /tmp/drawnout-phase4-review
cd /tmp/drawnout-phase4-review
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-phase4-review/test-results
node /workspace/drawnout-digital/scripts/capture-motion.mjs \
  --out /tmp/drawnout-phase4-review/artifacts/phase-4
```

Motion checks cover native scrolling/readability/overflow at 320, 390, 768, 1440 and 1920px. Home, Work and Bunzo gallery expansion are exercised in both directions at 390, 768 and 1440px, comparing actual computed clips and stable image/document dimensions. Additional checks cover Work reflow, resize, repeated initialization, persisted page lifecycle, live reduced-motion toggling, no JavaScript, blocked GSAP imports and keyboard focus visibility. Undelayed startup regressions at 390, 768 and 1440px sample actual animation frames: each phrase must start clipped, complete its entrance and never re-hide after becoming fully visible; a 1,400ms library delay must restore static content after the 900ms watchdog and never replay on late initialization. Existing coverage also exercises 360 and 1024px, navigation focus trapping and restoration, skip links, category URL/history and private-route protection.

## Actual visual evidence

The [GitHub review gallery](../artifacts/phase-4/README.md) contains 39 new PNGs: three settled heroes plus four expansion states for each of Home/Work/case at three widths. Intended scroll progress is approximately 0.08, 0.50, 0.98 and 0.08 in reverse. The captures use real native scrolling and Chromium document-space image capture; no animation progress is manually sought. The [evidence manifest](../artifacts/phase-4/motion-evidence.json) records actual progress, clipping and dimensions.

Two full recordings capture real Chromium compositor frames from page load through homepage, Work/filter and case gallery, including forward and reverse scrolling. Eight-second GIF excerpts are derived from those MP4s, for inline GitHub playback. The MP4s use H.264 with 8-bit 4:2:0 sampling, fast-start metadata and no audio. The capture code preserves native document scroll and never mocks animation state.

All 39 PNGs decode correctly; their combined size is 10,610,706 bytes. Captured scroll progress differs from its target by at most 0.0006. The media surfaces keep fixed dimensions in each four-state group.

| Full recording     | Viewport   | Encoded duration | MP4 bytes | GIF bytes |
| ------------------ | ---------- | ---------------- | --------- | --------- |
| desktop-motion.mp4 | 1440 × 900 | 37.800s          | 5,226,196 | 2,975,083 |
| mobile-motion.mp4  | 390 × 844  | 38.000s          | 2,467,968 | 2,903,311 |

Both MP4s decode completely without errors. `ffprobe` confirms H.264 at 30 encoded frames/second and full-range 8-bit 4:2:0 sampling (`yuvj420p`); the MP4 `moov` box precedes `mdat` for fast-start playback. Desktop contains 1,134 encoded frames and mobile 1,140. The recorder's desktop wall clock is 38.269 seconds with five backpressure skips; mobile is 37.959 seconds with no skips. Encoded duration differs by about 0.47/0.04 seconds respectively. The fixed encoded frame rate is a recording format, not a measured hardware rendering guarantee.

The desktop GIF is 640 × 400 at 7 sampled frames/second with 128 palette colors. Mobile retains 390 × 844 at 6 sampled frames/second with 64 colors to stay below 3 MB. Each contains an actual eight-second forward/reverse excerpt from its corresponding whole recording. Visual inspection includes the ordered hero entrance, desktop/mobile expansion framing and reverse states; undelayed startup regressions separately verify actual painted clips/opacity at all three review widths.

## Performance implications and limits

The final safe production output contains **123,103 raw bytes / 48,463 gzip bytes** of external JavaScript in three chunks. The motion entry is 10,397 raw / 4,054 gzip bytes. The optional GSAP and ScrollTrigger chunks together are 112,706 raw / 44,409 gzip bytes. The homepage also contains 4,422 raw bytes of inline scripts, including its bootstrap. These figures describe generated files, not a real visitor's measured transfer. Dynamic imports avoid the library chunks for reduced motion, data saving, and routes without eligible motion targets.

Generated CSS totals 63,692 raw bytes across output files, not a single page transfer. Production contains zero project WebPs. No client framework or second motion/scroll dependency was introduced.

A 900ms homepage-only pre-paint gate prevents the fully visible headline from flashing before entrance. Reduced motion, history/hash destinations and early hero focus opt out; late/failed enhancement restores static content and skips replay. No-JavaScript HTML never acquires the gate.

The hero animates transforms on two gradient layers rather than animating filters or background positions. It pauses offscreen and when hidden. Image dimensions remain reserved; expansion changes clipping and inner-image transforms without moving captions or changing document flow. No pin spacers, global wheel/touch interception, forced horizontal scrolling or competing scroll engine is introduced. Reduced motion and data saving skip GSAP imports and retain static content; the small motion entry module still loads.

Actual requestAnimationFrame interval samples during each recording:

| View / route   | Samples | Median / p95 ms | Intervals >50ms | Layout-shift sum | Long tasks / total |
| -------------- | ------- | --------------- | --------------- | ---------------- | ------------------ |
| 1440px / Home  | 1280    | 16.7 / 16.8     | 2               | 0.0002           | 1 / 106ms          |
| 1440px / Work  | 472     | 16.7 / 16.8     | 0               | 0.0080           | 0 / 0ms            |
| 1440px / Bunzo | 448     | 16.7 / 33.2     | 0               | 0.0015           | 0 / 0ms            |
| 390px / Home   | 1312    | 16.7 / 16.8     | 1               | 0.1090           | 1 / 59ms           |
| 390px / Work   | 477     | 16.7 / 16.7     | 1               | 0.1110           | 0 / 0ms            |
| 390px / Bunzo  | 465     | 16.7 / 16.7     | 1               | 0.1100           | 0 / 0ms            |

These page-wide measurements include initial loading and Work filtering. Layout-shift values are raw sums excluding entries marked recent input, not session-window CLS calculations. A separate reduced-motion diagnostic identifies the inherited mobile startup shift: deferred navigation replaces the no-JavaScript link row with the compact menu, moving `main` from y=178 to y=125 (53px; shift score 0.10865). The same change occurs with GSAP disabled. Navigation source and its fallback behavior are preserved in this phase; this is a known startup performance limitation, separate from the stable scroll-scene dimensions. The [load diagnostic](../artifacts/phase-4/layout-load-diagnostic.json) records the observed elements/rectangles. The recorded mobile sums must not be described as zero layout shift or a passing Core Web Vitals result.

These are instrumented cloud Chromium observations with compositor recording/encoding overhead, not a physical-device benchmark or production Core Web Vitals audit. Physical iOS/Android devices, Safari/Firefox and native Windows/PowerShell are unavailable here. The implementation uses restrained mobile amplitudes, but smoothness on ordinary real devices still needs visual review on that hardware.

## Delivery and boundary

The implementation, capture utility, complete gallery and validation were committed as [`bc846bc3344e50f2d2a55d697fce7c8a1fde00a3`](https://github.com/tenthtech/drawnout-digital/commit/bc846bc3344e50f2d2a55d697fce7c8a1fde00a3). `git push -u origin phase4/cinematic-motion` succeeded, and GitHub's branch API returned that exact SHA. [Draft pull request #3](https://github.com/tenthtech/drawnout-digital/pull/3) is open against `main` from the correct dedicated branch.

Authenticated GitHub API verification retrieved all **45 evidence files**: 39 PNGs, two MP4s, two GIFs and two JSON measurement files, totaling **24,218,124 bytes**. Every file matches its committed local bytes and Git blob SHA. The images decode correctly; both MP4s were fully decoded locally before retrieval, and the retrieved video bytes match those verified recordings. All **51 relative gallery targets** exist in GitHub's complete committed tree.

Remote `main` remains at approved Phase 3 merge `8ae8de991b6768564b92b61ed4078d3e84a9a731`. Nothing was force-pushed, merged or publicly deployed. A documentation-only follow-up records this successful retrieval and may advance the review branch beyond the implementation checkpoint; the PR shows its latest head.

No hosted CI configuration is introduced; local test results are not represented as hosted checks. The signature hand/logo footer remains Phase 5. Video/media planning and actual project publication require their separate tasks and approvals.

**Stop after Phase 4 for review. No merge, public deployment or Phase 5 work.**
