#!/usr/bin/env node
/** Offline, source-faithful RGBA layer compositor: Node + Sharp + FFmpeg only. */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { spawn, execFile } from 'node:child_process';
import { once } from 'node:events';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { duration, fps, frames, formats, svg } from './shared.mjs';
import { partitionWordmark } from './mattes.mjs';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const selected = arg('--project', 'all');
const formatArg = arg('--format', 'all');
const output = path.resolve(root, arg('--out', 'design-assets/portfolio-motion/quality'));
const evidence = path.resolve(root, arg('--evidence', 'artifacts/motion-quality'));
const stills = process.argv.includes('--stills');
const modules = { bunzo: 'bunzo', 'sol-community-center': 'sol', churros: 'churros' };
const names = selected === 'all' ? Object.keys(modules) : [selected];
const formatNames = formatArg === 'all' ? Object.keys(formats) : [formatArg];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
sharp.concurrency(1);
await mkdir(output, { recursive: true });
await mkdir(evidence, { recursive: true });

async function prepareAssets(project) {
  const assets = {};
  const provenance = {};
  const dir = path.join(output, 'layers', project.slug);
  await mkdir(dir, { recursive: true });
  for (const [name, definition] of Object.entries(project.assets)) {
    const source = await readFile(path.join(root, definition.source));
    const [left, top, width, height] = definition.bounds;
    let bytes = await sharp(source)
      .extract({ left, top, width, height })
      .ensureAlpha()
      .png()
      .toBuffer();
    const mask = definition.mask;
    if (mask?.type === 'wordmark-partition') {
      const { data, info } = await sharp(bytes)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const result = partitionWordmark(data, width, height, mask.part);
      bytes = await sharp(result, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png()
        .toBuffer();
    } else if (mask?.type === 'polygon' || mask?.type === 'path') {
      const shape =
        mask.type === 'polygon'
          ? `<polygon points="${mask.points.map((p) => p.join(',')).join(' ')}" fill="white"/>`
          : `<path d="${mask.d}" fill="white" fill-rule="evenodd"/>`;
      const matte = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shape}</svg>`,
      );
      bytes = await sharp(bytes)
        .composite([{ input: matte, blend: 'dest-in' }])
        .png()
        .toBuffer();
      if (mask.clip) {
        const clipMatte = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${mask.clip}" fill="white"/></svg>`,
        );
        bytes = await sharp(bytes)
          .composite([{ input: clipMatte, blend: 'dest-in' }])
          .png()
          .toBuffer();
      }
    } else if (mask?.type === 'color' || mask?.type === 'ranges') {
      const { data, info } = await sharp(bytes)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let p = 0; p < data.length; p += 4) {
        let alpha;
        if (mask.type === 'color') {
          const distance = Math.sqrt(
            mask.background.reduce((sum, value, i) => sum + (data[p + i] - value) ** 2, 0),
          );
          const threshold = mask.threshold ?? 30;
          const feather = mask.feather ?? 10;
          alpha = Math.round(255 * Math.max(0, Math.min(1, (distance - threshold) / feather)));
        } else {
          alpha = mask.ranges.some(({ min, max }) =>
            min.every((v, i) => data[p + i] >= v && data[p + i] <= max[i]),
          )
            ? 255
            : 0;
        }
        data[p + 3] = Math.round((data[p + 3] * alpha) / 255);
      }
      bytes = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png()
        .toBuffer();
    }
    await writeFile(path.join(dir, `${name}.png`), bytes);
    assets[name] = { uri: `data:image/png;base64,${bytes.toString('base64')}`, width, height };
    provenance[name] = {
      ...definition,
      sourceSHA256: hash(source),
      layerSHA256: hash(bytes),
      file: path.relative(root, path.join(dir, `${name}.png`)),
      nativeWidth: width,
      nativeHeight: height,
    };
  }
  return { assets, provenance };
}

