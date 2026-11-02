import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

/* global document, window, performance, requestAnimationFrame, MutationObserver,
   WebGLRenderingContext, HTMLCanvasElement, getComputedStyle, scrollY, innerHeight */

// Observe real browser animation and native scroll. No animation timeline is sought,
// paused or altered. The only injected instrumentation counts rendered frames and
// records loader-state changes; it cannot make a failed application check pass.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', process.env.MOTION_BASE_URL ?? 'http://127.0.0.1:4323');
const output = path.resolve(argument('--out', 'artifacts/loading-milestone'));
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe';
const manifestFile = path.join(output, 'loading-evidence.json');
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });
const contextOptions = (width) => ({
  viewport: viewportFor(width),
  deviceScaleFactor: 1,
  isMobile: width <= 768,
  hasTouch: width <= 768,
});
const manifest = {
  baseURL,
  capturedAt: new Date().toISOString(),
  method:
    'Browser screenshots, separately identified raw shader readbacks, and native timestamped Playwright video. Labelled reduced-motion footer section captures hide the sticky header; other screenshots retain the normal page composition. Widths 320/390/768 emulate touch/coarse pointer at DPR1. Software WebGL exercises the real production shader; this is not a physical-device GPU benchmark.',
  screenshots: [],
  gradientSeries: [],
  recordings: [],
};
const save = () => writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

async function instrument(context) {
  await context.addInitScript(() => {
    const states = [];
    const frames = [];
    Object.defineProperty(window, '__captureIntroStates', { value: states });
    Object.defineProperty(window, '__captureGradientFrames', { value: frames });
    const observer = new MutationObserver(() => {
      const state = document.documentElement?.dataset.signatureIntro;
      if (state && states.at(-1)?.state !== state) states.push({ state, at: performance.now() });
    });
    observer.observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-signature-intro'],
    });
    let readback;
    Object.defineProperty(window, '__captureNextGradientPNG', {
      value: () =>
        new Promise((resolve, reject) => {
          const deadline = window.setTimeout(() => {
            readback = undefined;
            reject(new Error('Production gradient did not render a frame for capture'));
          }, 3000);
          readback = (image) => {
            window.clearTimeout(deadline);
            resolve(image);
          };
        }),
    });
    const original = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = Reflect.apply(original, this, args);
      if (this.canvas?.hasAttribute('data-gradient-canvas')) {
        frames.push(performance.now());
        if (readback) {
          // Read the genuine next rendered frame before the non-preserved GPU
          // buffer is cleared. This diagnostic copy never redraws or seeks it.
          const { width, height } = this.canvas;
          const pixels = new Uint8Array(width * height * 4);
          this.readPixels(0, 0, width, height, this.RGBA, this.UNSIGNED_BYTE, pixels);
          const copy = document.createElement('canvas');
          copy.width = width;
          copy.height = height;
          const context = copy.getContext('2d');
          const image = context.createImageData(width, height);
          for (let row = 0; row < height; row += 1) {
            image.data.set(
              pixels.subarray((height - 1 - row) * width * 4, (height - row) * width * 4),
              row * width * 4,
            );
          }
          context.putImageData(image, 0, 0);
          readback(copy.toDataURL('image/png'));
          readback = undefined;
        }
      }
      return result;
    };
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const gradient = document.querySelector('[data-living-gradient]');
    const canvas = gradient?.querySelector('canvas');
    const footer = document.querySelector('[data-site-footer]');
    const overlay = document.querySelector('[data-signature-intro-overlay]');
    const animation = overlay
      ?.getAnimations()
      .find((item) => item.animationName?.includes('intro-exit'));
    return {
      navigationMs: performance.now(),
      intro: root.dataset.signatureIntro ?? null,
      reason: root.dataset.signatureIntroReason ?? null,
      startedMs: Number(root.dataset.signatureIntroStarted) || null,
      endedMs: Number(root.dataset.signatureIntroEnded) || null,
      cssTimeMs: typeof animation?.currentTime === 'number' ? animation.currentTime : null,
      introStates: window.__captureIntroStates ?? [],
      gradientRenderer: gradient?.dataset.gradientRenderer ?? null,
      gradientActive: gradient?.dataset.gradientActive ?? null,
      gradientFrames: window.__captureGradientFrames?.length ?? 0,
      canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
      footerMotion: footer?.dataset.footerMotion ?? null,
      footerProgress: Number(footer?.dataset.footerProgress) || 0,
      footerPhase: footer?.dataset.footerPhase ?? null,
      scrollY,
      horizontalOverflow: root.scrollWidth > window.innerWidth,
    };
  });
}

