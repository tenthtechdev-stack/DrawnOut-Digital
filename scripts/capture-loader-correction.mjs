import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

/* global document, window, performance, requestAnimationFrame, getComputedStyle,
   WebGLRenderingContext, innerWidth, innerHeight, clearTimeout, setTimeout, location */

// Genuine headed production captures. Instrumentation observes CSS, real image
// visibility and draw calls; it never seeks or alters an animation clock.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4323');
const output = path.resolve(argument('--out', 'artifacts/loader-correction'));
const manifest = {
  capturedAt: new Date().toISOString(),
  baseURL,
  method:
    'Headed Chromium under an X display; native timestamped Playwright recording, real CSS visibility sampling and raw WebGL framebuffer readbacks. Software WebGL is rendering coverage, not hardware performance certification.',
  recordings: [],
  screenshots: [],
  gradients: [],
  fallbacks: [],
};
const save = () =>
  writeFile(path.join(output, 'evidence.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });
const contextOptions = (width) => ({
  viewport: viewportFor(width),
  deviceScaleFactor: 1,
  isMobile: width < 768,
  hasTouch: width < 768,
});

async function instrument(context) {
  await context.addInitScript(() => {
    const samples = [];
    const draws = [];
    Reflect.set(window, '__loaderSamples', samples);
    Reflect.set(window, '__gradientDraws', draws);
    let previous = -100;
    const observe = (now) => {
      if (now - previous >= 75 && now < 6200) {
        previous = now;
        const element = document.querySelector('[data-signature-intro-overlay]');
        const style = element && getComputedStyle(element);
        const box = element?.getBoundingClientRect();
        const visible = Boolean(
          element &&
          !element.hidden &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.1 &&
          box.width > innerWidth * 0.9 &&
          box.height > innerHeight * 0.9,
        );
        const images = visible
          ? [...element.querySelectorAll('[data-intro-artwork]')].filter(
              (image) =>
                image.complete &&
                image.naturalWidth > 0 &&
                Number(getComputedStyle(image).opacity) > 0.15,
            ).length
          : 0;
        const name = element?.querySelector('[data-intro-name]');
        const nameStyle = name && getComputedStyle(name);
        samples.push({
          at: now,
          visible,
          images,
          mode: document.documentElement.dataset.signatureIntroMode,
          state: document.documentElement.dataset.signatureIntro,
          nameOpacity: nameStyle ? Number(nameStyle.opacity) : null,
          nameClip: nameStyle?.clipPath ?? null,
        });
      }
      if (now < 6200) requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
    let capture;
    Reflect.set(
      window,
      '__readGradient',
      () =>
        new Promise((resolve, reject) => {
          const timer = window.setTimeout(() => {
            capture = undefined;
            reject(new Error('No gradient draw'));
          }, 3000);
          capture = (image) => {
            clearTimeout(timer);
            capture = undefined;
            resolve(image);
          };
        }),
    );
    const original = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = Reflect.apply(original, this, args);
      if (this.canvas?.hasAttribute('data-gradient-canvas')) {
        draws.push(performance.now());
        if (capture) {
          const { width, height } = this.canvas;
          const pixels = new Uint8Array(width * height * 4);
          this.readPixels(0, 0, width, height, this.RGBA, this.UNSIGNED_BYTE, pixels);
          const copy = document.createElement('canvas');
          copy.width = width;
          copy.height = height;
          const ctx = copy.getContext('2d');
          const image = ctx.createImageData(width, height);
          for (let row = 0; row < height; row += 1)
            image.data.set(
              pixels.subarray((height - row - 1) * width * 4, (height - row) * width * 4),
              row * width * 4,
            );
          ctx.putImageData(image, 0, 0);
          capture(copy.toDataURL('image/png'));
        }
      }
      return result;
    };
  });
}

const state = (page) =>
  page.evaluate(() => ({
    route: location.pathname,
    elapsed: performance.now(),
    state: document.documentElement.dataset.signatureIntro,
    reason: document.documentElement.dataset.signatureIntroReason,
    mode: document.documentElement.dataset.signatureIntroMode,
    fallback: document.documentElement.dataset.signatureIntroFallback,
    started: Number(document.documentElement.dataset.signatureIntroStarted),
    ended: Number(document.documentElement.dataset.signatureIntroEnded),
    samples: Reflect.get(window, '__loaderSamples'),
    gradientFrames: Reflect.get(window, '__gradientDraws')?.length,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));

async function still(page, file) {
  await page.screenshot({ path: path.join(output, file) });
  manifest.screenshots.push({ file, viewport: page.viewportSize(), state: await state(page) });
  await save();
}

async function complete(page, action, label, mode = 'full') {
  await action();
  await page.waitForFunction(
    () => ['completed', 'skipped'].includes(document.documentElement.dataset.signatureIntro),
    undefined,
    { timeout: 8000 },
  );
  const result = { label, ...(await state(page)) };
  assert.equal(result.mode, mode, `${label}: ${JSON.stringify(result)}`);
  assert.equal(result.reason, mode === 'full' ? 'complete' : 'brief-complete', label);
  assert(result.ended <= 5000, `${label}: absolute five-second maximum`);
  const visible = result.samples.filter((sample) => sample.visible);
  assert(visible.length >= (mode === 'full' ? 20 : 3), `${label}: real visible frames`);
  const visibleDuration = visible.at(-1).at - visible[0].at;
  assert(
    visibleDuration >= (mode === 'full' ? 3000 : 300),
    `${label}: visibly nontrivial interval ${visibleDuration}`,
  );
  if (mode === 'full')
    assert(
      visible.some((sample) => sample.images === 6),
      `${label}: six actually visible loaded artworks`,
    );
  assert.equal(result.overflow, false, label);
  return { ...result, visibleDuration };
}

async function readyGradient(page) {
  await page.waitForFunction(
    () =>
      document.querySelector('[data-living-gradient]')?.dataset.gradientRenderer === 'webgl' &&
      document.querySelector('[data-living-gradient]')?.dataset.gradientActive === 'true',
    undefined,
    { timeout: 15000 },
  );
  await page.evaluate(() => document.fonts.ready);
}

async function regionMetrics(buffer) {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const regions = {
    left: { pixels: 0, colourful: 0, sum: 0 },
    right: { pixels: 0, colourful: 0, sum: 0 },
  };
  for (let y = 0; y < info.height; y += 1)
    for (let x = 0; x < info.width; x += 1) {
      const region =
        x < info.width * 0.4 ? regions.left : x >= info.width * 0.6 ? regions.right : null;
      if (!region) continue;
      const i = (y * info.width + x) * info.channels;
      const c = [data[i], data[i + 1], data[i + 2]];
      region.pixels += 1;
      region.sum += (c[0] + c[1] + c[2]) / 3;
      if (Math.max(...c) - Math.min(...c) > 28) region.colourful += 1;
    }
  return Object.fromEntries(
    Object.entries(regions).map(([name, value]) => [
      name,
      {
        colourfulFraction: value.colourful / value.pixels,
        meanBrightness: value.sum / value.pixels,
      },
    ]),
  );
}

async function gradientSequence(page, width) {
  await readyGradient(page);
  let origin = await page.evaluate(() => performance.now());
  const frames = [];
  for (const seconds of [0, 2, 5, 8]) {
    await page.waitForFunction((target) => performance.now() >= target, origin + seconds * 1000);
    const data = Buffer.from(
      (await page.evaluate(() => Reflect.get(window, '__readGradient')())).split(',')[1],
      'base64',
    );
    const canvas = `gradient-${width}-${seconds}s-canvas.png`;
    await writeFile(path.join(output, canvas), data);
    const metrics = await regionMetrics(data);
    assert(
      metrics.left.colourfulFraction < 0.08,
      'Left forty percent must remain predominantly cream',
    );
    assert(metrics.right.colourfulFraction > 0.3, 'Right forty percent must carry the fluid color');
    await still(page, `hero-${width}-${seconds}s.png`);
    frames.push({
      seconds,
      canvas,
      metrics,
      at: await page.evaluate(() => performance.now()),
      renderedFrames: await page.evaluate(() => Reflect.get(window, '__gradientDraws').length),
    });
    // Measure the continuous hold from the first completed capture, accounting
    // for screenshot/readback overhead without altering the animation clock.
    if (seconds === 0) origin = frames[0].at;
  }
  assert(frames.at(-1).at - frames[0].at >= 8000, 'Eight uninterrupted seconds of actual motion');
  assert(
    frames.at(-1).renderedFrames > frames[0].renderedFrames + 100,
    'Continuously rendering gradient',
  );
  const first = await sharp(await readFile(path.join(output, frames[0].canvas)))
    .resize(160, 100)
    .removeAlpha()
    .raw()
    .toBuffer();
  const last = await sharp(await readFile(path.join(output, frames.at(-1).canvas)))
    .resize(160, 100)
    .removeAlpha()
    .raw()
    .toBuffer();
  let difference = 0;
  let count = 0;
  for (let y = 0; y < 100; y += 1)
    for (let x = 96; x < 160; x += 1)
      for (let c = 0; c < 3; c += 1) {
        const index = (y * 160 + x) * 3 + c;
        difference += Math.abs(first[index] - last[index]);
        count += 1;
      }
  const rightMeanChange = difference / count;
  assert(rightMeanChange > 2, 'Right-side field must visibly change');
  const result = { width, stationaryPointer: true, origin, frames, rightMeanChange };
  manifest.gradients.push(result);
  await save();
  return result;
}

async function ordinaryLink(page, width, route) {
  if (width < 768) {
    await page.locator('[data-menu-trigger]').click();
    await page.locator(`[data-site-menu] .mobile-nav a[href="${route}"]`).click();
  } else await page.locator(`[data-site-header] .primary-nav a[href="${route}"]`).click();
  await page.waitForURL((url) => url.pathname === route);
  await page.waitForTimeout(350);
  const result = await state(page);
  assert.equal(result.reason, 'internal-navigation');
  assert(
    !result.samples.some((sample) => sample.visible),
    'Non-home internal navigation remains immediate',
  );
  return result;
}

async function encode(video, label, width) {
  const file = `${label}.mp4`;
  const gif = `${label}.gif`;
  execFileSync('/usr/bin/ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    await video.path(),
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    path.join(output, file),
  ]);
  execFileSync('/usr/bin/ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    path.join(output, file),
    '-t',
    '14',
    '-filter_complex',
    `[0:v]fps=7,scale=${Math.min(width, 640)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`,
    '-loop',
    '0',
    path.join(output, gif),
  ]);
  const probe = JSON.parse(
    execFileSync(
      '/usr/bin/ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'stream=codec_name,width,height:format=duration,size',
        '-of',
        'json',
        path.join(output, file),
      ],
      { encoding: 'utf8' },
    ),
  );
  return { file, gif, probe, bytes: (await stat(path.join(output, file))).size };
}

