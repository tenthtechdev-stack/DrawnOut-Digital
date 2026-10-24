# Maintaining the portfolio with Codex

Portfolio content lives in `src/content/projects/*.json`; optimized images live in `src/assets/portfolio/`. One record supplies its Work card, category filters, case-study page, gallery and previous/next navigation. `featured` and `featuredOrder` also place it into the homepage's reusable editorial slots. Adding a project requires a record and images, without a new page or manual navigation entry. There is no custom admin dashboard.

## Current display approval

The client’s **Signature Website Development / The DrawnOut Loop**, section 3, and consolidated master brief section F explicitly approve the supplied artwork and project names for public visual display. All **11 existing structured records** now have that approval recorded in `displayApproval.source`, with `status: "published"`, `visibility: "public"` and `publicationApproved: true`. Their public routes are `/work/<slug>` in development and production output.

This approval does **not** verify commissioning, credit, services, dates, results or narrative. All 11 retain `projectType: "unknown"`, `creditApproved: false`, `contentVerified: false` and `services: []`. No client relationships, credits, metrics or case-study narrative were added. Visible summaries, overviews, categories, alternatives and captions describe the artwork.

The original archive remains 15 folders / 46 unchanged PNGs. See [the current publication audit](SIGNATURE_PORTFOLIO_AUDIT.md) and [the historical derivative manifest](PHASE_3_ASSET_AUDIT.md). The older phase documents record the approval state at that time; this document describes the current workflow.

## Add a future draft

1. Supply original artwork, its source, intended name/slug and any factual evidence. Stage future originals under `design-assets/project-sources/<slug>/`; preserve the fixed `design-assets/portfolio-originals/` archive unchanged. Originals stay outside `public/`.
2. Inspect the actual artwork. Create optimized derivatives under `src/assets/portfolio/` without upscaling or altering mark proportions. Record original paths, crop bounds and encoding decisions in `assetSource` and an asset audit.
3. Create `src/content/projects/<slug>.json`. Paths are relative to the record. Supply an accurate visual summary, useful alternatives, observed categories and gallery compositions.
4. Keep new content private: `status: "draft"`, `visibility: "private"`, `publicationApproved: false`, `displayApproval: { "state": "pending" }`. Keep `projectType: "unknown"`, `creditApproved: false`, `contentVerified: false` and empty `services` until the corresponding facts are confirmed.
5. Validate with the commands below. The development-only route `/_preview/work/<slug>` previews unapproved records. Public `/work` and homepage always use the public selector, even during development. Private preview neighbors stay within the unapproved set.
6. Commit the record, images, provenance and review evidence to a review branch. Do not deploy without separate authorization.

Example **draft-shaped documentation record**, not a real new project or permission to relabel the example artwork:

```json
{
  "title": "Example draft — documentation only",
  "slug": "example-review",
  "summary": "Documentation example using supplied packaging artwork.",
  "status": "draft",
  "visibility": "private",
  "projectType": "unknown",
  "publicationApproved": false,
  "displayApproval": { "state": "pending" },
  "creditApproved": false,
  "contentVerified": false,
  "services": [],
  "categories": ["packaging"],
  "workOrder": 12,
  "presentation": "wide",
  "featured": false,
  "cover": "../../assets/portfolio/bunzo-applications.webp",
  "coverAlt": "Bunzo packaging presentation.",
  "gallery": [],
  "assetSource": "Documentation fixture only; supplied Bunzo artwork is not a new project."
}
```

## Edit, reorder and compose

The [shared schema](../src/lib/project-schema.ts) defines the typed record; [portfolio helpers](../src/lib/portfolio.ts) provide ordering, filters and neighbors.

