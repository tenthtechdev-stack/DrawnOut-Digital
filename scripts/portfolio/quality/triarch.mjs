/** Triarch: actual printed letter fragments align with measured architectural rules. */
import { image, rect, path, presence, n } from './shared.mjs';

const board = (index) => `design-assets/portfolio-originals/14_Triarch/14_Triarch_0${index}.png`;
const letter = (left, width) => ({
  source: board(1),
  bounds: [left, 182, width, 121],
  mask: {
    type: 'ranges',
    ranges: [{ min: [0, 0, 0], max: [100, 100, 100] }],
    clip: `M0 0H${width}V49H0Z M0 83H${width}V121H0Z`,
  },
  note: 'Actual dark letter pixels visible above/below the supplied tagline. Hidden middles are not reconstructed.',
});

export const project = {
  slug: 'triarch',
  title: 'Triarch',
  direction:
    'Seven authentic letter fragments move on measured vertical axes, align around their original tagline, then establish an architectural framework for an actual paper card and device presentation.',
  background: '#e9e9e9',
  assets: {
    t: letter(54, 103),
    r1: letter(161, 109),
    i: letter(276, 53),
    a: letter(333, 100),
    r2: letter(443, 109),
    c: letter(558, 99),
    h: letter(660, 114),
    tagline: {
      source: board(1),
      bounds: [88, 231, 677, 34],
      note: 'The intact original printed white tagline band, including its original lettering.',
    },
    architecture: {
      source: board(1),
      bounds: [382, 0, 437, 176],
      note: 'Unlettered architectural photograph from the top of the original identity board; never enlarged.',
    },
    monogram: {
      source: board(2),
      bounds: [136, 590, 151, 169],
      mask: { type: 'ranges', ranges: [{ min: [0, 0, 0], max: [110, 110, 110] }] },
      note: 'Actual dark T/A sticker-monogram pixels. No inference about a commissioned architectural engagement.',
    },
    card: {
      source: board(1),
      bounds: [1005, 325, 500, 372],
      mask: {
        type: 'path',
        d: 'M72 9L493 76L443 365L7 290Z',
      },
      note: 'The actual printed card silhouette. This is a flat photographic cutout, not a simulated 3D card.',
    },
    device: {
      source: board(2),
      bounds: [1100, 302, 554, 629],
      note: 'The approved laptop/monogram panel, excluding the typeface label and all pricing/scope artwork.',
    },
    material: {
      source: board(1),
      bounds: [835, 0, 400, 176],
      note: 'An actual unprinted material detail above the source card, displayed as its own native-size surface crop.',
    },
  },
  layers: [
    'Seven independent visible letter-fragment layers from the authentic wordmark.',
    'Original printed tagline band, kept whole to preserve its letterspacing and copy.',
    'Actual monogram, architectural photograph and material swatch.',
    'Contour-masked printed card and separate original device presentation.',
    'Authored fine presentation rules and a source-palette yellow construction datum; these are not replacement logo geometry.',
  ],
  limitations: [
    'The originals are two flattened1654×931 presentation PNGs. The tagline occludes the middle of the large logo. Only visible letter fragments are animated; an approved AI/SVG or layered PSD is needed for independent complete glyphs.',
    'Dark letter/monogram pixels are isolated by source-colour mattes; the pale architectural photograph is kept as its own crop rather than inventing a clean background under the original logo.',
    'The main wordmark is720px wide and the monogram crop151×169; both remain at or below native size. The1440×810 canvas does not create new logo detail.',
    'The printed card is a500×372 raster cutout and the device panel554×629. Editable identity geometry, a high-resolution card export and a clean device master would support larger presentation.',
    'No pricing, package descriptions, verified services, client outcomes or new typography are added.',
  ],
};

function line(x1, y1, x2, y2, progress, color, opacity = 1, strokeWidth = 1) {
  return path(
    `M${n(x1)} ${n(y1)}L${n(x1 + (x2 - x1) * progress)} ${n(y1 + (y2 - y1) * progress)}`,
    {
      stroke: color,
      opacity,
      strokeWidth,
    },
  );
}

