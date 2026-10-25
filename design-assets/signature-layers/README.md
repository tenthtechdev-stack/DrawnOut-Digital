# Separated reference raster study

These are **two masked raster cutouts**, made only from the faithful
`artifacts/signature/hand-emblem-reference.png` (810 × 1440). They allow the empty
fixed-pose hand to rise and the actual supplied orange plaque/emblem to descend
independently. They are not a 3D hand, an articulated grasp, or production
photorealistic animation. The supplied SVG originals and existing reference
derivatives remain unchanged.

`hand-mask.svg` assigns visible source pixels to the hand. Its complement assigns
them to the plaque. The script thresholds the guide at 128 so each source pixel
belongs to exactly one layer. Each PNG retains the source RGB bytes everywhere;
each alpha byte is either its unchanged source value or zero. No emblem repaint,
hidden anatomy, generated texture, replacement frame, or inferred vector mark is
introduced. Both assets retain the full source canvas for exact registration:

- `src/assets/signature/hand-empty.png`: visible hand, with the plaque face fully
  transparent. The finger pose and orange illumination remain baked into it.
- `src/assets/signature/emblem-plaque.png`: the supplied plaque and emblem, with
  visible fingertip contact pixels removed. Small edge cutouts are unavoidable:
  the plaque surface covered by the fingers was never supplied.

The traced contacts are approximately (154, 622)–(192, 687) at the left thumb and
(602, 525)–(559, 601) at the right index. At the latter, glass and skin are
optically mixed. The short baked contact highlight remains in the hand cutout;
the plaque does not carry a detached piece of finger during descent. These are
appearance cutouts, not recovered clean material passes. A different camera,
opening fingers, clean hidden surfaces, changing shadows, and changing glass
refraction require additional approved assets.

Use the same coordinate system for both layers, with the hand in front. The hand
can rise while the plaque descends into its existing pinch. The intact reference
may be used as the final registered held pose or static fallback; it must not
appear before contact in the independent-motion demonstration. Native exclusive
masks reconstruct the reference exactly, but scaling separate layers can create
a small contact seam, so inspect the actual browser presentation.

Reproduce from the repository root with the locked dependencies installed:

```sh
node scripts/signature/separate-reference.mjs
```

An optional output directory writes the PNGs and manifest there, permitting a
temporary reproduction without refreshing committed outputs. The script checks
the hashes of both untouched supplied SVGs and the faithful PNG before running.
It verifies exact lossless PNG decoding, unchanged RGB, unchanged source alpha
ownership, zero overlapping pixels, zero error when the layers are assembled at
native registration, a large plaque-interior region absent from the hand, and
hand/contact sample points absent from the plaque. `manifest.json` records the
actual output hashes, byte sizes, measured verification, and fidelity limits.

Production still needs an approved hand mesh and deformation rig with suitable
skin maps and commercial rights, editable approved emblem/plaque geometry,
reviewed animated contact and illumination, responsive cameras, and rendered
masters—or a supplied approved sequence with those views. Blender availability
does not provide those missing assets.
