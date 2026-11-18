/** U WANNA SMOOTHIE — the existing cup/citrus identity opens into a colourful menu world. */
import { image, rect, ramp, presence, clamp, n } from './shared.mjs';

const source = (board) =>
  `design-assets/portfolio-originals/12_U_Wanna_Smoothie/12_U_Wanna_Smoothie_0${board}.png`;
const identityBounds = [565, 207, 522, 518];
const identityPart = (clip, note) => ({
  source: source(1),
  bounds: identityBounds,
  mask: { type: 'color', background: [255, 255, 255], threshold: 16, feather: 10, clip },
  note,
});
const identityRangePart = (ranges, clip, note) => ({
  source: source(1),
  bounds: identityBounds,
  mask: { type: 'ranges', ranges, clip },
  note,
});
// Source gold has green above blue; fine measured bands keep its full texture
// while rejecting the pink presentation background crossing the flattened badge.
const goldRanges = Array.from({ length: 36 }, (_, i) => {
  const green = 80 + i * 5;
  return { min: [145, green, 0], max: [255, Math.min(255, green + 4), green - 6] };
});
const blackRanges = [
  { min: [0, 0, 0], max: [140, 140, 140] },
  { min: [130, 130, 130], max: [185, 185, 185] },
  { min: [175, 175, 175], max: [225, 225, 225] },
];
const titlePart = (clip, note) => ({
  source: source(3),
  bounds: [451, 178, 710, 64],
  mask: { type: 'color', background: [255, 255, 255], threshold: 18, feather: 12, clip },
  note,
});

