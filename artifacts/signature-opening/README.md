# PR #4 — corrected opening visual review

The opening is **awaiting client visual approval**. This gallery addresses the [opening feedback](https://github.com/tenthtech/drawnout-digital/pull/4#issuecomment-6390052967) on `feature/drawnout-signature-experience`. No merge or public deployment is included.

DrawnOut now has an oversized lower-left wordmark whose progressive wipe follows the connecting project wave. The empty hand and the **actual supplied illuminated plaque/emblem** move independently into the supplied held pose. There is no full composite or substitute descending outline in this entrance.

**Asset boundary: separated 2D raster prototype, not completed photorealistic 3D.** The fixed fingers do not articulate; orange illumination is baked into the source. Plaque edges hidden behind fingertips are missing, and an optically mixed contact highlight stays with the hand. The supplied pixels can form the original final pose, but do not supply a hand rig, editable emblem, reconstructed surfaces or changing glass/skin lighting. See the [asset process and exact production requirements](../../docs/SIGNATURE_ASSET_PROCESS.md).

[Revision handoff](../../docs/OPENING_REVISION_HANDOFF.md) · [Actual validation results](../../docs/OPENING_REVISION_VALIDATION.md) · [Capture timings and layer positions](signature-evidence.json) · [Browser results](browser-verification.json) · [Production smoke results](production-verification.json) · [Media decoding and hashes](media-verification.json)

[Previous opening gallery for comparison](../signature/README.md) — preserved historical evidence, not the corrected opening.

## Real desktop and mobile recordings

These complete journeys capture actual Chromium compositor output from the locally served production build: automatic opening and exit, the living gradient after the intro, real project navigation, portfolio expansion and reverse scrolling, then the shared signature footer and enquiry link. No animation timeline was sought to manufacture the evidence. MP4s are encoded at 30 fps, repeating the latest real frame when necessary; this is **not a measured 30 fps device-rendering claim**. Cloud capture uses software WebGL.

### Desktop — 1440 × 900

[Open the full desktop recording](desktop-signature.mp4) — 55.17s, 5,384,863 bytes. Use GitHub’s Raw/download control if its file view does not play the MP4.

![Desktop opening excerpt from the actual screen recording](desktop-signature-preview.gif)

### Mobile — 390 × 844

[Open the full mobile recording](mobile-signature.mp4) — 54.23s, 2,819,124 bytes. Use GitHub’s Raw/download control if its file view does not play the MP4.

![Mobile opening excerpt from the actual screen recording](mobile-signature-preview.gif)

## Corrected opening storyboard

Each PNG is full resolution. Close-spaced intro states are captured in fresh browsing sessions using actual elapsed time; screenshots are not manually sought poses. “Contact” shows convergence toward the fixed supplied pinch, not articulated gripping. The capture manifest records before/after timing and transforms for every keyframe.

### Desktop — 1440px

#### 1. Project frames appear

Capture began 0.554s after the opening started.

![Outlined project frames at 1440px](intro-1440-squares.png)

#### 2. Connecting wave and progressive wordmark

Capture began 1.570s after the opening started.

![Large lower-left DrawnOut during the synchronized reveal at 1440px](intro-1440-wave.png)

#### 3. Full lower-left DrawnOut

Capture began 2.302s after the opening started.

![Complete DrawnOut wordmark as the connecting wave finishes at 1440px](intro-1440-wordmark.png)

#### 4. Empty hand below; actual plaque above

Capture began 2.736s after the opening started.

![Independently moving empty hand and descending approved plaque before contact at 1440px](intro-1440-separated.png)

#### 5. Contact and alignment study

Capture began 3.118s after the opening started.

![Separated raster layers converging toward the original fixed held pose at 1440px](intro-1440-contact.png)

#### 6. Final held pose

Capture began 3.428s after the opening started.

![Hand and plaque aligned in the supplied final pose at 1440px](intro-1440-signature.png)

#### 7. Automatic Afterglow reveal

Capture began 5.215s after the opening started.

![Homepage automatically visible after the opening at 1440px](intro-1440-homepage.png)

### Mobile — 390px

#### 1. Project frames appear

Capture began 0.571s after the opening started.

![Outlined project frames at 390px](intro-390-squares.png)

#### 2. Connecting wave and progressive wordmark

Capture began 1.561s after the opening started.

![Large lower-left DrawnOut during the synchronized reveal at 390px](intro-390-wave.png)

#### 3. Full lower-left DrawnOut

Capture began 2.287s after the opening started.

![Complete DrawnOut wordmark as the connecting wave finishes at 390px](intro-390-wordmark.png)

#### 4. Empty hand below; actual plaque above

Capture began 2.738s after the opening started.

![Independently moving empty hand and descending approved plaque before contact at 390px](intro-390-separated.png)

#### 5. Contact and alignment study

Capture began 3.117s after the opening started.

![Separated raster layers converging toward the original fixed held pose at 390px](intro-390-contact.png)

#### 6. Final held pose

Capture began 3.433s after the opening started.

![Hand and plaque aligned in the supplied final pose at 390px](intro-390-signature.png)

#### 7. Automatic Afterglow reveal

Capture began 5.219s after the opening started.

![Homepage automatically visible after the opening at 390px](intro-390-homepage.png)

<details>
<summary>Tablet storyboard — 768px</summary>

#### 1. Project frames appear

Capture began 0.564s after the opening started.

![Outlined project frames at 768px](intro-768-squares.png)

#### 2. Connecting wave and progressive wordmark

Capture began 1.555s after the opening started.

![Large lower-left DrawnOut during the synchronized reveal at 768px](intro-768-wave.png)

#### 3. Full lower-left DrawnOut

Capture began 2.296s after the opening started.

![Complete DrawnOut wordmark as the connecting wave finishes at 768px](intro-768-wordmark.png)

#### 4. Empty hand below; actual plaque above

Capture began 2.734s after the opening started.

![Independently moving empty hand and descending approved plaque before contact at 768px](intro-768-separated.png)

#### 5. Contact and alignment study

Capture began 3.109s after the opening started.

![Separated raster layers converging toward the original fixed held pose at 768px](intro-768-contact.png)

#### 6. Final held pose

Capture began 3.432s after the opening started.

![Hand and plaque aligned in the supplied final pose at 768px](intro-768-signature.png)

#### 7. Automatic Afterglow reveal

Capture began 5.206s after the opening started.

![Homepage automatically visible after the opening at 768px](intro-768-homepage.png)

</details>

## What actually moves: isolated approved source pixels

These inspection views composite the two transparent cutouts over the opening background so the visible alpha ownership is clear. They are asset proof, not 3D renders. The hand layer has no plaque face or emblem; the plaque retains the real supplied emblem with small missing edges at the finger contacts. No hidden surface was invented.

![Empty fixed-pose hand layer on the opening background; no emblem in the grasp](hand-empty-opaque.png)

![Actual approved illuminated plaque layer, independently separated from the hand](emblem-plaque-opaque.png)

[Reviewed ownership mask](../../design-assets/signature-layers/hand-mask.svg) · [Source and layer hashes / native reconstruction checks](../../design-assets/signature-layers/manifest.json) · [Original intact reference for comparison](../signature/hand-emblem-reference.png)

## Shared footer: assembly, expansion and reverse

The same two assets and final registration are used at both ends of the site. These are native-scroll states; the contact controls remain live HTML above the artwork.

<details>
<summary>Footer sequence — 1440px</summary>

### Independent arrival

![Independent arrival in the signature footer at 1440px](footer-1440-arrive.png)

### Assembled held pose

![Assembled held pose in the signature footer at 1440px](footer-1440-meeting.png)

### Expanded composition

![Expanded composition in the signature footer at 1440px](footer-1440-expanded.png)

### Reverse to independent arrival

![Reverse to independent arrival in the signature footer at 1440px](footer-1440-reverse.png)

</details>

<details>
<summary>Footer sequence — 390px</summary>

### Independent arrival

![Independent arrival in the signature footer at 390px](footer-390-arrive.png)

### Assembled held pose

![Assembled held pose in the signature footer at 390px](footer-390-meeting.png)

### Expanded composition

![Expanded composition in the signature footer at 390px](footer-390-expanded.png)

### Reverse to independent arrival

![Reverse to independent arrival in the signature footer at 390px](footer-390-reverse.png)

</details>

<details>
<summary>Footer sequence — 768px</summary>

### Independent arrival

![Independent arrival in the signature footer at 768px](footer-768-arrive.png)

### Assembled held pose

![Assembled held pose in the signature footer at 768px](footer-768-meeting.png)

### Expanded composition

![Expanded composition in the signature footer at 768px](footer-768-expanded.png)

### Reverse to independent arrival

![Reverse to independent arrival in the signature footer at 768px](footer-768-reverse.png)

</details>

## Preserved portfolio expansion and reverse

<details>
<summary>Portfolio expansion — 1440px</summary>

### Framed editorial image

![Framed editorial image at 1440px](immersive-1440-begin.png)

### Expanding image

![Expanding image at 1440px](immersive-1440-middle.png)

### Near-full-bleed composition

![Near-full-bleed composition at 1440px](immersive-1440-complete.png)

### Reverse to framed beginning

![Reverse to framed beginning at 1440px](immersive-1440-reverse.png)

</details>

<details>
<summary>Portfolio expansion — 390px</summary>

### Framed editorial image

![Framed editorial image at 390px](immersive-390-begin.png)

### Expanding image

![Expanding image at 390px](immersive-390-middle.png)

### Near-full-bleed composition

![Near-full-bleed composition at 390px](immersive-390-complete.png)

### Reverse to framed beginning

![Reverse to framed beginning at 390px](immersive-390-reverse.png)

</details>

<details>
<summary>Portfolio expansion — 768px</summary>

### Framed editorial image

![Framed editorial image at 768px](immersive-768-begin.png)

### Expanding image

![Expanding image at 768px](immersive-768-middle.png)

### Near-full-bleed composition

![Near-full-bleed composition at 768px](immersive-768-complete.png)

### Reverse to framed beginning

![Reverse to framed beginning at 768px](immersive-768-reverse.png)

</details>

## Production build: homepage and real public projects

These screenshots come from the locally served production build, not a publicly deployed site. The [production smoke record](production-verification.json) contains observed intro timings, public route responses and navigation checks.

<details>
<summary>Desktop production views — 1440px</summary>

### Afterglow homepage

![Afterglow homepage, production build at 1440px](production-home-1440.png)

### Public Work index

![Public Work index, production build at 1440px](production-work-1440.png)

### Bunzo public case study

![Bunzo public case study, production build at 1440px](production-case-bunzo-1440.png)

</details>

<details>
<summary>Mobile production views — 390px</summary>

### Afterglow homepage

![Afterglow homepage, production build at 390px](production-home-390.png)

### Public Work index

![Public Work index, production build at 390px](production-work-390.png)

### Bunzo public case study

![Bunzo public case study, production build at 390px](production-case-bunzo-390.png)

### Mobile navigation

![Production mobile navigation at 390px](production-navigation-390.png)

</details>

## Responsive Work and case-study introductions

<details>
<summary>390px, 768px and 1440px route screenshots</summary>

### 390px

![Work introduction at 390px](work-390.png)

![Bunzo case-study introduction at 390px](case-bunzo-390.png)

### 768px

![Work introduction at 768px](work-768.png)

![Bunzo case-study introduction at 768px](case-bunzo-768.png)

### 1440px

![Work introduction at 1440px](work-1440.png)

![Bunzo case-study introduction at 1440px](case-bunzo-1440.png)

</details>

The opening remains subject to visual approval. Passing automated checks does not approve the fixed-pose raster prototype as final realistic hand animation. The missing production assets and rendering work remain explicitly documented in the handoff.
