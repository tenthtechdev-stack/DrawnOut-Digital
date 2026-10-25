# DrawnOut Loop — validation

> **Historical validation:** these results belong to the pre-correction checkpoint `bba7f69`. They do not validate the revised wordmark or separated hand/plaque entrance. See [Opening revision validation](OPENING_REVISION_VALIDATION.md) for the subsequent run and [updated recordings](../artifacts/signature-opening/README.md).

Local verification on 24 October 2026 for `feature/drawnout-signature-experience`, based on approved main `0ef900b72132f4ab1069da6b824cb1facfe2c95e`. No hosted CI, merge or public deployment is claimed.

## Automated results

| Check                                 | Actual result                                                 |
| ------------------------------------- | ------------------------------------------------------------- |
| `npm run check`                       | PASS — 80 files, 0 errors, 0 warnings, 0 hints                |
| `npm run lint`                        | PASS                                                          |
| `npm test`                            | PASS — 23 tests                                               |
| `npm run build`                       | PASS — 17 production routes, including 11 public case studies |
| `npm run test:build`                  | PASS — 4 output checks                                        |
| `npm run test:publication`            | PASS — 1 integration test, 4 isolated builds                  |
| Complete Playwright suite, one worker | PASS — 134 tests, no failures/skips/retries; 317.87s          |
| `npm run format:check`                | PASS                                                          |
| `git diff --check`                    | PASS                                                          |

The complete final validation passes **162 distinct tests**: 23 unit/content/policy, 4 build-output, 1 publication integration and 134 browser cases. The full browser suite was rerun after the implementation checkpoint and final test/capture corrections. An earlier software-GPU readiness assertion exceeded its default five-second setup wait; that readiness budget now accounts for entrance completion plus software shader compilation. The final complete run has no failures, skips or retries. The intro's independent five-second deadline was never relaxed.

The browser run covers existing concept/foundation/storytelling/portfolio behavior plus the signature introduction, shader, text/image choreography, footer, mobile header and accessibility. Final machine-readable cases and measurements are in [browser verification](../artifacts/signature/browser-verification.json). The isolated publication builds test visual-only release, independently verified facts, credited attribution and withdrawal, including a future unapproved fixture. Private media registration and production routes fail closed; fixture images have distinct pixels so optimizer deduplication cannot conceal a leak. Eleven approved records still retain unknown commissioning, `contentVerified: false`, `creditApproved: false`, and empty service claims.

Nine axe WCAG scans cover home, Work, Bunzo and contact at desktop/mobile, plus the open mobile navigation. Automated checks supplement visual and keyboard inspection; they do not establish universal accessibility compliance.

## Intro and layout measurements

The actual automatic opening completed between **4.258 and 4.337 seconds from navigation** at 320, 390, 768, 1440 and 1920px. Every sample observed the partial wave, ordered lettering and signature before automatic handoff. Tests also cover keyboard, wheel, pointer, visible skip, session return, direct/hash navigation, delayed modules, blocked media, unavailable storage, reduced motion and data saving.

| Width  | Automatic end (ms) | Intro layout-shift sum |
| ------ | ------------------ | ---------------------- |
| 320px  | 4257.6             | 0.00168                |
| 390px  | 4336.7             | 0.00178                |
| 768px  | 4305.3             | 0.00308                |
| 1440px | 4301.4             | 0.00402                |
| 1920px | 4332.7             | 0.00340                |

Across **18 instrumented mobile scenarios**, the largest range of header height, main-content top, control position or control width was **0px**, with **0 header-attributed layout shift**. These include 320/390px, normal/reduced motion, reload/direct case navigation, delayed fonts/module loading and failed enhancement. Separate no-JavaScript tests verify native menu navigation and fixed geometry. The largest total shift in these short startup probes was 0.03455; this is not a site-wide Core Web Vitals measurement.

The intro wordmark exit now uses a transform rather than changing its layout position. Missing Unicode navigation arrows were replaced with the existing decorative SVG arrow. Header geometry is reserved before navigation enhancement; the native no-JavaScript disclosure and enhanced control occupy the same footprint.

## Rendering and performance observations

