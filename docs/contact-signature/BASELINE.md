# Contact signature — baseline recorded before implementation

Parent PR #21 remains open at `106d63ca5d50f4f84a715c407073f6d7c8fc7424`. This branch is stacked on its latest fetched head. The [baseline record](../../artifacts/contact-signature/baseline.json) hashes all nine required files before editing.

## Existing failures and reproduction conditions

The complete parent browser run passed225/244. Failed-only retry left13 failures;10 also failed on original PR20. This is evidence of existing timing instability, not permission to dismiss Contact regressions. No assertion may be deleted or weakened to make this milestone green.

Reproduce with the three config files listed in the record: headless system Chromium154, SwiftShader, one worker, four-CPU quota; production preview for preservation/About, development server for the existing dev-only gradient snapshot. Exact commands, timings, failures and error messages are preserved in the [parent comparison](../../artifacts/motion-completion/baseline-comparison.json) and [full raw summaries](../../artifacts/motion-completion/regression-summary.json). The baseline is recorded from verified prior runs, not represented as a fresh test execution.

## All thirteen unresolved parent retry checks

- changing motion preferences during arrival releases the full composition immediately
- localized atmosphere visibly moves after arrival and pauses offscreen at 1440px
- optimized production visibly plays full cold/refresh/Home journeys at 1440px
- optimized production visibly plays full cold/refresh/Home journeys at 390px
- portrait arrival leaves navigation pointer targets immediately usable at 390px
- portrait, approved plaque, atmosphere and copy arrive in order within four seconds at 1440px
- real rendered 1440px loop features all five scenes, wordmark and return in fourteen seconds
- right-side fluid shader evolves at 0/2/5/8s after the loader at 1440px and pauses offscreen
- right-side fluid shader evolves at 0/2/5/8s after the loader at 320px and pauses offscreen
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 1440px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 320px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 390px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 768px

Ten overlapping original-baseline failures:

- changing motion preferences during arrival releases the full composition immediately
- localized atmosphere visibly moves after arrival and pauses offscreen at 1440px
- optimized production visibly plays full cold/refresh/Home journeys at 1440px
- optimized production visibly plays full cold/refresh/Home journeys at 390px
- real rendered 1440px loop features all five scenes, wordmark and return in fourteen seconds
- right-side fluid shader evolves at 0/2/5/8s after the loader at 1440px and pauses offscreen
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 1440px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 320px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 390px
- six enlarged borderless project posters reveal progressively and keep SOL prominent at 768px

## Preserved form and launch boundary

All existing Contact tests in the parent74-check Work/Contact/footer suite pass. Canonical contact data, field schema, input limits, endpoint allowlist, strict accepted-response guard, duplicate prevention, timeout uncertainty and native fallback are retained. No Formspree endpoint is configured or invented. Owner setup, verified recipient, approved privacy policy and actual inbox/Reply-To testing remain launch dependencies.

The new Contact animation must remain independent of form business logic and of the existing Services puzzle. Content and controls cannot wait for motion. No new startup/animation assertion may be substituted for these baseline failures.
