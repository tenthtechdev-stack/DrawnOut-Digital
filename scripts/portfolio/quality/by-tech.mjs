/** By Tech Group — five source surfaces connect, then carry an application system. */
import { image, rect, presence, n } from './shared.mjs';

const original = (board) =>
  `design-assets/portfolio-originals/03_By_Tech_Group/03_By_Tech_Group_0${board}.png`;
const markBounds = [565, 125, 550, 300];
const mark = (clip, note) => ({
  source: original(1),
  bounds: markBounds,
  mask: {
    type: 'color',
    background: [0, 0, 0],
    threshold: 22,
    feather: 12,
    ...(clip ? { clip } : {}),
  },
  note,
});
const paper = (d, note) => ({
  source: original(3),
  bounds: [452, 0, 665, 438],
  mask: { type: 'path', d },
  note,
});

export const project = {
  slug: 'by-tech-group',
  title: 'By Tech Group',
  direction:
    'Five original gradient-mark surfaces travel on separate vectors and connect; the two source wordmark phrases align before the same directional rhythm carries real printed cards and a mug into an application composition.',
  background: '#0e0f12',
  assets: {
    mark: mark(
      undefined,
      'Complete authentic 486×239px visible monogram inside its native550×300 crop. Black backdrop is keyed; the brand geometry and original gradient pixels are unchanged.',
    ),
    tail: mark(
      'M0 0H215V25H193C173 38 154 56 140 79H0Z',
      'Only the purple horizontal tail visible in the source; hidden overlap pixels are not invented.',
    ),
    bridge: mark(
      'M109 117C112 75 143 37 193 25H215C187 47 175 82 167 117Z',
      'Actual dark-blue connecting curve, separated along its original color/overlap boundary.',
    ),
    bowl: mark(
      'M0 117H315V300H0Z',
      'Actual blue bowl and its original transparent counter, retained from the source pixels.',
    ),
    crossbar: mark(
      'M215 0H550V79H175C184 55 196 36 215 25Z',
      'The original green crossbar, including its rounded terminal and gradient.',
    ),
    stroke: mark(
      'M315 79H550V300H315Z',
      'The original descending green stroke; no new glyph or functioning-product symbol is created.',
    ),
    wordmark: {
      source: original(1),
      bounds: [465, 425, 720, 90],
      mask: { type: 'color', background: [0, 0, 0], threshold: 28, feather: 12 },
      note: 'Actual BY TECH GROUP lettering. The green phrase and white phrase move independently through source-coordinate presentation clips; no replacement font is used.',
    },
    backCard: paper(
      'M73 58L434 8L482 183L220 231L232 291L96 299Z',
      'The visible black printed card from the supplied card application. Its occluded edge remains occluded; no hidden card artwork is reconstructed.',
    ),
    frontCard: paper(
      'M220 231L574 168L640 376L272 434Z',
      'The actual white printed-card foreground. Names/contact copy are existing source artwork, not independently verified relationships or agency claims.',
    ),
    mug: {
      source: original(3),
      bounds: [1120, 0, 534, 438],
      mask: {
        type: 'path',
        d: 'M191 64C193 38 472 29 475 63L477 97C497 93 520 93 534 100V338C514 346 491 338 475 327V391C461 426 202 430 193 395ZM480 129C500 117 523 120 534 133V300C515 320 494 310 480 294Z',
      },
      note: 'Actual printed mug silhouette. Its handle is already cropped by the original board edge, so that source edge is deliberately aligned with the output right edge; no missing handle is invented.',
    },
    gradientBar: {
      source: original(2),
      bounds: [902, 78, 240, 38],
      mask: { type: 'color', background: [240, 240, 240], threshold: 65, feather: 15 },
      note: 'The actual gradient connector from the source Graphic Elements row, shown below native size.',
    },
    dotMatrix: {
      source: original(2),
      bounds: [1395, 50, 175, 112],
      mask: { type: 'color', background: [240, 240, 240], threshold: 65, feather: 15 },
      note: 'The original purple dot matrix, retained as one measured graphic-system element rather than newly generated particles.',
    },
  },
  layers: [
    'Five actual visible monogram surfaces: purple tail, blue bridge, blue bowl, green crossbar and green descending stroke; independent translations, shallow rotations and overlapping connection timing.',
    'The original green BY TECH and white GROUP wordmark phrases, with independent alignment offsets.',
    'Separate real black-card background and white-card foreground layers, moving on the same directional logic as the identity before returning to their supplied relative pose.',
    'Actual mug silhouette as a stationary application anchor after entry; source-cropped handle edge stays at the output edge.',
    'Authentic gradient connector and dot matrix from the supplied graphic-elements board.',
    'Fine construction connectors are temporary presentation guides, not a replacement brand mark or a software interface.',
  ],
  limitations: [
    'Three flattened1654×931 PNG presentation boards are supplied. The principal visible mark is approximately486×239px; it is never enlarged above native size in either composition.',
    'Visible overlapping parts can separate, but independently complete hidden underlaps cannot be recovered. An approved layeredAI/SVG with the gradient surfaces and lettering paths is needed for deeper articulation and large identity-only renders.',
    'Printed applications remain flat source cutouts, not new3D product renders, verified launched products or evidence of a functioning software platform.',
    'The original mug handle is clipped at the right presentation-board edge. The new composition preserves that source boundary at the output edge instead of inventing missing material.',
    'High-resolution isolated application exports would improve small printed lettering and physical product edge detail. Existing source copy is never promoted to verified client/team facts.',
  ],
};

