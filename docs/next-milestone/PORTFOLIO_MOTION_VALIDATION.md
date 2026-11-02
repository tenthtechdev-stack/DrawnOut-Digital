# Portfolio motion validation

## Actual checks

- Astro/TypeScript, ESLint and formatting: final checks recorded with the delivery commit.
- Unit suite: 36 passed, including decoder selection, source path validation and center-priority behavior.
- Production build: 17 HTML pages plus 12 approved MP4 endpoints.
- Build-output suite: 5 passed.
- Publication workflow: 1 passed, including removal of withdrawn motion routes.
- Export tests: 6 passed, validating all 12 files, source/export hashes, duration, dimensions, silence, encoded seams and real scene progression.
- Selected production browser coverage: 24 current cases passed across the main 22-pass run and the two repaired homepage assertions. The repaired assertions now recognize Astro's hashed optimized image names while retaining the approved source-stem checks. This is consolidated coverage, not a claim that the original 24-case process was uninterrupted and green.

[Per-case browser report](../../artifacts/portfolio-motion/browser-tests.json) · [Exact six-test export report](../../artifacts/portfolio-motion/export-tests.txt)

All twelve files are H.264/yuv420p, 138 frames, 24fps and 5.75 seconds with no audio. Together they total 2,402,106 bytes. Individual files are approximately 120–315 KiB. Source first/last frames are pixel-identical; decoded endpoint differences were 0.1080–0.6167/255 (under the 3/255 bound). Middle-scene differences were 46.75–115.35/255, independently rejecting static exports. 28 source crop records retain original-file hashes.

## Actual website evidence

Four complete native browser videos show Home and Work at 390px and1440px, with natural silent autoplay for all six projects. The capture observed 36 actual playback visits across390/768/1440px, checked advancing currentTime, mute/inline/loop state, visibility and decoder caps, and recorded 48 website screenshots. It reported zero page errors. Static full-page screenshots deliberately use the supported reduced-motion preference. No animation clocks or video currentTime were set by the capture.

The browser checks cover lazy 35% source attachment, one/two-decoder limits, viewport-center priority, offscreen/hidden release, pause controls, filters, navigation, all 11 public case links, reduced motion, Save Data, autoplay failure, no JavaScript, official contact links and responsive layouts. This focused stage did not rerun every cinematic homepage test; the separate Stage A report covers that suite.

[Gallery and recordings](../../artifacts/portfolio-motion/README.md) · [Capture measurements](../../artifacts/portfolio-motion/website-evidence.json)

## Review limits

These finished 2D motion compositions remain subject to client visual approval. Flattened boards limit isolated-logo resolution and editable geometry; no new official mark was invented. Chromium software WebGL/video decoding does not establish real-device GPU performance or other-engine compatibility. Hosted Netlify behavior remains unverified and unchanged. The existing hand/plaque remains a 2D prototype, and Formspree has no configured owner endpoint/live delivery verification. No merge or deployment was performed.
