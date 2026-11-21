# Site-wide motion performance and reliability

Issue #23 · branch `feature/sitewide-motion-polish` · draft [PR #24](https://github.com/tenthtech/drawnout-digital/pull/24), stacked on Contact PR #22. The [visual gallery](../../artifacts/sitewide-motion/README.md) contains the desktop/mobile evidence. The [validation report](VALIDATION.md) owns the complete pass/fail classification; this document describes measured behavior and its limits.

## Measurement scope and provenance

The before recordings use immutable parent `b1c7db29a186c7413cad0bc5cdb59d62d5200f66`. After recordings use review commit `1569b260dce67216444a4f0fe96cfe95ebb2905e`, application source `d8cd4451582fb7936a20edc028575f429f65e6e0`. The evidence is a real local production build in Chromium 154.0.8037.57 with software rendering/SwiftShader. Desktop is 1440×900; mobile is touch/viewport emulation at 390×844. Physical iOS, Android, Safari and hardware GPU performance are not certified.

The [capture manifest](../../artifacts/sitewide-motion/evidence-summary.json) verifies 90 PNGs and 12 MP4s by saved SHA-256, PNG/MP4 file signatures and recorded dimensions. Every MP4 fully decoded successfully in its capture helper. Main and scene captures had zero page errors and zero failed requests. Browser videos use ordinary navigation and native wheel input. No animation timelines were sought, state attributes rewritten, or images retouched. H.264 transcodes retain the real browser recording timing. Capture scripts are reproducible in `scripts/capture-sitewide-motion.mjs`, `scripts/capture-sitewide-scenes.mjs` and `scripts/capture-native-background.mjs`.

The focused results are 24/24 new motion, 29/29 unchanged About and 42/42 unchanged Contact checks passing. About and Contact ran freshly on review commit `1569b26`. The 24 motion results retain their original `b2d8c4248b44ba19907525945331ee25a65d3b07` execution and timestamps: the [complete compiled-input comparison](../../artifacts/sitewide-motion/external-ack-compiled-comparison.json) proves all existing non-About HTML/JS/CSS bytes and their test/config inputs remain identical. That suite does not visit About; only About HTML and its dedicated acknowledgement asset changed afterward. These are reused results with verified matching inputs, not a newly claimed execution. [Focused report](../../artifacts/sitewide-motion/final-browser-validation.json).

## Resource budget and playback policy

| Concern                | Implemented policy                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concurrent media       | At most one loaded source/playing artwork on mobile or coarse pointers; two on desktop. Paused warm sources count toward the same lease budget.                 |
| Selection stability    | Enter at 35% visibility, retain an eligible incumbent down to 20%, and require an 8 percentage-point advantage when switching. This reduces boundary thrashing. |
| Decoder handoff        | Evict lower-priority leases before loading replacements. A real `requestVideoFrameCallback` presentation gates the 180ms poster-to-video fade.                  |
| Ordinary suspension    | Pause without resetting current time or discarding the last decoded frame. Release genuinely offscreen sources after 1.5s and background sources after 15s.     |
| Explicit static choice | Global Off, reduced motion, Save Data and filtered-out artwork release their sources immediately.                                                               |
| Necessary unload       | Remember playback phase in a WeakMap, restoring it after a source/orientation change or native history restoration when still eligible.                         |
| Control failure        | Autoplay waits for the preference control's readiness acknowledgement; partial enhancement failure retains readable static artwork.                             |
| Scroll work            | Native scroll is retained. Work's existing changed-only RAF remains; no perpetual portfolio polling ticker is added.                                            |
| Existing hero gradient | Its existing resolution/frame cap and hidden/offscreen/intro suspension remain. No new WebGL loop or shader is introduced here.                                 |

A single keyboard-accessible portfolio preference replaces the repeated project buttons, handlers and reserved 52px rows. It is On by default when device preferences allow it, uses `drawnout:portfolio-motion` for the visitor's choice, handles storage errors in memory, and responds to cross-tab updates. Reduced motion and Save Data enforce Off. No-JavaScript output retains static artwork and hides the unusable preference control. This is explicitly a portfolio preference: the distinct Services/puzzle controls remain intact. See [control scope and accessibility reasoning](IMPLEMENTATION.md).

