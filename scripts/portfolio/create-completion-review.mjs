#!/usr/bin/env node
/** Decode actual original/new MP4s into comparable review assets. */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { format } from 'prettier';

const execute = promisify(execFile);
const baseline = 'e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b';
const slugs = ['triarch', 'by-tech-group', 'u-wanna-smoothie'];
const directory = 'design-assets/portfolio-motion';
const output = 'artifacts/motion-completion';
const cache = path.join(os.tmpdir(), 'drawnout-motion-completion-before');
const beforeOnly = process.argv.includes('--before-only');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });
await mkdir(cache, { recursive: true });
const oldManifest = JSON.parse(
  (await execute('git', ['show', `${baseline}:${directory}/manifest.json`])).stdout,
);
const comparison = {
  baseline,
  method:
    'Actual encoded MP4s decoded without frame retiming, colour correction or sharpening. GIFs are reduced review copies; source MP4s retain their native export dimensions and timing.',
  projects: {},
};

async function preview(file, target, width, fps) {
  await execute('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-threads',
    '1',
    '-i',
    file,
    '-filter_complex_threads',
    '1',
    '-filter_complex',
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    '-loop',
    '0',
    target,
  ]);
}
async function encodedFrame(file, frame, width = 360, height = 202) {
  return (
    await execute(
      'ffmpeg',
      [
        '-v',
        'error',
        '-threads',
        '1',
        '-i',
        file,
        '-vf',
        `select=eq(n\\,${frame}),scale=${width}:${height}`,
        '-frames:v',
        '1',
        '-f',
        'image2pipe',
        '-vcodec',
        'png',
        'pipe:1',
      ],
      { encoding: 'buffer', maxBuffer: 4 * 1024 * 1024 },
    )
  ).stdout;
}
async function storyboard(file, indices, target) {
  const tiles = [];
  for (const [index, frame] of indices.entries())
    tiles.push({
      input: await encodedFrame(file, frame),
      left: (index % 4) * 360,
      top: Math.floor(index / 4) * 202,
    });
  await sharp({ create: { width: 1440, height: 404, channels: 3, background: '#f7f5f1' } })
    .composite(tiles)
    .png()
    .toFile(target);
}
for (const slug of slugs) {
  const entry = { title: oldManifest.projects[slug].title, before: {}, after: {} };
  for (const orientation of ['landscape', 'portrait']) {
    const old = oldManifest.projects[slug].exports[orientation];
    const bytes = (
      await execute('git', ['show', `${baseline}:${directory}/${old.file}`], {
        encoding: 'buffer',
        maxBuffer: 6 * 1024 * 1024,
      })
    ).stdout;
    assert.equal(hash(bytes), old.sha256);
    const original = path.join(cache, old.file);
    await writeFile(original, bytes);
    await preview(
      original,
      `${output}/${slug}-${orientation}-before.gif`,
      orientation === 'landscape' ? 480 : 270,
      8,
    );
    entry.before[orientation] = {
      ...old,
      immutableGitHubURL: `https://github.com/tenthtech/drawnout-digital/blob/${baseline}/${directory}/${old.file}`,
    };
    if (orientation === 'landscape')
      await storyboard(
        original,
        [0, 18, 36, 54, 72, 90, 108, 137],
        `${output}/${slug}-before-storyboard.png`,
      );
    if (beforeOnly) continue;
    const quality = JSON.parse(
      await readFile(`${directory}/quality/${slug}-manifest.json`, 'utf8'),
    );
    const current = quality.exports[orientation];
    const movie = `${directory}/quality/${current.file}`;
    assert.equal(hash(await readFile(movie)), current.sha256);
    await preview(
      movie,
      `${output}/${slug}-${orientation}-after.gif`,
      orientation === 'landscape' ? 480 : 270,
      10,
    );
    entry.after[orientation] = current;
    entry.direction = quality.direction;
    entry.composition = quality.composition;
    entry.limitations = quality.limitations;
    if (orientation === 'landscape')
      await storyboard(
        movie,
        [0, 24, 48, 72, 96, 120, 144, 179],
        `${output}/${slug}-after-storyboard.png`,
      );
  }
  comparison.projects[slug] = entry;
  console.log(`Prepared ${slug} ${beforeOnly ? 'original-loop' : 'before/after'} review assets.`);
}
await writeFile(
  `${output}/comparison-manifest.json`,
  await format(JSON.stringify(comparison), { parser: 'json', printWidth: 100 }),
);
