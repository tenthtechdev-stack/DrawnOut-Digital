# DrawnOut Digital — Codex Master Knowledge Pack
**Version:** 1.0  
**Prepared:** 21 October 2026  
**Status:** Approved research direction / implementation proposal, with explicitly identified brand, rights and media gates.

This is a **development handoff**, not a built website. It combines original DrawnOut copy, the supplied logo and screenshots, actual samples from the portfolio archive, the earlier strategy audit, and detailed UX, motion, implementation and QA instructions.

## Start here
**Single-file option:** `CODEX_MASTER_BRIEF.md` combines the full specification. For a real Codex repository, keep the split documents and `AGENTS.md` too.

1. Read `AGENTS.md` (Codex durable instructions).
2. Read `docs/MASTER_SPEC.md` (product and experience contract).
3. Read `docs/MOTION_AND_FOOTER.md` (scroll effects and precise footer storyboard).
4. Read `docs/DESIGN_SYSTEM.md`, `docs/SITEMAP_AND_CONTENT.md`, and `docs/ASSET_AND_PORTFOLIO_POLICY.md`.
5. Read `docs/PHASES_AND_QA.md` for approval gates and verified acceptance tests.
6. Use `docs/CODEX_START_PROMPT.md` to start an implementation session **one phase at a time**.
7. `docs/RESEARCH_SOURCES.md` lists the underlying websites and observable facts.

## Attached materials
- `assets/reference-only/`: four user-supplied visual references, plus three contact sheets summarizing the original portfolio. These are **inputs**, not production-ready assets or competitor resources to copy. In particular `footer-hand-logo-reference.png` is a low-resolution reference screenshot with a platform badge.
- `assets/portfolio-placeholders/`: seven WebP placeholders derived from the user's own portfolio PNG archive. Good enough for visual development and temporary media posters, **not clearance to publish the represented work**.
- `docs/portfolio-inventory.csv`: complete earlier 46-image / 15-folder inventory.
- `docs/PRIOR_RESEARCH_V04.md`: previous editorial, positioning and evidence analysis.

## Canonical product direction
- Public-facing description: **independent creative and digital studio**, representing a creative-led full-service digital agency.
- Target geography: Pakistan + international, expressed in market-neutral English.
- Homepage headline: **We make ideas impossible to ignore.** (user-supplied draft, approval pending)
- Capabilities strip: **Design. Strategy. Storytelling. Digital.**
- Five service pillars: Brand Identity & Design, Digital Design, Marketing & Campaigns, Words & Storytelling, Creative Direction.
- Core routes: `/`, `/work`, `/work/[slug]`, `/services`, `/about`, `/contact`.
- Recommended stack: Astro + TypeScript + Tailwind CSS + selective GSAP ScrollTrigger, Git-backed Astro Content Collections. The user plans to develop and update with Codex. No custom admin at launch.
- Main visual references: **KOTA** for fluid hero gradients and cinematic editorial motion; **Brandlic** for expansive/rounded portfolio treatments and sectional transitions; **Ramotion** for clear site architecture.
- Signature movement: footer 'hand rises + logo descends + frame connects + image spreads to become the footer backdrop'.

## Do not mistake proposals for facts
- Final logo variants, wordmark capitalization, exact font and colour values are **not yet approved**.
- Footage is **not yet supplied**; use actual DrawnOut portfolio images as placeholders.
- Current hand-held-frame screenshot cannot be separated into genuine hand and logo animation layers. Do not claim the fully believable animation can be produced from that screenshot alone.
- Client/project permissions, precise agency services and credits remain unverified, pending studio sign-off.

## Codex model recommendation
For premium first-pass design architecture and highly constrained animation engineering use **GPT-6 Astra / High**, if available in Codex. Use **GPT-6.1 Sol / High** for substantial everyday implementation, **Medium** for content updates. In Codex, only select models that actually appear in your available picker. Official docs describe Astra as the most capable and newer Sol as suitable for agentic coding. Selection and availability can change.
