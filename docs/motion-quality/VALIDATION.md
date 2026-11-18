# Motion quality review validation

This checkpoint is submitted for creative approval of **Bunzo, SOL and Churros**,
plus the Brand Identity enquiry composition. Passing tests does not constitute
visual approval. Triarch, By Tech Group and U Wanna Smoothie's six video files
remain identical to parent commit `734e1e835ca7a447e7ed5b845cf748e7f83e2fdc`.

Implementation checkpoint: `c89a736a7d63bf5a8bb0d9a9d620768b3a4a9256`.
Draft [PR #20](https://github.com/tenthtech/drawnout-digital/pull/20) targets
`feature/work-case-studies-premium` because PR #19 remains unmerged.

## Build, source and media checks

| Command                                                                                     | Actual result                                        |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `npm run build`                                                                             | Pass; 22 static pages and 12 guarded video endpoints |
| `npm run check`                                                                             | Pass; 202 files, zero errors, warnings or hints      |
| `npm run lint`                                                                              | Pass                                                 |
| `npm run format:check`                                                                      | Pass                                                 |
| `npm test`                                                                                  | 49 passed                                            |
| `npm run test:build`                                                                        | 6 passed                                             |
| `node --import tsx --test tests/about-build.test.mjs`                                       | Passed                                               |
| `npm run test:publication`                                                                  | 1 passed; isolated approval/draft/withdrawal builds  |
| `node --test tests/portfolio-motion-exports.test.mjs tests/motion-quality-exports.test.mjs` | 13 passed                                            |

The source tests compare all 46 original portfolio PNGs with their authorized
Git blobs. All eleven records retain visual-display approval separately from
unverified facts and credits. No client, outcome, service or attribution claim
was invented. Existing noindex safeguards remain present.

[Raw media validation](../../artifacts/motion-quality/media-validation.json)
records the actual exports, source hashes and decoded measurements. The six
new files are 7.5 seconds, 180 frames, 24 fps, silent H.264 High/yuv420p, CRF 19
with faststart. Landscape is 1440 × 810; portrait is 810 × 1080. Every file is
under 1 MiB and the existing 3 MiB limit.

Twenty-nine independent alpha layers and 2,183,890 opaque pixels were compared
with their original source RGB values. All match. Actual first/last decoded
frame differences remain below 0.21/255 across all twelve production exports.
The matching posters decode at their export dimensions and remain close to
the actual first video frame. The renderer additionally asserts identical
unencoded endpoints; the tests decode every frame.

The final HD exports explicitly convert full-range RGB to limited-range BT.709
YUV and declare BT.709 matrix, primaries and transfer in both container/codec
metadata. Actual browser recordings exposed the previous unspecified-matrix
shift: Bunzo's source `[227, 28, 35]` displayed as `[244, 48, 31]`. The corrected
video displays `[227, 28, 35]` in the real page. The
[six-format native browser audit](../../artifacts/motion-quality/browser-export-color-audit.json)
compares source, canvas and screenshot samples within 3/255 per channel. The
[six actual page samples](../../artifacts/motion-quality/browser-video-color-audit.json)
match their posters within 2/255 at mobile and desktop widths.

Poster measurements decode native RGB before applying the same Lanczos
resampling to both video and poster. This avoids comparing different YUV/RGB
scaling kernels; the strict mean-error limit remains below 4/255. The maximum
measured final difference is 2.655/255. No threshold was loosened.

## Browser checks

| Suite                                      | Actual result                           |
| ------------------------------------------ | --------------------------------------- |
| `playwright.motion-quality.config.ts`      | 23 passed                               |
| `playwright.case-rollout.config.ts`        | 42 passed on the final frozen build     |
| `playwright.case-regression.config.ts`     | 74 passed on the final frozen build     |
| `playwright.about-premium.config.ts`       | 29 passed in an isolated run            |
| `playwright.motion-preservation.config.ts` | 59 passed in the clean full run         |
| `playwright.motion-gradient.config.ts`     | 9 passed against the development server |

The focused suite tests real mobile and desktop decoding of all three new
loops, their matching posters, pause/release controls and decoder limits.
It also checks 320, 390, 768, 1024, 1440 and 1920px enquiry layouts, all 22
page heads including 404, the browser's automatic favicon request, 68 actual
case-image/DPR samples, native Work filtering/back navigation, axe accessibility,
Contact links during each animation phase, and reduced-motion/Save Data/no-JS
fallbacks. Failed GSAP loading leaves the complete static enquiry available.
The document-hidden handler is explicitly exercised with a controlled event;
that assertion is not a claim of physical OS background-tab testing.

The early-pointer regression found a real bug: focusing a pause button could
cancel its ancestor's reveal transform between pointerdown and pointerup,
moving the target before the click completed. Reveals now animate visual
children, keeping controls and case closing links stationary. Native pointer
regressions confirm unchanged hit geometry, one click and actual navigation or
video-source release. Keyboard focus remains usable.

An initial About timing run launched alongside multiple other browser/rendering
jobs returned 25 passes and four timing failures. In each failure, the existing
late-initialization safeguard revealed the complete static hero instead of
starting a late entrance. The unchanged About implementation then passed all
29 checks with competing browser work stopped. Both results are retained:
[initial concurrent attempt](../../artifacts/motion-quality/about-services-parallel-attempt.json)
and [final isolated run](../../artifacts/motion-quality/about-services-tests.json).

The first combined preservation harness selected nine gradient diagnostics
against production output. Seven use an intentionally development-only snapshot
and failed because that snapshot is absent in production. Those nine unchanged
assertions now run in development, where all pass; no production debug hooks were
added. [Initial mode attempt](../../artifacts/motion-quality/preservation-mode-attempt.json).

An earlier corrected production run had 58 passes and one Services check that
encountered temporary asset 404s because a local rebuild overlapped that run.
The trace identified missing font/module/icon responses during output replacement.
The build was frozen and that exact check then passed. Both results are retained:
[interrupted run](../../artifacts/motion-quality/preservation-rebuild-attempt.json) and
[successful isolated rerun](../../artifacts/motion-quality/preservation-rerun.json).
A subsequent clean full run passed all 59 checks: [final production results](../../artifacts/motion-quality/preservation-tests.json). The 59 production checks cover Services, accessibility, complete recurring
loader journeys and all six project squares. [Development gradient results](../../artifacts/motion-quality/gradient-dev-tests.json)
cover actual shader evolution, cursor response, visibility, CSS and preference
fallbacks.

The six final browser groups validate **236 checks**, with no failures in their final full runs. Earlier harness attempts and isolated retries are retained above.

Raw current reports: [focused](../../artifacts/motion-quality/browser-tests.json),
[case studies](../../artifacts/motion-quality/case-tests.json),
[Work/portfolio/Contact/footer](../../artifacts/motion-quality/regression-tests.json).

## Actual visual evidence

[The GitHub gallery](../../artifacts/motion-quality/README.md) contains complete
landscape/portrait GIF review copies, full-resolution MP4s and posters, actual
encoded storyboards, original-layer source manifests, and desktop/mobile enquiry
recordings. The storyboards sample the encoded MP4 rather than a mock timeline.
Decoded Bunzo transition proofs verify that white lettering stays white after
removing an overlapping-opacity compositing artifact.

The enquiry recordings are real Chromium captures with native timing and wheel
input, not timeline seeking or injected animation styles. Their source-file
hashes still match the implementation. Static screenshots show the complete
mobile section; motion viewport recordings focus on the illustration.

The corrected pilot journeys are 35.36 seconds at 1440 × 900 and 31.32 seconds
at 390 × 844. Each of the three pilots visibly advances through more than a
complete 7.5-second cycle, with actual keyboard pause/play and native backscroll.
Their source/media hashes, colour metadata, decoder measurements and clean
browser error logs are in
[pilots-capture.json](../../artifacts/motion-quality/pilots-capture.json).

The capture manifest retains its input hashes and records whitespace-only
formatting equivalence for three project JSON files. No data changed. Rebuilding
the formatted source produced all 384 production files byte-for-byte identical
to the captured build; [the comparison](../../artifacts/motion-quality/capture-build-equivalence.json)
confirms that these recordings represent the delivered website.

The [37-image audit](IMAGE_QUALITY.md) documents exact original crops, native
dimensions, compression, responsive candidates, small-image display caps,
source-fidelity comparisons and a read-only observation of Netlify-served bytes.
No deployment or Netlify mirror push was performed.

## Remaining review and production requirements

- Owner creative approval of these three loops and the enquiry is required
  before extending either system to the remaining projects or service pages.
- Editable brand/project masters are needed for finer independent letter,
  illustration and high-resolution emblem work. Native raster limitations are
  stated in [LIMITATIONS.md](LIMITATIONS.md).
- The existing signature hand/plaque remains a **layered raster prototype**,
  not finished photorealistic 3D.
- Browser evidence uses Linux Chromium with software WebGL where needed.
  Physical iOS Safari/Android decoding, GPU, memory and visual testing remain
  outstanding.
- No merge, public deployment or push to the separate Netlify repository is
  included in this delivery.
