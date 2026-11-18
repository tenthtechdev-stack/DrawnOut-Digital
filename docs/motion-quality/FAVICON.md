# Authentic DrawnOut favicon

The icon uses the supplied orange-and-charcoal emblem, without the wordmark. It is a faithful raster extraction, not a traced logo or a new vector design.

## Source and reproducibility

- Source: `src/assets/brand/drawnout-logo-provided.png`, 1920 × 1080.
- Source SHA-256: `07bc735f2c9e76ef9b7983cd06d22f65dfcc492054413d1dac2cf5e4ba138000`.
- Extraction: x163, y251, width464, height610. These are the complete nonzero-alpha bounds in the source emblem region (x < 650); the wordmark begins separately around x700.
- Derived transparent artwork: `src/assets/brand/drawnout-emblem-isolated.png`, 464 × 610. Source pixels and alpha are unchanged.
- Rebuild: `node scripts/brand/build-favicons.mjs`.
- Output provenance and byte hashes: `public/icons/source.json`.

The supplied SVG originals are image-backed hand/emblem composites, not independent vector geometry. They were inspected and intentionally not misrepresented as vector logo masters. The new favicon SVG is explicitly an image-backed wrapper of the faithfully extracted emblem. An actual approved vector emblem master remains useful for future vector exports, but is not required for these downsampled icons.

## Outputs

All explicitly linked filenames contain the isolated artwork's SHA-256 prefix `a8d6f694a5`, so the corrected icon has a new cache identity. PNG icons are 16, 32, 180, 192 and 512 pixels square. The ICO contains 16 and 32px PNG-compressed entries. `/favicon.ico` also supplies the genuine icon to clients requesting that conventional path.

The supplied proportions, orange gradient, charcoal face and edge alpha are retained. A warm cream background makes the charcoal portion legible in light and dark browser chrome. Small icons use 87.5% height; application icons use 82%. No output enlarges the 610px native artwork.

`SiteLayout.astro` declares SVG, 16/32px PNG, ICO and Apple touch icons in the shared head without changing title, noindex, contact or loader behavior. No Astro or Netlify icon reference is added.

## Verification

`tests/favicon.test.ts` verifies the exact extracted pixels, native dimensions, output dimensions, ICO entries, cache-safe shared-head declarations and supplied-source provenance. Browser checks verify shared icon declarations on all 22 routes, retrieve their assets, and record Chromium's actual automatic ICO request returning 200. The icon artwork was visually inspected. A screenshot of browser-tab chrome was not captured; the automated selection evidence is in `artifacts/motion-quality/browser-favicon-audit.json`.
