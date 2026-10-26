# Contact — validation and delivery

Contact is implemented on `feature/contact-page`, based on the latest approved `main` merge `3ed6f16`. PR #4 was already merged by the time final Contact validation ran. This change preserves the opening, living gradient, approved portfolio system, footer choreography and responsive navigation. The footer gains the official email link; Contact replaces the temporary page.

[Visual gallery](../artifacts/contact/README.md) · [Owner setup and handoff](CONTACT_HANDOFF.md) · [Browser results](../artifacts/contact/browser-verification.json) · [Build/configuration measurements](../artifacts/contact/implementation-verification.json)

## Actual results

| Check                                                  | Result                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `npm run check`                                        | PASS — 91 files; zero errors, warnings or hints                                |
| `npm run lint`                                         | PASS                                                                           |
| `npm test`                                             | PASS — 32 tests                                                                |
| `npm run build`                                        | PASS — 17 static routes; no SSR adapter                                        |
| `npm run test:build`                                   | PASS — 4 production route/asset/content checks                                 |
| `npm run test:publication`                             | PASS — 1 integration test with isolated publish/withdrawal builds              |
| `npx playwright test --workers=1 --reporter=list,json` | PASS — 156 tests; no failures, retries, flaky results or skips; 283.02 seconds |
| `npm run format:check` and `git diff --check`          | PASS                                                                           |

**193 distinct automated tests pass:** 32 unit, 4 production-output, 1 publication-workflow and 156 browser tests. Reporting/output paths were directed to external workspace staging during validation; the committed JSON records all final test names and outcomes.

The 17 new Contact browser cases cover 390px, 768px and 1440px layout/focus/accessibility scans; official links; safe unconfigured behavior; no-JavaScript behavior in both modes; required, whitespace, malformed-email and length validation; honeypot rejection; pending/accepted duplicate prevention; accepted JSON handling; HTTP, network, malformed and contradictory response failures; timeout uncertainty without automatic retry; and correcting errors before an explicit retry. Provider responses are intercepted test fixtures. **No test sends an actual enquiry or verifies email delivery.**

The complete existing regression suite checks public portfolio routes/filtering/content, intro timing and skip/fallback rules, persistent gradient movement, scroll effects/reversal, footer controls and mobile navigation/layout stability. One existing square-timing test now computes its 4,000-point SVG intersection probe after observing animation: previously the probe itself blocked the main thread and missed the first reveal on this runner. Its geometry, timing tolerances and assertions are unchanged. No opening-animation implementation was edited for Contact.

Initial accessibility testing found closely spaced error-summary links. Those links now have 44px touch targets, and the final error-state axe scan passes. Earlier test-only selector/host setup issues were corrected before the final run.

## Production and visual review

[Capture evidence](../artifacts/contact/capture-evidence.json) records 21 unedited PNGs across 390px, 768px and 1440px: full pages, hero, form, direct contact, static footer and separately labelled normal-motion hero/footer views. Lazy footer images are scrolled into view and decoded before full-page capture. Each capture checks for horizontal overflow. Visual inspection confirmed readable desktop/mobile typography, field labels, spacing, focus treatments and the retained signature composition.

The form script is 5,829 bytes (2,622 bytes gzip), with no new package dependency. Existing motion libraries and assets are reused. The form remains usable by native POST when configured without JavaScript; the unconfigured build disables submission and keeps direct email available. There are no new analytics, tracking or marketing defaults.

A separate isolated static build used an explicitly test-only endpoint fixture to verify that build-time configuration generates the correct POST action, enables submission and discloses Formspree processing. The ordinary production `dist` remains unconfigured and contains no fixture endpoint. [Configuration proof](../artifacts/contact/configuration-verification.json). No real provider account or secret was involved.

## Contact links and access limits

The browser tests verify the supplied exact `mailto:`, `tel:`, WhatsApp, Facebook, Instagram and LinkedIn destinations, visible labels and focusability. Direct HTTP checks of all four external contact URLs were attempted using `curl -I -L --max-time 20 --max-redirs 3`. Each was blocked by this environment's outbound proxy: `curl: (56) CONNECT tunnel failed, response 403`. This is not proof that the destination is down; remote account availability remains unverified from this environment. [Actual HTTP attempts](../artifacts/contact/external-link-checks.json).

## Launch dependencies — intentionally unresolved

The owner confirmed that **no Formspree endpoint exists yet**. The page is integration-ready, with an explicit unconfigured state and official email alternative. A form acknowledgement is never presented for a failed request or a missing provider.

Before activating public submissions, the owner must create the real Formspree form, set and verify `official@drawnoutdigital.com` in its account, configure the public build-time endpoint, confirm provider spam/validation settings, and test a real enquiry through to the official inbox and its Reply-To behavior. A complete approved DrawnOut privacy policy is also required; the concise current purpose notice and conditional Formspree privacy link do not substitute for it. See the [setup steps](CONTACT_HANDOFF.md).

The existing signature hand/plaque remains the previously documented separated 2D prototype. This Contact milestone makes no new 3D production-readiness claim. No public deployment or automatic PR merge was performed.
