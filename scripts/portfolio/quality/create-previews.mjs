#!/usr/bin/env node
/** Lightweight inline review copies, generated from the actual finished MP4s. */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const run = promisify(execFile);
const directory = path.join(root, 'design-assets/portfolio-motion/quality');
const evidence = path.join(root, 'artifacts/motion-quality');
await mkdir(evidence, { recursive: true });
for (const slug of ['bunzo', 'sol-community-center', 'churros']) {
  const manifest = JSON.parse(
    await readFile(path.join(directory, `${slug}-manifest.json`), 'utf8'),
  );
  for (const format of ['landscape', 'portrait']) {
    const entry = manifest.exports[format];
    const file = path.join(directory, entry.file);
    const bytes = await readFile(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    const width = format === 'landscape' ? 480 : 270;
    const output = path.join(evidence, `${slug}-${format}-preview.gif`);
    await run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-threads',
      '1',
      '-i',
      file,
      '-filter_complex_threads',
      '1',
      '-filter_complex',
      `fps=10,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
      '-loop',
      '0',
      output,
    ]);
    console.log(`Created ${slug}/${format}: 7.5s, 10fps, ${width}px review GIF.`);
  }
  // These are decoded MP4 frames, so the contact sheet exposes encoded details.
  const tiles = [];
  const indices = [0, 24, 48, 72, 96, 120, 144, 179];
  for (const [position, frame] of indices.entries()) {
    const { stdout } = await run(
      'ffmpeg',
      [
        '-v',
        'error',
        '-threads',
        '1',
        '-i',
        path.join(directory, manifest.exports.landscape.file),
        '-vf',
        `select=eq(n\\,${frame}),scale=360:202`,
        '-frames:v',
        '1',
        '-f',
        'image2pipe',
        '-vcodec',
        'png',
        'pipe:1',
      ],
      { encoding: 'buffer', maxBuffer: 1024 * 1024 },
    );
    tiles.push({ input: stdout, left: (position % 4) * 360, top: Math.floor(position / 4) * 202 });
  }
  await sharp({ create: { width: 1440, height: 404, channels: 3, background: '#f7f5f1' } })
    .composite(tiles)
    .png()
    .toFile(path.join(evidence, `${slug}-encoded-storyboard.png`));
}
