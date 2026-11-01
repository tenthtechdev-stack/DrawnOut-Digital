# Service pages — observed validation

Validated locally on 1 November 2026 on `feature/service-page-foundation`, stacked on `feature/recurring-loop-fluid-afterglow`.

[Screenshot gallery](../../artifacts/services/README.md) · [Capture measurements](../../artifacts/services/capture-evidence.json) · [Verification record](../../artifacts/services/verification.json) · [Handoff](SERVICE_PAGE_HANDOFF.md)

## Results

| Command or check                                             | Observed result                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `npm run check`                                              | PASS — 105 files, zero errors, warnings or hints                  |
| `npm run lint`                                               | PASS                                                              |
| `npm test`                                                   | PASS — 32 tests                                                   |
| `npm run build`                                              | PASS — 22 static routes                                           |
| `npm run test:build`                                         | PASS — 5 production route, asset, metadata and publication checks |
| `npm run test:publication`                                   | PASS — 1 isolated publish/withdrawal integration test             |
| `npx playwright test --config=playwright.services.config.ts` | PASS — 17 tests, 38.4 seconds; no retries or skips                |
| `node scripts/capture-services.mjs`                          | PASS — 15 page/viewport combinations, 21 actual screenshots       |
| `npm run format:check` and `git diff --check`                | PASS                                                              |

The 55 automated tests comprise 32 unit, 5 production-output, 1 publication-workflow and 17 service-browser cases. This milestone's browser run is focused on service pages; it does not claim a fresh full-site motion regression or a field performance measurement.

The latest upstream loading milestone checkpoint (`b2f32e1`) was merged into this feature branch to preserve the dependency history and include its formatting corrections. Production application source did not change during that merge. The final repository-wide formatting check passes.

## Content and interaction evidence

A separate read-only audit directly compared the supplied Markdown with the typed data and confirmed all five page titles, SEO titles, descriptions, eyebrows, H1s, opening paragraphs, four sections per page, page CTAs and 25 FAQ question/answer pairs exactly. Conditional scope and handover wording is preserved. No unsupported project proof, result, delivery role, rating or offer was added.

The 15 responsive browser cases cover every page at 390px, 768px and 1440px. Each checks metadata, one H1, section copy, breadcrumbs, five FAQs, visible keyboard focus, Enter/Space FAQ operation, Contact CTA, sibling-service links and horizontal overflow. All 15 axe scans using WCAG A/AA tags reported zero violations. Automated scans do not establish complete accessibility conformance.

Two further cases confirm homepage service and capability links, `/services` links, navigation to Contact with its safely unconfigured form, and a 390px no-JavaScript path through service content, a native FAQ and the Contact CTA. The Contact H1 check uses its accessible name because the existing visual line break is not a text-content space.

Production checks validate the five generated routes, unique metadata, review indexing, five FAQs, enquiry links, `BreadcrumbList` and `Service` schema. The portfolio publication/withdrawal test accounts for the new foundation routes while continuing to exclude withdrawn case routes and unique private media.

## Screenshots and limits

The gallery contains all five full pages at the three requested widths, plus Brand Identity introduction and keyboard-open FAQ views at each width. Captures come from the actual local production build with the supported reduced-motion preference and DPR 1. Native lazy footer images are loaded and decoded first. Assertions record HTTP 200, one H1, five FAQs, no overflow, Contact destination, preview indexing and the two expected schema types for all 15 combinations.

Visual inspection of the desktop introduction, tablet keyboard-open FAQ, mobile Creative Direction full page and desktop Digital Design full page found readable hierarchy, complete body copy, usable focus, appropriate line lengths and the retained static signature footer. All screenshots remain available for studio review; no image is retouched or composited.

Initial sandbox execution could not start localhost services or complete an asset subprocess test. The required commands were rerun with permitted process/network access and passed. An initial development-server run also blocked the symlinked dependency font and used an incorrect raw-text assertion across the Contact heading's line break. Final browser verification uses the production preview and the semantic heading assertion; the final run passed with the actual built font.

Chromium is the only browser exercised here. Real-device iOS Safari, Android Chrome, Firefox, Safari, 200% zoom and normal-motion service-page regressions are not established by this focused run. Copy and service responsibility approval, Contact provider/privacy setup and public launch authorization remain unresolved. No merge, public deployment or separate Netlify repository push was performed.
