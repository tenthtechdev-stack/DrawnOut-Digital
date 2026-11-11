# 11 project case-study pages — curated image mosaics, visual copy, motion and safe SEO

Source: https://github.com/tenthtech/drawnout-digital/issues/15

## Goal

Upgrade all **11 existing, visually approved** public `/work/<slug>` case-study routes to premium, image-first mosaic project presentations with concise, art-grounded copy, accurate alt text, restrained motion and SEO-ready metadata candidates.

The user supplied a grid sketch on 4 November 2026: **tall left visual, wide top-right visual, two small bottom-right visuals**. Use the motif where four distinct usable pieces exist. Other cases have 2–3 assets and need visually well-designed adaptive layouts, not duplicated images or fabricated placeholder artwork.

## Authoritative GitHub files

Prepared and verified in documentation branch **`content/project-case-study-gallery-seo`**, commit `bed6d7e80ebdee3f90a0619605ac7f59b49fae51`:

- [Review index](https://github.com/tenthtech/drawnout-digital/blob/content/project-case-study-gallery-seo/docs/portfolio-case-rebuild/README.md)
- [11 editorial/SEO/image manifests](https://github.com/tenthtech/drawnout-digital/blob/content/project-case-study-gallery-seo/docs/portfolio-case-rebuild/project-editorial-candidates.json)
- [Technical/gallery/motion implementation requirements](https://github.com/tenthtech/drawnout-digital/blob/content/project-case-study-gallery-seo/docs/portfolio-case-rebuild/IMPLEMENTATION_BRIEF.md)

The package includes 11 unique concise narratives, 11 proposed SEO titles/descriptions, 37 proposed image placements with alt text/captions, 6 existing video references and honest factual boundaries.

## Git setup

Current site development includes the **stacked** PR chain #10 -> #12 -> #14; each is currently open or draft. **Do not base application edits on the old docs branch or replace the current site with it**. Create a new feature branch from the **latest integrated development head** (currently `feature/services-overview-chapters`, subject to up-to-date verification), bring in only the three docs files from `content/project-case-study-gallery-seo`, and create a draft dependent PR against that head while it remains open. If the stack has merged since writing this issue, branch from updated main instead.

## Implementation staging

1. First build **four test cases**: SOL (4+ visual mosaic), Bunzo (motion-rich), Capture (3 items), By Tech Group (2 items). Capture browser evidence at desktop/mobile.
2. Review framing, natural scroll, fit/contain choice, animations and no duplicate boards; do not gate all work behind tests before a checkpoint push.
3. Apply one shared adaptive case-study template to all 11 records with concise image-based copy; include the six existing motion loops only where already available.
4. Run publication/privacy SEO checks and responsive/browser regressions. Do not invent clients, services performed, results or process history. **Preserve `contentVerified=false` and `creditApproved=false` until independent owner verification**, and do not bypass the SEO metadata gate.
5. Push actual completed source, tests, gallery recordings and concise validation; open draft review PR. No merges or external Netlify deployment.

The final editorial and SEO strings are **ready for visual/owner approval**, not already published or factual-client-role signoff. Keep site-wide preview noindex unchanged.
