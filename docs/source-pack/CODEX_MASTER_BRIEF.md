# DrawnOut Digital — Consolidated Codex Master Knowledge

**Version 1.0 | 21 October 2026 | Research and development specification**

This single file concatenates the core instructions from the pack for convenience. The repository-level `AGENTS.md`, reference images, original copy and real test work are still necessary. **This is a specification, not a shipped website.**



---

# Master product specification — DrawnOut Digital
**Version 1.0 | 21 October 2026 | Implementation proposal; final design pending studio sign-off**

## Vision
Build an original, immersive agency website that looks like DrawnOut's creative practice, not an off-the-shelf marketing template. The site should make an immediate visual impact, substantiate five disciplines with real work, and make contact intuitive. Structure and accessibility are not secondary to motion.

## Positioning
- Business: independent creative-led full-service digital agency, presenting publicly as a creative and digital studio.
- Audience: startups, growing businesses, organizations, marketing/brand teams seeking a design and digital partner. Local Pakistan + international, without unverified geographical claims.
- Brand story: good design attracts attention, great thinking connects it to intent. Independent, conversational, curious, energetic, confident.
- Proof hierarchy: actual projects > specific demonstrated disciplines > process > credible team details. No invented statistics, clients, testimonials or awards.

## Goals (ranked)
1. Make strong first impressions through authentic DrawnOut work and carefully orchestrated design.
2. Offer frictionless navigation to services, work, case studies and contact.
3. Establish trust via documented case studies, project roles and a transparent studio process.
4. Generate qualified, measurable enquiries; primary CTA `Have Something in Mind?` (hero) and `Tell Us What You're Thinking` (contact) are user-supplied, not replaced by generic buttons.
5. Enable Codex/Git-driven project additions without layout redevelopment and support future CMS migration.
6. Run reasonably well on mobile/data-constrained connections and for reduced-motion users.

## Top-level experience
1. **Entry/hero:** big and readable headline `We make ideas impossible to ignore.` animated over branded fluid atmospheric gradient. Hero can include media poster / future showreel module but typography remains primary. Animated type entrance is intentional, not every letter looping forever.
2. **Studio statement:** condensed `NOT ANOTHER CREATIVE AGENCY` perspective, concise, no five successive manifestos.
3. **Selected work:** project cards with visual variety. Use a configurable grid with alternating editorial rows. Hover/focus interactions; navigation to full case pages. Some portfolio cards can use corner expansion/intersect effect inspired by reference while remaining original.
4. **Services:** short introductions to five pillars, each linked to comprehensive Services content, ideally paired with relevant work.
5. **Approach/process:** 4 stages condensed from supplied content; possible oversized statement + steps, no overlong text-only walls.
6. **Studio/about teaser:** distinctive voice, real team details only when authorized, link to About.
7. **Final call to action and signature footer:** user-requested scroll narrative with hand and raised glass/emblem frame growing into background. Contact remains a real functional link/form, with social links and legal details.

## Navigation structure
Desktop: DrawnOut logo left; Work / Services / About / Contact links right, plus an accent project enquiry action when space allows. Home via logo. Sticky header transitions modestly in contrast, not an intrusive 3D nav widget.
Mobile: a proper menu button with `aria-expanded`/`aria-controls`, focus management, Escape to close, scroll locking only while modal is open, sufficiently large targets. CTA remains accessible.
Subnav: Work filters are not new routes by default. Individual service pages are deferred unless long, useful content supports them. Avoid thin SEO pages and an unnecessary mega-menu.
Footer: Contact CTA, email (pending approval), Work, Services, About, social links (user-supplied), copyright with current year, privacy/legal when needed. Sticky stage must not block navigation or screen readers.

## Core pages
- `/`: original hero, concise messaging, selected work, services, philosophy, process teaser, CTA/footer.
- `/work`: grid of validated projects, category filters with counts derived from published content, configurable featured ordering, keyboard and tap support. Show state when no results; URLs/shareable filter optional pending need.
- `/work/[slug]`: shared case-study template with hero, project summary/role, brief, approach, image sequence, deliverables, real outcome only if verified, related projects, enquiry CTA; publication metadata.
- `/services`: five sections using original service names, no fake skills/certifications, links to relevant published cases. FAQs only when real.
- `/about`: 'Not Another Creative Agency', 'Pretty Isn't the Point', method, team if verified, ideal clients, contact CTA.
- `/contact`: concise copy, accessible enquiry form or direct email CTA depending on confirmed infrastructure; accessible validation, privacy link.
- `/404`: branded, useful work/home links and no motion dependence.

## Why visual references are complementary
- KOTA inspires **hero atmosphere**: gradients + large type + motion refinement.
- Brandlic inspires **portfolio and section expansion**: corners, framed media, editorial balance.
- Ramotion inspires **operational UX**: findability, clear sections, well-labeled work and services.
- DrawnOut must have its **own** icon, warm-toned color logic and distinctive scroll footer, avoiding reference-site identity cloning.

## Responsive design contracts
### Mobile (< 640px)
- Headline 2–5 readable lines; no intentional clipping that hides words.
- Portfolio single-column cards; tap and keyboard discoverability (not hover-only).
- Realistic video poster. No autoplay sound. Limit one major pinned sequence; footer motion simplified or static if not robust on actual mobile browsers.
- Footer CTA always visible outside/after sticky animation (can be reached without animation).
### Tablet (640–1023px)
- Flexible split sections where content supports them, avoid tiny captions.
- Footer stage only pinned after testing viewport/landscape behavior.
### Desktop (>=1024px)
- Hero and case studies can use editorial large type and asymmetrical grids.
- Scroll reveal vocabulary available, not applied indiscriminately.
- Full footer animation with poster-to-immersive background transition.

## Interaction states that must exist
Navigation: default, hover, focus, active; menus open/closed; cards default/hover/focus; filters active/inactive/empty; form pristine/loading/success/error; video paused/loading/ready/error; missing media fallback; reduced-motion version; scroll up/down/reload mid-section.

