# Phase 2 original portfolio audit

The latest `main` contains asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`. All **15 folders and 46 PNG originals** under `design-assets/portfolio-originals/` were inspected through contact sheets, with full-size inspection of the selected hero/detail sources. Every original PNG decoded successfully. The originals are unchanged; SHA-256 values were compared before and after derivative generation.

The originals are flattened design presentations. They support visual selection and precise descriptions of what is visible, but do not establish commissioning status, actual scope, credits, launched websites, outcomes, or permission to publish a case study. All seven existing structured project records remain `draft`, `private`, `projectType: unknown`, with publication and credit approvals false and unverified services empty.

## Complete folder review

| Folder                            | PNGs | Observed material and Phase 2 decision                                                                                                                                                                                                             |
| --------------------------------- | ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01_DrawnOUT_Digital`             |    2 | Supplied agency identity and company-profile artwork, including the older tagline. Brand reference only; not a client case or a new logo source.                                                                                                   |
| `02_SOL_Community_Center`         |    4 | Identity rationale, social layouts, and an applications collage. Select image 04 for signage, apparel, stationery, and branded-object presentation; the isolated signage panel is available for a different image proportion.                      |
| `03_By_Tech_Group`                |    3 | Technology identity, guidelines, and blue/green applications. Select image 03 for sector/color contrast through stationery and branded-object visuals.                                                                                             |
| `04_Bunzo`                        |    6 | Identity, packaging, food imagery, social graphics, and a website mockup. Select image 03 for the packaging composition and top-panel detail. Avoid the website mockup as evidence of a launched site or its embedded figures as verified results. |
| `05_Capture`                      |    2 | Red/black identity and applications. Reserve; overlaps the lead project's red palette and adds no necessary Phase 2 proof claim.                                                                                                                   |
| `06_Barm_Technology`              |    2 | Blue/green identity and collateral. Reserve in favor of By Tech's stronger selected applications board.                                                                                                                                            |
| `07_Churros_Dessert_Shop`         |    3 | Illustrated identity, packaging, retail/signage, apparel. Select image 03 and its top application row for a warm illustrated counterpoint.                                                                                                         |
| `08_Abacus_Immigration`           |    3 | Blue/white identity, stationery, signage, and social graphics. Refresh its existing draft cover from original image 02; retained as a reserve rather than implying verified immigration-related services or reach.                                 |
| `09_Khalo`                        |    3 | Food identity, packaging, and retail applications. Reserve to avoid three hospitality-focused lead presentations.                                                                                                                                  |
| `10_FK_Technology`                |    3 | Orange/black technology identity and collateral/mockups. Reserve; similar warmth to studio chrome and no need to imply website implementation.                                                                                                     |
| `11_Feed_N_Seed`                  |    3 | Agricultural/product identity, packaging, and stationery. Refresh its existing draft cover from image 02 as a quiet product/sector-diversity option.                                                                                               |
| `12_U_Wanna_Smoothie`             |    3 | Beverage identity, packaging, and menu/application layouts. Reserve; vivid alternative for a later approved selection.                                                                                                                             |
| `13_Drawnout_Fashion_and_Textile` |    3 | Apparel/textile identity and stationery. Reserve until the relationship to DrawnOut Digital and project provenance are clarified.                                                                                                                  |
| `14_Triarch`                      |    2 | Monochrome identity, business-card application, and an editorial/material board. Select the image 01 business-card panel as a portrait composition. Image 02 includes pricing packages in the artwork and is not needed for the homepage.          |
| `15_Unsorted_Misc`                |    4 | Cropped text, near-duplicate analytics fragments, and unrelated incomplete UI imagery. Exclude; provenance/context remain incomplete and the figures are not agency results.                                                                       |

Total reviewed: 46 PNGs. Nothing from excluded/reserve folders is silently represented as a published project.

## Optimized derivative manifest

