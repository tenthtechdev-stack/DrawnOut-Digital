# PR #4 opening revision — validation

Verified locally on 25 October 2026 on `feature/drawnout-signature-experience`, preserving checkpoint `bba7f698d7ea6075cc299fc40cc0435888727515`. This report covers the corrected opening and shared footer. The previous report is historical. No merge, hosted CI run or public deployment is claimed.

[Current gallery and recordings](../artifacts/signature-opening/README.md) · [Revision handoff](OPENING_REVISION_HANDOFF.md) · [Exact production asset requirements](SIGNATURE_ASSET_PROCESS.md)

## Final automated results

| Check                                 | Actual result                                                 |
| ------------------------------------- | ------------------------------------------------------------- |
| `npm run check`                       | PASS — 82 files; 0 errors, warnings or hints                  |
| `npm run lint`                        | PASS                                                          |
| `npm test`                            | PASS — 27 tests, including four source/layer regression tests |
| `npm run build`                       | PASS — 17 routes, including 11 public case studies            |
| `npm run test:build`                  | PASS — 4 checks                                               |
| `npm run test:publication`            | PASS — 1 integration test with 4 isolated builds              |
| Complete Playwright suite, one worker | PASS — 135 tests; 0 failures, skips or retries; 185.26s       |
| `npm run format:check`                | PASS                                                          |
| `git diff --check`                    | PASS                                                          |

**167 distinct automated tests passed.** The complete browser suite ran after the final implementation corrections. It covers the prior homepage, portfolio, navigation and motion functionality plus revised introduction/footer behavior. Nine axe WCAG scans cover homepage, Work, Bunzo and contact at desktop/mobile, plus open mobile navigation. Automated results supplement visual review; they do not approve the 3D quality or establish universal accessibility.

## Revised opening measurements

| Width | Automatic end from navigation | Wordmark font size / actual text width | Maximum wave/wipe drift |
| --- | --- | --- |
| 320px | 4260.7ms | 54.4px / 228.2px | 0.00000000 |
| 390px | 4254.5ms | 66.3px / 278.1px | 0.00000000 |
| 768px | 4241.6ms | 130.6px / 547.6px | 0.00000000 |
| 1440px | 4259.6ms | 244.8px / 1026.9px | 0.00000000 |
| 1920px | 4258.1ms | 300.0px / 1258.5px | 0.00000000 |

All five responsive probes observed a progressive synchronized wipe, the complete wordmark, two independently moving loaded images and the registered final pose before automatic handoff. Horizontal text bounds fit the viewport and align with the editorial grid. The wordmark layout box stays above Skip; font Range ascender/descender whitespace is recorded separately. The source-pixel tests independently prove that the hand omits the plaque/emblem and that the plaque omits finger-contact pixels, preventing a renamed full composite from passing a DOM-only check.

Keyboard, wheel, touch, pointer and visible Skip exits pass, along with initial-session rules, internal return, direct/hash routes, unavailable storage, delayed modules, failed media, no-JavaScript, reduced motion and data saving. The navigation deadline remains 4.8 seconds and the configured completion remains 4.2 seconds after start; no timing limit was relaxed.

Across 18 instrumented mobile startup scenarios, the maximum header/main/control geometry range was 0.00px and the maximum header-attributed shift was 0.00000. The largest total observed startup shift was 0.02924; these are local probes, not field Core Web Vitals.

Full cases, measured wordmark geometry and independent layer positions are in [browser verification](../artifacts/signature-opening/browser-verification.json).

## Preserved gradient, portfolio and footer

The shader tests verify changing rendered pixels after the intro, autonomous motion without a pointer, desktop cursor response, offscreen/hidden suspension, context loss and CSS/static fallbacks. Choreography tests check native-scroll text/image progression and reversal. Footer tests check separate rise/descent, common final registration, expansion, reversed transforms, stable document height, keyboard enquiry navigation and static fallbacks. No homepage copy, public project record, original brand SVG or original portfolio artwork changed in this correction.

The publication integration still checks independent display/factual/credit approval and withdrawal with isolated unique images. All eleven supplied public records retain unknown commissioning, unverified factual content and unapproved credits; unsupported services, outcomes and relationships remain omitted. Future drafts and withdrawn media remain excluded from production.

## Actual recordings and production smoke

| Recording | Encoded duration / bytes | Automatic intro end | Initial rAF median / p95 |
| --- | --- | --- |
| [desktop-signature.mp4](../artifacts/signature-opening/desktop-signature.mp4) | 55.17s / 5,384,863 | 4240.8ms | 16.7 / 50.0ms |
| [mobile-signature.mp4](../artifacts/signature-opening/mobile-signature.mp4) | 54.23s / 2,819,124 | 4234.5ms | 16.7 / 16.8ms |

Both full recordings use the locally served production build and show the automatic opening, active WebGL gradient afterward, public project link, Work filtering, portfolio expansion and reversal, and the shared footer forward/reverse with enquiry navigation. They are real Chromium compositor recordings encoded at 30 fps; repeated frames preserve real elapsed stalls. GIFs are excerpts from those recordings. SwiftShader software WebGL and encoding add load: these timings are not hardware-device GPU benchmarks or proof of a sustained 30 fps experience. Safari/iOS, Firefox and modest Android hardware review remain outstanding.

The locally served production build completed the introduction automatically at:

- **390px: 4241.1ms** from navigation; 11 public projects, no page errors.
- **1440px: 4247.9ms** from navigation; 11 public projects, no page errors.

The homepage Bunzo link opens its actual case study; all eleven case URLs return HTTP 200. Mobile navigation is included in the production screenshots. See [production smoke evidence](../artifacts/signature-opening/production-verification.json).

The production output contains 17 HTML routes and 175 optimized WebPs. All emitted external JS chunks total 141,786 raw bytes / 56,617 individually gzipped bytes across the build, not a per-route transfer figure. See [bundle inventory](../artifacts/signature-opening/bundle-verification.json).

## Evidence and asset boundary

The gallery contains 51 responsive choreography/route screenshots, 7 production screenshots and 2 isolated-layer inspection PNGs, plus 2 MP4s and 2 GIFs: **64 validated media files**. PNGs/GIFs fully decode with expected dimensions; both H.264 MP4s fully decode and place the metadata atom before media data for streaming. Full-resolution images are retained. [Media verification](../artifacts/signature-opening/media-verification.json) records hashes and actual dimensions.

Captures observe the unmodified CSS clock and native scroll progression. Separate fresh sessions capture close-spaced opening phases; no animation seeking, forced pause or fabricated pose is used. A preliminary local visit warms assets before timed captures; the timed opening uses a fresh browsing session. Recorded before/after times and transforms are in [capture evidence](../artifacts/signature-opening/signature-evidence.json).

**The independent hand/plaque remains a separated 2D prototype, not production photorealistic 3D.** The empty hand retains the supplied fixed pinch and baked lighting. The plaque contains the actual approved emblem, with missing surfaces where fingers covered it; mixed glass/skin contact highlights stay with the hand. Native reconstruction exactly matches the supplied reference, but browser scaling/compression may produce contact seams.

Production still needs an approved realistic hand mesh/rig and skin/nail materials, an editable accurate emblem/glass model, articulated grasp/contact and changing lighting/occlusion, responsive cameras and final rendered passes or an approved master sequence. The prior Blender file remains a material study without an anatomical hand rig. These limitations are explicit in the [asset process](SIGNATURE_ASSET_PROCESS.md) and gallery. **Opening visual approval remains pending.**
