/**
 * CHURROS — the illustrated badge unfolds and gathers itself again.
 * All visible lettering/illustration is cut from the supplied presentation PNGs.
 * Paths below are alpha mattes, not a recreated brand mark.
 */
import { image, rect, presence } from './shared.mjs';

const source = (board) =>
  `design-assets/portfolio-originals/07_Churros_Dessert_Shop/07_Churros_Dessert_Shop_0${board}.png`;
const badgeBounds = [145, 40, 668, 718];
const badge = (d, note) => ({
  source: source(1),
  bounds: badgeBounds,
  mask: { type: 'path', d },
  note,
});
const outer =
  'M334 5 C371 37 473 24 544 103 C576 124 612 153 625 226 L631 304 C636 335 646 344 661 360 C641 382 635 412 630 449 C625 478 612 506 596 529 L614 540 L585 568 L574 604 L550 608 C504 654 434 665 334 709 C275 679 196 672 139 637 L92 607 L66 613 L42 593 L24 558 L5 545 L40 528 C14 486 8 449 6 413 L0 365 C28 340 34 311 39 277 L43 209 C45 164 63 126 92 104 C118 87 138 85 153 91 C196 40 281 35 334 5 Z';

export const project = {
  slug: 'churros',
  title: 'Churros',
  direction:
    'An illustrated badge opens into actual wordmark, pastry, crest and ribbon layers; source flourishes lead the pieces back into a complete identity beside real packaging.',
  background: '#f7e9cc',
  assets: {
    badge: badge(
      outer,
      'Faithfully cropped complete original badge; the held beginning/end and matching poster.',
    ),
    crown: badge(
      'M137 99 C182 52 277 31 334 5 C389 44 480 36 544 103 L512 117 L456 91 L366 81 L299 76 L224 85 L177 105 Z',
      'Crest pixels; independent lift and settling.',
    ),
    wordmark: badge(
      'M45 158 C45 111 69 89 102 90 C124 86 144 95 154 106 L182 99 L203 92 L224 87 L250 80 L281 78 L306 77 L331 77 L353 83 L374 88 L397 91 L425 102 L444 103 C466 97 491 107 505 120 C519 106 539 101 561 110 C587 116 603 143 604 164 C606 187 596 199 582 204 C600 214 610 231 606 248 C604 273 584 288 561 288 C536 289 512 280 500 265 L485 251 C464 258 437 246 422 235 L410 221 L379 215 L347 204 L321 202 L290 202 L268 205 L244 204 L223 219 L199 228 L180 233 C171 260 151 273 126 274 C92 275 64 259 53 231 C45 213 41 178 45 158 Z',
      'Complete actual hand-lettered wordmark, independently articulated from the surrounding crest and pastry. Letter outlines overlap in the flattened source, so the wordmark remains one accurate layer.',
    ),
    pastry: badge(
      'M318 204 C375 198 438 213 477 248 C503 270 512 299 506 328 C500 358 483 392 457 410 L456 440 C458 460 443 478 427 474 C416 471 410 462 410 450 L405 430 C357 454 289 448 238 430 C198 415 174 389 168 352 C162 318 168 280 191 253 C224 222 265 208 318 204 Z',
      'The actual ring pastry and attached chocolate illustration travel together; no invented separate ingredient or fluid simulation.',
    ),
    leftFrame: badge(
      'M45 207 C55 234 80 255 107 265 C90 306 95 352 125 386 L152 403 C117 399 83 403 68 423 C51 444 55 478 71 510 L46 521 C22 488 15 448 11 409 L1 365 C26 340 34 304 37 272 L41 224 Z',
      'Source left border and flourishes.',
    ),
    rightFrame: badge(
      'M608 205 L621 229 L630 303 C636 333 646 347 661 360 C639 384 636 412 630 449 C624 481 609 506 593 530 L570 510 L583 475 L580 442 L564 424 L500 422 L493 402 L516 395 L539 377 L550 347 L550 304 L540 270 L567 272 L590 258 L609 236 Z',
      'Source right border and flourishes.',
    ),
    ribbon: badge(
      'M107 410 L181 411 C222 442 261 452 320 454 L400 454 L410 472 L431 478 L451 461 L452 427 L498 410 L550 412 L578 432 L581 468 L573 496 L559 518 L596 529 L612 540 L585 569 L575 603 L550 608 C494 656 418 673 334 709 C254 675 185 661 139 637 L93 607 L67 613 L44 593 L25 559 L7 546 L43 531 L69 526 L62 489 L66 448 L82 423 Z',
      'Dessert Shop, ornamental divider and original lower ribbon remain together because the flattened overlaps cannot be accurately separated.',
    ),
    flourish: {
      source: source(2),
      bounds: [76, 592, 242, 59],
      mask: { type: 'color', background: [249, 241, 226], threshold: 34 },
      note: 'Actual red ornamental curl, background keyed with edge alpha; never a generated flourish.',
    },
    flourishGold: {
      source: source(2),
      bounds: [61, 698, 276, 80],
      mask: { type: 'color', background: [249, 241, 226], threshold: 32 },
      note: 'Actual orange ornamental divider; independent restrained translation.',
    },
    bag: {
      source: source(3),
      bounds: [0, 25, 255, 400],
      mask: {
        type: 'path',
        d: 'M15 94 L80 94 L83 45 C86 18 97 8 121 6 C152 3 164 13 169 45 L175 94 L235 94 L253 374 L237 399 L0 399 L0 298 Z M97 94 L158 94 L151 45 C147 24 139 16 122 16 C106 16 101 27 99 45 Z',
      },
      note: 'Original paper bag silhouette. The handle hole is excluded by the compound matte. Native255×400; never scaled above native in these layouts.',
    },
    cup: {
      source: source(3),
      bounds: [230, 228, 148, 205],
      mask: {
        type: 'path',
        d: 'M12 9 C28 0 113 0 131 9 L132 27 L141 32 L145 45 L138 50 L134 52 L120 198 C99 205 53 206 31 199 L12 53 L3 48 L2 39 L8 29 Z',
      },
      note: 'Actual takeaway cup, retained at native resolution.',
    },
  },
  layers: [
    'The authentic hand-lettered wordmark, isolated from its crest and surrounding illustration with a contour-following alpha matte.',
    'Crest, two badge-border wings, ring+attached chocolate illustration, and lower ribbon; all source pixels.',
    'Two authentic ornamental dividers from board02, keyed from their cream backdrop.',
    'Actual bag and cup silhouettes from board03, shown at or below native size.',
    'Complete source badge holds the beginning/end. A short aligned crossfade covers unavoidable seams between flattened overlapping artwork.',
  ],
  limitations: [
    'Only flattened1654×931 PNG boards are supplied; this is a 2D source-pixel assembly, not editable vector or product3D.',
    'The large source badge is668×718; its on-screen width is at most618px. Packaging crops are255×400 and148×205, not high-resolution product renders.',
    'Chocolate and the pastry are one genuinely connected supplied illustration; they move together to avoid inventing pixels under occlusion.',
    'The original lower ribbon, descriptor and its ornament overlap, so they remain one source layer.',
    'The original AI/SVG/PSD with independent letters, pastry, chocolate, frame and decorative paths is required for letter-by-letter animation without cutting overlapping cream outlines and for resolution-independent export.',
  ],
};

