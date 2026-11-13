#!/usr/bin/env node
/** Faithful raster extraction; this script does not trace or redraw the supplied emblem. */
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = 'src/assets/brand/drawnout-logo-provided.png';
// Complete nonzero-alpha bounds in the emblem's left-hand source region (x < 650).
// The wordmark starts around x=700 and is deliberately excluded.
const bounds = { left: 163, top: 251, width: 464, height: 610 };
const bytes = await readFile(path.join(root, source));
const isolated = await sharp(bytes).extract(bounds).png().toBuffer();
const digest = (value) => createHash('sha256').update(value).digest('hex');
const version = digest(isolated).slice(0, 10);
const prefix = `drawnout-emblem-${version}`;
const target = path.join(root, 'public/icons');
await mkdir(target, { recursive: true });
await writeFile(path.join(root, 'src/assets/brand/drawnout-emblem-isolated.png'), isolated);
const sizes = [16, 32, 180, 192, 512];
const files = [];
for (const size of sizes) {
  // 14/16 height at favicon sizes protects recognition; 82% elsewhere leaves app-icon padding.
  const height = size <= 32 ? Math.round(size * 0.875) : Math.round(size * 0.82);
  const mark = await sharp(isolated).resize({ height, withoutEnlargement: true }).png().toBuffer();
  const metadata = await sharp(mark).metadata();
  const icon = await sharp({
    create: { width: size, height: size, channels: 4, background: '#f7f5f1' },
  })
    .composite([
      {
        input: mark,
        left: Math.floor((size - metadata.width) / 2),
        top: Math.floor((size - metadata.height) / 2),
      },
    ])
    .png()
    .toBuffer();
  const file = `${prefix}-${size}.png`;
  await writeFile(path.join(target, file), icon);
  files.push({ size, file, sha256: digest(icon), bytes: icon.length });
}

// ICO supports PNG-compressed entries without changing the authentic raster geometry.
const icoEntries = await Promise.all(
  files
    .filter(({ size }) => size <= 32)
    .map(async ({ size, file }) => ({
      size,
      bytes: await readFile(path.join(target, file)),
    })),
);
const header = Buffer.alloc(6 + icoEntries.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoEntries.length, 4);
let offset = header.length;
icoEntries.forEach(({ size, bytes: png }, index) => {
  const start = 6 + index * 16;
  header[start] = size;
  header[start + 1] = size;
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(png.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += png.length;
});
const ico = Buffer.concat([header, ...icoEntries.map(({ bytes: png }) => png)]);
await writeFile(path.join(target, `${prefix}.ico`), ico);
await writeFile(path.join(root, 'public/favicon.ico'), ico);
const png512 = await readFile(path.join(target, `${prefix}-512.png`));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>DrawnOut Digital emblem</title><image width="512" height="512" href="data:image/png;base64,${png512.toString('base64')}"/></svg>\n`;
await writeFile(path.join(target, `${prefix}.svg`), svg);
await writeFile(
  path.join(target, 'source.json'),
  JSON.stringify(
    {
      generator: 'scripts/brand/build-favicons.mjs',
      source,
      sourceSHA256: digest(bytes),
      bounds,
      isolatedSHA256: digest(isolated),
      version,
      svgType: 'Image-backed SVG wrapper, not a traced or original vector mark',
      background: '#f7f5f1',
      files,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Generated ${prefix}: faithful ${bounds.width}×${bounds.height} emblem + ${sizes.join('/')}px icons.`,
);
