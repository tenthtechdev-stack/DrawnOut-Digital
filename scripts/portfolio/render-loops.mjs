#!/usr/bin/env node
/** Reproducible, offline source-artwork compositing. Requires Node, sharp and FFmpeg. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { duration, fps, frames, formats, projects, renderComposition } from './compositions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argument = (flag, fallback) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const stillsOnly = process.argv.includes('--stills');
const selected = argument('--project', 'all');
const selectedFormat = argument('--format', 'all');
const output = path.resolve(root, argument('--out', 'design-assets/portfolio-motion'));
const evidence = path.resolve(root, argument('--evidence', 'artifacts/portfolio-motion'));
const names = selected === 'all' ? Object.keys(projects) : [selected];
const formatNames = selectedFormat === 'all' ? Object.keys(formats) : [selectedFormat];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
sharp.concurrency(1);
await mkdir(output, { recursive: true });
await mkdir(evidence, { recursive: true });

async function prepareAssets(project) {
  const assets = {};
  const provenance = {};
  for (const [name, definition] of Object.entries(project.assets)) {
    const bytes = await readFile(path.join(root, definition.source));
    const [left, top, width, height] = definition.bounds;
    const image = await sharp(bytes).extract({ left, top, width, height }).png().toBuffer();
    assets[name] = `data:image/png;base64,${image.toString('base64')}`;
    provenance[name] = { ...definition, sourceSHA256: sha256(bytes) };
  }
  return { assets, provenance };
}

async function frame(slug, format, seconds, assets) {
  const svg = renderComposition(slug, format, seconds, assets);
  return sharp(Buffer.from(svg)).flatten().removeAlpha().raw().toBuffer();
}

const manifestFile = path.join(output, 'manifest.json');
let manifest = {
  generator: 'scripts/portfolio/render-loops.mjs',
  compositionSource: 'scripts/portfolio/compositions.mjs',
  durationSeconds: duration,
  fps,
  frameCount: frames,
  limitations: [
    'Source artwork consists of flattened presentation PNGs, not independently rigged vectors or 3D products.',
    'Marks and illustrations are cropped original pixels. Paths are presentation masks and decorative construction guides, not replacement official marks.',
    'Perspective and rotational motion apply to flat image panels; no physical product simulation or independently animated hands are claimed.',
    'These are new 2D editorial motion compositions for visual approval; the preliminary pan/zoom study archive is not used.',
  ],
  projects: {},
};
try {
  manifest = { ...manifest, ...JSON.parse(await readFile(manifestFile, 'utf8')) };
} catch {
  // The first production run creates the manifest.
}

for (const slug of names) {
  const project = projects[slug];
  assert(project, `Unknown project ${slug}`);
  const { assets, provenance } = await prepareAssets(project);
  const record = { title: project.title, direction: project.direction, assets: provenance, exports: {} };
  for (const format of formatNames) {
    const size = formats[format];
    assert(size, `Unknown format ${format}`);
    const first = await frame(slug, format, 0, assets);
    const last = await frame(slug, format, (frames - 1) / fps, assets);
    assert.deepEqual(first, last, `${slug}/${format}: loop seam must be pixel-identical before encoding`);
    for (const [label, seconds] of [['opening', 0], ['construction', 0.85], ['applications', 2.8], ['return', 4.8]]) {
      const pixels = await frame(slug, format, seconds, assets);
      await sharp(pixels, { raw: { ...size, channels: 3 } })
        .png()
        .toFile(path.join(evidence, `${slug}-${format}-${label}.png`));
    }
    if (stillsOnly) {
      console.log(`Prepared ${slug} ${format} keyframes; no video rendered.`);
      continue;
    }
    const filename = `${slug}-${format}.mp4`;
    const target = path.join(output, filename);
    const encoder = spawn('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pixel_format', 'rgb24',
      '-video_size', `${size.width}x${size.height}`, '-framerate', String(fps), '-i', 'pipe:0',
      '-an', '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '24',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-g', String(frames), target,
    ], { stdio: ['pipe', 'ignore', 'pipe'] });
    let errors = '';
    encoder.stderr.on('data', (chunk) => { errors += chunk.toString(); });
    const completion = once(encoder, 'close');
    for (let index = 0; index < frames; index++) {
      const pixels = index === 0 ? first : index === frames - 1 ? last : await frame(slug, format, index / fps, assets);
      if (!encoder.stdin.write(pixels)) await once(encoder.stdin, 'drain');
    }
    encoder.stdin.end();
    const [code] = await completion;
    assert.equal(code, 0, errors || 'FFmpeg failed');
    const bytes = await readFile(target);
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', target], { encoding: 'utf8' }));
    const stream = probe.streams.find((item) => item.codec_type === 'video');
    assert.equal(probe.streams.filter((item) => item.codec_type === 'audio').length, 0);
    assert.equal(Number(stream.nb_frames), frames);
    record.exports[format] = {
      file: filename, ...size, bytes: bytes.length, sha256: sha256(bytes),
      codec: stream.codec_name, pixelFormat: stream.pix_fmt, durationSeconds: Number(stream.duration),
      frameCount: Number(stream.nb_frames), silent: true, sourceSeamPixelIdentical: true,
      firstFrameSHA256: sha256(first), lastFrameSHA256: sha256(last),
    };
    console.log(`Rendered ${filename}: ${(bytes.length / 1024).toFixed(0)} KiB; ${frames} frames; identical source seam.`);
  }
  if (!stillsOnly) {
    manifest.projects[slug] = {
      ...record,
      exports: { ...manifest.projects[slug]?.exports, ...record.exports },
    };
    await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}
if (!stillsOnly) await writeFile(path.join(evidence, 'render-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
