# Phase 1 observed validation

Validated on the current cloud machine using Node 24.19.0, npm 11.9.0, Astro 7.4.1, strict TypeScript, and system Chromium. These are local implementation results. No website deployment or fresh-task restoration is claimed.

| Command                         | Final observed result                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run verify`                | Passed: Astro check, ESLint, 13 unit/content/contrast tests, and production build.                     |
| `npm run check` (within verify) | 39 checked files; zero errors, warnings, or hints.                                                     |
| `npm run lint` (within verify)  | Passed with no lint violations.                                                                        |
| `npm test` (within verify)      | 13 passed, zero failed/skipped: 7 content/publication tests and 6 contrast tests.                      |
| `npm run build` (within verify) | Passed; six foundation pages built.                                                                    |
| `npm run test:build`            | 2 passed, zero failed/skipped: expected routes/metadata and no draft project assets in production.     |
| `npm run test:browser`          | 30 passed, zero failed/skipped in 21.9 seconds: 15 Phase 1 checks and 15 retained concept regressions. |
| `npm run format:check`          | Passed after formatting the new handoff. Original supplied briefs remain excluded from reformatting.   |

Total automated test cases: **45 passed**. Type checking, lint, formatting, and builds are additional checks.

## Responsive and interaction evidence

Phase 1 browser coverage includes 320, 360, 390, 768, 1024, 1440, and 1920px. Tests check the actual rendered text ranges, one semantic H1/main, all five capability names, loaded images, no draft case links, horizontal overflow, and no browser page errors. Four route shells have metadata and matching active navigation. Mobile tests cover repeated Tab/Shift+Tab containment, Escape, restored trigger focus, link selection, backdrop dismissal, and releasing scroll lock on desktop resize. With JavaScript disabled and reduced motion enabled, content and navigation remain usable.

The final full suite includes the root's two original CTA labels and the fixed mobile focus cycle. A prior Chromium native-dialog focus gap was corrected with explicit first/last Tab wrapping; decorative menu numbers are hidden from assistive technology. The failed intermediate run is not counted as a pass.

## Color checks

| Text/surface                 | Contrast ratio |
| ---------------------------- | -------------- |
| Ink on paper                 | 14.99:1        |
| Muted text on paper          | 5.93:1         |
| Strong orange on paper       | 5.91:1         |
| Cream on ink                 | 15.48:1        |
| Amber on footer              | 7.35:1         |
| Muted inverse text on footer | 8.39:1         |

All tested flat text pairs exceed 4.5:1. The atmospheric gradient is kept behind readable live text and was inspected at the requested breakpoints; these flat-color calculations do not certify every gradient pixel or constitute a complete accessibility audit.

## Screenshots

Each requested width has full-page, hero, header, capabilities, work, and footer captures:

- `artifacts/phase-1/afterglow-390.png`
- `artifacts/phase-1/afterglow-768.png`
- `artifacts/phase-1/afterglow-1440.png`
- `artifacts/phase-1/afterglow-390-navigation.png` shows the open menu.

Section captures use the same name with `-header`, `-hero`, `-capabilities`, `-work`, or `-footer` suffixes. Section-only captures hide sticky navigation during capture to avoid overlaying the section; full-page and header captures retain it. All poster sources are loaded before capture. Desktop, tablet, mobile, and the open menu were visually inspected; no material clipping or overlap remains in these views.

## Limits and review

Seven project records remain draft/private with unknown commissioning status and no publication/credit approval. Production has no case routes or draft portfolio media. Contact delivery is pending, route content is intentionally minimal, and no cinematic motion is implemented. No external service was changed and no code was pushed or publicly deployed.

Real-device Safari/Android, screen-reader testing, full accessibility audits, production Core Web Vitals, final brand/media approval, and the signature footer sequence remain later-phase work. Review the Phase 1 foundation before authorizing Phase 2.
