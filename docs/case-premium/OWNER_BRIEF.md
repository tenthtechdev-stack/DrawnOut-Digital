# DrawnOut Digital — Proceed to Stage 2: Premium Project Case Studies

## Owner approval and authorization

The owner has reviewed the latest Work Stage 1 implementation on the live Netlify preview:

https://drawnoutdigital.netlify.app/work/

**Stage 1 visual approval is now granted. You are authorized to proceed with Stage 2 development.**

This approval covers the visual direction of the Work index. It does not constitute physical-device testing, approval of unverified portfolio claims, or authorization for production launch.

Do not repeat the Stage 1 approval process or wait for another confirmation before starting Stage 2.

## Current development context

**Development repository:** https://github.com/tenthtech/drawnout-digital

**Latest completed branch:** `feature/work-immersive-index`

**Verified commit:** `e3c0f3bf8ad90fb3f6e690828d160fd31ca8a01e`

**Current PR:** https://github.com/tenthtech/drawnout-digital/pull/18

**Stage 2 requirements:**

- https://github.com/tenthtech/drawnout-digital/issues/15
- https://github.com/tenthtech/drawnout-digital/issues/17

Review these issues and the existing repository documentation before implementation.

The Stage 1 preview is accessible and its HTML and application JavaScript have been verified against the local build. The separate Netlify mirror repository remains inaccessible through the available GitHub connection. Do not claim the mirror commit or deployment record has been verified.

## 1. Establish the Stage 2 branch

Fetch and verify the current remote state.

If PR #18 remains unmerged, create a new branch from its latest verified head:

`feature/work-case-studies-premium`

Open a draft pull request targeting `feature/work-immersive-index`.

Preserve the existing stacked PR history and all previous development work.

Do not merge, force-push, overwrite previous branches, or deploy automatically.

Commit and push meaningful implementation checkpoints early.

## 2. Reuse the existing case-study research

Issue #15 already contains a prepared editorial and image-mapping package.

Locate the documentation on:

`content/project-case-study-gallery-seo`

Read:

- `docs/portfolio-case-rebuild/README.md`
- `docs/portfolio-case-rebuild/IMPLEMENTATION_BRIEF.md`
- `docs/portfolio-case-rebuild/project-editorial-candidates.json`

The package contains eleven proposed project narratives, thirty-seven image placements, accessibility descriptions, gallery layouts and SEO candidates.

Bring the required documentation into the new branch without replacing newer application code.

Treat the editorial content as proposals grounded in existing artwork, not independently verified client work.

## 3. Build a premium individual project experience

The objective is to make every case-study page feel like a carefully art-directed creative presentation.

Follow the already approved DrawnOut design direction:

- Large, confident typography
- Immersive project artwork
- Sophisticated editorial layouts
- Beautifully controlled whitespace
- Responsive image mosaics
- Selective and purposeful animation
- Strong visual hierarchy
- Smooth, native scrolling
- A cohesive connection to the Work index

Avoid ordinary portfolio grids, repetitive galleries, decorative effects without purpose, or eleven identical page compositions.

Each project should feel distinctive while sharing a maintainable component architecture.

### Preferred gallery composition

Use the owner's previously supplied layout reference:

- One dominant tall visual on the left
- One wide visual at the upper right
- Two smaller visuals beneath it

Apply this composition when four genuinely suitable visual assets exist.

For projects with two or three suitable images, create alternative premium editorial layouts. Never duplicate images or fabricate artwork to fill space.

## 4. Begin with five pilot projects

Build these projects first:

**SOL Community Center:** Primary visual benchmark. Emphasize the brand system, applications, signage, and approved motion.

**Bunzo:** Test bold food identity, packaging, expressive typography, and video integration.

**Triarch:** Test minimalist typography, restrained motion, texture, and a sophisticated monochrome layout.

**Capture:** Validate an elegant three-image composition.

**By Tech Group:** Validate the two-image layout and controlled use of existing motion assets.

These five projects will establish the design quality and prove the gallery system works with different artwork quantities.

Do not immediately redesign all eleven pages.

After implementing the pilots, capture desktop and mobile screenshots, representative motion recordings, and a concise design-comparison gallery.

**Stop for owner visual approval of the five pilots before applying the system to the remaining six projects.**

## 5. Protect existing website functionality

Preserve the approved implementation of:

- Homepage and Afterglow gradient
- Homepage loader
- Work immersive index and filters
- Existing project order and navigation
- Services pages
- About page
- Contact page
- Footer and signature experience
- Six existing portfolio motion loops
- Accessibility and reduced-motion behavior

Use existing media and video controls wherever possible.

Do not introduce unnecessary animation dependencies or regenerate approved video assets.

## 6. Content and SEO safeguards

The eleven projects currently have visual-display approval only.

Keep the existing verification and attribution flags unchanged:

`contentVerified: false`

`creditApproved: false`

`projectType: unknown`

Do not invent project challenges, agency contributions, timelines, delivered services, client testimonials, statistics, outcomes or team credits.

Use concise descriptions based only on the supplied artwork.

Preserve existing publication and SEO gates and the preview-wide noindex policy.

Do not activate unapproved custom SEO candidates.

## 7. Technical implementation and testing

Work within the existing Astro and TypeScript architecture.

Review and reuse existing case-study components, content collections, video controllers, and navigation.

Prioritize maintainability, responsive image handling, accessibility, and performance.

Test layouts at 320px, 390px, 768px, 1024px and 1440px, plus larger desktop widths where practical.

Run the existing build, TypeScript, lint, formatting, unit, publication, and browser regression checks.

Verify that no Stage 2 changes break the Stage 1 immersive Work experience.

Document actual test results and corrections.

## 8. Required deliverables

At the first Stage 2 review checkpoint, provide:

1. New development branch and commit SHA.
2. Draft PR linked to the correct parent branch.
3. Five completed pilot case-study pages.
4. Desktop and mobile screenshots.
5. Representative video recordings of motion and navigation.
6. A GitHub review gallery.
7. Test and validation reports.
8. A concise summary of the design decisions.
9. Any outstanding content, media, or device-testing limitations.

Do not merge or push Stage 2 to the Netlify mirror without separate authorization.

## Final instruction

**Begin Stage 2 development now.**

The goal is not merely to populate existing templates. It is to deliver a distinctive, premium, visually immersive portfolio experience worthy of DrawnOut Digital's creative positioning.

Make the five pilot project pages exceptional, visually reviewable, and technically reliable before extending the system to the remaining projects.

Proceed with repository inspection, branch creation, implementation, testing, commits, and the draft PR. Stop at the five-pilot visual approval checkpoint.
