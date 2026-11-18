# Portfolio motion completion: direction and source boundaries

This delivery replaces only the Triarch, By Tech Group and U Wanna Smoothie
loops. It uses their supplied artwork to give each identity a different motion
story. Bunzo, SOL Community Center and Churros remain the unchanged reference
implementations from PR #20, including their compositions, source layers,
posters and exported videos.

These are completed exports for creative review. Source-fidelity checks and
playback tests establish technical behavior; they do not establish the owner's
creative approval or turn flattened raster artwork into editable brand masters.

## Before and after

The [comparison manifest](../../artifacts/motion-completion/comparison-manifest.json)
records the actual original and replacement files, dimensions, timing and
hashes. Its original loops come from immutable commit
`e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b`. Review GIFs are reduced copies of the
encoded MP4s, without retiming, sharpening or colour correction.

| Project          | Original 5.75-second loop                                                                | Replacement 7.5-second loop                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Triarch          | An intact identity crop, construction guides and large card/device presentation panels.  | Seven visible letter fragments move separately around the real tagline; measured rules lead into a contour-masked card, device and material detail.                |
| By Tech Group    | One intact identity crop followed by a grid aperture and rectangular application panels. | Five visible mark surfaces connect independently, the two wordmark phrases align, then separate real cards and a source mug establish the application arrangement. |
| U Wanna Smoothie | An intact badge and a broad wave mask revealing cup, drink and menu panels.              | Actual cup, citrus, leaves, ring and lettering articulate independently before the real fruit, menu and top-view drink form an application scene.                  |

The older loops already used cropped portions of presentation boards. The
change is more precise separation and timing of the actual visible parts,
rather than a claim that every original loop moved a whole board. Some
photographs and printed-layout panels necessarily remain intact source groups.

Each replacement has 180 frames at 24fps, with separately arranged 1440 × 810
landscape and 810 × 1080 portrait compositions. The original exports were
960 × 540 and 600 × 750, with 138 frames at 24fps. More canvas space provides
room for composition; it creates no additional source detail. The new exports
are silent H.264/yuv420p with explicit BT.709 matrix, primaries and transfer,
limited range, and matching WebP posters. Both loop boundaries resolve to the
same unencoded source pose.

## Triarch: architectural precision

The scene starts with a quiet architectural photograph, monogram and legible
identity. Seven visible letter fragments move on small, staggered vertical
axes. Fine charcoal rules and a yellow datum establish alignment; the intact
printed tagline travels independently by only six pixels. The neutral
`#e9e9e9` ground stays constant throughout.

Once the identity aligns, the actual card enters on a measured diagonal. Its
reveal follows the card's photographed paper plane. The device presentation
opens separately, while a real unprinted material crop settles into the
composition. These applications withdraw and the letter fragments return to
their original alignment. The photograph and monogram provide still anchors,
so the motion remains local and restrained.

The [composition](../../scripts/portfolio/quality/triarch.mjs) and
[manifest](../../design-assets/portfolio-motion/quality/triarch-manifest.json)
record 13 source crop assets from the two supplied 1654 × 931 PNG boards in
[`14_Triarch`](../../design-assets/portfolio-originals/14_Triarch/). Nine crops
have alpha-isolation masks: the seven letter fragments, monogram and card.

The white tagline band covers the middle of the large printed glyphs in the
flattened original. The animation uses only the visible upper and lower
fragments; it does not reconstruct the hidden letter middles. The tagline is
retained as a complete 677 × 34 source band so its copy and spacing remain
intact. An approved AI/SVG wordmark or layered PSD is needed for complete
independent glyphs.

The visible wordmark spans 720 source pixels, the monogram crop is 151 × 169,
the card crop is 500 × 372, the device panel is 554 × 629, the architectural
photograph is 437 × 176 and the material detail is 400 × 176. They are presented
at native size or smaller. A clean high-resolution card export and device
master would permit larger application views. The card remains a photographic
cutout with an existing perspective, rather than a newly modeled 3D object.

## By Tech Group: connected identity

Five authentic visible surfaces—the purple tail, blue bridge, blue bowl,
green crossbar and descending green stroke—separate along different vectors
with shallow rotations. Their staggered connection restores the original
gradient mark. The green “BY TECH” and white “GROUP” phrases move on separate
offsets using the supplied lettering.

The completed mark becomes smaller as the real application artwork takes
over. The black rear card and white front card enter independently, preserving
their supplied relative pose once settled. The original gradient connector and
purple dot matrix carry the identity's rhythm into this arrangement. A mug
enters from the right and acts as a still application anchor. The applications
depart before a small separation and reconnection restores the opening pose.
The canvas stays charcoal `#0e0f12`; this sequence implies visual connection,
without depicting a functioning software product.