## Performance and quality budgets (targets, not current measurements)
- CWV target at 75th percentile: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- Avoid animating properties that induce continuous layout and paint; prefer transforms/opacity, make expansion via scale/clip judiciously.
- No invisible critical text while JS waits; font fallback and swaps; SVG/light raster for logo variants.
- Hero media poster prioritized only when visible/LCP; below-fold media lazy loaded. `srcset`/`sizes`, AVIF/WebP, responsive crops, descriptive alt.
- No unbounded infinite animation canvases. Suspend or reduce effects when off-screen.
- Reasonable JS budget: reserve heavy interactive code for motion islands; measure before optimizing.
- Accessibility target WCAG 2.2 AA; minimum keyboard and reduced-motion verification is mandatory.

## Non-goals for v1
- Custom admin dashboard, CRM, payment processor, client portal, complex multi-language structure, speculative blog/news, detailed service pages without actual content, invented testimonials, fabricated analytics or claims.

## Open approvals
1. Current canonical name capitalization and vector logo/light logo variant; whether reference 3D emblem matches brand.
2. Exact website domain/contact email and authorized social URLs.
3. Genuine five service scopes and substantiation (especially web development, digital ads, writing).
4. Client projects/credits/provenance and publication rights.
5. High-res separate hand, frame, emblem and/or animation master; supplied videos and posters.
6. Contact-form destination/hosting/anti-spam and analytics/privacy policy.
7. Typeface license and final color tokens.



---

# Design system and art direction

## North star
The interface should feel like a **creative editorial publication in motion**: strong typographic scale, custom layout rhythm, energetic but controlled color, excellent project crops, precise transitions, and quiet utility. Portfolio work remains the star. Originality over visual noise.

## Working palette (NOT final approved brand colours)
- `--ink: #171717` / `--charcoal: #282625` — main type/dark surfaces
- `--paper: #F7F5F1` — warm off-white backgrounds
- `--orange: #F05A28` — brand-proximate accent **estimated** from logo, not sampled approved swatch
- `--amber: #FF9A43` — ambient highlight
- `--cream: #FFF8EE` — light tone
- `--neutral: #FFFFFF`
- hero atmospheric extras (sparingly, never as core logo color): muted rose, lavender and near-blue to give depth. Do not reproduce KOTA's precise gradient arrangement.
All final colors must be validated for text contrast against actual backgrounds. Deliver an explicitly light wordmark on dark header backgrounds from approved assets.

## Typography
Use a high-quality grotesk/sans with bold expressive headline styles and clear reading font. **Font names are not locked.** Verify allowed licensing and availability before shipping. Define type tokens using `clamp()`: hero ~ `clamp(3.1rem, 8.4vw, 10rem)` on desktop, smaller mobile rules; H2 ~ `clamp(2.4rem, 5vw, 6.5rem)`; body ~ `clamp(1rem, 1.15vw, 1.25rem)`. Measure readable line-lengths and line breaks at each breakpoint. Do not clip words outside safe-area on mobile.
Recommended editorial choices: occasional condensed captions, uppercase mono-sized section numbers, oversized open letterforms, but no gratuitous distorted type.

## Grid and spacing
- Max page grid roughly 1440px with fluid side gutters `clamp(20px, 4.2vw, 88px)`.
- 12-column desktop principles and 4-column mobile; allow asymmetrical spans for projects.
- Section rhythm distinct: some quiet whitespace, some bold full-bleed color/media stages.
- Avoid monotonous repeated cards/rounded boxes. Mix editorial rows with purposeful art-led section breaks.
- Corner radius vocabulary: 0–4px for utilities, 12–24px for cards, up to 40–96px for selected expansion scenes. Treat dramatic rounding as one notable motif, not a universal token.

## Gradient hero (KOTA-inspired, DrawnOut-owned)
- The hero should use 3–4 low-frequency radial-color fields against a brand-safe base. Example technical concept: orange/amber front light, cream left/top diffusion, muted magenta-violet side reflection, dark negative space for logo contrast where appropriate.
- Gentle scale, translation or CSS-variable drift; an intentionally **subtle** cycle, not a continuous intense rotating rainbow.
- Hero text remains readable at every frame with a controlled dark/bright type treatment; avoid text blending modes that produce unpredictable contrast.
- Prefer CSS gradients initially; use WebGL only if design review demonstrates a real visual requirement not achievable with composited layers.
- Desktop hero min-height around 90–110svh, with foreground headline, compact descriptor and two semantic CTAs.
- New footage later can occupy an independent hero/showreel slot; do not let video block title delivery or LCP.

## Scroll-motion vocabulary
**Use only these main patterns at v1:**
1. **Type reveal**: whole-line or phrase reveal (not aggressively splitting every body sentence). Start 16–36px below in overflow-hidden wrapper, opacity 0→1, duration 0.55–0.85s, stagger 0.07–0.12s, ease tuned after preview.
2. **Section reveal**: enter viewport, translateY(24px) and opacity 0→1, 0.6–0.9s. Must not rely on animation for critical content visibility.
3. **Image drift**: mild internal translate/scale for depth, bounded, no accidental cropping of client marks.
4. **Card spread**: selected media reveal grows by changing container clip/radius or composited scale; avoid shifting surrounding grid content.
5. **Pinned narrative**: only for the hand/logo → full-bleed footer signature. One major sequence on a page.
6. **Hover cues**: image zoom 1→1.035, small directional arrow slide, subtle label reveal; all keyboard focus equivalents.
Do not implement motion on every element merely because the references animate frequently; prioritize headline, featured cards, section changes and footer.

## Suggested page art direction
- Home: atmospheric hero → restrained short manifesto → large alternating portfolio imagery → structured service index → studio/process → cinematic finale.
- Work: editorial index with categories, off-white baseline, full-bleed imagery alternating with quiet left-column metadata; show types and industries genuinely represented.
- Case study: opening hero image or poster, clear metadata, stunning media gallery with a consistent readable story; avoid subjective animation while the user is reading project details.
- Services: utility first; five sections with meaningful descriptions and related portfolio evidence.
- About: large manifesto fragments balanced with factual studio details.
- Contact: fast, warm and frictionless.

