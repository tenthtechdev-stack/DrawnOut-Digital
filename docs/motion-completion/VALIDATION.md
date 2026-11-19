# Portfolio motion completion — validation

## Scope and provenance

This review replaces only Triarch, By Tech Group and U Wanna Smoothie. PR #21 is stacked on the still-open PR #20 (`feature/motion-visual-quality-upgrade`, `e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b`). The source/export checkpoint is `9c8d528`; final evidence commits preserve those application and export bytes. No merge, rebase, force-push, deployment or Netlify mirror push is included.

The [gallery](../../artifacts/motion-completion/README.md) distinguishes decoded export GIFs/source-rendered keyframes from actual browser playback. The [source notes](ART_DIRECTION_AND_SOURCES.md) explain each independent motion system and editable-master limitations. Automated pixel variation proves movement, not creative approval.

## Commands and actual results

Checkpoint status: the focused browser suite passes **31/31** after a test-only fixture-path correction. Type checking (212 files, zero diagnostics), ESLint, 49 unit tests, six build-output checks and the publication workflow pass. Existing wider browser regressions and the final repository formatting check remain in progress; incomplete runs are not counted as passed. [Core results](../../artifacts/motion-completion/core-validation.json), [focused browser results](../../artifacts/motion-completion/browser-tests.json), and [initial browser fixture failure](../../artifacts/motion-completion/browser-tests-initial.json) preserve the measured output.

- `npm run build`: passed on the promoted final media; 22 pages and 12 portfolio video endpoints. [Full build output and served-file hashes](../../artifacts/motion-completion/build-validation.json) are committed. No production build is run while browser suites serve `dist`.
- `node --test --test-reporter=spec tests/motion-quality-exports.test.mjs tests/portfolio-motion-exports.test.mjs tests/motion-completion-preservation.test.mjs`: **21 passed, 0 failed**, 44.1 seconds. [Full measurements and raw test output](../../artifacts/motion-completion/media-validation.json).
- `node scripts/portfolio/quality/verify-completion-color.mjs`: all six exports pass actual Chromium native-video canvas and screenshot comparisons. [Colour samples](../../artifacts/motion-completion/browser-export-color-audit.json).

## Fidelity, encoding and preserved implementation

All six new files fully decode to 180 frames, 24fps, 7.5 seconds, silent H.264 High/yuv420p. Landscape is 1440 × 810; portrait is 810 × 1080. All are under 3MiB (actual sizes are in the manifests). Faststart, limited-range BT.709 conversion, stream metadata and H.264 VUI are explicit. Matching WebP posters retain those dimensions. Unencoded first/last poses are pixel-identical. Encoded new-export seam MAE is at most 0.084/255; poster MAE is at most 1.794/255 after the same native-RGB decode and Lanczos resize on both comparison inputs.

The source audit compares **1,788,732 opaque pixels exactly** with original PNG crop pixels across 35 alpha-isolated assets in the three new projects. Their 40 recorded crops include assembled references/alternate title fragments; this is not a claim of 40 independent animated objects. No repainting or replacement brand lettering is introduced.

The preservation audit proves **125 reference files** remain byte-identical to PR #20, including Bunzo/SOL/Churros modules, shared helpers, layer PNGs, posters, exports and per-project manifests. Their three root manifest entries remain deep-identical. **230 existing website, original-artwork, asset and configuration files** remain byte-identical. Only the three completed projects' motion fields differ in content records, with public MP4 filenames unchanged. No case layouts, media controller, homepage, footer, Work, Contact, Services, favicon, enquiry or publication policy changes.

## Transparent measurement corrections

The initial Triarch export check failed the old whole-canvas progression proxy (>12/255), although its small architectural elements moved visibly. Its stationary neutral background yields global values of 9.44/10.32. The completion-project test now requires, at the same sampled frame, both a fixed 1/16-canvas region with MAE >12 and more than 4% of samples changing by >12. Triarch measures 32.20/32.81 in its strongest fixed region and 16.15%/17.40% changed area. The frozen references retain their old global threshold. Fidelity, decoding, poster and seam thresholds are unchanged. The test does not establish artistic quality.

A native colour sample in By Tech's portrait gradient differs by four blue levels after lossy H.264 4:2:0 encoding. The completion colour helper explicitly permits ≤5/255 per channel on coloured artwork and retains ≤3/255 on flat backgrounds; the worst measured export sample is 4. Original-reference tests remain unchanged. The real case-page screenshot audit separately records its own samples.

The first focused browser run found one test-only fixture path pointing to a nonexistent completion copy of the frozen image audit. It was corrected to read the original `artifacts/motion-quality/image-source-audit.json`; no production artwork or application code was changed for that failure. The complete final rerun passes all 31 checks with zero failures, skipped checks or flaky results; both raw reports are linked above.

## Review boundaries

The recordings use production-build Chromium with desktop/mobile viewport and touch emulation. They do not claim physical-device, Safari, iOS or Android coverage. Browser capture provenance records committed source hashes, promoted-media hashes, visible media-clock progression, real keyboard controls, failed requests and console errors. The final capture tool is committed at `d2c040e`; a first mobile Smoothie capture was rejected because native scrolling had not settled. The tool now verifies settled wheel position, complete video framing below the header and ≥95% visible video throughout each sampled cycle. Both widths were recaptured; no application code or motion timeline was changed. No timeline seeks or injected animation shortcuts are used for playback recordings.

Flattened raster boards limit independent hidden contours, underlaps and photographic toppings. See the exact per-project source/master gaps in [ART_DIRECTION_AND_SOURCES.md](ART_DIRECTION_AND_SOURCES.md). A production-quality signature 3D hand/footer and verified live enquiry delivery remain separate milestones. The enquiry reuse note is recommendation only. Creative approval of all three completed animations remains pending; no merge or deployment is authorized here.
