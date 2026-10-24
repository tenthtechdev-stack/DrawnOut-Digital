import { chromium } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { clearInterval, setInterval } from 'node:timers';

/* global document, window, getComputedStyle, performance, requestAnimationFrame, PerformanceObserver, innerHeight, scrollY */
// Browser globals below are used only inside Playwright's page-evaluation callbacks.

// Record the real Chromium compositor. No app animation state is mocked or sought.
const baseURL = process.env.MOTION_BASE_URL ?? 'http://127.0.0.1:4321';
const outputArgument = process.argv.indexOf('--out');
const output = path.resolve(
  outputArgument >= 0 ? process.argv[outputArgument + 1] : 'artifacts/signature',
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const fps = 30;
const manifest = { baseURL, recordedAt: new Date().toISOString(), screenshots: [], recordings: [] };
const manifestFile = path.join(output, 'signature-evidence.json');
const saveManifest = () => writeFile(manifestFile, JSON.stringify(manifest, null, 2));

async function settle(page) {
  await page.waitForFunction(() => document.documentElement.dataset.motionState === 'ready');
  await page.evaluate(() => document.fonts.ready);
  // The module becomes ready before its debounced font/image refresh completes.
  await page.waitForFunction(
    () => window.__drawnoutMotion.refreshCount > 0 && window.__drawnoutMotion.sceneCount > 0,
  );
}

async function open(page, route) {
  await page.goto(new URL(route, baseURL).href);
  await settle(page);
}

async function selectedScene(page, selector) {
  await page.waitForFunction((selector) => {
    const scenes = window.__drawnoutMotion.scenes;
    return [...document.querySelectorAll(`${selector} [data-motion-scene]`)].some((media) => {
      const scene = scenes.find((entry) => entry.id === Number(media.dataset.motionScene));
      return scene && Number.isFinite(scene.start) && scene.start >= 0 && scene.end > scene.start;
    });
  }, selector);
  const scenes = await page.evaluate(() => window.__drawnoutMotion.scenes);
  for (const media of await page.locator(`${selector} [data-motion-scene]`).all()) {
    const id = Number(await media.getAttribute('data-motion-scene'));
    const scene = scenes.find((entry) => entry.id === id);
    if (scene && scene.start >= 0 && scene.end > scene.start) return { media, scene };
  }
  throw new Error(`No completely scrollable range for ${selector}`);
}

async function atProgress(page, media, scene, progress) {
  const currentScene = await page.evaluate(
    (id) => window.__drawnoutMotion.scenes.find((entry) => entry.id === id),
    scene.id,
  );
  if (!currentScene) throw new Error(`Scene ${scene.id} disappeared before native scroll`);
  await page.evaluate(
    ({ start, end, progress }) => window.scrollTo(0, start + (end - start) * progress),
    { ...currentScene, progress },
  );
  await page.waitForFunction(
    ({ id, progress }) => {
      const element = document.querySelector(`[data-motion-scene="${id}"]`);
      return element && Math.abs(Number(element.dataset.motionProgress) - progress) < 0.035;
    },
    { id: scene.id, progress },
  );
  await media.locator('img').first().waitFor({ state: 'attached' });
  await page.waitForFunction((id) => {
    const image = document.querySelector(`[data-motion-scene="${id}"] img`);
    return image?.complete && image.naturalWidth > 0;
  }, scene.id);
}

async function sceneScreenshot(page, cdp, media, scene, progress, file) {
  await atProgress(page, media, scene, progress);
  const before = await media.evaluate((element) => {
    const rectangle = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      progress: Number(element.dataset.motionProgress),
      scrollY: window.scrollY,
      clipPath: style.clipPath,
      borderRadius: style.borderRadius,
      clip: {
        x: rectangle.left + window.scrollX,
        y: rectangle.top + window.scrollY,
        width: rectangle.width,
        height: rectangle.height,
        scale: 1,
      },
    };
  });
  // Capture the actual viewport. Enlarging the viewport to fit a whole image
  // can trigger responsive/ScrollTrigger refresh and alter the scene being proved.
  const image = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  });
  await writeFile(path.join(output, file), Buffer.from(image.data, 'base64'));
  const after = Number(await media.getAttribute('data-motion-progress'));
  if (Math.abs(after - before.progress) > 0.04) {
    throw new Error(`Screenshot changed actual scroll progress for ${file}`);
  }
  const currentScene = await page.evaluate(
    (id) => window.__drawnoutMotion.scenes.find((entry) => entry.id === id),
    scene.id,
  );
  return {
    file,
    intendedProgress: progress,
    actualProgress: after,
    scene: currentScene,
    ...before,
  };
}