## Originality and legal concerns
Using inspiration is permitted as a research technique but avoid copying proprietary assets, competitor brand marks, distinctive frame layouts pixel-for-pixel, motion choreography exactly, source code or copy. Client assets remain client assets. Footer screenshots are for direction only.



---

# Reference audit: what is observed vs what we propose
**Review date:** 21 October 2026. Website appearance can change. Automated textual inspection does **not** establish precise animation source code or timing. Screenshots are additional first-hand evidence supplied by the user.

## 1. Brandlic — https://brandlic.studio/work/
Observed on public Work page: clean, editorial portfolio; introduction and filters (All Works, Branding, Identity, Illustration, Logo, Packaging, Print, Signage, Strategy); numbered cases with short rationale; 'Load more'; contact invitation; footer/navigation. User screenshot shows a generous two-column card with title at left and product visual at right, and striking lower corner treatment.

**Requested inspiration**: visual 'spreading' expansion effect at bottom, scroll transitions, type reveal, distinctive brand-studio craft.
**DrawnOut interpretation (proposed, not reverse-engineered)**: let one selected image or card expand via scale/clip/border-radius interpolation as it enters the final call-to-action stage; use staggered category transition and restrained split-type reveals. Avoid claiming to replicate Brandlic's actual code/timeline.
**Do not copy**: Brandlic projects, their exact layout ratios, fonts, curved mask shapes, brand voice, identity or code.

## 2. KOTA — https://kota.co.uk/
Observed public structure: navigation Work, Agency, Services with 3 disciplines, Blog, Culture, Contact; prominent project CTA; oversized positioning headline; service summaries; framework/process controls; work/projects; supporting results. User screenshot shows a soft, saturated magenta-violet-cyan gradient occupying the hero behind oversized dark editorial type; the reference view crops letters dramatically.

**Requested inspiration**: premium layered gradient hero, oversized typography, scroll-based directional/type reveals and cinematic pacing.
**DrawnOut interpretation**: brand-led dark/neutral shell, animated low-frequency amber-orange with subtle blush-violet reflected light; static fallback gradients; foreground heading always legible; never duplicate KOTA's exact gradient composition or global brand positioning.
**Do not copy**: headline cropping that destroys mobile legibility, KOTA's original text, font, artwork, or gradient pixel-for-pixel.

## 3. Ramotion — https://www.ramotion.com/
Observed public structure: Work, Services, Programs, About, Blog, Subscribe, Contact; links to Branding, Web design, UX design, Design system, Web app development; extensive client/work examples and clear internal linking.

**Requested inspiration**: accessible service grouping, simple sitemap, links to detailed work, low-friction navigation, strong supporting copy.
**DrawnOut interpretation**: keep five core pages plus project details; work and services consistently accessible on desktop and mobile; no mega-menu needed at v1 because DrawnOut has only five pillars. Progressive enhancement and filtering should not prevent navigation.
**Do not copy**: client's success stats, logos, industries, claims, long sprawling page or unnecessarily many nested categories.

## 4. Hand-held logo screenshot (`assets/reference-only/footer-hand-logo-reference.png`)
- Single 357 × 489 image shows a warm orange cinematic scene: visible fingertips/hand, a clear illuminated rectangular object, and a stylized geometric symbol set inside, with a bright backlight.
- **Important**: the symbol does not visually match the provided flat DrawnOut logo one-for-one (the supplied logo shows an orange D-like element with a charcoal inset). Treat this image as a direction reference only, pending exact emblem artwork.
- The image contains a platform overlay icon. Never ship that as production footer art.
- No independent foreground/background layers, alpha masks, frame sequence, video master or rights provenance is included.

## 5. Supplied logo (`assets/reference-only/drawnout-logo-provided.png`)
- Full composite wordmark/icon asset, 1920 × 1080, transparent PNG with substantial margins.
- Orange geometric monogram, dark charcoal inset and lettering. Over a dark background the lettering has insufficient contrast. Request optimized light/dark SVG versions and an icon-only master, and confirm the official spelling/capitalization.
- Do not simply invert the composite PNG; use authentic supplied versions or an explicitly approved derived version.

## 6. Original portfolio evidence
- Archive: `Our_Work_By_Company.zip` (previous session). 46 PNGs; 15 folders, including the studio identity and unsorted material; 13 named external-facing project groups.
- Current pack contains seven optimized stills as **development placeholders** and `portfolio-inventory.csv`, with earlier assessment in `PRIOR_RESEARCH_V04.md`.
- Portfolio images are primarily designed boards/montages, not raw isolated website photography or proof of launched work.

## Official implementation references
- Codex models / guidance: https://developers.openai.com/api/docs/models , https://developers.openai.com/api/docs/guides/code-generation , https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Astro content: https://docs.astro.build/en/guides/content-collections/
- Astro images: https://docs.astro.build/en/guides/images/
- Astro transitions: https://docs.astro.build/en/guides/view-transitions/
- Reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- Accessibility: https://www.w3.org/TR/WCAG22/
- Performance: https://web.dev/articles/vitals/



---

# Sitemap, page blueprints & editorial placement
Status: recommended arrangement using DrawnOut's own draft. Page placement is a proposal, not authorization to rewrite copy or make unsupported claims.

## Site map (v1)
```
/
├── /work
│   └── /work/[slug]
├── /services
├── /about
└── /contact
```
Optional later: `/services/[slug]` only after substantive specialized content; `/insights` only if team commits to sustained editorial publishing. `/privacy` when needed for form/analytics policy, `/404` essential.