## Before/after SOL playback observations

The journey captures traverse Home, Work expansion/reversal and a real SOL case, then observe more than the 7.5-second native media loop. These are finite browser-counter deltas during recording, not controlled hardware benchmarks.

| Case observation                               | Parent desktop | Current desktop | Parent mobile | Current mobile |
| ---------------------------------------------- | -------------- | --------------- | ------------- | -------------- |
| Browser total-video-frame delta                | 196            | 194             | 190           | 190            |
| Browser dropped-frame delta                    | 4              | 10              | 9             | 0              |
| Same source throughout full loop               | Yes            | Yes             | Yes           | Yes            |
| Maximum loaded sources in recorded snapshots   | 1              | 1               | 1             | 1              |
| Maximum playing artworks in recorded snapshots | 1              | 1               | 1             | 1              |

[Before raw capture](../../artifacts/sitewide-motion/before-capture.json) · [After raw capture](../../artifacts/sitewide-motion/after-capture.json).

The desktop dropped-frame count increased in this sample while mobile decreased. Different wall-clock scheduling, screenshot work and software rendering prevent an FPS improvement claim. The snapshots establish observed maxima of one for these journeys, not saturation of every desktop two-source scenario; the deterministic browser tests separately enforce the configured lease limits.

## Natural loop and actual painted output

The [current loop proof](../../artifacts/sitewide-motion/current-loop-compositor-proof.json) runs through one natural 7.5-second SOL wrap over 8.683 seconds of sampling. It recorded:

- 199 `requestVideoFrameCallback` samples with strictly advancing presented-frame counters; browser total-video-frame delta 209 and dropped-frame delta 8.
- Callback interval median 49.9ms, p95 66.7ms and maximum 116.7ms under SwiftShader and screenshot work.
- Zero source mutations, `load`, `play` or `emptied` events during the observed interval; one native loop `seeking` event.
- Fourteen unchanged viewport PNGs spanning the wrap. Their unobscured SOL background patch matches the immutable source poster's expected RGB `[39, 99, 49]` within a five-level tolerance; the maximum observed channel difference is two.

