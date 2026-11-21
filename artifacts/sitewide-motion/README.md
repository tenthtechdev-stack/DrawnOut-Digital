# Site-wide motion polish — owner review

Issue #23 · `feature/sitewide-motion-polish` · draft PR #24, stacked on Contact PR #22.

The repeated project-level playback buttons and their reserved layout space are removed. One compact, keyboard-accessible **Portfolio motion** preference replaces them. It appears at the viewport edge while eligible artwork is visible; otherwise it lives in a footer utility row. Reduced motion and Save Data automatically select Off. Playback waits for a working control and retains real artwork if enhancement fails.

All captures show the local production build in real Chromium, at their original screenshot dimensions. Desktop is 1440×900; mobile is 390×844. Mobile means touch/viewport emulation, not a physical-device performance certificate. Captures use ordinary navigation, native wheel scrolling and actual clocks; no timeline seeks, rewritten animation attributes, image retouching or compositing.

## Evidence provenance and validation

The current captures use review commit `1569b260dce67216444a4f0fe96cfe95ebb2905e`, whose application source is `d8cd4451582fb7936a20edc028575f429f65e6e0`. Before captures use immutable parent `b1c7db29a186c7413cad0bc5cdb59d62d5200f66`. [Evidence manifest](evidence-summary.json) records the file hashes, dimensions, actual scene clocks and source provenance. It verifies **90 captured PNGs and 12 MP4s**. All 12 recordings fully decoded successfully in the capture helpers; the main and scene captures recorded zero page errors and zero failed requests. No enquiry was submitted.

The focused checks are **24/24 new motion, 29/29 unchanged About and 42/42 unchanged Contact passing**. About and Contact ran freshly on `1569b26`. The 24 motion results retain their original `b2d8c42` run: [complete emitted-file comparison](external-ack-compiled-comparison.json) proves that their test/config files and all existing non-About HTML/JS/CSS inputs are identical in the final build. Only About HTML and its dedicated acknowledgement asset changed, so no fresh run of those 24 is claimed. [Focused result provenance](final-browser-validation.json).

The broader regression suite is reported separately in the [final validation report](../../docs/sitewide-motion/VALIDATION.md). Passing focused checks must not be read as an all-green full suite. [Performance findings and limitations](../../docs/sitewide-motion/PERFORMANCE.md) · [Implementation](../../docs/sitewide-motion/IMPLEMENTATION.md) · [Test mapping and retained failures](../../docs/sitewide-motion/TEST_MAPPING.md).

## Before and after — complete browsing journeys

| Viewport       | Immutable parent b1c7db2                    | Current implementation                    |
| -------------- | ------------------------------------------- | ----------------------------------------- |
| Desktop 1440px | [Before recording](before-1440-journey.mp4) | [After recording](after-1440-journey.mp4) |
| Mobile 390px   | [Before recording](before-390-journey.mp4)  | [After recording](after-390-journey.mp4)  |

The movies cover Home, real Work expansion and reverse scroll, SOL project navigation and a full native loop, actual global Off/On interactions in the new experience, tab-return observations, Contact's finite First Thought and ordinary form typing. The form is unconfigured and no enquiry is sent. [Before provenance](before-capture.json) · [After provenance](after-capture.json).

| Homepage composition | Desktop                                          | Mobile                                         |
| -------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Before               | ![Parent desktop homepage](before-1440-home.png) | ![Parent mobile homepage](before-390-home.png) |
| After                | ![Current desktop homepage](after-1440-home.png) | ![Current mobile homepage](after-390-home.png) |

## An uncluttered portfolio and one user preference

| Comparison                                                 | Desktop                                                  | Mobile                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Before — repeated project controls                         | ![Desktop parent project card](before-1440-home-sol.png) | ![Mobile parent project card](before-390-home-sol.png) |
| After — no individual project control or empty reservation | ![Desktop current project card](after-1440-home-sol.png) | ![Mobile current project card](after-390-home-sol.png) |
| Global Motion Off — real click                             | ![Desktop global Motion Off](after-1440-motion-off.png)  | ![Mobile global Motion Off](after-390-motion-off.png)  |
| Global Motion On — real click                              | ![Desktop global Motion On](after-1440-motion-on.png)    | ![Mobile global Motion On](after-390-motion-on.png)    |

The single preference stops repeating portfolio motion. Separate suitable controls for Services and the enquiry puzzle remain. [Implementation and WCAG 2.2.2 reasoning](../../docs/sitewide-motion/IMPLEMENTATION.md).

