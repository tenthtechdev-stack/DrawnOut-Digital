# Premium About — visual review

Draft [PR #16](https://github.com/tenthtech/drawnout-digital/pull/16), stacked on
PR #14's `feature/services-overview-chapters` branch.

[Validation report](../../docs/about-premium/VALIDATION.md) ·
[Design and scope](../../docs/about-premium/DESIGN_AND_SCOPE.md) ·
[Asset provenance](../../docs/about-premium/ASSET_PROVENANCE.md).

**Capture complete:** 34 new screenshots, four before-comparison images and four real recordings. The five responsive widths, reduced-motion and no-JavaScript views are included. Capture observed zero page errors and zero failed requests.

The plaque is the approved existing raster object in a layered presentation,
not a new editable 3D model. Both founders use the approved derived illustration;
the original photograph stays private. Names are not assigned to portrait sides.

## Real motion recordings

- [Desktop hero arrival — 1440px](about-1440-arrival.mp4)
- [Mobile hero arrival — 390px](about-390-arrival.mp4)
- [Desktop editorial scroll and reverse process](about-1440-scroll-and-reverse.mp4)
- [Mobile editorial scroll and reverse process](about-390-scroll-and-reverse.mp4)

Native recordings use 1440×900 and 390×844 viewports. H.264 exports preserve the
original untrimmed timing. Arrival clips last 7.28s desktop / 7.80s mobile; scroll/reverse clips last 28.52s / 28.24s. The approximately 3.50s entrance reached its final state 4.015s / 3.787s after navigation, including startup. The [capture manifest](capture-evidence.json) records
source hashes, actual timings, viewport dimensions and observed browser errors. Long screenshots use Chromium’s native software compositor to avoid the cloud graphics backend’s 8192px capture limit; they are not stitched or restyled. Recordings and individual viewport stills are unchanged.

## Desktop — final hero and full page

![Desktop About hero at 1440px](about-1440-hero.png)

[Open the complete desktop composition](about-1440-full-page.png).

<details>
<summary>Desktop full-page screenshot</summary>

![Complete desktop About page at 1440px](about-1440-full-page.png)

</details>

## Mobile — final hero and full page

![Mobile About hero at 390px](about-390-hero.png)

[Open the complete mobile composition](about-390-full-page.png).

<details>
<summary>Mobile full-page screenshot</summary>

![Complete mobile About page at 390px](about-390-full-page.png)

</details>

## Responsive compositions

### 1024px

![About hero at 1024px](about-1024-hero.png)

[Complete 1024px page](about-1024-full-page.png).

### 768px

![About hero at 768px](about-768-hero.png)

[Complete 768px page](about-768-full-page.png).

### 320px

![About hero at 320px](about-320-hero.png)

[Complete 320px page](about-320-full-page.png).

## Seven editorial chapters

These are actual section viewports. Longer chapters continue below the visible
viewport; use the full-page images and scrolling recordings to inspect them.

### 01 — Origin story

![Desktop origin chapter](about-1440-origin.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile origin chapter](about-390-origin.png)

</details>

### 02 — Meet the founders

![Desktop founders chapter](about-1440-founders.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile founders chapter](about-390-founders.png)

</details>

### 03 — What we believe

![Desktop manifesto chapter](about-1440-manifesto.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile manifesto chapter](about-390-manifesto.png)

</details>

### 04 — From the first scribble to the final detail

![Desktop process chapter](about-1440-process.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile process chapter](about-390-process.png)

</details>

### 05 — The DrawnOut difference

![Desktop difference chapter](about-1440-difference.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile difference chapter](about-390-difference.png)

</details>

### 06 — Capabilities bridge

![Desktop capabilities chapter](about-1440-capabilities.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile capabilities chapter](about-390-capabilities.png)

</details>

### 07 — Closing invitation

![Desktop invitation chapter](about-1440-invitation.png)

<details>
<summary>Mobile chapter view</summary>

![Mobile invitation chapter](about-390-invitation.png)

</details>

## Reduced-motion and no-JavaScript fallbacks

The static views use browser preferences or disabled JavaScript, without
replacement styles. The full-page captures include all lazy-loaded media.

| Mode           | Desktop                                                                                           | Mobile                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Reduced motion | [Hero](about-1440-reduced-motion-hero.png) · [Full page](about-1440-reduced-motion-full-page.png) | [Hero](about-390-reduced-motion-hero.png) · [Full page](about-390-reduced-motion-full-page.png) |
| No JavaScript  | [Hero](about-1440-no-js-hero.png) · [Full page](about-1440-no-js-full-page.png)                   | [Hero](about-390-no-js-hero.png) · [Full page](about-390-no-js-full-page.png)                   |

<details>
<summary>Reduced-motion hero views</summary>

![Desktop reduced-motion hero](about-1440-reduced-motion-hero.png)

![Mobile reduced-motion hero](about-390-reduced-motion-hero.png)

</details>

<details>
<summary>No-JavaScript hero views</summary>

![Desktop no-JavaScript hero](about-1440-no-js-hero.png)

![Mobile no-JavaScript hero](about-390-no-js-hero.png)

</details>

## Before and after

The before views show the actual unchanged parent at
`82e791c03496511bec540bf3516ed60ffde69fef`, with native no-JavaScript rendering.
They are not a recreated mockup. [Before capture facts](before-evidence.json).

| Composition       | Before                                    | New redesign                               |
| ----------------- | ----------------------------------------- | ------------------------------------------ |
| Desktop hero      | [Parent hero](before-1440-hero.png)       | [New hero](about-1440-hero.png)            |
| Mobile hero       | [Parent hero](before-390-hero.png)        | [New hero](about-390-hero.png)             |
| Desktop full page | [Parent page](before-1440-full-no-js.png) | [New page](about-1440-no-js-full-page.png) |
| Mobile full page  | [Parent page](before-390-full-no-js.png)  | [New page](about-390-no-js-full-page.png)  |

<details>
<summary>Previous desktop and mobile hero compositions</summary>

![Previous desktop hero](before-1440-hero.png)

![Previous mobile hero](before-390-hero.png)

</details>

The new composition introduces the approved plaque, larger editorial type,
numbered modular story scenes, shared-founder presentation, four original process
studies and a direct capabilities/contact bridge. The rest of the approved site
and the PR stack remain preserved. No automatic merge or deployment.
