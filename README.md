# DrawnOut Digital

**Phase 4 review:** [Open the cinematic motion gallery](artifacts/phase-4/README.md), including actual desktop/mobile recordings and expansion states. [Draft PR #3](https://github.com/tenthtech/drawnout-digital/pull/3) is open for review. Branch `phase4/cinematic-motion` extends the approved Phase 3 merge `8ae8de991b6768564b92b61ed4078d3e84a9a731`. See [the motion handoff](docs/PHASE_4_HANDOFF.md), [validation](docs/PHASE_4_VALIDATION.md), and [Codex portfolio workflow](docs/PORTFOLIO_WORKFLOW.md).

The approved **Afterglow** layouts, copy, typography and portfolio publication gates are preserved. Earlier galleries remain available: [Phase 3](artifacts/phase-3/README.md), [Phase 2](artifacts/phase-2/README.md), [Phase 1](artifacts/phase-1/README.md), and [Phase 0](artifacts/README.md). Original briefs remain unchanged in `docs/source-pack/`.

Astro 7, strict TypeScript, Tailwind 4, locally licensed Manrope, and typed Git-backed project collections. GSAP 3.15.0 with ScrollTrigger supplies reusable scroll choreography; CSS animates the hero atmosphere. There is no custom admin dashboard. The signature hand/logo footer, video planning, actual portfolio publication, and contact delivery remain later work.

## Develop

Use Node 24 (minimum 22.22) and npm. Local development requires no external service credentials.

```sh
cd /workspace/drawnout-digital
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 4321
```

Use the existing isolated cloud checkout; do not create a Git worktree unless explicitly requested. Restart live processes after an environment restore.

Development preserves the approved homepage at `/`. `/work` presents the editorial portfolio with category filters, and `/_preview/work/<slug>` provides reusable private detail previews. Eleven canonical records drive these views; no per-project page code is needed. `/services`, `/about`, and `/contact` remain route foundations. `/concepts/a` and `/concepts/b` preserve the initial studies. Core content and fallback navigation work without JavaScript.

Keep the development server local/private: noindex is an indexing hint, not access control. A public application preview is not authorized. Only the branch, PR, and review gallery are authorized for publication.

All four Astro entry scripts use maintained `cross-env` for Windows PowerShell and Linux. Linux behavior is verified; native Windows execution is unavailable in this cloud machine.

`npm run build` currently emits six noindex routes: Home, Work, Services, About, Contact, and 404. It excludes concepts, private previews, unapproved case routes, metadata, and artwork. Production Work has an intentional empty state until publication approvals exist. Approved records automatically generate Work cards, filters, `/work/<slug>` pages, and case navigation. `npm run preview` serves this safe build. Nothing has been deployed.

Run standalone checks/builds before starting development, or stop and restart the development server afterward. The publication-aware loader intentionally generates different public/development image-import maps in Astro's content directory; restarting restores the complete local review collection after a mode change.

## Validate

```sh
npm run verify
npm run test:build
npm run test:publication
npm run format:check
```

`verify` combines Astro/TypeScript checks, ESLint, unit/content/contrast/original-asset tests, and a production build. `test:build` inspects output for draft leakage. `test:publication` makes three isolated builds with a synthetic record to verify automatic case generation, factual-content gating, and withdrawal; real project approvals are untouched.

The browser suite covers retained homepage/navigation behavior, Work filters and URL history, case navigation, responsive images, keyboard use, no JavaScript, reduced motion, reversible expansion, stable geometry, initialization cleanup and failed-library fallback. To preserve archived screenshots, run it from a temporary directory using the absolute repository config, then copy only current Phase 4 captures into `artifacts/phase-4/`. See [validation](docs/PHASE_4_VALIDATION.md) for the exact invocation. `npm run test:browser` is available, but its screenshot paths are relative to the command's working directory.

Chromium is installed at `/usr/bin/chromium`; set `CHROMIUM_PATH` for another executable. Browser packages do not download a browser implicitly. Recorded checks do not establish hardware Safari/Android performance, comprehensive WCAG conformance, or production Core Web Vitals.

To reproduce actual motion recordings, start the private development server after standalone checks, then run:

```sh
node scripts/capture-motion.mjs --out /tmp/drawnout-phase4-review/artifacts/phase-4
```

Keep the watched repository unchanged during recording: a Vite reload invalidates a continuous capture. The script fails visibly and closes its encoder on interruption. For the same unchanged implementation, `--recordings-only` retries both whole recordings from the saved screenshot manifest; `--previews-only` rebuilds GIF derivatives from completed MP4s.

The capture script uses real Chromium compositor frames and native page scrolling, then encodes compact H.264 MP4s and GIF excerpts with `/usr/bin/ffmpeg`. Set `FFMPEG_PATH`, `CHROMIUM_PATH`, or `MOTION_BASE_URL` when needed. It also writes PNG expansion states and a machine-readable measurement manifest in the output directory. These recordings show development-only draft art; they do not approve it for production.

## Content and media

- `src/content/projects/*.json` is canonical. All eleven current records are private drafts, with unknown commissioning status, false publication/credit/factual approval, and empty services.
- `project-schema.ts` validates safe slugs, descriptions, source provenance, categories, image compositions, and evidence-backed outcomes. `canPublish` requires published + public + publication approval + credit approval + known project type. Flags record human decisions; they cannot establish rights themselves.
- Public consumers use `getPublicProjects()` / `getPublicWorkProjects()`. Draft selectors and route imports are development-only. `project-loader.ts` also gates entries before Astro registers image assets and clears prior cached entries; route filtering alone cannot protect Astro's collection-wide asset map.
- Artwork categories describe visible formats, separately from confirmed service scope. Case facts, narratives, services, credits, and results render only when `contentVerified` is explicitly true and corresponding fields exist.
- `workOrder` controls the index and previous/next independently of approved homepage curation. `presentation` and gallery `layout` configure composition through the record.
- `MediaSlot` reserves responsive geometry and generates source-capped WebP candidates. Current views use supplied stills without fake video controls or autoplay. Its optional approved-video interface remains ready for later footage.

The immutable original archive contains 15 folders / 46 PNGs. Phase 3 adds 26 WebPs alongside the 11 Phase 2 derivatives; see [the asset audit](docs/PHASE_3_ASSET_AUDIT.md). Future originals belong under `design-assets/project-sources/<slug>/`, outside the historical archive and `public/`. [The portfolio workflow](docs/PORTFOLIO_WORKFLOW.md) documents adding, editing, ordering, publishing, and withdrawing projects with Codex.

The supplied raster logo retains its proportions and light-background framing. Manrope's SIL Open Font License is in `licenses/`. Shared design tokens remain in `src/styles/global.css`. The motion layer animates selected editorial text and reserved media surfaces independently of captions and layout. It keeps native scrolling and navigation, restores static content on cleanup/failure, and disables choreography for reduced motion or data saving. The footer remains static.

## Review boundary

Phase 3 is approved and merged. Phase 4 stops for motion review. Do not merge, deploy publicly, or begin Phase 5 automatically. Project rights, verified scope/credits/outcomes, final brand/footer masters, videos/captions, contact/domain/social details, and forms/privacy still require the corresponding approvals before release.
