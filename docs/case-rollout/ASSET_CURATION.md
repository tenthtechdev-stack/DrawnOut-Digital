# Complete case-study rollout — asset curation

The owner approved the five pilot designs with “Yes approved” before this extension to the remaining six existing public cases. The first five presentation plans remain unchanged. This audit records the six additional plans in [the server-side presentation adapter](../../src/lib/case-presentation.ts), following [the editorial package](../portfolio-case-rebuild/README.md), [its implementation brief](../portfolio-case-rebuild/IMPLEMENTATION_BRIEF.md) and [the publication workflow](../PORTFOLIO_WORKFLOW.md).

## Scope and source boundaries

The rollout uses only images already registered in each canonical project's `cover` or `gallery`. Every additional still was visually inspected, including the excluded Churros crop. No new artwork, source edits, derivatives, video renders, project records, publication flags, attribution or SEO approvals were introduced.

`casePilotSlugs` preserves the historical five-project review group. `casePresentationSlugs` enumerates all eleven presentations. `getCasePresentation()` still requires `canPublish()` and resolves each selected stem exclusively against that project's approved collection assets. Missing or repeated assets return the existing presentation instead of importing another file. Withdrawal/draft controls and the canonical ordering remain unchanged.

The six new cases contain **16 selected still placements from 15 original boards**, including one deliberate FK card close-up from its applications board. Across all eleven cases there are **34 selected still placements**, rather than the editorial manifest's 37 candidates. The five pilot choices remain as reviewed; the new Churros plan excludes one repetitive crop. Existing portrait/landscape motion loops replace the media within one of these slots; they do not count as additional original artwork.

## New presentation choices

| Case                 | Selected stills, in presentation order                         | Variant                     | Source-board count | Lead native size |
| -------------------- | -------------------------------------------------------------- | --------------------------- | -----------------: | ---------------- |
| Churros Dessert Shop | `churros-applications`, `churros-identity`, `churros-patterns` | `mosaic-3`, existing motion |                  3 | 1440 × 811       |
| Khalo                | `khalo-packaging`, `khalo-identity`, `khalo-applications`      | `mosaic-3`, static          |                  3 | 1440 × 811       |
| FK Technology        | `fk-applications`, `fk-identity`, `fk-card-detail`             | `mosaic-3`, static          |                  2 | 1440 × 811       |
| Feed N Seed          | `feed-n-seed-product`, `feed-n-seed-stationery`                | `mosaic-2`, static          |                  2 | 1440 × 811       |
| Abacus Immigration   | `abacus-applications`, `abacus-social-layouts`                 | `mosaic-2`, static          |                  2 | 1440 × 811       |
| U Wanna Smoothie     | `smoothie-identity`, `smoothie-color`, `smoothie-menu`         | `mosaic-3`, existing motion |                  3 | 1440 × 811       |

All stems above refer to existing `.webp` files under `src/assets/portfolio/`. The complete boards are landscape, approximately 16:9. Their shape is preserved with contained framing; a tall layout slot is not evidence of a portrait original. Khalo and FK use the broad three-image composition rather than stretching landscape boards into a tall mat. Churros and U Wanna Smoothie can use their already-approved portrait motion source in the dominant slot while preserving the complete static fallback board. Feed and Abacus use two-image compositions without filler.

### Churros Dessert Shop

- `churros-applications.webp`: `design-assets/portfolio-originals/07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_03.png`, full-frame derivative. Packaging, poster/signage, apparel and object mockups form a single board; they are not counted as separate supplied deliverables.
- `churros-identity.webp`: the same folder's `07_Churros_Dessert_Shop_01.png`, full-frame derivative. The ornate badge, cup imagery and warm red/cream fields establish the visual vocabulary.
- `churros-patterns.webp`: `07_Churros_Dessert_Shop_02.png`, full-frame derivative. Alternate badges, typographic references, stripes, floral/sun forms and decorative patterns complement the application board.
- **Excluded:** `churros-retail-wide.webp` is the existing crop `(0, 18, 1654, 438)` of board 03. Visual comparison confirms it repeats the applications board's complete top row. Selecting three distinct boards avoids presenting that strip as additional evidence.

The original artwork contains promotional wording and food-related claims. New editorial text describes marks, colors and pictured formats without adopting those claims. The existing Churros motion source remains unchanged.

### Khalo

