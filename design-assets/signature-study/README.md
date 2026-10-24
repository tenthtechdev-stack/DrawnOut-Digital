# Signature material study

`signature-glass-study.blend` is a packed, editable Blender 4.3.2 scene. It
contains the supplied composite on an explicitly named image plane and a
separate geometric acrylic material study. It contains **no hand mesh, hand rig
or editable DrawnOut emblem** and is not a production hand animation.

Read [the asset process](../../docs/SIGNATURE_ASSET_PROCESS.md) for source
inspection, reproduction commands, visual quality assessment and exact missing
production inputs. [The manifest](manifest.json) records source and derivative
provenance; [the render report](render-report.json) records observed local
rendering settings and file hashes. Review PNGs live in
[`artifacts/signature/`](../../artifacts/signature/).

The scene's reference pixels are packed. Its output path is relative, so opening
the scene and rendering writes `signature-glass-study.png` beside the `.blend`
file. To regenerate the scene itself, use `scripts/signature/render-study.py`.