export const project = {
  slug: 'u-wanna-smoothie',
  title: 'U Wanna Smoothie',
  direction:
    'The real cup lid/body, citrus quarters and leaves spring apart with overlapping timing, then align inside the original gold ring. Actual lettering, fruit photographs, menu artwork and a top-view drink extend the identity into a cohesive application composition.',
  background: '#fffdf6',
  assets: {
    ring: identityRangePart(
      goldRanges,
      'M262 1A258 258 0 1 1 262 517A258 258 0 1 1 262 1Z M262 18A241 241 0 1 0 262 500A241 241 0 1 0 262 18Z',
      'Actual textured gold ring, isolated within its annular source region. Fine measured color bands remove the source pink presentation field without repainting the gold.',
    ),
    arc: identityRangePart(
      blackRanges,
      'M18 260A244 244 0 0 1 506 260L440 260A178 178 0 0 0 84 260Z',
      'The complete original near-black curved lettering and gray edge pixels, retained as one connected wordmark layer; the source pink presentation background is excluded.',
    ),
    lid: identityPart(
      'M100 166H275V253H100Z',
      'Actual red cup-lid pixels, separated from the cup body.',
    ),
    body: identityPart(
      'M148 253H275V386H148Z',
      'Actual pink cup-body pixels; hidden surfaces are not reconstructed.',
    ),
    lime: identityPart(
      'M276 164H391V276H276Z',
      'Actual green citrus quarter and its pale rim; original white separators become alpha.',
    ),
    orange: identityPart('M276 278H391V389H276Z', 'Actual orange citrus quarter and pale rim.'),
    leaves: identityPart(
      'M236 100H333V166H236Z',
      'The two original green leaves move as one source element.',
    ),
    title: titlePart('M0 0H710V64H0Z', 'Actual pink supplied title, never retyped.'),
    titleStart: titlePart(
      'M0 0H73V64H0Z',
      'First source title fragment, cut only through a blank inter-letter column.',
    ),
    titleMiddle: titlePart(
      'M73 0H392V64H73Z',
      'Middle source title fragment, with source spacing retained.',
    ),
    titleEnd: titlePart(
      'M392 0H710V64H392Z',
      'Final source title fragment, with source spacing retained.',
    ),
    berryBlue: {
      source: source(3),
      bounds: [1114, 0, 180, 156],
      mask: { type: 'color', background: [255, 255, 255], threshold: 8, feather: 24 },
      note: 'Actual supplied blue fruit photograph and soft source shadow. Small native detail, never enlarged.',
    },
    berryDark: {
      source: source(3),
      bounds: [1210, 150, 232, 199],
      mask: { type: 'color', background: [255, 255, 255], threshold: 8, feather: 24 },
      note: 'Actual second fruit photograph; no invented ingredient or extra fruit.',
    },
    drink: {
      source: source(2),
      bounds: [866, 350, 565, 530],
      mask: {
        type: 'path',
        d: 'M241 57C288 57 336 74 374 103L514 44Q531 31 546 48Q559 63 541 82L430 181C455 214 468 247 468 283C468 408 366 510 241 510C116 510 15 408 15 283C15 158 116 57 241 57Z',
      },
      note: 'Real top-view drink and attached straw isolated from the supplied photo. Berries/mint remain attached; no food or liquid simulation.',
    },
    menu: {
      source: source(3),
      bounds: [0, 403, 821, 460],
      note: 'Actual illustrated menu panel. The separate unverified About/Find Us copy is excluded.',
    },
  },
  layers: [
    'Original red lid, pink cup body, green and orange citrus quarters, and paired leaves independently translate and rotate with gentle overlapping spring timing.',
    'Original gold ring and complete curved lettering move independently around the central emblem; the same exact source-coordinate component alignment holds both loop boundaries.',
    'Three source title fragments separate through existing blank columns and align without retyping or changing their spacing.',
    'Actual fruit photographs enter at native or smaller sizes; the real drink/straw and illustrated menu resolve into the application composition.',
    'Overlapping spring timing and the real illustrated menu supply the fluid graphic bridge. No artificial liquid, added ingredient or 3D product is used.',
  ],
  limitations: [
    'All originals are flattened PNGs. The complete badge is522×518, with each central component only about80–160px wide. The identity stays at or below native size.',
    'The gold ring, curved title and paired leaves remain source raster groups. Editable AI/SVG/PSD masters would enable finer path/letter and individual-leaf control.',
    'The top-view drink and straw are one source photographic layer; toppings and hidden cup surfaces cannot be faithfully separated without layered or alpha photographic masters.',
    'The illustrated menu is a real supplied printed-layout panel, not a functioning interface. Its About/Find Us claims are not used in this motion composition.',
    'The810×1080 and1440×810 canvases arrange native-scale artwork; they do not create additional source detail.',
  ],
};

const spring = (t, start, end) => {
  const u = clamp((t - start) / (end - start));
  if (u === 0 || u === 1) return u;
  return 1 - (1 - u) ** 3 * Math.cos(u * Math.PI * 2.3);
};
const open = (t, delay = 0) =>
  spring(t, 0.74 + delay, 1.85 + delay) * (1 - ramp(t, 2.65 + delay * 0.25, 3.9 + delay * 0.25));