## Native Work expansion, preserved imagery and routes

| Project/state  | Desktop before                                             | Desktop after                                             | Mobile before                                             | Mobile after                                             |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Bunzo initial  | [View](before-1440-work-bunzo-initial.png)                 | [View](after-1440-work-bunzo-initial.png)                 | [View](before-390-work-bunzo-initial.png)                 | [View](after-390-work-bunzo-initial.png)                 |
| Bunzo middle   | [View](before-1440-work-bunzo-middle.png)                  | [View](after-1440-work-bunzo-middle.png)                  | [View](before-390-work-bunzo-middle.png)                  | [View](after-390-work-bunzo-middle.png)                  |
| Bunzo expanded | [View](before-1440-work-bunzo-expanded.png)                | [View](after-1440-work-bunzo-expanded.png)                | [View](before-390-work-bunzo-expanded.png)                | [View](after-390-work-bunzo-expanded.png)                |
| SOL initial    | [View](before-1440-work-sol-community-center-initial.png)  | [View](after-1440-work-sol-community-center-initial.png)  | [View](before-390-work-sol-community-center-initial.png)  | [View](after-390-work-sol-community-center-initial.png)  |
| SOL middle     | [View](before-1440-work-sol-community-center-middle.png)   | [View](after-1440-work-sol-community-center-middle.png)   | [View](before-390-work-sol-community-center-middle.png)   | [View](after-390-work-sol-community-center-middle.png)   |
| SOL expanded   | [View](before-1440-work-sol-community-center-expanded.png) | [View](after-1440-work-sol-community-center-expanded.png) | [View](before-390-work-sol-community-center-expanded.png) | [View](after-390-work-sol-community-center-expanded.png) |

The journey recordings include native reverse scrolling. These current keyframes show the complete composition expanding, with the static/animated rhythm retained; all corresponding parent images are linked above.

| Current expansion | Desktop                                                                                | Mobile                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Bunzo initial     | ![Desktop Bunzo initial composition](after-1440-work-bunzo-initial.png)                | ![Mobile Bunzo initial composition](after-390-work-bunzo-initial.png)                |
| Bunzo middle      | ![Desktop Bunzo middle expansion](after-1440-work-bunzo-middle.png)                    | ![Mobile Bunzo middle expansion](after-390-work-bunzo-middle.png)                    |
| Bunzo expanded    | ![Desktop Bunzo expanded composition](after-1440-work-bunzo-expanded.png)              | ![Mobile Bunzo expanded composition](after-390-work-bunzo-expanded.png)              |
| SOL initial       | ![Desktop SOL initial composition](after-1440-work-sol-community-center-initial.png)   | ![Mobile SOL initial composition](after-390-work-sol-community-center-initial.png)   |
| SOL middle        | ![Desktop SOL middle expansion](after-1440-work-sol-community-center-middle.png)       | ![Mobile SOL middle expansion](after-390-work-sol-community-center-middle.png)       |
| SOL expanded      | ![Desktop SOL expanded composition](after-1440-work-sol-community-center-expanded.png) | ![Mobile SOL expanded composition](after-390-work-sol-community-center-expanded.png) |

| Current SOL case, desktop                                   | Current SOL case, mobile                                  |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| ![Actual current desktop SOL case](after-1440-case-sol.png) | ![Actual current mobile SOL case](after-390-case-sol.png) |

The approved eleven cases, six motion compositions, order, curated static/motion rhythm, media budgets and case-study links remain intact. Shared scroll expansion now transforms the poster and video together so their crop and drift do not jump at the decoded-frame handoff.

## About — genuine startup before and after

| Viewport | Parent cold arrival                                     | Current cold arrival                                  |
| -------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Desktop  | [Before About recording](before-1440-about-startup.mp4) | [After About recording](after-1440-about-startup.mp4) |
| Mobile   | [Before About recording](before-390-about-startup.mp4)  | [After About recording](after-390-about-startup.mp4)  |

The scene manifests record the actual observed state, reason and clock. The parent desktop recording completed its ordered entrance. In this one parent mobile capture, the 550ms safeguard had already selected the static `boot-released` state before the first sample; this is an observed intermittent arrival, not a claim that every parent visit failed. The current parser-owned native entrance avoids the old external-module/duplicate-decode race; the original 550ms fail-open deadline remains. The source-pixel plaque stays explicitly a raster prototype.

