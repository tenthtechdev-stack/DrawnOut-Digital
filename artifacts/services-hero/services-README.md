# Services cinematic hero — actual production evidence

The first Services hero prototype uses the original supplied emblem and five custom SVG compositions. Existing overview content and detail pages remain below it. These are real browser views and continuous recordings from the local production build; no timeline seeking, CSS replacement or fabricated frames is used. Published clips omit only the first 0.12s of recorder-surface initialization, keeping playback speed and source-clock measurements unchanged.

[Capture facts, timings and screenshot hashes](services-capture-evidence.json) · [Production browser report](services-browser-tests.json) · [About refinement gallery](about-README.md)

## Continuous desktop and mobile loops

Both recordings exceed twenty seconds and show the initial right-side emblem, all five services, the large DrawnOut wordmark and the return into a second cycle. One early native scroll keeps the artwork and caption together in view. The app itself does not auto-scroll.

### 1440px

[Play desktop MP4](services-1440-cycle.mp4)

![Desktop Services loop preview](services-1440-cycle.gif)

### 390px

[Play mobile MP4](services-390-cycle.mp4)

![Mobile Services loop preview](services-390-cycle.gif)

## Five distinct service scenes

| Service                 | 1440px                                                         | 390px                                                        |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| Brand Identity & Design | ![Desktop identity scene](services-1440-scene-1.png)           | ![Mobile identity scene](services-390-scene-1.png)           |
| Digital Design          | ![Desktop digital scene](services-1440-scene-2.png)            | ![Mobile digital scene](services-390-scene-2.png)            |
| Marketing & Campaigns   | ![Desktop campaign scene](services-1440-scene-3.png)           | ![Mobile campaign scene](services-390-scene-3.png)           |
| Words & Storytelling    | ![Desktop storytelling scene](services-1440-scene-4.png)       | ![Mobile storytelling scene](services-390-scene-4.png)       |
| Creative Direction      | ![Desktop creative direction scene](services-1440-scene-5.png) | ![Mobile creative direction scene](services-390-scene-5.png) |

## Logo, wordmark and loop boundary

| View                    | 1440px                                                  | 390px                                                 |
| ----------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Initial right-side logo | ![Desktop start](services-1440-start.png)               | ![Mobile start](services-390-start.png)               |
| Wordmark and return     | ![Desktop wordmark](services-1440-wordmark.png)         | ![Mobile wordmark](services-390-wordmark.png)         |
| Final right pose        | ![Desktop return](services-1440-return.png)             | ![Mobile return](services-390-return.png)             |
| Actual loop restart     | ![Desktop loop restart](services-1440-loop-restart.png) | ![Mobile loop restart](services-390-loop-restart.png) |

## Static fallbacks and preserved continuation

| Width  | Reduced motion                                                                  | No JavaScript                                                               |
| ------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 390px  | [Hero](services-390-reduced.png) · [Full page](services-390-full-reduced.png)   | [Hero](services-390-no-js.png) · [Full page](services-390-full-no-js.png)   |
| 768px  | [Hero](services-768-reduced.png) · [Full page](services-768-full-reduced.png)   | Not separately captured                                                     |
| 1440px | [Hero](services-1440-reduced.png) · [Full page](services-1440-full-reduced.png) | [Hero](services-1440-no-js.png) · [Full page](services-1440-full-no-js.png) |

The SVG stage is decorative; service names, official copy and direct links remain semantic page content. Native scrolling and keyboard controls remain available. Software-rendered Chromium evidence does not establish field performance on physical devices, Safari or Firefox. The rest of the Services experience is intentionally unchanged pending hero approval. No merge, deployment or Netlify repository push is performed by this capture.