export function render({ width, height, portrait, t, assets }) {
  const scale = portrait ? 0.86 : 0.86;
  const bx = portrait ? 118 : 128;
  const by = portrait ? 103 : 94;
  const bw = 668 * scale;
  const bh = 718 * scale;
  const open = presence(t, 0.8, 2.08, 3.0, 4.7);
  const anticipate = presence(t, 0.43, 0.72, 0.82, 1.02);
  const baseline = by + anticipate * 4;
  const layers = [];
  layers.push(rect(0, 0, width, height, project.background));

  // Source ornaments become the visual bridge to the real packaging; no random particles.
  const ornament = presence(t, 1.42, 2.34, 5.35, 6.65);
  const gold = presence(t, 2.05, 2.98, 5.78, 6.98);
  const bagX = portrait ? 163 : 960;
  const bagY = portrait ? 737 : 256;
  const bagW = portrait ? 187 : 244;
  const bagH = (bagW * 400) / 255;
  const cupX = portrait ? 501 : 1187;
  const cupY = portrait ? 866 : 464;
  const cupW = portrait ? 111 : 145;
  const cupH = (cupW * 205) / 148;
  // Packaging is a steady anchor, as the illustrated identity moves independently.
  layers.push(image(assets.bag, bagX, bagY, bagW, bagH));
  layers.push(image(assets.cup, cupX, cupY, cupW, cupH));
  layers.push(
    image(
      assets.flourish,
      (portrait ? 412 : 1014) - ornament * 22,
      (portrait ? 790 : 167) - ornament * 10,
      232,
      (232 * 59) / 242,
      { rotation: -4 * ornament, opacity: 0.88 + ornament * 0.12 },
    ),
  );
  layers.push(
    image(
      assets.flourishGold,
      (portrait ? 416 : 966) + gold * 15,
      (portrait ? 1010 : 701) - gold * 9,
      228,
      (228 * 80) / 276,
      { rotation: 3 * gold, opacity: 0.85 + gold * 0.15 },
    ),
  );

  const piece = (key, dx = 0, dy = 0, rotation = 0, opacity = 1) =>
    image(assets[key], bx + dx * scale, baseline + dy * scale, bw, bh, { rotation, opacity });

  // The spread is a staggered opening of recognisable artwork, not a whole-board zoom.
  layers.push(piece('crown', 0, -73 * open, -2 * open));
  layers.push(piece('leftFrame', -25 * open, 7 * open, -2.6 * open));
  layers.push(piece('rightFrame', 25 * open, 7 * open, 2.6 * open));
  layers.push(piece('ribbon', 0, 57 * open, 0.6 * open));
  layers.push(piece('pastry', 0, 15 * open, -7 * open));
  layers.push(piece('wordmark', 0, -43 * open, 1.4 * open));

  // Exact supplied complete badge settles after the components align. This avoids
  // pretending the flattened overlaps contain the editable underlying illustration.
  const master = 1 - presence(t, 0.82, 1.12, 4.58, 4.92);
  layers.push(piece('badge', 0, 0, 0, master));

  return layers.join('');
}
