# Signature milestone — approved visual portfolio

The client's Signature Website Development authorization, section 3, and [consolidated brief](SIGNATURE_EXPERIENCE_BRIEF.md), section F, approve the supplied artwork and project names for visual display. The eleven existing records now generate public `/work/<slug>` routes. Display permission is recorded separately from factual verification and attribution.

Every supplied record retains `projectType: "unknown"`, `contentVerified: false`, `creditApproved: false` and `services: []`. No client relationship, designer, date, deliverable, challenge, creative narrative, result or testimonial was added. Categories, captions and summaries describe visible artwork. Historical provenance strings retain the original review context; the new `displayApproval.source` records the later authorization.

## Complete source archive

The archive contains 46 PNGs in 15 folders. The integrity test compares every original against asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`; source bytes remain unchanged. Existing optimized artwork and visual compositions are reused. The [Phase 3 audit](PHASE_3_ASSET_AUDIT.md) records the original visual inspection and exact derivative/crop manifest.

| Original folder                   | PNGs | Current disposition                                                                                                          |
| --------------------------------- | ---: | ---------------------------------------------------------------------------------------------------------------------------- |
| `01_DrawnOUT_Digital`             |    2 | Agency logo/company-profile references; kept separate from portfolio project records.                                        |
| `02_SOL_Community_Center`         |    4 | Approved visual record: `/work/sol-community-center`.                                                                        |
| `03_By_Tech_Group`                |    3 | Approved visual record: `/work/by-tech-group`. Screen artwork does not imply a shipped product.                              |
| `04_Bunzo`                        |    6 | Approved visual record: `/work/bunzo`. Embedded board metrics are not asserted as project results; board 06 remains unused.  |
| `05_Capture`                      |    2 | Approved visual record: `/work/capture`. Source contact details and social numbers are not copied into factual metadata.     |
| `06_Barm_Technology`              |    2 | Reserved source material; no existing structured record. No new project invented to match folder count.                      |
| `07_Churros_Dessert_Shop`         |    3 | Approved visual record: `/work/churros`.                                                                                     |
| `08_Abacus_Immigration`           |    3 | Approved visual record: `/work/abacus-immigration`. Immigration statements remain source artwork, not verified agency scope. |
| `09_Khalo`                        |    3 | Approved visual record: `/work/khalo`. Applications are described as presentation artwork.                                   |
| `10_FK_Technology`                |    3 | Approved visual record: `/work/fk-technology`. No engineering or launch claim.                                               |
| `11_Feed_N_Seed`                  |    3 | Approved visual record: `/work/feed-n-seed`.                                                                                 |
| `12_U_Wanna_Smoothie`             |    3 | Approved visual record: `/work/u-wanna-smoothie`, retaining the existing normalized supplied name.                           |
| `13_Drawnout_Fashion_and_Textile` |    3 | Reserved source material; its relationship to the agency is unresolved. No client or agency-owned-business claim.            |
| `14_Triarch`                      |    2 | Approved visual record: `/work/triarch`. Existing pricing-panel exclusion remains.                                           |
| `15_Unsorted_Misc`                |    4 | Partial UI/analytics/reference fragments remain outside structured projects; insufficient context to create a project.       |

The five homepage features remain Bunzo, SOL Community Center, Triarch, Churros and By Tech Group, in their existing order. Their cards are real keyboard-accessible links. All eleven projects appear on Work with metadata-derived filters and case-study previous/next navigation. No pending-review, private-draft or visual-preview label appears on approved artwork.

## Publication and privacy boundaries

`canPublish()` requires published status, public visibility, the release flag and explicit `displayApproval.state: "approved"` with a nonempty authorization reference. Unknown commissioning and unapproved attribution do not block visual display. They also do not become facts: the case template independently gates factual sections with `contentVerified`, and attribution additionally requires `creditApproved`.

Free-form SEO overrides also require factual and attribution approval, since they can contain claims even when the visible case sections are hidden. Otherwise page and OpenGraph metadata use only the approved visual title and summary.

The existing loader rejects unapproved records **before** Astro stores image imports. Future pending/private records and withdrawn artwork remain excluded from production routes, HTML, filters, links, metadata and unique image output. Their local development case preview remains available under `/_preview/work/<slug>`; approved records use only public routes.

The publication integration test uses a disposable source copy with one synthetic approved record, a second pending record and uniquely named derivative files. Four builds exercise visual-only release, factual verification, separate attribution permission and withdrawal. The pending record and its unique image must stay absent throughout; withdrawal must remove the first record's route, public references and unique image. The supplied records are not changed by these tests.

See [the portfolio workflow](PORTFOLIO_WORKFLOW.md) for adding, editing, reordering and withdrawing projects using a record and images. Actual full-suite results belong in the milestone validation report; this audit does not imply deployment or verified factual content.
