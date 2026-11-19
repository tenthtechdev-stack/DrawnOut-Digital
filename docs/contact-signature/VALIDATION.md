# Contact signature — final validation

## Review status

The Contact implementation and visual evidence are complete for owner review. **42/42 focused Contact browser checks pass. The wider existing browser suite is not green: 233/244 pass, 11 fail.** The unresolved differential About timing check is explicitly retained below. No assertion was weakened or deleted. No live form activation, merge, deployment or Netlify mirror push was performed.

Draft [PR #22](https://github.com/tenthtech/drawnout-digital/pull/22) is stacked on open [PR #21](https://github.com/tenthtech/drawnout-digital/pull/21), branch `feature/portfolio-motion-completion`, immutable parent `106d63ca5d50f4f84a715c407073f6d7c8fc7424`. The implementation branch is `feature/contact-signature-experience`. The application build, focused checks, captures and wider regression snapshot use the same final application source. Source/test snapshot `bf5c65b8746cb370f89856cb6f8fafcae4ea2563` is recorded in the artifacts; subsequent commits publish review evidence and reports.

## Build, source and publication

| Actual command/check                  | Result                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run build`                       | PASS; 22 static pages, 274 optimized images, 12 approved portfolio-video endpoints    |
| `npm run check`                       | PASS; 220 files, zero errors, warnings or hints                                       |
| `npm run lint`                        | PASS                                                                                  |
| `npm test`                            | 52/52 PASS                                                                            |
| `npm run test:build`                  | 6/6 PASS                                                                              |
| `npm run test:publication`            | 1/1 PASS; publishing/withdrawal and media exclusion retained                          |
| Media export and preservation command | 23/24 PASS; one historical scope mismatch described below                             |
| Contact source preservation           | 3/3 PASS within the preceding command; 426 protected parent files match byte-for-byte |
| Repository formatting and whitespace  | See final [format result](../../artifacts/contact-signature/format-validation.json)   |

[Actual build log and output hash](../../artifacts/contact-signature/build-validation.json) / [core commands, full output, exits and historical parent comparison](../../artifacts/contact-signature/core-validation.json). Build-time Formspree configuration remains absent. No SSR conversion or new animation dependency was introduced. The Contact production HTML SHA256 is `c56b20406010af52ab78dc712ee9a77767ece98c990b6787d40ec0d80d60fc4c`, shared by final captures, focused checks, native journeys and the broad run.

The combined media command is `node --test tests/portfolio-motion-exports.test.mjs tests/motion-quality-exports.test.mjs tests/motion-completion-preservation.test.mjs tests/contact-signature-preservation.test.mjs`. All 18 media-export checks pass. The unchanged historical whole-site audit at `tests/motion-completion-preservation.test.mjs:100` permits only the previous three motion-record changes, so it rejects this newly authorized Contact/form source. Its exit 1 and raw error are retained; the same selected audit passes 1/1 on parent 106d63c. It was not weakened. The new Contact audit freezes 426 protected parent source/assets/config/test files outside the three authorized existing Contact edits, and confines new application modules to the Contact boundary. Canonical contact data/validation, shared layout, six portfolio animations, eleven case studies, Services puzzle, homepage/gradient/intro, About, footer prototype, favicon, publication/attribution and preview noindex safeguards remain preserved.

## Focused Contact browser coverage

`npx playwright test --config playwright.contact-signature.config.ts` passes **42/42**, zero skips/flaky. These comprise 25 new Contact-specific cases and the unchanged 17 existing form cases. [Raw focused results](../../artifacts/contact-signature/browser-tests.json).

Coverage includes layouts and Axe checks at 320, 390, 768, 1024, 1440 and 1920px; cold-entry actual pointer access and artwork hit-testing; natural 4.8-second completion; immediate form-focus settlement; hidden/offscreen pause reasons; reduced motion, Save Data, module-load failure and no-JavaScript behavior; native enquiry navigation; official email, telephone, WhatsApp and social links; field errors and focus; optional fields; pending/duplicate prevention; strict acknowledged success; provider/network/timeout/malformed failures; retry/reset behavior and direct-email fallback. Provider responses are intercepted fixtures, not live delivery tests.

The additional [real native navigation smoke](../../artifacts/contact-signature/contact-navigation-smoke.json) passes all four journeys at 390 and 1440px: Home → Contact → Home and Home → Work → Home. Contact has no loader overlay, starts its own line reveal and has an enabled Name input. Home retains its full introduction and completes automatically. There are no browser errors or failed requests in those journeys. No attributes or timelines are changed to force the result.

## Full existing browser regression: 233/244

All six existing configs and their assertions are unchanged. One worker runs each suite sequentially against the frozen build; only the existing shader suite uses the existing dev server. No build runs during browser checks. [Full command/exit/error/baseline summary](../../artifacts/contact-signature/regression-summary.json).

| Existing config                            |    Pass |   Fail | Raw results                                                                                                  |
| ------------------------------------------ | ------: | -----: | ------------------------------------------------------------------------------------------------------------ |
| `playwright.motion-completion.config.ts`   |      30 |      1 | [Portfolio motion](../../artifacts/contact-signature/motion-completion-tests.json)                           |
| `playwright.case-rollout.config.ts`        |      42 |      0 | [All eleven cases](../../artifacts/contact-signature/case-rollout-tests.json)                                |
| `playwright.case-regression.config.ts`     |      74 |      0 | [Case, Work, Contact and footer regression](../../artifacts/contact-signature/case-regression-tests.json)    |
| `playwright.motion-preservation.config.ts` |      57 |      2 | [Services, accessibility and loader preservation](../../artifacts/contact-signature/preservation-tests.json) |
| `playwright.motion-gradient.config.ts`     |       9 |      0 | [Living gradient](../../artifacts/contact-signature/gradient-dev-tests.json)                                 |
| `playwright.about-premium.config.ts`       |      21 |      8 | [About](../../artifacts/contact-signature/about-premium-tests.json)                                          |
| **Total**                                  | **233** | **11** | Zero skips/flaky; bounded comparisons do not replace this result                                             |

The exact parent failures were recorded before implementation in [BASELINE.md](BASELINE.md): parent 225/244 initial passes, 19 failures, then 13 unresolved on failed-only retry; ten retry failures also occurred on original PR #20. Seven current failed titles occur in the parent initial 19. Matching a title alone does not establish matching assertions: the current loader failures differ, as recorded below.

A managed-environment interruption killed the worker during an incomplete preservation run. The partial stdout and event are retained in [interrupted-run.json](../../artifacts/contact-signature/interrupted-run.json), excluded from pass/fail totals. The first three completed suites were preserved; only the interrupted suite and the two remaining suites resumed. The final 244 results contain one complete result for each check. Source/test hashes and production HTML did not change. Legacy portfolio audit outputs were archived into this milestone and their original bytes restored with hash verification.

## Failure analysis and unresolved checks

- **Contact loader metadata contract:** the 390px strict Home journey passed cold/refresh storyboard samples, reached Contact and verified its URL and hidden overlay, then failed at `loader.spec.ts:150` because it expects `data-signature-intro-reason="internal-navigation"`. Contact intentionally opts out of the global loader using the existing layout prop and does not emit this loader-only attribute. Parent failure under the same title was instead an early full/brief startup assertion. This is an intentional local arrival change, not an identical baseline error. The unchanged assertion remains failing; the four real native journeys above verify actual navigation and automatic Home completion without fabricated metadata.
- **1440px loader sampling:** `loader.spec.ts:102` requires more than 20 running samples and observed exactly 20. The same parent title previously failed its duration assertion at line 103 (2543.5ms against >3000ms). Both raw failures remain; this is a strict sampling limitation, not evidence that the Contact feature fixed the homepage loader.
- **SOL early-pointer precondition:** the full run failed `motion-completion.spec.ts:259`, expecting the visual arrival to still be `running` after scrolling; it was already `complete`, before the pointer action. This title was absent from the recorded parent 19. One bounded unchanged-parent run reproduced the same assertion; the current bounded run passed. The full SOL HTML and all referenced runtime asset bytes are [identical to the parent](../../artifacts/contact-signature/sol-runtime-comparison.json). The original full-run failure is retained.
- **About:** eight full-run failures occur while waiting for `running`/`settled` entrance states and receiving the existing fail-open `static` state, before the tested keyboard/pointer/preferences/resize operation. Five titles match the parent initial failures at the same assertion. Of the three newly observed About titles, the 390px atmosphere and 1440px navigation-pointer checks reproduce on immutable parent; bounded current atmosphere passes and navigation-pointer still fails.
- **Unresolved differential:** `about.spec.ts:456`, “early keyboard settles the entrance without blocking content”, passes on the bounded parent but fails on the current full and bounded runs, waiting for `running` while receiving `static` before any key is sent. It is not labelled a reproduced baseline failure or a passing result. [About full HTML and every recursively referenced emitted JS/CSS asset are byte-identical](../../artifacts/contact-signature/about-runtime-comparison.json), which bounds this to a startup/timing investigation rather than an About source modification. The observed differential remains unresolved. This delivery does not claim the entire browser suite is green or that all newly observed failures are pre-existing.

The [bounded comparison](../../artifacts/contact-signature/new-failure-comparison.json) runs the four titles absent from the parent initial 19 exactly once on immutable parent 106d63c and once on current output, with old test/config bytes checked. It is eight diagnostic invocations, not a replacement tally. Raw per-run reports and exact errors are retained. See the [machine assessment](../../artifacts/contact-signature/browser-regression-assessment.json) for classification, source hashes and unresolved conditions.

## Visual evidence and issues corrected

The [GitHub gallery](../../artifacts/contact-signature/README.md) contains actual normal-motion recordings at 1440px (8.84 seconds) and 390px (8.36 seconds), natural opening/intermediate/settled frames, full-page and introductory layouts at all six widths, immutable-parent before comparisons, reduced-motion/no-JavaScript views and explicitly mocked form-state evidence. There are 44 retained PNGs: 28 final, 12 parent-before and four diagnostic viewport views. Recordings are actual production Chromium with native scrolling/typing; no timeline seeks, retouching or compositing. [Capture provenance and real clocks/hit tests](../../artifacts/contact-signature/contact-capture.json).

- A local type cap corrected an unintended third headline line at 1920px; the focused test now requires the intended two-line desktop composition.
- CSS visibility checks initially missed the global loader painting above Contact while the drawing played behind it. Real recordings exposed the issue. Contact now uses `<SiteLayout enableLoader={false}>`; shared layout and homepage intro sources stay unchanged. Two cold-entry raw-pointer checks and three-point topmost hit tests in each phase now verify real unoccluded access. Final 42 checks and recordings pass. The earlier two 40-check reports are retained as incomplete coverage, not proof of visibility; rejected recordings remain outside the gallery.
- Tall element screenshots painted the sticky header midway through mocked-form evidence. The capture helper now records real viewports after native wheel positioning. Final evidence was recaptured without application changes or image retouching.

## Owner dependencies and release boundary

**No real email delivery is verified.** No endpoint, provider account access or verified recipient was supplied. The production build remains unconfigured, with disabled submit and working direct email. A successful HTTP response plus explicit JSON acknowledgement gates the small confirmation mark; acceptance is not inbox delivery. Mocked evidence proves interface handling only.

Before live operation, the owner must approve the design and complete the [Formspree activation checklist](FORMSPREE_ACTIVATION.md): actual public endpoint, recipient `official@drawnoutdigital.com` verified in the actual account, spam/domain/server-validation/plan settings, approved DrawnOut privacy policy and link, real provider acceptance, inbox/spam delivery and visitor Reply-To tests. Deployment/live activation requires separate approval. Credentials and personal test mail must remain private.

Mobile evidence uses Chromium viewport/touch emulation; physical Safari/iOS/Android testing remains outstanding. The existing hand/emblem footer is still the previously documented prototype; production-quality 3D is a separate milestone. No other page was redesigned. No merge, deployment or Netlify mirror push occurred. Stop for owner visual review.
