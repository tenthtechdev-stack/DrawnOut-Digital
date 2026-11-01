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

for (const slug of names) {
  test(`${slug}: silent, responsive, seamless encoded exports and actual visual progression`, async (context) => {
    const project = manifest.projects[slug];
    assert(project);
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
      assert.equal(Number(video.nb_frames), 138);
      assert.equal(video.avg_frame_rate, '24/1');
      assert.equal(Number(video.duration), 5.75);
      assert.deepEqual(
        [video.width, video.height],
        format === 'landscape' ? [960, 540] : [600, 750],
      );
      assert.equal(entry.firstFrameSHA256, entry.lastFrameSHA256);
      assert.equal(entry.sourceSeamPixelIdentical, true);
      const first = await extract(file, 0);
      const middle = await extract(file, 68);
      const last = await extract(file, 137);
      const seamDifference = difference(first, last);
      const progressionDifference = difference(first, middle);
      assert(seamDifference < 3, 'Encoded loop endpoints remain visually matched');
      assert(
        progressionDifference > 12,
        'The application scene visibly differs from the identity scene',
      );
      context.diagnostic(
        `${format}: decoded seam mean absolute difference ${seamDifference.toFixed(4)} / 255; identity-to-application difference ${progressionDifference.toFixed(2)} / 255`,
      );
    }
  });
}
