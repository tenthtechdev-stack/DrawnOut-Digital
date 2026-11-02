# DrawnOut Digital

The **About brand-story experience** is under review on `feature/about-brand-story-experience`, based on main `05cefd16292656289889d558a31bb8249418eb63`. [About gallery and recordings](artifacts/about/README.md) · [About handoff](docs/next-milestone/ABOUT_PAGE_HANDOFF.md) · [Observed validation](docs/next-milestone/ABOUT_PAGE_VALIDATION.md) · [Portfolio rhythm gallery](artifacts/portfolio-rhythm/README.md). The approved derived sketch is public review artwork; the original personal photograph remains private. Earlier milestone notes follow.

The **Contact page** is ready for review on `feature/contact-page`, based on the approved signature work merged into `main` in PR #4. [Contact gallery](artifacts/contact/README.md) · [Validation](docs/CONTACT_VALIDATION.md) · [Formspree owner setup](docs/CONTACT_HANDOFF.md). No form endpoint is configured yet; the page offers direct email contact and does not claim live enquiry delivery.

The **DrawnOut Loop / signature experience** extends approved Afterglow through Phase 4 on `feature/drawnout-signature-experience`, based on `main` at `0ef900b72132f4ab1069da6b824cb1facfe2c95e`.

[Current opening gallery and recordings](artifacts/signature-opening/README.md) · [Revision handoff](docs/OPENING_REVISION_HANDOFF.md) · [Revision validation](docs/OPENING_REVISION_VALIDATION.md) · [Asset process and production requirements](docs/SIGNATURE_ASSET_PROCESS.md)

The PR #4 correction gives DrawnOut an oversized lower-left wordmark, with its progressive wipe synchronized to the project wave. The empty hand and actual approved illuminated plaque now move independently into the supplied final pose. This is a **separated raster prototype**, not completed photorealistic 3D: the fixed pinch, baked lighting and missing plaque edges require production assets. The shared footer uses the same two layers and reversible expansion. The living gradient, editorial motion, public portfolio and stable navigation remain part of the implementation. Opening visual approval is still pending; the included Blender scene remains a material study, not a hand rig.

Astro 7, strict TypeScript, Tailwind 4, locally hosted Manrope and GSAP 3.15.0 remain the architecture. The hero shader has no WebGL framework dependency. Native scrolling, reduced motion, data saving and static/no-JavaScript fallbacks remain supported. No custom admin, agency showreel, public deployment or automatic merge is included.

## Develop

Use Node 24 (minimum 22.22) and npm:

```sh
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 4321
```

The homepage, `/work` and eleven `/work/<slug>` pages use the same structured project collection. The client approved supplied visual artwork and names; commissioning status remains unknown, factual/credit approval remains false, and unverified claims are omitted. Future drafts stay in development-only `/_preview/work/<slug>` routes. Original concepts remain development-only. Production emits 17 static routes with the currently approved records.

The application remains local/private until deployment is explicitly approved. `noindex` is an indexing hint, not access control. GitHub branch/PR evidence is the review delivery.

## Validate

Run checks before starting development, or restart the dev server afterward: Astro's publication-aware image map differs between build and development modes.

```sh
npm run verify
npm run test:build
npm run test:publication
npm run format:check
```

`verify` includes Astro/TypeScript, ESLint, unit tests and the production build. Output checks verify public routes and factual safeguards. Publication integration makes four isolated builds covering visual-only approval, factual verification, attribution verification and permission withdrawal, with unique synthetic media and a future unapproved record. Actual project records are never changed by those tests.

With development running, execute browser tests from a separate working directory to preserve historical screenshots:

```sh
mkdir -p /workspace/opening-review
cd /workspace/opening-review
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --workers 1 --output /workspace/opening-review/test-results
```

Coverage includes responsive layouts, public portfolio links, navigation/filter history, no-JavaScript and failure fallbacks, intro deadlines/session/skip controls, native reversible text/image/footer scrolling, shader activity and pointer handling, mobile header stability and axe WCAG scans. Automated scans are not a claim of comprehensive accessibility or physical-device performance certification.

## Review evidence

```sh
node scripts/capture-signature.mjs --out /workspace/opening-review/artifacts/signature-opening
```

Keep the watched repository quiet during capture; live reload invalidates continuous recordings. The utility captures real Chromium compositor frames and native scrolling, then encodes H.264 MP4/GIF previews with FFmpeg. `--stills-only` captures PNG states; `--recordings-only` retains an existing still manifest and records both complete journeys. `CHROMIUM_PATH`, `FFMPEG_PATH` and `MOTION_BASE_URL` are configurable.

The asset process includes original-byte verification, lossless reference conversion and reproducible complementary hand/plaque masks. A separate historical Blender source scene provides a material study only. No unrelated stock hand or fabricated vector emblem is used. The [earlier signature gallery](artifacts/signature/README.md) remains available for comparison, with its original validation clearly marked historical.

## Portfolio updates

[Codex portfolio workflow](docs/PORTFOLIO_WORKFLOW.md) covers adding, editing, ordering, publishing and withdrawing projects. A typed record and image files drive all cards, filters and case pages; no manual per-page editing is required.

- Display release requires `status: published`, `visibility: public`, `publicationApproved: true` and explicit `displayApproval.state: approved` with provenance.
- These release fields do not verify client relationships, services, credits, dates or outcomes. Factual and attribution gates remain separate; free-form SEO overrides require both reviews.
- Withdrawal or future draft status prevents route generation and image registration in production, including cached collection imports.
- Artwork categories describe visible formats. Source folders remain preserved; miscellaneous/internal boards are not invented client projects.

Earlier evidence remains available: [Phase 4](artifacts/phase-4/README.md), [Phase 3](artifacts/phase-3/README.md), [Phase 2](artifacts/phase-2/README.md), [Phase 1](artifacts/phase-1/README.md), and [Phase 0](artifacts/README.md). The [signature brief](docs/SIGNATURE_EXPERIENCE_BRIEF.md) supersedes conflicting earlier animation proposals; the original master pack remains in `docs/source-pack/`.
