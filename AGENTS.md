# Codex instructions — DrawnOut Digital website

## Mission
Build a fast, accessible, highly distinctive **creative-led full-service digital agency** website for DrawnOut Digital. Interpret user-supplied references intelligently. **Do not clone KOTA, Brandlic or Ramotion**; implement original expressions of the approved motion ideas and brand assets. Deliver exceptional finish without sacrificing clarity and usability.

## Read order / authority
1. **User approvals and new project instructions** override this pack.
2. `docs/MASTER_SPEC.md`: canonical scope, route behavior, and product priorities.
3. `docs/MOTION_AND_FOOTER.md`: exact animation behavior, breakpoints and graceful degradation.
4. `docs/DESIGN_SYSTEM.md`, `docs/SITEMAP_AND_CONTENT.md`, `docs/ASSET_AND_PORTFOLIO_POLICY.md`.
5. `docs/PHASES_AND_QA.md`: checklists, tests, and phase gates.
6. `docs/PRIOR_RESEARCH_V04.md`: historical findings and cautions, not a source of new approvals.

## Implementation principles
- **Do not start all implementation phases at once.** Read the requested phase, state assumptions and risks, implement only that phase, run tests, show desktop/mobile previews or screenshots when tools permit, and request approval.
- Default stack: **Astro + TypeScript + Tailwind CSS**. Use client-side JavaScript only where truly needed. Prefer Astro components over shipping a single giant React application.
- Use **GSAP + ScrollTrigger** only for scroll-linked, pinned and multi-stage motion (especially the footer). Use CSS transitions and native IntersectionObserver for small interactions. Do not install multiple competing scroll engines.
- Avoid global scroll hijacking, scroll-jacking, forced wheel listeners, gratuitous horizontal scroll and scroll-based blocking of links. Native vertical scroll should always work.
- Respect `prefers-reduced-motion`; provide a genuinely usable static/reduced experience (not a screen left hidden because JS didn't run). Support keyboard navigation, visible focus, proper contrast and semantic DOM.
- Responsive first. Confirm layouts around 360, 390, 768, 1024, 1440 and 1920 px. Use responsive type scale, breakpoints and mobile-safe scroll logic.
- Build all pages and project cards from reusable components. Project metadata should be maintained as **typed Astro Content Collections**, with Git history and human approval before publishing.
- One canonical content source. Never duplicate case-study metadata across homepage, work grid and project pages. Do not hardcode project cards for each new project.
- All image/video elements need aspect ratio and size reservation to avoid CLS. Keep fallback posters visible until actual footage loads. Lazy-load out-of-view media. Keep hero text rendered even when JS, video or animations fail.
- Avoid dependencies added solely for a simple one-off visual flourish; when introducing any library, say why it is required.
- Keep motion separate from content markup and business logic; scope triggers, clean up on page navigation and resize, and reinitialize only as needed.

## Authenticity / content safeguards
- Source copy is in `docs/SOURCE_COPY.md`. Maintain its strong, confident voice. Do not replace with generic marketing slogans, fake testimonials, fabricated metrics or unconfirmed service proofs.
- Unconfirmed project data must be marked `draft` and excluded from published routes, feeds, filters, OpenGraph pages and sitemaps.
- An uploaded logo raster is for visual reference. Preserve its proportions. Do not silently redraw/alter the mark or use dark lettering over a dark background.
- The sample hand frame is a *visual concept*, not an approved icon redraw. Do not reproduce the platform badge in production.
- No claims of live websites, development, marketing conversions or verified impact based on flattened portfolio boards alone.
- Use client-supplied footage when delivered. Until then use WebP project posters with deliberate motion-safe framing; never label a static poster as a video project.

## Engineering standards
- Typescript strict mode; readable components; shared tokens instead of magic constants; clear component ownership.
- Favor Astro asset optimization for local images and sensible font loading; avoid oversized PNGs in grids.
- Use proper `alt` text, accessible filters, keyboard-operable menus, accessible contact form feedback, descriptive links and metadata.
- Never store secrets in the repository. Contact form must not expose privileged keys; use server-side anti-spam and validation when wired.
- Add basic automated test coverage for content validation, route generation, filter behavior and reduced-motion logic. Test scroll timeline manually or with Playwright visual checks across specified sizes.
- Use responsive test screenshots as *evidence*, not as a substitute for running builds and functional tests.

## Completion rules
For each phase report: changed files; implementation decisions; test commands and observed pass/fail results; preview screenshots/links if available; outstanding issues; explicit next approval required. Do not fabricate test outcomes. Do not push, deploy publicly, purchase services, create third-party accounts, expose content publicly, or change production data without user approval.
