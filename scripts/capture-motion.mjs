import { chromium } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { clearInterval, setInterval } from 'node:timers';

/* global document, window, getComputedStyle, performance, requestAnimationFrame, PerformanceObserver, innerHeight */
// Browser globals below are used only inside Playwright's page-evaluation callbacks.

// Record the real Chromium compositor. No app animation state is mocked or sought.
const baseURL = process.env.MOTION_BASE_URL ?? 'http://127.0.0.1:4321';
const outputArgument = process.argv.indexOf('--out');
const output = path.resolve(
  outputArgument >= 0 ? process.argv[outputArgument + 1] : 'artifacts/phase-4',
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const fps = 30;
const manifest = { baseURL, recordedAt: new Date().toISOString(), screenshots: [], recordings: [] };
const manifestFile = path.join(output, 'motion-evidence.json');
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
  // A locator screenshot scrolls the element into view and changes its progress.
  // CDP captures its document-space rectangle without scrolling or forcing state.
  const image = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
    clip: before.clip,
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

async function captureStates(browser) {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    for (const [name, route, prefix] of [
      ['home', '/', '[data-work]'],
      ['work', '/work', '[data-work-index]'],
      ['case', '/_preview/work/bunzo', '[data-case-gallery]'],
    ]) {
      await open(page, route);
      if (name === 'home') {
        await page.waitForFunction(() =>
          [...document.querySelectorAll('[data-type-line]')].every(
            (line) => Number(getComputedStyle(line).opacity) >= 0.99,
          ),
        );
        // Allow the orchestrated entrance to finish, retaining the living atmosphere.
        await page.waitForTimeout(1200);
        const file = `hero-${width}.png`;
        await page.screenshot({ path: path.join(output, file) });
        manifest.screenshots.push({ file, route, width, state: 'hero-settled' });
      }
      const { media, scene } = await selectedScene(page, prefix);
      // Warm the real lazy image before capturing its earlier scroll states.
      await atProgress(page, media, scene, 0.98);
      for (const [state, progress] of [
        ['begin', 0.08],
        ['middle', 0.5],
        ['complete', 0.98],
        ['reverse', 0.08],
      ]) {
        const file = `${name}-expansion-${width}-${state}.png`;
        manifest.screenshots.push({
          route,
          width,
          state,
          ...(await sceneScreenshot(page, cdp, media, scene, progress, file)),
        });
      }
    }
    await context.close();
  }
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
  cdp.on('Page.screencastFrame', (event) => {
    latest = Buffer.from(event.data, 'base64');
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
    if (!latest || encoderFailure) return;
    if (encoder.stdin.writableNeedDrain) {
      backpressureFrames += 1;
      return;
    }
    encoder.stdin.write(latest);
    frames += 1;
  }, 1000 / fps);
  return async () => {
    clearInterval(timer);
    await cdp.send('Page.stopScreencast').catch(() => {});
    encoder.stdin.end();
    await finished;
    return { wallSeconds: (Date.now() - started) / 1000, frames, fps, backpressureFrames };
  };
}