| Current real startup sample | Desktop                                                      | Mobile                                                     |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Opening                     | ![Desktop About opening](after-1440-about-opening.png)       | ![Mobile About opening](after-390-about-opening.png)       |
| Plaque                      | ![Desktop About plaque arrival](after-1440-about-plaque.png) | ![Mobile About plaque arrival](after-390-about-plaque.png) |
| Atmosphere                  | ![Desktop About atmosphere](after-1440-about-atmosphere.png) | ![Mobile About atmosphere](after-390-about-atmosphere.png) |
| Copy                        | ![Desktop About copy](after-1440-about-copy.png)             | ![Mobile About copy](after-390-about-copy.png)             |
| Settled                     | ![Desktop About settled](after-1440-about-settled.png)       | ![Mobile About settled](after-390-about-settled.png)       |

[Before scene provenance](before-scenes-capture.json) · [After scene provenance](after-scenes-capture.json).

| About settled comparison | Desktop                                                        | Mobile                                                               |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Before                   | ![Parent desktop About settled](before-1440-about-settled.png) | ![Parent mobile About static fallback](before-390-about-settled.png) |
| After                    | ![Current desktop About settled](after-1440-about-settled.png) | ![Current mobile About settled](after-390-about-settled.png)         |

## Preserved Services, enquiry puzzle and reverse footer

- [Desktop Services → Brand Identity puzzle → reversible footer recording](after-1440-preserved-services-footer.mp4).
- [Mobile Services → Brand Identity puzzle → reversible footer recording](after-390-preserved-services-footer.mp4).

| Actual preserved composition     | Desktop                                                      | Mobile                                                     |
| -------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Services after one natural cycle | ![Desktop Services](after-1440-services-completed-cycle.png) | ![Mobile Services](after-390-services-completed-cycle.png) |
| Brand Identity puzzle composed   | ![Desktop enquiry puzzle](after-1440-puzzle-composed.png)    | ![Mobile enquiry puzzle](after-390-puzzle-composed.png)    |
| Footer expanded                  | ![Desktop signature footer](after-1440-footer-expanded.png)  | ![Mobile signature footer](after-390-footer-expanded.png)  |
| Footer reverse scroll            | ![Desktop reverse footer](after-1440-footer-reverse.png)     | ![Mobile reverse footer](after-390-footer-reverse.png)     |

The hand/emblem footer remains the existing raster prototype. This milestone does not claim new production-quality 3D.

## Contact remains usable and honest

| Preserved Contact       | Desktop                                              | Mobile                                             |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| First Thought settled   | ![Desktop Contact](after-1440-contact.png)           | ![Mobile Contact](after-390-contact.png)           |
| Native form interaction | ![Desktop Contact form](after-1440-contact-form.png) | ![Mobile Contact form](after-390-contact-form.png) |

The finite 4.8-second Contact reveal, official details and safe unconfigured form behavior are unchanged. Real Formspree account setup, recipient verification, privacy approval and live inbox/Reply-To testing remain separate owner dependencies.

| Contact form before | Desktop                                                      | Mobile                                                     |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Parent              | ![Parent desktop Contact form](before-1440-contact-form.png) | ![Parent mobile Contact form](before-390-contact-form.png) |

## All 12 recordings

The durations below come from the verified capture manifest. GitHub opens each original MP4; use its download/raw control if the browser does not preview a video inline.

| Recording                                                                            | Viewport | Duration |
| ------------------------------------------------------------------------------------ | -------- | -------- |
| [before-1440-journey.mp4](before-1440-journey.mp4)                                   | 1440px   | 54.56s   |
| [before-390-journey.mp4](before-390-journey.mp4)                                     | 390px    | 41.64s   |
| [before-1440-about-startup.mp4](before-1440-about-startup.mp4)                       | 1440px   | 7.52s    |
| [before-390-about-startup.mp4](before-390-about-startup.mp4)                         | 390px    | 7.00s    |
| [after-1440-journey.mp4](after-1440-journey.mp4)                                     | 1440px   | 53.48s   |
| [after-390-journey.mp4](after-390-journey.mp4)                                       | 390px    | 43.44s   |
| [after-1440-about-startup.mp4](after-1440-about-startup.mp4)                         | 1440px   | 7.96s    |
| [after-1440-preserved-services-footer.mp4](after-1440-preserved-services-footer.mp4) | 1440px   | 51.08s   |
| [after-390-about-startup.mp4](after-390-about-startup.mp4)                           | 390px    | 6.92s    |
| [after-390-preserved-services-footer.mp4](after-390-preserved-services-footer.mp4)   | 390px    | 35.40s   |
| [native-background-1440.mp4](native-background-1440.mp4)                             | 1440px   | 10.48s   |
| [native-background-390.mp4](native-background-390.mp4)                               | 390px    | 8.48s    |

