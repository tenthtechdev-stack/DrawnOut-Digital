# About page — review handoff

The seven-chapter About experience is built around “From one thought to something real.” Typed copy lives in `src/data/about.ts`; `AboutPage.astro` provides the editorial structure; `about.css` owns responsive composition; `about-motion.ts` owns the arrival and scroll lifecycle. `/about` disables the shared overlay while retaining the navigation intent needed by the rest of the site.

The owner-approved expressive sketch is the only founder source in `src/assets/about/`. `FounderPortrait.astro` emits one optimized raster image inside an accessible SVG. Contour, face and fabric brushes reveal that image, then the mask is removed. The editable mask definition in `design-assets/about/portrait-reveal-masks.svg` contains reveal geometry, not editable illustrated facial strokes. The original photograph and rejected artwork are private and are not delivery artifacts.

The guarded entrance settles at approximately 3.5 seconds, with a 4.05-second watchdog. Early interaction releases it immediately. Reduced motion, Save Data, hidden visibility, initialization failure and absent JavaScript retain the complete portrait and story. Origin and process use reversible scroll drawing; ordinary editorial reveals run once. About does not pin sections or block native scrolling.

[Observed validation and limitations](ABOUT_PAGE_VALIDATION.md) · [Actual screenshot and MP4 gallery](../../artifacts/about/README.md) · [Capture manifest](../../artifacts/about/capture-evidence.json)

Reproduce browser acceptance after `npm run build` with `npx playwright test --config=playwright.about.config.ts`. For evidence, start production preview on port 4383 and run `node scripts/capture-about.mjs`; native Playwright recording requires its ffmpeg executable, while transcoding uses the installed system ffmpeg/ffprobe. `--native-portrait-only` regenerates the separately labelled native-size cream presentation without repeating page recordings.

Final owner review remains for the philosophy and approach messaging and the complete composed experience. Keep preview indexing disabled. Illustration approval does not authorize mapping names to positions, publication of the private photograph, a merge or a public deployment.
