import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This makes two complementary raster cutouts from approved pixels. It does not
// reconstruct covered surfaces, repaint the emblem, or create a 3D hand rig.
const root = fileURLToPath(new URL('../../', import.meta.url));
const relativeSource = 'artifacts/signature/hand-emblem-reference.png';
const relativeMask = 'design-assets/signature-layers/hand-mask.svg';
const sourceHash = 'ea33bc55b3f18ca7233814898ddc07ab8618774aef693a5e635cae75a72dd4dd';
const originalHash = 'ea295f96073b0e789532551ec1787a9c10728fa46767ce27fb428ff1c3affcbb';
const output = path.resolve(process.argv[2] ?? path.join(root, 'src/assets/signature'));
const manifestDirectory = process.argv[2]
  ? output
  : path.join(root, 'design-assets/signature-layers');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const originals = [
  'design-assets/brand-originals/hand-and-icon-supplied.svg',
  'design-assets/brand-originals/logo-as-supplied.svg',
];
for (const original of originals) {
  if (sha256(await readFile(path.join(root, original))) !== originalHash) {
    throw new Error(`Approved original changed: ${original}. Review before separating.`);
  }
}

const sourceBytes = await readFile(path.join(root, relativeSource));
if (sha256(sourceBytes) !== sourceHash) {
  throw new Error('Reference PNG changed. Review its provenance and mask registration first.');
}
const maskBytes = await readFile(path.join(root, relativeMask));
const { data: source, info } = await sharp(sourceBytes)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.width !== 810 || info.height !== 1440 || info.channels !== 4) {
  throw new Error('Expected the approved 810 × 1440 RGBA reference.');
}
const mask = await sharp(maskBytes).removeAlpha().greyscale().raw().toBuffer();
const hand = Buffer.from(source);
const plaque = Buffer.from(source);
let handVisiblePixels = 0;
let plaqueVisiblePixels = 0;
for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
  const alpha = pixel * 4 + 3;
  // Exclusive pixel ownership preserves the exact source alpha. Multiplying
  // both layers by antialiased complementary masks would lose alpha on reassembly.
  if (mask[pixel] >= 128) {
    plaque[alpha] = 0;
    if (source[alpha] > 0) handVisiblePixels += 1;
  } else {
    hand[alpha] = 0;
    if (source[alpha] > 0) plaqueVisiblePixels += 1;
  }
}

// Source-coordinate visual probes catch broad ownership mistakes independently
// of the SVG guide. The contact probes must never travel with the plaque.
const plaqueProbes = [
  [280, 410],
  [400, 500],
  [300, 600],
  [450, 700],
  [550, 450],
];
const handProbes = [
  [120, 700],
  [650, 680],
  [400, 1200],
  [480, 850],
  [158, 631],
  [173, 653],
  [188, 681],
  [569, 561],
  [562, 580],
  [564, 596],
];
for (const [coordinates, visible, empty, label] of [
  [plaqueProbes, plaque, hand, 'plaque'],
  [handProbes, hand, plaque, 'hand'],
]) {
  for (const [x, y] of coordinates) {
    const alpha = (y * info.width + x) * 4 + 3;
    if (visible[alpha] === 0 || empty[alpha] !== 0) {
      throw new Error(`Incorrect ${label} ownership at ${x},${y}. Inspect the contour.`);
    }
  }
}

// An inset quadrilateral covers the actual plaque face, not its ambiguous
// glass/skin contact. Every pixel in this whole region must be absent from hand.
const interior = await sharp(
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="810" height="1440">' +
      '<rect width="810" height="1440" fill="black"/>' +
      '<path fill="white" d="M280 360 L580 440 L480 740 L185 650 Z"/></svg>',
  ),
)
  .removeAlpha()
  .greyscale()
  .raw()
  .toBuffer();
let plaqueInteriorPixels = 0;
for (let pixel = 0; pixel < interior.length; pixel += 1) {
  if (interior[pixel] === 255) {
    plaqueInteriorPixels += 1;
    if (hand[pixel * 4 + 3] !== 0) {
      throw new Error('Plaque interior leaked into the empty-hand layer.');
    }
  }
}

