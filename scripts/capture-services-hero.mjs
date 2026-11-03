import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, getComputedStyle, innerWidth, performance, requestAnimationFrame, scrollY */
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4395');
const output = path.resolve(argument('--out', 'artifacts/services-hero'));
const nativeDirectory = path.resolve(
  argument('--native-out', '/tmp/drawnout-services-hero-native-recordings'),
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe';
const leadingRecorderSetupTrimSeconds = Number(argument('--leading-recorder-trim-seconds', '0.12'));
assert.ok(
  Number.isFinite(leadingRecorderSetupTrimSeconds) &&
    leadingRecorderSetupTrimSeconds >= 0 &&
    leadingRecorderSetupTrimSeconds <= 0.5,
);
const viewportFor = (width) => ({ width, height: width === 390 ? 844 : 900 });
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  route: '/services',
  baseURL,
  method:
    'Actual local production Chromium screenshots at DPR 1 and continuous native Playwright browser recordings. Published exports omit only the declared leading recorder-surface setup interval; encoding and that trim do not seek the app timeline, change playback speed, replace CSS or construct frames. A single native scroll early in each recording keeps the stage and caption visible; the initial top view is retained separately. Reduced-motion and no-JavaScript full pages are explicitly separate static evidence. Software rendering is not a physical-device performance benchmark.',
  leadingRecorderSetupTrimSeconds,
  browser: '',
  screenshots: [],
  recordings: [],
  measurements: [],
  errors: [],
  failedRequests: [],
};

await mkdir(output, { recursive: true });
await mkdir(nativeDirectory, { recursive: true });
const save = () =>
  writeFile(
    path.join(output, 'services-capture-evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );

function watch(page, width, mode) {
  page.on('pageerror', (error) => evidence.errors.push({ width, mode, message: error.message }));
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      width,
      mode,
      url: request.url(),
      error: request.failure()?.errorText,
    }),
  );
}

async function facts(page) {
  return page.evaluate(() => {
    const hero = document.querySelector('[data-services-hero]');
    const stage = hero.querySelector('[data-services-stage]');
    const emblem = hero.querySelector('[data-services-emblem]');
    const wordmark = hero.querySelector('[data-services-wordmark]');
    const box = emblem.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    return {
      at: performance.now(),
      state: hero.dataset.servicesState ?? 'unenhanced',
      phase: hero.dataset.servicesPhase,
      active: Number(hero.dataset.servicesActive ?? 0),
      cycle: Number(hero.dataset.servicesCycle ?? 0),
      time: Number(hero.dataset.servicesTime ?? 0),
      pauseReasons: hero.dataset.servicesPauseReasons ?? '',
      emblem: { x: box.x, y: box.y, width: box.width, height: box.height },
      stage: { x: stageBox.x, y: stageBox.y, width: stageBox.width, height: stageBox.height },
      wordmarkOpacity: wordmark.hidden ? 0 : Number(getComputedStyle(wordmark).opacity),
      wordmarkClip: getComputedStyle(wordmark).clipPath,
      activeCaption: hero
        .querySelector(`[data-services-caption="${hero.dataset.servicesActive ?? 0}"]`)
        ?.textContent.replace(/\s+/g, ' ')
        .trim(),
      directLinks: [...hero.querySelectorAll('nav a')].map((node) => ({
        text: node.textContent.replace(/\s+/g, ' ').trim(),
        href: node.getAttribute('href'),
      })),
      h1: document.querySelector('main h1').textContent.trim(),
      overlayCount: document.querySelectorAll('[data-signature-intro-overlay]').length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      scrollY,
    };
  });
}

async function screenshot(page, filename, description, mode, fullPage = false) {
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({
    path: path.join(output, filename),
    fullPage,
    animations: 'allow',
  });
  const observed = await facts(page);
  assert.equal(observed.horizontalOverflow, false, `${filename} has no horizontal overflow`);
  assert.equal(observed.overlayCount, 0, 'Services has no blocking intro overlay');
  assert.equal(observed.directLinks.length, 5, 'All five direct links remain present');
  evidence.screenshots.push({
    filename,
    description,
    mode,
    viewport: page.viewportSize(),
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    observed,
  });
  await save();
}

