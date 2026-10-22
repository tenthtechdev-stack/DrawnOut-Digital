# Phase 4 — Afterglow cinematic motion

Phase 4 extends the approved Phase 3 merge `8ae8de991b6768564b92b61ed4078d3e84a9a731` on `phase4/cinematic-motion`. Existing homepage, Work, case-study, navigation and typography layouts remain the foundation. Original copy, typed portfolio records, image geometry and publication gates remain intact.

## Motion ownership

`MotionEnhancement.astro` loads the shared browser runtime on the current site routes, excluding the archived concept pages. `src/scripts/motion.ts` owns initialization, teardown, responsive timelines, text entry, image expansion, preference changes and layout refresh. `src/lib/motion-policy.ts` centralizes timing and amplitude values.

GSAP **3.15.0** and its ScrollTrigger plugin are the single new dependency, pinned in the lockfile. They are dynamically loaded only when the user permits motion; no smooth-scroll library or client framework is added. Native scrolling and ordinary link/history behavior remain in control.

The static HTML is visible by default. A tiny homepage-only inline head preflight gives the entrance a 900ms ticket and applies matching hero start styles before the first paint. It skips reduced motion, data saving, restored history, hash destinations and hidden pages. The runtime consumes a still-valid ticket only while that CSS gate is in force, synchronously applies matching start styles with `gsap.set(..., lazy: false)` before scheduling `gsap.to`, then releases the gate in the same task. This avoids delayed `fromTo` start-state rendering that can otherwise flash already painted phrases. Slow or failed imports restore static hero content by the watchdog deadline and cannot trigger a late entrance. Early hero keyboard focus cancels the ticket immediately. Other text animates only after the runtime and libraries are available, with a safety restoration timer and scoped rollback. Reduced motion, data saving, missing observer support or failed enhancement leave readable static content. Assistive technology receives the original text stream, without duplicated character markup.

## Hero and editorial pacing

The original orange and lavender gradient fields now occupy separate composited pseudo-elements. Transform-only alternate cycles last 24 and 20 seconds, paused offscreen and while the page is hidden. No animated blur/filter or background-position painting is used. Reduced motion and data saving disable the drift.

The three existing headline phrases enter with a masked 0.82-second `power3.out` reveal and 0.12-second stagger. Supporting elements use 0.6-second entrances with small delays. Late enhancement/history restoration can skip the entrance instead of replaying over a reader. Hero exit uses a restrained, reversible translation capped at 28px and fades only to 0.72.

Editorial headings use 0.78 seconds; selected creative statements use 0.94 seconds; supporting content uses 0.6 seconds. IntersectionObserver introduces those treatments once when their content enters view. The system does not animate every paragraph. Selected `data-motion-text` and `data-motion-support` hooks express hierarchy without changing layout.

## Portfolio expansion

Homepage, Work and suitable case-gallery wrappers use the same reversible ScrollTrigger treatment. It animates the media clip and inner image transform, keeping card/caption dimensions and document flow fixed. There are no pinned sections or horizontal scroll traps. Related-project navigation and the footer are excluded from the expansion scene selection.

Large desktop imagery starts with a 9% side inset and 84px corner treatment; other imagery uses 5.5% and 58px. Mobile reduces these to 4% and 28px. Image scale settles from 1.045 on desktop or 1.018 on mobile to the approved full image. Scrub smoothing is 0.48 or 0.32 seconds, with linear progress mapping and a smaller mobile travel range.

Cold mobile loading also exposed an inherited shrink-to-fit issue in the Triarch wrapper. An explicit 85% width reserves its existing final composition before the lazy image loads, preventing a 125px page-height jump without changing its loaded layout.

Scrolling backward restores the earlier clip/scale state. Hover/focus remains available independently; focusing a linked media scene opens its artwork fully so an action is never obscured. Button arrows have a restrained 220ms directional cue with equivalent keyboard focus treatment and a static reduced-motion alternative.

## Lifecycle and fallback

GSAP context and responsive match-media ownership keep triggers scoped. Astro page lifecycle, browser pagehide/pageshow, preference changes and hot replacement invoke cleanup. Timers, observers, event listeners and styles are restored through the same teardown path. Development-only motion diagnostics expose counts/progress for tests and evidence; they do not contain project metadata.

Images, fonts, viewport changes and Work filter reflow request debounced refreshes. Work filtering publishes `portfolio:filterchange`; it remains independently usable without the motion layer. CSS hover transforms and the scroll system operate on separate media layers.

Run standalone checks/builds before starting the private development server, as documented since Phase 3. Restart development after a content-mode change so Astro's publication-aware image map matches the current mode. Do not relax publication flags to obtain a motion preview.

## Review boundary

The [motion gallery](../artifacts/phase-4/README.md) contains actual desktop/mobile recordings, GIF excerpts and scroll-state captures. [Validation](PHASE_4_VALIDATION.md) records observed results, performance evidence and limits.

The signature hand/logo footer sequence remains **Phase 5**. The static footer and its artwork boundaries are preserved. Video-placeholder design, video placement, actual footage and final media deliverables remain a separate planning task. There is no stock footage, fabricated video, public deployment, automatic merge or change to project publication rules.

**Stop after Phase 4 for review. Do not begin Phase 5.**
