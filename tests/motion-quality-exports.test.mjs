import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const output = path.resolve('design-assets/portfolio-motion/quality');
const parent = '734e1e835ca7a447e7ed5b845cf748e7f83e2fdc';
const pilots = ['bunzo', 'sol-community-center', 'churros'];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const difference = (a, b) => {
  assert.equal(a.length, b.length, 'Compared decoded images must have equal dimensions');
  return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0) / a.length;
};
async function decodedFrame(file, index, size) {
  const { stdout } = await run(
    'ffmpeg',
    [
      '-v',
      'error',
      '-threads',
      '1',
      '-i',
      file,
      '-vf',
      `select=eq(n\\,${index})`,
      '-filter_threads',
      '1',
      '-frames:v',
      '1',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgb24',
      'pipe:1',
    ],
    { maxBuffer: size.width * size.height * 4, encoding: 'buffer' },
  );
  assert.equal(
    stdout.length,
    size.width * size.height * 3,
    `Frame ${index} must actually decode at native dimensions`,
  );
  // Compare like with like: decode the native RGB frame first, then use the
  // same RGB Lanczos resize as the poster. Scaling YUV in FFmpeg while scaling
  // the poster in Sharp would measure different reconstruction kernels too.
  return sharp(stdout, { raw: { ...size, channels: 3 } })
    .resize(96, 96, { fit: 'fill' })
    .raw()
    .toBuffer();
}

