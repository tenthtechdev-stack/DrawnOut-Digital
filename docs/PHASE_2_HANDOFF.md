# Phase 2 — Afterglow homepage storytelling

The user approved Afterglow for desktop and mobile and authorized Phase 2 development on a dedicated branch, with a GitHub review gallery and pull request. The branch `phase2/afterglow-storytelling` starts at latest-main asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`; the existing Astro implementation and Git history are retained.

## Experience and editorial decisions

The homepage sequence is: approved hero → compact capability index → selected creative work → studio philosophy → five integrated service propositions → strategic approach → four-step process → ideal-client positioning → the existing final enquiry invitation/static footer.

The original DrawnOut copy is condensed by placement, not replaced with invented claims. Homepage sections have one clear purpose; the complete manifesto and service lists are not repeated. Hero typography, Manrope, responsive navigation, orange-led atmospheric gradients, and the Phase 1 static footer remain the foundation. There are no fabricated client outcomes, testimonials, metrics, offices, team details, or case narratives.

The selected portfolio is Bunzo, SOL Community Center, Triarch, Churros Dessert Shop, and By Tech Group. Large packaging details, an asymmetrical applications/portrait pairing, a quiet typographic pause, a wide retail strip, and an offset technology board vary the rhythm. Desktop panoramic details switch to full-context mobile boards so the imagery remains useful at small widths. Captions describe visible supplied artwork; they do not establish client scope or permission.

## Asset and publishing integrity

All 46 PNGs in 15 original folders were inspected and remain byte-for-byte identical to the asset commit. Eleven optimized WebPs total 1,480,526 bytes before responsive variants. The [asset audit](PHASE_2_ASSET_AUDIT.md) documents every folder, source image, crop, dimension, encoding choice, and reserve/exclusion decision.

Project data remains canonical in typed JSON collections. All seven entries are draft/private, have unknown commissioning status, and retain false publication/credit approval flags. `EditorialWork.astro` is reachable only through a development-only import. No original or derivative artwork, draft project metadata, or case routes are emitted by the production build. Originals stay outside `public/`. The authorized GitHub review gallery is separate from a publicly deployed application preview.

## Reusable implementation

- `StudioStatement`, `ServicesOverview`, `ApproachStatement`, `ProcessSteps`, and `ClientFit` compose the homepage from short original-copy sections.
- `EditorialWork` and the reusable `ProjectCard` implement the development-only five-project spread; the Work route retains its existing compact foundation.
- `MediaSlot` reserves image geometry, creates responsive WebP candidates without upscaling, supports native picture art direction, and accepts optional approved video/caption sources for later replacement. Current placeholders show no video controls or implied footage.
- Hero line groups, atmospheric layers, portfolio `data-expansion-frame` wrappers, and footer artwork/content boundaries remain separate for later scoped motion. No GSAP, pinning, scroll interception, or cinematic footer timeline is introduced.
- Existing navigation, skip links, native vertical scroll, and reduced-motion/no-JavaScript visibility are preserved.

## Windows and Linux scripts

`cross-env@10.1.0` is added as the maintained cross-platform environment runner. `npm run dev`, `build`, `check`, and `preview` retain their existing Astro flags and set `ASTRO_TELEMETRY_DISABLED` without Unix-only assignment syntax. The dependency supports Node 20+ and is compatible with the project's minimum Node 22.22.

Linux environment propagation, child exit-code preservation, and all four CLI entry points were exercised. Windows/PowerShell is not installed in this cloud machine, so native Windows execution is not represented as a completed test.

## Review and next steps

See [Phase 2 validation](PHASE_2_VALIDATION.md) and [the screenshot gallery](../artifacts/phase-2/README.md). Original Phase 0/1 screenshots remain preserved; fresh test captures are isolated in temporary output directories.

The branch and all 28 gallery PNGs were pushed and retrieved successfully through a fresh GitHub clone. The earlier GitHub API network blocker is resolved after the authorized `api.github.com` configuration change. [Draft pull request #1](https://github.com/tenthtech/drawnout-digital/pull/1) is open against `main` from the correct Phase 2 branch, with the gallery, asset audit, handoff, and validation linked in its description. No merge or deployment occurred; existing Git history is preserved and remote `main` remains unchanged.

Remaining DrawnOut inputs: actual videos and meaningful-video captions; final clean hand/frame/emblem/landscape/mobile artwork; approved brand masters; project provenance, credits and publication permission; verified contact/social/domain/form/privacy details. These do not prevent Phase 2 static review.

**Stop after Phase 2. Do not merge, publicly deploy, or begin Phase 3 without explicit approval.**
