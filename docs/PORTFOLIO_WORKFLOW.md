# Maintaining the portfolio with Codex

Portfolio content lives in `src/content/projects/*.json`; local image derivatives live in `src/assets/portfolio/`. A record supplies the Work card, derived category filters, reusable case-study template, gallery, and previous/next navigation. Adding a project requires its content record and images, without a new page component or manual navigation entry. There is no custom admin dashboard.

- `design-assets/portfolio-originals/` is the immutable supplied archive: 15 folders / 46 PNGs.
- `design-assets/project-sources/<slug>/` is the staging location for **future** original uploads; keep it outside the fixed historical archive and outside `public/`.
- `src/assets/portfolio/` holds optimized derivatives consumed through approved or development-only content.
- `src/content/projects/<slug>.json` is the canonical structured record.

The approved Phase 2 homepage remains unchanged. Its existing curated presentation is separate from Work ordering; do not redesign or manually expand it as part of a routine portfolio update.

## The Phase 3 demonstration

The collection now contains **11 real artwork-review records**: the seven existing Bunzo, SOL Community Center, Triarch, Churros Dessert Shop, By Tech Group, Feed N Seed, and Abacus Immigration records, plus four newly prepared drafts:

| New record              | Original artwork folder | Local development preview         |
| ----------------------- | ----------------------- | --------------------------------- |
| `capture.json`          | `05_Capture`            | `/_preview/work/capture`          |
| `khalo.json`            | `09_Khalo`              | `/_preview/work/khalo`            |
| `fk-technology.json`    | `10_FK_Technology`      | `/_preview/work/fk-technology`    |
| `u-wanna-smoothie.json` | `12_U_Wanna_Smoothie`   | `/_preview/work/u-wanna-smoothie` |

Each addition uses the same schema and case-study template. Captions describe visible artwork, provenance identifies the original supplied PNGs, and ordering/compositions are set in JSON. No project route or card was hand-coded for these additions. All 11 remain private drafts with unknown commissioning status, publication and credit approval false, factual content unverified, and no inferred services. The four new records demonstrate the **add → validate → local review** workflow; they are not a demonstration of real publication approval.

All 15 original folders were reviewed. A folder is not automatically a suitable case study: incomplete, unrelated, duplicate, internal, or unclear material can remain excluded. Keep the 46 original PNG files unchanged in `design-assets/portfolio-originals/`; a new draft is not a reason to overwrite, rename, or re-encode an original.

## Add a project

1. Supply the actual artwork and its source/provenance, project name, intended display order, descriptive alternatives, permission status, and any verified narrative. State unknown facts explicitly. Artwork alone does not establish a client relationship, commissioned services, credit, or results.
2. For a future upload, stage its untouched originals in `design-assets/project-sources/<slug>/`; do not add files to the immutable 46-image archive. Ask Codex to inspect the sources and make deliberately framed WebP derivatives under `src/assets/portfolio/`. Preserve logo proportions and useful context, reserve intrinsic dimensions, and never upscale beyond the source. Record exact source paths, crop bounds where applicable, encoding, and source commit/archive in the asset audit and `assetSource`. Originals stay outside `public/`.
3. Create one JSON file named after the lowercase, hyphen-separated slug. Use paths relative to that JSON file, such as `../../assets/portfolio/bunzo-applications.webp`. The filename and `slug` must agree and the slug must be unique.
4. Start with `status: "draft"`, `visibility: "private"`, `projectType: "unknown"`, `publicationApproved: false`, `creditApproved: false`, and `contentVerified: false`. Use an empty `services` array until the studio confirms the scope. Supply a truthful visual description rather than inventing a brief or achievement.
5. Run the checks below. Start local development and inspect `/work` and `/_preview/work/<slug>` at desktop, tablet, and mobile sizes. Review the cover, gallery order, crops, captions, keyboard links, and previous/next destinations.
6. Commit the record, derivatives, provenance notes, and review evidence to a review branch. Stop for human approval. A GitHub review gallery is separate from permission to deploy artwork in a public application preview.

The following is a **documentation example only**, with a fictitious example title and existing Bunzo artwork. It is valid draft-shaped JSON, not a new client record or permission to relabel the artwork. Do not add this example to the real collection unchanged.

```json
{
  "title": "Example draft — documentation only",
  "slug": "example-review",
  "summary": "Documentation example using the supplied Bunzo packaging artwork.",
  "overview": "Red bags, cups and food boxes are visible in this supplied presentation.",
  "status": "draft",
  "visibility": "private",
  "projectType": "unknown",
  "publicationApproved": false,
  "creditApproved": false,
  "contentVerified": false,
  "services": [],
  "categories": ["identity", "packaging"],
  "workOrder": 12,
  "presentation": "wide",
  "featured": false,
  "cover": "../../assets/portfolio/bunzo-applications.webp",
  "coverAlt": "Bunzo presentation of red packaging, cups, burger boxes and wrapping paper.",
  "gallery": [
    {
      "src": "../../assets/portfolio/bunzo-packaging-wide.webp",
      "alt": "Wide Bunzo packaging arrangement with a bag, burger box, cup and fries.",
      "caption": "Supplied packaging artwork reused only for this documentation example.",
      "layout": "full"
    }
  ],
  "assetSource": "Documentation example only. Existing derivatives of design-assets/portfolio-originals/04_Bunzo/04_Bunzo_03.png from asset commit fe15b550542e32ef224e506dcd2c5ff13eb3ba10; no publication clearance."
}
```