async function smoothScroll(page, target, duration) {
  await page.evaluate(
    ({ target, duration }) =>
      new Promise((resolve) => {
        const from = window.scrollY;
        const to = Math.max(
          0,
          Math.min(target, document.documentElement.scrollHeight - window.innerHeight),
        );
        const started = performance.now();
        function step(now) {
          const p = Math.min(1, (now - started) / duration);
          const eased = p * p * (3 - 2 * p);
          window.scrollTo(0, from + (to - from) * eased);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    { target, duration },
  );
}

async function realCompositorRecorder(context, page, file, viewport) {
  const encoder = spawn(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'image2pipe',
      '-vcodec',
      'mjpeg',
      '-r',
      String(fps),
      '-i',
      'pipe:0',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '26',
      '-vf',
      'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      path.join(output, file),
    ],
    { stdio: ['pipe', 'ignore', 'pipe'] },
  );
  let encoderErrors = '';
  let encoderFailure;
  encoder.stderr.on('data', (chunk) => {
    encoderErrors += chunk.toString();
  });
  encoder.on('error', (error) => {
    encoderFailure = error;
  });
  encoder.stdin.on('error', (error) => {
    encoderFailure = error;
  });
  const finished = new Promise((resolve, reject) => {
    encoder.on('close', (code) => (code === 0 ? resolve() : reject(new Error(encoderErrors))));
    encoder.on('error', reject);
  });
  // Keep failures observable when finalizing without an early unhandled rejection.
  void finished.catch(() => {});
  const cdp = await context.newCDPSession(page);
  let latest;
  let frames = 0;
  let backpressureFrames = 0;
  let captureStarted;
  cdp.on('Page.screencastFrame', (event) => {
    latest = Buffer.from(event.data, 'base64');
    captureStarted ??= Date.now();
    void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 88,
    maxWidth: viewport.width,
    maxHeight: viewport.height,
    everyNthFrame: 1,
  });
  const started = Date.now();
  const timer = setInterval(() => {
    if (!latest || encoderFailure || captureStarted === undefined) return;
    // Preserve real elapsed time even when the capture timer or encoder stalls.
    // Repeated frames represent the last actual compositor output, never a sought pose.
    const due = Math.floor(((Date.now() - captureStarted) / 1000) * fps);
    while (frames < due) {
      if (encoder.stdin.writableNeedDrain) {
        backpressureFrames += 1;
        break;
      }
      encoder.stdin.write(latest);
      frames += 1;
    }
  }, 1000 / fps);
  return async () => {
    clearInterval(timer);
    await cdp.send('Page.stopScreencast').catch(() => {});
    encoder.stdin.end();
    await finished;
    return { wallSeconds: (Date.now() - started) / 1000, frames, fps, backpressureFrames };
  };
}

async function createPreview(file, viewport, segments) {
  const gif = file.replace(/\.mp4$/, '-preview.gif');
  const start = segments.find((segment) => segment.label.endsWith('forward'))?.seconds ?? 4;
  let preview;
  // All previews sample actual completed recordings; reduce color/fps only when needed.
  for (const [framesPerSecond, paletteColors] of [
    [7, 128],
    [6, 96],
    [6, 64],
    [5, 64],
  ]) {
    execFileSync(ffmpeg, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-ss',
      String(start),
      '-t',
      '8',
      '-i',
      path.join(output, file),
      '-filter_complex',
      `[0:v]fps=${framesPerSecond},scale=${Math.min(640, viewport.width)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${paletteColors}[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`,
      '-loop',
      '0',
      path.join(output, gif),
    ]);
    preview = {
      gif,
      gifBytes: (await stat(path.join(output, gif))).size,
      gifSegment: { start, duration: 8 },
      gifFramesPerSecond: framesPerSecond,
      gifPaletteColors: paletteColors,
    };
    if (preview.gifBytes < 3_000_000) break;
  }
  return preview;
}

async function screenshot(page, file, details = {}) {
  await page.screenshot({ path: path.join(output, file) });
  manifest.screenshots.push({
    file,
    route: new URL(page.url()).pathname,
    width: page.viewportSize().width,
    ...details,
  });
}

async function footerProgress(page, progress, duration = 700) {
  const bounds = await page.locator('[data-site-footer]').evaluate((el) => {
    const box = el.getBoundingClientRect();
    return {
      start: box.top + scrollY - innerHeight * 0.92,
      end: box.bottom + scrollY - innerHeight,
    };
  });
  await smoothScroll(page, bounds.start + (bounds.end - bounds.start) * progress, duration);
  await page.waitForFunction(
    (expected) =>
      Math.abs(
        Number(document.querySelector('[data-site-footer]').dataset.footerProgress) - expected,
      ) < 0.035,
    progress,
  );
  await page.waitForTimeout(450);
  return page.locator('[data-site-footer]').evaluate((el) => ({
    progress: Number(el.dataset.footerProgress),
    phase: el.dataset.footerPhase,
    composite: getComputedStyle(el.querySelector('[data-signature-composite]')).transform,
    signature: getComputedStyle(el.querySelector('[data-footer-signature]')).transform,
    scrollY,
  }));
}

async function captureStates(browser) {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.signatureIntro === 'playing');
    for (const [state, time] of [
      ['squares', 550],
      ['wave', 1600],
      ['signature', 3350],
      ['homepage', 5200],
    ]) {
      await page.waitForTimeout(Math.max(0, time - (await page.evaluate(() => performance.now()))));
      if (state === 'signature') {
        await page.waitForFunction(
          () =>
            document.documentElement.dataset.signatureIntro === 'playing' &&
            Number(getComputedStyle(document.querySelector('[data-intro-signature]')).opacity) >
              0.95,
        );
      }
      await screenshot(page, `intro-${width}-${state}.png`, {
        state,
        ...(await page.evaluate(() => ({
          navigationMs: performance.now(),
          intro: document.documentElement.dataset.signatureIntro,
        }))),
      });
    }
    await settle(page);
    const { media, scene } = await selectedScene(page, '[data-work]');
    await atProgress(page, media, scene, 0.98);
    for (const [state, progress] of [
      ['begin', 0.08],
      ['middle', 0.5],
      ['complete', 0.98],
      ['reverse', 0.08],
    ]) {
      const file = `immersive-${width}-${state}.png`;
      const result = await sceneScreenshot(page, cdp, media, scene, progress, file);
      manifest.screenshots.push({ route: '/', width, state, ...result });
    }
    for (const [state, progress] of [
      ['arrive', 0.12],
      ['meeting', 0.52],
      ['expanded', 0.98],
      ['reverse', 0.12],
    ]) {
      const result = await footerProgress(page, progress);
      await screenshot(page, `footer-${width}-${state}.png`, { state, ...result });
    }
    await open(page, '/work');
    await page.waitForFunction(
      () => document.querySelector('main h1').dataset.motionReveal === 'complete',
    );
    await screenshot(page, `work-${width}.png`);
    await open(page, '/work/bunzo');
    await page.waitForFunction(
      () => document.querySelector('main h1').dataset.motionReveal === 'complete',
    );
    await screenshot(page, `case-bunzo-${width}.png`);
    await context.close();
    await saveManifest();
  }
}

