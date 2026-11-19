# Contact signature — actual validation

## Checkpoint status

The Contact experience and review evidence are implemented. All 42 focused browser checks pass, including 25 new Contact-specific cases and the unchanged 17 form cases. Exact core results are in [core-validation.json](../../artifacts/contact-signature/core-validation.json). The [gallery](../../artifacts/contact-signature/README.md) includes actual normal-motion desktop/mobile recordings, 28 final PNGs and 12 before PNGs.

TypeScript/Astro reports 220 files and zero diagnostics; ESLint passes. Unit 52/52, build-output 6/6 and publication 1/1 pass. The final application build emits 22 pages and 12 approved portfolio video endpoints; no SSR conversion or endpoint configuration is introduced. Repository-wide final formatting will run after all report writers stop.

The full 244-check existing browser regression run is in progress. These incomplete results are not claimed as passing. The [recorded parent baseline](BASELINE.md) preserves 225/244 initial passes, 19 failures and 13 failures after retry, 10 also reproduced on original PR #20. Final results will be compared by exact test name, assertion and error, rather than assuming every same-title failure has the same cause.

## Historical preservation scope

All 18 media-export checks and the current Contact guards pass. The combined 24-check media/preservation command records 23 passes and one historical scope failure. The unchanged earlier whole-site audit (`tests/motion-completion-preservation.test.mjs:100`) permits only the previous three motion-record changes and therefore rejects the newly authorized Contact/form source. It is not deleted or weakened. The same test passes 1/1 on immutable parent 106d63c. The new Contact preservation audit compares 426 protected parent source/assets/config files byte-for-byte outside the three explicitly authorized Contact edits, including canonical contact data/lib, shared layout, portfolio composition sources and old browser assertions. Raw exits/errors and both invocations remain in the core report.

## Actual issues found and corrected

- Viewport review found an unintended third headline line at 1920px; a local type cap restores the intended two-line composition. A stronger desktop line-count assertion now covers it.
- CSS visibility tests initially missed the global loader painting above the Contact artwork. Normal-motion recording exposed that the line could finish behind the overlay. Contact now uses `<SiteLayout enableLoader={false}>`; shared layout and homepage intro code remain unchanged. Two cold-entry raw-pointer tests and three-point hit checks during every phase verify actual unoccluded access. All final 42 checks pass; earlier 40-check reports are retained as incomplete coverage, not proof of cold-arrival visibility.
- Tall element screenshots included a sticky header in the middle of mocked-form evidence. The capture helper now uses actual viewport screenshots after native wheel positioning; final evidence was recaptured without application changes or image retouching.

## Provider and release boundary

No owner Formspree endpoint or verified recipient has been supplied. The production build stays unconfigured and does not submit. Success/failure evidence is intercepted fixture behavior only. No real enquiry, provider account, inbox delivery or Reply-To has been verified. See the [activation checklist](FORMSPREE_ACTIVATION.md) for actual account, recipient, spam/domain/validation, privacy, live testing and deployment approvals still required.

All recordings are actual production Chromium. Mobile is viewport/touch emulation; physical Safari/iOS/Android testing remains outstanding. The original brand puzzle stays only on Brand Identity & Design. Six portfolio animations, eleven case studies, homepage/Afterglow/intro, footer prototype, About, favicon, official links, publication/attribution and noindex controls are preserved. The production-quality 3D hand/footer milestone is separate. No merge, deployment or Netlify mirror push was performed.