The [14 current frames](../../artifacts/sitewide-motion/README.md#native-loop-compositor-proof) are compositor evidence across this sampled loop. They do not prove every pixel of every future device frame, nor do callback intervals establish a physical-device frame rate.

Earlier new-test runs had one failure because a queued frame callback could observe `readyState=1` at a native loop seek even while presented-frame counters advanced. Those failures remain archived. The strengthened current criterion checks the actual painted viewport and advancing submitted-frame counters, while retaining readiness, source and cadence diagnostics. It does not relax the old baseline suite. [Test changes and preserved raw evidence](TEST_MAPPING.md).

The separate [historical diagnostic](../../artifacts/sitewide-motion/loop-compositor-proof.json) uses source `5382c75d9bdf9c1f60edf5f5c8862511cea60fef`, not the later build implied by its original “d9” human label. Its correct source hash and original label are both retained. Its 14 images are historical and are not substituted for the current proof or the exact earlier readiness-failure instant.

## Poster alignment and motion continuity

The shared homepage scroll effect previously transformed a poster independently of its sibling video. Both now receive identical scale and drift, including focus settlement and responsive cleanup. This prevents a crop/position jump when an already decoded video replaces the poster. Work's approved expansion geometry, case artwork, six encoded compositions and eleven case routes are preserved. A short return within the warm grace period reuses the retained frame and phase; a genuine resource release still keeps the approved poster available until a newly presented video frame exists.

The current unit/media/publication checks preserve the actual approved media bytes and attribution gates. The scoped guard compares 434 protected parent source/assets/config/test files byte-for-byte outside the explicit Issue #23 edits. Three older whole-site preservation assertions fail because their previous-milestone allowlists prohibit this newly authorized work, including deletion of the old toggle; those historical tests and their failures are retained, not rewritten into a green result. The [validation report](VALIDATION.md) distinguishes those scope failures from application failures.

## About startup: real clock, existing fallback

The old parser-time 550ms fail-open gate raced heavy module loading and a duplicate image decode. The new native cohort is prepared beside the markup; a tiny external acknowledgement asset confirms enhancement availability independently of the heavy editorial module. Prepared effects start on one fresh browser frame using `performance.now()` at actual callback execution, and scene timers share that epoch. A parser-time document clock or stale shared rAF timestamp is not reused. The external acknowledgement remains external so blocked/delayed-module tests can genuinely exercise the existing failure contract.

The approved sequence is retained: portrait first, plaque, atmosphere, copy and settled composition. The 550ms fail-open deadline and early-input settlement remain. The real final capture sampled:

| Natural sample target  | Desktop observed                                        | Mobile observed                                                                                            |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Opening near 180ms     | Portrait opacity 0.592; plaque, gradient and headline 0 | Portrait opacity 0.788; plaque, gradient and headline 0; first markup sample already showed portrait 0.713 |
| Plaque near 900ms      | Plaque 0.730; headline 0                                | Plaque 0.647; headline 0                                                                                   |
| Atmosphere near 1450ms | Gradient 0.675; headline 0                              | Gradient 0.658; headline 0                                                                                 |
| Copy near 2250ms       | Headline 0.777                                          | Headline 0.812                                                                                             |
| Settled near 3950ms    | All visible; reason `complete`                          | All visible; reason `complete`                                                                             |

These are actual sampled values, not exact mandated frame times; screenshot work can move a sample beyond its target. The parent desktop capture also completed its ordered entrance. This one parent mobile capture selected static `boot-released` before its first sample, illustrating an observed intermittent fallback rather than universal failure. [Before scene measurements](../../artifacts/sitewide-motion/before-scenes-capture.json) · [After scene measurements](../../artifacts/sitewide-motion/after-scenes-capture.json).

The unchanged 29-test About suite passes freshly, including early input, real order, reduced motion, Save Data, disabled JavaScript and blocked/delayed scripts. The 42 Contact checks also pass freshly; Contact's finite 4.8-second First Thought remains independent of form interaction. Services, its enquiry puzzle and the reversible raster footer are preserved in the desktop/mobile recordings.

## Background visibility evidence limitation

Ordinary tab activation was attempted both in headless Chromium and headed Chromium using the Ozone headless display. The recorded page continued to report `document.hidden=false` and `visibilityState=visible` at both widths. The [native-background recordings and measurements](../../artifacts/sitewide-motion/native-background-capture.json) establish visible continuity and return only. They are **not real hidden-tab suspension proof**. Controlled lifecycle fixtures pass and verify the hidden-state policy, but do not replace a physical-browser visibility check.

A native display backend was unavailable in this environment. An optional package-download attempt to supply one did not execute because automatic approval review hit a usage limit. No restriction was bypassed. A real desktop browser should still be checked for hidden-tab pause, 15-second release and phase-safe return before release, alongside physical-device decode/GPU behavior.

## Review boundary and remaining dependencies

The [final validation report](VALIDATION.md) separates the parent 233/244 historical browser result, bounded reproduction of its eleven failures, focused passes and the final broader run. A pass in one subset is not a full-suite claim. No assertion is removed or weakened to conceal failures.

The hand/emblem footer and About plaque remain the existing raster/2.5D prototypes. No production-quality photorealistic 3D is claimed. Formspree is still unconfigured: the owner must supply its real public endpoint, verify `official@drawnoutdigital.com`, approve privacy wording/spam controls and test accepted submissions, Reply-To and actual inbox delivery. The recordings contain only synthetic typing; no provider delivery is asserted.

No merge, deployment, Netlify preview-repository push or live form activation is included. Owner visual approval and the documented device/provider dependencies remain the next gate.