await mkdir(output, { recursive: true });
await mkdir(manifestDirectory, { recursive: true });
const layers = [];
for (const [filename, bytes, visiblePixels] of [
  ['hand-empty.png', hand, handVisiblePixels],
  ['emblem-plaque.png', plaque, plaqueVisiblePixels],
]) {
  const encoded = await sharp(bytes, { raw: info })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer();
  if (!decoded.equals(bytes)) throw new Error(`PNG round-trip changed ${filename} pixels.`);
  await writeFile(path.join(output, filename), encoded);
  layers.push({
    path: `src/assets/signature/${filename}`,
    sha256: sha256(encoded),
    bytes: encoded.length,
    width: info.width,
    height: info.height,
    format: 'lossless RGBA PNG',
    visiblePixels,
  });
}

let overlapPixels = 0;
let alphaMismatchPixels = 0;
let rgbMismatchChannels = 0;
const assembled = Buffer.alloc(source.length);
for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
  const offset = pixel * 4;
  if (hand[offset + 3] > 0 && plaque[offset + 3] > 0) overlapPixels += 1;
  const alpha = Math.max(hand[offset + 3], plaque[offset + 3]);
  if (alpha !== source[offset + 3]) alphaMismatchPixels += 1;
  const visible = hand[offset + 3] > 0 ? hand : plaque;
  for (let channel = 0; channel < 3; channel += 1) {
    if (hand[offset + channel] !== source[offset + channel]) rgbMismatchChannels += 1;
    if (plaque[offset + channel] !== source[offset + channel]) rgbMismatchChannels += 1;
    assembled[offset + channel] = visible[offset + channel];
  }
  assembled[offset + 3] = alpha;
}
if (overlapPixels || alphaMismatchPixels || rgbMismatchChannels || !assembled.equals(source)) {
  throw new Error('Layers failed exact source-pixel reconstruction.');
}

const manifest = {
  schemaVersion: 1,
  classification: 'separated-raster-motion-prototype',
  source: { path: relativeSource, sha256: sourceHash, bytes: sourceBytes.length },
  originals: originals.map((original) => ({ path: original, sha256: originalHash })),
  ownershipMask: {
    path: relativeMask,
    sha256: sha256(maskBytes),
    threshold: 128,
    hand: 'mask >= 128; retain source RGB and source alpha',
    plaque: 'mask < 128; retain source RGB and source alpha',
    unownedPixels: 'retain source RGB; alpha becomes zero',
  },
  outputs: layers,
  verification: {
    pngRoundTrip: 'exact RGBA byte equality for both encoded layers',
    assembledRawRGBA: 'exact equality with decoded reference at native registration',
    maximumChannelError: 0,
    differingPixels: 0,
    overlapPixels,
    alphaMismatchPixels,
    rgbMismatchChannels,
    plaqueInteriorPixelsChecked: plaqueInteriorPixels,
    plaqueInteriorAlphaInHand: 0,
    plaqueProbes,
    handAndContactProbes: handProbes,
    originalAndReferenceHashesVerified: true,
    scope: 'native 810 × 1440 pixels; browser scaling and animated occlusion require visual review',
  },
  limitations: [
    'Two masked raster images, not 3D geometry, an anatomical rig, or an articulated grasp.',
    'The hand retains a fixed supplied pinch pose and baked orange illumination.',
    'Hidden plaque edges are absent. The isolated plaque has small contact cutouts; no pixels were invented.',
    'At the right fingertip, glass and skin are optically mixed. The visible contact patch, including its short baked highlight, stays with the hand to avoid descending finger fragments.',
    'No clean hidden hand surface, changing shadows, refraction, or new camera views can be recovered from these pixels.',
    'Exclusive native-pixel masks can produce a small resampling seam at contact when scaled in a browser.',
  ],
  sourceRights:
    'Client-supplied reference; no new third-party stock, generative content, or rights grant.',
  reproduce: 'node scripts/signature/separate-reference.mjs [optional-output-directory]',
};
await writeFile(
  path.join(manifestDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify({ output, layers, verification: manifest.verification }, null, 2));
