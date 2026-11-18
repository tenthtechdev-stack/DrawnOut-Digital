# Portfolio source-to-browser quality

All 37 portfolio WebP source assets were traced to their unchanged original PNG and exact approved crop. Full boards now retain their native 1554–1654px width instead of being pre-reduced to 1440px. No image is upscaled, sharpened, reconstructed or generated. Small crops retain their actual native size.

Reproduce with `node scripts/portfolio/refresh-images.mjs`. Machine provenance, source hashes, original bounds and before/after hashes are in [portfolio-derivatives.json](../../design-assets/portfolio-derivatives.json). The original phase audit documents describe the historical baseline; their publication restrictions were superseded by the owner's later visual-display authorization, not factual verification.

## Encoding and framing

Source WebPs use quality 92, effort 6 and smart chroma subsampling, replacing the historical quality 86 + pre-downsample. Astro's final responsive resources explicitly use quality 90 instead of its implicit default; widths 320/480/640/800/1024/1200/1440/native are bounded by the genuine source width. These are responsive alternatives, never all downloaded for one image. Total source-master bytes increase from 3,520,584 to 6,452,732; browser-selected transfer is measured separately.

Small sources below 840px receive explicit maximum width/height equal to native source pixels within their existing reserved panel. Bunzo's 413px cup, 433px bag, SOL's 650px sign, Triarch's 554px device and FK's 614px card remain faithful details with breathing room, rather than being stretched to fill ever-larger panels. Native CSS size is still not equivalent to full sharpness at 2×/3× DPR; those assets need larger source masters for that standard. Browser tests inspect selected candidate width, CSS artwork bounds, DPR and filter/transform behavior.

## Asset inventory

| Asset                           | Original PNG | Native crop | Previous master | New master | Source size |
| ------------------------------- | ------------ | ----------- | --------------- | ---------- | ----------- |
| bunzo-applications.webp         | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 288 KiB     |
| bunzo-packaging-wide.webp       | 1654×931     | 1654×541    | 1440×471        | 1654×541   | 163 KiB     |
| sol-community-applications.webp | 1654×932     | 1654×932    | 1440×811        | 1654×932   | 650 KiB     |
| sol-community-signage.webp      | 1654×932     | 650×397     | 650×397         | 650×397    | 107 KiB     |
| churros-applications.webp       | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 323 KiB     |
| churros-retail-wide.webp        | 1654×931     | 1654×420    | 1440×366        | 1654×420   | 158 KiB     |
| triarch-business-card.webp      | 1654×931     | 814×931     | 814×931         | 814×931    | 231 KiB     |
| triarch-identity-board.webp     | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 303 KiB     |
| by-tech-applications.webp       | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 96 KiB      |
| feed-n-seed-product.webp        | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 255 KiB     |
| abacus-applications.webp        | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 221 KiB     |
| bunzo-identity.webp             | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 219 KiB     |
| bunzo-cup-detail.webp           | 1654×931     | 413×508     | 413×508         | 413×508    | 27 KiB      |
| bunzo-bag-detail.webp           | 1654×931     | 433×508     | 433×508         | 433×508    | 35 KiB      |
| bunzo-social-layouts.webp       | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 339 KiB     |
| sol-identity-system.webp        | 1554×1227    | 1554×1227   | 1440×1137       | 1554×1227  | 210 KiB     |
| sol-notice-layouts.webp         | 1433×424     | 1433×424    | 1433×424        | 1433×424   | 76 KiB      |
| sol-apparel-detail.webp         | 1654×932     | 1002×397    | 1002×397        | 1002×397   | 164 KiB     |
| triarch-letterform-detail.webp  | 1654×931     | 837×461     | 837×461         | 837×461    | 42 KiB      |
| triarch-device-detail.webp      | 1654×931     | 554×629     | 554×629         | 554×629    | 13 KiB      |
| churros-identity.webp           | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 315 KiB     |
| churros-patterns.webp           | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 147 KiB     |
| by-tech-identity.webp           | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 46 KiB      |
| abacus-social-layouts.webp      | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 196 KiB     |
| feed-n-seed-stationery.webp     | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 174 KiB     |
| capture-applications.webp       | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 159 KiB     |
| capture-identity.webp           | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 89 KiB      |
| capture-stationery-detail.webp  | 1654×931     | 615×566     | 615×566         | 615×566    | 30 KiB      |
| khalo-packaging.webp            | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 221 KiB     |
| khalo-applications.webp         | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 251 KiB     |
| khalo-identity.webp             | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 145 KiB     |
| fk-applications.webp            | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 98 KiB      |
| fk-identity.webp                | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 43 KiB      |
| fk-card-detail.webp             | 1654×931     | 614×390     | 614×390         | 614×390    | 22 KiB      |
| smoothie-identity.webp          | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 116 KiB     |
| smoothie-color.webp             | 1654×931     | 1654×931    | 1440×811        | 1654×931   | 179 KiB     |
| smoothie-menu.webp              | 1654×863     | 1654×863    | 1440×751        | 1654×863   | 148 KiB     |

## Review and limits

[Before/after same-scale crops](../../artifacts/motion-quality/README.md) cover Bunzo, SOL, Triarch and FK's smaller card. The comparison enlarges the old 1440px derivative only to the same native reference scale, then extracts the identical 600 × 360 (or bounded) source rectangle. No artificial sharpening is used. A small unchanged-size crop improves compression fidelity, not geometric detail.

The source PNGs themselves contain flattened mockups, baked texture and pre-existing raster softness. Highest-resolution originals here remain around1654px wide; full-width1920px and high-density immersive views cannot acquire additional real detail from them. For genuinely sharper large/high-DPR output, supply native high-resolution isolated exports or editable project masters.

Existing case curation, artwork proportions, project order and all visual-only factual/credit safeguards are preserved. New video-poster compositions are audited separately in the motion export manifest. Physical iOS Safari/Android verification is not performed here.

## Measured source comparison and served assets

`node scripts/portfolio/measure-images.mjs` compares every one of the 37 derivatives with its exact native source crop. RGB PSNR improves for all 37 assets, by 0.475–16.482 dB. This measures less deviation from the existing source; it does not measure creative quality or imply recovery of missing detail. [Raw per-image results](../../artifacts/motion-quality/image-comparison-metrics.json).

The browser audit records 68 actual case-artwork selections across 390px and 1440px at DPR 2, including candidate pixel width, rendered bounds, CSS filter and object-fit. The existing Work/home browser regressions additionally exercise the ordered cards and their responsive artwork. [Browser audit](../../artifacts/motion-quality/browser-image-audit.json).

A read-only check retrieved all eleven current Netlify case pages and decoded their 35 distinct portfolio image `src` resources (2,581,048 bytes in aggregate). Their larger boards still cap at the older 1440px variants. Declared `srcset`/`sizes` are recorded separately from the measured local browser selections. This observation neither deploys this branch nor claims that all those resources load in one visit. [Served-asset audit](../../artifacts/motion-quality/netlify-observation.json).
