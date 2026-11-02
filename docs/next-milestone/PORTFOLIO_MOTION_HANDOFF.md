# Portfolio motion handoff

This dependent branch adds six approved visual project loops to the existing Home and Work cards: SOL Community Center, Bunzo, Triarch, Churros Dessert Shop, By Tech Group and U Wanna Smoothie. It is stacked on PR #7 and therefore Contact PR #5. The original editorial layouts and media-frame ratios remain; responsive compositions are contained rather than cropping away source marks.

## Content and publishing

Each typed project record has an optional `motion` record containing landscape/portrait MP4 filenames and source provenance. Cards resolve those fields automatically. U Wanna Smoothie is now the sixth featured record as requested. No project outcomes, commissioning facts, services, credits or testimonials were added.

Exports live in `design-assets/portfolio-motion`, outside the public directory. The prerendered `/media/portfolio/[file]` endpoint emits only filenames referenced by currently approved public records. Draft and withdrawn records cannot expose their motion media; the publication regression verifies addition and withdrawal in an isolated fixture.

## Playback

Descriptive optimized posters remain the semantic media. Decorative videos have no initial source, are muted/inline/looping and attach only when at least 35% visible. Mobile/coarse pointers allow one decoder, desktop two. Nearly equal visibility uses distance to the viewport center, avoiding alphabetical starvation of a central card. Native scroll updates that ranking through one scheduled animation-frame callback; no scroll input is canceled.

Offscreen, hidden-tab, active-intro and signature-footer conditions release sources/decoders. Reduced motion, Save Data, unavailable JavaScript and blocked autoplay retain posters. A separate keyboard-accessible pause button reserves its space before enhancement. HMR and page lifecycle changes clean up observers/listeners.

## Reproduce and update

`node scripts/portfolio/render-loops.mjs` generates all 12 exports and source/crop/hash manifests from the original approved PNGs. `--project <slug>` and `--format landscape|portrait` support selective reproduction. `--stills` prepares review frames without claiming a video render. Node, the existing Sharp dependency and FFmpeg/FFprobe are required.

The six composition functions in `scripts/portfolio/compositions.mjs` use different narratives: radial SOL identity/application reveals, red Bunzo shutters and packaging panels, Triarch construction lines, Churros illustration/packaging orbits, By Tech modular masks, and Smoothie liquid masks. Masks reveal original raster pixels rather than replacing official marks. Source images are flattened boards; some isolated logos have limited resolution. Higher-resolution editable layers would improve those close-ups. No rigged vector, physical packaging or liquid simulation is claimed.

Run `node --test tests/portfolio-motion-exports.test.mjs` for silent/duration/size/hash/seam/progression checks. Use `PORTFOLIO_PRODUCTION=1 npx playwright test --config playwright.portfolio.config.ts` for the isolated public-page suite. `scripts/capture-portfolio-motion.mjs` captures the actual production pages and exports MP4/GIF evidence.

[Review gallery](../../artifacts/portfolio-motion/README.md) · [Validation](PORTFOLIO_MOTION_VALIDATION.md)

This is submitted for visual approval. No merge, deployment or push to the separate Netlify repository was performed. The existing signature hand/plaque remains a 2D prototype. Owner Formspree setup/live delivery and privacy approval remain launch dependencies.