## Home blueprint
**Header:** logo (light/dark variant depending contrast), Work / Services / About / Contact, CTA `Have Something in Mind?` (or a space-saving equivalent approved by studio).
**Hero:** H1 `We make ideas impossible to ignore.`; kicker `Design. Strategy. Storytelling. Digital.`; body `We turn raw ideas into distinctive brands, meaningful experiences, and creative work with something to say.`; supporting line `From the first scribble to the final scroll, we make every detail count.`; CTAs `Explore Our Work`, `Have Something in Mind?`.
**Atmospheric motion:** gradient behind type; optional showreel slot with still poster and future approved silent video. Keep real HTML H1.
**Intro/manifesto excerpt:** `NOT ANOTHER CREATIVE AGENCY.` with concise excerpt; link to About, where rest lives.
**Featured work:** `THE WORK SPEAKS. WE'LL LET IT.`; 4–6 approved project cards and optional short reason/discipline; link `Explore Selected Work`.
**Five services:** `WE THINK BEYOND THE BRIEF.`; short description/link for five pillars; no unverified results.
**Approach teaser:** `PRETTY ISN'T THE POINT.` and/or `SMALL DETAILS. BIG PICTURE.`; four short steps.
**Fit:** optional `BUILT FOR BRANDS GOING SOMEWHERE.` excerpt, if not repetitive.
**Final animated scene:** hand/frame/emblem → footer background, CTA `HAVE A GOOD IDEA? LET'S MAKE IT BETTER.` and button `Tell Us What You're Thinking`, then signature `Think it through. Draw it out. Make it matter.`.
**Footer:** real email/social/legal links only once verified, site navigation, accessible keyboard structure.

## Work listing blueprint
Intro with strong type, category filters, project cards (two alternative layouts: editorial split with side metadata; image-led card). Categories should reflect actual published entries, e.g. Branding, Digital, Campaigns, Packaging, Creative Direction; don't expose empty default categories as implied proof. Each card has a project title, 1-line description, service tags and descriptive link. A project may have multiple categories. Footer CTA reusable.

## Case-study blueprint
1. H1 project title, description and hero visual/poster.
2. At-a-glance: engagement type (client/concept/internal), services, organization/industry (if approved), year (if verified), DrawnOut's role.
3. The challenge (client-supplied, fact checked) and the creative idea (studio-approved rationale).
4. Media modules: full-width image, asymmetrical split image, captioned detail strip, optional silent process video, device/mockup.
5. Impact/outcome *only if supported*, otherwise write what was delivered without inventing growth metrics.
6. Credits and client approval metadata when appropriate.
7. Related work + next project + enquiry.
Avoid repeating every flattened board image as one enormous web image; ask for isolated exports/crops, optimize and label appropriately.

## Services page blueprint
Intro, then 5 pillars, each with strong supplied title + one-line proposition + concrete service list + real case links. CTA at suitable cadence, no dummy partner logos.
1. Brand Identity & Design — `Make your brand look like it knows who it is.`
2. Digital Design — `Your brand should feel like itself everywhere.`
3. Marketing & Campaigns — `Make every impression mean something.`
4. Words & Storytelling — `Because what you say matters as much as how it looks.`
5. Creative Direction — `A bigger idea needs a bigger picture.`
Service names/descriptions from supplied copy; service scope subject to verification, especially development, paid campaigns and writing deliverables.

## About blueprint
`NOT ANOTHER CREATIVE AGENCY.` full or edited introduction, `PRETTY ISN'T THE POINT.` philosophy, `SMALL DETAILS. BIG PICTURE.` four-step process. Introduce real team/leadership with consent and actual roles. `BUILT FOR BRANDS GOING SOMEWHERE.` audience fit. Contact CTA. Use original voice but edit repeated ideas. Never fabricate headcount, locations or credentials.

## Contact blueprint
H1 `HAVE A GOOD IDEA? LET'S MAKE IT BETTER.`; paragraphs `Maybe you need a brand that finally feels right ... You don't need a perfect brief. You just need somewhere to start.`; CTA `Tell Us What You're Thinking.`
Fields after service owner approval: name, email, project description required; service interest optional; budget/timeline optional, not a barrier. Explicit success/error messaging. Direct email link and real social accounts. Anti-spam and legal text as required.

## Homepage hierarchy decision
Because the agency's site must showcase design excellence and services, two sequences are acceptable to test:
A. Hero → selected work → services → manifesto → process → footer (most art-led)
B. Hero → short service strip → selected work → full services → studio → process → footer (more commercial)
Recommended launch prototype: **B**, but lead image card within first 1–2 viewport heights. Use user review of real prototypes to decide, not generic SEO assumptions.



---

# Motion system specification — scroll choreography & signature footer
**Priority:** must visually impress, reverse cleanly, respect motion preferences and avoid blocking contact/navigation.

## Technology recommendation
- Astro page component with an isolated client-side motion module, dynamically imported when element is present and user has not requested reduced motion.
- Use **GSAP with ScrollTrigger** for all pinned/scrubbed sequencing. CSS for simple hover and base gradients; IntersectionObserver for ordinary in-view reveals.
- No global Lenis/ScrollSmoother at baseline. Add only after testing and explicit review, and never break native anchor scrolling or keyboard navigation.
- Maintain clean component lifecycle: teardown ScrollTriggers on route changes, use `matchMedia` for responsive variants, `invalidateOnRefresh` for layout changes, `ScrollTrigger.refresh()` on actual image/layout changes, no stacked triggers on navigation.

## A. Entry hero animation
**Semantic order:** H1, descriptive line, CTAs available in HTML before JS initialization.
- Background: CSS radial gradient layers, leisurely transforms or keyframed position movement with static fallbacks; mild overshoot permitted, but no high-frequency strobing.
- Text: 2–4 chunks reveal with mask/split lines, after fonts ready or with stable line segmentation. Large text should never disappear if animation fails.
- Header: simple fade into readable foreground if necessary; no invisible logo.
- Scrolling out: minimal parallax (e.g. heading shift -3vh + fade 1→0.6). Do not trap user or make headline entirely unreadable on standard viewport.

## B. Portfolio editorial media reveal (Brandlic-inspired)
Selected work cards may enter with opacity fade/vertical 24px, followed by media expansion at scroll thresholds; optional asymmetrical right media card with softened lower corner. Keep title and category near associated image; no scroll-speed-dependent rearrangement that changes reading order. Ensure hover/focus label display and keyboard-operable links. Animate image layer, not card intrinsic dimensions, to prevent CLS.

