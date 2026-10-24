# Signature asset process and production boundary

The opening and footer share `src/components/SignatureArtwork.astro` and the same
approved portrait reference. This is a **reference-composite motion prototype**.
Its supplied hand and emblem move together. The descending outlined accent is a
separate decorative frame, not a reconstructed emblem. Independent finger grip,
emblem descent, changing occlusion and a photorealistic animated hand are **not
complete**. Functional browser tests do not establish that visual requirement.

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
viewBox. It writes a lossless PNG for inspection and a quality-90 WebP for the
shared site asset. The shipped WebP is approximately 85 KiB; Astro supplies
responsive 450/810-pixel WebP derivatives. No fabricated hand layer, unrelated
stock hand, social badge or replacement monogram has been added.

## Review evidence and editable study

| Deliverable                                                                          | What it proves                                                                                               | Quality status                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [Reference PNG](../artifacts/signature/hand-emblem-reference.png)                    | Faithful rendering of the supplied crop, mask and final hand/emblem pose                                     | Approved supplied appearance; one flat composite                                            |
| [Blender render PNG](../artifacts/signature/signature-glass-study.png)               | Actual ray-traced acrylic thickness, bevel, reflections and studio lighting alongside the supplied reference | Interim material study; visible transmission noise; no independently modeled hand or emblem |
| [Packed Blender scene](../design-assets/signature-study/signature-glass-study.blend) | Editable camera, lights, acrylic plate, pedestal and packed reference image plane                            | Reproducible source study; no hand rig or hand animation                                    |
| [Asset manifest](../design-assets/signature-study/manifest.json)                     | Source/derivative hashes, bytes, provenance, rights boundary and missing production inputs                   | Inventory, not a rights certificate                                                         |
| [Render report](../design-assets/signature-study/render-report.json)                 | Actual renderer/version/settings, elapsed time and output hashes                                             | Measured local render evidence                                                              |

The reference is deliberately named as an image plane inside the `.blend` file.
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

Install the project's locked Node dependencies, Chromium and Blender 4.3.2. Set
`CHROMIUM_PATH` if Chromium is elsewhere. From the repository root:

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

To intentionally refresh the website derivative after reviewing conversion,
run `node scripts/signature/convert-reference.mjs` with no output argument. Do
not replace either original SVG. Keep large future sequences outside Git;
commit their manifests, scripts, source scene when practical, and a few review
frames.

## Current motion and fallback behavior

The portrait reference remains unstretched (`object-fit: contain`) in both
placements. The footer uses an absolute decorative layer, responsive crop,
gradient scrim and live HTML contact/navigation above it. Scroll progress raises
the intact reference, lowers the accent frame, holds the pose and expands the
composition. Reverse scrolling retraces the same timeline without changing
document height. The current expansion is a responsive background composition;
it does not recover missing landscape artwork outside the original portrait.

The static final pose is the default before scripting, with no JavaScript,
reduced motion, data saving or failed animation imports. The reference and
decorative frame cannot intercept pointer input. Normal links remain usable
throughout. The implementation is marked
`data-signature-asset="reference-composite-prototype"`; this process document and
review gallery carry the production limitation without inserting development
instructions into visitor-facing copy.

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
