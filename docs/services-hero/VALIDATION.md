# About refinements and Services hero — observed validation

This is the validation checkpoint for draft PR #12 on `feature/services-cinematic-hero`, stacked on the still-open About PR #10. The final Services browser and recording results are being completed; they are not claimed below until observed.

[Review gallery](../../artifacts/services-hero/README.md) · [Handoff and later-stage boundaries](HANDOFF.md) · [Asset provenance](ASSET_PROVENANCE.md)

| Check                                  | Observed result                                              |
| -------------------------------------- | ------------------------------------------------------------ |
| Production build                       | PASS — 22 static routes                                      |
| Astro/TypeScript                       | PASS — 145 files; zero errors, warnings or hints             |
| ESLint                                 | PASS                                                         |
| Formatting                             | PASS                                                         |
| Unit tests                             | PASS — 46, including four Services timing/pause-policy cases |
| About production browser acceptance    | PASS — 23/23, zero retries, skips or flaky results           |
| Services production browser acceptance | Pending                                                      |
| Services cycle recordings and timings  | Pending                                                      |

## About: actual rendered evidence

The [About browser report](../../artifacts/services-hero/about-browser-tests.json) covers the unchanged seven-chapter copy, names/roles/experience, one H1, preview noindex policy, responsive geometry, WCAG A/AA scans, keyboard navigation, early input, reduced motion, Save Data, no JavaScript and the revised arrival. It samples actual early animation frames before the main module starts, requiring the centered pose and hidden copy rather than the previous final-to-center flash. Blocked and delayed bundles exercise the independent 550ms bootstrap deadline and prevent late re-hiding. The blocked-bundle test exercises native About anchors and the Contact CTA; it does not claim that the existing global mobile menu can be enhanced while all external navigation scripts are blocked.

Additional checks compare actual fractional SVG dash offsets with native scroll geometry through quick forward/reverse movements and resize. The process uses direct scrubbing without catch-up smoothing or normalized-value rounding. Decorative motion is not pinned and does not replace scrolling.

The [capture manifest](../../artifacts/services-hero/about-capture-evidence.json) pins the About source checkpoint `52640f57ef42eef8bc4c4449a82f1ac54730ffd4`, 22 PNG hashes and four real-time silent H.264 recordings. All image hashes match. The observed running-to-settled intervals are approximately 2.9s desktop and 3.65s mobile. Completed mobile text is clear of the emblem; both faces remain visible. Historical `artifacts/about/` evidence is unchanged. Initial test-fixture reports are retained separately; the final 23-case report passes.

## Remaining verification at this checkpoint

Services testing must observe the real five-scene cycle, wordmark return, combined pause reasons, focused controls, responsive caption stability, static/manual preferences and native fallback links. Desktop and mobile recordings must each run at least 20 seconds. Existing service routes, publication boundaries and portfolio exports will receive final preservation checks before handoff.

## Limits and approval boundary

This is Services Stage 1. The five overview chapters, five detail-page designs and full puzzle/contact animation are not rebuilt. The portrait remains approved raster artwork; the emblem uses the native supplied raster, not a new vector logo. The original photo stays private. The existing footer remains its 2D prototype and Contact still needs owner Formspree configuration and real email delivery verification. Browser evidence uses Chromium software rendering; physical-device and other-engine performance are not established. No merge, deployment or separate Netlify repository push is authorized.
