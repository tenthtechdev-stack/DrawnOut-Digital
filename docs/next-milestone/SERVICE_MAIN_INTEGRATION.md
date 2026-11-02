# Service pages integrated with current main

PR #8 combines the completed service pages with main commit `05928c85ec1e5ab8400515207f412e7d34818cdd`, containing merged Contact, loader/gradient and portfolio-motion work. Existing history is retained through a merge of main into `feature/service-page-foundation`.

## Conflict resolution

- `.gitignore` keeps both the service and portfolio-motion artifact rules.
- `tests/build-output.test.mjs` retains the newer approved-video/deferred-source test and adds the five service routes and service metadata/copy/FAQ/schema checks.
- `tests/publication-workflow.test.mjs` retains synthetic public/private video fixtures, video output assertions and withdrawal checks. Route totals now also include the shared service index.

No existing main files were deleted. Only the intended service-link/data/overview files and overlapping tests/ignore rules modify existing main content. The newer loader, gradient, navigation, footer, Contact implementation, portfolio schema/runtime/records and all twelve MP4 assets remain unchanged. A separate read-only review confirmed the combined resolutions; a reproducible hash audit records 93 critical files unchanged byte-for-byte.

## Actual validation

| Check                             | Result                                                |
| --------------------------------- | ----------------------------------------------------- |
| Production build                  | Passed: 22 HTML pages and 12 approved video endpoints |
| Astro / TypeScript                | Passed with zero errors, warnings or hints            |
| ESLint and formatting             | Passed                                                |
| Unit tests                        | 36 passed                                             |
| Build-output tests                | 6 passed                                              |
| Publication / withdrawal workflow | 1 passed                                              |
| Motion-export validation          | 6 passed, covering all 12 exports                     |
| Production browser integration    | 44 passed, zero retries, failures or skips            |

The 44 browser cases comprise 17 service, 10 portfolio-motion and 17 Contact tests. They verify all five service pages at 390/768/1440px, FAQ keyboard/no-JavaScript behavior, metadata/navigation/accessibility; all six portfolio loops on Home and Work, actual decoded playback, lazy loading, decoder limits and preference fallbacks; and Contact validation, honest unconfigured state, simulated provider success/failure/retry and official links. Provider responses are intercepted fixtures; no live email delivery is claimed.

[Machine-readable results and per-case browser list](../../artifacts/services/integration-validation.json) · [Existing service gallery](../../artifacts/services/README.md)

Reproduce after installing dependencies:

```sh
npm run check
npm run lint
npm run format:check
npm test
npm run build
npm run test:build
npm run test:publication
node --test tests/portfolio-motion-exports.test.mjs
npx playwright test --config playwright.integration.config.ts
```

The integrated browser config serves the current production build on a fresh local port. This is targeted integration coverage, not a claim of rerunning every cinematic motion test or certifying physical-device GPU performance. The original source and existing strict production motion tests remain intact.

The site retains preview noindex policy, the documented 2D hand/plaque prototype and the unconfigured Formspree fallback. Public launch, live inbox verification and owner content/scope/privacy decisions remain separate. This task does not deploy or push to the Netlify preview repository.