async function screenshot(page, file, details = {}, target, options = {}) {
  const before = await snapshot(page);
  const data = target
    ? await target.screenshot({ path: path.join(output, file), ...options })
    : await page.screenshot({ path: path.join(output, file), ...options });
  const after = await snapshot(page);
  assert.equal(after.horizontalOverflow, false, `${file} must not overflow`);
  const entry = {
    file,
    route: new URL(page.url()).pathname,
    viewport: page.viewportSize(),
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
    ...details,
    before,
    after,
  };
  manifest.screenshots.push(entry);
  await save();
  return { data, entry };
}

async function rawGradientFrame(page, file, details) {
  const before = await snapshot(page);
  const url = await page.evaluate(() => window.__captureNextGradientPNG());
  const data = Buffer.from(url.split(',')[1], 'base64');
  await writeFile(path.join(output, file), data);
  const entry = {
    file,
    route: new URL(page.url()).pathname,
    viewport: page.viewportSize(),
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
    method: 'Raw production shader framebuffer read immediately after its own next draw',
    ...details,
    before,
    after: await snapshot(page),
  };
  manifest.screenshots.push(entry);
  await save();
  return { data, entry };
}

async function completeIntro(page, load) {
  await load();
  await page.waitForFunction(() =>
    ['playing', 'completed', 'skipped'].includes(document.documentElement.dataset.signatureIntro),
  );
  await page.waitForFunction(
    () => ['completed', 'skipped'].includes(document.documentElement.dataset.signatureIntro),
    undefined,
    { timeout: 8000 },
  );
  assert.equal(await page.locator('[data-intro-replay]').count(), 0, 'No production replay UI');
  assert.equal(await page.locator('.phase-notice').count(), 0, 'No production review banner');
  const state = await snapshot(page);
  assert.equal(
    state.reason,
    'complete',
    `Unexpected introduction result: ${JSON.stringify(state)}`,
  );
  assert(state.startedMs > 0 && state.endedMs <= 5000, 'Full intro must meet navigation deadline');
  assert(state.endedMs - state.startedMs >= 4100, 'Record the full approved sequence');
  assert(state.introStates.some((entry) => entry.state === 'playing'));
  return state;
}

async function readyGradient(page) {
  await page.waitForFunction(
    () =>
      document.querySelector('[data-living-gradient]')?.dataset.gradientRenderer === 'webgl' &&
      document.querySelector('[data-living-gradient]')?.dataset.gradientActive === 'true',
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  const state = await snapshot(page);
  assert.equal(state.gradientRenderer, 'webgl');
  assert(state.canvas.width <= 720 && state.canvas.height <= 800, 'Canvas resolution budget');
  return state;
}

async function comparePixels(first, second) {
  const a = await sharp(first).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(second).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(a.info, b.info);
  const { width, height, channels } = a.info;
  const regions = Array.from({ length: 4 }, () => ({ pixels: 0, changed: 0, difference: 0 }));
  let difference = 0;
  let changed = 0;
  let colourful = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const deltas = [0, 1, 2].map((channel) =>
        Math.abs(a.data[index + channel] - b.data[index + channel]),
      );
      const mean = deltas.reduce((sum, value) => sum + value, 0) / 3;
      const hasChanged = Math.max(...deltas) > 10;
      const values = [b.data[index], b.data[index + 1], b.data[index + 2]];
      if (Math.max(...values) - Math.min(...values) > 28) colourful += 1;
      difference += mean;
      if (hasChanged) changed += 1;
      const region = regions[(y >= height / 2 ? 2 : 0) + (x >= width / 2 ? 1 : 0)];
      region.pixels += 1;
      region.difference += mean;
      if (hasChanged) region.changed += 1;
    }
  }
  const pixels = width * height;
  return {
    width,
    height,
    meanChannelDifference: difference / pixels,
    changedFraction: changed / pixels,
    colourfulFraction: colourful / pixels,
    quadrants: regions.map((region, index) => ({
      name: ['top-left', 'top-right', 'bottom-left', 'bottom-right'][index],
      meanChannelDifference: region.difference / region.pixels,
      changedFraction: region.changed / region.pixels,
    })),
  };
}

