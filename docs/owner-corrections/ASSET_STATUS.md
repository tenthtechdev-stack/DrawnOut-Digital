# About emblem: source audit and approval checkpoint

**Status: the requested real 3D DrawnOut emblem is blocked by missing approved
editable geometry. No new 3D emblem is integrated or submitted as complete.**
The existing approved 2D hand/plaque choreography remains unchanged.

This audit follows the [owner correction](https://github.com/tenthtech/drawnout-digital/pull/12#issuecomment-6605751248)
and independently checks the files described in
[the signature asset process](../SIGNATURE_ASSET_PROCESS.md). The repository was
inspected from `3e59c251230a4bcddb8eb548ad9c853daa116e37`, together with the
available original master-pack ZIP, extracted pack and attachment inventory.

## What actually exists

| Source                                                        | Actual contents                                                                                                                                                   | Suitable use                                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/assets/brand/drawnout-logo-provided.png`                 | Supplied 1920 × 1080 raster, identical to the original master-pack copy; shaded orange/dark mark and wordmark                                                     | Approved 2D visual reference, not an editable emblem mesh or vector                      |
| `src/components/BrandEmblem.astro`                            | An SVG viewport cropping that PNG to the emblem area                                                                                                              | Faithful 2D presentation; no geometric depth, hidden surfaces or new viewing angles      |
| Both SVGs in `design-assets/brand-originals/`                 | Byte-identical wrappers with two embedded raster images, filters and a mask; **zero path elements**                                                               | Reference appearance of the hand and illuminated plaque, not independent emblem geometry |
| `design-assets/signature-study/signature-glass-study.blend`   | Four mesh objects: floor, four-vertex composite image plane, eight-vertex acrylic study plate and eight-vertex pedestal; two text labels, camera and three lights | Real material/lighting study only; **no emblem geometry, no hand mesh, no armature**     |
| `src/assets/signature/hand-empty.png` and `emblem-plaque.png` | Source-pixel-separated raster layers from the supplied composite                                                                                                  | Existing approved motion prototype; not a rigged 3D source                               |

The original master-pack ZIP contains 30 entries and **no vector or 3D source
files**. The supplied logo's raster shading and overlapping shapes do not
establish the obscured contour, back surfaces, extrusion thickness or approved
3D proportions. Tracing those pixels would produce a newly interpreted design,
not verified source geometry. No inferred extrusion has been substituted.

## Visual inspection and machine-readable evidence

[Open the source-review gallery](../../artifacts/owner-corrections/asset-review/README.md).
It shows the actual supplied flat mark and historical Blender material render,
with explicit labels. It is an **asset status preview**, not a proposed or
approved new 3D emblem.

- [Source inventory](../../artifacts/owner-corrections/asset-review/source-inventory.json): exact source SHA-256 hashes, PNG dimensions, parsed SVG element counts and original ZIP findings.
- [Blender object inventory](../../artifacts/owner-corrections/asset-review/blender-inventory.json): actual objects, mesh sizes, modifiers, packed image and scene status read by Blender 4.3.2 from the `.blend` file.
- [Read-only Blender inspection script](../../artifacts/owner-corrections/asset-review/inspect-blend.py): repeatable object inspection; does not save or modify the original scene.

The inventory confirms both original SVG hashes remain
`ea295f96073b0e789532551ec1787a9c10728fa46767ce27fb428ff1c3affcbb`;
the Blender study remains
`1987636b28fab53a49c5709512ab5fed969fa638a8cf122575c7fc578cddc675`.
No supplied original was changed during inspection.

## Exact dependency and next approval gate

Provide either:

1. An approved original `.blend`, `.glb`, `.fbx` or equivalent editable emblem
   asset, with the applicable usage/source-delivery rights and material intent;
   or
2. Approved editable vector paths for **both full emblem shapes**, including the
   orange shape obscured by the dark shape, plus confirmation of their relative
   proportions and intended overlap. The depth, bevel and material treatment can
   then be developed as a new 3D proposal for visual approval.

Before final integration, that source must produce a review sheet with a neutral
front view, an oblique view showing actual thickness, an About-hero lighting view
and desktop/mobile placement. A source/provenance manifest and optimized outputs
must accompany it. The owner must approve that asset preview before it becomes
the About hero's second arrival stage.

The corrected About hero can ship for review with portrait, localized atmosphere
and readable copy while this stage is withheld. Its recordings must not be
labelled the completed portrait → **3D emblem** → gradient sequence. The existing
Services hero's approved 2D emblem and signature footer raster prototype are
outside this asset replacement task and retain their truthful existing status.