All outputs live in `src/assets/portfolio/`. Encoding uses Pillow's WebP encoder, quality 86, method 6, RGB conversion, and Lanczos downsampling to at most 1440px wide with no upscaling. The original files are only read. Crop coordinates below are pixel bounds on the original image: `(left, top, right, bottom)`.

| Derivative                        | Original PNG                                             | Crop                  | Output dimensions |  Bytes |
| --------------------------------- | -------------------------------------------------------- | --------------------- | ----------------- | -----: |
| `bunzo-applications.webp`         | `04_Bunzo/04_Bunzo_03.png`                               | Full frame            | 1440 × 811        | 158768 |
| `bunzo-packaging-wide.webp`       | `04_Bunzo/04_Bunzo_03.png`                               | `(0, 0, 1654, 541)`   | 1440 × 471        |  87150 |
| `sol-community-applications.webp` | `02_SOL_Community_Center/02_SOL_Community_Center_04.png` | Full frame            | 1440 × 811        | 242266 |
| `sol-community-signage.webp`      | `02_SOL_Community_Center/02_SOL_Community_Center_04.png` | `(0, 0, 650, 397)`    | 650 × 397         |  70490 |
| `churros-applications.webp`       | `07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_03.png` | Full frame            | 1440 × 811        | 189836 |
| `churros-retail-wide.webp`        | `07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_03.png` | `(0, 18, 1654, 438)`  | 1440 × 366        |  92284 |
| `triarch-business-card.webp`      | `14_Triarch/14_Triarch_01.png`                           | `(840, 0, 1654, 931)` | 814 × 931         | 174200 |
| `triarch-identity-board.webp`     | `14_Triarch/14_Triarch_01.png`                           | Full frame            | 1440 × 811        | 172096 |
| `by-tech-applications.webp`       | `03_By_Tech_Group/03_By_Tech_Group_03.png`               | Full frame            | 1440 × 811        |  53608 |
| `feed-n-seed-product.webp`        | `11_Feed_N_Seed/11_Feed_N_Seed_02.png`                   | Full frame            | 1440 × 811        | 123688 |
| `abacus-applications.webp`        | `08_Abacus_Immigration/08_Abacus_Immigration_02.png`     | Full frame            | 1440 × 811        | 116140 |

These 11 derivatives total 1,480,526 bytes. They are build-time source masters, not a fixed per-page transfer budget: Astro produces responsive variants at the requested display sizes. Small detail/portrait source widths must cap generated candidate widths rather than being upscaled to 1440px.

## Crop and caption decisions

- The Bunzo detail isolates the original upper packaging panel, stopping at its existing panel boundary. It retains the major bag, box, cup, and fries branding; the original presentation itself truncates parts of the wrapping paper and bag. No missing pixels were reconstructed.
- The SOL detail isolates the supplied exterior-signage panel and retains the complete visible name/symbol. The full collage remains available for context.
- The Churros wide detail isolates the original top application row, with the full collage retained alongside it. It is a presentation strip, not claimed as new or verified photography.
- The Triarch portrait isolates the right-side business-card panel. It avoids the explanatory identity copy in image 01 and the pricing content in image 02. The full image 01 board remains available for context.
- Captions describe visible artwork only. They do not invent a brief, service scope, commissioning claim, year, outcome, or client credit.

Canonical project JSON records point to the new covers and gallery details, with exact original paths and asset-commit provenance in `assetSource`. Bunzo, SOL, and Churros gallery entry 0 is the cropped detail; entry 1 is the full cover board for context. Triarch gallery entry 0 is its full context board. Other reserve covers have no invented gallery narrative.

## Publication and media boundary

Original files remain outside `public/`, and the new derivatives are local build assets consumed only by the development-only project preview graph. The normal production build must continue excluding all unapproved portfolio artwork and case routes. Repository review assets and local screenshots are not authorization to publicly deploy a portfolio preview.

Actual videos, original isolated art exports, clean final hand/frame/emblem resources, per-project credits/provenance, and publication permission are still required before their respective release phases. There is no stock footage, generated image content, fake play control, or production-ready hand animation in this asset work.