## C. Text reveal strategy (KOTA/Brandlic-inspired)
- Use line/phrase grouping and intersection triggers. CSS initial state should show readable content if JS absent; apply `.motion-ready` only after JS is active and reveal can execute.
- A11y: retain one meaningful accessible text stream. Avoid duplicated aria text caused by per-character wrappers; do not animate screen reader DOM or rely on pseudo-content for important words.
- Easing: editorial reveal ~ `power3.out`; scrub-linked transforms use `ease: none`. Tune under real-scroll user tests.
- Default initial CSS reduced-motion: no transform/opacity hiding, no pinning.

# D. Signature footer: four-act scroll experience
## The exact requested story
**Hand enters from BELOW. Logo/emblem enters from ABOVE. They meet in a lit transparent square frame. Continued scroll expands the finished hand-plus-frame picture until it becomes the background of the footer.** Moving backward must reverse the sequence smoothly. The final CTA must remain directly usable.

## Required *final* media before production
1. `hand-foreground` asset with transparent alpha OR a high-quality composited 3D/2D sequence showing real hand movement.
2. `glass-frame` transparent material/render, separate from hand if building 2D layered animation.
3. `approved-logo-icon` 1:1 shape and accurately branded 3D/glow treatment; confirm whether user's orange/yellow screenshot icon is the same brand mark as the supplied orange/charcoal logo.
4. `final-composite` high-resolution, preferably landscape responsive versions and a tall mobile crop, with a clean background and no social platform overlays.
5. Optional pre-rendered master video/frame sequence if realistic finger occlusion, glass refraction and highlights require actual 3D rendering. Separate HTML layers alone **cannot fake full physically correct occlusion** from this single screenshot.
6. A licensed/approved soundtrack is **not needed**; default silent.

## Placeholder phase (must work without final footage)
- Use the user-supplied hand screenshot **only as an internal reference**, not a standalone production background. It is ~357x489 and bears a UI badge.
- Implement a *motion prototype* using temporary hand-shaped/arm-shaped geometric illustration or explicit labeled proxy assets, an independent frame card and the provided logo/placeholder approved monogram. Label as prototype; do not make inaccurate photorealistic representations.
- If realism is essential for demonstration, transition from placeholders to an internally marked cropped still concept at the merge point, while documenting the obvious jump and need for master footage. Do not claim pixel-perfect completion.
- Keep a visible working static final state when assets aren't ready; no broken video boxes or hidden footer.

## Proposed geometry/timing, normalized progress p = 0..1
- Stage wrapper: approximate scroll length `300–380svh`, with stage visual `100svh` pinned for desktop, configurable with responsive measurements. Progress is defined by ScrollTrigger start/end, not hardcoded window scroll pixels.
- **Phase 1, p = 0.00–0.26: Hand emerges** from `translateY(105% stage-height)` to its target hold position (fingers visible, anchored near visual lower center). Simultaneously frame illumination appears subtly. Camera or composition remains fixed.
- **Phase 2, p = 0.14–0.43: Emblem descends** from above (`translateY(-65vh)` or design-specific normalized distance) and scale 0.72→1.0; rotate subtly only if approved. Synchronize it with frame perspective. Emblem and hand should not visually intersect incorrectly.
- **Phase 3, p = 0.43–0.59: Contact and lock-up.** Ease the two elements into final held pose, brief bloom/edge glow, gentle frame reflection. No artificial bounce or shake. Hold enough for recognition.
- **Phase 4, p = 0.59–0.87: Spread-to-background.** Visual composite scales/uncrops to full viewport using transform and inset/mask interpolation; outer rounded corners transition from large to 0. Image fills screen with approved `object-fit: cover` crop. Gradient/dark overlay grows to guarantee readable footer type. This is a conceptual adaptation of 'spreading' references.
- **Phase 5, p = 0.80–1.00: Reveal real footer content.** CTA/header and footer nav fade/slide into position over the full-bleed image. Visual sequence reaches stable final state without twitching. Stage releases naturally to page end with no snap-back.
Note: phase labels overlap intentionally to create organic continuity; actual values are **design tuning targets**, not observed Brandlic/KOTA values.

## Motion progress invariants
- Scrubbed and **reversible**: if the user scrolls back from p=.9 to .2, hand/frame/emblem visual state corresponds to .2 and text visibility reverts elegantly.
- `scrub` smoothing target ~0.4–0.8s (not a separate autoplay). Use one master timeline with `ease: none` for progress mapping, `ScrollTrigger pin`, `invalidateOnRefresh`, `anticipatePin` only if measured pin flash.
- No permanent whitespace after pinned container, no flicker on viewport resize, orientation change or browser back/forward.
- Text, CTA, links are real HTML with proper focus handling and readable layering, not burned into video. Do not let decorative overlays intercept taps/clicks.
- Do not bind footer action to scroll position: direct anchor/keyboard navigation to Contact must always work.

## Optional technical strategy when final assets arrive
**Option 1: Layered composition** (preferred when hand, logo and frame separated): transparent WebP/AVIF/PNG/animated assets + GSAP transforms; low transfer cost, repeatable; test occlusion quality.
**Option 2: Pre-rendered still sequence** (preferred for authentic complex 3D hand/grip/glass): render e.g. 48–96 carefully optimized frames across entrance and merge, controlled by scroll progress, with static last-frame background for expansion. Test decoded memory and slow mobile devices; preloading only near footer. Not automatically recommended if asset budget is high.
**Option 3: Video master**: use video for a time-based ambient footer variant, with explicit play controls or mute autoplay if appropriate; scrubbing a video `.currentTime` directly from scroll on all browsers can have seeking/stutter and mobile constraints. Choose frame sequence or rendered keyframe approach when true scroll mapping is mandatory.
**Fallback:** approved full-resolution static poster with footer CTA visible, no pin; this is a valid accessible reduced-motion implementation.

