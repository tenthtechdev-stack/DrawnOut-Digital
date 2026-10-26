import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import sharp from 'sharp';

const root = process.cwd();
const reference = 'artifacts/signature/hand-emblem-reference.png';
const handPath = 'src/assets/signature/hand-empty.png';
const plaquePath = 'src/assets/signature/emblem-plaque.png';
const manifestPath = 'design-assets/signature-layers/manifest.json';
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const read = (relative: string) => readFile(path.join(root, relative));
const decode = async (relative: string) =>
  sharp(await read(relative))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

test('separated assets retain the documented approved source and output provenance', async () => {
  const manifest = JSON.parse(await read(manifestPath).then(String));
  assert.equal(manifest.classification, 'separated-raster-motion-prototype');
  for (const entry of [
    manifest.source,
    ...manifest.originals,
    manifest.ownershipMask,
    ...manifest.outputs,
  ]) {
    assert.equal(hash(await read(entry.path)), entry.sha256, entry.path);
  }
  assert.equal(
    hash(await read(reference)),
    'ea33bc55b3f18ca7233814898ddc07ab8618774aef693a5e635cae75a72dd4dd',
  );
});

test('the empty hand omits the plaque face and the descending plaque omits the fingers', async () => {
  const [{ data: hand, info }, { data: plaque }] = await Promise.all([
    decode(handPath),
    decode(plaquePath),
  ]);
  assert.equal(info.width, 810);
  assert.equal(info.height, 1440);
  // This central rectangle spans the actual approved emblem. A full composite
  // renamed "hand-empty" would fail every pixel, even if the DOM had two layers.
  for (let y = 430; y < 640; y += 1) {
    for (let x = 270; x < 480; x += 1) {
      const alpha: number = (y * info.width + x) * 4 + 3;
      assert.equal(hand[alpha], 0, `Plaque leaked into hand at ${x},${y}`);
      assert.ok(plaque[alpha]! > 0, `Actual emblem missing at ${x},${y}`);
    }
  }
  // Thumb, right index contact and lower hand must travel with the hand only.
  for (const [x, y] of [
    [120, 700],
    [158, 631],
    [173, 653],
    [188, 681],
    [569, 561],
    [562, 580],
    [564, 596],
    [400, 1200],
  ]) {
    const alpha: number = (y! * info.width + x!) * 4 + 3;
    assert.ok(hand[alpha]! > 0, `Hand contact absent at ${x},${y}`);
    assert.equal(plaque[alpha], 0, `Finger travels with plaque at ${x},${y}`);
  }
});

test('registered layers reconstruct the supplied pose without repainting or duplicate overlap', async () => {
  const [source, hand, plaque] = await Promise.all([
    decode(reference),
    decode(handPath),
    decode(plaquePath),
  ]);
  assert.deepEqual(hand.info, source.info);
  assert.deepEqual(plaque.info, source.info);
  const rebuilt = new Uint8Array(source.data.length);
  let overlap = 0;
  let changedRgb = 0;
  for (let offset = 0; offset < source.data.length; offset += 4) {
    const handAlpha = hand.data[offset + 3]!;
    const plaqueAlpha = plaque.data[offset + 3]!;
    if (handAlpha && plaqueAlpha) overlap += 1;
    for (let channel = 0; channel < 3; channel += 1) {
      if (hand.data[offset + channel] !== source.data[offset + channel]) changedRgb += 1;
      if (plaque.data[offset + channel] !== source.data[offset + channel]) changedRgb += 1;
      rebuilt[offset + channel] = (handAlpha ? hand : plaque).data[offset + channel]!;
    }
    rebuilt[offset + 3] = Math.max(handAlpha, plaqueAlpha);
  }
  assert.equal(overlap, 0, 'No source pixel may be visible in both moving objects');
  assert.equal(changedRgb, 0, 'Do not repaint the approved hand or emblem');
  assert.equal(hash(rebuilt), hash(source.data), 'Final registered pose must match the reference');
});

test('the documented separation command reproduces both committed assets and manifest', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'drawnout-layer-reproduction-'));
  try {
    await promisify(execFile)(
      process.execPath,
      ['scripts/signature/separate-reference.mjs', directory],
      {
        cwd: root,
      },
    );
    for (const relative of [handPath, plaquePath, manifestPath]) {
      const regenerated = await readFile(path.join(directory, path.basename(relative)));
      if (relative === manifestPath) {
        assert.deepEqual(
          JSON.parse(regenerated.toString()),
          JSON.parse(await read(relative).then(String)),
        );
      } else {
        assert.equal(hash(regenerated), hash(await read(relative)), relative);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
