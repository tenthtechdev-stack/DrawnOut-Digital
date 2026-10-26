# Signature asset process and production boundary

The opening and footer now share two independently masked layers in
`src/components/SignatureArtwork.astro`: an empty fixed-pose hand and the actual
supplied illuminated plaque/emblem. This is a **separated raster motion
prototype**, not completed photorealistic 3D animation. It replaces the rejected
combined-image entrance and descending decorative outline described in the
[PR #4 feedback](https://github.com/tenthtech/drawnout-digital/pull/4#issuecomment-6390052967).

The plaque moves separately into the hand's existing pinch pose. No intact
composite or substitute decorative frame is rendered by the shared component.
The separation does not recover a hand rig, hidden plaque surfaces, changing
finger contact or new lighting. Those production requirements remain open.
The [revised opening gallery](../artifacts/signature-opening/README.md) and
[revision handoff](OPENING_REVISION_HANDOFF.md) describe the current review;
previous recordings remain historical evidence.

## Source inspection

The client-supplied `hand-and-icon-supplied.svg` and `logo-as-supplied.svg` in
`design-assets/brand-originals/` remain byte-for-byte unchanged. Each is 1,127,170
bytes and has SHA-256
`ea295f96073b0e789532551ec1787a9c10728fa46767ce27fb428ff1c3affcbb`.
They are identical wrappers with viewBox `0 0 810 1439.999935`. Each embeds two
1086 × 1448 PNGs: an 820,526-byte RGB image and a 24,026-byte grayscale opacity
mask. Those two PNGs are **not independent hand and emblem layers**. The wrapper's
crop, transform and mask must be retained to reproduce the approved pose. The
logo-named file supplies no editable vector emblem.

`scripts/signature/convert-reference.mjs` verifies both original files before
rendering the intact SVG with Chromium at 810 × 1440, preserving alpha and the
viewBox. The resulting [lossless reference PNG](../artifacts/signature/hand-emblem-reference.png)
is the source for the new separation. The previous intact WebP derivative stays
preserved in Git history and the asset directory; the shared component now
imports the separate PNGs and lets Astro generate responsive WebP derivatives.
No unrelated stock hand or replacement monogram has been introduced.

## Reproducible source-pixel separation

`scripts/signature/separate-reference.mjs` first verifies the unchanged original
SVG and reference PNG hashes. The reviewed
[ownership mask](../design-assets/signature-layers/hand-mask.svg) assigns each
source pixel exclusively to either the hand or plaque. Each output retains its
source RGB bytes; alpha is either the original value or zero. The two full-size
810 × 1440 canvases retain the same registration, with the hand rendered above
the plaque. No source pixels are repainted, inpainted or newly generated.

- `src/assets/signature/hand-empty.png` contains the hand, with the entire inset
  plaque face transparent. Its finger pose and orange illumination remain fixed.
- `src/assets/signature/emblem-plaque.png` contains the actual approved illuminated
  plaque and emblem. Contact pixels assigned to the fingers stay with the hand,
  so they do not descend as detached finger fragments.

The [layer manifest](../design-assets/signature-layers/manifest.json) records
output hashes, bytes and the reproducible native-pixel checks: no overlapping
visible pixels, zero RGBA reconstruction error at original registration, and
95,350 plaque-interior pixels with zero alpha in the empty-hand layer. These
checks establish source fidelity, not anatomical realism or perfect rendering
after browser scaling. The exact-pixel guarantee applies to the lossless native
PNGs; the website's optimized, scaled WebPs can have compression differences and
a small contact seam.

The source never included plaque edges hidden behind the fingers. Its separated
plaque therefore has small contact cutouts. At the right index contact, glass
and skin are optically mixed; the short baked contact highlight stays with the
hand. There are no clean hidden hand surfaces, articulated fingers, changing
shadows/refraction or alternate camera views. The
[layer notes](../design-assets/signature-layers/README.md) document the traced
contact areas and limitations. An alpha-aware viewer or the browser is required
to inspect the cutouts: hidden RGB under fully transparent pixels is retained
for fidelity and must not be interpreted as visible artwork.

## Historical material study and source evidence

| Deliverable                                                                          | What it proves                                                                                               | Quality status                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [Reference PNG](../artifacts/signature/hand-emblem-reference.png)                    | Faithful rendering of the supplied crop, mask and final hand/emblem pose                                     | Approved supplied appearance; one flat composite                                            |
| [Blender render PNG](../artifacts/signature/signature-glass-study.png)               | Actual ray-traced acrylic thickness, bevel, reflections and studio lighting alongside the supplied reference | Interim material study; visible transmission noise; no independently modeled hand or emblem |
| [Packed Blender scene](../design-assets/signature-study/signature-glass-study.blend) | Editable camera, lights, acrylic plate, pedestal and packed reference image plane                            | Reproducible source study; no hand rig or hand animation                                    |
| [Asset manifest](../design-assets/signature-study/manifest.json)                     | Source/derivative hashes, bytes, provenance, rights boundary and missing production inputs                   | Inventory, not a rights certificate                                                         |
| [Render report](../design-assets/signature-study/render-report.json)                 | Actual renderer/version/settings, elapsed time and output hashes                                             | Measured local render evidence                                                              |

The Blender study predates the separated-layer revision and does not supply its
hand or emblem assets. The reference is deliberately named as an image plane
inside the `.blend` file.
It is an emissive flat card, not recovered anatomy. The orange plate beside it is
new geometric material-study work with 80 mm scene thickness, rounded edges,
IOR 1.46, transmission 0.94 and roughness 0.12. It has no brand emblem. Three area
lights illuminate the plate and charcoal pedestal. These dimensions/materials
are study choices awaiting art direction, not measurements of the supplied object.

The environment has Blender 4.3.2 and Chromium. The study was rendered with Cycles
on CPU, 1200 × 800, 32 maximum samples, adaptive threshold 0.035, seed 0, eight
maximum/transmission bounces and AgX. Denoising is disabled because this installed
Blender build lacks OpenImageDenoise support. GPU performance and a licensed
hand-model/rig pipeline were not established. The visible grain, flat reference
plane and missing anatomical animation mean this render does not satisfy final
photorealism. The Blender image is review evidence, not a website background.

## Reproduce without changing the originals

Reproduce the current two-layer assets with the project's locked Node dependencies:

```sh
node scripts/signature/separate-reference.mjs /tmp/drawnout-signature/layers
```

The optional output directory keeps committed files untouched. With no output
argument, the command refreshes the two PNG assets and their manifest in the
repository. Inspect those outputs before using a changed mask. Do not replace
the supplied originals.

The older conversion and Blender study can also be reproduced. Install Chromium
and Blender 4.3.2, and set `CHROMIUM_PATH` if Chromium is elsewhere:

```sh
node scripts/signature/convert-reference.mjs /tmp/drawnout-signature/reference
blender -b -t 2 --python scripts/signature/render-study.py -- \
  --out /tmp/drawnout-signature/study --samples 32 \
  --reference /tmp/drawnout-signature/reference/hand-emblem-reference.png
```

The conversion uses the installed Playwright and Sharp libraries. Rendering
writes `signature-glass-study.blend`, `signature-glass-study.png` and
`render-report.json` to the output directory. All reference pixels are packed
inside the scene, and its render path is relative; the scene can be moved and
rendered with F12 or `blender -b /path/to/signature-glass-study.blend -f 1`.
The committed review render uses 32 samples and took 29.57 seconds. The script defaults to 256 samples; `--samples` can change the material study's
sampling budget. Exact encoded bytes may differ with browser/encoder/Blender
versions; verify source hashes and visual fidelity rather than assuming outputs
are byte-identical on every platform.

The historical intact reference conversion can be refreshed deliberately with
`node scripts/signature/convert-reference.mjs` after review, but that operation
does not separate the hand or plaque. Keep large future sequences outside Git;
commit manifests, scripts, a source scene when practical and selected review
frames.

## Current motion and fallback behavior

Both layers use `object-fit: contain` and the same full portrait registration.
In the opening, the empty hand rises from below while the actual plaque/emblem
descends from above. They reach their common source coordinates before the
automatic homepage transition. This demonstrates separate object motion into a
fixed pose, not a physically simulated or deforming grasp.

The footer uses the same two assets and final registration. One native-scroll
ScrollTrigger timeline raises the hand, lowers the plaque, holds the assembled
pose and expands the composition beneath a scrim. Reverse scrolling retraces
both objects and the expansion. Live HTML contact and navigation remain above
the artwork. Neither decorative layer intercepts pointer input or changes the
page height.

The default unscripted state assembles both layers at their source coordinates.
No JavaScript, reduced motion, data saving or failed animation imports preserve
a static footer and usable links. The opening gate skips immediately for reduced
motion and fails open on media failure. The shared component is marked
`data-signature-asset="separated-raster-prototype"`; review documentation carries
the limitation without adding implementation instructions to visitor-facing copy.

## Exact inputs still required for production

1. A licensed/approved realistic hand mesh with documented commercial/web-render
   rights, deformation rig, anatomy appropriate to the supplied pose, skin/nail
   albedo, roughness, normal/displacement and subsurface maps. Include the right
   to deliver editable source files if source redistribution is required.
2. Approved editable DrawnOut emblem paths or mesh with correct contours,
   proportions, extrusion and intended materials; confirm the emblem separately
   from the supplied composite. Neither existing SVG provides these paths.
3. Editable glass/frame geometry with approved thickness, bevel, refraction and
   light/glow treatment; approved background, shadow/reflection passes and
   separate hand/foreground, frame, emblem and effects layers if using 2D delivery.
4. An approved rigged grasp and synchronized hand-rise/emblem-drop animation,
   including finger contact, foreground occlusion, collision review and the final
   held pose. The opening and footer must use this same master scene and pose.
5. Approved desktop and portrait cameras/crops with sufficient resolution and
   surrounding background for the final expansion, plus reviewed beginning,
   contact/hold and expanded frames. Clean assets must contain no platform UI.
6. Rendered masters and optimized delivery derivatives, a rights/provenance
   manifest, and human art-direction approval of skin, anatomy, lighting,
   emblem accuracy and frame quality. A supplied approved pre-rendered sequence
   may replace rig delivery if its rights and required responsive views are clear.

## Proposed final delivery budget

Prefer an optimized pre-rendered sequence for consistent finger occlusion and
glass reflections. Begin evaluation at 48–72 frames, desktop widths 960–1280
and mobile widths 540–720, with a static fallback at each size. Proposed initial
transfer caps are 4 MiB desktop / 2 MiB mobile per sequence, subject to actual
visual review; these are targets, not measured delivered assets. Reuse the
shared master and caches across the intro/footer where useful. The intro must
always finish within its five-second limit without waiting for those assets.

Do not decode the entire sequence on a phone: 72 RGBA frames at 720 × 1280
consume about 253 MiB before overhead. Use a bounded 3–5-frame decoded cache,
prefetch near the footer and stop rendering offscreen. Ship hashed derivatives
from the site's asset host/CDN with immutable caching only after deployment
approval. Test memory, responsive crop, reverse scrub and latency on modest
devices before choosing the final format. A frame sequence has not been
rendered, measured or delivered in this prototype.