async function journey(browser, width) {
  const raw = await mkdtemp(path.join(tmpdir(), 'drawnout-correction-'));
  const context = await browser.newContext({
    ...contextOptions(width),
    recordVideo: { dir: raw, size: viewportFor(width) },
  });
  await instrument(context);
  const page = await context.newPage();
  const video = page.video();
  const intros = [];
  const navigation = [];
  const segments = [];
  const origin = Date.now();
  const mark = (label) => segments.push({ label, seconds: (Date.now() - origin) / 1000 });
  let error;
  try {
    mark('Fresh tab, cold browser cache: full approved introduction');
    intros.push(await complete(page, () => page.goto(baseURL, { waitUntil: 'commit' }), 'direct'));
    mark('Stationary pointer: eight continuous seconds of right-side fluid gradient');
    await gradientSequence(page, width);
    for (const refresh of [1, 2]) {
      mark(`Manual refresh ${refresh}`);
      intros.push(
        await complete(page, () => page.reload({ waitUntil: 'commit' }), `refresh-${refresh}`),
      );
      await page.waitForTimeout(400);
    }
    for (const route of ['/contact', '/work']) {
      mark(`Immediate internal ${route} navigation`);
      navigation.push(await ordinaryLink(page, width, route));
      await page.waitForTimeout(600);
      mark(`Home/logo from ${route}: full approved introduction`);
      intros.push(
        await complete(
          page,
          () => page.locator('[data-site-header] a[aria-label="DrawnOut Digital home"]').click(),
          `${route}-home`,
        ),
      );
      await page.waitForTimeout(500);
    }
    if (width >= 768) {
      await readyGradient(page);
      mark('Gentle desktop cursor response');
      await page.mouse.move(width * 0.9, 640, { steps: 18 });
      await page.waitForTimeout(900);
      await page.mouse.move(width * 0.2, 400, { steps: 18 });
      await page.waitForTimeout(900);
    }
  } catch (cause) {
    error = cause;
  } finally {
    await context.close();
  }
  const media = await encode(
    video,
    width < 768 ? 'mobile-loader-gradient' : 'desktop-loader-gradient',
    width,
  );
  manifest.recordings.push({
    ...media,
    width,
    segments,
    intros,
    navigation,
    rawRecordingDirectory: raw,
    complete: !error,
    error: error?.message,
  });
  await save();
  if (error) throw error;
}

