# Work immersive index — validation

Application source: `e2f9ec5ff56b2588e639e3e9b64efd318c4a66c1`. This milestone is stacked on About PR #16; individual case studies, project records and video exports are unchanged. Final evidence and test-harness updates are committed separately.

## Required checks

| Command                                                         | Actual result                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run build`                                                 | PASS — 22 production routes                                                          |
| `npm run check`                                                 | PASS — 168 files; zero errors, warnings or hints                                     |
| `npm run lint`                                                  | PASS                                                                                 |
| `npm run format:check`                                          | PASS                                                                                 |
| `npm test`                                                      | PASS — 46 tests                                                                      |
| `npm run test:build`                                            | PASS — 6 tests                                                                       |
| `npm run test:publication`                                      | PASS — 1 isolated publication/withdrawal workflow                                    |
| `playwright test --config playwright.work-immersive.config.ts`  | PASS — 18 tests                                                                      |
| `playwright test --config playwright.work-regression.config.ts` | PASS — 56 tests                                                                      |
| Historical Work lifecycle and keyboard browser checks           | PASS — 2 tests; `motion.spec.ts` filtered to those checks, isolated output directory |

The focused production suite verifies actual frame width, height, position, caption alignment, corner changes and native reverse-scroll restoration. It checks header clearance, stable reserved scene dimensions, responsive resizing, all eleven links, native filters and URL history, touch and keyboard operation, one-time titles, video-source continuity, reduced motion, Save Data, disabled JavaScript and blocked scripts. Accessibility scans at 320, 390, 768 and 1440px found no violations within the Work index under the selected WCAG A/AA rules.

The regression suite covers existing portfolio behavior through 1920px, Home/Work video budgets, six deferred motion sources, pause controls, visibility suspension, case-study routes and previous/next links, Contact form states, official contact/social links, footer attribution and reversible signature-footer behavior. Contact provider successes are mocked test responses: live Formspree email delivery remains unconfigured and unverified.

Publication checks exercise the real build in an isolated temporary directory: approved visual records publish without verifying facts or credits; withdrawal removes the route and unique media. All eleven original records, twelve landscape/portrait exports and the existing case-study source files remain unchanged from the About parent.

## Original failures and corrections

- [Initial focused report](../../artifacts/work-immersive/browser-tests-initial.json): 17/18. Aborting external script requests did not block Astro's inline runtime. The failure fixture now blocks both inline and external scripts with a document CSP; it verifies the complete static fallback.
- [Header occlusion proof](../../artifacts/work-immersive/browser-occlusion-before-fix.json): 2 targeted failures demonstrated that full expansion placed captions behind the sticky header. The scroll range was corrected and the acceptance test strengthened to check header clearance.
- [Initial regression report](../../artifacts/work-immersive/regression-tests-initial.json): 51/56. Uniform frames erased the expected aspect-ratio variety. Frames now follow actual artwork/video geometry; empty framing margins were removed. Existing portrait exports were inspected and confirmed as 600×750, with 960×540 landscape exports.
- [Trace collision report](../../artifacts/work-immersive/regression-tests-trace-collision.json): 55/56. A concurrent historical test run cleared a shared parent artifact directory during no-JavaScript context teardown, causing `ENOENT` trace writes. Final batches ran sequentially, with historical checks isolated in their own output directory. No application workaround was needed.
- [Title timing report](../../artifacts/work-immersive/browser-tests-title-timing.json): 17/18. A fast resize assertion sampled a normal title reveal at opacity 0.978766. The readability helper now awaits its settled opacity before checking text bounds; the title animation is unchanged.

The final reports supersede these diagnostic runs: [18 focused tests](../../artifacts/work-immersive/browser-tests.json), [56 regression tests](../../artifacts/work-immersive/regression-tests.json), and [historical Work lifecycle/focus checks](../../artifacts/work-immersive/historical-work-browser-tests.json).

## Capture results

36 valid PNG screenshots and four H.264 browser recordings were captured. Desktop forward/reverse: 44.08s; mobile: 35.36s. Desktop filter/navigation: 22.40s; mobile: 14.08s. Final capture reports zero page errors and zero failed requests. Bunzo and SOL have measured 0/50/100% views at both widths; additional SOL images show the naturally playing signage/applications beat.

The initial Save Data screenshot fixture replaced `navigator.connection` with a plain object and triggered errors in existing event listeners. The [retained diagnostic manifest](../../artifacts/work-immersive/capture-fixture-errors.json) records those errors. The fixture now uses a real `EventTarget`; affected fallback stills were recaptured. The completed normal recordings were preserved, with matching application source hashes. No website code changed for this capture fix.

The inline Work/filter module in production is 3,961 bytes before compression, 1,584 bytes with gzip. This is a transfer-size observation, not a physical-device performance benchmark.

## Evidence and practical limits

See the [GitHub screenshot and recording gallery](../../artifacts/work-immersive/README.md). Recordings use actual Chromium rendering and native browser input at 1440×900 and 390×844. Mobile results are touch/viewport emulation, not physical-device or Safari testing. Native scrolling is retained; the Work enhancement has no idle ticker, added animation dependency, pinned spacer or wheel interception. The inherited video controller still limits mounted playback to one mobile or two desktop decoders and pauses hidden/offscreen content.

The Brandlic reference was blocked by the environment network gateway. As Issue #17 permits, the implementation follows its written behavior brief, without copying reference assets or code. Original artwork resolution remains a limit at large sizes; no new artwork or video has been fabricated. Physical iOS Safari/Android smoothness and final owner visual approval remain review steps. The inherited signature hand/plaque remains a layered raster prototype.

No merge, public deployment, Netlify mirror push, project fact verification or credit approval was performed.
