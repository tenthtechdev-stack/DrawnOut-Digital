import { image, rect, ramp, n } from './shared.mjs';

const original = (number) =>
  `design-assets/portfolio-originals/04_Bunzo/04_Bunzo_${String(number).padStart(2, '0')}.png`;
// Color-constrained region-growing assigns the original opaque pixels to their
// actual letter/phrase cores. It does not reconstruct the lettering or logo.
const glyph = (part) => ({
  source: original(1),
  bounds: [75, 95, 760, 400],
  mask: { type: 'wordmark-partition', part },
  note: 'Exact original raster partition using white-letter / yellow-phrase seeds and exterior red-background flood matte. No replacement lettering.',
});

export const project = {
  slug: 'bunzo',
  title: 'Bunzo',
  direction:
    'The five white wordmark letterfaces lift independently from their original black silhouette; actual cup and carton peel out, overlap, and settle back into a branded packaging still life.',
  background: '#e31c23',
  assets: {
    letterB: glyph('letterB-face'),
    letterU: glyph('letterU-face'),
    letterN: glyph('letterN-face'),
    letterZ: glyph('letterZ-face'),
    letterO: glyph('letterO-face'),
    base: glyph('base'),
    whole: glyph('whole'),
    cup: {
      source: original(4),
      bounds: [390, 8, 411, 505],
      mask: {
        type: 'path',
        d: 'M31 113Q32 99 51 93L52 79Q59 63 170 63Q291 62 300 80L302 95Q320 100 322 118Q322 125 307 130L269 464Q265 478 231 482Q150 494 104 478Q88 473 82 462L45 132Q31 128 31 113Z',
      },
      note: 'Actual lidded cup isolated from the original photographed mockup. No simulated product or invented ingredients.',
    },
    carton: {
      source: original(3),
      bounds: [488, 112, 560, 390],
      mask: {
        type: 'path',
        d: 'M44 45L409 0L550 151L557 248L539 258L524 335L165 389L79 331L18 277L0 153Z',
      },
      note: 'Actual closed carton, including printed design; outer silhouette traced from source pixels.',
    },
    splash: {
      source: original(2),
      bounds: [790, 124, 108, 113],
      mask: { type: 'color', background: [239, 237, 232], threshold: 80, feather: 25 },
      note: 'The original yellow splash graphic from the approved graphic-elements board.',
    },
    heart: {
      source: original(2),
      bounds: [944, 124, 104, 112],
      mask: { type: 'color', background: [239, 237, 232], threshold: 85, feather: 25 },
      note: 'The original red outlined heart, not a newly drawn decoration.',
    },
    bolt: {
      source: original(2),
      bounds: [1101, 127, 75, 109],
      mask: { type: 'color', background: [239, 237, 232], threshold: 85, feather: 25 },
      note: 'The original black lightning graphic.',
    },
  },
  layers: [
    'Five exact white wordmark letterfaces',
    'Original black shadow, yellow phrase and heart suffix base',
    'Lidded printed cup foreground',
    'Printed carton foreground',
    'Original yellow splash, red heart and lightning accent layers',
  ],
  limitations: [
    'Flattened raster originals provide no editable type, independent burger ingredients or packaging dielines. No reconstructed lettering, new food, 3D product simulation or newly attributed deliverables are used.',
    'The five actual white letterfaces are alpha-isolated from the flattened mark. Its shared black silhouette and yellow phrase remain anchored; editable original typography would be required to rig independently complete outlined glyphs.',
    'The 1440×810 canvas is an editorial assembly of native-size/reduced layers, not a 1440px-wide rerendered source logo. Cup remains at or below its approximately300px native visible width; source carton is approximately550px wide.',
    'Product silhouettes use manually reviewed alpha paths. Transparent or motion-blurred editable masters would permit finer physical separation.',
  ],
};

