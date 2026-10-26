# PR #4 — opening revision handoff

This revision addresses the [client's opening-animation feedback](https://github.com/tenthtech/drawnout-digital/pull/4#issuecomment-6390052967)
on the existing `feature/drawnout-signature-experience` branch. The opening is
**awaiting visual approval**. No merge or deployment is part of this delivery.

[Current gallery and recordings](../artifacts/signature-opening/README.md) ·
[Revision validation](OPENING_REVISION_VALIDATION.md) ·
[Asset process and remaining production inputs](SIGNATURE_ASSET_PROCESS.md)

## Wordmark and project wave

The actual spelling **DrawnOut** is one live text node, anchored to the lower-left
editorial grid above the footer microcopy and Skip control. Its responsive font
size is `clamp(48px, 17vw, 300px)` with a fixed line height and constrained width.
It stays lower-left on mobile, tablet and desktop rather than moving toward the
center. The existing Afterglow typography and orange-led identity remain intact.

A left-to-right clip mask and the connecting SVG line share a linear 1.75-second
draw interval after a 0.5-second delay. A small parser-time initializer anchors
all storyboard animations to the same document-clock start, preventing separate
CSS-resolution frames from introducing drift. They finish together at 2.25 seconds; the
complete wordmark holds until 2.45 seconds, then fades as the hand scene takes
over. The project squares and selective approved artwork retain their existing
wave composition. Geometry and synchronization measurements belong in the
revision validation report; configured values alone are not observed results.

## Independent hand and actual plaque entrance

`SignatureArtwork.astro` now renders two independently masked source-pixel
assets: `hand-empty.png` and `emblem-plaque.png`. It does not render the intact
hand/emblem composite or the former decorative outline. The descending object
contains the actual supplied illuminated plaque and DrawnOut emblem.

From 2.5 to 3.3 seconds, the empty hand moves up from below while the plaque
moves down from above. Their transparent canvases share the original 810 × 1440
registration. The hand sits in front of the plaque; both reach identity transforms
to reproduce the supplied final held pose. That pose holds before the automatic
Afterglow transition. The footer uses the same layers, registration and layering,
then expands the composition through its existing reversible scroll timeline.

This is an **honestly separated 2D prototype**, not production photorealistic
hand animation. Its static supplied fingers do not articulate around the plaque.
The source already bakes in orange light, reflections and contact illumination.
Plaque edges hidden by the fingertips are missing; the separated plaque contains
small cutouts at those contacts. The optically mixed right-fingertip highlight
stays with the hand so it does not descend as a finger fragment. Native-pixel
reassembly is exact; compression and browser resampling can introduce a small
seam. These limitations must be judged in the full recordings, not inferred from
passing functional checks.

## Preservation and timing

The parser-time intro gate remains responsible for automatic completion, input
skip, session behavior and failure recovery. Configured completion remains
4.2 seconds after animation start, with a 4.8-second navigation deadline. The
entire observed opening must stay below five seconds. Keyboard, scroll, touch
and Skip continue to reveal the homepage immediately; reduced motion and
no-JavaScript visitors receive the normal page. Media failure fails open.

The living hero gradient, homepage content and layout, approved portfolio records,
public project pages, filters, navigation, native scroll and mobile header geometry
are preserved. The independent footer layers retain static fallbacks and contact
controls. This correction does not add showreel footage, stock imagery, new client
claims or invented project outcomes.

## Source and production boundary

The supplied SVG originals remain unchanged. The separation script verifies
their hashes and the faithful reference PNG, then partitions existing pixels
using the reviewed ownership mask. Source RGB is retained; each alpha value is
assigned exclusively to one output. The [layer manifest](../design-assets/signature-layers/manifest.json)
and [layer notes](../design-assets/signature-layers/README.md) record provenance,
verification and what the source cannot recover.

Final production still requires an approved realistic hand mesh with commercial
rights, a deformation rig and skin/nail materials; editable accurate emblem and
glass geometry; animated grasp, collision and occlusion review; responsive cameras;
and separate rendered passes or an approved master sequence. The previous Blender
file is a material study containing a reference image plane, not a hand rig.
Neither the masked prototype nor that study completes the 3D requirement.

## Review evidence

The current gallery provides updated desktop/mobile recordings and responsive
keyframes for the lower-left wordmark, empty rising hand, descending plaque,
assembly, held pose and automatic homepage reveal. It also links production
screenshots and the validation report. Evidence capture uses real elapsed browser
time and native scrolling, without seeking an animation timeline.

The [earlier signature gallery](../artifacts/signature/README.md) and
[original checkpoint validation](SIGNATURE_VALIDATION.md) remain preserved for
comparison and are explicitly historical. The new validation report is the source
for actual post-correction test results and measured timings. Client approval of
the revised opening and resolution of the production asset boundary remain open.