async function fallbacks(browser, width) {
  const raw = await mkdtemp(path.join(tmpdir(), 'drawnout-fallback-'));
  const context = await browser.newContext({
    ...contextOptions(width),
    recordVideo: { dir: raw, size: viewportFor(width) },
  });
  await instrument(context);
  const page = await context.newPage();
  const video = page.video();
  const results = [];
  let error;
  try {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'document')
        await new Promise((resolve) => setTimeout(resolve, 1300));
      await route.continue();
    });
    results.push(
      await complete(
        page,
        () => page.goto(baseURL, { waitUntil: 'commit' }),
        '1300ms delayed HTML',
        'brief',
      ),
    );
    await still(page, `fallback-${width}-released.png`);
    await page.unrouteAll();
    await page.reload({ waitUntil: 'commit' });
    await page.locator('[data-signature-skip]').waitFor({ state: 'visible' });
    const skipAt = await page.evaluate(() => performance.now());
    await page.locator('[data-signature-skip]').click();
    await page.locator('[data-signature-intro-overlay]').waitFor({ state: 'hidden' });
    const skipped = await state(page);
    assert.equal(skipped.reason, 'skip');
    assert(skipped.ended - skipAt < 500);
    results.push({ label: 'Early skip control', ...skipped });
    await page.waitForTimeout(750);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForTimeout(700);
    const reduced = await state(page);
    assert.equal(reduced.reason, 'reduced-motion');
    assert(!reduced.samples.some((sample) => sample.visible));
    results.push({ label: 'Reduced motion immediate homepage', ...reduced });
    await still(page, `reduced-motion-${width}.png`);
  } catch (cause) {
    error = cause;
  } finally {
    await context.close();
  }
  const media = await encode(video, `fallbacks-${width}`, width);
  manifest.fallbacks.push({
    ...media,
    width,
    results,
    rawRecordingDirectory: raw,
    complete: !error,
    error: error?.message,
  });
  await save();
  if (error) throw error;
}

await mkdir(output, { recursive: true });
assert(process.env.DISPLAY, 'A real X display is required for headed production evidence');
const browser = await chromium.launch({
  headless: false,
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: [
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-backgrounding-occluded-windows',
  ],
});
try {
  for (const width of [1440, 390]) {
    await journey(browser, width);
    await fallbacks(browser, width);
  }
} finally {
  await browser.close();
  await save();
}
console.log(
  JSON.stringify({
    output,
    recordings: manifest.recordings.length,
    fallbacks: manifest.fallbacks.length,
    screenshots: manifest.screenshots.length,
  }),
);