const keyframes = [
  ['settled', 0],
  ['anticipation', 1],
  ['deconstructed', 2.15],
  ['assembly', 3.3],
  ['resolved', 4.75],
  ['return', 6.6],
];
for (const slug of names) {
  assert(modules[slug], `Unknown quality composition ${slug}`);
  const module = await import(`./${modules[slug]}.mjs`);
  const { project, render } = module;
  const { assets, provenance } = await prepareAssets(project);
  const record = {
    slug,
    title: project.title,
    direction: project.direction,
    composition: `scripts/portfolio/quality/${modules[slug]}.mjs`,
    durationSeconds: duration,
    fps,
    frameCount: frames,
    layers: project.layers,
    limitations: project.limitations ?? [],
    assets: provenance,
    exports: {},
  };
  for (const format of formatNames) {
    const size = formats[format];
    assert(size, `Unknown format ${format}`);
    const makeSvg = (seconds) => {
      // Identical holds bracket the cyclic motion, including the encoded last frame.
      const t = seconds <= 0.35 || seconds >= 7.2 ? 0 : seconds;
      const content = render({ ...size, portrait: format === 'portrait', format, t, assets, svg });
      return content.startsWith('<svg')
        ? content
        : `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">${content}</svg>`;
    };
    const frame = (t) =>
      sharp(Buffer.from(makeSvg(t)))
        .flatten({ background: project.background })
        .removeAlpha()
        .raw()
        .toBuffer();
    const first = await frame(0);
    const last = await frame((frames - 1) / fps);
    assert.deepEqual(first, last, `${slug}/${format}: source loop seam differs`);
    for (const [label, seconds] of keyframes) {
      const pixels = await frame(seconds);
      await sharp(pixels, { raw: { ...size, channels: 3 } })
        .png()
        .toFile(path.join(evidence, `${slug}-${format}-${label}.png`));
    }
    const posterFilename = `${slug}-${format}-poster.webp`;
    await sharp(first, { raw: { ...size, channels: 3 } })
      .webp({ quality: 96, effort: 6 })
      .toFile(path.join(output, posterFilename));
    await writeFile(path.join(output, `${slug}-${format}-composition.svg`), makeSvg(0));
    if (stills) {
      console.log(`Prepared ${slug}/${format} source-faithful layers + six keyframes.`);
      continue;
    }
    const filename = `${slug}-${format}.mp4`;
    const target = path.join(output, filename);
    const encoder = spawn(
      'ffmpeg',
      [
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-f',
        'rawvideo',
        '-pixel_format',
        'rgb24',
        '-video_size',
        `${size.width}x${size.height}`,
        '-framerate',
        String(fps),
        '-i',
        'pipe:0',
        '-an',
        // HD browser decoders use BT.709. Explicitly convert full-range RGB
        // through that matrix before encoding; tags alone cannot repair a
        // BT.601-converted signal that would otherwise shift brand colors.
        '-vf',
        'scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p',
        '-c:v',
        'libx264',
        '-threads',
        '2',
        '-preset',
        'medium',
        '-tune',
        'animation',
        '-crf',
        '19',
        '-profile:v',
        'high',
        '-level:v',
        '4.1',
        '-pix_fmt',
        'yuv420p',
        '-colorspace',
        'bt709',
        '-color_primaries',
        'bt709',
        '-color_trc',
        'bt709',
        '-color_range',
        'tv',
        '-x264-params',
        'colorprim=bt709:transfer=bt709:colormatrix=bt709:fullrange=off',
        '-movflags',
        '+faststart',
        '-g',
        String(frames),
        target,
      ],
      { stdio: ['pipe', 'ignore', 'pipe'] },
    );
    let errors = '';
    encoder.stderr.on('data', (chunk) => {
      errors += chunk.toString();
    });
    const completion = once(encoder, 'close');
    for (let index = 0; index < frames; index++) {
      const pixels = index === 0 ? first : index === frames - 1 ? last : await frame(index / fps);
      if (!encoder.stdin.write(pixels)) await once(encoder.stdin, 'drain');
    }
    encoder.stdin.end();
    const [code] = await completion;
    assert.equal(code, 0, errors || 'FFmpeg encoding failed');
    const bytes = await readFile(target);
    const probe = JSON.parse(
      (
        await run('ffprobe', [
          '-v',
          'error',
          '-show_streams',
          '-show_format',
          '-of',
          'json',
          target,
        ])
      ).stdout,
    );
    const stream = probe.streams.find((s) => s.codec_type === 'video');
    assert.equal(probe.streams.filter((s) => s.codec_type === 'audio').length, 0);
    assert.equal(Number(stream.nb_frames), frames);
    assert.equal(stream.color_space, 'bt709');
    assert.equal(stream.color_primaries, 'bt709');
    assert.equal(stream.color_transfer, 'bt709');
    assert.equal(stream.color_range, 'tv');
    await run('ffmpeg', ['-v', 'error', '-i', target, '-f', 'null', '-']);
    const poster = await readFile(path.join(output, posterFilename));
    record.exports[format] = {
      file: filename,
      ...size,
      bytes: bytes.length,
      sha256: hash(bytes),
      codec: stream.codec_name,
      pixelFormat: stream.pix_fmt,
      profile: stream.profile,
      colorEncoding: {
        source: 'RGB24 full range',
        conversion: 'scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p',
        matrix: stream.color_space,
        primaries: stream.color_primaries,
        transfer: stream.color_transfer,
        range: stream.color_range,
        h264VUI: 'colorprim=bt709:transfer=bt709:colormatrix=bt709:fullrange=off',
      },
      durationSeconds: Number(probe.format.duration),
      frames: Number(stream.nb_frames),
      averageBitrate: Number(probe.format.bit_rate),
      crf: 19,
      audioStreams: 0,
      firstFrameSHA256: hash(first),
      lastFrameSHA256: hash(last),
      sourceBoundaryPixelIdentical: true,
      sourceSeamPixelIdentical: true,
      decodedAllFrames: true,
      poster: {
        file: posterFilename,
        bytes: poster.length,
        sha256: hash(poster),
        width: size.width,
        height: size.height,
        quality: 96,
      },
    };
    console.log(
      `Rendered ${slug}/${format}: ${size.width}x${size.height}, ${frames} frames, ${(bytes.length / 1048576).toFixed(2)} MiB; all frames decoded.`,
    );
  }
  await writeFile(
    path.join(output, `${slug}-manifest.json`),
    `${JSON.stringify(record, null, 2)}\n`,
  );
}
