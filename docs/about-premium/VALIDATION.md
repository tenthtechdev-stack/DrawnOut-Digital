# Premium About redesign — validation and review

Draft [PR #16](https://github.com/tenthtech/drawnout-digital/pull/16) targets
`feature/services-overview-chapters` (PR #14). The parent checkpoint is
`82e791c03496511bec540bf3516ed60ffde69fef`; PRs #10, #12 and #14 remain preserved
in the branch ancestry. The first redesign checkpoint was pushed at
`9ec33c902dd645a3f793d74b8e1a40e3a96b554d` before final review work.

**Review status: implementation, automated validation and real captures are complete; ready for owner visual review.**

[Complete owner brief](IMPLEMENTATION_BRIEF.md) ·
[Design and scope](DESIGN_AND_SCOPE.md) ·
[Asset provenance](ASSET_PROVENANCE.md) ·
[Before/after gallery and recordings](../../artifacts/about-premium/README.md).

## Implementation

The About page now has a coordinated founder-portrait/plaque entrance and seven
editorial chapters: origin, founders, manifesto, process, studio difference,
capabilities and invitation. Large Manrope typography, asymmetric compositions,
original abstract studies, charcoal/orange and selective cream panels replace
the previous simpler chapter layout.

The three hero paragraphs, founder roles/experience and manifesto explanations
are preserved. The closing invitation uses the exact newly supplied copy. The
five capability links use existing canonical service data. New labels stay
within the supplied studio story; no awards, client counts, testimonials,
project outcomes or founder-to-portrait-side identities are invented.

The approved sketch and exact existing plaque pixels are reused. The owner now
explicitly approves that plaque appearance for About. It remains a **separated
raster prototype presented in layers**, not an editable 3D asset or new realistic
render. The original founder photograph remains private. The illustrative
thesis typography and process artwork are new editorial studies, not historical
thesis pages or client deliverables.

The entrance is nonblocking and interruptible, with static HTML and an
independent startup fail-open guard. Process artwork uses direct per-row
ScrollTrigger progress with `scrub: true`, no pinning and no delayed scrub.
Body content remains readable during decorative reveals. Reduced motion, Save
Data, keyboard interaction, hidden-page and failed-initialization paths settle
content safely.

## Actual completed checks

These results are measured from the production build and retained command logs. Browser JSON reports are linked below; no skipped, flaky or retried cases were used to establish a pass.

| Command                                                                 | Observed result                                                                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run build`                                                         | Passed: 22 production routes                                                                         |
| `npm run check`                                                         | Passed: 163 files, zero errors/warnings/hints                                                        |
| `npm run lint`                                                          | Passed                                                                                               |
| `npm run format:check`                                                  | Passed after final documentation and evidence formatting                                             |
| `npm test`                                                              | Passed: 46/46, no failures or skipped cases                                                          |
| `npm run test:build`                                                    | Passed: 6/6                                                                                          |
| `npm run test:about-build`                                              | Passed: 2/2, including approved-source/privacy output                                                |
| `npm run test:publication`                                              | Passed: 1/1; approved-display publication and withdrawal                                             |
| `npx playwright test --config playwright.about-premium.config.ts`       | Passed: 29/29 in one complete run                                                                    |
| Existing homepage/Services/portfolio/Contact/footer browser regressions | Passed: 72 preservation + 28 loader + 11 overview cases                                              |
| Final gallery image retrieval and relative-link checks                  | Local image signatures and relative paths checked; GitHub retrieval is recorded in final PR delivery |

The focused browser suite covers 320/390/768/1024/1440 layouts, exact content,
one H1 and seven numbered chapters, all five capability links, contact CTA,
keyboard focus, axe checks, no-JS/reduced-motion/Save Data, failed or delayed
bundles/assets, immediate interaction, hero choreography and reversible process
progress. The final [29-case About report](../../artifacts/about-premium/browser-tests.json) records all cases passing.

### Retained review runs

The [initial browser run](../../artifacts/about-premium/initial-browser-tests.json)
passed 22/29. Five responsive cases exposed missing literal spaces at the closing
headline's line breaks; explicit text spaces now preserve the exact owner copy in
the DOM as well as its accessible name. Two atmosphere checks sampled too short
an interval with a high pixel-delta threshold for the deliberately subtle
gradient. The check now observes 2.4 seconds, measures real paint changes at a
lower per-pixel delta, verifies changed layer transforms and still requires copy
geometry to remain stable and offscreen motion to pause. The gradient itself was
not accelerated to satisfy the test.

The [second run](../../artifacts/about-premium/contrast-review-browser-tests.json)
passed 27/29. Axe identified the decorative founders' “02” as too low contrast
at 320px and 768px. Its colour was darkened; no contrast rule was disabled or
test excluded. The full suite then passed 29/29. Subsequent visual inspection moved a small tablet annotation clear of the portrait; the [final five-width repeat](../../artifacts/about-premium/responsive-final-browser-tests.json) passed 5/5 after rebuilding that CSS correction.

## Preserved-site regression evidence

All three complete batches passed against the About branch:

- [72 preservation checks](../../artifacts/about-premium/preservation-browser-tests.json): Contact validation and provider outcomes; official footer links/attribution; all six portfolio motions, filters and fallbacks; cinematic Services hero; all five service pages/FAQs; reversible signature footer.
- [28 homepage/loader checks](../../artifacts/about-premium/intro-browser-tests.json): automatic five-second deadline, real refresh and internal Home journeys, six artwork squares and SOL, skips, reduced motion, Save Data, storage failures and failed initialization.
- [11 Services overview checks](../../artifacts/about-premium/services-overview-browser-tests.json): five original overview chapters, actual detail links, keyboard/axe, static fallbacks and native reverse scrolling.

That is 140 distinct passing browser cases across separate complete runs, plus five repeated responsive checks after the tablet-only correction. It is not a claim of one 140-case invocation. Final production build contains 22 routes. No new package or continuous rendering loop was added. Source comparison confirms that shared navigation, homepage, Services, portfolio, Contact, footer and original image/video assets are unchanged from the parent.

## Visual evidence

The pre-redesign screenshots are captured from the unchanged parent production
build at `82e791c`, using native no-JavaScript rendering. Their viewport and
source facts are in [before-evidence.json](../../artifacts/about-premium/before-evidence.json).

Final native recordings include desktop/mobile hero arrival and forward editorial scrolling with reverse process motion. Normal viewports are 1440×900 and 390×844. The actual arrival choreography lasted approximately 3.50 seconds; from navigation the final state was observed at **4.015s desktop** and **3.787s mobile**, with the normal `complete` reason rather than a deadline fallback. This meets the brief's approximate 3–4s target with measured startup time stated separately.

- Desktop arrival: 7.28s recording; scroll/reverse: 28.52s.
- Mobile arrival: 7.80s recording; scroll/reverse: 28.24s.

There are 34 new PNGs plus four before-comparison images. Captures cover 1440, 1024, 768, 390 and 320px, with full-page desktop/mobile compositions and reduced-motion/no-JavaScript evidence. All final captures reported **zero page errors and zero failed requests**.

The [capture manifest](../../artifacts/about-premium/capture-evidence.json) records source commit `ebd113853c5d6d30f9fc3903df830ce73ce0a291`, individual source hashes, actual viewport/video metadata and browser errors. No timeline seeking, injected styles, animation pausing or synthesized frames were used. Full-page normal screenshots follow actual scrolling through the page; process artwork therefore reflects the real scroll position. Static reduced-motion/no-JS views show the completed decorative artwork.

The first long screenshots repeated content after approximately 8192 pixels under the cloud SwiftShader compositor. This was a capture-only failure: individual viewport screenshots and native recordings remained correct. All nine long new screenshots and the affected mobile before-image were recaptured using Chromium's native software compositor (`--disable-gpu`) at the same viewport dimensions, without stitching, changing site styles or pausing application motion. Independent visual inspection confirmed the complete desktop/mobile pages show all seven chapters and footer exactly once. The reproducible capture tool supports `--only full-pages`; recordings remain untouched.

Rendered desktop/mobile and tablet compositions were visually inspected. That review prompted the tablet annotation correction, independent of passing functional checks. Headline hierarchy, portrait visibility, plaque placement, modular artwork, text wrapping and page rhythm were checked. Owner visual approval is still required.

## Preservation and remaining boundaries

The About-only work preserves the homepage loader/gradient, six portfolio
motions and publication architecture, cinematic Services hero and five overview
chapters, five detail routes/FAQs, Contact and its unconfigured Formspree state,
shared navigation, signature footer, official links, Tenth Tech attribution and
preview `noindex, nofollow` safeguards. Their regression results are linked above.

The two external agency reference images mentioned in the brief were not
included in this submission or found among supplied attachment files. The
written art-direction requirements guided this redesign; no competitor graphics
are copied or claimed to have been inspected.

Cloud Chromium captures do not establish physical-device or Safari/Firefox
performance. Formspree still needs owner endpoint/recipient configuration and
live delivery verification. This milestone does not convert the existing
signature raster prototype into editable photorealistic 3D.

No automatic merge, deployment or push to the separate Netlify repository.
Stop for owner visual approval after final evidence and results are published.