export function render({ width, height, portrait, t, assets }) {
  const p = portrait;
  const menuReveal = ramp(t, 3.15, 4.35) * (1 - ramp(t, 5.65, 6.9));
  const fruitPresence = presence(t, 0.65, 1.65, 5.6, 6.95);
  const logoWidth = p ? 510 : 500;
  const logoHeight = (logoWidth * 518) / 522;
  const bx = p ? 150 : 137;
  const by = p ? 126 : 155;
  const ratio = logoWidth / 522;
  const centerX = bx + logoWidth / 2;
  const centerY = by + logoHeight / 2;
  const split = open(t);
  let out = rect(0, 0, width, height, project.background);

  // Title pieces retain exactly the supplied lettering and their native spacing.
  const titleX = p ? 110 : 746;
  const titleY = p ? 48 : 105;
  const titleW = p ? 590 : 585;
  const titleH = (titleW * 64) / 710;
  const titleMotion = open(t, 0.13);
  if (titleMotion === 0) out += image(assets.title, titleX, titleY, titleW, titleH);
  else
    for (const [key, dx, dy, angle] of [
      ['titleStart', -18, -6, -2],
      ['titleMiddle', 0, 10, 1],
      ['titleEnd', 18, -4, 2],
    ]) {
      out += image(
        assets[key],
        titleX + dx * titleMotion,
        titleY + dy * titleMotion,
        titleW,
        titleH,
        { rotation: angle * titleMotion },
      );
    }

  // Real menu artwork settles through a curved, citrus-led aperture; it is never zoomed as a board.
  const mx = p ? 58 : 757;
  const my = p ? 677 : 205;
  const mw = p ? 462 : 515;
  const mh = (mw * 460) / 821;
  const edge = mh * (1 - menuReveal);
  out += `<defs><clipPath id="smoothie-menu"><path d="M${n(mx)} ${n(my + edge)} C${n(mx + mw * 0.24)} ${n(my + edge - 34 * menuReveal)} ${n(mx + mw * 0.58)} ${n(my + edge + 18 * menuReveal)} ${n(mx + mw)} ${n(my + edge - 16 * menuReveal)}V${n(my + mh)}H${n(mx)}Z"/></clipPath></defs>`;
  out += `<g clip-path="url(#smoothie-menu)">${image(assets.menu, mx, my, mw, mh)}</g>`;

  const product = spring(t, 3.48, 4.65) * (1 - ramp(t, 5.85, 7.05));
  const dw = p ? 335 : 407;
  const dh = (dw * 530) / 565;
  const dx = p ? 428 : 989;
  const dy = p ? 693 : 379;
  out += image(assets.drink, dx - (1 - product) * 30, dy + (1 - product) * 94, dw, dh, {
    rotation: (1 - product) * 6,
    opacity: clamp(product),
  });

  // Source fruit photographs are modest-size foreground accents, tied to the menu world.
  out += image(
    assets.berryBlue,
    (p ? 61 : 684) - (1 - fruitPresence) * 23,
    (p ? 546 : 484) - split * 13,
    p ? 100 : 112,
    ((p ? 100 : 112) * 156) / 180,
    { rotation: split * -9, opacity: fruitPresence },
  );
  out += image(
    assets.berryDark,
    (p ? 659 : 1292) + (1 - fruitPresence) * 25,
    (p ? 568 : 215) + split * 10,
    p ? 108 : 120,
    ((p ? 108 : 120) * 199) / 232,
    { rotation: split * 7, opacity: fruitPresence },
  );

  // One source-faithful component composition at every time avoids reintroducing
  // the pink source-board background at rest. White paper is a presentation ground.
  {
    out += `<ellipse cx="${n(centerX)}" cy="${n(centerY)}" rx="${n(logoWidth * 0.483)}" ry="${n(logoHeight * 0.483)}" fill="#fff"/>`;
    out += image(assets.ring, bx, by, logoWidth, logoHeight, { rotation: split * -3.5 });
    out += image(assets.arc, bx, by, logoWidth, logoHeight, { rotation: split * 2.8 });
    for (const [key, dxp, dyp, angle, delay] of [
      ['lid', -16, -36, -7, 0],
      ['body', -6, 29, 5, 0.08],
      ['lime', 37, -19, 11, 0.16],
      ['orange', 38, 32, -9, 0.23],
      ['leaves', -8, -18, -9, 0.31],
    ]) {
      const motion = open(t, delay);
      const cx = { lid: 193, body: 214, lime: 332, orange: 332, leaves: 283 }[key];
      const cy = { lid: 210, body: 318, lime: 221, orange: 333, leaves: 133 }[key];
      const x = bx + dxp * motion * ratio;
      const y = by + dyp * motion * ratio;
      out += `<g transform="rotate(${n(angle * motion)} ${n(x + cx * ratio)} ${n(y + cy * ratio)})">${image(assets[key], x, y, logoWidth, logoHeight)}</g>`;
    }
  }
  return out;
}