export function render({ width, height, portrait, t, assets }) {
  const p = portrait;
  const identityX = p ? 45 : 100;
  const identityY = p ? 291 : 300;
  const scale = p ? 1 : 1;
  const construct = presence(t, 0.65, 2.05, 5.0, 6.8);
  const applications = presence(t, 2.55, 3.75, 5.45, 6.95);
  const taglineOffset = presence(t, 0.8, 1.4, 1.85, 3.0);
  let out = rect(0, 0, width, height, project.background);

  // The source architectural context remains steady; only fine rules respond.
  out += image(assets.architecture, p ? 65 : 100, p ? 55 : 75, 437, 176);
  out += image(assets.monogram, p ? 610 : 690, p ? 73 : 96, 100, (100 * 169) / 151, {
    opacity: 1,
    rotation: 0,
  });
  out += line(
    p ? 65 : 100,
    p ? 243 : 263,
    p ? 745 : 820,
    p ? 243 : 263,
    0.18 + construct * 0.82,
    '#3f3b3c',
    0.3,
  );
  out += line(
    identityX - 11,
    identityY - 14,
    identityX - 11,
    identityY + 136,
    construct,
    '#3f3b3c',
    0.32,
  );
  out += line(
    identityX + 731,
    identityY + 136,
    identityX + 731,
    identityY - 14,
    construct,
    '#3f3b3c',
    0.32,
  );
  out += line(
    identityX - 12,
    identityY + 136,
    identityX + 732,
    identityY + 136,
    construct,
    '#e2ae25',
    0.95,
    2,
  );

  const letters = [
    ['t', 0, -13],
    ['r1', 107, 10],
    ['i', 222, -9],
    ['a', 279, 12],
    ['r2', 389, -10],
    ['c', 504, 11],
    ['h', 606, -12],
  ];
  for (const [index, [name, offset, shift]] of letters.entries()) {
    const separate = presence(
      t,
      0.62 + index * 0.065,
      1.45 + index * 0.065,
      1.96 + index * 0.055,
      2.85 + index * 0.055,
    );
    out += image(
      assets[name],
      identityX + offset * scale,
      identityY + shift * separate,
      assets[name].width * scale,
      121 * scale,
    );
    const centre = identityX + offset + assets[name].width / 2;
    out += line(
      centre,
      identityY + 148,
      centre,
      identityY + 153 + Math.abs(shift) * separate,
      construct,
      '#3f3b3c',
      0.35,
    );
  }
  // The original band travels by just six pixels, independently of all glyphs.
  out += image(assets.tagline, identityX + 34 + taglineOffset * 6, identityY + 49, 677, 34);

  // A measured right-to-left placement, not a rotating presentation-board tile.
  const cardX = p ? 335 : 837;
  const cardY = p ? 590 : 304;
  const cardW = p ? 430 : 500;
  const cardH = (cardW * 372) / 500;
  const datumY = p ? 963 : 724;
  out += line(p ? 46 : 100, datumY, p ? 765 : 1338, datumY, applications, '#e2ae25', 0.95, 2);
  if (applications > 0) {
    const cx = cardX + (1 - applications) * 32;
    const cy = cardY + (1 - applications) * 17;
    // The reveal follows the genuine card's angled paper plane. It is not a
    // generic rectangular wipe or a reconstruction of the printed artwork.
    const cardScale = cardW / 500;
    const corner = ([px, py]) => `${n(cx + px * cardScale)},${n(cy + py * cardScale)}`;
    const revealLeft = [72 + (7 - 72) * applications, 9 + (290 - 9) * applications];
    const revealRight = [493 + (443 - 493) * applications, 76 + (365 - 76) * applications];
    out += `<defs><clipPath id="triarch-card-open"><polygon points="${[[72, 9], [493, 76], revealRight, revealLeft].map(corner).join(' ')}"/></clipPath></defs><g clip-path="url(#triarch-card-open)">${image(assets.card, cx, cy, cardW, cardH)}</g>`;
    const deviceW = p ? 240 : 205;
    const deviceH = (deviceW * 629) / 554;
    const dx = p ? 48 : 100;
    const dy = (p ? 650 : 509) + (1 - applications) * 18;
    out += `<defs><clipPath id="triarch-device-open"><rect x="${dx}" y="${n(dy + deviceH * (1 - applications))}" width="${deviceW}" height="${n(deviceH * applications)}"/></clipPath></defs><g clip-path="url(#triarch-device-open)">${image(assets.device, dx, dy, deviceW, deviceH)}</g>`;
    const swatchW = p ? 325 : 400;
    out += image(assets.material, p ? 65 : 365, p ? 470 : 523, swatchW, (swatchW * 176) / 400, {
      opacity: applications,
    });
    out += line(
      cardX - 12,
      cardY - 11,
      cardX + cardW + 9,
      cardY - 11,
      applications,
      '#3f3b3c',
      0.28,
    );
  }
  return out;
}
