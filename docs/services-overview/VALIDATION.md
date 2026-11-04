# Services Stage 2 — review validation

Draft [PR #14](https://github.com/tenthtech/drawnout-digital/pull/14) targets
`feature/services-cinematic-hero` (draft PR #12, stacked on PR #10).
The branch was created only after the owner-correction checkpoint was pushed,
and incorporates the parent's completed corrections and review evidence.

[Authoritative brief](IMPLEMENTATION_BRIEF.md) ·
[Artwork provenance and handoff](ARTWORK_AND_HANDOFF.md) ·
[Chapter gallery and recordings](../../artifacts/services-overview/README.md).

## Implementation and preservation

Five original editorial illustrations replace the simple overview rows below
the approved cinematic hero. Canonical titles, propositions, order and routes
remain unchanged. Each chapter has substantial artwork, a descriptive native
link and an illustrative-study caption. Desktop alternates artwork/text; mobile
uses natural document height and a clear reading order.

No filters, tabs, section pinning or scroll hijacking are introduced. Static
HTML contains all content and artwork. Optional decorative entry motion settles
on keyboard focus, reduced motion and Save Data; backscroll keeps artwork stable.
No new package, image service or continuous rendering loop was added.

Stage 1 hero markup, source artwork, runtime and CSS are unchanged. All five
detail pages/FAQs, Contact, official links, footer credit/choreography, approved
portfolio assets and all six motions are preserved. The only application files
changed from the parent are the overview component, five original SVG artwork
components, scoped styles/entry module and their integration into `/services`.

## Actual automated results

| Check                                                     | Observed result                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Production build                                          | Passed, 22 routes                                                                 |
| Astro/TypeScript                                          | Passed, 158 files; zero errors/warnings/hints                                     |
| ESLint                                                    | Passed                                                                            |
| Formatting                                                | Passed                                                                            |
| Unit suite                                                | Passed, 46 tests                                                                  |
| Build-output tests                                        | Passed, 6 tests                                                                   |
| About output/privacy tests                                | Passed, 2 tests                                                                   |
| Publication/withdrawal integration                        | Passed, 1 test                                                                    |
| Focused overview browser checks                           | All 11 cases have passing observations: 9 initial + 2 corrected navigation checks |
| Service hero/detail and portfolio integration regressions | Passed, 44 tests: 15 hero + 17 service/detail + 12 portfolio motion               |

Focused checks cover 320/390/768/1440 layouts, one H1, exact canonical copy and
routes, zero horizontal overflow, alternating desktop geometry, visible keyboard
focus, axe accessibility, all five detail pages and their original FAQ content,
no-JS, failed bundles, Save Data and actual forward/reverse native scrolling.

The initial focused run passed 9/11. Both failures came from comparing the full
FAQ summary text with the question while the unchanged summary also contains an
aria-hidden plus sign. The corrected assertion checks the exact accessible
question; both desktop/mobile all-five-route cases then passed. No FAQ or page
behavior was changed to satisfy the test. The
[initial report](../../artifacts/services-overview/initial-browser-tests.json) and
[corrected navigation report](../../artifacts/services-overview/navigation-browser-tests.json)
are retained. There are no retries or skipped cases in those runs.

The final integration regressions passed in three complete, separately saved
batches, with no failures, retries or skipped cases:
[Services hero: 15/15](../../artifacts/services-overview/services-hero-regression.json),
[service pages and navigation: 17/17](../../artifacts/services-overview/services-regression.json),
and [portfolio motion: 12/12](../../artifacts/services-overview/portfolio-motion-regression.json).
An earlier combined run was interrupted by the environment after two cases and
is not counted as a completed run. The final batches ran against the same
production build used for the captured implementation.

Parent corrections have 139 distinct passing browser observations across the
appropriate production/development runs; see the
[parent validation](../owner-corrections/VALIDATION.md) for their initial failures,
mode correction, timings, source hashes and asset status.

## Visual evidence and remaining boundary

24 real screenshots show each chapter at 320/390/768/1440, plus reduced-motion
and no-JS overviews. Native silent H.264 recordings last **40.24s at 390×844**
and **32.40s at 1440×900**, showing forward/reverse scrolling and real visits to
all five detail pages. Each visit verified the original headline and five FAQs.
The [capture manifest](../../artifacts/services-overview/capture-evidence.json)
records source hashes, actual viewport dimensions, video metadata and zero page
errors or failed requests. No timeline seeking or replacement CSS was used.

Whole-chapter stills use an explicitly recorded 1100px viewport height so their
full illustration and caption fit before capture. This corrected Chromium's
partial offscreen SVG capture in the initial stills; live viewport inspection
confirmed the page itself did not clip the artwork. The native recordings and
responsive tests retain ordinary 844/900px heights. All five desktop/mobile
compositions were visually reviewed. Application source is unchanged from the
captured implementation; only capture tooling and evidence were adjusted.

Individual detail-page mosaics and the puzzle enquiry animation are later
milestones. The About 3D emblem still requires verified editable geometry and
asset approval; the existing footer hand/plaque remains a separated raster
prototype. Formspree still needs owner configuration/live delivery verification.
Cloud Chromium software rendering does not establish physical-device or
Safari/Firefox performance. No PR merge, deployment or Netlify mirror push.