async function gradientStills(browser, width) {
  const context = await browser.newContext(contextOptions(width));
  await instrument(context);
  try {
    const page = await context.newPage();
    const intro = await completeIntro(page, () => page.goto(baseURL, { waitUntil: 'commit' }));
    const ready = await readyGradient(page);
    const origin = await page.evaluate(() => performance.now());
    const captures = [];
    for (const seconds of [0, 2, 5]) {
      await page.waitForFunction((target) => performance.now() >= target, origin + seconds * 1000);
      const canvas = await rawGradientFrame(page, `gradient-${width}-${seconds}s-canvas.png`, {
        label: `Actual WebGL pixels at approximately ${seconds}s after renderer readiness`,
        seconds,
      });
      await screenshot(page, `hero-${width}-${seconds}s.png`, {
        label: `Hero at approximately ${seconds}s after renderer readiness`,
        seconds,
      });
      captures.push(canvas);
    }
    const comparisons = [];
    for (const [from, to] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      const metrics = await comparePixels(captures[from].data, captures[to].data);
      assert(metrics.changedFraction > 0.03, 'Gradient must have measurable visible change');
      comparisons.push({ fromSeconds: [0, 2, 5][from], toSeconds: [0, 2, 5][to], ...metrics });
    }
    const draws = await page.evaluate(() => window.__captureGradientFrames);
    manifest.gradientSeries.push({
      width,
      intro,
      ready,
      originMs: origin,
      comparisons,
      drawTimesMs: draws,
    });
    await save();
  } finally {
    await context.close();
  }
}

async function smoothScroll(page, target, duration) {
  await page.evaluate(
    ({ target, duration }) =>
      new Promise((resolve) => {
        const from = scrollY;
        const to = Math.max(
          0,
          Math.min(target, document.documentElement.scrollHeight - innerHeight),
        );
        const start = performance.now();
        function step(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = progress * progress * (3 - 2 * progress);
          window.scrollTo(0, from + (to - from) * eased);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    { target, duration },
  );
}

async function footerProgress(page, progress, duration = 850) {
  const footer = page.locator('[data-site-footer]');
  await page.waitForFunction(
    () => document.querySelector('[data-site-footer]')?.dataset.footerMotion === 'ready',
  );
  const range = await footer.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      start: box.top + scrollY - innerHeight * 0.92,
      end: box.bottom + scrollY - innerHeight,
    };
  });
  await smoothScroll(page, range.start + (range.end - range.start) * progress, duration);
  await page.waitForFunction(
    (value) =>
      Math.abs(
        Number(document.querySelector('[data-site-footer]')?.dataset.footerProgress) - value,
      ) < 0.035,
    progress,
  );
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-site-footer] img')].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  // Allow the real scrub interpolation to converge without changing its clock.
  await page.waitForTimeout(450);
  return snapshot(page);
}

async function verifyFooter(page) {
  const footer = page.locator('[data-site-footer]');
  for (const href of [
    'https://www.facebook.com/DrawnOutDigital/',
    'https://www.instagram.com/drawnout_digital/',
    'https://www.linkedin.com/company/drawnout-digital/',
  ]) {
    const link = footer.locator(`a[href="${href}"]`);
    assert.equal(await link.count(), 1);
    const box = await link.boundingBox();
    assert(box && box.width >= 44 && box.height >= 44, 'Social targets must be at least 44px');
  }
  assert(
    (await footer.innerText())
      .replace(/\s+/g, ' ')
      .includes('Designed and Developed by Tenth Tech'),
  );
  assert.equal(
    await footer.locator('a[href="https://www.thetenthtech.com/"]').innerText(),
    'Tenth Tech',
  );
}

async function footerStills(browser, width) {
  const context = await browser.newContext(contextOptions(width));
  await instrument(context);
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/#main`);
    await page.evaluate(() => document.fonts.ready);
    for (const [label, progress] of [
      ['arrive', 0.12],
      ['hold', 0.55],
      ['expand', 0.98],
      ['reverse', 0.16],
    ]) {
      const state = await footerProgress(page, progress);
      await screenshot(page, `footer-${width}-${label}.png`, {
        label: `Native scroll footer ${label}`,
        targetProgress: progress,
        state,
      });
    }
    await footerProgress(page, 0.995);
    await verifyFooter(page);
    await screenshot(page, `footer-${width}-links.png`, {
      label: 'Footer social icons and exact development credit',
    });
  } finally {
    await context.close();
  }
  const staticContext = await browser.newContext({
    ...contextOptions(width),
    reducedMotion: 'reduce',
  });
  try {
    const page = await staticContext.newPage();
    await page.goto(`${baseURL}/contact`);
    await page.evaluate(() => document.fonts.ready);
    const footer = page.locator('[data-site-footer]');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-site-footer] img')].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    await verifyFooter(page);
    await screenshot(
      page,
      `footer-${width}-static.png`,
      {
        label:
          'Complete reduced-motion footer section; sticky header omitted from this section capture',
        reducedMotion: true,
        omittedStickyHeader: true,
      },
      footer,
      { style: '[data-site-header] { visibility: hidden !important; }' },
    );
  } finally {
    await staticContext.close();
  }
}