The [composition](../../scripts/portfolio/quality/by-tech.mjs) and
[manifest](../../design-assets/portfolio-motion/quality/by-tech-group-manifest.json)
record 12 alpha-isolated source crop assets from three supplied 1654 × 931 PNG
boards in [`03_By_Tech_Group`](../../design-assets/portfolio-originals/03_By_Tech_Group/).
The complete-mark reference is included in that count alongside the five
separated surfaces. The two wordmark phrases use presentation clips on one
source lettering crop, rather than two newly typeset assets.

The actual visible mark is approximately 486 × 239 inside a 550 × 300 crop.
It is never enlarged above native size. The wordmark crop is 720 × 90; the two
card layers share a 665 × 438 source region; the mug crop is 534 × 438; the
gradient bar is 240 × 38 and the dot matrix is 175 × 112. The latter crop keeps
the actual dot row without neighboring board labels.

The mug handle is already cut off at the source board's right edge. That edge
is deliberately aligned with the output edge during entry, hold and exit;
missing handle material is not invented. The black card's obscured edge also
remains obscured. Layered AI/SVG masters with separate gradient surfaces and
lettering paths are needed for complete underlaps or larger identity renders.
High-resolution isolated application masters would improve physical edges and
small print. Existing names or contact details inside printed source artwork
are not promoted to independently verified client, team or service claims.

## U Wanna Smoothie: playful assembly

The central badge opens through overlapping spring timing. The red lid, pink
cup body, green citrus quarter, orange citrus quarter and paired leaves each
have a separate motion schedule. The original gold ring and curved wordmark
move independently around them. Three fragments of the real pink title move
through small offsets, then realign at their original spacing.

Two supplied fruit photographs enter as modest foreground accents. A shallow
curved aperture reveals the illustrated menu, then the actual top-view drink
and attached straw rise into the application scene. The source components
return to the same assembled identity at both loop boundaries. The final
canvas uses the exact solid `#fffdf6` ground with a white badge backing. A
background-wave crop containing neighboring source artwork is omitted; the
fluid character comes from component timing and the menu aperture, rather
than a contaminated background strip or an invented liquid simulation.

The [composition](../../scripts/portfolio/quality/smoothie.mjs) and
[manifest](../../design-assets/portfolio-motion/quality/u-wanna-smoothie-manifest.json)
record 15 source crop assets from the supplied boards in
[`12_U_Wanna_Smoothie`](../../design-assets/portfolio-originals/12_U_Wanna_Smoothie/).
Fourteen have alpha-isolation masks. This includes both the complete pink
title reference and its three alternate fragments; they are not four
different invented titles. The gold ring is isolated within its actual
annular region, and the curved lettering retains its original near-black and
gray edge pixels. Colour mattes remove the pink presentation field crossing
the flattened badge without repainting the retained artwork.

The badge is 522 × 518 source pixels, with central components only about
80–160 pixels wide. Its landscape and portrait presentations stay at or below
that native size. The title is 710 × 64, the fruit photographs are 180 × 156
and 232 × 199, the drink/straw crop is 565 × 530, and the menu panel is
821 × 460. These application assets also stay at native size or smaller.

The paired leaves remain one source group, as do the curved lettering and
the textured gold ring. The top-view drink, straw, berries and mint remain
one photographic layer. Hidden cup surfaces, loose toppings or independent
leaves cannot be recovered faithfully from the flattened boards. Approved
AI/SVG/PSD masters and alpha photographic exports would be needed for that
additional articulation. The menu is supplied printed artwork; its separate
About/Find Us claims are excluded from this composition.

## Reproduction, fidelity and review

Across these three projects, the manifests contain 40 source crop assets,
35 of which use alpha-isolation masks. Those counts include alternate
assembled references and do not equal a count of simultaneously independent
animated objects. Crop bounds, mask definitions, original-file SHA-256 hashes,
derived-layer hashes and export metadata are recorded per asset. The
[renderer](../../scripts/portfolio/quality/render.mjs) uses the existing
Node/Sharp/FFmpeg pipeline; the three project modules contain the deterministic
timing and format-specific positions.

The [media validation record](../../artifacts/motion-completion/media-validation.json)
contains actual decoded-export measurements and source-fidelity checks. Exact
retained opaque source pixels, poster consistency and loop continuity are
technical evidence. They cannot measure whether the composition is elegant or
replace review of the actual MP4s. Triarch's local motion measurement is
explicitly documented because its stationary neutral area makes a global
image-difference threshold a poor proxy for its restrained direction.

The earlier [reference study](../motion-quality/REFERENCE_STUDY.md) records the
principles learned from the supplied private clips: independent elements,
overlapping timing, readable identity holds and transitions motivated by the
real graphic system. The clips remain outside this checkout. No reference
brand frames, artwork or code are included in these compositions.

The enquiry puzzle is unchanged. The
[reuse recommendation](ENQUIRY_RECOMMENDATION.md) is documentation for a later
owner decision, with no propagation to the other Services pages. Production
quality 3D signature-hand/footer development and live enquiry delivery remain
separate milestones; neither is completed by these portfolio exports.
