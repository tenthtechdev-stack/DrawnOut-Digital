# Portfolio motion exports

All six projects use the source-pixel composition pipeline. The current milestone replaces only Triarch, By Tech Group and U Wanna Smoothie. Bunzo, SOL Community Center and Churros remain byte-identical to PR #20, including source modules, layers, posters, exports and per-project manifests.

Every silent H.264 High/yuv420p loop runs 7.5 seconds at 24fps (180 frames), CRF 19 with faststart, explicit full-range RGB → limited-range BT.709 conversion, and matching matrix/primaries/transfer/VUI metadata. Landscape is 1440 × 810; portrait is 810 × 1080. Composition space creates no extra raster detail. All exports remain outside public/ and subject to publication/withdrawal controls.

| Project              | Landscape     | Portrait      | Review scope        |
| -------------------- | ------------- | ------------- | ------------------- |
| Bunzo                | 700,510 bytes | 656,480 bytes | Unchanged reference |
| SOL Community Center | 943,778 bytes | 792,030 bytes | Unchanged reference |
| Churros              | 668,984 bytes | 667,759 bytes | Unchanged reference |
| Triarch              | 356,574 bytes | 279,075 bytes | New creative review |
| By Tech Group        | 437,004 bytes | 407,144 bytes | New creative review |
| U Wanna Smoothie     | 563,715 bytes | 489,148 bytes | New creative review |

- [Three completed animations: GIFs, MP4s, before/after and browser recordings](../../artifacts/motion-completion/README.md).
- [Art direction, native-source limits and editable-master dependencies](../../docs/motion-completion/ART_DIRECTION_AND_SOURCES.md).
- [Actual completion validation](../../docs/motion-completion/VALIDATION.md).
- [Unchanged first-three review gallery](../../artifacts/motion-quality/README.md) and [historical validation](../../docs/motion-quality/VALIDATION.md).
- [All six per-project manifests, posters and RGBA layers](quality/).
- [Reproducible source compositions and renderer](../../scripts/portfolio/quality/).

## Reproduce the three completed projects

Node, the locked dependencies, Sharp, FFmpeg/FFprobe, original portfolio boards and Chromium are required. Run from the repository root:

```sh
node scripts/portfolio/quality/render.mjs
node scripts/portfolio/promote-completion.mjs
node scripts/portfolio/quality/verify-completion-color.mjs
node scripts/portfolio/create-completion-review.mjs
node --test tests/portfolio-motion-exports.test.mjs tests/motion-quality-exports.test.mjs tests/motion-completion-preservation.test.mjs
```

The renderer defaults to these three completed projects only. Select one with `--project triarch`, `--project by-tech-group` or `--project u-wanna-smoothie`; `--stills` prepares source keyframes without overwriting export records. Promotion validates all six new files before updating only those project records and production filenames.

Bunzo, SOL and Churros are frozen references. The renderer refuses to overwrite their canonical quality directory; explicit studies require a separate `--out` and `--evidence` directory. Their original project modules, shared renderer helpers and manifests remain reproducible at the PR #20 commit. Do not run older promotion commands against current production assets.

JavaScript compositions, crop/mask definitions, source-file hashes, individual RGBA layers and export metadata are committed. SVG snapshots embed duplicate source data and stay ignored. The old `scripts/portfolio/render-loops.mjs` pipeline is historical; do not use it to replace the current files. Its original 5.75-second exports remain available through the immutable before/after links in the completion gallery.
