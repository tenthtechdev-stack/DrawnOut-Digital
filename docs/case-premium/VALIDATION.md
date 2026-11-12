# Stage 2 — five-pilot validation

Application source: `67e08543767c08df8993bc75997813e2fb6e32b2`. The branch is `feature/work-case-studies-premium`, stacked on Work PR #18 at `e3c0f3bf8ad90fb3f6e690828d160fd31ca8a01e`. Final evidence/report changes are committed separately. Five pilots are implemented; the six remaining case-study routes retain the original component.

## Required checks

| Command                                                         | Actual result                                     |
| --------------------------------------------------------------- | ------------------------------------------------- |
| `npm run build`                                                 | PASS — 22 routes                                  |
| `npm run check`                                                 | PASS — 176 files; zero errors, warnings or hints  |
| `npm run lint`                                                  | PASS                                              |
| `npm run format:check`                                          | PASS                                              |
| `npm test`                                                      | PASS — 46 tests                                   |
| `npm run test:build`                                            | PASS — 6 tests                                    |
| `npm run test:publication`                                      | PASS — 1 isolated publication/withdrawal workflow |
| `playwright test --config playwright.case-premium.config.ts`    | PASS — 28 tests                                   |
| `playwright test --config playwright.case-regression.config.ts` | PASS — 74 tests                                   |
| `motion.spec.ts` filtered to legacy case image expansion        | PASS — 3 tests; 390, 768 and 1440px               |

The 28 focused checks cover all five pilots at 320, 390, 768, 1024, 1440 and 1920px; unique artwork placements; the four-, three- and two-piece variants; loaded images and intrinsic dimensions; title/caption bounds; selected image resolution; keyboard/touch navigation; all eleven routes and approved neighbors; one-time reveals and native reverse scrolling; existing video source selection, pause, visibility and decoder behavior; reduced motion, Save Data, disabled JavaScript, blocked scripts and live preference changes. The five pilot accessibility scans at mobile and desktop returned no violations for the selected WCAG A/AA rules. Automated scans do not establish complete accessibility conformance.

The 74 preservation checks include the approved immersive Work index, filters/history, six existing Home/Work motion options, static/animated rhythm, case-study navigation, Contact form behavior, official social links/attribution and the signature footer. The existing generic case-expansion test now targets an unchanged legacy case, Churros; all three tested widths pass. Tests use isolated output directories to preserve prior milestone artifacts.

All eleven canonical project records, their approval flags, publication selectors, artwork files and twelve existing landscape/portrait video exports remain unchanged. `contentVerified:false`, `creditApproved:false` and `projectType:unknown` remain intact. The existing SEO override gate and preview-wide `noindex,nofollow` remain. Publication tests perform real builds in a disposable source copy and verify approval, factual/credit separation, withdrawal and unique-media exclusion; no real records are modified.

## Original failures and corrections

- Initial TypeScript checking found 14 unchecked test-array/count accesses and 2 nullable closure accesses in the scoped motion script. Types and null narrowing were corrected; the final 176-file check is clean.
- [Initial browser run](../../artifacts/case-premium/browser-tests-initial.json): 19/27 passed. Seven failures exposed the same real SOL mobile issue: its wide notice board rendered only 40.83px high at 320px and 51.19px at 390px. The mobile mosaic now uses full-width artwork rows. [Before-fix proof](../../artifacts/case-premium/mobile-notices-before-fix.png) is retained.
- The eighth initial failure was a transient 404 while `/work/capture` was requested during a concurrent rebuild. Final browser batches used frozen production output; no route workaround was added.
- Desktop visual inspection found excessive empty framing around Capture's landscape collage and several static companion images. Capture now has a landscape lead above two complementary views; static companion frames use intrinsic proportions. SOL's wide notices sit above its identity/signage details. Approved artwork was neither cropped into fabricated portraits nor regenerated.
- [Corrected intermediate run](../../artifacts/case-premium/browser-tests-before-resolution-fix.json): 27/27 passed. Visual review then identified that Capture's full-width lead still declared a 49vw source size, selecting an 800px resource for a 1382px display. The lead now declares its actual full-width size, and a new meaningful source-resolution regression passes in the final 28-test run.

Final raw reports: [28 pilot tests](../../artifacts/case-premium/browser-tests.json), [74 preservation tests](../../artifacts/case-premium/regression-tests.json), [3 legacy motion tests](../../artifacts/case-premium/legacy-case-motion-tests.json).

## Captured evidence

58 final review PNGs and two H.264 browser recordings were captured at the frozen application source, with zero page errors and zero failed requests. Desktop journey: 40.36s; mobile journey: 37.44s. Each journey measures nine seconds of visible decoded playback for SOL and nine for Bunzo, then native reverse scrolling and real case/Work navigation. Arrival, mosaic, editorial and full-page views cover all five pilots at 1440×900 and 390×844; extra SOL views cover 320, 768 and 1024px plus static fallbacks. The diagnostic before-fix image is separate from the 58 final captures.

## Evidence and practical limits

See the [five-pilot comparison gallery and recordings](../../artifacts/case-premium/README.md). The capture manifest records actual viewport/scroll geometry, image loading, playback state, source hashes, browser version, errors and capture method. Native browser input drives the recordings; no animation/video timeline is sought or synthesized. Full-page stills use a separate software compositor to avoid the cloud GPU backend's known tall-image repetition.

Bunzo has five meaningful image placements instead of repeating its full applications board. Triarch has three distinct safe perspectives: the overlapping full board with scope/pricing copy is excluded. SOL has five placements, Capture three and By Tech Group two. Several images are detail crops from the same original board, not independent deliverables. See the [asset audit](ASSET_CURATION.md).

Dense original boards and small raster derivatives limit detail at very large sizes. Existing approved rasters may contain embedded names/contact strings or figures; none is transcribed into public copy, metadata or claimed outcomes. Draft research SEO remains inactive. Contact delivery tests use mocked provider responses; live email remains unconfigured/unverified. The inherited signature hand/plaque remains a layered raster prototype.

Cloud Chromium desktop and touch/viewport emulation were tested. Physical iOS Safari, Android, Firefox and field performance are not verified. Owner visual approval of these five pilots remains required before extending the system to the other six cases.

No merge, public deployment or Netlify mirror update was performed.