The living gradient uses one WebGL pass, a maximum 720 × 800 drawing buffer, DPR at most 1 and a 30 fps render cap. It waits for intro/hero release before context creation, renders autonomously with no cursor input, responds gently on desktop, and pauses offscreen/hidden. Context failure uses animated CSS; reduced motion/data saving uses a static field. Tests inspect actual changing shader pixels, pointer target/response, visibility suspension, context loss and fallback animation.

The production build emits 17 HTML routes and 173 optimized WebPs. All emitted external JavaScript chunks together total **141,738 bytes raw / 56,613 bytes individually gzipped**. This is an aggregate across chunks, not a per-route transfer figure; HTML-inline scripts are separate. The gradient chunk is 6,715 bytes raw / 2,747 bytes gzipped; SplitText is 7,064 / 3,265 bytes. See [bundle inventory](../artifacts/signature/bundle-verification.json).

| Capture               | Encoded duration | File size       | Intro end | Initial rAF median / p95 | Initial shift sum |
| --------------------- | ---------------- | --------------- | --------- | ------------------------ | ----------------- |
| desktop-signature.mp4 | 63.50s           | 5,178,105 bytes | 4322.9ms  | 50.0 / 183.3ms           | 0.00402           |
| mobile-signature.mp4  | 57.00s           | 2,779,036 bytes | 4325.0ms  | 16.7 / 33.4ms            | 0.00088           |

Both recordings report the `webgl` renderer after the intro. Desktop startup included a 936ms long task during software rendering setup; mobile startup tasks reached 149ms. Segments in the capture manifest are wall-time guideposts; encoded duration differs from total recording/encoder wall time by 0.27s desktop and 0.11s mobile. The recorder fills elapsed-time gaps with the latest real compositor frame, preserving visible pauses. Both H.264 videos fully decode and place `moov` before `mdat` for streaming. GIFs are excerpts from those actual recordings.

The cloud browser uses SwiftShader software WebGL and compositor capture/encoding adds load. These frame intervals and long tasks are local diagnostic observations, **not physical-device GPU benchmarks or proof of a 30 fps experience**. Hardware-accelerated Safari/iOS, Firefox and modest Android device review remain production requirements. No Lighthouse or field Core Web Vitals result is claimed. Initial animation-related shifts are reported separately from header geometry, without calling either a site-wide CWV pass.

## Visual evidence and production smoke

[GitHub review gallery](../artifacts/signature/README.md) includes the real desktop/mobile MP4 journeys, opening GIF excerpts, 390/768/1440 choreography states and local production-build screenshots. Captures use actual elapsed time and native scroll; image frames capture the actual viewport without scrolling the image into view or enlarging the viewport. Headings wait for their actual entrance completion and footer captures verify requested progress. No animation timeline is manually sought for the evidence.

The locally served production build was tested at 390 and 1440px with software WebGL. Automatic intro completion was **4485.1ms mobile / 4422.1ms desktop** from navigation; homepage Bunzo links opened `/work/bunzo`, all eleven public case URLs returned **HTTP 200**, and no browser page errors were observed. The mobile navigation dialog was captured. These seven production screenshots complement 42 responsive development stills and two asset-study/reference PNGs. See [production verification](../artifacts/signature/production-verification.json).

The source SVGs, all 46 original portfolio PNGs in 15 folders, and earlier phase screenshots remain unchanged. The gallery retains full-resolution PNGs. All 55 review media files pass decoding/dimension checks: 51 full-resolution PNGs, 2 GIF excerpts and 2 H.264 MP4s. Both videos pass complete FFmpeg decoding and fast-start checks. See [media verification](../artifacts/signature/media-verification.json). All gallery/document relative targets resolve; the PR records the actual push and GitHub byte-retrieval verification.

## Asset quality boundary

The shared hand/emblem is a faithful image-backed reference **prototype**. It is not independently rigged anatomy; the descending outline is decorative. The real Blender 4.3.2 Cycles CPU study renders an acrylic plate beside the supplied image plane at 1200 × 800, 32 samples, in 29.57 seconds. It has visible grain and no hand mesh/rig, editable emblem or rendered signature sequence. The packed source, manifest, render hashes and exact missing production inputs are documented in [Signature asset process](SIGNATURE_ASSET_PROCESS.md).

The website choreography and publication changes can be visually reviewed now. Final photorealistic independent hand/emblem assembly remains incomplete and requires approved production assets/art direction. Merge and deployment are outside this delivery.
