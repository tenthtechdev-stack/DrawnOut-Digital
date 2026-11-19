# Portfolio motion completion — validation

## Scope and provenance

This review replaces only Triarch, By Tech Group and U Wanna Smoothie. PR #21 is stacked on the still-open PR #20 (`feature/motion-visual-quality-upgrade`, `e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b`). The source/export checkpoint is `9c8d528`; final evidence commits preserve those application and export bytes. No merge, rebase, force-push, deployment or Netlify mirror push is included.

The [gallery](../../artifacts/motion-completion/README.md) distinguishes decoded export GIFs/source-rendered keyframes from actual browser playback. The [source notes](ART_DIRECTION_AND_SOURCES.md) explain each independent motion system and editable-master limitations. Automated pixel variation proves movement, not creative approval.

## Commands and actual results

**The complete browser run is not green.** All 31 focused portfolio checks, 42 all-case checks and 74 Work/Contact/footer checks pass. The full 244-check run records **225 passed and 19 failed**. [Machine-readable final summary](../../artifacts/motion-completion/final-validation.json). Initial failures are not erased by retries.

| Check                                 | Actual result                                | Evidence                                                                               |
| ------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Production build                      | **PASS**, 22 pages / 12 video endpoints      | [Output and served hashes](../../artifacts/motion-completion/build-validation.json)    |
| TypeScript / Astro                    | **PASS**, 212 files; 0 errors/warnings/hints | [Core results](../../artifacts/motion-completion/core-validation.json)                 |
| ESLint                                | **PASS**                                     | [Core results](../../artifacts/motion-completion/core-validation.json)                 |
| Repository formatting                 | **PASS**                                     | [Formatting result](../../artifacts/motion-completion/format-validation.json)          |
| Unit / build-output / publication     | **49 / 6 / 1 passed**                        | [Core results](../../artifacts/motion-completion/core-validation.json)                 |
| Media/source preservation             | **21 passed**                                | [Measurements and raw output](../../artifacts/motion-completion/media-validation.json) |
| Focused completion playback           | **31 passed, 0 failed**                      | [Raw report](../../artifacts/motion-completion/browser-tests.json)                     |
| All eleven premium case studies       | **42 passed, 0 failed**                      | [Raw report](../../artifacts/motion-completion/case-rollout-tests.json)                |
| Work, portfolio, Contact and footer   | **74 passed, 0 failed**                      | [Raw report](../../artifacts/motion-completion/case-regression-tests.json)             |
| Services, accessibility and loader    | **51 passed, 8 failed**                      | [Raw report](../../artifacts/motion-completion/preservation-tests.json)                |
| Development-only living gradient      | **4 passed, 5 failed**                       | [Raw report](../../artifacts/motion-completion/gradient-dev-tests.json)                |
| About and Services/About preservation | **23 passed, 6 failed**                      | [Raw report](../../artifacts/motion-completion/about-premium-tests.json)               |

