# About refinements and Services hero — review handoff

This milestone builds on the owner-reviewed About commit `b9fc396cc002c07af0ad60a3b99e932022dcd0b7`. The branch is `feature/services-cinematic-hero`; [draft PR #12](https://github.com/tenthtech/drawnout-digital/pull/12) is stacked on `feature/about-brand-story-experience` because PR #10 was still open when work began. Neither PR is authorized for automatic merge or deployment.

[Review gallery and recordings](../../artifacts/services-hero/README.md) · [Observed validation and measured timings](VALIDATION.md) · [Asset provenance](ASSET_PROVENANCE.md) · [Authoritative brief](IMPLEMENTATION_BRIEF.md)

## About arrival and scroll correction

The hero now uses the existing philosophy chapter's charcoal, warm off-white and orange palette. The approved founder sketch, authentic emblem and paper circle form one composition. It begins centered, holds briefly, then moves into the right-hand desktop slot while the editorial copy appears. Mobile keeps the prominent stacked portrait and delays the copy until the moving composition clears the headline. All seven chapters and supplied founder facts remain intact.

An About-only inline bootstrap establishes the centered pose before paint. Its independent 550ms startup deadline restores the complete static hero if the animation module is missing or late. Input, focus, resize, visibility and motion preferences can release it immediately; late initialization cannot hide the content again. The module hands off the initial pose within one JavaScript turn and retains an absolute arrival deadline. This is a nonblocking page entrance, with no overlay, scroll lock or second global loader.

The approach section uses direct ScrollTrigger scrubbing. Fractional SVG dash values are preserved rather than rounded, so the actual line geometry follows scroll progress and reverses without a delayed catch-up. Origin/process drawing remains native, unpinned and responsive. Reduced motion, Save Data and absent JavaScript retain readable static content.

The portrait is the unchanged owner-approved raster illustration. The emblem is framed from the original supplied 1920px artwork, not an enlarged navigation thumbnail or a newly traced vector logo. The personal photograph remains private. See the asset provenance for the exact crop, display-size limits and source boundaries.

## Services Stage 1 architecture

Only the main `/services` hero is replaced. `ServicesHero.astro` owns the editorial introduction, art stage, captions and persistent service links. Five separate SVG scene components depict identity construction, interface refinement, coordinated campaign outputs, typographic storytelling and art direction. Titles and propositions come from the existing canonical `serviceIndex`.

The controller boundary is `src/scripts/services-hero.ts`, with timing and independent pause decisions in `src/lib/services-hero-policy.ts`. The configured active-animation cycle is **14 seconds**: an opening emblem sweep, five approximately 2.1-second service intervals, then the large DrawnOut wordmark and return to the starting position. These are design targets; actual observed timing belongs in the validation report.

The controller animates the custom parts of each scene, not merely crossfade identical cards. Its controls support manual scene previews and an explicit pause choice. Focus, offscreen visibility, a hidden document, reduced motion and Save Data are independent pause reasons, so one state change must not cancel another. Automatic service changes pause while an interactive hero control is focused. Navigation and native scrolling remain available throughout.

Controls are progressively revealed after successful initialization. The static/no-JavaScript page retains all five direct service links; reduced-motion and Save Data visitors receive a static presentation with manual previews when scripting is available. The hero does not require watching a complete cycle, pin the page or move the visitor's scroll position.

## Preserved content and later stages

The existing overview continuation remains below the hero with its original five service titles, propositions and links. Its CSS is scoped to `.service-foundation` so it cannot accidentally impose the old overview grid on the new hero. All five individual service templates, approved copy and FAQs remain unchanged. Homepage loader/gradient behavior, portfolio rhythm and publication rules, Contact, responsive navigation and the signature footer are preserved.

The following are deliberately outside Stage 1:

- Rebuilding the five Services overview chapters.
- Redesigning all five individual service pages.
- Building the full “puzzle / bring us the pieces” Contact animation.

Those stages follow review of this hero. The existing hand/plaque footer remains its documented 2D prototype, and Contact still requires the owner's Formspree configuration and real email-delivery verification. This milestone does not claim either dependency complete. No separate Netlify repository push or public deployment is part of delivery.
