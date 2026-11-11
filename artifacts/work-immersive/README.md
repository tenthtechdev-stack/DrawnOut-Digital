# Immersive Work index — Stage 1 review

[Draft PR #18](https://github.com/tenthtech/drawnout-digital/pull/18) · [Issue #17](https://github.com/tenthtech/drawnout-digital/issues/17) · [Validation report](../../docs/work-immersive/VALIDATION.md) · [Implementation](../../docs/work-immersive/IMPLEMENTATION.md)

Real production Chromium captures at **1440 × 900** and **390 × 844**, with tablet and static fallback views. The application source is `e2f9ec5ff56b2588e639e3e9b64efd318c4a66c1`, stacked on About PR #16. All eleven records, six motion loops and individual case-study pages are retained.

## Watch the experience

Native input drives the forward and reverse scroll, filters, browser history and real case-study navigation. MP4 recordings retain the original browser timing and have no audio. Open a link to play or download it.

| View    | Forward and reverse: Bunzo → SOL → Triarch → Churros          | Filters, history and case navigation                             |
| ------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Desktop | [44.1s recording](work-1440-forward-and-reverse.mp4?raw=true) | [22.4s recording](work-1440-filters-and-navigation.mp4?raw=true) |
| Mobile  | [35.4s recording](work-390-forward-and-reverse.mp4?raw=true)  | [14.1s recording](work-390-filters-and-navigation.mp4?raw=true)  |

Mobile is Chromium viewport/touch emulation, not a physical-device benchmark. Videos show the existing subtle title reveals and curated static/animated rhythm. See the [capture manifest](capture-evidence.json) for measured geometry, native scroll positions, playback state, source hashes and capture method.

## Bunzo — actual expansion stages

| View    | Initial · 0%                                           | Middle · 50%                                             | Expanded · 100%                                            |
| ------- | ------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- |
| Desktop | ![Bunzo, desktop, 0% expansion](work-1440-bunzo-0.png) | ![Bunzo, desktop, 50% expansion](work-1440-bunzo-50.png) | ![Bunzo, desktop, 100% expansion](work-1440-bunzo-100.png) |
| Mobile  | ![Bunzo, mobile, 0% expansion](work-390-bunzo-0.png)   | ![Bunzo, mobile, 50% expansion](work-390-bunzo-50.png)   | ![Bunzo, mobile, 100% expansion](work-390-bunzo-100.png)   |

## SOL Community Center — actual expansion stages

| View    | Initial · 0%                                                                         | Middle · 50%                                                                           | Expanded · 100%                                                                          |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Desktop | ![SOL Community Center, desktop, 0% expansion](work-1440-sol-community-center-0.png) | ![SOL Community Center, desktop, 50% expansion](work-1440-sol-community-center-50.png) | ![SOL Community Center, desktop, 100% expansion](work-1440-sol-community-center-100.png) |
| Mobile  | ![SOL Community Center, mobile, 0% expansion](work-390-sol-community-center-0.png)   | ![SOL Community Center, mobile, 50% expansion](work-390-sol-community-center-50.png)   | ![SOL Community Center, mobile, 100% expansion](work-390-sol-community-center-100.png)   |

The title, metadata and image share the expanding composition. These are real viewport captures; an immersive frame may continue below the viewport. SOL remains a running approved motion loop, so its artwork changes between captures.

### SOL signage and applications beat

These additional frames wait for the existing loop to reach its applications beat naturally; no video seeking or animation freezing is used.

| Desktop                                                     | Mobile                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| ![SOL desktop applications](work-1440-sol-applications.png) | ![SOL mobile applications](work-390-sol-applications.png) |

## The editorial rhythm

| Project                             | Desktop                                                                        | Mobile                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Triarch · static artwork            | ![Triarch · static artwork desktop](work-1440-triarch-expanded.png)            | ![Triarch · static artwork mobile](work-390-triarch-expanded.png)            |
| Churros · approved animated artwork | ![Churros · approved animated artwork desktop](work-1440-churros-expanded.png) | ![Churros · approved animated artwork mobile](work-390-churros-expanded.png) |

## Entry, filters and real project links

| View                             | Desktop                                                              | Mobile                                                             |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Editorial entry                  | ![Editorial entry desktop](work-1440-entry.png)                      | ![Editorial entry mobile](work-390-entry.png)                      |
| Category filter                  | ![Category filter desktop](work-1440-filter.png)                     | ![Category filter mobile](work-390-filter.png)                     |
| Bunzo case opened from Work      | ![Bunzo case opened from Work desktop](work-1440-case-bunzo.png)     | ![Bunzo case opened from Work mobile](work-390-case-bunzo.png)     |
| Existing next-project navigation | ![Existing next-project navigation desktop](work-1440-case-next.png) | ![Existing next-project navigation mobile](work-390-case-next.png) |

## Tablet — 768px

| Entry                                    | Expanded SOL                                                        |
| ---------------------------------------- | ------------------------------------------------------------------- |
| ![Tablet Work entry](work-768-entry.png) | ![Tablet SOL expansion](work-768-sol-community-center-expanded.png) |

## Accessible static fallbacks

No portfolio video sources are mounted in these views. Artwork, project names and ordinary case-study links remain available. Without JavaScript the complete index is visible and inactive filter controls stay hidden.

| Mode                | Desktop                                                 | Mobile                                                |
| ------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Reduced motion      | ![Reduced motion desktop](work-1440-reduced-motion.png) | ![Reduced motion mobile](work-390-reduced-motion.png) |
| Save Data           | ![Save Data desktop](work-1440-save-data.png)           | ![Save Data mobile](work-390-save-data.png)           |
| JavaScript disabled | ![JavaScript disabled desktop](work-1440-no-js.png)     | ![JavaScript disabled mobile](work-390-no-js.png)     |

## Complete index

Full-page stills show all eleven scenes at the real top-of-page scroll position after visiting them to load lazy artwork. Offscreen scenes retain their native initial geometry. A separate software compositor avoids the cloud GPU backend’s tall-image repetition.

<details>
<summary>Desktop full-page screenshot</summary>

![Full Work index at 1440px](work-1440-full-page.png)

</details>

<details>
<summary>Mobile full-page screenshot</summary>

![Full Work index at 390px](work-390-full-page.png)

</details>

## Review boundaries

[Validation and original failures/corrections](../../docs/work-immersive/VALIDATION.md) · [Media inspection](media-inspection.json)

Artwork approval does not verify client relationships, services, credits or outcomes. Those safeguards remain intact. This is an index review; the eleven individual case-study designs are unchanged. The inherited signature hand/plaque remains a layered raster prototype. Physical mobile/Safari performance and owner visual approval remain outstanding. No merge, deployment or Netlify mirror push was performed.
