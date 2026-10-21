# Phase 3 — Work and case-study system

Phase 3 extends the approved Afterglow website with an editorial Work index and reusable project detail system. Branch `phase3/editorial-portfolio` starts from the verified Phase 2 merge commit `b3dc19602963a86b55942294ee85d7fd025d1dc6`. The approved homepage composition, hero, five featured images, typography tokens, and static footer are preserved.

## Work experience

`/work` combines the original “The work speaks. We'll let it.” introduction with large panoramic images, a staggered split/portrait pairing, offset presentations, numbered captions, and an enquiry invitation through the existing shared footer. Each card is one ordinary keyboard-focusable link. Hover/focus cues use small transformations, with a static reduced-motion path.

Filters and counts derive from the eligible records' observed artwork categories: Identity, Packaging, Digital, and Print. These categories describe presentation formats; they do not establish commissioned services. Buttons expose pressed state and a live result count, preserve category selection in the URL, and support browser back/forward. Without JavaScript, filters stay hidden and the complete eligible index remains usable.

Work ordering uses `workOrder`, falling back to the existing featured order and then slug. It is independent of homepage curation. `presentation` selects wide, split, portrait, or offset composition; filtering reflows the visible cards coherently.

## Shared case-study template

`CaseStudy.astro` supplies title/intro, responsive hero, visual overview, conditional factual narrative, gallery compositions, previous/next navigation, and the common enquiry/footer. `CaseGallery.astro` supports full-width, alternating inset, and paired media from ordered JSON data. It removes duplicate image sources, including a repeated hero.

Portrait and landscape artwork receive different hero compositions. Intrinsic image dimensions reserve space; the hero loads eagerly and later artwork loads lazily. Responsive WebP candidates stay within source dimensions. The stills are supplied artwork, with no invented footage or fake play controls.

Unknown challenge, concept, approach, client, date, role, services, deliverables, credits, and outcomes are omitted. The template renders those fields only when `contentVerified` is explicitly true and the corresponding field exists. The current records contain observed visual descriptions, not fabricated briefs, service scopes, or achievements.

Previous/next links use the same eligible, ordered collection as their parent route; public navigation cannot borrow private drafts. A single eligible project does not link to itself.

## Content and publication integrity

The collection now contains 11 private drafts. Capture, Khalo, FK Technology, and U Wanna Smoothie demonstrate adding projects through records and images without creating bespoke page components. All records retain unknown commissioning status, false publication/credit approvals, false factual verification, and empty services arrays.

All 15 folders / 46 original PNGs were reviewed and preserved. Twenty-six additional WebPs total 2,040,058 bytes; the existing Phase 2 covers and original gallery entries remain intact. The [asset audit](PHASE_3_ASSET_AUDIT.md) identifies all sources, crop coordinates, dimensions, sizes, and excluded/reserved material.

Development review routes use `/_preview/work/<slug>`. Astro ignores underscore-prefixed page directories, so the implementation uses `src/pages/[preview]/work/[slug].astro` and generates only the explicit `_preview` parameter in development. Production generates only approval-filtered `/work/<slug>` routes. The development server must remain private; noindex is not authentication.

The publication gate remains unchanged: published status, public visibility, publication approval, credit approval, and known client/concept/internal provenance are all required. `contentVerified` is a separate factual-display gate and does not grant publication rights.

Astro's collection image-import map can include assets from rejected records even after route filtering. `project-loader.ts` therefore gates collection storage before image registration. It validates records through the shared schema, stores drafts only in the watcher-backed development pipeline, and rebuilds the collection for standalone checks/builds from eligible public records. Clearing prior stored entries prevents revoked/development records from retaining cached asset imports. Public selectors remain a second approval check.

The ordinary production build currently has six foundation routes and no unapproved project pages or artwork. The isolated publication-workflow test exercises a synthetic approved case, factual verification, and withdrawal through real builds without changing any actual approval flags. See [validation](PHASE_3_VALIDATION.md) for observed outcomes.

## Maintaining and extending the system

[Portfolio workflow documentation](PORTFOLIO_WORKFLOW.md) explains adding, editing, reordering, publishing, and withdrawing projects, with a complete schema reference and Codex prompt. Future original uploads belong under `design-assets/project-sources/<slug>/`, separate from the immutable historical archive. Optimized media and one canonical record drive cards, filters, pages, and navigation. No admin dashboard is introduced.

Future motion boundaries are explicit: `data-text-reveal`, `data-image-reveal`, `data-expansion-frame`, project scenes, and project-transition links. Native scrolling and ordinary navigation remain. No GSAP, scroll pinning, cinematic transitions, or signature-footer animation is included in Phase 3.

## Review and outstanding inputs

Open [the Phase 3 gallery](../artifacts/phase-3/README.md) for Work and representative Bunzo/Triarch detail views, including mobile, tablet, desktop, filters, heroes, and galleries. [Validation results](PHASE_3_VALIDATION.md) report checks and limitations. Historical galleries remain preserved.

Required before actual portfolio publication: confirmed project classification, DrawnOut role/services, permitted imagery, credits, factual narratives and outcome evidence, and human publication approval. Actual videos/captions and final brand/footer masters remain future inputs. Contact delivery, legal details, device-level launch audits, deployment, and the cinematic motion system remain later work.

**Stop after Phase 3 for visual approval. Do not merge, deploy publicly, or begin the cinematic motion phases automatically.**
