#!/usr/bin/env node
/** Native-pixel portfolio derivatives; reads the original, approved crop manifest. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const root = process.cwd();
const out = path.join(root, 'artifacts/motion-quality');
await mkdir(out, { recursive: true });
const definitions = new Map();
for (const doc of ['docs/PHASE_2_ASSET_AUDIT.md', 'docs/PHASE_3_ASSET_AUDIT.md']) {
  for (const line of (await readFile(doc, 'utf8')).split('\n')) {
    const fields = line.split('|').map((part) => part.trim());
    if (!fields[1]?.match(/^`[^`]+\.webp`$/)) continue;
    const file = fields[1].replaceAll('`', '');
    const source = fields[2].replaceAll('`', '');
    if (!source.endsWith('.png')) continue;
    const bounds = fields[3].match(/\d+/g)?.map(Number);
    definitions.set(file, { source, bounds });
  }
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const audit = [];
for (const [file, { source, bounds }] of definitions) {
  const target = `src/assets/portfolio/${file}`;
  const original = `design-assets/portfolio-originals/${source}`;
  const bytes = await readFile(original);
  const native = await sharp(bytes).metadata();
  const crop = bounds
    ? {
        left: bounds[0],
        top: bounds[1],
        width: bounds[2] - bounds[0],
        height: bounds[3] - bounds[1],
      }
    : { left: 0, top: 0, width: native.width, height: native.height };
  // Baseline remains available after repeat runs without relying on mutable output.
  const before = execFileSync('git', [
    'show',
    `734e1e835ca7a447e7ed5b845cf748e7f83e2fdc:${target}`,
  ]);
  const old = await sharp(before).metadata();
  const after = await sharp(bytes)
    .extract(crop)
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toBuffer();
  await writeFile(target, after);
  audit.push({
    file,
    source: original,
    sourceSHA256: sha(bytes),
    original: { width: native.width, height: native.height },
    crop,
    before: { width: old.width, height: old.height, bytes: before.length, sha256: sha(before) },
    after: { width: crop.width, height: crop.height, bytes: after.length, sha256: sha(after) },
    encoding: 'WebP q92 effort6 smartSubsample, native crop, no resize/sharpening/upscaling',
  });
  if (
    [
      'bunzo-packaging-wide.webp',
      'sol-community-applications.webp',
      'triarch-business-card.webp',
      'fk-card-detail.webp',
    ].includes(file)
  ) {
    const stem = file.replace('.webp', '');
    // Compare the exact same source-pixel rectangle, not two differently zoomed images.
    const width = Math.min(600, crop.width);
    const height = Math.min(360, crop.height);
    const left = Math.floor((crop.width - width) / 2);
    const top = Math.floor((crop.height - height) / 2);
    for (const [label, image] of [
      ['before', before],
      ['after', after],
    ]) {
      await sharp(image)
        .resize(crop.width, crop.height, { kernel: 'lanczos3' })
        .extract({ left, top, width, height })
        .png()
        .toFile(path.join(out, `${stem}-${label}.png`));
    }
  }
}
await writeFile(
  path.join(out, 'image-source-audit.json'),
  `${JSON.stringify({ baseline: '734e1e835ca7a447e7ed5b845cf748e7f83e2fdc', assets: audit }, null, 2)}\n`,
);
await writeFile(
  path.join(root, 'design-assets/portfolio-derivatives.json'),
  `${JSON.stringify({ baseline: '734e1e835ca7a447e7ed5b845cf748e7f83e2fdc', assets: audit }, null, 2)}\n`,
);
console.log(
  `Refreshed ${audit.length} original crops; ${audit.reduce((sum, row) => sum + row.before.bytes, 0)} → ${audit.reduce((sum, row) => sum + row.after.bytes, 0)} source bytes.`,
);