- `khalo-packaging.webp`: `design-assets/portfolio-originals/09_Khalo/09_Khalo_02.png`, full-frame derivative. Burger imagery sits above an orange-and-cream bag/cup/fries-container mockup group.
- `khalo-identity.webp`: `09_Khalo_01.png`, full-frame derivative. Orange lettering, a burger-eating cartoon character and food doodles provide a distinct identity view.
- `khalo-applications.webp`: `09_Khalo_03.png`, full-frame derivative. Signage, apparel, wrapping and a phone presentation extend the same artwork.

These are three different source boards. The text describes the phone as a mockup and does not imply a working ordering product, a real restaurant engagement or verified food claims.

### FK Technology

- `fk-applications.webp`: `design-assets/portfolio-originals/10_FK_Technology/10_FK_Technology_03.png`, full-frame derivative. The orange mark is pictured on cards, packaging, fabric and device-screen concepts.
- `fk-identity.webp`: `10_FK_Technology_01.png`, full-frame derivative. The mark, lettering and palette provide an independent board.
- `fk-card-detail.webp`: existing crop `(523, 12, 1137, 402)` of board 03, native **614 × 390**. This intentionally revisits the small card area at a useful reading scale. The caption explicitly identifies it as a closer crop of the applications board; it is not a third original board or an additional delivered item. Its smaller layout slot avoids making this low-resolution detail the dominant visual.

No built website, delivered software, team, business relationship or result is inferred from the screen mockups.

### Feed N Seed

- `feed-n-seed-product.webp`: `design-assets/portfolio-originals/11_Feed_N_Seed/11_Feed_N_Seed_02.png`, full-frame derivative. Container lids, labels, wheat imagery and green/orange circular marks establish the crop-inspired presentation.
- `feed-n-seed-stationery.webp`: `11_Feed_N_Seed_03.png`, full-frame derivative. Letterhead and card mockups share a board with five color treatments of the same emblem.

The two boards repeat the mark intentionally while showing distinct compositions. Embedded source slogans, product-quality statements, personal names, phone numbers and addresses are not transcribed into public copy, captions, alternative text, metadata or structured data. The source artwork is retained exactly as supplied and already approved for display; this rollout does not verify or amplify its embedded statements.

### Abacus Immigration

- `abacus-applications.webp`: `design-assets/portfolio-originals/08_Abacus_Immigration/08_Abacus_Immigration_02.png`, full-frame derivative. A blue-and-white plane-inspired mark appears on travel and object mockups.
- `abacus-social-layouts.webp`: `08_Abacus_Immigration_03.png`, full-frame derivative. Blue fields, serif headings, travel icons and a social-post presentation form a second composition.

The aircraft tail, passport cover and social graphics are described as artwork/mockups. Their presence does not verify an aviation relationship, immigration advice, delivered services, trust claims, campaign success or an operating social account. The new text does not quote the promotional statements embedded in the board.

### U Wanna Smoothie

- `smoothie-identity.webp`: `design-assets/portfolio-originals/12_U_Wanna_Smoothie/12_U_Wanna_Smoothie_01.png`, full-frame derivative. Pink/lime graphic fields and a cup-and-fruit symbol accompany a drink presentation.
- `smoothie-color.webp`: `12_U_Wanna_Smoothie_02.png`, full-frame derivative. Color swatches, fruit/leaf/cup forms and a berry-drink image add a distinct composition.
- `smoothie-menu.webp`: `12_U_Wanna_Smoothie_03.png`, full-frame derivative, native **1440 × 751**. The full menu concept remains visible without forcing a 16:9 crop.

The menu includes source company history, location and ingredient/product statements. New copy describes its colors and layout without quoting, verifying or converting them into business facts, nutrition claims, locations or structured data. The already-approved Smoothie motion source remains unchanged.

## Content and approval safeguards

All eleven canonical records retain `projectType: "unknown"`, `contentVerified: false`, `creditApproved: false` and empty service-delivery lists. The added descriptions are observations about visible artwork, adapted from the prepared editorial candidates after image inspection. They do not create a historical design process, client brief, service attribution, result, credit, year or testimonial.

The service link remains the existing related site-navigation destination, not a claim of services performed for a pictured brand. Proposed custom SEO remains inactive. Preview-wide `noindex,nofollow`, canonical project order, routes, existing six motion assets and publication/withdrawal checks remain intact.

This is a source/copy audit. Responsive rendering, video behavior, accessibility and the complete automated test results are recorded separately in the rollout validation report and browser evidence. Source approval does not substitute for physical-device testing or authorize deployment.