Commands: `npm run build`, `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, `npm run test:build`, `npm run test:publication`, and `node --test --test-reporter=spec tests/motion-quality-exports.test.mjs tests/portfolio-motion-exports.test.mjs tests/motion-completion-preservation.test.mjs`. Each browser suite uses `npx playwright test --config <config>`; exact configs/commands and results are recorded in the [regression summary](../../artifacts/motion-completion/regression-summary.json). Reporter overrides preserve archived reports. Suites run sequentially with one worker, without rebuilding the served worktree.

The gradient suite deliberately uses the dev server for its existing development-only diagnostic snapshot. Other suites use production output. No production debug hooks were added. The publication test builds isolated temporary fixtures without modifying the served worktree.

## Timing failures, bounded retry and original-baseline comparison

The first wider run failed strict animation/startup expectations in eight Services/loader/square checks, five gradient checks and six About arrival/atmosphere checks. Observations included late initialization selecting the documented brief/static fallback, missed frame-sampling intervals, a Services pixel difference of exactly 15 against a >15 threshold, and identical sampled CSS-fallback transforms. Functional layout, navigation, content, reduced/no-JavaScript fallbacks and every new portfolio playback check pass. This is not a claim that the failing checks are harmless or fixed.

The [bounded comparison](../../artifacts/motion-completion/baseline-comparison.json) runs only those initially failing tests once more against current code, then against original PR #20 commit `e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b`, using unchanged assertions/configs and the same environment. Original reports and traces remain preserved. Trace ZIPs are local diagnostic files; the committed JSON reports retain the error messages and observations. No website or test-source edits were made to obtain a pass. The host reports a 4-CPU quota; browser configs use headless Chromium with SwiftShader. Timing cause is not inferred solely from source identity.

| Mode          | Suite         | Passed / failed | Report                                                                                 |
| ------------- | ------------- | --------------- | -------------------------------------------------------------------------------------- |
| current-retry | preservation  | 1 /7            | [Raw report](../../artifacts/motion-completion/current-retry-preservation-tests.json)  |
| current-retry | gradient-dev  | 3 /2            | [Raw report](../../artifacts/motion-completion/current-retry-gradient-dev-tests.json)  |
| current-retry | about-premium | 2 /4            | [Raw report](../../artifacts/motion-completion/current-retry-about-premium-tests.json) |
| baseline      | preservation  | 1 /7            | [Raw report](../../artifacts/motion-completion/baseline-preservation-tests.json)       |
| baseline      | gradient-dev  | 3 /2            | [Raw report](../../artifacts/motion-completion/baseline-gradient-dev-tests.json)       |
| baseline      | about-premium | 2 /4            | [Raw report](../../artifacts/motion-completion/baseline-about-premium-tests.json)      |

Current focused retry leaves **13 failing checks**; **10** of those also fail on the untouched baseline. All exact names/errors and differing outcomes are in the comparison report. Source preservation plus baseline results provide regression evidence, not permission to dismiss failures or a production-readiness claim. Full startup/animation acceptance needs follow-up in a representative rendering environment before release.

The [runtime audit](../../artifacts/motion-completion/runtime-preservation-audit.json) proves that all five homepage production client-entrypoint files are byte-identical to the original baseline. This establishes preserved compiled code, not equivalent timing. The full source/asset preservation audit is separate.

The initial format check failed only on generated JSON; final formatting was completed after writers stopped. The core report retains that failed attempt and the final result. The first focused browser run had 30 passes and one incorrect fixture path; [initial report](../../artifacts/motion-completion/browser-tests-initial.json) and complete 31/31 corrected rerun remain committed. No application change was needed for that test error.

The six native export colour comparisons pass. [Native browser colour samples](../../artifacts/motion-completion/browser-export-color-audit.json) and [actual case-page poster/video/screenshot samples](../../artifacts/motion-completion/browser-video-color-audit.json) record the measured pixels.

## Fidelity, encoding and preserved implementation

All six new files fully decode to 180 frames, 24fps, 7.5 seconds, silent H.264 High/yuv420p. Landscape is 1440 × 810; portrait is 810 × 1080. All are under 3MiB (actual sizes are in the manifests). Faststart, limited-range BT.709 conversion, stream metadata and H.264 VUI are explicit. Matching WebP posters retain those dimensions. Unencoded first/last poses are pixel-identical. Encoded new-export seam MAE is at most 0.084/255; poster MAE is at most 1.794/255 after the same native-RGB decode and Lanczos resize on both comparison inputs.

The source audit compares **1,788,732 opaque pixels exactly** with original PNG crop pixels across 35 alpha-isolated assets in the three new projects. Their 40 recorded crops include assembled references/alternate title fragments; this is not a claim of 40 independent animated objects. No repainting or replacement brand lettering is introduced.

The preservation audit proves **125 reference files** remain byte-identical to PR #20, including Bunzo/SOL/Churros modules, shared helpers, layer PNGs, posters, exports and per-project manifests. Their three root manifest entries remain deep-identical. **230 existing website, original-artwork, asset and configuration files** remain byte-identical. Only the three completed projects' motion fields differ in content records, with public MP4 filenames unchanged. No case layouts, media controller, homepage, footer, Work, Contact, Services, favicon, enquiry or publication policy changes.

## Transparent measurement corrections

The initial Triarch export check failed the old whole-canvas progression proxy (>12/255), although its small architectural elements moved visibly. Its stationary neutral background yields global values of 9.44/10.32. The completion-project test now requires, at the same sampled frame, both a fixed 1/16-canvas region with MAE >12 and more than 4% of samples changing by >12. Triarch measures 32.20/32.81 in its strongest fixed region and 16.15%/17.40% changed area. The frozen references retain their old global threshold. Fidelity, decoding, poster and seam thresholds are unchanged. The test does not establish artistic quality.

A native colour sample in By Tech's portrait gradient differs by four blue levels after lossy H.264 4:2:0 encoding. The completion colour helper explicitly permits ≤5/255 per channel on coloured artwork and retains ≤3/255 on flat backgrounds; the worst measured export sample is 4. Original-reference tests remain unchanged. The real case-page screenshot audit separately records its own samples.

The first focused browser run found one test-only fixture path pointing to a nonexistent completion copy of the frozen image audit. It was corrected to read the original `artifacts/motion-quality/image-source-audit.json`; no production artwork or application code was changed for that failure. The complete final rerun passes all 31 checks with zero failures, skipped checks or flaky results; both raw reports are linked above.

## GitHub visual-delivery checkpoint

At published commit `9e05e5f9b48636380bed07628b5a652f553492f8`, GitHub REST retrieval returned **153 byte-matching files**, including 94 PNGs, 12 GIFs and 14 MP4 copies (six canonical exports, their six reproducible-quality copies and two browser recordings). All 122 relative documentation/gallery links resolved to committed files or directories. PNG/GIF/WebP/MP4 signatures and JSON parsing were checked. [Exact retrieved-file hashes](../../artifacts/motion-completion/github-checkpoint-verification.json) identify this visual checkpoint; the final PR records final-head verification after the remaining reports are pushed.

## Review boundaries

The recordings use production-build Chromium with desktop/mobile viewport and touch emulation. They do not claim physical-device, Safari, iOS or Android coverage. Browser capture provenance records committed source hashes, promoted-media hashes, visible media-clock progression, real keyboard controls, failed requests and console errors. The final capture tool is committed at `d2c040e`; a first mobile Smoothie capture was rejected because native scrolling had not settled. The tool now verifies settled wheel position, complete video framing below the header and ≥95% visible video throughout each sampled cycle. Both widths were recaptured; no application code or motion timeline was changed. No timeline seeks or injected animation shortcuts are used for playback recordings.

Flattened raster boards limit independent hidden contours, underlaps and photographic toppings. See the exact per-project source/master gaps in [ART_DIRECTION_AND_SOURCES.md](ART_DIRECTION_AND_SOURCES.md). A production-quality signature 3D hand/footer and verified live enquiry delivery remain separate milestones. The enquiry reuse note is recommendation only. Creative approval of all three completed animations remains pending; no merge or deployment is authorized here.
