# Motion reference study and original direction

The owner supplied three private MP4 references. Their actual decoded frame
sequences, contact sheets and stream metadata were inspected before producing
the new DrawnOut compositions. The reference media stays outside this checkout;
none of its brand artwork, frames or code is part of the delivery.

| Reference                          | Actual supplied stream                   | Technique observed                                                                                                                                                                      | DrawnOut application                                                                                                                                                                                   |
| ---------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MELTD illustrated assembly         | 1280 × 720, 24fps, 217 frames, 9.041667s | A legible assembled hold precedes separation. Letters and illustrated ingredients move on different arcs and schedules; anticipation and overlapping return keep the identity readable. | Bunzo's actual letterfaces, cup, carton and source accents move independently. Churros articulates its crest, wordmark, illustration, border and ribbon instead of zooming a whole presentation board. |
| YORI CAFE identity to applications | 1280 × 720, 30fps, 450 frames, 15s       | Identity construction motivates masks, an application field and held physical surfaces. The graphic vocabulary connects transitions instead of acting as unrelated decoration.          | SOL's source annulus and core separate, then its circular geometry opens onto the actual signage, notice and printed-object artwork.                                                                   |
| gotto. restrained label animation  | 1280 × 720, 30fps, 480 frames, 16s       | The product stays substantially stationary while typography, fine lines and small graphic details move within its label. Contrast between stillness and movement provides the rhythm.   | Churros packaging anchors the moving badge. The principle informs the later Triarch direction; its existing production loop is preserved pending approval of these first three samples.                |

## What was translated

The useful principles are decomposition, independent timing, a readable complete
identity, movement caused by a real graphic element, and a deliberate return.
The new compositions use their projects' own supplied colors and source pixels.
They do not recreate the reference sandwich, lettering, bottle, packaging,
collage layout or animation frame for frame.

Each pilot has a distinct structure:

- **Bunzo — packaging with personality:** restrained anticipation, individually
  moving actual white letterfaces against their shared original silhouette,
  overlapping cup/carton movement, source graphic accents and a restored mark.
- **SOL — the symbol becomes a system:** independent gold annulus, green core
  and source lettering, followed by a circular application reveal and a held
  arrangement of genuine signage and print mockups.
- **Churros — illustration in motion:** the source badge opens into meaningful
  crest, intact wordmark, pastry/chocolate, border and ribbon layers. Real
  ornamental details connect it to stationary source packaging.

These are creative review samples. Rendering, decoding and loop tests establish
technical behavior; the owner still decides whether the compositions achieve
the required creative quality. The three remaining production directions are
not replaced until that approval.

## Reproducible production

The Node/Sharp/FFmpeg pipeline in
[`scripts/portfolio/quality`](../../scripts/portfolio/quality/) contains the
timings, layouts, source-pixel crop bounds and alpha-mask definitions. The
generated manifests record exact originals, hashes, layers and encoding data.
The final gallery links the actual MP4s, matching posters and keyframes. See
[limitations and required masters](LIMITATIONS.md) for the boundary between a
faithful raster assembly and an independently editable illustration rig.