| Field                                                                                         | Editing rule                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`, `slug`                                                                               | Truthful display name and stable lowercase URL slug. Changing a live slug would require a redirect plan.                                                                     |
| `summary`, `overview`                                                                         | Observational visual description. Do not insert a client brief, engagement or result without evidence.                                                                       |
| `categories`                                                                                  | Unique `identity`, `packaging`, `digital`, `print` values describing visible artwork formats, not commissioned services.                                                     |
| `workOrder`                                                                                   | Work and previous/next ordering; lower first, falling back to `featuredOrder`, then slug.                                                                                    |
| `featured`, `featuredOrder`                                                                   | Homepage selection and ordering. Shared slots preserve the editorial composition; additional records render through the same component.                                      |
| `presentation`                                                                                | Work composition: `wide`, `split`, `portrait`, `offset`.                                                                                                                     |
| `cover`, `coverAlt`                                                                           | Optimized local cover and accurate alternative text. Intrinsic dimensions reserve layout space.                                                                              |
| `gallery`                                                                                     | Ordered `{src, alt, caption?, layout?}`. `full` is wide, `inset` is narrower, consecutive `pair` images share a row and stack on mobile. Duplicate hero sources are omitted. |
| `assetSource`                                                                                 | Immutable-original paths and derivative provenance. Retain historical source statements; current permission belongs in `displayApproval`.                                    |
| `displayApproval`                                                                             | `pending`, `approved` or `withdrawn`; an approved state requires a nonempty human approval source. This records authorization, not proof of legal status.                    |
| `status`, `visibility`, `publicationApproved`                                                 | Release switches; all must allow publication in addition to display approval.                                                                                                |
| `projectType`                                                                                 | `unknown`, `client`, `concept` or `internal`. Unknown remains valid for visual display and is never rendered as a client claim.                                              |
| `contentVerified`                                                                             | Separate factual verification. Never set true merely because artwork display was approved.                                                                                   |
| `creditApproved`                                                                              | Separate attribution approval. Does not grant artwork display approval.                                                                                                      |
| `challenge`, `concept`, `approach`, `services`, `deliverables`, `results`, `year`, `industry` | Factual fields render only when `contentVerified` is true. Results also require an evidence source.                                                                          |
| `clientName`, `role`, `projectType`, `credits`                                                | Attribution requires both `contentVerified` and `creditApproved`; missing/unknown values stay omitted.                                                                       |
| `seoTitle`, `seoDescription`                                                                  | Optional metadata rendered only after both factual and attribution approval. Before that, public metadata uses the approved visual title and summary.                        |

A new record can be added, edited, moved in Work, featured on the homepage or withdrawn without changing a page component. Keep the approved curation unless a content update authorizes changes. The separate future showreel/video plan remains deferred.

## Publish approved artwork

All public consumers use `getPublicProjects()` / `getPublicWorkProjects()`. `canPublish()` requires:

```text
status === "published"
visibility === "public"
publicationApproved === true
displayApproval.state === "approved"
displayApproval.source contains the actual human authorization reference
```

Apply these values only after the user authorizes visual display. Record the scope of that approval. Leave unknown factual/attribution fields unverified; an approved visual case does not need invented services or a client classification. `contentVerified` and `creditApproved` are deliberately absent from the **visual** publication gate.

The loader applies this gate before storing records and registering their image imports, so production cannot recover excluded draft imagery through Astro's generated image map. Homepage, Work filters, case routes and neighbors all use the same eligible set. The independent case template suppresses unverified facts and unapproved attribution.

## Withdraw or return to draft

Set `displayApproval.state: "withdrawn"` when visual permission is withdrawn; retain the approval history/source and record the reason. That state blocks publication even if status/public flags remain set. For a routine editorial draft, set `status: "draft"` and `visibility: "private"`. Clearing `publicationApproved` also blocks release. Rebuild and verify the route, all public links, category contributions and unique imagery disappear.

An image shared with another still-approved project can remain in output legitimately. Private-only images must disappear. Source edits do not purge a prior deployment or external cache; a live rollback would require its separately authorized deployment workflow. This milestone does not deploy.

## Validation

```sh
npm run check
npm run lint
npm test
npm run build
npm run test:build
npm run test:publication
npm run format:check
```

`npm run verify` combines check, lint, unit tests and build. `test:build` inspects actual production output, public case links and suppression of unverified facts. `test:publication` uses a disposable source copy and a clearly synthetic record with a unique test-only derivative. Four builds prove visual-only publication, independent factual verification, independent attribution approval and display-permission withdrawal. A second pending synthetic project remains excluded throughout, including its image imports. Real records and originals are untouched.

Run build/check before starting development, or restart development afterward, because Astro's generated content/image maps differ by mode. Do not bypass the loader to work around cached development state.

To preserve historical screenshots, run browser tests from a temporary directory:

```sh
mkdir -p /tmp/drawnout-portfolio-review
cd /tmp/drawnout-portfolio-review
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-portfolio-review/test-results
```

Tests cover public cards/cases, filters/history, previous/next links, keyboard, reduced motion and no JavaScript. Report actual results; a build alone is not visual approval.

## Repeatable Codex instruction

> Add or edit a portfolio draft using the artwork and verified information supplied. Preserve originals, create optimized local derivatives and update one canonical typed record. Describe visible artwork without inventing client scope, services, credits, dates or outcomes. Use existing category, ordering, homepage-feature and gallery fields; do not create a bespoke page or admin UI. Keep display permission pending/private and factual/credit verification false unless I explicitly authorize those distinct changes. Validate the draft preview, public exclusion, responsive media, navigation and production build. Return review evidence without merging or deploying.
>
> Name / slug; source paths; observed formats; desired order; display approval reference or pending; verified facts/attribution with evidence or unknown.
