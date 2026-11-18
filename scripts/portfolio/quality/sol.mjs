/**
 * SOL / The symbol becomes a system.
 * Every visible mark and application is unchanged source artwork. The annulus,
 * core and lettering are masks over actual pixels, never replacement geometry.
 * The 186px flat emblem is deliberately not enlarged to fill an HD frame.
 */
const original = (n) =>
  `design-assets/portfolio-originals/02_SOL_Community_Center/02_SOL_Community_Center_${String(n).padStart(2, '0')}.png`;
const crop = (n, bounds, note, mask) => ({
  source: original(n),
  bounds,
  note,
  ...(mask ? { mask } : {}),
});
export const project = {
  slug: 'sol-community-center',
  title: 'SOL Community Center',
  direction:
    'The gold annulus and green core separate, counter-turn and reunite; original SOL lettering resolves before its circular geometry opens real signage, notices and stationery.',
  background: '#286332',
  assets: {
    emblem: crop(
      1,
      [607, 27, 186, 186],
      'Native 186px emblem; circular presentation mask excludes the banner photograph. No large-logo upscaling.',
    ),
    lettering: crop(
      1,
      [1307, 344, 171, 110],
      'Actual white SOL / COMMUNITY / CENTER lettering; solid forest background keyed out.',
      { type: 'color', background: [40, 99, 50], threshold: 70 },
    ),
    crescent: crop(
      1,
      [691, 932, 130, 168],
      'Actual gold crescent in the supplied graphic-elements row; exact source colors isolated, adjacent green artwork excluded.',
      { type: 'ranges', ranges: [{ min: [220, 90, 0], max: [255, 225, 110] }] },
    ),
    leaf: crop(
      1,
      [805, 931, 164, 172],
      'Actual lime leaf from the supplied graphic-elements row; neighboring gold and cream shapes excluded.',
      { type: 'ranges', ranges: [{ min: [45, 100, 0], max: [205, 235, 155] }] },
    ),
    seed: crop(
      1,
      [896, 1021, 75, 76],
      'Actual warm-cream circle in the supplied graphic-elements row.',
      { type: 'color', background: [255, 255, 255], threshold: 25, feather: 12 },
    ),
    forestLeaf: crop(
      1,
      [983, 987, 105, 117],
      'Actual forest leaf in the supplied graphic-elements row; white matte fringe rejected by exact foreground color range.',
      { type: 'ranges', ranges: [{ min: [0, 35, 0], max: [110, 165, 120] }] },
    ),
    signage: crop(
      4,
      [0, 0, 650, 397],
      'Authentic supplied wall-signage application; entire panel at or below native size.',
    ),
    notice: crop(
      2,
      [379, 0, 379, 417],
      'Authentic supplied event-announcement artwork. Printed copy is part of the artwork, not a claim about a real event.',
      { type: 'path', d: 'M20 1H359Q378 1 378 20V397Q378 416 359 416H20Q1 416 1 397V20Q1 1 20 1Z' },
    ),
    card: crop(4, [0, 670, 475, 262], 'Actual supplied business-card application.'),
    notebook: crop(4, [486, 670, 387, 262], 'Actual supplied notebook application.'),
  },
  layers: [
    'Gold annulus isolated by an annular alpha mask over the 186px supplied emblem.',
    'Green/cream emblem core isolated by a complementary circular mask; independent counter-turn and translation.',
    'Four actual graphic elements from the source system (gold crescent, lime leaf, cream circle, forest leaf), accurately color-isolated and independently translating / turning.',
    'Three independently masked actual S/O/L letters; actual COMMUNITY / CENTER subline remains separate.',
    'Circular reveal aperture derived from the emblem, linking the identity to its real application artwork.',
    'Native-resolution wall signage, original event notice, original business card and notebook; individually timed, shallow translations, no board zoom.',
  ],
  limitations: [
    'The only clean, front-facing, complete emblem in the supplied flat boards is 186×186px. It is never presented larger than 186px in either export.',
    'A native vector emblem / lettering master is required for a larger independently animated identity. No logo has been traced or rebuilt.',
    'The application images are flattened approved mockups, not photographs of verified completed client work; no historical or engagement claims are added.',
  ],
};

