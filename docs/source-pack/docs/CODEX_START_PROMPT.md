# Copy/paste starting prompt for Codex

> You are the lead design engineer and frontend technical director for **DrawnOut Digital**. Read `AGENTS.md`, `README.md`, and every primary document under `docs/`, especially `MASTER_SPEC.md`, `MOTION_AND_FOOTER.md`, `SITEMAP_AND_CONTENT.md`, `DESIGN_SYSTEM.md`, `ASSET_AND_PORTFOLIO_POLICY.md`, and `PHASES_AND_QA.md`.
>
> The task is a custom portfolio-led full-service digital agency website with the supplied DrawnOut identity and copy. Inspirations are KOTA's atmospheric hero gradient and scrolling reveals, Brandlic's editorial project cards and expanding imagery, and Ramotion's site clarity. Build an original identity and implementation, not a replica.
>
> The signature footer is essential: during a reversible scroll, a hand comes upward from below while the approved logo descends from above; they meet in an illuminated transparent frame; continued scroll expands the composed artwork to become the background of the footer, with an accessible live HTML CTA. The existing reference screenshot **is not a layered original**. Prototype carefully without presenting the screenshot as production-ready. Respect reduced motion and mobile fallback.
>
> The videos will arrive later. For now build reusable `MediaSlot` placeholders with optimized genuine DrawnOut portfolio stills in `assets/portfolio-placeholders/`. Do not invent project facts, metrics, permissions, images or videos. The final media must be replaceable by content changes.
>
> **Start only with Phase 0** in `docs/PHASES_AND_QA.md`. First inspect the repository and available images, report what assets exist and what is missing, suggest the exact component/content model, and identify approval blockers. Then initialize the stack if the repo is empty and the phase is authorized. Do not rush directly to a complete website. Produce the first responsive visual foundation, run applicable builds/checks and report observed results. Present two intentionally different homepage layout sketches or screenshots for review before Phase 1.
>
> Follow Codex's normal approval/sandbox policies; do not deploy publicly or modify remote services without permission. Use **Astro, TypeScript, Tailwind CSS and selective GSAP ScrollTrigger** unless the user approves a change. Avoid global React hydration or scroll hijacking. The site must be SEO-friendly, accessible, responsive, performant and maintainable through Codex/Git content additions.
>
> End each phase with: files changed, tests run and their real output summary, desktop/mobile visual evidence if available, unresolved assumptions, design recommendations and explicit approval needed for the next phase.

## Phase-specific follow-up prompts
**Phase 1:** "Implement the approved design tokens, navigation and layout from Phase 0. Preserve the same source copy. Show screenshots at 390, 768 and 1440 widths. Stop for design review."

**Phase 2:** "Implement the homepage static layout and CSS atmospheric gradient, with genuine portfolio WebP placeholders for all deferred videos. Preserve readability, CTAs and semantic headings. Do not add GSAP motion yet except absolutely necessary."

**Phase 3:** "Implement the typed published/draft project collection, Work index, filters and reusable project pages. Ensure unapproved projects are never exposed publicly. Demonstrate adding a new project via Codex only."

**Phase 4:** "Implement the approved text reveal/card expansion motion grammar with accessibility and cleanup. Show reduced-motion behavior and test responsive fallback."

**Phase 5:** "Build the hand-up/logo-down/merge/spread scroll-footer timeline described in `MOTION_AND_FOOTER.md`, as an explicitly labeled prototype with the available reference assets. Provide desktop/mobile screen captures at six progress states and a recording of forward/backward scrolling. Do not claim the single screenshot provides real 3D animation layers."

**Phase 6+:** "Replace approved content and media only after confirmations, preserve the working motion/UX; complete tests and deployment review gates."