## Mobile and reduced motion
- < 768px: shorten or eliminate pin; prioritize a portrait-approved crop. If artifact clipping/scroll jumps are seen on iOS Safari, show a two-step fade/crossfade from hand/frame poster into full-bleed background rather than stubbornly forcing full scrub.
- `prefers-reduced-motion: reduce`: do not pin or translate hand/logo; display final, static approved art and immediately accessible CTA/footer links. Disable animated gradient drift and per-letter movement.
- Slow data/save-data: default to poster or lighter animation; loading high-res sequence must not block LCP.
- Text should be visible at browser zoom 200%, no inaccessible hidden links during pin. Avoid overlay opacity that fails contrast.

## GSAP pseudocode for design review (not ship-ready)
```ts
const mm = gsap.matchMedia();
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: footerSequence,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
      pin: stage,
      scrub: 0.65,
      invalidateOnRefresh: true,
    },
  });
  timeline.fromTo(hand, { yPercent: 110 }, { yPercent: 0, duration: 0.26, ease: 'none' }, 0)
    .fromTo(icon, { yPercent: -150, scale: 0.72 }, { yPercent: 0, scale: 1, duration: 0.29, ease: 'none' }, 0.14)
    .to([icon, frame], { /* settle into final composite */ duration: 0.16 }, 0.43)
    .to(composite, { /* transform or CSS variable interpolation for full-bleed */ duration: 0.28 }, 0.59)
    .fromTo(footerContent, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.20 }, 0.80);
  return () => { timeline.kill(); };
});
```
These normalized segments are **guidance**; Codex must determine a maintainable construction and verify visuals before shipping. A single opaque screenshot cannot yield all four true interactive layers.

## Acceptance checklist
- [ ] Desktop forward timeline visually matches the storyboard, without a visible seam between card expansion and footer background.
- [ ] Reverse scroll reproduces earlier states without resets/flicker.
- [ ] Hand truly enters from below and logo/emblem enters from above, not both appearing as one flattened poster.
- [ ] Final full-bleed background preserves readable live HTML footer content.
- [ ] Single source of state, no duplicate ScrollTriggers, no scroll lock, no large blank gaps.
- [ ] Mobile works without jank; reduced-motion users get static final footer.
- [ ] Missing video/assets produce an intentional poster fallback.
- [ ] Asset origin and corrected DrawnOut 3D emblem approved before final production.



---

# Asset pipeline, video placeholders & portfolio publishing policy

## 1. Source materials and rights
The supplied portfolio archive is 46 PNG images / 15 folders. They are evidence of design presentations, not publication approval or proof of specific client deliverables. **Before publishing** each project, require actual commissioning/concept status, proper names, attribution, DrawnOut role, permitted imagery, permission to show, and any documented outcomes.

## 2. Temporary assets included
Seven optimized WebP renders in `assets/portfolio-placeholders/`: `bunzo.webp`, `sol-community-center.webp`, `triarch.webp`, `churros.webp`, `feed-n-seed.webp`, `by-tech-group.webp`, `abacus-immigration.webp`.
Source: the original uploaded DrawnOut portfolio PNGs; these are resized/encoded development derivatives. Do not assert any metric in flattened compositions as an actual brand performance result.

## 3. Video placeholder strategy (explicit user instruction)
DrawnOut will deliver actual videos later. Until then the site should include real, deliberately designed media containers using the **provided portfolio imagery**. They must preserve aspect ratio, show a high-quality poster, and avoid broken players or arbitrary stock footage. No generic off-brand stock videos.

Component concept: `MediaSlot.astro` with props:
```
type MediaSlotProps = {
  id: string;
  poster: ImageMetadata | string;
  video?: { webm?: string; mp4?: string; captions?: string };
  mediaKind: 'hero-showreel'|'case-media'|'footer-final';
  aspectRatio: '16/9'|'4/3'|'1/1'|'9/16';
  alt: string;
  availability: 'placeholder'|'approved';
  motion?: 'ambient'|'scroll-driven'|'none';
};
```
**Placeholder behavior:** show optimized `<picture>` or Astro `<Image>` as background with subtle slow 1.02→1.05 zoom (desktop only, user permits motion), a restrained corner tag `Visual preview` or no play icon. If a CTA leads to a video that does not exist, don't show it. Once real footage exists, replace media *source* while preserving layout, controls and fallback poster. Video default muted, playsInline, loop only for decorative ambient content, `preload=none|metadata` offscreen and `poster` always set. If meaningful speech/dialogue exists, captions/transcript required.

## 4. Initial placement map
- Home hero showreel placeholder: a wide framed area using `bunzo.webp` or a curated image cycle where changing backgrounds is not essential; do not place a massive autoplay board over the headline.
- Home featured sequence: Bunzo, SOL, Triarch, Churros, By Tech and Abacus, pending sign-offs. Feature only `published` projects.
- Services art moments: `sol-community-center.webp`, `feed-n-seed.webp`, `by-tech-group.webp` can stand in for future approved reels, labeled as visual prototypes.
- Work/project pages: optimize board thumbnails and request isolated artwork for real case-study galleries.
- Footer: separate `footer_final` media slot. Do **not** mistake Bunzo or an unrelated client board for the hand/logo final art. Use a bespoke brand placeholder and final approved assets when received.

## 5. Image engineering
- Local project stills live in `src/assets/projects/` for build-time optimization or reference imports. Keep original raws outside public build if unnecessary; optimize thumbnails into WebP/AVIF with adaptive sizes.
- Every `Image` has width, height, aspect ratio and alt. Use Astro optimized responsive images for content; CSS `object-fit`/`object-position` decisions per project.
- Protect logotypes in artwork: don't crop actual client marks in embarrassing ways, don't put opacity filters over copyrighted graphic board text, and always manually review mobile crops.
- Include all images in a clear manifest or content schema; filenames should be stable.
- Distinguish decorative abstract background (alt="") from informative case images (meaningful alt descriptions).

