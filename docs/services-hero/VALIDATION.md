# About refinements and Services hero — observed validation

This is the observed validation for draft PR #12 on `feature/services-cinematic-hero`, stacked on the still-open About PR #10. The implementation and visual evidence were preserved in separate checkpoints. There are no unresolved cases in the covered production browser suites.

[Review gallery](../../artifacts/services-hero/README.md) · [Handoff and later-stage boundaries](HANDOFF.md) · [Asset provenance](ASSET_PROVENANCE.md)

| Check                                  | Observed result                                              |
| -------------------------------------- | ------------------------------------------------------------ |
| Production build                       | PASS — 22 static routes                                      |
| Astro/TypeScript                       | PASS — 146 files; zero errors, warnings or hints             |
| ESLint                                 | PASS                                                         |
| Formatting                             | PASS                                                         |
| Unit tests                             | PASS — 46, including four Services timing/pause-policy cases |
| About production browser acceptance    | PASS — 23/23, zero retries, skips or flaky results           |
| Services production browser acceptance | PASS — 15/15; zero failures, skips or flaky results          |
| Strict homepage production loader      | PASS — 7/7                                                   |
| Existing static output checks          | PASS — 6/6                                                   |
| About output and asset/privacy checks  | PASS — 2/2                                                   |
| Initial production route preservation  | 67 passed, 1 legacy footer timing-sample failure             |
| Corrected footer checks                | PASS — 6/6, no footer application changes                    |
| Publication/withdrawal integration     | PASS — 1/1                                                   |
| Portfolio export/media checks          | PASS — 6/6; all twelve MP4s unchanged                        |

## About: actual rendered evidence

The [About browser report](../../artifacts/services-hero/about-browser-tests.json) covers the unchanged seven-chapter copy, names/roles/experience, one H1, preview noindex policy, responsive geometry, WCAG A/AA scans, keyboard navigation, early input, reduced motion, Save Data, no JavaScript and the revised arrival. It samples actual early animation frames before the main module starts, requiring the centered pose and hidden copy rather than the previous final-to-center flash. Blocked and delayed bundles exercise the independent 550ms bootstrap deadline and prevent late re-hiding. The blocked-bundle test exercises native About anchors and the Contact CTA; it does not claim that the existing global mobile menu can be enhanced while all external navigation scripts are blocked.

Additional checks compare actual fractional SVG dash offsets with native scroll geometry through quick forward/reverse movements and resize. The process uses direct scrubbing without catch-up smoothing or normalized-value rounding. Decorative motion is not pinned and does not replace scrolling.

The [capture manifest](../../artifacts/services-hero/about-capture-evidence.json) pins the About source checkpoint `52640f57ef42eef8bc4c4449a82f1ac54730ffd4`, 22 PNG hashes and four real-time silent H.264 recordings. All image hashes match. The observed running-to-settled intervals are approximately 2.9s desktop and 3.65s mobile. Completed mobile text is clear of the emblem; both faces remain visible. Historical `artifacts/about/` evidence is unchanged. Initial test-fixture reports are retained separately; the final 23-case report passes.

## Services: rendered motion and recordings

The [15-case browser report](../../artifacts/services-hero/services-browser-tests.json) observes real child-SVG transforms, opacity and fractional drawing through the 14-second timeline. It covers four responsive layouts, WCAG A/AA scans, all five scenes, the visible wordmark reveal, matching return/start poses, focused controls, explicit pause intent, resize, combined hidden/offscreen reasons, native scrolling, direct links, reduced motion, Save Data, no JavaScript and missing-bundle fallback. The actual page remains scrollable; no animation time is sought to manufacture the evidence.

| Viewport | Observed cycle | Observed service spans | Final MP4 duration |
| -------- | -------------- | ---------------------- | ------------------ |
| 390px    | 13.936s        | 2.010–2.083s           | 23.32s             |
| 1440px   | 14.033s        | 2.017–2.065s           | 23.64s             |

The [Services manifest](../../artifacts/services-hero/services-capture-evidence.json) pins source `2841392368c0b56631610c16eed1c1446eec7e58`, 28 screenshots, native recordings and sampled rendered-part states. The configured service windows are 2.1 seconds; sampled observations have frame-boundary quantization. Each recording includes the initial right-side emblem, all five scenes, the wordmark, return and a second cycle. One early native scroll by the recording driver keeps art, caption and controls together; the application itself never auto-scrolls.

There are 50 PNGs, six MP4s and two GIF previews across both parts. Only the first 0.12s of native recorder surface initialization was trimmed from exports; playback speed, animation frames after that setup interval and DOM-clock measurements are unchanged. Untrimmed recordings and native inputs remain archived outside Git. Final MP4 metadata and screenshot hashes are verified before delivery. These are software-rendered browser observations, not physical-device performance measurements.

## Final preservation results

The [initial production preservation run](../../artifacts/services-hero/regression-initial-browser-tests.json) covered 68 cases: About, all five existing service pages and FAQs, Contact form states, footer social links/credit, and signature footer choreography. It passed 67 cases; the tablet footer reversal comparison sampled an unfinished pose. A [focused investigation](../../artifacts/services-hero/footer-investigation-tests.json) reproduced the timing issue.

The inherited footer helper polled the immediate target attribute and then waited a fixed 500ms, while the approved footer uses numeric scrubbing. The helper now requires the requested progress within 0.005 and observes actual transforms, opacity, scale and layout until stable. The exact reversal assertions are unchanged; footer application code is unchanged. [All six footer cases pass after that test-only correction](../../artifacts/services-hero/footer-settled-tests.json).

The [coverage summary](../../artifacts/services-hero/validation-summary.json) records passing observations for all **90 distinct browser cases** across separate runs, with zero unresolved cases. This is not a single clean 90-case invocation; the initial failure and investigation remain accessible. The selected production suites cover this milestone and preservation paths; the entire development browser suite was not rerun.

Publication/withdrawal integration passes. All twelve existing portfolio MP4 files match their manifest, and all six export checks pass. No original photo, rejected illustration or unapproved portfolio media is introduced. Contact browser tests use mocked provider responses; live email delivery remains unverified because the owner has not configured an endpoint.

Reproduce after a production build with `npm run test:services-hero`, `npm run test:services-regression` and `npm run test:production-browser`. The focused About command is `npm run test:about-browser`. Static checks remain `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, `npm run test:build`, `npm run test:about-build`, `npm run test:publication` and `node --test tests/portfolio-motion-exports.test.mjs`.

## Limits and approval boundary

This is Services Stage 1. The five overview chapters, five detail-page designs and full puzzle/contact animation are not rebuilt. The portrait remains approved raster artwork; the emblem uses the native supplied raster, not a new vector logo. The original photo stays private. The existing footer remains its 2D prototype and Contact still needs owner Formspree configuration and real email delivery verification. Browser evidence uses Chromium software rendering; physical-device and other-engine performance are not established. No merge, deployment or separate Netlify repository push is authorized.