async function captureRecording(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const metrics = { intervals: [], shifts: [], longTasks: [], intro: [] };
    window.__signatureCapture = metrics;
    let previous;
    function frame(time) {
      if (previous !== undefined) metrics.intervals.push(time - previous);
      previous = time;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    for (const type of ['layout-shift', 'longtask']) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (type === 'layout-shift' && !entry.hadRecentInput)
            metrics.shifts.push({ value: entry.value, time: entry.startTime });
          if (type === 'longtask') metrics.longTasks.push(entry.duration);
        }
      }).observe({ type, buffered: true });
    }
    window.addEventListener('signature:intro-end', () =>
      metrics.intro.push({
        ms: performance.now(),
        state: document.documentElement.dataset.signatureIntro,
      }),
    );
  });
  const measurements = [];
  const measure = async (route) =>
    measurements.push(
      await page.evaluate((route) => {
        const m = window.__signatureCapture;
        const intervals = [...m.intervals].sort((a, b) => a - b);
        return {
          route,
          samples: intervals.length,
          medianMs: intervals[Math.floor(intervals.length * 0.5)],
          p95Ms: intervals[Math.floor(intervals.length * 0.95)],
          over50: intervals.filter((x) => x > 50).length,
          shifts: m.shifts,
          longTasks: m.longTasks,
          intro: m.intro,
          gradient: document
            .querySelector('[data-living-gradient]')
            ?.getAttribute('data-gradient-renderer'),
        };
      }, route),
    );
  const file = `${name}-signature.mp4`;
  const finish = await realCompositorRecorder(context, page, file, viewport);
  const started = Date.now();
  const segments = [];
  const mark = (label) => segments.push({ label, seconds: (Date.now() - started) / 1000 });
  let recording;
  try {
    mark('automatic opening');
    await open(page, '/');
    await page.waitForTimeout(6500);
    if (await page.evaluate(() => document.documentElement.dataset.signatureIntro !== 'completed'))
      throw new Error('Recording did not capture a complete automatic opening.');
    await measure('/initial-home');
    mark('living gradient after intro');
    if (viewport.width > 768) {
      await page.mouse.move(100, 350);
      await page.mouse.move(1200, 300, { steps: 30 });
    }
    await page.waitForTimeout(2200);
    const { scene: first } = await selectedScene(page, '[data-work]');
    mark('portfolio expansion forward');
    await smoothScroll(page, first.start + (first.end - first.start) * 0.08, 1700);
    await smoothScroll(page, first.end, 2600);
    await page.waitForTimeout(400);
    mark('portfolio expansion reverse');
    await smoothScroll(page, first.start + (first.end - first.start) * 0.08, 2500);
    await page.waitForTimeout(350);
    mark('public project link');
    await page.locator('[data-work] a[href="/work/bunzo"]').first().click();
    await page.waitForURL('**/work/bunzo');
    await settle(page);
    await page.waitForTimeout(1000);
    const { scene: detail } = await selectedScene(page, '[data-case-gallery]');
    await smoothScroll(page, detail.end, 2800);
    await page.waitForTimeout(500);
    await smoothScroll(page, detail.start + (detail.end - detail.start) * 0.1, 2200);
    await measure('/work/bunzo');
    mark('Work index and filter');
    await open(page, '/work');
    await page.waitForTimeout(800);
    await page.locator('[data-filter="packaging"]').click();
    await page.waitForTimeout(500);
    const { scene: work } = await selectedScene(page, '[data-work-index]');
    await smoothScroll(page, work.end, 2400);
    await measure('/work');
    mark('returning homepage skips intro');
    await open(page, '/');
    await page.waitForTimeout(700);
    for (const selector of ['[data-studio]', '[data-approach]']) {
      const y = await page
        .locator(selector)
        .evaluate((el) => el.getBoundingClientRect().top + scrollY - innerHeight * 0.2);
      await smoothScroll(page, y, 2800);
      await page.waitForTimeout(500);
      await smoothScroll(page, y - viewport.height * 0.35, 1000);
      await smoothScroll(page, y + viewport.height * 0.15, 1200);
    }
    mark('signature footer forward');
    await footerProgress(page, 0.08, 2200);
    await footerProgress(page, 0.98, 3200);
    await page.waitForTimeout(800);
    mark('signature footer reverse');
    await footerProgress(page, 0.12, 3000);
    await footerProgress(page, 0.98, 2600);
    await page.waitForTimeout(600);
    await measure('/');
    mark('footer enquiry link');
    await page.locator('[data-site-footer] a[href="/contact"]').first().click();
    await page.waitForURL('**/contact');
    await page.waitForTimeout(800);
  } finally {
    try {
      recording = await finish();
    } finally {
      await context.close();
    }
  }
  const bytes = (await stat(path.join(output, file))).size;
  const preview = await createPreview(file, viewport, [{ label: 'opening forward', seconds: 0 }]);
  manifest.recordings.push({
    file,
    viewport,
    bytes,
    ...preview,
    ...recording,
    segments,
    measurements,
  });
  await saveManifest();
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  // Cloud capture uses software WebGL; recordings do not establish device GPU performance.
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
});
try {
  if (process.argv.includes('--recordings-only')) {
    const previous = JSON.parse(await readFile(manifestFile, 'utf8'));
    manifest.screenshots = previous.screenshots;
  } else await captureStates(browser);
  if (!process.argv.includes('--stills-only')) {
    await captureRecording(browser, 'desktop', { width: 1440, height: 900 });
    await captureRecording(browser, 'mobile', { width: 390, height: 844 });
  }
} finally {
  await browser.close();
}
await saveManifest();
console.log(
  JSON.stringify(
    {
      screenshots: manifest.screenshots.length,
      recordings: manifest.recordings.map(({ file, bytes, wallSeconds }) => ({
        file,
        bytes,
        wallSeconds,
      })),
      manifestFile,
    },
    null,
    2,
  ),
);
