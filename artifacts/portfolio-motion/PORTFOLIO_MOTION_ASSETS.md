# Portfolio motion review

[Open the local gallery](assets-gallery.html) to play all six completed compositions and compare their portrait framing. Native video controls make the loops reviewable without autoplay. Each project also has a small looping GIF preview.

All 12 MP4s are silent H.264/yuv420p, 138 frames, 24 fps and 5.75 seconds. Landscape is 960 × 540; portrait is 600 × 750. The files remain below the 3 MiB per-loop budget.

| Project | Landscape MP4 | Portrait MP4 | Preview |
| --- | --- | --- | --- |
| SOL Community Center | [222 KiB](../../design-assets/portfolio-motion/sol-community-center-landscape.mp4) | [222 KiB](../../design-assets/portfolio-motion/sol-community-center-portrait.mp4) | [GIF](sol-community-center-preview.gif) |
| Bunzo | [225 KiB](../../design-assets/portfolio-motion/bunzo-landscape.mp4) | [165 KiB](../../design-assets/portfolio-motion/bunzo-portrait.mp4) | [GIF](bunzo-preview.gif) |
| Triarch | [201 KiB](../../design-assets/portfolio-motion/triarch-landscape.mp4) | [159 KiB](../../design-assets/portfolio-motion/triarch-portrait.mp4) | [GIF](triarch-preview.gif) |
| Churros Dessert Shop | [284 KiB](../../design-assets/portfolio-motion/churros-landscape.mp4) | [315 KiB](../../design-assets/portfolio-motion/churros-portrait.mp4) | [GIF](churros-preview.gif) |
| By Tech Group | [147 KiB](../../design-assets/portfolio-motion/by-tech-group-landscape.mp4) | [120 KiB](../../design-assets/portfolio-motion/by-tech-group-portrait.mp4) | [GIF](by-tech-group-preview.gif) |
| U Wanna Smoothie | [144 KiB](../../design-assets/portfolio-motion/u-wanna-smoothie-landscape.mp4) | [142 KiB](../../design-assets/portfolio-motion/u-wanna-smoothie-portrait.mp4) | [GIF](u-wanna-smoothie-preview.gif) |

## Source artwork and limitations

The source images are the approved flattened presentation boards under [portfolio-originals](../../design-assets/portfolio-originals/). Every source crop and source SHA-256 is recorded in the [export manifest](../../design-assets/portfolio-motion/manifest.json). Marks and illustrations remain source pixels; decorative construction guides and masks are separate presentation elements. The compositions do not claim rigged vector animation, physically simulated products, new services or client outcomes.

The SOL opening samples the original color emblem from `02_SOL_Community_Center_01.png` at source bounds `[607, 27, 186, 186]`. A circular presentation mask with a 92-source-pixel radius removes the surrounding banner photograph. The emblem's original pixels and proportions are retained, with no redraw or recoloring.

Each direction has a separate motion vocabulary: SOL uses concentric apertures and stationery; Bunzo uses staggered shutters and packaging panels; Triarch uses architectural guides and a measured gate; Churros uses orbiting circular windows; By Tech Group uses a progressive module grid; U Wanna Smoothie uses an organic wave reveal.

## Reproduction and verification

From the repository root, with Node, Sharp and FFmpeg available:

```sh
node scripts/portfolio/render-loops.mjs
node --test tests/portfolio-motion-exports.test.mjs
node scripts/portfolio/create-review.mjs
```

The renderer asserts pixel-identical unencoded first and last frames. The export test reads the actual MP4s and checks their hashes, stream properties, duration, frame count, dimensions and size budget. It also checks that decoded first/last frames remain visually matched after H.264 compression and that the application scene visibly differs from the opening identity scene.

Four PNG keyframes per format show the opening, construction, applications and return stages. GIF previews are reduced review copies; the MP4s are the delivery assets.
