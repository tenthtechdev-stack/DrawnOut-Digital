# DrawnOut Loop — signature experience review

> **Historical gallery — opening not approved:** these captures show the pre-correction checkpoint `bba7f69`. Review the [revised opening gallery](../signature-opening/README.md) for the larger lower-left wordmark and separately moving hand/plaque prototype requested in [PR #4](https://github.com/tenthtech/drawnout-digital/pull/4#issuecomment-6390052967). Final photorealistic 3D remains incomplete.

Review implementation on `feature/drawnout-signature-experience`; no merge or public deployment is authorized by this gallery.

The opening and footer use the **same supplied hand/emblem composite as an interim motion prototype**. The hand and emblem are not independently rigged. The editable Blender file proves an acrylic material study, not completed photorealistic hand animation. See the [asset process and remaining production inputs](../../docs/SIGNATURE_ASSET_PROCESS.md).

[Implementation handoff](../../docs/SIGNATURE_HANDOFF.md) · [Validation report](../../docs/SIGNATURE_VALIDATION.md) · [Capture measurements](signature-evidence.json) · [Production smoke results](production-verification.json)

## Real screen recordings

These recordings capture actual Chromium compositor output, real native forward/reverse scrolling, clickable project links, filtering and the footer enquiry link. The 30 fps MP4 encoding repeats the latest captured frame where necessary; it is not evidence of 30 fps device rendering. Software WebGL was enabled for the cloud capture. Timing and performance limits are recorded in the validation report.

- [Desktop recording — 1440 × 900](desktop-signature.mp4)
- [Mobile recording — 390 × 844](mobile-signature.mp4)

### Desktop opening preview

![Actual desktop opening recording excerpt](desktop-signature-preview.gif)

### Mobile opening preview

![Actual mobile opening recording excerpt](mobile-signature-preview.gif)

## Production build: public routes and navigation

These screenshots come from the locally served production build, not a deployed website. All 11 approved project URLs returned HTTP 200. Homepage Bunzo cards were followed to the real case-study page.

| View             | Desktop — 1440px                                               | Mobile — 390px                                               |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| Homepage         | ![Production homepage at 1440px](production-home-1440.png)     | ![Production homepage at 390px](production-home-390.png)     |
| Work             | ![Public Work at 1440px](production-work-1440.png)             | ![Public Work at 390px](production-work-390.png)             |
| Bunzo case study | ![Public Bunzo case at 1440px](production-case-bunzo-1440.png) | ![Public Bunzo case at 390px](production-case-bunzo-390.png) |

![Production mobile navigation](production-navigation-390.png)

## Original reference and actual Blender study

The left reference in the render is an explicitly named image plane; the separate orange plate is genuine geometry with thickness, bevel and ray-traced material. Visible render grain remains. No missing hand geometry or logo rig is implied.

[Packed Blender source](../../design-assets/signature-study/signature-glass-study.blend) · [Actual render settings and hashes](../../design-assets/signature-study/render-report.json)

![Supplied reference, original portrait proportions](hand-emblem-reference.png)

![Actual Cycles CPU acrylic material study beside the supplied reference](signature-glass-study.png)

## Responsive choreography states

The following development-server screenshots record actual time and native scroll progress. Image-scene captures use the actual viewport without scrolling the image into view or enlarging the viewport. Beginning and reverse captures intentionally repeat the same native progress. Footer frames remain a composite prototype.

### Desktop — 1440px

#### Opening sequence

![Outlined project squares at 1440px](intro-1440-squares.png)

![Connecting wave, artwork and DrawnOut lettering at 1440px](intro-1440-wave.png)

![Shared hand/emblem reference pose at 1440px](intro-1440-signature.png)

![Automatic return to Afterglow at 1440px](intro-1440-homepage.png)

#### Immersive portfolio expansion

| Framed beginning                                       | Mid expansion                                            | Near full bleed                                              | Reverse to beginning                                       |
| ------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| ![Portfolio begin at 1440px](immersive-1440-begin.png) | ![Portfolio middle at 1440px](immersive-1440-middle.png) | ![Portfolio complete at 1440px](immersive-1440-complete.png) | ![Portfolio reverse at 1440px](immersive-1440-reverse.png) |

#### Signature footer

| Arrival                                            | Meeting pose                                         | Expanded composition                                   | Reverse arrival                                      |
| -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| ![Footer arrive at 1440px](footer-1440-arrive.png) | ![Footer meeting at 1440px](footer-1440-meeting.png) | ![Footer expanded at 1440px](footer-1440-expanded.png) | ![Footer reverse at 1440px](footer-1440-reverse.png) |

#### Public portfolio introduction and case study

![Work introduction at 1440px](work-1440.png)

![Bunzo case introduction at 1440px](case-bunzo-1440.png)

### Tablet — 768px

#### Opening sequence

![Outlined project squares at 768px](intro-768-squares.png)

![Connecting wave, artwork and DrawnOut lettering at 768px](intro-768-wave.png)

![Shared hand/emblem reference pose at 768px](intro-768-signature.png)

![Automatic return to Afterglow at 768px](intro-768-homepage.png)

#### Immersive portfolio expansion

| Framed beginning                                     | Mid expansion                                          | Near full bleed                                            | Reverse to beginning                                     |
| ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| ![Portfolio begin at 768px](immersive-768-begin.png) | ![Portfolio middle at 768px](immersive-768-middle.png) | ![Portfolio complete at 768px](immersive-768-complete.png) | ![Portfolio reverse at 768px](immersive-768-reverse.png) |

#### Signature footer

| Arrival                                          | Meeting pose                                       | Expanded composition                                 | Reverse arrival                                    |
| ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| ![Footer arrive at 768px](footer-768-arrive.png) | ![Footer meeting at 768px](footer-768-meeting.png) | ![Footer expanded at 768px](footer-768-expanded.png) | ![Footer reverse at 768px](footer-768-reverse.png) |

#### Public portfolio introduction and case study

![Work introduction at 768px](work-768.png)

![Bunzo case introduction at 768px](case-bunzo-768.png)

### Mobile — 390px

#### Opening sequence

![Outlined project squares at 390px](intro-390-squares.png)

![Connecting wave, artwork and DrawnOut lettering at 390px](intro-390-wave.png)

![Shared hand/emblem reference pose at 390px](intro-390-signature.png)

![Automatic return to Afterglow at 390px](intro-390-homepage.png)

#### Immersive portfolio expansion

| Framed beginning                                     | Mid expansion                                          | Near full bleed                                            | Reverse to beginning                                     |
| ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| ![Portfolio begin at 390px](immersive-390-begin.png) | ![Portfolio middle at 390px](immersive-390-middle.png) | ![Portfolio complete at 390px](immersive-390-complete.png) | ![Portfolio reverse at 390px](immersive-390-reverse.png) |

#### Signature footer

| Arrival                                          | Meeting pose                                       | Expanded composition                                 | Reverse arrival                                    |
| ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| ![Footer arrive at 390px](footer-390-arrive.png) | ![Footer meeting at 390px](footer-390-meeting.png) | ![Footer expanded at 390px](footer-390-expanded.png) | ![Footer reverse at 390px](footer-390-reverse.png) |

#### Public portfolio introduction and case study

![Work introduction at 390px](work-390.png)

![Bunzo case introduction at 390px](case-bunzo-390.png)
