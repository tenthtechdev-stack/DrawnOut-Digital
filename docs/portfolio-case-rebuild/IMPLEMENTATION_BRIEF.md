# DrawnOut Digital — Case-study pages: editorial, gallery and animation production brief

**Status:** Ready for Codex implementation on a **dedicated dependent branch**. Source: owner sketch (4 November 2026), current 11 published project records, visually inspected optimized project artwork, existing portfolio publication workflow. **No client/service/credit/outcome facts have been verified.**

## Read first

- **Editorial and image manifest**: \`docs/portfolio-case-rebuild/project-editorial-candidates.json\` (11 projects; 37 available media placements; exact filenames; descriptive alt/caption text; visual-only SEO title/meta candidates; motion lookup).
- Current canonical public content: \`src/content/projects/*.json\`
- Current public page: \`src/pages/work/[slug].astro\`
- Existing components: \`src/components/case/CaseStudy.astro\`, \`CaseGallery.astro\`
- Publication guard: \`src/lib/project-schema.ts\`, \`getPublicProjects\` / \`getPublicWorkProjects\`
- Policy/audit: \`docs/PORTFOLIO_WORKFLOW.md\`, \`docs/SIGNATURE_PORTFOLIO_AUDIT.md\`
- Six existing source-art motion loops: \`design-assets/portfolio-motion/\` (landscape and portrait for Bunzo, SOL, Triarch, Churros, By Tech and U Wanna Smoothie).
- Owner's attached sketch: left tall frame; upper-right large horizontal frame; two equal smaller frames beneath, generous white background and very small amount of editorial copy. This establishes the desired hierarchy; don't literally reproduce thick black placeholders.

## Goal

A visitor clicking any existing Work card should experience a premium, image-first miniature brand presentation. Retain the exact project slug and visual title, present **a succinct credible overview grounded only in the supplied artwork**, curate a responsive mosaic gallery with motion where already available, and leave with a clear previous/next/work/services/contact destination. A distinctive case page should not look like a plain list of enormous boards.

## Shared page structure

1. **Arrival / hero**: existing breadcrumb to All Work, category label, large visual project name and a short, project-specific statement (\`heroLine\`). A subtle clip/masked media reveal (no blocking loader; reduced-motion static immediate). Use \`intro\` of the manifest as brief overview, not a long narrative.
2. **Signature artwork grid**: The most compelling area immediately after the title. For four or more _distinct suitable images_: one tall left slot, one wide right top, two right bottom tiles (owner sketch). Prioritize project-specific crops, preserve full logo visible and avoid unreadably scaling entire multi-image boards.
3. **Visual-thinking interlude**: a succinct secondary heading (\`visualHeading\`) and two-sentence observational note (\`visualCopy\`) between gallery and selected details. Never manufacture challenge/strategy/method/impact sections from images. It is okay to say "in this presentation", "shown in the artwork", "mockups".
4. **Remaining visual detail strip**: up to 2 distinct original assets/approved crops, if available, with human-readable concise captions. Avoid duplicate cover/gallery source and overly close derived crops from the same artwork masquerading as different case-study evidence.
5. **Short closing line**: \`conclusion\` followed by a restrained CTA to see more work and link to an appropriately relevant service page. The suggested service association is an editorial **site-navigation association**, not an attribution of work performed.
6. **Previous/next projects**: retain existing neighbor navigation, following the approved public ordering. Don't link to drafts or invent a new slug.

## Image composition policy

The asset count varies across projects: 2–6 distinct optimized derivatives. Some derivatives are crops from a single original board. **Never add filler stock photography, generate fabricated project mockups or repeat identical images merely to fill the sketch.** Choose responsive mosaic variant by _actual distinct available images and meaningful crops_:

- **Four or more distinct eligible visuals**: \`mosaic-4\`, portrait-ish left, wide top right, two right bottom; additional unique detail rows optional.
- **Three**: \`mosaic-3\`, tall/medium left, large top right and one lower right across remaining width; avoid empty rectangles.
- **Two**: \`mosaic-2\`, one dominant wide or portrait image and one complementary image, with an editorial quote-sized title/copy area where helpful; do not duplicate imagery.
- For tall board assets, inspect true image composition. A \`portrait-lead\` designation indicates layout intent, **not that the file has portrait native dimensions**. Avoid forced \`object-fit: cover\` cutting off text or logos; use contain/letterbox in cohesive brand-color backdrops if needed.
- Use the source-path references in \`project-editorial-candidates.json\`. The layout \`slot\` values are _suggestions_ to be reviewed visually; preserve approved file paths and case visual metadata as canonical.
- Prefer responsive local Astro images with width/height, srcset and sizes; prioritize only above-the-fold lead media, lazy-load below-fold. Retain the approved original PNG archive without editing it. Alt text must match what the image visibly contains, not SEO keyword stuffing.
- Preserve the current exclusion of Triarch's source pricing panel and do not introduce source board 06 Bunzo metrics as performance evidence. Be careful with embedded personal contact names/phone numbers in supplied artwork; do not surface these as narrative or structured data.
- Provide meaningful captions beneath larger images when they help visual understanding, not under every card as identical filler.

## Motion and performance

For six motion-eligible cases, integrate the **existing approved native** 5–6 second loops into one intentional feature slot per page, rather than rebuilding new videos. Use landscape or portrait source based on actual frame ratio and final crop. Decorative motion: muted, playsInline, loop, aria-hidden, meaningful poster, starts on intersection (>=25% visibility) and stops when offscreen/hidden. Never force hover to play. Only one case video active at once. Reduce-motion/Save Data/no-JS should show static imagery; don't load video data in those modes. Use a gentle project-heading masked rise and gallery frame reveal when onscreen. Scroll backward should restore predictable stable frames, not replay every caption and flash. Navigation, captions and project links remain keyboard accessible.

For five static projects: art-direct elegant mask/reveal or 1% transform on entry, not dummy videos, generic particle graphics or false animated brand assets. No heavy canvas/3D dependencies.

Avoid a five-second homepage loader on each internal case navigation. The existing homepage-only loader remains unchanged.

## SEO, semantic HTML and safety

- The 11 records have \`contentVerified:false\` and \`creditApproved:false\`. Existing route renders \`seoTitle\`/\`seoDescription\` only when both are true. **Do NOT change these flags to true and do NOT bypass this policy merely to enable SEO.**
- The manifest provides **proposed visual-only SEO metadata** that describe the approved imagery. For production, consider adding **a separately reviewed, explicitly visual-only metadata field** (e.g. \`visualSeoTitle\`, \`visualSeoDescription\`) gated by the current display permission and owner editorial signoff, without weakening factual claim gates. Or use the safe default \`title — DrawnOut Digital\` and verified descriptive summary until signoff. Do not put those proposals into existing gated \`seoTitle\` fields and claim they are publicly active.
- The manifest copy is editorially written from visible evidence; it is **not verification** of client's engagement or DrawnOut's authorship. Keep \`projectType:unknown\`, factual role/results omitted and original status/publishing flags unchanged.
- Structure: one H1, concise unique descriptive text for humans, distinct metadata once approved, image alts, responsive figure/figcaption, breadcrumbs, internal link to \`/work\` and relevant approved adjacent case. \`BreadcrumbList\` structured data can be used only if correct. Optional \`CreativeWork\` schema must not assert authorship, commissioning, awards, customers, dates or outcome fields. Avoid aggressive keyword lists and unnecessary FAQs on each portfolio case.
- Keep site-wide preview \`noindex,nofollow\` until owner approves public launch. No fabricated star ratings, publication dates, review testimonials, or fake geographic service claims.
- Use existing \`getPublicWorkProjects()\` for public route generation and existing approved-only reference paths.
- Maintain actual accessibility: all images not decorative have understandable alt text, video fallback has text context, focus visibility, reduced motion, non-JS content and natural scroll.

## Page-specific curation

Source of truth is the JSON manifest (do not paste several copies of this copy into ad hoc components). It contains for every case: \`slug\`, \`title\`, \`seoTitle\`, \`seoDescription\`, \`heroLine\`, \`intro\`, \`visualHeading\`, \`visualCopy\`, \`conclusion\`, \`frames[]\` with exact source image path and visual alt/caption, optional \`motion\`. Curation should be adaptive:

| Project              | Core emphasis                                                        | Suggested mosaic | Motion |
| -------------------- | -------------------------------------------------------------------- | ---------------- | ------ |
| SOL Community Center | Green/gold circular identity, community notices, signage and apparel | 4+               | Yes    |
| Bunzo                | Red packaging system, graphic lettering, food promotional layouts    | 4+               | Yes    |
| Triarch              | Monochrome typography, paper texture, yellow accent                  | 4                | Yes    |
| Churros Dessert Shop | Illustrated mark, patterns, packaging and retail applications        | 4                | Yes    |
| By Tech Group        | Blue-green connected mark, dark stationery and device mockups        | 2                | Yes    |
| Capture              | Red target-like motif, print and social mockups                      | 3                | No     |
| Khalo                | Orange illustrated logo, paper bags, cups and takeaway presentations | 3                | No     |
| FK Technology        | Orange monogram across dark print, packaging and UI mockups          | 3                | No     |
| Feed N Seed          | Crop-inspired circular emblem and stationery/container artwork       | 2                | No     |
| Abacus Immigration   | Blue-white travel symbol, stationery and social mockups              | 2                | No     |
| U Wanna Smoothie     | Pink/green fruit identity, color study and menu designs              | 3                | Yes    |

## Validation / review evidence

- Browser screenshots at 1440/1024/768/390/320. Show exactly the first mosaic viewport and representative full pages for all 11.
- Four project-specific design approvals before propagating a universal component: SOL (4+), By Tech Group (2), Capture (3), Bunzo (motion-heavy). Review actual logo cropping, caption legibility and motion character.
- Video at least 8s of SOL and Bunzo case motion, plus forward/back scroll, case-to-case navigation and mobile video poster fallback.
- Verify existing \`src/content/projects\` records unchanged except precisely authorized editorial field additions; zero unpublished content leaks, proper image URL resolutions, responsive CLS, no horizontal overflow.
- Run \`npm run check\`, \`npm run lint\`, \`npm test\`, \`npm run build\`, \`npm run test:build\`, \`npm run test:publication\`, \`npm run format:check\`, focused Playwright and existing portfolio motion regression.
- Report genuinely run tests, not guessed results. Record SEO gate policy separately from visual approval.
- Push work early; a gallery and short implementation report with full SHA and PR link are required before acceptance. Do not merge or deploy.

## Git branch integration instructions

The editorial package branch \`content/project-case-study-gallery-seo\` is documentation-only and was created from \`main\` to avoid modifying active stacked PRs. The live build is further ahead in \`feature/services-overview-chapters\` (draft PR #14, stacked on PR #12 and PR #10). **Do not reset latest work to the docs branch**.

Codex should create a new implementation branch based on the latest integration branch / current head of the development stack, then bring over only the two files in \`docs/portfolio-case-rebuild/\`. Keep route/publication architecture current, opening/footer, 11 published projects, service page implementation and all six video loops safe.