## Field reference

The authoritative definitions are [the shared schema](../src/lib/project-schema.ts) and [Work helpers](../src/lib/portfolio.ts). Astro resolves local image paths and validates dimensions during content processing.

| Field                                                | Meaning and editing rule                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`, `slug`                                      | Display name and stable route identifier. Changing a slug changes its URLs; update references and plan redirects before any eventual live release.                                                                                                    |
| `summary`, `overview`                                | Introduction and longer visual overview. Describe supported facts; drafts can describe visible artwork while stating what remains unconfirmed. `overview` falls back to `summary` when omitted.                                                       |
| `status`                                             | `draft`, `review`, or `published`; only `published` can pass the public gate. `review` does not publish.                                                                                                                                              |
| `visibility`                                         | `private` or `public`; only `public` can pass the public gate.                                                                                                                                                                                        |
| `projectType`                                        | `client`, `concept`, `internal`, or `unknown`. Obtain a human provenance decision; `unknown` cannot publish.                                                                                                                                          |
| `publicationApproved`, `creditApproved`              | Explicit human approval records, both required for public inclusion. A boolean cannot itself establish legal rights.                                                                                                                                  |
| `contentVerified`                                    | Separate verification state for factual narrative. Defaults false; never set true merely to fill the template. It does not grant publication approval.                                                                                                |
| `categories`                                         | Unique values from `identity`, `packaging`, `digital`, `print`. These classify **visible presentation formats**, not commissioned agency services or proven capabilities. Only categories represented in eligible records produce filters and counts. |
| `workOrder`                                          | Nonnegative integer controlling the Work index and case-study previous/next order. Lower comes first; missing values fall back to `featuredOrder`, then slug. Ties resolve by slug.                                                                   |
| `presentation`                                       | `wide`, `split`, `portrait`, or `offset` controls the Work composition. Choose from the actual artwork rather than editing the page component.                                                                                                        |
| `featured`, `featuredOrder`                          | Existing homepage-selection metadata. Preserve the approved homepage curation; use `workOrder` to reorder Work independently. These fields do not replace the publication gate.                                                                       |
| `cover`, `coverAlt`                                  | Local optimized hero/card image and meaningful alternative text. Aspect ratio follows actual image dimensions; a portrait cover supports a different composition without a new template.                                                              |
| `gallery`                                            | Ordered `{src, alt, caption?, layout?}` media entries; paths are relative to the record. `layout` defaults `full`.                                                                                                                                    |
| `gallery[].layout`                                   | `full`: wide artwork row; `inset`: narrower alternating artwork row; `pair`: two consecutive pair entries form an asymmetric two-image row. An unmatched pair renders as an inset. Mobile stacks paired images.                                       |
| `assetSource`                                        | Required provenance statement identifying actual originals and derivative/crop decisions. Preserve traceability when replacing media.                                                                                                                 |
| `clientName`, `year`, `industry`, `role`, `services` | Only confirmed organization, date, sector, role and commissioned services. Do not infer them from logos, mocked-up devices, stationery, or category tags.                                                                                             |
| `challenge`, `concept`, `approach`                   | Optional human-verified narrative; omit unknown sections rather than inventing text.                                                                                                                                                                  |
| `deliverables`, `credits`, `results`                 | Confirmed deliverables/attribution and documented outcomes only. Each result requires nonempty `label`, `value`, and `evidenceSource`. Artwork's embedded figures are not verified outcomes.                                                          |
| `seoTitle`, `seoDescription`                         | Optional accurate public-page metadata. Draft previews use generic review metadata instead of pretending to be published cases.                                                                                                                       |
| `video`                                              | Optional future poster/source/caption metadata. Current case-study compositions use stills; do not imply supplied footage or enable a fake player. Real video replacement and playback validation remain later work.                                  |

The case-study template suppresses organization/year/industry/role/services, challenge/concept/approach, deliverables, credits, and results unless `contentVerified` is true. Missing optional values still omit their sections after verification. Summary, overview, captions, and artwork descriptions are visible presentation copy and must remain accurate regardless of this flag.

The gallery omits duplicate image sources, including a source already used as the hero. To add another visual beat, supply a genuinely distinct supported image/detail instead of repeating the hero file. Reorder gallery entries in the same JSON record; no page edits are required.

## Edit and reorder

- Edit names, descriptions, categories, factual verification, and media references in the canonical JSON record. Correct the source record rather than duplicating metadata in a card, route, or gallery component.
- Change `workOrder` for Work ordering. Previous/next navigation follows the same eligible ordered set and wraps at the ends; a single project does not link to itself. Use distinct order values for clear editorial intent.
- Change `presentation` or gallery `layout` to adjust art direction. Inspect desktop and mobile crops after every media/composition change.
- Remove an unsupported category rather than retaining an empty category as a capability claim. Keep confirmed `services` separate from visual categories.
- Regenerate derivatives when replacing images, preserve original sources, and update provenance/alt/captions together. Never add images to `public/` to work around a draft preview problem.

## Publish or unpublish after human approval

All public consumers use `getPublicProjects()` / `getPublicWorkProjects()`. `canPublish()` requires **all** of the following:

```text
status === "published"
visibility === "public"
publicationApproved === true
creditApproved === true
projectType is "client", "concept", or "internal"
```

Only after the studio confirms the facts, rights, permitted imagery, role, and attribution should Codex apply those approved values. Set `contentVerified: true` separately when the factual narrative and service scope are confirmed. Leaving it false allows an approved visual-only case while keeping unverified factual sections suppressed. Do not toggle approvals to obtain a screenshot.

After the approved record change, the Work page, category counts, `/work/<slug>` route, and case navigation regenerate from the same record. Public navigation never borrows an unapproved neighbor from the development set. There is no per-project route file to create.

To withdraw a project, set it to `draft` and `private`; clear publication/credit approval if those approvals were withdrawn. Rebuild and verify that its route, card, category contribution, navigation references, and artwork leave production output. A source edit or local build does not remove an old deployment or external cached copy; any eventual live rollback requires the separately authorized deployment workflow.

Development-only previews use `/_preview/work/<slug>`. Production generates no `/_preview` pages and no unapproved `/work/<slug>` routes or artwork. Keep the development server local/private; `noindex` is an indexing hint, **not access control**. This phase authorizes GitHub review evidence, not public application deployment.

## Validation commands

From the repository, use the pinned dependencies and supported Node version:

```sh
npm run check
npm run lint
npm test
npm run build
npm run test:build
npm run test:publication
npm run format:check
```

`npm run verify` combines check, lint, unit tests, and build. `test:build` inspects the real production output for draft routes/media/metadata. `test:publication` is a separate integration demonstration: it creates a disposable source copy, adds a clearly synthetic record with a supplied poster, builds an approved visual-only case, verifies factual fields appear only after `contentVerified` changes, then revokes the fixture and rebuilds to ensure its case/artwork disappear. It exercises three real Astro builds without changing the 11 real project records or their approval flags. This document describes the test, not an unexecuted pass result; see the phase validation report for observed outcomes.

Run standalone checks before starting local development. If a development server was already running, stop and restart it afterward: the publication-aware loader generates different development/public image-import maps in Astro's content directory. Restarting restores the complete private preview collection; never bypass the loader or change approval flags to work around a mode change.

Browser tests verify filter selection/counts, project navigation, keyboard/no-JavaScript/reduced-motion behavior, and responsive layouts. To preserve historical screenshots, run from a temporary directory with the repository configuration, then copy only the current phase's review evidence:

```sh
mkdir -p /tmp/drawnout-portfolio-review
cd /tmp/drawnout-portfolio-review
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-portfolio-review/test-results
```

`npm run test:browser` is also available; its screenshot paths are relative to the command's working directory, so running it directly from the checkout can overwrite archived captures. Record the actual passed/failed/skipped counts and inspect screenshots rather than treating a successful build as visual approval.

## Codex prompt template

> Add or update a portfolio **draft** using the supplied artwork and verified information below. Inspect originals before selecting optimized derivatives; keep originals unchanged and outside public output. Create/edit only the canonical JSON record and necessary images/provenance notes. Describe visible artwork without inventing client scope, services, credits, dates, or results. Use the existing category enum, Work ordering, shared case-study template, and gallery compositions; do not create a bespoke page or admin UI. Keep all publication flags private/false and `contentVerified` false unless I explicitly provide the corresponding human approvals. Validate schema, media paths, responsive Work/case previews, filtering/navigation, and production exclusion. Report actual checks and provide review evidence; do not merge or deploy.
>
> Project name / intended slug: …
>
> Original source paths and provenance: …
>
> Observed artwork categories and desired Work position: …
>
> Approved factual narrative, services, credits, and evidence sources, or "unknown": …
>
> Commissioning/concept status and publication/credit approvals, or "not approved": …

## Human review checklist

- The project name, provenance, client/concept/internal classification, DrawnOut role, and third-party credits are accurate.
- The studio has permission to display each selected image, including artwork embedded in presentation boards.
- Summary, categories, captions, and crops describe what is visible without implying unconfirmed services or achievements.
- Factual narrative, deliverables, services, and documented results have been independently confirmed before enabling `contentVerified`; result evidence is usable and not copied blindly from source-board figures.
- Desktop, tablet, and mobile framing is deliberate; alt text, focus states, filters, keyboard navigation, and reduced-motion/no-JavaScript paths remain usable.
- Drafts are absent from production routes, navigation, metadata, filters, and assets. Any approved publication or withdrawal has been checked with an actual rebuilt output.
- Source/image changes and validation evidence are reviewable in Git. Approving design, approving publication, merging a PR, and deploying a site remain separate decisions.
