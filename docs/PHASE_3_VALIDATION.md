# Phase 3 validation — editorial Work and case-study system

Validated on 21 October 2026 using Node 24.19.0, npm 11.9.0, and installed Chromium. Phase 3 extends verified Phase 2 merge `b3dc19602963a86b55942294ee85d7fd025d1dc6` on `phase3/editorial-portfolio`.

## Actual final results

| Check                      | Observed result                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run verify`           | Passed: Astro/TypeScript, ESLint, unit tests and production build |
| Astro / strict TypeScript  | 59 files; 0 errors, 0 warnings, 0 hints                           |
| ESLint                     | Passed, no diagnostics                                            |
| `npm test`                 | 20 passed; 0 failed or skipped                                    |
| Production build           | Passed; 6 static foundation routes                                |
| `npm run test:build`       | 3 passed; 0 failed or skipped                                     |
| `npm run test:publication` | 1 integration test passed, exercising 3 isolated builds           |
| Complete Playwright suite  | 52 passed; 0 failed or skipped; 45.7 seconds                      |
| `npm run format:check`     | Passed after final documentation assembly                         |
| `git diff --check`         | Passed                                                            |
| All local case previews    | 11 URLs returned HTTP 200 and rendered the shared template        |

The four automated suites total **76 passing tests**. The three publication-workflow builds are steps of one integration test, not three additional test cases. The focused 15-test portfolio run also passed before the final complete 52-test regression run; it is not counted twice.

The build logs two expected Astro empty-collection notices because no project is approved for production. They do not indicate lost local draft records: all 11 development routes were separately exercised. No unapproved case or artwork is included to suppress those notices.

## Publication and withdrawal proof

All 11 actual records remain private drafts with unknown commissioning status, false publication/credit approvals, `contentVerified: false`, and empty services. Production emits Home, Work, Services, About, Contact and 404 only. Output tests inspect HTML, CSS, JavaScript, JSON/XML, generated routes and image filenames for unapproved metadata, preview routes and artwork.

`tests/publication-workflow.test.mjs` creates a disposable source copy and a clearly synthetic record using a supplied poster. It performs three actual builds:

1. A test-approved visual-only record automatically appears on Work and at its shared case route, while all real projects remain private and unverified factual fields remain absent.
2. Enabling factual verification in that synthetic record reveals the populated challenge, concept, approach, role, services, deliverables, credits and evidenced outcome fields.
3. Withdrawing the synthetic record removes its case route, card and all portfolio WebPs from rebuilt output, including after the earlier approved-image builds.

The test never changes actual records or approvals. It invokes the installed Astro CLI through Node with an explicit temporary root and uses a Windows junction where applicable; native Windows execution remains untested here.

This integration check and the production output tests exposed the need to gate entries before Astro's collection image registration. The final `project-loader.ts` rejects unapproved entries at storage, clears prior cached records/imports, and retains schema validation. Route/public selectors still apply the original approval gate independently. No output deletion or weakened assertion substitutes for this boundary.

## Browser coverage and capture invocation

The final suite ran after the standalone build checks, using a fresh development process. Development and production deliberately use different content image maps, so mode switches require restarting development; this is documented in the README and portfolio workflow.

```sh
mkdir -p /tmp/drawnout-phase3-final
cd /tmp/drawnout-phase3-final
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-phase3-final/final-results
```

Work checks cover 320, 390, 768, 1440 and 1920px. Bunzo and Triarch detail checks cover 390, 768 and 1440px. Retained homepage/concept/navigation tests also cover 360 and 1024px. Browser checks verify:

- Real loaded images, descriptive alternatives, reserved dimensions, source sets and source-width caps.
- No horizontal document overflow and visible heading text within viewport bounds.
- Counts derived from records, overlapping categories, pressed-state buttons, URL selection and back/forward history.
- Keyboard filter operation, visible focus and minimum 44px filter heights; current Work navigation on both desktop and the expanded mobile menu.
- Private previous/next navigation, public draft URLs returning 404, no fake video/play controls and absent unverified facts/narratives/outcomes.
- Eager case hero, lazy gallery images, no JavaScript fallback and reduced-motion visibility.
- Existing menu focus trapping, Escape/backdrop dismissal, scroll-lock release and skip navigation.

The full run passed with no browser page errors in the covered responsive flows. Earlier diagnostic runs were not used as final screenshot evidence. Final captures were made after correcting Work heading text spacing and checking mobile current-page state through its visible menu.

## Visual preservation and review evidence

All **51** historical committed PNGs retain their hashes. All **28** regenerated Phase 2 homepage captures have **identical pixels** to the approved committed images. The homepage composition, hero, content sections, palette/type tokens, footer, original covers and existing gallery prefixes remain preserved.

The [Phase 3 gallery](../artifacts/phase-3/README.md) embeds 24 full-resolution PNGs totaling 32,629,928 bytes: nine full-page views, three filter views, and twelve case hero/gallery views. Images decode as PNG; every relative gallery target is checked before publication. Only Phase 3 outputs were copied from the temporary runner directory.

| Full-page subject | Mobile     | Tablet     | Desktop     |
| ----------------- | ---------- | ---------- | ----------- |
| Work              | 390 × 5794 | 768 × 6082 | 1440 × 8814 |
| Bunzo             | 390 × 4828 | 768 × 4535 | 1440 × 6913 |
| Triarch           | 390 × 4235 | 768 × 4431 | 1440 × 6869 |

Manual inspection covered desktop and tablet Work rhythm, mobile image framing, the varied Bunzo gallery, Triarch's portrait-led composition, hierarchy, line wrapping, spacing and clipping. The mobile menu trigger retains a visible focus ring after keyboard dismissal in the case captures; this records the tested focus-restoration state.

## Asset and performance implications

All 46 original PNGs still match the authorized asset commit. The 11 existing Phase 2 WebPs are unchanged. Twenty-six new WebPs total 2,040,058 bytes; source dimensions cap every derivative and responsive candidate. The [asset audit](PHASE_3_ASSET_AUDIT.md) documents every source/crop and reserve/exclusion decision. Portfolio pages use WebP derivatives and never serve original PNG boards.

The current safe production output has zero project WebPs. It contains four CSS files totaling 59,359 bytes raw (15,265 bytes when individually gzip-compressed); this is the aggregate generated CSS set, not one page's transfer. Astro inlines the small client modules: Work has two inline scripts totaling 3,517 raw bytes, rather than external JavaScript files. No client framework or motion dependency was added.

In actual project previews, heroes are prioritized and later media load lazily with reserved geometry. Paired/inset galleries avoid rendering the same source twice, while responsive mobile choices retain useful artwork context. These implementation/size checks are not production Core Web Vitals measurements or hardware performance claims. The private, unapproved portfolio has not been deployed for a public audit.

## Delivery and limits

The Phase 3 source, screenshots, gallery, asset audit, handoff and Codex workflow are committed to the dedicated review branch. Remote push, PR head and gallery image retrieval are verified after publication and reported in the delivery response. No hosted CI configuration is introduced; local results above are not represented as hosted checks.

Chromium was available; physical iOS/Android devices, Safari/Firefox and native Windows/PowerShell were not tested. Final project provenance, scope, credits, publication rights and verified narratives/outcomes remain required before actual publication. Real videos/captions and final brand/footer masters remain outstanding for later phases.

**Stop after Phase 3. No merge, public deployment, or automatic cinematic-motion work is authorized.**