const mix = (a, b, p) => a + (b - a) * p;

export function render({ width, height, portrait, t, assets }) {
  const application = presence(t, 2.18, 3.48, 5.22, 6.83);
  const split = presence(t, 0.52, 1.13, 1.42, 2.22);
  const returnConnection = presence(t, 5.72, 6.16, 6.31, 7.04) * 0.24;
  const parts = Math.max(split, returnConnection);
  const nativeScale = mix(1, portrait ? 0.5 : 0.6, application);
  const logoX = mix(portrait ? 130 : 445, portrait ? 267 : 100, application);
  const logoY = mix(portrait ? 270 : 190, portrait ? 55 : 80, application);
  const wordX = mix(portrait ? 85 : 360, portrait ? 145 : 65, application);
  const wordY = mix(portrait ? 605 : 520, portrait ? 225 : 285, application);
  const wordWidth = mix(portrait ? 640 : 720, portrait ? 520 : 480, application);
  let out = rect(0, 0, width, height, project.background);
  out += `<defs><clipPath id="bytech-by"><rect width="400" height="90"/></clipPath><clipPath id="bytech-group"><rect x="400" width="320" height="90"/></clipPath></defs>`;

  // The connector follows the identity's measured axis into the actual applications.
  const guide = presence(t, 2.35, 3.32, 5.03, 6.22);
  const path = portrait ? 'M405 300V330H142V592H665V839' : 'M247 352V382H560V455H1190';
  out += `<path d="${path}" pathLength="1" fill="none" stroke="#597989" stroke-width="1.2" stroke-dasharray="1" stroke-dashoffset="${n(1 - guide)}" opacity="${n(guide * 0.55)}"/>`;

  const card = presence(t, 2.48, 3.58, 5.18, 6.7);
  const cardWidth = portrait ? 620 : 600;
  const cardHeight = (cardWidth * 438) / 665;
  const cardX = portrait ? 40 : 420;
  const cardY = portrait ? 350 : 390;
  const backOffset = 24 * (1 - presence(t, 2.78, 3.8, 4.85, 6.44));
  const frontOffset = 22 * (1 - presence(t, 2.95, 3.98, 4.8, 6.36));
  if (card > 0) {
    out += image(
      assets.backCard,
      cardX - 68 * (1 - card),
      cardY - backOffset,
      cardWidth,
      cardHeight,
      { opacity: card },
    );
    out += image(
      assets.frontCard,
      cardX + 52 * (1 - card),
      cardY + frontOffset,
      cardWidth,
      cardHeight,
      { opacity: card },
    );
  }
  const mug = presence(t, 2.7, 3.83, 5.2, 6.85);
  const mugScale = portrait ? 0.8 : 0.96;
  const mugWidth = 534 * mugScale;
  // The handle is cropped in the authentic board. Keep that edge flush with
  // the output during its entire entry, hold and departure.
  if (mug > 0)
    out += image(
      assets.mug,
      width - mugWidth + 180 * (1 - mug),
      portrait ? 710 : 265,
      mugWidth,
      438 * mugScale,
      { opacity: mug },
    );

  const graphic = presence(t, 2.57, 3.5, 5.05, 6.76);
  out += image(
    assets.gradientBar,
    mix(portrait ? 294 : 600, portrait ? 93 : 130, application),
    mix(portrait ? 724 : 654, portrait ? 825 : 405, application),
    220,
    (38 * 220) / 240,
    { opacity: mix(0.72, 1, graphic) },
  );
  if (graphic > 0)
    out += image(
      assets.dotMatrix,
      portrait ? 82 : 130,
      (portrait ? 906 : 534) + 18 * (1 - graphic),
      175,
      112,
      { opacity: graphic * 0.88 },
    );

  // Parts use source-coordinate mattes. The held pose uses the complete
  // original alpha mark, avoiding fabricated overlap seams or opacity tinting.
  out += `<g transform="translate(${n(logoX)} ${n(logoY)}) scale(${n(nativeScale)})">`;
  if (parts === 0) out += image(assets.mark, 0, 0, 550, 300);
  else {
    for (const [key, dx, dy, rotation, cx, cy, delay] of [
      ['tail', -94, -12, -2, 92, 52, 0],
      ['bridge', -38, -47, 3, 155, 75, 0.055],
      ['bowl', -32, 56, -4, 208, 190, 0.1],
      ['crossbar', 78, -41, 2, 353, 52, 0.15],
      ['stroke', 53, 49, 4, 385, 172, 0.2],
    ]) {
      const independent = Math.max(
        presence(t, 0.52 + delay, 1.13 + delay, 1.42 + delay * 0.5, 2.22 + delay * 0.5),
        returnConnection,
      );
      out += `<g transform="translate(${n(dx * independent)} ${n(dy * independent)}) rotate(${n(rotation * independent)} ${cx} ${cy})">${image(assets[key], 0, 0, 550, 300)}</g>`;
    }
  }
  out += '</g>';

  const labelScale = wordWidth / 720;
  out += `<g transform="translate(${n(wordX)} ${n(wordY)}) scale(${n(labelScale)})">`;
  out += `<g transform="translate(${n(-22 * parts)} 0)" clip-path="url(#bytech-by)">${image(assets.wordmark, 0, 0, 720, 90)}</g>`;
  out += `<g transform="translate(${n(22 * parts)} 0)" clip-path="url(#bytech-group)">${image(assets.wordmark, 0, 0, 720, 90)}</g>`;
  out += '</g>';
  return out;
}