## 6. Content schema suggestion (implement using Astro collections current version)
```ts
// Model design; adapt exact `defineCollection`, glob loader and `image()`
// API to the installed Astro version.
export type ProjectRecord = {
  title: string;
  slug: string;
  summary: string;
  status: 'draft' | 'review' | 'published';
  visibility: 'public' | 'private';
  projectType: 'client' | 'concept' | 'internal' | 'unknown';
  publicationApproved: boolean;
  creditApproved: boolean;
  clientName?: string;
  year?: number;
  industry?: string;
  services: string[];
  featured: boolean;
  featuredOrder?: number;
  cover: string;
  gallery: Array<{src: string; alt: string; caption?: string}>;
  video?: {poster: string; mp4?: string; webm?: string};
  challenge?: string;
  concept?: string;
  approach?: string;
  deliverables?: string[];
  results?: Array<{label: string; value: string; evidenceSource: string}>;
  credits?: string[];
  seoTitle?: string;
  seoDescription?: string;
};
```
`canPublish(project)` must require `status === 'published' && visibility === 'public' && publicationApproved`; otherwise the project must not generate a public route or appear in sitemaps, feeds or related-work cards. This is a *publication gate*; it does not substitute for the team obtaining actual permissions. Do not use placeholder status as an excuse to ship unapproved work.

## 7. Example of safe new-project workflow using Codex
1. Add source files to the media staging directory.
2. Provide project title, short brief, role, categories, media order, permission status and description to Codex.
3. Codex creates a validated draft content entry, checks image links, alt text and warnings.
4. Preview locally or on a private preview deployment; studio reviewer verifies creative presentation and credits.
5. Only after manual approval, set `publicationApproved:true` and `status:published` then merge.
6. Automatic Work index, category filters, homepage selection and `/work/[slug]` page update from the same record.

## 8. Future CMS
The first release uses Codex/Git. A browser-side admin is **not** required. A future Decap-style Git editor can preserve file-based workflow, or a hosted structured CMS (e.g. Sanity) can be integrated. The typed schema and separation of content from layout are deliberate future migration seams.



---

# Codex development roadmap, approval gates and quality assurance

## Working method
Build in incremental reviewable phases, with actual preview screenshots and functioning interactions. Phase output is not complete when the assistant says it is: completion requires evidence from the local build and a human check of desktop/mobile visual fidelity. Every phase must preserve prior approvals.

### Phase 0 — Repository and asset foundation (first task)
**Tasks:** verify installed tools and actual accessible files; initialize Astro, TypeScript strict and Tailwind; set up clean layout/paths; copy only appropriately sized portfolio placeholders; implement the typed project schema; create sample draft records (no unapproved published case routes); favicon placeholder if approved. Git rules, ESLint/formatter, basic test/dev/build commands, README.
**Deliverable:** compiling site skeleton and proposed component breakdown; two 2D static layout alternatives for hero/work (design proof only). Ask user which concept to pursue.
**Gate:** all sources documented, `npm run build` observed pass, no public claims or new pages inadvertently published.

### Phase 1 — Design foundation and navigation
**Tasks:** implement tokens, typography candidates (proper licenses), accessible header/mobile menu, common layout, buttons, responsive grid, footer fallback, global SEO defaults and routes. Use provided logo with temporary light-contrast treatment only if reversible and clearly labeled; request actual light wordmark.
**Gate:** 360/390/768/1024/1440 responsive previews, keyboard navigation, no overflow, high-contrast header states.

### Phase 2 — Homepage storytelling (static first)
**Tasks:** hero markup, CSS gradient prototype, editorial intro, service pillars, portfolio previews, approach, CTA; apply all actual user-supplied copy without overfilling the homepage. MediaSlot poster components; prototype layout variants.
**Gate:** creative review comparing with attached screenshots, primary CTA visible, no generic stock imagery, all media posters reserve dimensions, performance budget assessed.

### Phase 3 — Work and case-study system
**Tasks:** Work index, filters, shared case pages, related cards, multiple media blocks, schema validation, project draft/publish gate. Use sample content only with explicit draft labels until permissions supplied.
**Gate:** no unapproved project becomes public; demo 'add a project with Codex' from draft to private preview and demonstrate reuse of template without code duplication.

### Phase 4 — Motion system
**Tasks:** intro type reveals, section reveal, portfolio card reveal/expansion, ambient gradient drift, graceful reduced-motion path. One motion package and documented variants. No full footer until motion foundation is stable.
**Gate:** keyboard navigation and browser back/forward remain functional, no content invisible when JS off, reduced motion works, smooth at target devices.

### Phase 5 — Signature footer motion proof
**Tasks:** first build deterministic prototype with individually moving hand placeholder, frame and emblem; implement responsive scroll-master timeline; composite expands to background; live contact CTA overlays final image. Use a static stand-in when final assets not available; do not misrepresent it as photorealistic finish. Provide timeline debug mode in development only.
**Gate:** user approves sequence with forward and backward scroll video; mobile variant works; no pin gap/flicker; no fake final artwork. Wait for approved final hand/emblem/frame assets before production-grade finishing.

### Phase 6 — Real media, copy and forms
**Tasks:** replace placeholders with approved videos/assets when supplied; incorporate verified case narratives and final agency assets; wire contact form to authorized destination; validation, anti-spam/privacy/analytics subject to approvals.
**Gate:** all content publication checklist items completed; caption handling where required; form tested without exposing credentials.

### Phase 7 — Launch hardening and deployment
**Tasks:** performance audit with throttling; SEO/social previews/sitemap/canonical; accessibility audit; multiple browser/device regression checks; fix breakpoints and typography; final design review; confirm custom domain/hosting. Only deploy publicly after explicit consent.
**Gate:** release checklist complete, staging and rollback plan, tracked outstanding issues, stakeholder approval.

