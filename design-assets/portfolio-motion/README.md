# Portfolio motion exports

Six completed silent 2D source-art compositions, each exported in landscape (960 × 540) and portrait (600 × 750). All 12 MP4s are 5.75 seconds, 24 fps, 138 frames, H.264/yuv420p, and below 3 MiB per file.

- [Review gallery](../../artifacts/portfolio-motion/assets-gallery.html)
- [Review notes, MP4 links and GIF previews](../../artifacts/portfolio-motion/PORTFOLIO_MOTION_ASSETS.md)
- [Source crops, source SHA-256 hashes and export metadata](manifest.json)

The source artwork is flattened approved PNG boards. Original marks and illustrations are cropped source pixels, composed using 2D image panels, masks and decorative presentation guides. These exports do not claim independently rigged vectors or simulated 3D products.

The SOL opening uses the original color emblem from `02_SOL_Community_Center_01.png`, crop `[607, 27, 186, 186]`, with a 92-source-pixel circular presentation mask to remove the surrounding banner photograph. The emblem retains its source pixels and proportions, without a redraw or recoloring.

Rebuild with `node scripts/portfolio/render-loops.mjs`; verify with `node --test tests/portfolio-motion-exports.test.mjs`; regenerate review material with `node scripts/portfolio/create-review.mjs`.
