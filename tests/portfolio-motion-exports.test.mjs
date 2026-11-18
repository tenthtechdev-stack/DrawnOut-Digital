import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { promisify } from 'node:util';

const output = path.resolve('design-assets/portfolio-motion');
const manifest = JSON.parse(readFileSync(path.join(output, 'manifest.json'), 'utf8'));
const names = [
  'sol-community-center',
  'bunzo',
  'triarch',
  'churros',
  'by-tech-group',
  'u-wanna-smoothie',
];
const completion = new Set(['triarch', 'by-tech-group', 'u-wanna-smoothie']);
const run = promisify(execFile);
const extract = async (file, index) =>
  (
    await run(
      'ffmpeg',
      [
        '-v',
        'error',
        '-threads',
        '1',
        '-i',
        file,
        '-vf',
        `select=eq(n\\,${index}),scale=96:96`,
        '-frames:v',
        '1',
        '-f',
        'rawvideo',
        '-pix_fmt',
        'rgb24',
        'pipe:1',
      ],
      { maxBuffer: 100000, encoding: 'buffer' },
    )
  ).stdout;
const difference = (a, b) =>
  a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0) / a.length;
// Fixed image regions measure deliberate local motion without forcing a
// restrained monochrome identity to change its otherwise static negative space.
function regionalDifference(a, b) {
  assert.equal(a.length, 96 * 96 * 3);
  assert.equal(b.length, a.length);
  const tiles = Array(16).fill(0);
  let changed = 0;
  for (let pixel = 0; pixel < 96 * 96; pixel++) {
    const offset = pixel * 3;
    const delta =
      (Math.abs(a[offset] - b[offset]) +
        Math.abs(a[offset + 1] - b[offset + 1]) +
        Math.abs(a[offset + 2] - b[offset + 2])) /
      3;
    if (delta > 12) changed += 1;
    const tile = Math.floor((pixel % 96) / 24) + Math.floor(Math.floor(pixel / 96) / 24) * 4;
    tiles[tile] += delta;
  }
  return { tile: Math.max(...tiles) / (24 * 24), fraction: changed / (96 * 96) };
}

for (const slug of names) {
  test(`${slug}: silent, responsive, seamless encoded exports and actual visual progression`, async (context) => {
    const project = manifest.projects[slug];
    assert(project);
    assert.match(project.composition, /^scripts\/portfolio\/quality\/[a-z]+(?:-[a-z]+)*\.mjs$/);
    assert.equal(project.durationSeconds, 7.5);
    for (const asset of Object.values(project.assets)) {
      const source = readFileSync(asset.source);
      assert.equal(createHash('sha256').update(source).digest('hex'), asset.sourceSHA256);
      assert.equal(asset.bounds.length, 4);
      assert(asset.bounds.every((value) => Number.isInteger(value) && value >= 0));
    }
    for (const format of ['landscape', 'portrait']) {
      const entry = project.exports[format];
      const file = path.join(output, entry.file);
      const bytes = readFileSync(file);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
      assert(bytes.length < 3 * 1024 * 1024, 'Each card loop stays below 3MiB');
      const probe = JSON.parse(
        (
          await run('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', file], {
            encoding: 'utf8',
          })
        ).stdout,
      );
      assert.equal(probe.streams.length, 1, 'A single silent video stream');
      const video = probe.streams[0];
      assert.equal(video.codec_type, 'video');
      assert.equal(video.codec_name, 'h264');
      assert.equal(video.pix_fmt, 'yuv420p');
      assert.equal(video.color_space, 'bt709');
      assert.equal(video.color_primaries, 'bt709');
      assert.equal(video.color_transfer, 'bt709');
      assert.equal(video.color_range, 'tv');
      const frameCount = 180;
      assert.equal(Number(video.nb_frames), frameCount);
      assert.equal(video.avg_frame_rate, '24/1');
      assert.equal(Number(video.duration), 7.5);
      assert.deepEqual(
        [video.width, video.height],
        format === 'landscape' ? [1440, 810] : [810, 1080],
      );
      assert.match(entry.firstFrameSHA256, /^[a-f0-9]{64}$/);
      assert.equal(entry.firstFrameSHA256, entry.lastFrameSHA256);
      assert.equal(entry.sourceSeamPixelIdentical, true);
      const first = await extract(file, 0);
      const middle = await extract(file, 52);
      const last = await extract(file, frameCount - 1);
      const seamDifference = difference(first, last);
      const application = await extract(file, 114);
      const progressionDifference = Math.max(
        difference(first, middle),
        difference(first, application),
      );
      assert(seamDifference < 3, 'Encoded loop endpoints remain visually matched');
      const regions = [middle, application].map((frame) => regionalDifference(first, frame));
      if (completion.has(slug)) {
        assert(
          regions.some(({ tile, fraction }) => tile > 12 && fraction > 0.04),
          'Source-art motion changes a fixed 1/16-canvas region by >12/255 and >4% of canvas pixels by >12/255 in the same sampled frame',
        );
      } else {
        assert(
          progressionDifference > 12,
          'Independent source elements visibly move within the composition',
        );
      }
      context.diagnostic(
        `${format}: decoded seam mean absolute difference ${seamDifference.toFixed(4)} / 255; identity-to-application difference ${progressionDifference.toFixed(2)} / 255${completion.has(slug) ? `; frame52 tile${regions[0].tile.toFixed(2)}, changed${(regions[0].fraction * 100).toFixed(2)}%; frame114 tile${regions[1].tile.toFixed(2)}, changed${(regions[1].fraction * 100).toFixed(2)}%` : ''}`,
      );
    }
  });
}