## Verification matrix
| Feature | Desktop | Mobile | Reduced motion | Keyboard/screen reader | Network/API failure |
|---|---|---|---|---|---|
| Header/nav | active and sticky states | menu & escape | no adverse dependency | tab/focus/labels | works offline once loaded |
| Gradient hero | readable motion | safe type wrapping | static gradient | real H1+links | poster or CSS only |
| Work cards | hover/reveal | tap/scroll | visible images | focus card link | fallback image |
| Filters | correct tagged counts | scrollable controls | normal | buttons & pressed state | no JS fallback if feasible |
| MediaSlot | poster/video switch | poster-safe | no autoplay motion | button accessible if video | poster & text |
| Footer scroll | forward/backward sync | simplified sequence | static CTA/background | no focus trap; direct link | no blank footer |
| Forms | validation + success | manageable keyboard | unchanged | labels, summary errors | helpful retry/error |

## Quantitative baseline goals (real audits required)
- CWV at 75th percentile when available: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- WCAG 2.2 AA target (test focus visibility, contrast, semantics, form labels, `prefers-reduced-motion`, content order).
- All pages have meaningful HTML titles, meta descriptions, H1, landmarks, internal links; `robots`, sitemap when published.
- No horizontal overflow at 320/360/390/768/1024/1440 widths; handle 200% zoom.
- 0 broken public URLs / missing image paths; no unapproved/copyright-questionable project pages.
- Manual Safari iOS and Android Chrome scroll review for pinning and viewport units; desktop Chrome/Firefox/Safari as available. If exact browsers cannot be tested, record limitation.
- Measure bundle and page asset sizes; choose performance thresholds after representative poster/video samples exist, not through arbitrary guesses.

## Design visual-review instructions
Compare: opening 1.5 viewport heights, first project reveal, services transitions, and first/middle/final footer states at desktop and mobile. Keep consistent screenshots after each phase, with list of corrected issues. For footer specifically compare progress 0%, 25%, 45%, 60%, 80%, 100% and reverse from 100% to 0%; test after orientation change and reload near the footer.

## Release blockers (must not be bypassed)
- No actual approved light/dark master logo and emblem confirmation.
- No portfolio permission/client-concept labeling for stories that will publish.
- No confirmed contact form destination/privacy handling.
- No real usable final 3D hand/logo resources if requirement is photorealistic branded footer; visually representative prototype alone is not production-ready.
- Serious accessibility/performance issues or broken navigation.

## If a requirement fails
Gracefully reduce visual complexity rather than breaking the user experience. A beautiful static footer with an excellent contact CTA is preferable to glitchy pinning. Report issues and explicit trade-offs for user approval rather than silently dropping the requested effect.



---

# Decision register — DrawnOut Digital, 21 October 2026

| Topic | Decision / working direction | Status | Owner/confirmation |
|---|---|---|---|
| Market | Pakistan + international, neutral English | User selected | User |
| Agency positioning | Full-service digital agency, creative-led delivery | User working position, refined via copy | DrawnOut approval |
| Brand headline | `We make ideas impossible to ignore.` | Client-supplied draft | DrawnOut final approval |
| Brand identity | Provided orange/dark logo; 3D icon in footer reference differs | Conflict/open | DrawnOut identity team |
| Visual references | KOTA gradient + motion; Brandlic spreading/cards; Ramotion navigation | User specified | Implementation team interprets originally |
| Footer | Hand emerges from bottom, emblem from top, meets in frame, frame expands into footer BG | User specifically requested | Mockup review, media approval |
| Video | To be provided later; portfolio stills in meantime | User specified | DrawnOut media deliverables |
| Services | Five client-supplied pillars | Draft | Verify service capabilities |
| Sitemap | Home, Work, case, Services, About, Contact | Recommended | User approval |
| Implementation tool | Codex | User specified | User |
| Main framework | Astro + TypeScript + Tailwind | Recommended | Development feasibility review |
| Motion framework | GSAP ScrollTrigger selectively | Recommended | Development feasibility review |
| Project updates | Codex edits Git-backed structured collections | User working plan | User |
| Custom admin panel | No v1 custom admin; possible CMS later | Recommended | User |
| Content legitimacy | Hold projects until permission and status confirmed | Required | DrawnOut |
| Model | GPT-6 Astra High for complex motion/architecture; GPT-6.1 Sol High for daily implementation | Recommended if accessible | Actual Codex model picker |
| Hosting/domain | TBD | Open | User |
| Contact endpoint | TBD | Open | DrawnOut |
| Approved live footage | TBD | Open | DrawnOut |



---

# Minimum deliverables to request from DrawnOut Digital
**Needed before full production, not to start static/placeholder prototyping**

## Brand
- Official display name and canonical capitalization: `DrawnOut` vs `DrawnOUT`.
- Approved icon-only SVG and full wordmark SVG, including dark-background and light-background variants and monochrome versions.
- Primary and secondary palette values, font families and usage rights.
- Confirm if the hand-held-frame emblem in the reference is an approved version of the actual logo, or a purely conceptual interpretation.

## Footer motion (highest visual risk)
- A **landscape master artwork** plus mobile portrait art in high resolution; ideally separate hand with alpha, glass frame/transparent layer, approved emblem layer, glow/background layer; or approved animation project/renders (3D files/alpha video or 48–96 compressed frames) with camera/lens continuity.
- Clean images without platform badge, typography overlay or watermarks.
- Explicit client approval for the compositional effect and aspect ratios. The 357x489 social screenshot alone is insufficient.

## Videos
- Hero/brand showreel, case videos and any reels intended for services/about: source 1080p or higher if available, aspect ratio, crop guidance, final timestamps or loop segment, silent/muted expectation, legally cleared music if used, poster frame, captions if speech, and whether autoplay is permitted.
- For scroll-controlled video, supply master/frames and discuss whether frame-by-frame image sequence is preferable to seeking compressed media.

## Portfolio and copy
- Per selected project: commissioning status, year, client authorized name, scope/role, required credit, brief and creative rationale, positive outcomes with substantiation if published, permission to show art, 4–10 isolated exports instead of only combined presentation sheets.
- Verify which service offerings are currently sold and supported, particularly website development, advertising management, copywriting/video concepts.
- Final About/team information, contact email, social handles, location wording and website/domain details.

