# Site-wide motion polish — validation checkpoint

The implementation and real desktop/mobile review evidence are complete. **24/24 new motion checks, 29/29 unchanged About checks and 42/42 Contact checks pass.** The remaining existing browser-regression checks are running; this checkpoint does not claim a green full suite.

## Actual completed results

- Production build: PASS, 22 static pages; approved media and private-project exclusion preserved.
- Astro/TypeScript: PASS, 232 files, zero errors/warnings/hints. ESLint: PASS.
- Unit:58/58; build-output:6/6; publication:1/1; media/current preservation:21/21. The current guard freezes434 unrelated source, assets, content, configuration and test files against PR22.
- Unchanged historical audits:3/6 pass,3 fail because their earlier milestone allowlists reject these newly authorized source changes. They remain unmodified. See [actual core commands and exits](../../artifacts/sitewide-motion/core-validation.json).
- Focused browser results: [24 new motion checks,29 About,42 Contact](../../artifacts/sitewide-motion/final-browser-validation.json). The24 passing cases are reused from identical non-About emitted HTML/JS/CSS and unchanged test/config inputs; About was tested freshly after its clock/fallback fixes. [Complete byte comparison](../../artifacts/sitewide-motion/external-ack-compiled-comparison.json).

Final formatting and the full244-check regression report will be added after report writers stop. A resumed-runtime loopback proxy returned403 on unused ports and initially prevented preview startup; those attempts executed zero tests and are preserved as infrastructure events. Task-local loopback proxy exclusions restore direct access, verified against the exact production Contact HTML hash. No application or test assertion was changed for that infrastructure issue.

## Evidence and preserved behavior

The [visual gallery](../../artifacts/sitewide-motion/README.md) and [performance findings](PERFORMANCE.md) include before/after recordings, global Off/On, native forward/reverse Work expansion, actual project navigation/loops, Contact interaction, ordered About startup and preserved Services/puzzle/raster-footer scenes. All12 MP4s fully decode. There are90 captured PNGs plus28 historical/current loop-proof PNGs; originals are retained without retouching. Captured application source is commit1569b260dce67216444a4f0fe96cfe95ebb2905e (application code d8cd4451582fb7936a20edc028575f429f65e6e0).

The [implementation](IMPLEMENTATION.md) and [test migration/measurement notes](TEST_MAPPING.md) explain deleted individual controls, real decoded-frame presentation, bounded warm media leases, control-readiness fallback and actual first-frame clock synchronization. Historical failed runs remain alongside current results. No baseline About or loader assertion was weakened.

All11 cases, six motion compositions, original assets, factual attribution/publication restrictions, Contact validation/delivery behavior, official links, favicon, preview noindex and separate experience controls remain preserved. No merge, deployment or Netlify mirror push occurred.

## Remaining review and launch limits

Real recordings are Chromium/software-renderer viewport/touch emulation, not physical-device FPS certification. Actual tab activation in headless and headed Ozone left both pages visible, so native hidden-tab suspension is not claimed; deterministic hidden-state tests pass. The optional `apt-get download xvfb` was not executed when automatic approval review hit a usage limit; it was a review failure, not a determination that the action was unsafe.

The hand/emblem footer remains the existing raster prototype. Formspree remains unconfigured; owner endpoint/account/recipient verification, approved privacy policy and real inbox/Reply-To testing are still separate launch dependencies. Stop for owner visual review; do not merge, deploy or activate live submissions automatically.
