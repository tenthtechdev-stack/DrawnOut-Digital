#!/usr/bin/env node
/** Verify the actual MP4's declared matrix and Chromium's decoded/presented RGB. */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { setTimeout } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

/* global document */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = path.join(root, 'artifacts/motion-completion');
const media = path.join(root, 'design-assets/portfolio-motion/quality');
const slugs = ['triarch', 'by-tech-group', 'u-wanna-smoothie'];
const formats = ['landscape', 'portrait'];
const run = promisify(execFile);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const maximumChannelError = 3;
// Smooth original gradients are encoded as lossy 4:2:0, unlike the flat ground.
const artworkMaximumChannelError = 5;

// Batch renders write one complete manifest per project after both exports.
// Waiting for all six color-tagged entries prevents a mixed old/new audit.
const deadline = Date.now() + 10 * 60 * 1000;
let manifests;
while (!manifests) {
  try {
    const records = await Promise.all(
      slugs.map(async (slug) =>
        JSON.parse(await readFile(path.join(media, `${slug}-manifest.json`), 'utf8')),
      ),
    );
    if (
      records.every((record) =>
        formats.every((format) => record.exports[format]?.colorEncoding?.matrix === 'bt709'),
      )
    )
      manifests = records;
  } catch {
    // A render may be atomically finishing its manifest while the audit waits.
  }
  if (!manifests) {
    assert(
      Date.now() < deadline,
      'All six final BT.709 export records were not ready within ten minutes.',
    );
    await setTimeout(1000);
  }
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--disable-gpu'],
});
const audit = {
  browser: browser.version(),
  observedAt: new Date().toISOString(),
  method:
    'Actual Chromium native-size DPR1 video element at its first decoded paused frame, served only by intercepted local HTTP routes. Canvas RGB and page-screenshot RGB are compared against the uncompressed settled source PNG. No color filter, frame seeking, screenshot color correction or external network request is used.',
  maximumChannelError,
  artworkMaximumChannelError,
  exports: [],
};
const rgbAt = async (bytes, x, y) => [
  ...(await sharp(bytes)
    .extract({ left: x, top: y, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer()),
];
const save = () =>
  writeFile(
    path.join(output, 'browser-export-color-audit.json'),
    `${JSON.stringify(audit, null, 2)}\n`,
  );
try {
  for (const record of manifests) {
    for (const format of formats) {
      const entry = record.exports[format];
      const videoBytes = await readFile(path.join(media, entry.file));
      assert.equal(hash(videoBytes), entry.sha256, `${record.slug}/${format}: final video hash`);
      assert.equal(
        entry.decodedAllFrames,
        true,
        'The render pipeline must have decoded every actual frame.',
      );
      const probe = JSON.parse(
        (
          await run('ffprobe', [
            '-v',
            'error',
            '-show_entries',
            'stream=codec_name,codec_type,width,height,nb_frames,avg_frame_rate,pix_fmt,color_space,color_primaries,color_transfer,color_range:format=duration',
            '-of',
            'json',
            path.join(media, entry.file),
          ])
        ).stdout,
      );
      const stream = probe.streams[0];
      assert.equal(probe.streams.length, 1, 'Exactly one silent video stream.');
      assert.equal(stream.color_space, 'bt709');
      assert.equal(stream.color_primaries, 'bt709');
      assert.equal(stream.color_transfer, 'bt709');
      assert.equal(stream.color_range, 'tv');
      assert.equal(stream.width, entry.width);
      assert.equal(stream.height, entry.height);
      const sourceFile = `${record.slug}-${format}-settled.png`;
      const sourceBytes = await readFile(path.join(output, sourceFile));
      const sourceMetadata = await sharp(sourceBytes).metadata();
      assert.equal(sourceMetadata.width, entry.width);
      assert.equal(sourceMetadata.height, entry.height);
      const context = await browser.newContext({
        viewport: { width: entry.width, height: entry.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const requests = [];
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        requests.push(url.pathname);
        if (url.hostname !== 'motion-completion.invalid') return route.abort();
        if (url.pathname === '/review')
          return route.fulfill({
            contentType: 'text/html',
            body: `<!doctype html><html lang="en"><meta charset="utf-8"><title>DrawnOut source-to-browser color proof</title><style>html,body{margin:0;padding:0;overflow:hidden}video{display:block;width:${entry.width}px;height:${entry.height}px}</style><video id="review" muted playsinline preload="auto" width="${entry.width}" height="${entry.height}" src="/export.mp4"></video></html>`,
          });
        if (url.pathname === '/export.mp4')
          return route.fulfill({
            status: 200,
            contentType: 'video/mp4',
            headers: { 'Content-Length': String(videoBytes.length), 'Accept-Ranges': 'bytes' },
            body: videoBytes,
          });
        return route.fulfill({ status: 404, body: '' });
      });
      await page.goto('http://motion-completion.invalid/review');
      await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
      await page.waitForTimeout(150);
      const videoState = await page.locator('video').evaluate((video) => ({
        currentTime: video.currentTime,
        paused: video.paused,
        readyState: video.readyState,
        width: video.videoWidth,
        height: video.videoHeight,
      }));
      assert.equal(
        videoState.currentTime,
        0,
        'The first paused decoded frame is sampled without seeking.',
      );
      assert.equal(videoState.paused, true);
      assert.equal(videoState.width, entry.width);
      assert.equal(videoState.height, entry.height);
      const points = [{ x: 10, y: 10 }];
      if (record.slug === 'by-tech-group')
        points.push({
          ...(format === 'portrait' ? { x: 430, y: 300 } : { x: 745, y: 220 }),
          maximumChannelError: artworkMaximumChannelError,
        });
      if (record.slug === 'u-wanna-smoothie')
        points.push({
          ...(format === 'portrait' ? { x: 339, y: 331 } : { x: 322, y: 356 }),
          maximumChannelError: artworkMaximumChannelError,
        });
      const canvasPixels = await page.locator('video').evaluate((video, coordinates) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0);
        return coordinates.map(({ x, y }) =>
          [...context.getImageData(x, y, 1, 1).data].slice(0, 3),
        );
      }, points);
      const screenshotFile = `${record.slug}-${format}-browser-color.png`;
      const screenshot = await page.screenshot({ path: path.join(output, screenshotFile) });
      const samples = [];
      for (let i = 0; i < points.length; i++) {
        const { x, y } = points[i];
        const tolerance = points[i].maximumChannelError ?? maximumChannelError;
        const sourceRGB = await rgbAt(sourceBytes, x, y);
        const screenshotRGB = await rgbAt(screenshot, x, y);
        const canvasRGB = canvasPixels[i];
        const canvasDifference = canvasRGB.map((v, index) => Math.abs(v - sourceRGB[index]));
        const screenshotDifference = screenshotRGB.map((v, index) =>
          Math.abs(v - sourceRGB[index]),
        );
        assert(
          Math.max(...canvasDifference) <= tolerance,
          `${record.slug}/${format} canvas at${x},${y}: ${canvasRGB} vs${sourceRGB}`,
        );
        assert(
          Math.max(...screenshotDifference) <= tolerance,
          `${record.slug}/${format} screenshot at${x},${y}: ${screenshotRGB} vs${sourceRGB}`,
        );
        samples.push({
          x,
          y,
          maximumChannelError: tolerance,
          sourceRGB,
          canvasRGB,
          screenshotRGB,
          canvasDifference,
          screenshotDifference,
        });
      }
      assert.deepEqual(errors, []);
      audit.exports.push({
        slug: record.slug,
        format,
        file: entry.file,
        sha256: entry.sha256,
        sourcePNG: sourceFile,
        sourcePNGSHA256: hash(sourceBytes),
        browserScreenshot: screenshotFile,
        screenshotSHA256: hash(screenshot),
        devicePixelRatio: 1,
        probe,
        videoState,
        samples,
        interceptedRequests: requests,
        externalRequests: 0,
        decodedAllFrames: entry.decodedAllFrames,
        passed: true,
      });
      await context.close();
      await save();
      const observed = Math.max(
        ...samples.flatMap((sample) => [
          ...sample.canvasDifference,
          ...sample.screenshotDifference,
        ]),
      );
      console.log(
        `Color verified ${record.slug}/${format}: ${samples.length} native source/canvas/screenshot samples; maximum observed channel error ${observed}/255 (flat limit 3, coloured-art limit 5).`,
      );
    }
  }
} finally {
  await browser.close();
}
assert.equal(audit.exports.length, 6);
await save();