async function openingStills(browser, width) {
  for (const [label, time] of [
    ['mid-wave', 1450],
    ['all-artwork', 2180],
  ]) {
    const context = await browser.newContext(contextOptions(width));
    await instrument(context);
    try {
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await page.goto(baseURL, { waitUntil: 'commit' });
      await page.waitForFunction((target) => {
        const overlay = document.querySelector('[data-signature-intro-overlay]');
        const animation = overlay
          ?.getAnimations()
          .find((entry) => entry.animationName?.includes('intro-exit'));
        return typeof animation?.currentTime === 'number' && animation.currentTime >= target;
      }, time);
      const before = await snapshot(page);
      assert.equal(before.intro, 'playing');
      assert(
        before.cssTimeMs < (label === 'mid-wave' ? 1850 : 2350),
        'Capture must observe the live scene',
      );
      const posters = await page.locator('[data-intro-artwork]').evaluateAll((images) =>
        images.map((image) => ({
          slug: image.closest('[data-intro-project]')?.dataset.introProject,
          src: image.currentSrc,
          loaded: image.complete && image.naturalWidth > 0,
          opacity: Number(getComputedStyle(image).opacity),
        })),
      );
      assert.equal(posters.length, 6);
      assert.equal(new Set(posters.map((image) => image.src)).size, 6);
      assert(posters.some((image) => image.slug === 'sol-community-center'));
      assert(posters.every((image) => image.loaded));
      if (label === 'all-artwork') assert(posters.every((image) => image.opacity > 0.99));
      const file = `opening-${width}-${label}.png`;
      const result = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true,
      });
      const data = Buffer.from(result.data, 'base64');
      await writeFile(path.join(output, file), data);
      manifest.screenshots.push({
        file,
        viewport: viewportFor(width),
        width: data.readUInt32BE(16),
        height: data.readUInt32BE(20),
        bytes: data.length,
        sha256: createHash('sha256').update(data).digest('hex'),
        before,
        after: await snapshot(page),
        posters,
      });
      await save();
    } finally {
      await context.close();
    }
  }
}

async function fallbackStill(browser) {
  const context = await browser.newContext({ viewport: viewportFor(1440) });
  await instrument(context);
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl') return null;
      return Reflect.apply(original, this, [type, ...args]);
    };
  });
  try {
    const page = await context.newPage();
    await completeIntro(page, () => page.goto(baseURL, { waitUntil: 'commit' }));
    await page.waitForFunction(
      () => document.querySelector('[data-living-gradient]')?.dataset.gradientRenderer === 'css',
    );
    await screenshot(page, 'hero-1440-css-fallback.png', {
      label: 'Actual CSS fallback when the GPU context is unavailable',
      injectedCapabilityFailure: 'webgl context returns null',
    });
  } finally {
    await context.close();
  }
}

async function internalNavigation(page, action, expectedRoute) {
  await Promise.all([page.waitForURL((url) => url.pathname === expectedRoute), action()]);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const state = await snapshot(page);
  assert(
    !state.introStates.some((entry) => ['pending', 'playing'].includes(entry.state)),
    'Internal navigation must not play the full loader',
  );
  assert.equal(state.reason, 'internal-navigation');
  return state;
}

