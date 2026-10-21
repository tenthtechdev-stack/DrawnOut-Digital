# DrawnOut Digital

**Phase 2 review:** [Open the Afterglow homepage storytelling gallery](artifacts/phase-2/README.md). Work is isolated on `phase2/afterglow-storytelling` from asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`. [Phase 2 handoff](docs/PHASE_2_HANDOFF.md) describes the scope and review boundary.

**Approved Phase 1 archive:** [Open the Afterglow screenshot gallery](artifacts/phase-1/README.md) for the original 390px, 768px, and 1440px full-page and component views, including the mobile menu.

**Design review:** [Open the Phase 0 screenshot gallery](artifacts/README.md). All four full-resolution desktop/mobile concepts render directly on GitHub. [Publishing recovery notes](docs/PUBLISHING_RECOVERY.md) explain the preserved checkpoint.

[Historical publishing validation](docs/PUBLISHING_VALIDATION.md) records the earlier recovery checkpoint. [Phase 2 validation](docs/PHASE_2_VALIDATION.md) records the current implementation checks.

Phase 2 homepage storytelling for the supplied DrawnOut Codex Master Pack v1.0, extending the approved **A — Afterglow** desktop/mobile foundation. Astro 7, strict TypeScript, Tailwind 4, and Git-backed Astro Content Collections. Motion, published case studies, and contact delivery remain later phases.

## Develop

Use Node 24 (minimum 22.22) and npm. No credentials or external services are needed.

```sh
cd /workspace/drawnout-digital
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 4321
```

The existing checkout is already isolated for a cloud task; use it directly. Do not create a Git worktree unless explicitly requested. Live processes must be restarted after a restored environment.

Development opens the Phase 2 homepage at `/`, with five original-derived portfolio previews, studio philosophy, service propositions, strategic approach, four-step process, ideal-client positioning, and the retained static footer. `/work`, `/services`, `/about`, and `/contact` remain minimal route foundations. The Phase 0 studies remain at `/concepts/a` and `/concepts/b` for reference. Core content and fallback navigation work without browser JavaScript. Keep development access local/private: noindex is an indexing hint, not authentication. No publicly deployed development preview is authorized.

All four Astro entry scripts use maintained `cross-env` to set telemetry configuration on Windows PowerShell/npm and Linux. Keep Node 24 or a supported Node version (minimum 22.22). Linux entry points and environment/exit-code propagation were verified; an actual Windows/PowerShell execution is not available in this cloud machine.

`npm run build` generates six noindex foundation routes: Home, Work, Services, About, Contact, and 404. It excludes concept pages, draft case routes, and draft portfolio media. The production Work foundation shows an intentional empty state until publication approvals exist. `npm run preview` serves this safe build. Nothing has been deployed.

## Checks

```sh
npm run verify
npm run test:build
npm run test:browser
npm run format:check
```

`verify` runs Astro type checks, ESLint, content/contrast/original-asset tests, and a production build in sequence. `test:build` inspects all built pages and text/assets for draft leakage. The browser suite includes retained concept/navigation checks plus Phase 2 text, image art-direction, responsive, keyboard, and no-JavaScript/reduced-motion coverage. Phase 2 captures are produced at 390, 768, and 1440px, with additional overflow checks at 320 and larger desktop widths.

Browser screenshot paths are relative to the runner working directory. To preserve committed Phase 0/1 screenshots, run the existing suite from a temporary output directory with the repository configuration, then copy only the Phase 2 outputs into `artifacts/phase-2/`. See `docs/PHASE_2_VALIDATION.md` for the exact validation invocation. Avoid treating regenerated old-phase captures as historical evidence.

The cloud machine provides Chromium at `/usr/bin/chromium`. Set `CHROMIUM_PATH` to another installed Chromium executable elsewhere; the package does not download a browser implicitly. Browser checks do not establish iOS Safari/Android hardware performance, WCAG conformance, or production Core Web Vitals.

## Content and media

- `src/content/projects/*.json` is the single source of project metadata. Seven supplied records are all draft/private, unknown commissioning status, and have no publication or credit approval.
- `src/lib/project-schema.ts` validates safe slugs, descriptive media alternatives, provenance, and evidence-backed results. `canPublish` requires published + public + publication approval + credit approval + a known project type. These flags record human decisions; they cannot establish rights by themselves.
- All future public routes, related work, filters, feeds, and sitemaps must consume `getPublicProjects()` from `src/lib/projects.ts`. Do not query raw collection records in public features.
- `getDraftPreviewProjects()` only returns data in development. Preview route modules use development-only imports to keep draft artwork out of the production asset graph.
- `MediaSlot.astro` reserves dimensions, creates responsive WebP images, and labels temporary stills. There are no fake play buttons or implied videos. Final video controls/source switching belong to the later media phase.
- Existing supplied WebPs remain preserved alongside the new original-derived portfolio media. The supplied raster logo is displayed with CSS whitespace framing on a light background; its proportions, lettering, and colors are preserved.

The authoritative original portfolio is `design-assets/portfolio-originals/` (15 folders, 46 PNGs) from the supplied asset commit. Phase 2 creates 11 WebP derivatives under `src/assets/portfolio/` without changing originals; see [the complete asset audit](docs/PHASE_2_ASSET_AUDIT.md). The canonical draft records now reference those derivatives. Panoramic desktop details switch to full-context boards on mobile, with reserved responsive aspect ratios. Image candidate widths never exceed the source width. `MediaSlot` accepts optional approved MP4/WebM/caption sources for later replacement, with native controls and a retained poster; absent/unapproved video sources render only the still, with no fake play button or autoplay.

Manrope is locally served under the SIL Open Font License, included in `licenses/`. Shared spacing, type, surface, contrast, and interaction tokens live in `src/styles/global.css`; bright orange is atmospheric while strong orange supports readable text. The header, buttons, hero, capability index, section headings, project cards, route intro, and static footer are reusable components. GSAP remains deferred to the motion phases.

## Review and next phase

See [Phase 2 handoff](docs/PHASE_2_HANDOFF.md), the earlier [Phase 1 handoff](docs/PHASE_1_HANDOFF.md) and [Phase 0 handoff](docs/PHASE_0_HANDOFF.md), [asset audit](docs/ASSET_AUDIT.md), and the unmodified original briefs in `docs/source-pack/`. Current design evidence lives in `artifacts/phase-2/`; earlier galleries remain preserved.

Afterglow is approved for desktop and mobile. Phase 2 now awaits visual review; do not begin Phase 3 or merge/deploy without explicit approval. The static footer has independent artwork/content layers, the hero has semantic line groups, and portfolio scenes have separate expansion frames for later motion. No cinematic timeline or hand/logo animation is implemented. Project rights, service scope, final brand masters, contact/domain/social details, forms/privacy, and real videos still need confirmation before publication.

The dedicated branch and GitHub review gallery are authorized for publication. Merging, public application deployment, contact delivery, and analytics integration remain outside this phase.
