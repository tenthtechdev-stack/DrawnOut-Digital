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
