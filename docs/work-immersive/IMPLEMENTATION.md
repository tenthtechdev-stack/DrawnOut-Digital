# Immersive Work index — Stage 1

Authoritative brief: [Issue #17](https://github.com/tenthtech/drawnout-digital/issues/17), preserved in [ISSUE_17.md](ISSUE_17.md).

## Branch and review boundary

`feature/work-immersive-index` starts at `0e127071ee5337ab3fbb04487fc358e0aef1024e`, the verified head of open draft [About PR #16](https://github.com/tenthtech/drawnout-digital/pull/16). Its draft review targets `feature/about-premium-redesign`. The inherited About, Services, Contact, homepage and footer implementation remains part of that dependency chain. This milestone changes the Work index; individual case-study redesign is deferred.

## Direction

The existing editorial introduction leads into eleven large project scenes. Each scene has a reserved scroll space and a composition containing title, category, native project link and artwork. Native scroll progress changes the composition's real width and position, the artwork frame's height and curved geometry, and their shared spacing. This is distinct from scaling the image inside an unchanged card. Reverse scrolling reverses the geometry. There is no scroll interception, pinning, or replacement scrolling engine.

All project metadata, ordering, categories and routes come from the existing approved content collection. The first four remain Bunzo, SOL Community Center, Triarch and Churros. Existing title reveals, filter controls and curated static/animated rhythm are retained.

## Reference access

A direct request to `https://brandlic.studio/work/` returned HTTP 403 from the environment network gateway. No inspectable owner recording was found in this workspace. As Issue #17 permits, implementation follows its written behavior specification. No Brandlic code, visual assets, layout measurements or easing values were obtained or copied.

## Content and asset boundary

Approval permits displaying the eleven supplied project artworks. It does not verify client relationships, services performed, narratives, results or credits. The existing `contentVerified`, `creditApproved`, publication and withdrawal controls remain authoritative. This milestone neither changes project records nor regenerates the six approved motion loops. Their landscape/portrait sources, lazy mounting, visibility suspension, decoder limits and user pause controls remain intact.

The inherited signature hand/plaque remains a documented layered raster prototype. This Work milestone makes no new 3D asset or realism claim.

## Validation and evidence

Measured results and remaining limitations will be recorded in `VALIDATION.md`; the GitHub review gallery will live at `artifacts/work-immersive/README.md`. Implementation checkpoints are not claims that final browser validation or visual approval is complete.

## Frame geometry and media

The Work-only composition uses its source artwork's aspect ratio. Desktop width is bounded by the viewport height for very tall originals, while selected landscape artwork can reach nearly the full page width. Animated scenes use the existing exports' actual dimensions: 960 × 540 landscape and 600 × 750 portrait. Their frame ratio stays constant throughout expansion, so geometry changes do not switch video variants or remount a playing source.

The server reserves the initial animated/static geometry using the same `selectPortfolioRhythm` policy as the existing browser controller. Filters may recurate that visible sequence without changing project order. Triarch uses its already approved letterform detail for the desktop index and its existing business-card cover on mobile; neither its content record nor its case study changes.

`work-immersive.ts` owns only the Work scene wrappers. Passive native scroll schedules one animation frame, reads all stable wrapper positions before writing changed progress values, and has no idle animation loop. Captions and image frames share the same composition width; artwork remains contained rather than stretched or independently zoomed. Title reveals remain the existing one-time, focus-aware treatment. Resize, fonts, filters, visibility, reduced motion, Save Data and browser restoration are handled without wheel interception.

## Reproduce review

Build with `npm run build`, then run `npm run preview -- --ignore-lock --port 4420`. Capture with `PLAYWRIGHT_BROWSERS_PATH=/workspace/squares-review/playwright-tools node scripts/capture-work-immersive.mjs`. The environment-specific browser cache can be omitted when Playwright's FFmpeg is installed in its usual location. Native browser videos are transcoded to H.264 without changing their timing. Capture metadata records the application source hashes, viewport, native scroll positions, geometry, playback state and any errors.

For full-page stills the capture script starts a separate Chromium software compositor. This avoids the cloud SwiftShader backend's known repetition on images taller than 8192px. Viewport stills and recordings retain ordinary browser rendering. No CSS is injected and no application timeline is sought to manufacture review states.