for (const slug of pilots) {
  test(`${slug}: transparent layers retain original visible pixels and recorded source provenance`, async (context) => {
    const manifest = JSON.parse(await readFile(path.join(output, `${slug}-manifest.json`), 'utf8'));
    let isolatedLayers = 0;
    let checkedOpaquePixels = 0;
    assert.equal(manifest.slug, slug);
    assert.match(manifest.composition, /^scripts\/portfolio\/quality\/[a-z]+\.mjs$/);
    assert((await readFile(manifest.composition)).length > 0);
    for (const [name, layer] of Object.entries(manifest.assets)) {
      const sourceBytes = await readFile(layer.source);
      assert.equal(hash(sourceBytes), layer.sourceSHA256, `${name}: unchanged original PNG`);
      const sourceMetadata = await sharp(sourceBytes).metadata();
      const [left, top, width, height] = layer.bounds;
      assert(layer.bounds.every((value) => Number.isInteger(value) && value >= 0));
      assert(width > 0 && height > 0);
      assert(left + width <= sourceMetadata.width && top + height <= sourceMetadata.height);
      const layerBytes = await readFile(layer.file);
      assert.equal(hash(layerBytes), layer.layerSHA256, `${name}: supplied alpha layer hash`);
      const metadata = await sharp(layerBytes).metadata();
      assert.deepEqual([metadata.width, metadata.height], [width, height]);
      assert.equal(metadata.format, 'png');
      const actual = await sharp(layerBytes).ensureAlpha().raw().toBuffer();
      const original = await sharp(sourceBytes)
        .extract({ left, top, width, height })
        .ensureAlpha()
        .raw()
        .toBuffer();
      let transparent = 0;
      let visible = 0;
      for (let p = 0; p < actual.length; p += 4) {
        const alpha = actual[p + 3];
        if (alpha === 0) transparent += 1;
        else visible += 1;
        // Partial-alpha edge antialiasing can round RGB during premultiplication.
        // Opaque retained pixels must be the actual source artwork, without repainting.
        if (alpha === 255) {
          for (let channel = 0; channel < 3; channel++)
            assert.equal(
              actual[p + channel],
              original[p + channel],
              `${name}: original opaque RGB`,
            );
          checkedOpaquePixels += 1;
        }
      }
      assert(visible > 0, `${name}: a visible source layer, not an empty alpha image`);
      if (layer.mask) {
        assert(transparent > 0, `${name}: isolated layers contain genuine transparent pixels`);
        isolatedLayers += 1;
      }
    }
    assert(isolatedLayers >= 5, 'The composition contains independently isolated actual artwork');
    assert(checkedOpaquePixels > 1000, 'Substantial original visible artwork was verified');
    context.diagnostic(
      `${isolatedLayers} isolated layers; ${checkedOpaquePixels} opaque source pixels checked`,
    );
  });

  test(`${slug}: actual landscape/portrait MP4s decode, loop, move and match their sharp posters`, async (context) => {
    const manifest = JSON.parse(await readFile(path.join(output, `${slug}-manifest.json`), 'utf8'));
    for (const format of ['landscape', 'portrait']) {
      const entry = manifest.exports[format];
      const file = path.join(output, entry.file);
      const bytes = await readFile(file);
      assert.equal(hash(bytes), entry.sha256);
      assert(
        bytes.length > 10000 && bytes.length < 3 * 1024 * 1024,
        'Actual export stays below3MiB',
      );
      const { stdout } = await run('ffprobe', [
        '-v',
        'error',
        '-show_streams',
        '-of',
        'json',
        file,
      ]);
      const streams = JSON.parse(stdout).streams;
      assert.equal(streams.length, 1, 'A single silent video stream');
      const video = streams[0];
      assert.equal(video.codec_name, 'h264');
      assert.equal(video.codec_type, 'video');
      assert.equal(video.pix_fmt, 'yuv420p');
      assert.equal(video.color_space, 'bt709');
      assert.equal(video.color_primaries, 'bt709');
      assert.equal(video.color_transfer, 'bt709');
      assert.equal(video.color_range, 'tv');
      assert.equal(video.avg_frame_rate, '24/1');
      assert.equal(Number(video.nb_frames), 180);
      assert.equal(Number(video.duration), 7.5);
      const expectedSize = format === 'landscape' ? [1440, 810] : [810, 1080];
      assert.deepEqual([video.width, video.height], expectedSize);
      assert.match(entry.firstFrameSHA256, /^[a-f0-9]{64}$/);
      assert.equal(entry.firstFrameSHA256, entry.lastFrameSHA256);
      assert.equal(entry.sourceSeamPixelIdentical, true);
      // Decode every frame, rather than trusting only the container's metadata.
      const decoded = await run('ffmpeg', [
        '-v',
        'error',
        '-threads',
        '1',
        '-i',
        file,
        '-f',
        'null',
        '-',
      ]);
      assert.equal(decoded.stderr, '');
      const size = { width: video.width, height: video.height };
      const first = await decodedFrame(file, 0, size);
      const middle = await decodedFrame(file, 52, size);
      const application = await decodedFrame(file, 114, size);
      const last = await decodedFrame(file, 179, size);
      const seam = difference(first, last);
      const progression = Math.max(difference(first, middle), difference(first, application));
      assert(seam < 3, 'Encoded endpoints are visually matched after compression');
      assert(progression > 12, 'Real source elements change visibly during the encoded animation');
      const posterBytes = await readFile(path.join(output, entry.poster.file));
      assert.equal(hash(posterBytes), entry.poster.sha256);
      const posterMetadata = await sharp(posterBytes).metadata();
      assert.deepEqual([posterMetadata.width, posterMetadata.height], expectedSize);
      const poster = await sharp(posterBytes)
        .resize(96, 96, { fit: 'fill' })
        .removeAlpha()
        .raw()
        .toBuffer();
      const posterDifference = difference(first, poster);
      assert(posterDifference < 4, 'The sharp static poster matches the actual encoded opening');
      context.diagnostic(
        `${format}: decoded seam${seam.toFixed(4)}, progression${progression.toFixed(2)}, poster error${posterDifference.toFixed(3)} /255`,
      );
    }
  });
}

test('the remaining three motion directions retain all six original MP4s pending creative approval', async () => {
  for (const slug of ['triarch', 'by-tech-group', 'u-wanna-smoothie']) {
    for (const format of ['landscape', 'portrait']) {
      const file = `design-assets/portfolio-motion/${slug}-${format}.mp4`;
      const { stdout: original } = await run('git', ['show', `${parent}:${file}`], {
        encoding: 'buffer',
        maxBuffer: 10 * 1024 * 1024,
      });
      assert.equal(hash(await readFile(file)), hash(original), `${slug}/${format}: unchanged`);
    }
  }
});