The two `native-background` recordings are **visible continuity/return observations only**. Ordinary tab activation in both headless Chromium and headed Chromium with the Ozone headless display left `document.hidden=false`. They do not demonstrate real hidden-tab suspension. [Actual visibility measurements](native-background-capture.json).

## Native loop compositor proof

The [current test proof](current-loop-compositor-proof.json) retains 14 unchanged browser viewport screenshots spanning one natural SOL loop, its advancing presented-frame counter and source lifecycle observations. Its `b2d8c42` runtime inputs are verified against the final build by the comparison above. No timeline seek or source reload was introduced for capture.

| Around native loop | Current rendered frame                                              |
| ------------------ | ------------------------------------------------------------------- |
| Before wrap        | ![Current SOL frame before natural loop](current-loop-frame-00.png) |
| Across wrap        | ![Current SOL frame across natural loop](current-loop-frame-02.png) |
| After wrap         | ![Current SOL frame after natural loop](current-loop-frame-13.png)  |

Current sequence: [00](current-loop-frame-00.png) · [01](current-loop-frame-01.png) · [02](current-loop-frame-02.png) · [03](current-loop-frame-03.png) · [04](current-loop-frame-04.png) · [05](current-loop-frame-05.png) · [06](current-loop-frame-06.png) · [07](current-loop-frame-07.png) · [08](current-loop-frame-08.png) · [09](current-loop-frame-09.png) · [10](current-loop-frame-10.png) · [11](current-loop-frame-11.png) · [12](current-loop-frame-12.png) · [13](current-loop-frame-13.png).

The [earlier diagnostic proof](loop-compositor-proof.json) and its separate 14 images remain available. It used source `5382c75d9bdf9c1f60edf5f5c8862511cea60fef`; an original human label incorrectly called it “d9.” The report preserves that label and records the correct commit and compiled Contact hash. It is historical evidence, not a fresh final-build run or the original readiness-boundary failure sample.

Historical sequence: [00](loop-proof-00.png) · [01](loop-proof-01.png) · [02](loop-proof-02.png) · [03](loop-proof-03.png) · [04](loop-proof-04.png) · [05](loop-proof-05.png) · [06](loop-proof-06.png) · [07](loop-proof-07.png) · [08](loop-proof-08.png) · [09](loop-proof-09.png) · [10](loop-proof-10.png) · [11](loop-proof-11.png) · [12](loop-proof-12.png) · [13](loop-proof-13.png).

## Complete index of 90 captured PNGs

The following index links every PNG declared in the five capture manifests. These are the original files, separate from the 28 current/historical loop-proof PNGs above. Additional regression failure attachments, if any, are catalogued in the validation report.

### Before — homepage, Work, case and Contact (22)

| Screenshot                                                                                               | Dimensions |
| -------------------------------------------------------------------------------------------------------- | ---------- |
| [before-1440-home.png](before-1440-home.png)                                                             | 1440×900   |
| [before-1440-home-sol.png](before-1440-home-sol.png)                                                     | 1440×900   |
| [before-1440-work-bunzo-initial.png](before-1440-work-bunzo-initial.png)                                 | 1440×900   |
| [before-1440-work-bunzo-middle.png](before-1440-work-bunzo-middle.png)                                   | 1440×900   |
| [before-1440-work-bunzo-expanded.png](before-1440-work-bunzo-expanded.png)                               | 1440×900   |
| [before-1440-work-sol-community-center-initial.png](before-1440-work-sol-community-center-initial.png)   | 1440×900   |
| [before-1440-work-sol-community-center-middle.png](before-1440-work-sol-community-center-middle.png)     | 1440×900   |
| [before-1440-work-sol-community-center-expanded.png](before-1440-work-sol-community-center-expanded.png) | 1440×900   |
| [before-1440-case-sol.png](before-1440-case-sol.png)                                                     | 1440×900   |
| [before-1440-contact.png](before-1440-contact.png)                                                       | 1440×900   |
| [before-1440-contact-form.png](before-1440-contact-form.png)                                             | 1440×900   |
| [before-390-home.png](before-390-home.png)                                                               | 390×844    |
| [before-390-home-sol.png](before-390-home-sol.png)                                                       | 390×844    |
| [before-390-work-bunzo-initial.png](before-390-work-bunzo-initial.png)                                   | 390×844    |
| [before-390-work-bunzo-middle.png](before-390-work-bunzo-middle.png)                                     | 390×844    |
| [before-390-work-bunzo-expanded.png](before-390-work-bunzo-expanded.png)                                 | 390×844    |
| [before-390-work-sol-community-center-initial.png](before-390-work-sol-community-center-initial.png)     | 390×844    |
| [before-390-work-sol-community-center-middle.png](before-390-work-sol-community-center-middle.png)       | 390×844    |
| [before-390-work-sol-community-center-expanded.png](before-390-work-sol-community-center-expanded.png)   | 390×844    |
| [before-390-case-sol.png](before-390-case-sol.png)                                                       | 390×844    |
| [before-390-contact.png](before-390-contact.png)                                                         | 390×844    |
| [before-390-contact-form.png](before-390-contact-form.png)                                               | 390×844    |

