# DrawnOut Digital

The **DrawnOut Loop / signature experience** extends approved Afterglow through Phase 4 on `feature/drawnout-signature-experience`, based on `main` at `0ef900b72132f4ab1069da6b824cb1facfe2c95e`.

[Visual gallery and recordings](artifacts/signature/README.md) · [Implementation handoff](docs/SIGNATURE_HANDOFF.md) · [Validation](docs/SIGNATURE_VALIDATION.md) · [Asset process and production requirements](docs/SIGNATURE_ASSET_PROCESS.md)

The opening, living gradient, selected SplitText/ScrollTrigger choreography, immersive portfolio image, public portfolio routes and stable mobile navigation are implemented. The shared opening/footer hand is an **intact supplied-reference prototype**, not a newly rigged 3D hand. Independent gripping, emblem descent and changing occlusion remain production asset requirements. The included Blender scene is a reproducible glass/material study, clearly identified in the gallery.

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
mkdir -p /workspace/signature-review
cd /workspace/signature-review
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --workers 1 --output /workspace/signature-review/test-results
```

Coverage includes responsive layouts, public portfolio links, navigation/filter history, no-JavaScript and failure fallbacks, intro deadlines/session/skip controls, native reversible text/image/footer scrolling, shader activity and pointer handling, mobile header stability and axe WCAG scans. Automated scans are not a claim of comprehensive accessibility or physical-device performance certification.

## Review evidence

```sh
node scripts/capture-signature.mjs --out /workspace/signature-review/artifacts/signature
```

Keep the watched repository quiet during capture; live reload invalidates continuous recordings. The utility captures real Chromium compositor frames and native scrolling, then encodes H.264 MP4/GIF previews with FFmpeg. `--stills-only` captures PNG states; `--recordings-only` retains an existing still manifest and records both complete journeys. `CHROMIUM_PATH`, `FFMPEG_PATH` and `MOTION_BASE_URL` are configurable.

The asset process includes original-byte verification, transparent reference conversion, a packed Blender source scene and a reproducible CPU render. No unrelated stock hand or fabricated vector emblem is used.

## Portfolio updates

[Codex portfolio workflow](docs/PORTFOLIO_WORKFLOW.md) covers adding, editing, ordering, publishing and withdrawing projects. A typed record and image files drive all cards, filters and case pages; no manual per-page editing is required.

- Display release requires `status: published`, `visibility: public`, `publicationApproved: true` and explicit `displayApproval.state: approved` with provenance.
- These release fields do not verify client relationships, services, credits, dates or outcomes. Factual and attribution gates remain separate; free-form SEO overrides require both reviews.
- Withdrawal or future draft status prevents route generation and image registration in production, including cached collection imports.
- Artwork categories describe visible formats. Source folders remain preserved; miscellaneous/internal boards are not invented client projects.

Earlier evidence remains available: [Phase 4](artifacts/phase-4/README.md), [Phase 3](artifacts/phase-3/README.md), [Phase 2](artifacts/phase-2/README.md), [Phase 1](artifacts/phase-1/README.md), and [Phase 0](artifacts/README.md). The [signature brief](docs/SIGNATURE_EXPERIENCE_BRIEF.md) supersedes conflicting earlier animation proposals; the original master pack remains in `docs/source-pack/`.
