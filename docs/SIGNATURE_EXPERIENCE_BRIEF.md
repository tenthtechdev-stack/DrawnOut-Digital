# DRAWNOUT DIGITAL — CONSOLIDATED CODEX DEVELOPMENT BRIEF

## The DrawnOut Loop: opening animation, living gradient, project publication, cinematic scroll and signature footer

**This replaces the prior, unsent Phase 5 / motion-refinement instructions. Do not treat earlier drafts as additional competing tasks.**

**Repository:** `tenthtech/drawnout-digital`
**Starting branch:** Latest `main` (approved and merged through Phase 4)
**Working branch:** Create `feature/drawnout-signature-experience` from up-to-date `main` after the brand assets commit has arrived.
**Preferred model:** GPT-6 Astra at Extra High reasoning if available in Codex; otherwise the strongest available Codex model with High/Extra High reasoning.
**Status:** User approves the existing supplied DrawnOut portfolio artwork for public visual display. Real clients, commissions, team credits, deliverables and results must not be invented or marked verified.

## A. Before writing code

1. Fetch latest `main`; confirm `design-assets/brand-originals/` contains `hand-and-icon-supplied.svg`, `logo-as-supplied.svg`, and `README.md`. If absent, stop the asset-dependent animation steps and report the missing files. Do not fabricate substitutes.
2. Inspect the two actual SVGs. They are **identical**, approximately 1.1 MB each, and contain a raster image embedded in an SVG wrapper, not separate editable hand/logo geometry. Preserve source bytes and document the limitation. The existing site brand may use a different raster logo. Don't confuse that with verified vector geometry.
3. Use the user's original opening storyboard sketch as the main choreography reference, together with this verbal brief. If the sketch is not attached to the Codex task or committed in `design-assets/animation-references/`, ask for that image or use the exact description below while clearly noting that the image wasn't accessible.
4. Review `AGENTS.md`, master/source-pack instructions, Astro/TypeScript/Tailwind configuration, the existing GSAP/ScrollTrigger motion runtime, content schema, publication loader, `MediaSlot`, `SiteHeader`, `ProjectCard`, Work routes and `SiteFooter`. Work incrementally; preserve successful Phase 0–4 behavior.
5. Audit the available cloud environment for Blender, 3D rendering, GPU/WebGL/headless tools and practical model/rigging options before deciding asset-delivery format. Never claim photorealistic 3D is finished merely because code builds.

## B. Creative North Star: ONE visual story, beginning and ending

**The DrawnOut Loop** is an original, coherent agency signature, not a generic loading spinner. Its introduction shows project squares moving with a flowing wave; the connecting line reveals the DrawnOut name and resolves into an orange logo frame with a realistic hand holding the logo. The same master signature hand/logo composition returns at the end of the website, where scroll controls the hand/mark meeting and the completed frame expanding into the footer background. Opening and footer share the same hand model, emblem, materials, lighting and final hero pose. Preserve DrawnOut's orange/charcoal/cream identity and Afterglow typography. KOTA's fluid gradients, Brandlic's playful image expansion and text choreography, and Ramotion's clarity are references, not templates to copy.

## C. Opening: five scenes, 5-second hard maximum

The opening is a short, automatic introduction on the **first homepage visit in a browsing session**, not an ongoing scroll-controlled gate. It must fully disappear **within 5.0 seconds of start**, including its transition into the normal Afterglow homepage; aim for 4.0–4.6 seconds total. No separate spinner or loader after the sequence. Do not wait for network, video, 3D or GPU assets to finish loading before showing the homepage.

1. **Projects appear:** Black outlined square frames enter at staggered locations along a rolling/wavy path, like the supplied drawing. The squares may selectively reveal real approved portfolio artwork. Motion feels playful, varied and choreographed, not a uniform grid fade.
2. **Connecting wave:** One organic hand-drawn line traverses and visually connects the square frames. Squares respond with short, soft motion as the line reaches them. Use an actual SVG path/stroke reveal or comparable clean implementation, avoiding rasterized text/line shortcuts.
3. **DrawnOut reveal:** DrawnOut lettering reveals or appears to be written as the wave advances. Synchronize it to the wave's travel; do not just fade a full wordmark in independently. The moving line leads toward the orange logo/frame geometry.
4. **Hand and emblem:** A physically believable hand moves up from below, and the accurate DrawnOut emblem moves down and seats into a glowing glass/acrylic square frame. Accurate perspective, finger grip, occlusion, believable transparent reflections and restrained orange lighting. Use the supplied composite as the approved _reference/final pose_, not an editable hand layer.
5. **Automatic transition:** Without any interaction, the composition yields seamlessly to the existing Afterglow homepage, whose hero heading and living gradient continue naturally. Scrolling, clicking a visible skip control, tapping to enter, pressing Enter/Space/Escape or interacting with normal navigation immediately bypasses the intro, without making a user repeat input. Never wait for the user to scroll. The intro must never replay on internal navigation, and direct visits to case-study routes skip it.