async function captureRecording(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const metrics = { intervals: [], layoutShiftScore: 0, longTasks: [] };
    window.__motionCaptureMetrics = metrics;
    let previous;
    function frame(time) {
      if (previous !== undefined) metrics.intervals.push(time - previous);
      previous = time;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    for (const type of ['layout-shift', 'longtask']) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (type === 'layout-shift' && !entry.hadRecentInput)
            metrics.layoutShiftScore += entry.value;
          if (type === 'longtask') metrics.longTasks.push(entry.duration);
        }
      });
      observer.observe({ type, buffered: true });
    }
  });
  const measurements = [];
  const measure = async (route) => {
    measurements.push(
      await page.evaluate((route) => {
        const metrics = window.__motionCaptureMetrics;
        const intervals = [...metrics.intervals].sort((a, b) => a - b);
        return {
          route,
          intervalSamples: intervals.length,
          medianFrameIntervalMs: intervals[Math.floor(intervals.length * 0.5)] ?? 0,
          p95FrameIntervalMs: intervals[Math.floor(intervals.length * 0.95)] ?? 0,
          maxFrameIntervalMs: intervals.at(-1) ?? 0,
          intervalsOver50ms: intervals.filter((value) => value > 50).length,
          layoutShiftScore: metrics.layoutShiftScore,
          longTaskCount: metrics.longTasks.length,
          longTaskTotalMs: metrics.longTasks.reduce((total, value) => total + value, 0),
        };
      }, route),
    );
  };
  const file = `${name}-motion.mp4`;
  const finish = await realCompositorRecorder(context, page, file, viewport);
  const started = Date.now();
  const segments = [];
  const mark = (label) => segments.push({ label, seconds: (Date.now() - started) / 1000 });
  let recording;
  try {
    await open(page, '/');
    await page.waitForTimeout(2000);
    const { scene: first } = await selectedScene(page, '[data-work]');
    await smoothScroll(page, first.start + (first.end - first.start) * 0.08, 1800);
    mark('homepage first expansion — forward');
    await smoothScroll(page, first.end + 70, 2600);
    await page.waitForTimeout(350);
    mark('homepage first expansion — reverse');
    await smoothScroll(page, first.start + (first.end - first.start) * 0.08, 2600);
    await page.waitForTimeout(350);
    const studioY = await page
      .locator('[data-studio]')
      .evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY - innerHeight * 0.15,
      );
    mark('editorial homepage — forward');
    await smoothScroll(page, studioY, 4200);
    await page.waitForTimeout(700);
    const approachY = await page
      .locator('[data-approach]')
      .evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY - innerHeight * 0.15,
      );
    await smoothScroll(page, approachY, 2400);
    await page.waitForTimeout(700);
    mark('editorial homepage — reverse');
    await smoothScroll(page, first.end, 3400);
    await page.waitForTimeout(350);
    await measure('/');

    mark('Work index');
    await open(page, '/work');
    await page.waitForTimeout(700);
    const { scene: work } = await selectedScene(page, '[data-work-index]');
    await smoothScroll(page, work.end + 40, 2200);
    await page.waitForTimeout(300);
    await smoothScroll(page, work.start + (work.end - work.start) * 0.12, 1800);
    await page.locator('[data-filter="packaging"]').click();
    await page.waitForTimeout(600);
    await smoothScroll(page, work.end + 40, 1800);
    await page.waitForTimeout(300);
    await measure('/work');

    mark('Bunzo case');
    await open(page, '/_preview/work/bunzo');
    await page.waitForTimeout(900);
    const { scene: detail } = await selectedScene(page, '[data-case-gallery]');
    await smoothScroll(page, detail.end + 60, 3200);
    await page.waitForTimeout(450);
    mark('Bunzo gallery — reverse');
    await smoothScroll(page, detail.start + (detail.end - detail.start) * 0.08, 2500);
    await page.waitForTimeout(500);
    await measure('/_preview/work/bunzo');
  } finally {
    try {
      recording = await finish();
    } finally {
      await context.close();
    }
  }

  let bytes = (await stat(path.join(output, file))).size;
  if (bytes > 15 * 1024 * 1024) {
    const compact = path.join(output, `${name}-motion-compact.mp4`);
    execFileSync(ffmpeg, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      path.join(output, file),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '29',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      compact,
    ]);
    const { rename, rm } = await import('node:fs/promises');
    await rm(path.join(output, file));
    await rename(compact, path.join(output, file));
    bytes = (await stat(path.join(output, file))).size;
  }
  const preview = await createPreview(file, viewport, segments);
  manifest.recordings.push({
    file,
    viewport,
    bytes,
    ...preview,
    segments,
    measurements,
    ...recording,
  });
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

await mkdir(output, { recursive: true });
if (process.argv.includes('--previews-only')) {
  const previous = JSON.parse(await readFile(manifestFile, 'utf8'));
  if (previous.recordings?.length !== 2) throw new Error('Expected two complete recordings');
  manifest.recordedAt = previous.recordedAt;
  manifest.screenshots = previous.screenshots;
  for (const recording of previous.recordings) {
    manifest.recordings.push({
      ...recording,
      ...(await createPreview(recording.file, recording.viewport, recording.segments)),
    });
  }
} else {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  });
  try {
    if (process.argv.includes('--recordings-only')) {
      const previous = JSON.parse(await readFile(manifestFile, 'utf8'));
      if (previous.screenshots?.length !== 39)
        throw new Error('Expected a complete 39-image manifest');
      manifest.screenshots = previous.screenshots;
    } else {
      await captureStates(browser);
      await saveManifest();
    }
    await captureRecording(browser, 'desktop', { width: 1440, height: 900 });
    await saveManifest();
    await captureRecording(browser, 'mobile', { width: 390, height: 844 });
  } finally {
    await browser.close();
  }
}
await saveManifest();
console.log(
  JSON.stringify(
    {
      screenshots: manifest.screenshots.length,
      recordings: manifest.recordings.map(({ file, gif, bytes, gifBytes, wallSeconds }) => ({
        file,
        gif,
        bytes,
        gifBytes,
        wallSeconds,
      })),
      manifestFile,
    },
    null,
    2,
  ),
);