const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  const p = clamp(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
const ramp = (t, a, b) => ease((t - a) / (b - a));
const presence = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));
const n = (v) => Math.round(v * 1000) / 1000;
const image = (asset, x, y, w, h, opacity = 1) =>
  `<image href="${asset.uri}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" opacity="${n(opacity)}" preserveAspectRatio="xMidYMid meet"/>`;
const lerp = (a, b, p) => a + (b - a) * p;

export function render({ width: w, height: h, portrait, t: rawTime, assets }) {
  // A real held pose spans the encoding boundary, with no dissolve or flash.
  const t = rawTime <= 0.35 || rawTime >= 7.2 ? 0 : rawTime;
  const split = presence(t, 0.4, 1.08, 1.45, 2.12);
  const application = presence(t, 2.04, 3.2, 5.6, 6.95);
  const assembly = presence(t, 2.34, 3.3, 5.7, 6.85);
  const settle = presence(t, 2.65, 3.5, 5.55, 6.6);
  const opening = portrait ? { x: 203, y: 423 } : { x: 515, y: 307 };
  const finalLogo = portrait ? { x: 424, y: 585 } : { x: 92, y: 571 };
  const finalSize = portrait ? 94 : 186;
  const logoX = lerp(opening.x, finalLogo.x, assembly);
  const logoY = lerp(opening.y, finalLogo.y, assembly);
  const logoSize = lerp(186, finalSize, assembly);
  const logoScale = logoSize / 186;
  const letterX = lerp(opening.x + 218, portrait ? 544 : 317, assembly);
  const letterY = lerp(opening.y + 37, portrait ? 601 : 607, assembly);
  const letterScale = lerp(1, portrait ? 0.71 : 1, assembly);
  const aperture = Math.hypot(w, h) * 0.86 * application;
  const centerX = opening.x + 93;
  const centerY = opening.y + 93;
  let output = `<defs>
    <clipPath id="sol-full"><circle cx="93" cy="93" r="92.5"/></clipPath>
    <clipPath id="sol-core"><circle cx="93" cy="93" r="74.5"/></clipPath>
    <clipPath id="sol-annulus"><path fill-rule="evenodd" clip-rule="evenodd" d="M185.5 93A92.5 92.5 0 1 0 .5 93A92.5 92.5 0 1 0 185.5 93ZM167.5 93A74.5 74.5 0 1 1 18.5 93A74.5 74.5 0 1 1 167.5 93Z"/></clipPath>
    <clipPath id="sol-letter-s"><rect x="0" y="0" width="37" height="54"/></clipPath>
    <clipPath id="sol-letter-o"><rect x="37" y="0" width="49" height="54"/></clipPath>
    <clipPath id="sol-letter-l"><rect x="86" y="0" width="48" height="54"/></clipPath>
    <clipPath id="sol-subline"><rect x="0" y="54" width="171" height="56"/></clipPath>
    <clipPath id="sol-app-reveal"><circle cx="${centerX}" cy="${centerY}" r="${n(aperture)}"/></clipPath>
  </defs><rect width="${w}" height="${h}" fill="#286332"/>`;

  // Supplied graphic-system shapes, not invented particles. Their measured
  // offset positions and independent arcs establish the symbol's wider language.
  const graphicVisibility = 1 - presence(t, 1.82, 2.85, 5.9, 7.04);
  const positions = portrait
    ? [
        ['crescent', 121, 209, 104, 134.4, -8, -27, 18],
        ['leaf', 574, 232, 131.2, 137.6, 14, 25, -22],
        ['seed', 162, 730, 66, 66.88, 0, -20, -16],
        ['forestLeaf', 602, 724, 84, 93.6, -12, 19, 24],
      ]
    : [
        ['crescent', 310, 190, 117, 151.2, -8, -30, 16],
        ['leaf', 991, 172, 147.6, 154.8, 14, 27, -21],
        ['seed', 370, 607, 75, 76, 0, -21, -16],
        ['forestLeaf', 1067, 560, 94.5, 105.3, -12, 20, 24],
      ];
  const gesture = presence(t, 0.45, 1.37, 1.75, 2.5);
  for (const [key, x, y, sw, sh, rotation, dx, dy] of positions) {
    output += `<g opacity="${n(graphicVisibility)}" transform="translate(${n(dx * gesture)} ${n(dy * gesture)}) rotate(${n(rotation * (1 - gesture * 1.7))} ${n(x + sw / 2)} ${n(y + sh / 2)})">${image(assets[key], x, y, sw, sh)}</g>`;
  }

  // A quiet, larger construction circle anticipates the aperture. This is a
  // presentation guide; the approved emblem itself is always original pixels.
  const guide = presence(t, 0.55, 1.18, 1.95, 2.8);
  output += `<circle cx="${centerX}" cy="${centerY}" r="${n(146 + split * 18)}" fill="none" stroke="#f6a817" stroke-width="1" opacity="${n(guide * 0.45)}"/>`;

  // The original circle opens onto real, distinct application compositions.
  output += `<g clip-path="url(#sol-app-reveal)" opacity="${n(application)}">`;
  const panels = portrait
    ? [
        ['signage', 80, 110, 650, 397, -26, 0, 2.13, 3.08],
        ['notice', 76, 600, 304, (304 * 417) / 379, -26, 26, 2.38, 3.36],
        ['card', 423, 754, 320, (320 * 262) / 475, 26, 36, 2.6, 3.6],
      ]
    : [
        ['signage', 83, 123, 650, 397, -46, 0, 2.13, 3.08],
        ['notice', 944, 86, 358, (358 * 417) / 379, 0, 36, 2.38, 3.36],
        ['card', 805, 517, 475, 262, 36, 30, 2.6, 3.6],
        ['notebook', 543, 592, 210, (210 * 262) / 387, -16, 25, 2.8, 3.75],
      ];
  for (const [key, x, y, pw, ph, dx, dy, a, b] of panels) {
    const p = presence(t, a, b, 5.6 + (a - 2.13) * 0.3, 6.75);
    output += `<g transform="translate(${n(dx * (1 - p))} ${n(dy * (1 - p))})" opacity="${n(p)}">${image(assets[key], x, y, pw, ph)}</g>`;
  }
  output += '</g>';

  // Keep the meaningful identity in view during the system scene. Independent
  // ring and core are masks of actual source pixels; the final pose switches to
  // the untouched full circle to prevent a synthetic seam between matte edges.
  output += `<g transform="translate(${n(logoX)} ${n(logoY)}) scale(${n(logoScale)})">`;
  if (split < 0.0001) {
    output += `<g clip-path="url(#sol-full)">${image(assets.emblem, 0, 0, 186, 186)}</g>`;
  } else {
    output += `<g transform="translate(${n(-35 * split)} ${n(10 * split)}) rotate(${n(-17 * split)} 93 93)" clip-path="url(#sol-annulus)">${image(assets.emblem, 0, 0, 186, 186)}</g>`;
    output += `<g transform="translate(${n(34 * split)} ${n(-17 * split)}) rotate(${n(23 * split)} 93 93)" clip-path="url(#sol-core)">${image(assets.emblem, 0, 0, 186, 186)}</g>`;
  }
  output += '</g>';
  output += `<g transform="translate(${n(letterX)} ${n(letterY)}) scale(${n(letterScale)})">`;
  const letters = [
    ['s', -10, 11, -6],
    ['o', 0, -13, 4],
    ['l', 12, 8, 5],
  ];
  for (let i = 0; i < letters.length; i++) {
    const [key, dx, dy, angle] = letters[i];
    const p = presence(t, 0.56 + i * 0.055, 1.14 + i * 0.055, 1.48 + i * 0.05, 2.07 + i * 0.05);
    output += `<g transform="translate(${n(dx * p)} ${n(dy * p)}) rotate(${n(angle * p)} ${i * 43 + 18} 27)" clip-path="url(#sol-letter-${key})">${image(assets.lettering, 0, 0, 171, 110)}</g>`;
  }
  output += `<g transform="translate(0 ${n(8 * split)})" clip-path="url(#sol-subline)">${image(assets.lettering, 0, 0, 171, 110)}</g></g>`;

  // These tiny registration ticks echo the supplied system's measured grid;
  // they are presentation guides, never new official brand elements.
  if (settle > 0) {
    const x = portrait ? 429 : 805;
    const y = portrait ? 714 : 489;
    output += `<path d="M${x} ${y + 10}V${y}h20" fill="none" stroke="#f6a817" stroke-width="1.5" opacity="${n(settle * 0.55)}"/>`;
  }
  return output;
}