Technical behavior: normal semantic homepage remains present and readable if scripting fails. Reduced motion and data saving show the homepage immediately. Prevent inaccessible focus traps, artificial scroll locking, layout flashes and duplicated heading animations. Provide a clear accessible `Skip intro` control. Use a session-level display rule and ensure no overlay intercepts pointer/keyboard actions after exit. Asset errors/timeouts fail open. Make it responsive at 320/390/768/1440/1920px. No audio.

## D. Living Afterglow hero gradient — a genuine visual upgrade

Phase 4 gradient layers move subtly but the user wants the **visibly flowing, organic KOTA-like atmosphere**, adapted to DrawnOut. Implement evolving blended colour forms, autonomous fluid motion and a restrained pointer-reactive response on desktop, with independent ambient movement on mobile. Use rich orange, amber, warm coral and subtle compatible hues; retain headline/CTA contrast and the approved Afterglow composition. Assess a lightweight WebGL shader or comparable GPU-accelerated solution; don't ship an expensive shader just for novelty. Keep a tasteful CSS/static fallback if WebGL is unavailable, reduced motion or data saving is active. Stop/pause rendering when hero is offscreen or tab hidden; avoid excessive continuous repaints; cap device-pixel ratio as appropriate; verify rendering on modest devices. The gradient continues to move **after** the intro automatically ends; coordinate hero text reveal to avoid double play and flashing.

## E. Cinematic scroll type + portfolio choreography

The user considers Phase 4 technically functional but not as playful or accurately timed as their KOTA/Brandlic references. Make intentional, visibly stronger improvements, **not blanket animation everywhere**.

- Use GSAP ScrollTrigger and, where beneficial, SplitText with masked lines/words, responsive re-splitting (`autoSplit`/`onSplit`) and cleanup. Choose scroll-scrubbed/reversible timing for selected large manifesto headlines, and elegant viewport-triggered one-time reveals for short supporting text. The section must react at the right time to actual scrolling, not on arbitrary seconds-long delays.
- Enhance a small number of hero-to-content and portfolio transitions: wavy/offset entry, responsive editorial text, selective scale/clip/mask changes, and one major truly immersive near-full-bleed image expansion with reverse scrolling. Preserve native document scroll and captions, card links, focus handling, aspect ratios and stable geometry.
- Do not add global smooth scrolling, horizontal traps or excessive pinning. Preserve no-JavaScript text visibility, accessibility and reduced-motion alternatives. Use separate motion layers so hover/focus interactions do not conflict with ScrollTrigger transforms. Reinitialize/clean up on navigation, filter changes, resize/font loads and preference changes.

## F. Approved portfolio must work in production

The user explicitly confirms the supplied portfolio artwork and project names are **approved for display**. Do not leave all eleven structured projects invisible on the public Work index, and do not keep sending visitors to `/_preview/work/...` or a page with no project content.

- Update the project publishing policy to distinguish **approved visual publication** from **unverified facts/credits**. The user's approval permits exposing the provided artwork and truthful observational titles, categories and artwork captions, but **not** inventing client status, commissioned services, identity of designers, dates, case challenges, results or client endorsements. Keep these factual sections hidden until independent validation.
- Reconcile any current `projectType: "unknown"` and `creditApproved: false` gates without falsely setting them to known/true. Design a defensible explicit display-approval state and migrate approved supplied entries with provenance note; still support future drafts, permission withdrawal and production gate tests. Do not treat a boolean as proof of legal status.
- Homepage portfolio cards currently lack anchors: make the entire appropriate card accessible and click through to `/work/<slug>`. Work index cards must use the same public routes. Preserve keyboard navigation, link names and motion/focus behavior.
- For each approved structured project, build accessible real case-study routes with correct images and previous/next navigation; show only evidenced visual descriptions and omit unknown factual narrative. Remove `Private draft`, `Pending studio review`, `Visual preview`, and other development-only labels from the approved public presentation. No fake metrics.
- Keep `/_preview` for future unapproved content; do not leak future drafts in route output, imported image maps, feeds or build artifacts. Test publication and withdrawal with synthetic cases and inspect production output.
- There are currently 11 structured records and 15 source folders (including own-brand and misc); do not invent projects merely to equal folder count. Audit omitted folders without automatically treating miscellaneous/internal material as client work.

## G. Same high-fidelity hand/logo object at the end (footer)