export function render({ width, height, portrait, t, assets }) {
  const p = portrait;
  const split = ramp(t, 0.9, 2.05) * (1 - ramp(t, 2.75, 4.15));
  const anticipation = ramp(t, 0.55, 0.88) * (1 - ramp(t, 0.9, 1.15));
  const flourish = ramp(t, 1.25, 2.5) * (1 - ramp(t, 3.15, 4.8));
  const breathing = ramp(t, 5.65, 6.15) * (1 - ramp(t, 6.15, 7.05));
  const logoW = p ? 640 : 720;
  const logoH = (logoW * 400) / 760;
  const x = p ? 83 : 103;
  const y = p ? 126 : 145;
  const s = logoW / 760;
  const movements = [
    ['letterB', -29, -14, -7, 0],
    ['letterU', -13, -32, -4, 0.07],
    ['letterN', 4, -47, 2, 0.14],
    ['letterZ', 18, -30, 6, 0.2],
    ['letterO', 30, -11, 8, 0.28],
  ];
  let out = rect(0, 0, width, height, '#e31c23');
  // All accents are cropped from the approved graphic-elements sheet.
  out += image(assets.splash, p ? 76 : 70, p ? 54 : 62, 87, 91, {
    rotation: -4 - flourish * 10,
    scale: 1 + flourish * 0.12,
  });
  out += image(assets.bolt, p ? 667 : 1255, p ? 483 : 86, 58, 84, { rotation: 9 + flourish * 14 });
  out += image(assets.heart, p ? 652 : 1190, p ? 873 : 626, 83, 89, {
    rotation: -9 + flourish * 11,
  });
  // Independent products overlap as real cutouts, never rectangular presentation cards.
  const cupW = p ? 300 : 318;
  const cupH = (cupW * 505) / 411;
  const cupX = p ? 437 : 1013;
  const cupY = p ? 517 : 217;
  const cartonW = p ? 475 : 505;
  const cartonH = (cartonW * 390) / 560;
  const cartonX = p ? 85 : 667;
  const cartonY = p ? 663 : 447;
  out += image(
    assets.cup,
    cupX + split * (p ? 28 : 31),
    cupY - split * (p ? 30 : 53) - breathing * 7,
    cupW,
    cupH,
    { rotation: split * 5 + anticipation * -1.5 },
  );
  out += image(
    assets.carton,
    cartonX - split * (p ? 18 : 44),
    cartonY + split * (p ? 27 : 14),
    cartonW,
    cartonH,
    { rotation: split * -7 - anticipation },
  );
  // Overlapping timings: no copied preset or synchronous whole-board pan.
  // The base and five faces are complementary source-pixel mattes. Draw their
  // exact full-opacity union during separation; overlapping alpha crossfades
  // would reveal the red backdrop and turn the authentic white faces pink.
  if (split === 0) {
    out += image(assets.whole, x, y + anticipation * 7, logoW, logoH);
    return out;
  }
  out += image(assets.base, x, y + anticipation * 7, logoW, logoH);
  for (const [key, dx, dy, angle, delay] of movements) {
    const independent =
      ramp(t, 0.9 + delay, 1.8 + delay) * (1 - ramp(t, 2.65 + delay * 0.45, 3.7 + delay * 0.45));
    const tx = x + dx * independent * s;
    const ty = y + dy * independent * s + anticipation * 7;
    // Rotate each source partition about its own visible glyph position, not the board centre.
    const centres = {
      letterB: [119, 194],
      letterU: [260, 126],
      letterN: [399, 115],
      letterZ: [536, 126],
      letterO: [664, 152],
      promise: [441, 307],
    };
    const [cx, cy] = centres[key];
    const rx = tx + cx * s;
    const ry = ty + cy * s;
    out += `<g transform="rotate(${n(angle * independent)} ${n(rx)} ${n(ry)})">${image(assets[key], tx, ty, logoW, logoH)}</g>`;
  }
  return out;
}
