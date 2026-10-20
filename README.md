# DrawnOut Digital

**Design review:** [Open the Phase 0 screenshot gallery](artifacts/README.md). All four full-resolution desktop/mobile concepts render directly on GitHub. [Publishing recovery notes](docs/PUBLISHING_RECOVERY.md) explain the preserved checkpoint.

Phase 1 design foundation for the supplied DrawnOut Codex Master Pack v1.0, using the approved **A — Afterglow** direction. Astro 7, strict TypeScript, Tailwind 4, and Git-backed Astro Content Collections. This milestone is a visual review of the shared system; later storytelling, motion, case studies, and contact delivery remain separate phases.

## Develop

Use Node 24 (minimum 22.22) and npm. No credentials or external services are needed.

```sh
cd /workspace/drawnout-digital
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 4321
```

The existing checkout is already isolated for a cloud task; use it directly. Do not create a Git worktree unless explicitly requested. Live processes must be restarted after a restored environment.

Development opens the Phase 1 Afterglow foundation at `/`, including three local draft project posters. `/work`, `/services`, `/about`, and `/contact` are minimal route foundations for navigation review. Their complete content is deferred. The Phase 0 studies remain at `/concepts/a` and `/concepts/b` for reference. Core content and a visible fallback navigation work without browser JavaScript. Astro's foreground development mode is explicit so test runners can manage its lifecycle. Keep development access local/private: noindex is an indexing hint, not authentication.

`npm run build` generates six noindex foundation routes: Home, Work, Services, About, Contact, and 404. It excludes concept pages, draft case routes, and draft portfolio media. The production Work foundation shows an intentional empty state until publication approvals exist. `npm run preview` serves this safe build. Nothing has been deployed.

## Checks

```sh
npm run verify
npm run test:build
npm run test:browser
npm run format:check
```

`verify` runs Astro type checks, ESLint, content and contrast tests, and a production build in sequence. `test:build` checks all built pages and assets for draft leakage. Browser tests cover the Phase 1 foundation from 320 to 1920px, actual text bounds, loaded posters, canonical routes, menu focus/closing/resize behavior, no-JavaScript navigation, and reduced-motion readability; Phase 0 regression tests are retained. Phase 1 full-page, hero, header, capability, work, and footer screenshots are written to `artifacts/phase-1/` at 390, 768, and 1440px, plus a 390px open-menu capture.

The cloud machine provides Chromium at `/usr/bin/chromium`. Set `CHROMIUM_PATH` to another installed Chromium executable elsewhere; the package does not download a browser implicitly. Browser checks do not establish iOS Safari/Android hardware performance, WCAG conformance, or production Core Web Vitals.

## Content and media

- `src/content/projects/*.json` is the single source of project metadata. Seven supplied records are all draft/private, unknown commissioning status, and have no publication or credit approval.
- `src/lib/project-schema.ts` validates safe slugs, descriptive media alternatives, provenance, and evidence-backed results. `canPublish` requires published + public + publication approval + credit approval + a known project type. These flags record human decisions; they cannot establish rights by themselves.
- All future public routes, related work, filters, feeds, and sitemaps must consume `getPublicProjects()` from `src/lib/projects.ts`. Do not query raw collection records in public features.
- `getDraftPreviewProjects()` only returns data in development. Preview route modules use development-only imports to keep draft artwork out of the production asset graph.
- `MediaSlot.astro` reserves dimensions, creates responsive WebP images, and labels temporary stills. There are no fake play buttons or implied videos. Final video controls/source switching belong to the later media phase.
- Project posters are unchanged supplied WebPs. The supplied raster logo is displayed with CSS whitespace framing on a light background; its proportions, lettering, and colors are preserved.

Manrope is locally served under the SIL Open Font License, included in `licenses/`. Shared spacing, type, surface, contrast, and interaction tokens live in `src/styles/global.css`; bright orange is atmospheric while strong orange supports readable text. The header, buttons, hero, capability index, section headings, project cards, route intro, and static footer are reusable components. GSAP remains deferred to the motion phases.

## Review and next phase

See [Phase 1 handoff](docs/PHASE_1_HANDOFF.md), [Phase 0 handoff](docs/PHASE_0_HANDOFF.md), [asset audit](docs/ASSET_AUDIT.md), and the unmodified original briefs in `docs/source-pack/`. Design evidence lives in `artifacts/phase-1/`.

Afterglow was approved as the working Phase 1 direction. The capability index and one paired work row borrow specific structural strengths from B. Review the Phase 1 typography, spacing, navigation, portfolio rhythm, and footer before authorizing Phase 2. The static footer has independent artwork/content layers and the hero has semantic line groups for future motion, all visible without animation. The hand/frame sequence remains Phase 5 and needs genuine layered assets for production. Project rights, service scope, final brand masters, contact/domain/social details, forms/privacy, and media still need confirmation before publication.

No remote push, public deployment, contact service, fabricated case claims, or analytics integration is part of this phase.