Build a **shared master signature asset** usable in both intro and footer, as described in B. The real supplied composite is portrait-oriented; design responsive camera/cropping consciously for wide desktop and mobile rather than stretching it to fill a landscape surface.

Intended scroll-scrubbed closing sequence: hand rises from below; the separate emblem comes down from above; emblem/glass frame aligns within the fingers; completed pose holds briefly; then the finished artwork expands into the full-bleed backdrop of the footer. Contact heading, CTA and footer links become legible above with robust gradient/scrim treatment. Reverse scroll reconstructs the earlier state. `prefers-reduced-motion` should present a composed static footer with working links.

**Photorealism is a production quality requirement.** Prefer a reproducible Blender scene with licensed/approved realistic hand geometry and an actually rigged/grasping pose; meaningful skin texture, anatomy, intersections, glass thickness/refraction, emission, specular reflections, lighting and accurate emblem shape. Create a source scene and inspect reference renders. Explore optimized pre-rendered frame sequences for consistent scrub fidelity and performant deployment, or lightweight WebGL if it tests better. Source assets, rights/licensing, and render settings must be documented. Do not use unrelated stock imagery or a CSS silhouette as a purported final. If independently moving layers or adequate quality cannot be achieved from the composite, implement and label a compelling interim proof, specify the exact needed hand, vector/emblem, frame and shadow layers, and do not claim the production-quality 3D requirement is satisfied.

## H. Correct the mobile header shift

Fix the previously measured ~53px mobile header/fallback-navigation startup shift. Reserve stable geometry before hydration/enhancement. Check JavaScript enabled/disabled, 320/390 widths, reload, internal navigation, reduced motion and fonts. Report real measured layout shift; do not mask it or count animation shifts as passing Core Web Vitals.

## I. Preserve media-planning boundary

The separate agency showreel, final video placeholders and content-production planning are explicitly deferred. Do not add arbitrary video blocks to satisfy that different task. A rendered hand/logo intro or frame sequence is a **signature motion asset**, not authorization to invent agency showreel footage.

## J. Engineering constraints and acceptance tests

- Keep Astro, TypeScript, Tailwind and the existing GSAP architecture. Protect approved Phase 0–4 layouts unless a change is essential to this brief.
- Maintain semantic structure, real links/CTAs, proper focus management and visible content without JS. Reduced-motion first paint must never display a half-animated scene.
- Verify intro runs ≤5 seconds from navigation start including transition; early-scroll/skip; returning session, hash/deep-link, no-JS, GPU failure, delayed imports and preference toggles.
- Verify live fluid gradient continues after intro, responds to pointer, pauses when hidden/offscreen, and has static fallback.
- Verify major word/line reveals follow real scroll positions, reverse behavior works, image expansions don't jump geometry, no overflow 320–1920px.
- Verify all existing approved projects are accessible from homepage and Work at real URLs and not `_preview` URLs. Ensure unverified factual fields remain hidden and future unapproved drafts cannot leak in production.
- Verify footer assembly, image expansion, reverse scrub, CTA interactivity and mobile cropping; visually judge realistic hand quality separately from test results.
- Run Astro/TypeScript checks, ESLint, formatting, unit tests, Playwright, production build, publication/withdrawal tests, and record actual counts. Add lightweight CI checks if appropriate, but do not claim hosted checks ran unless they actually ran.
- Provide real desktop and mobile **screen recordings**, including an opening under five seconds, automatic reveal, gradient moving after intro, scrolling forward/backward, working case-study links, and the footer sequence. Include beginning/middle/final stills and asset-quality comparison with reference.
- Keep large renders/frame sequences out of Git when impractical; provide a reproducible asset pipeline, size budget and hosting plan instead of committing massive image/video output indiscriminately.

## K. GitHub handoff

1. Work on a dedicated branch from the newest main, after the artwork upload.
2. Push real code, documented artwork manifest/source files (within safe Git size), tests and screenshots.
3. Open a PR with working links to recordings, design gallery, production/local screenshots, validation, performance observations, remaining asset limitations and public project examples.
4. **Do not automatically merge or publicly deploy.** Stop at an accessible review-ready state.
5. Clearly distinguish **implemented and visually reviewed**, **implemented but not visually verified**, and **blocked on missing production assets**. No fabricated completion claims.

**Success definition:** A visitor sees the sketched black-square/wave/DrawnOut/hand intro, arrives automatically at Afterglow within five seconds, experiences a living orange fluid gradient and playful precisely timed editorial scrolling, can click approved projects to open their case studies, and meets the matching realistic hand-and-emblem scene in the footer. The site stays functional and readable on normal mobile devices, with reduced motion and no JavaScript.