### After — homepage, preference, Work, case and Contact (26)

| Screenshot                                                                                             | Dimensions |
| ------------------------------------------------------------------------------------------------------ | ---------- |
| [after-1440-home.png](after-1440-home.png)                                                             | 1440×900   |
| [after-1440-home-sol.png](after-1440-home-sol.png)                                                     | 1440×900   |
| [after-1440-work-bunzo-initial.png](after-1440-work-bunzo-initial.png)                                 | 1440×900   |
| [after-1440-work-bunzo-middle.png](after-1440-work-bunzo-middle.png)                                   | 1440×900   |
| [after-1440-work-bunzo-expanded.png](after-1440-work-bunzo-expanded.png)                               | 1440×900   |
| [after-1440-work-sol-community-center-initial.png](after-1440-work-sol-community-center-initial.png)   | 1440×900   |
| [after-1440-work-sol-community-center-middle.png](after-1440-work-sol-community-center-middle.png)     | 1440×900   |
| [after-1440-work-sol-community-center-expanded.png](after-1440-work-sol-community-center-expanded.png) | 1440×900   |
| [after-1440-case-sol.png](after-1440-case-sol.png)                                                     | 1440×900   |
| [after-1440-motion-off.png](after-1440-motion-off.png)                                                 | 1440×900   |
| [after-1440-motion-on.png](after-1440-motion-on.png)                                                   | 1440×900   |
| [after-1440-contact.png](after-1440-contact.png)                                                       | 1440×900   |
| [after-1440-contact-form.png](after-1440-contact-form.png)                                             | 1440×900   |
| [after-390-home.png](after-390-home.png)                                                               | 390×844    |
| [after-390-home-sol.png](after-390-home-sol.png)                                                       | 390×844    |
| [after-390-work-bunzo-initial.png](after-390-work-bunzo-initial.png)                                   | 390×844    |
| [after-390-work-bunzo-middle.png](after-390-work-bunzo-middle.png)                                     | 390×844    |
| [after-390-work-bunzo-expanded.png](after-390-work-bunzo-expanded.png)                                 | 390×844    |
| [after-390-work-sol-community-center-initial.png](after-390-work-sol-community-center-initial.png)     | 390×844    |
| [after-390-work-sol-community-center-middle.png](after-390-work-sol-community-center-middle.png)       | 390×844    |
| [after-390-work-sol-community-center-expanded.png](after-390-work-sol-community-center-expanded.png)   | 390×844    |
| [after-390-case-sol.png](after-390-case-sol.png)                                                       | 390×844    |
| [after-390-motion-off.png](after-390-motion-off.png)                                                   | 390×844    |
| [after-390-motion-on.png](after-390-motion-on.png)                                                     | 390×844    |
| [after-390-contact.png](after-390-contact.png)                                                         | 390×844    |
| [after-390-contact-form.png](after-390-contact-form.png)                                               | 390×844    |

### Before — About scenes (12)

