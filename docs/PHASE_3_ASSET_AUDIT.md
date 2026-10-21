# Phase 3 original portfolio and case-media audit

The complete archive was re-inspected for the Work and case-study system: **15 folders, 46 original PNGs**, all decoded and reviewed through six contact sheets. Selected detail sources were also inspected at full resolution. Phase 3 extends the seven existing draft records with four additional private drafts: **Capture, Khalo, FK Technology, and U Wanna Smoothie**. These names follow the supplied folder names and visible marks; no commissioning relationship is inferred.

The archive is flattened presentation artwork. Its embedded contact details, service copy, identities, mockups, statistics, rationale, pricing, and product statements are source-image content, not independently verified DrawnOut claims. All 11 records remain `draft`, `private`, `projectType: unknown`, `contentVerified: false`, with publication/credit approvals false and `services: []`. Observed-artwork categories describe image formats; they do not establish services performed.

## Review of every supplied folder

| Original folder                   | PNGs | Phase 3 decision                                                                                                                                                                                   |
| --------------------------------- | ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01_DrawnOUT_Digital`             |    2 | Agency logo and old company-profile reference. Keep separate from client/concept projects; no new record or replacement brand master.                                                              |
| `02_SOL_Community_Center`         |    4 | Extend the existing SOL draft with identity-reference, announcement and apparel compositions. Keep the existing homepage cover, signage detail and first gallery entries unchanged.                |
| `03_By_Tech_Group`                |    3 | Extend the existing draft with its full identity-reference presentation. Screen/app-icon images remain artwork rather than proof of implementation.                                                |
| `04_Bunzo`                        |    6 | Extend the existing draft with identity artwork, paired isolated cup/bag panels, and social-layout artwork. Do not use the website board's embedded numbers as results; board 06 is not added.     |
| `05_Capture`                      |    2 | Add a private Capture draft from both identifiable boards, including a stationery detail. Embedded names, contact details and social numbers remain unverified source text.                        |
| `06_Barm_Technology`              |    2 | Reserve. Identifiable material exists, but By Tech and FK already provide contrasting technology presentations. No extra record is required to fill the Work page.                                 |
| `07_Churros_Dessert_Shop`         |    3 | Extend the existing draft with identity and pattern/reference boards, retaining the approved homepage's cover and initial gallery sequence.                                                        |
| `08_Abacus_Immigration`           |    3 | Extend the existing draft with its supplied social-layout board. Do not turn embedded immigration-service statements into verified agency scope or outcomes.                                       |
| `09_Khalo`                        |    3 | Add a private Khalo draft using packaging, identity and application boards. Food, signage, apparel and phone imagery are described as supplied presentation mockups.                               |
| `10_FK_Technology`                |    3 | Add a private FK Technology draft using identity and application boards plus an isolated card detail. No website/app launch or engineering claim.                                                  |
| `11_Feed_N_Seed`                  |    3 | Extend the existing draft with the stationery/mark-variation board. Product statements and imagery remain unverified source artwork.                                                               |
| `12_U_Wanna_Smoothie`             |    3 | Add a private U Wanna Smoothie draft with its full identity, color and menu presentations. The record title is a readable normalization of the visible supplied name, pending studio confirmation. |
| `13_Drawnout_Fashion_and_Textile` |    3 | Reserve. The connection to DrawnOut Digital and commissioning status are unresolved; do not imply this is the agency's own fashion business or an approved client.                                 |
| `14_Triarch`                      |    2 | Extend the existing draft with an isolated wordmark panel and device detail. The source board 02 pricing panel is excluded; full board 01 and the existing card cover remain preserved.            |
| `15_Unsorted_Misc`                |    4 | Exclude. Unrelated partial UI/portfolio screenshots and analytics fragments lack enough context and provenance for project records.                                                                |

## New derivative manifest

These **26 new WebPs total 2,040,058 bytes**. All are derived only from the supplied originals under `design-assets/portfolio-originals/`. Encoding uses Pillow WebP, RGB, quality 86, method 6, and Lanczos resizing to a maximum width of 1440px, with **no upscaling**. Panel crops use explicit source-pixel bounds `(left, top, right, bottom)`; no pixels or artwork were reconstructed.

All outputs live under `src/assets/portfolio/`. The existing 11 Phase 2 WebPs are byte-for-byte unchanged. The [Phase 2 manifest](PHASE_2_ASSET_AUDIT.md) remains authoritative for those original derivatives.

| New derivative                   | Original PNG relative to archive root                    | Crop bounds              | Output      |  Bytes |
| -------------------------------- | -------------------------------------------------------- | ------------------------ | ----------- | -----: |
| `bunzo-identity.webp`            | `04_Bunzo/04_Bunzo_01.png`                               | Full frame               | 1440 × 811  | 123436 |
| `bunzo-cup-detail.webp`          | `04_Bunzo/04_Bunzo_04.png`                               | `(388, 8, 801, 516)`     | 413 × 508   |  18594 |
| `bunzo-bag-detail.webp`          | `04_Bunzo/04_Bunzo_04.png`                               | `(810, 8, 1243, 516)`    | 433 × 508   |  23468 |
| `bunzo-social-layouts.webp`      | `04_Bunzo/04_Bunzo_05.png`                               | Full frame               | 1440 × 811  | 202110 |
| `sol-identity-system.webp`       | `02_SOL_Community_Center/02_SOL_Community_Center_01.png` | Full frame               | 1440 × 1137 | 138410 |
| `sol-notice-layouts.webp`        | `02_SOL_Community_Center/02_SOL_Community_Center_02.png` | Full frame               | 1433 × 424  |  55180 |
| `sol-apparel-detail.webp`        | `02_SOL_Community_Center/02_SOL_Community_Center_04.png` | `(652, 0, 1654, 397)`    | 1002 × 397  | 100572 |
| `triarch-letterform-detail.webp` | `14_Triarch/14_Triarch_01.png`                           | `(0, 0, 837, 461)`       | 837 × 461   |  30406 |
| `triarch-device-detail.webp`     | `14_Triarch/14_Triarch_02.png`                           | `(1100, 302, 1654, 931)` | 554 × 629   |   8664 |
| `churros-identity.webp`          | `07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_01.png` | Full frame               | 1440 × 811  | 185136 |
| `churros-patterns.webp`          | `07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_02.png` | Full frame               | 1440 × 811  |  81694 |
| `by-tech-identity.webp`          | `03_By_Tech_Group/03_By_Tech_Group_01.png`               | Full frame               | 1440 × 811  |  26344 |
| `abacus-social-layouts.webp`     | `08_Abacus_Immigration/08_Abacus_Immigration_03.png`     | Full frame               | 1440 × 811  | 113260 |
| `feed-n-seed-stationery.webp`    | `11_Feed_N_Seed/11_Feed_N_Seed_03.png`                   | Full frame               | 1440 × 811  |  97588 |
| `capture-applications.webp`      | `05_Capture/05_Capture_02.png`                           | Full frame               | 1440 × 811  |  92098 |
| `capture-identity.webp`          | `05_Capture/05_Capture_01.png`                           | Full frame               | 1440 × 811  |  52368 |
| `capture-stationery-detail.webp` | `05_Capture/05_Capture_02.png`                           | `(0, 0, 615, 566)`       | 615 × 566   |  19966 |
| `khalo-packaging.webp`           | `09_Khalo/09_Khalo_02.png`                               | Full frame               | 1440 × 811  | 119392 |
| `khalo-applications.webp`        | `09_Khalo/09_Khalo_03.png`                               | Full frame               | 1440 × 811  | 145476 |
| `khalo-identity.webp`            | `09_Khalo/09_Khalo_01.png`                               | Full frame               | 1440 × 811  |  78328 |
| `fk-applications.webp`           | `10_FK_Technology/10_FK_Technology_03.png`               | Full frame               | 1440 × 811  |  48796 |
| `fk-identity.webp`               | `10_FK_Technology/10_FK_Technology_01.png`               | Full frame               | 1440 × 811  |  19734 |
| `fk-card-detail.webp`            | `10_FK_Technology/10_FK_Technology_03.png`               | `(523, 12, 1137, 402)`   | 614 × 390   |  12886 |
| `smoothie-identity.webp`         | `12_U_Wanna_Smoothie/12_U_Wanna_Smoothie_01.png`         | Full frame               | 1440 × 811  |  66042 |
| `smoothie-color.webp`            | `12_U_Wanna_Smoothie/12_U_Wanna_Smoothie_02.png`         | Full frame               | 1440 × 811  |  96824 |
| `smoothie-menu.webp`             | `12_U_Wanna_Smoothie/12_U_Wanna_Smoothie_03.png`         | Full frame               | 1440 × 751  |  83286 |

## Framing and gallery decisions

- Bunzo's cup and bag details follow existing application-panel boundaries. Both retain the complete main visible wordmark/lettering; the bag detail includes the box within that same source panel. They can form a paired composition without fabricating isolated original exports.
- The SOL apparel detail uses the two existing shirt panels. The full identity-reference board and announcement strip supply different proportions without duplicating a claim of verified strategy or campaign work.
- Triarch's wordmark panel is isolated from board 01. The device panel from board 02 excludes all package/pricing columns; the visible monogram is described without asserting how it relates to a verified commissioned identity.
- Capture's stationery panel and FK's card panel retain the visible supplied marks. The full application boards remain available as contextual covers.
- Original full-board framing is retained for the remaining new media. Case pages can show a full-width board, inset reference artwork, and paired details according to typed `gallery[].layout` values; captions describe only what is visible.

Existing covers and the complete old gallery prefixes remain unchanged for all seven earlier records. `featured`, `featuredOrder`, and cover alternatives are preserved, so approved homepage image selection and framing are unaffected. New `workOrder` and `presentation` values control only the Work/case presentation. All 11 records use exact local derivative paths and include the original PNG source paths in `assetSource`.

## Record and integrity checks

Observed categories: `identity` (11), `packaging` (5), `digital` (5), and `print` (8). Counts derive from the records and may overlap. Digital labels describe screen/social presentation artwork; they do not imply web development or a released product. Print and packaging labels describe depicted applications, not a confirmed deliverables list.

Checks performed after generation:

- SHA-256 comparison confirms all **46 original PNGs remain unchanged** from the pre-generation baseline; automated repository tests additionally compare the originals to asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`.
- Git-blob comparison confirms all **11 existing Phase 2 WebPs remain unchanged**.
- All **seven earlier covers, cover alternatives, featured flags/order, and gallery prefixes are preserved**.
- All **11 records** retain private draft status, false approvals, unknown commissioning status, and empty services. No client role, year, industry, challenge, concept, approach, deliverable, testimonial, credit, or result was invented.
- Every cover/gallery path exists, resolves to the local optimized asset directory, and decodes as WebP with nonempty alternative text.

These assets are for the authorized repository review gallery and local development previews. The production selector and build must continue excluding all unapproved artwork, metadata, and case-study routes. Final isolated artwork/video exports, commissioning provenance, credits, confirmed narratives and publication permissions remain required before publication.