async function installProbe(page) {
  await page.addInitScript(() => {
    const samples = [];
    Reflect.set(window, '__servicesCaptureSamples', samples);
    let previous = -100;
    const sample = () => {
      const hero = document.querySelector('[data-services-hero]');
      const now = performance.now();
      if (hero && now - previous >= 35) {
        previous = now;
        const logo = hero.querySelector('[data-services-emblem]');
        const stage = hero.querySelector('[data-services-stage]');
        const wordmark = hero.querySelector('[data-services-wordmark]');
        const active = Number(hero.dataset.servicesActive ?? 0);
        const scene = hero.querySelector(`[data-services-scene="${active}"]`);
        const parts = [
          ...(scene?.querySelectorAll('[data-services-part], [data-services-draw]') ?? []),
        ];
        const styles = parts.map((node) => getComputedStyle(node));
        const box = logo.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        samples.push({
          at: now,
          state: hero.dataset.servicesState,
          phase: hero.dataset.servicesPhase,
          active,
          cycle: Number(hero.dataset.servicesCycle ?? 0),
          time: Number(hero.dataset.servicesTime ?? 0),
          pauseReasons: hero.dataset.servicesPauseReasons ?? '',
          logoLeft: box.left - stageBox.left,
          logoRight: box.right - stageBox.left,
          stageWidth: stageBox.width,
          wordmarkOpacity: wordmark.hidden ? 0 : Number(getComputedStyle(wordmark).opacity),
          wordmarkClip: getComputedStyle(wordmark).clipPath,
          visibleScene: scene && !scene.hidden && Number(getComputedStyle(scene).opacity) > 0.65,
          partFingerprint: styles
            .map((style) => [style.transform, style.opacity, style.strokeDashoffset].join('/'))
            .join('|'),
          fractionalDraw: styles.some((style) => {
            const value = Number.parseFloat(style.strokeDashoffset);
            return value > 0.05 && value < 0.95;
          }),
          scrollY,
        });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

function validateSamples(samples, width) {
  const playing = samples.filter((sample) => sample.state === 'playing');
  assert.ok(playing.length > 200, 'Real playing frames must be observed');
  const first = playing[0];
  const wrap = playing.find((sample) => sample.cycle > first.cycle);
  assert.ok(wrap, 'The recording must include an actual loop wrap');
  const period = (wrap.at - first.at) / 1000 + first.time;
  assert.ok(period >= 13.5 && period <= 14.6, `Observed loop period: ${period}s`);
  const windows = [];
  for (let index = 0; index < 5; index += 1) {
    const featured = playing.filter(
      (sample) =>
        sample.cycle === first.cycle && sample.phase === 'service' && sample.active === index,
    );
    assert.ok(featured.length > 15, `Scene ${index + 1} must be featured`);
    const seconds = (featured.at(-1).at - featured[0].at) / 1000;
    assert.ok(seconds >= 1.7 && seconds <= 2.4, `Scene ${index + 1} featured for ${seconds}s`);
    assert.ok(featured.some((sample) => sample.visibleScene));
    const fingerprints = new Set(featured.map((sample) => sample.partFingerprint));
    assert.ok(fingerprints.size > 2, `Scene ${index + 1} must animate its custom parts`);
    windows.push({ index, observedSeconds: seconds, renderedPartStates: fingerprints.size });
  }
  assert.ok(playing.some((sample) => sample.fractionalDraw));
  assert.ok(playing.some((sample) => sample.wordmarkOpacity > 0.8));
  return { width, observedCycleSeconds: period, windows, sampleCount: samples.length, samples };
}

function transcode(nativeFile, stem) {
  const mp4 = path.join(output, `${stem}.mp4`);
  const gif = path.join(output, `${stem}.gif`);
  const nativeMetadata = JSON.parse(
    execFileSync(ffprobe, ['-v', 'error', '-show_format', '-of', 'json', nativeFile], {
      encoding: 'utf8',
    }),
  );
  execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    nativeFile,
    '-ss',
    String(leadingRecorderSetupTrimSeconds),
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '21',
    '-threads',
    '2',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    mp4,
  ]);
  execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    mp4,
    '-filter_complex',
    'fps=5,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer',
    '-threads',
    '2',
    '-loop',
    '0',
    gif,
  ]);
  const metadata = JSON.parse(
    execFileSync(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', mp4], {
      encoding: 'utf8',
    }),
  );
  const video = metadata.streams.find((stream) => stream.codec_type === 'video');
  assert.equal(metadata.streams.filter((stream) => stream.codec_type === 'audio').length, 0);
  assert.ok(Number(metadata.format.duration) >= 20);
  return {
    mp4: path.basename(mp4),
    gif: path.basename(gif),
    nativeFile,
    leadingRecorderSetupTrimSeconds,
    untrimmedDurationSeconds: Number(nativeMetadata.format.duration),
    durationSeconds: Number(metadata.format.duration),
    bytes: Number(metadata.format.size),
    width: video.width,
    height: video.height,
    codec: video.codec_name,
    frameRate: video.r_frame_rate,
  };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  for (const width of [390, 1440]) {
    const viewport = viewportFor(width);
    const context = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      isMobile: width === 390,
      hasTouch: width === 390,
      recordVideo: { dir: nativeDirectory, size: viewport },
    });
    const page = await context.newPage();
    watch(page, width, 'normal-motion');
    await installProbe(page);
    const response = await page.goto('/services', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    await page.locator('[data-services-emblem]').waitFor({ state: 'visible' });
    await screenshot(
      page,
      `services-${width}-start.png`,
      'Early right-side emblem and original introduction',
      'normal-motion',
    );
    await page.waitForFunction(
      () => document.querySelector('[data-services-hero]')?.dataset.servicesState === 'playing',
    );
    await page.evaluate(() =>
      window.scrollBy({ top: innerWidth < 768 ? 170 : 100, behavior: 'instant' }),
    );
    for (let index = 0; index < 5; index += 1) {
      await page.waitForFunction((index) => {
        const hero = document.querySelector('[data-services-hero]');
        const time = Number(hero?.dataset.servicesTime);
        const start = 1 + index * 2.1;
        return (
          hero?.dataset.servicesPhase === 'service' &&
          Number(hero.dataset.servicesActive) === index &&
          time >= start + 1.63 &&
          time <= start + 1.85
        );
      }, index);
      await screenshot(
        page,
        `services-${width}-scene-${index + 1}.png`,
        `Naturally played service scene ${index + 1}`,
        'normal-motion',
      );
    }
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-services-hero]');
      return (
        hero?.dataset.servicesPhase === 'wordmark' && Number(hero.dataset.servicesTime) >= 12.9
      );
    });
    await screenshot(
      page,
      `services-${width}-wordmark.png`,
      'DrawnOut wordmark revealed alongside the returning emblem',
      'normal-motion',
    );
    await page.waitForFunction(
      () => Number(document.querySelector('[data-services-hero]')?.dataset.servicesTime) >= 13.3,
    );
    await screenshot(
      page,
      `services-${width}-return.png`,
      'Emblem returned right before the seamless reset',
      'normal-motion',
    );
    await page.waitForFunction(
      () => Number(document.querySelector('[data-services-hero]')?.dataset.servicesCycle) >= 1,
    );
    await screenshot(
      page,
      `services-${width}-loop-restart.png`,
      'Actual first loop restart with the matching right-side emblem',
      'normal-motion',
    );
    await page.waitForFunction(() => {
      const hero = document.querySelector('[data-services-hero]');
      return Number(hero?.dataset.servicesCycle) >= 1 && Number(hero?.dataset.servicesTime) >= 9;
    });
    const samples = await page.evaluate(() => Reflect.get(window, '__servicesCaptureSamples'));
    evidence.measurements.push(validateSamples(samples, width));
    const native = page.video();
    await context.close();
    evidence.recordings.push({
      viewport,
      ...transcode(await native.path(), `services-${width}-cycle`),
    });
    await save();
    console.log(`Captured ${width}px real loop and all five service scenes`);
  }

  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    watch(page, width, 'reduced-motion');
    await page.goto('/services', { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.querySelector('[data-services-hero]')?.dataset.servicesState === 'static',
    );
    for (const image of await page.locator('main img, [data-site-footer] img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((node) => node.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await screenshot(
      page,
      `services-${width}-reduced.png`,
      'Actual reduced-motion static hero with manual previews',
      'reduced-motion',
    );
    await screenshot(
      page,
      `services-${width}-full-reduced.png`,
      'Complete unchanged overview and footer below the reduced-motion hero',
      'reduced-motion',
      true,
    );
    await context.close();
  }

  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    watch(page, width, 'no-javascript');
    await page.goto('/services', { waitUntil: 'networkidle' });
    for (const image of await page.locator('main img, [data-site-footer] img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((node) => node.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.locator('[data-services-hero] nav a').count(), 5);
    assert.equal(await page.locator('[data-services-hero] button:visible').count(), 0);
    await screenshot(
      page,
      `services-${width}-no-js.png`,
      'Native no-JavaScript hero and five direct service links',
      'no-javascript',
    );
    await screenshot(
      page,
      `services-${width}-full-no-js.png`,
      'Complete no-JavaScript page with preserved overview and footer',
      'no-javascript',
      true,
    );
    await context.close();
  }
  assert.equal(evidence.errors.length, 0, 'Capture pages must not throw browser errors');
  assert.equal(evidence.failedRequests.length, 0, 'All capture requests must complete');
  await save();
  const gallery = `# Services cinematic hero — actual production evidence

The first Services hero prototype uses the original supplied emblem and five custom SVG compositions. Existing overview content and detail pages remain below it. These are real browser views and continuous recordings from the local production build; no timeline seeking, CSS replacement or fabricated frames is used. Published clips omit only the first ${leadingRecorderSetupTrimSeconds}s of recorder-surface initialization, keeping playback speed and source-clock measurements unchanged.

[Capture facts, timings and screenshot hashes](services-capture-evidence.json) · [Production browser report](services-browser-tests.json) · [About refinement gallery](about-README.md)

## Continuous desktop and mobile loops

Both recordings exceed twenty seconds and show the initial right-side emblem, all five services, the large DrawnOut wordmark and the return into a second cycle. One early native scroll keeps the artwork and caption together in view. The app itself does not auto-scroll.

### 1440px

[Play desktop MP4](services-1440-cycle.mp4)

![Desktop Services loop preview](services-1440-cycle.gif)

### 390px

[Play mobile MP4](services-390-cycle.mp4)

![Mobile Services loop preview](services-390-cycle.gif)

## Five distinct service scenes

| Service | 1440px | 390px |
| --- | --- | --- |
| Brand Identity & Design | ![Desktop identity scene](services-1440-scene-1.png) | ![Mobile identity scene](services-390-scene-1.png) |
| Digital Design | ![Desktop digital scene](services-1440-scene-2.png) | ![Mobile digital scene](services-390-scene-2.png) |
| Marketing & Campaigns | ![Desktop campaign scene](services-1440-scene-3.png) | ![Mobile campaign scene](services-390-scene-3.png) |
| Words & Storytelling | ![Desktop storytelling scene](services-1440-scene-4.png) | ![Mobile storytelling scene](services-390-scene-4.png) |
| Creative Direction | ![Desktop creative direction scene](services-1440-scene-5.png) | ![Mobile creative direction scene](services-390-scene-5.png) |

## Logo, wordmark and loop boundary

| View | 1440px | 390px |
| --- | --- | --- |
| Initial right-side logo | ![Desktop start](services-1440-start.png) | ![Mobile start](services-390-start.png) |
| Wordmark and return | ![Desktop wordmark](services-1440-wordmark.png) | ![Mobile wordmark](services-390-wordmark.png) |
| Final right pose | ![Desktop return](services-1440-return.png) | ![Mobile return](services-390-return.png) |
| Actual loop restart | ![Desktop loop restart](services-1440-loop-restart.png) | ![Mobile loop restart](services-390-loop-restart.png) |

## Static fallbacks and preserved continuation

| Width | Reduced motion | No JavaScript |
| --- | --- | --- |
| 390px | [Hero](services-390-reduced.png) · [Full page](services-390-full-reduced.png) | [Hero](services-390-no-js.png) · [Full page](services-390-full-no-js.png) |
| 768px | [Hero](services-768-reduced.png) · [Full page](services-768-full-reduced.png) | Not separately captured |
| 1440px | [Hero](services-1440-reduced.png) · [Full page](services-1440-full-reduced.png) | [Hero](services-1440-no-js.png) · [Full page](services-1440-full-no-js.png) |

The SVG stage is decorative; service names, official copy and direct links remain semantic page content. Native scrolling and keyboard controls remain available. Software-rendered Chromium evidence does not establish field performance on physical devices, Safari or Firefox. The rest of the Services experience is intentionally unchanged pending hero approval. No merge, deployment or Netlify repository push is performed by this capture.
`;
  await writeFile(path.join(output, 'services-README.md'), gallery);
} finally {
  await browser.close();
}