| Screenshot                                                           | Dimensions |
| -------------------------------------------------------------------- | ---------- |
| [before-1440-about-opening.png](before-1440-about-opening.png)       | 1440×900   |
| [before-1440-about-plaque.png](before-1440-about-plaque.png)         | 1440×900   |
| [before-1440-about-atmosphere.png](before-1440-about-atmosphere.png) | 1440×900   |
| [before-1440-about-copy.png](before-1440-about-copy.png)             | 1440×900   |
| [before-1440-about-settled.png](before-1440-about-settled.png)       | 1440×900   |
| [before-1440-about-story.png](before-1440-about-story.png)           | 1440×900   |
| [before-390-about-opening.png](before-390-about-opening.png)         | 390×844    |
| [before-390-about-plaque.png](before-390-about-plaque.png)           | 390×844    |
| [before-390-about-atmosphere.png](before-390-about-atmosphere.png)   | 390×844    |
| [before-390-about-copy.png](before-390-about-copy.png)               | 390×844    |
| [before-390-about-settled.png](before-390-about-settled.png)         | 390×844    |
| [before-390-about-story.png](before-390-about-story.png)             | 390×844    |

### After — About, Services, puzzle and footer scenes (28)

| Screenshot                                                                         | Dimensions |
| ---------------------------------------------------------------------------------- | ---------- |
| [after-1440-about-opening.png](after-1440-about-opening.png)                       | 1440×900   |
| [after-1440-about-plaque.png](after-1440-about-plaque.png)                         | 1440×900   |
| [after-1440-about-atmosphere.png](after-1440-about-atmosphere.png)                 | 1440×900   |
| [after-1440-about-copy.png](after-1440-about-copy.png)                             | 1440×900   |
| [after-1440-about-settled.png](after-1440-about-settled.png)                       | 1440×900   |
| [after-1440-about-story.png](after-1440-about-story.png)                           | 1440×900   |
| [after-1440-services-opening.png](after-1440-services-opening.png)                 | 1440×900   |
| [after-1440-services-middle.png](after-1440-services-middle.png)                   | 1440×900   |
| [after-1440-services-completed-cycle.png](after-1440-services-completed-cycle.png) | 1440×900   |
| [after-1440-puzzle-early.png](after-1440-puzzle-early.png)                         | 1440×900   |
| [after-1440-puzzle-composed.png](after-1440-puzzle-composed.png)                   | 1440×900   |
| [after-1440-footer-arrive.png](after-1440-footer-arrive.png)                       | 1440×900   |
| [after-1440-footer-expanded.png](after-1440-footer-expanded.png)                   | 1440×900   |
| [after-1440-footer-reverse.png](after-1440-footer-reverse.png)                     | 1440×900   |
| [after-390-about-opening.png](after-390-about-opening.png)                         | 390×844    |
| [after-390-about-plaque.png](after-390-about-plaque.png)                           | 390×844    |
| [after-390-about-atmosphere.png](after-390-about-atmosphere.png)                   | 390×844    |
| [after-390-about-copy.png](after-390-about-copy.png)                               | 390×844    |
| [after-390-about-settled.png](after-390-about-settled.png)                         | 390×844    |
| [after-390-about-story.png](after-390-about-story.png)                             | 390×844    |
| [after-390-services-opening.png](after-390-services-opening.png)                   | 390×844    |
| [after-390-services-middle.png](after-390-services-middle.png)                     | 390×844    |
| [after-390-services-completed-cycle.png](after-390-services-completed-cycle.png)   | 390×844    |
| [after-390-puzzle-early.png](after-390-puzzle-early.png)                           | 390×844    |
| [after-390-puzzle-composed.png](after-390-puzzle-composed.png)                     | 390×844    |
| [after-390-footer-arrive.png](after-390-footer-arrive.png)                         | 390×844    |
| [after-390-footer-expanded.png](after-390-footer-expanded.png)                     | 390×844    |
| [after-390-footer-reverse.png](after-390-footer-reverse.png)                       | 390×844    |

### Visible tab-return probes (2)

| Screenshot                                                                 | Dimensions |
| -------------------------------------------------------------------------- | ---------- |
| [native-background-1440-returned.png](native-background-1440-returned.png) | 1440×900   |
| [native-background-390-returned.png](native-background-390-returned.png)   | 390×844    |

## Performance, failures and limitations

Use the final validation report for measured playback, source leases, frame callbacks, native loop comparisons, exact browser failures and baseline differences. Actual rendered evidence and decoded media checks accompany the report; no 60fps or physical-device GPU guarantee is claimed.

The native background probe is separate from the main headless journeys. Read its actual `document.hidden`/visibility measurements and platform errors before treating it as proof. Main headless tab activation kept the recorded page visible; that is explicitly not hidden-tab evidence.

No merge, deployment, Netlify mirror push or live form activation is part of this review. Stop for owner visual approval.