async function recordJourney(browser, width, label) {
  const raw = await mkdtemp(path.join(tmpdir(), 'drawnout-loading-video-'));
  const viewport = viewportFor(width);
  const context = await browser.newContext({
    ...contextOptions(width),
    recordVideo: { dir: raw, size: viewport },
  });
  await instrument(context);
  const page = await context.newPage();
  const video = page.video();
  const origin = Date.now();
  const segments = [];
  const intros = [];
  const navigations = [];
  const mark = (name) =>
    segments.push({ label: name, elapsedFromPageCreationSeconds: (Date.now() - origin) / 1000 });
  let closing;
  try {
    mark('initial full document load');
    intros.push(await completeIntro(page, () => page.goto(baseURL, { waitUntil: 'commit' })));
    await readyGradient(page);
    mark('stationary living WebGL gradient');
    await page.waitForTimeout(5200);
    if (width >= 768) {
      mark('gentle desktop pointer influence');
      await page.mouse.move(width * 0.83, viewport.height * 0.56, { steps: 22 });
      await page.waitForTimeout(800);
      await page.mouse.move(width * 0.14, viewport.height * 0.62, { steps: 22 });
      await page.waitForTimeout(800);
      await page.mouse.move(width / 2, 20, { steps: 12 });
    }
    for (const refresh of [1, 2]) {
      mark(`manual refresh ${refresh} replays complete loader`);
      intros.push(await completeIntro(page, () => page.reload({ waitUntil: 'commit' })));
      await readyGradient(page);
      await page.waitForTimeout(900);
    }
    mark('internal Work navigation without full loader');
    navigations.push(
      await internalNavigation(
        page,
        () => page.locator('.hero-actions a[href="/work"]').click(),
        '/work',
      ),
    );
    mark('internal Contact navigation preserves enquiry page');
    navigations.push(
      await internalNavigation(
        page,
        async () => {
          if (width < 768) {
            await page.locator('[data-menu-trigger]').click();
            await page.locator('[data-site-menu] .mobile-nav a[href="/contact"]').click();
          } else {
            await page.locator('[data-site-header] .primary-nav a[href="/contact"]').click();
          }
        },
        '/contact',
      ),
    );
    assert.equal(await page.locator('[data-enquiry-form]').getAttribute('data-endpoint'), '');
    await page.waitForTimeout(900);
    mark('internal return home without full loader');
    navigations.push(
      await internalNavigation(
        page,
        () => page.locator('[data-site-header] a[href="/"]').first().click(),
        '/',
      ),
    );
    await readyGradient(page);
    mark('native scrolling to footer arrival');
    await footerProgress(page, 0.12, 2600);
    mark('footer hand and plaque meet and expand');
    await footerProgress(page, 0.995, 2500);
    await verifyFooter(page);
    await page.waitForTimeout(1300);
    mark('reverse scrolling reverses footer choreography');
    await footerProgress(page, 0.16, 2300);
    mark('footer links and exact Tenth Tech credit');
    await footerProgress(page, 0.995, 2200);
    await page.waitForTimeout(1200);
    closing = await snapshot(page);
  } finally {
    await context.close();
  }
  try {
    const source = await video.path();
    const file = `${label}-loading-experience.mp4`;
    const gif = `${label}-loading-preview.gif`;
    execFileSync(ffmpeg, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      source,
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
    execFileSync(ffmpeg, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      path.join(output, file),
      '-t',
      '10',
      '-filter_complex',
      `[0:v]fps=7,scale=${Math.min(width, 640)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`,
      '-loop',
      '0',
      path.join(output, gif),
    ]);
    const probe = JSON.parse(
      execFileSync(
        ffprobe,
        [
          '-v',
          'error',
          '-show_entries',
          'stream=codec_name,width,height,r_frame_rate:format=duration,size',
          '-of',
          'json',
          path.join(output, file),
        ],
        { encoding: 'utf8' },
      ),
    );
    manifest.recordings.push({
      file,
      gif,
      viewport,
      bytes: (await stat(path.join(output, file))).size,
      method:
        'Native Playwright timestamped browser video; complete H.264 transcode; no timeline seeking',
      probe,
      segments,
      intros,
      navigations,
      closing,
    });
    await save();
  } finally {
    await rm(raw, { recursive: true, force: true });
  }
}

await mkdir(output, { recursive: true });
if (process.argv.includes('--recordings-only')) {
  const existing = JSON.parse(await readFile(manifestFile, 'utf8'));
  manifest.screenshots = existing.screenshots;
  manifest.gradientSeries = existing.gradientSeries;
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const warm = await browser.newContext();
  try {
    const page = await warm.newPage();
    await page.goto(`${baseURL}/#main`);
    await page.evaluate(() => document.fonts.ready);
    await readyGradient(page);
  } finally {
    await warm.close();
  }
  if (!process.argv.includes('--recordings-only')) {
    for (const width of [320, 390, 768, 1440]) await gradientStills(browser, width);
    for (const width of [390, 1440]) await openingStills(browser, width);
    for (const width of [390, 768, 1440]) await footerStills(browser, width);
    await fallbackStill(browser);
  }
  if (!process.argv.includes('--stills-only')) {
    await recordJourney(browser, 1440, 'desktop');
    await recordJourney(browser, 390, 'mobile');
  }
} finally {
  await browser.close();
}
await save();
console.log(
  JSON.stringify(
    {
      manifestFile,
      screenshots: manifest.screenshots.length,
      gradientSeries: manifest.gradientSeries.length,
      recordings: manifest.recordings.length,
    },
    null,
    2,
  ),
);
