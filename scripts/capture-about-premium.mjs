import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, performance, requestAnimationFrame, getComputedStyle, scrollY, innerHeight, Element */
// Capture real browser output. Never seek a timeline, change application styles or fabricate frames.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4411');
const output = path.resolve(argument('--out', 'artifacts/about-premium'));
const native = path.resolve(argument('--native-dir', '/workspace/about-premium-review/native'));
const only = argument('--only', 'all');
assert(
  ['all', 'recordings', 'stills', 'full-pages'].includes(only),
  'Use --only all, recordings, stills or full-pages',
);
const preserveRecordings = only === 'stills' || only === 'full-pages';
const suppliedWidths = argument('--widths', '');
const videoWidths = suppliedWidths ? suppliedWidths.split(',').map(Number) : [1440, 390];
const stillWidths = suppliedWidths
  ? suppliedWidths.split(',').map(Number)
  : [1440, 1024, 768, 390, 320];
const viewport = (width) => ({ width, height: width < 768 ? 844 : 900 });
const hash = (data) => createHash('sha256').update(data).digest('hex');
const manifest = path.join(output, 'capture-evidence.json');
let previous;
try {
  previous = JSON.parse(await readFile(manifest, 'utf8'));
} catch {
  // The first capture has no previous evidence to preserve.
}
const sourceFiles = [
  'src/components/about/AboutPage.astro',
  'src/components/about/PremiumAboutHero.astro',
  'src/components/about/AboutEditorial.astro',
  'src/components/about/ProcessArtwork.astro',
  'src/components/about/FounderPortrait.astro',
  'src/styles/about-premium-hero.css',
  'src/styles/about-premium-editorial.css',
  'src/scripts/about-motion.ts',
  'src/data/about.ts',
  'src/assets/about/founders-sketch-approved.png',
  'src/assets/signature/emblem-plaque.png',
];
const sourceHashes = Object.fromEntries(
  await Promise.all(sourceFiles.map(async (file) => [file, hash(await readFile(file))])),
);
if (previous && only !== 'all')
  assert.deepEqual(
    previous.sourceFiles,
    sourceHashes,
    'Preserved captures must match application source',
  );
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles: sourceHashes,
  baseURL,
  method:
    'Real production Chromium screenshots and native Playwright video. H.264 transcodes preserve the full original timing. Scrolling uses browser wheel input, including reverse scrolling. No application timeline seeking, injected styles or synthesized imagery. Full-page screenshots are taken after visiting the whole page. Software rendering is not a physical-device benchmark.',
  assetStatus:
    'The owner-approved founders sketch and existing illuminated emblem-plaque.png are reused. The plaque is an approved separated raster prototype presented in layers, not an editable or newly rendered 3D model. The new brief authorizes this appearance. The original private photograph is not published.',
  browser: '',
  screenshots: only !== 'all' ? (previous?.screenshots ?? []) : [],
  recordings: only !== 'all' ? (previous?.recordings ?? []) : [],
  recordingsCapturedAt: preserveRecordings ? previous?.recordingsCapturedAt : undefined,
  fullPageCaptureMethod:
    only === 'full-pages'
      ? 'Native Chromium software compositor (--disable-gpu) at unchanged viewport; avoids the cloud SwiftShader 8192px tall-image repetition. No stitching or injected styles.'
      : previous?.fullPageCaptureMethod,
  measurements: preserveRecordings ? (previous?.measurements ?? []) : [],
  errors: [],
  failedRequests: [],
};
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const save = () => writeFile(manifest, `${JSON.stringify(evidence, null, 2)}\n`);
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
async function observe(context) {
  await context.addInitScript(() => {
    const samples = [];
    Reflect.set(window, '__premiumCaptureSamples', samples);
    let last = -100;
    const tick = (at) => {
      if (at - last >= 70) {
        last = at;
        const hero = document.querySelector('[data-about-hero]');
        const opacity = (selector) => {
          let node = document.querySelector(selector);
          if (!node) return null;
          let value = 1;
          while (node instanceof Element) {
            const style = getComputedStyle(node);
            if (style.visibility === 'hidden' || style.display === 'none') return 0;
            value *= Number(style.opacity);
            node = node.parentElement;
          }
          return value;
        };
        samples.push({
          at,
          state: hero?.dataset.aboutEntrance,
          scene: hero?.dataset.aboutArrivalScene,
          reason: hero?.dataset.aboutSettleReason,
          portraitOpacity: opacity('[data-about-artwork]'),
          plaqueOpacity: opacity('[data-about-plaque]'),
          gradientOpacity: opacity('[data-about-gradient]'),
          headlineOpacity: opacity('[data-about-headline]'),
          paragraphOpacity: opacity('[data-about-hero-paragraph]'),
        });
      }
      if (at < 9000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
async function facts(page) {
  return page.evaluate(() => {
    const hero = document.querySelector('[data-about-hero]');
    const rect = (node) => {
      if (!node) return null;
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    return {
      at: performance.now(),
      scrollY,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      h1: [...document.querySelectorAll('h1')].map((node) =>
        node.textContent.replace(/\s+/g, ' ').trim(),
      ),
      hero: {
        state: hero?.dataset.aboutEntrance,
        scene: hero?.dataset.aboutArrivalScene,
        reason: hero?.dataset.aboutSettleReason,
        startedAt: Number(hero?.dataset.aboutStartedAt) || null,
        endedAt: Number(hero?.dataset.aboutEndedAt) || null,
        portrait: rect(document.querySelector('[data-about-artwork]')),
        plaque: rect(document.querySelector('[data-about-plaque]')),
      },
      process: [...document.querySelectorAll('[data-about-process-phase]')].map((node) => ({
        phase: node.dataset.aboutPhase,
        progress: node.dataset.aboutPhaseProgress,
        scrollProgress: node.dataset.aboutScrollProgress,
        bounds: rect(node),
      })),
    };
  });
}
async function ready(page, normal = true) {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  if (normal)
    await page.waitForFunction(() =>
      ['settled', 'static'].includes(
        document.querySelector('[data-about-hero]')?.dataset.aboutEntrance,
      ),
    );
  const state = await facts(page);
  assert.equal(state.overflow, false, 'No horizontal overflow in captured viewport');
  return state;
}
async function shot(page, file, description, { fullPage = false, target, mode = 'normal' } = {}) {
  const before = await facts(page);
  assert.equal(before.overflow, false);
  const bytes = target
    ? await page.locator(target).screenshot({ path: path.join(output, file), animations: 'allow' })
    : await page.screenshot({ path: path.join(output, file), fullPage, animations: 'allow' });
  evidence.screenshots = evidence.screenshots.filter((item) => item.file !== file);
  evidence.screenshots.push({
    file,
    description,
    mode,
    viewport: page.viewportSize(),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
    sha256: hash(bytes),
    before,
  });
  await save();
}
async function wheelTo(page, target, { step = 210, delay = 90 } = {}) {
  const destination = Math.max(
    0,
    Math.min(
      target,
      await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    ),
  );
  let current = await page.evaluate(() => scrollY);
  let count = 0;
  while (Math.abs(destination - current) > 4 && count++ < 250) {
    const delta =
      Math.sign(destination - current) * Math.min(step, Math.abs(destination - current));
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(delay);
    current = await page.evaluate(() => scrollY);
  }
  assert(
    Math.abs(destination - current) <= 5,
    `Native scroll reached ${destination}, actual ${current}`,
  );
  await page.waitForTimeout(180);
}
async function visitWholePage(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await wheelTo(page, height, { step: 580, delay: 120 });
  await page.waitForTimeout(1000);
}
function transcode(source, file, width, kind) {
  const destination = path.join(output, file);
  execFileSync(process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg', [
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
    'fast',
    '-crf',
    '23',
    '-threads',
    '2',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    destination,
  ]);
  const meta = JSON.parse(
    execFileSync(
      process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe',
      ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination],
      { encoding: 'utf8' },
    ),
  );
  assert.equal(meta.streams.filter(({ codec_type }) => codec_type === 'audio').length, 0);
  return {
    file,
    kind,
    nativeFile: source,
    viewport: viewport(width),
    durationSeconds: Number(meta.format.duration),
    bytes: Number(meta.format.size),
    streams: meta.streams.map(({ codec_name, width, height, r_frame_rate }) => ({
      codec: codec_name,
      width,
      height,
      frameRate: r_frame_rate,
    })),
  };
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args:
    only === 'full-pages'
      ? ['--disable-gpu']
      : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  if (!preserveRecordings) {
    evidence.recordingsCapturedAt = evidence.capturedAt;
    for (const width of videoWidths) {
      const context = await browser.newContext({
        baseURL,
        viewport: viewport(width),
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        recordVideo: { dir: native, size: viewport(width) },
      });
      await observe(context);
      const page = await context.newPage();
      watch(page, width, 'arrival');
      const video = page.video();
      assert.equal((await page.goto('/about', { waitUntil: 'commit' })).status(), 200);
      const final = await ready(page);
      assert.equal(
        final.hero.reason,
        'complete',
        'Arrival recording must show normal choreography, not a fallback',
      );
      assert(
        final.hero.endedAt <= 4300,
        'Hero settles within the documented four-second target plus startup allowance',
      );
      await shot(
        page,
        `about-${width}-settled.png`,
        'Unmodified viewport after the coordinated hero arrival.',
      );
      await page.waitForFunction(() => performance.now() >= 7000);
      const samples = await page.evaluate(() => Reflect.get(window, '__premiumCaptureSamples'));
      evidence.measurements.push({ kind: 'arrival', width, final, samples });
      await context.close();
      evidence.recordings = evidence.recordings.filter(
        (item) => item.file !== `about-${width}-arrival.mp4`,
      );
      evidence.recordings.push(
        transcode(await video.path(), `about-${width}-arrival.mp4`, width, 'arrival'),
      );
      await save();

      const scrollContext = await browser.newContext({
        baseURL,
        viewport: viewport(width),
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        recordVideo: { dir: native, size: viewport(width) },
      });
      const scrolling = await scrollContext.newPage();
      watch(scrolling, width, 'editorial-scroll');
      const scrollVideo = scrolling.video();
      await scrolling.goto('/about');
      await ready(scrolling);
      const snapshots = [];
      const sections = scrolling.locator(
        '[data-about-page] > section, [data-about-editorial] > section',
      );
      for (let index = 1; index < (await sections.count()); index++) {
        const top = await sections
          .nth(index)
          .evaluate((node) => node.getBoundingClientRect().top + scrollY - 90);
        await wheelTo(scrolling, top, { step: width < 768 ? 150 : 190, delay: 140 });
        await scrolling.waitForTimeout(700);
        snapshots.push({ direction: 'forward', section: index, facts: await facts(scrolling) });
      }
      const process = scrolling.locator('[data-about-process]');
      const processBox = await process.evaluate((node) => ({
        top: node.getBoundingClientRect().top + scrollY,
        height: node.getBoundingClientRect().height,
      }));
      await wheelTo(scrolling, processBox.top + processBox.height - 180, { step: 430, delay: 90 });
      for (const fraction of [1, 0.75, 0.5, 0.25, 0]) {
        await wheelTo(scrolling, processBox.top + processBox.height * fraction - 180, {
          step: 120,
          delay: 150,
        });
        snapshots.push({ direction: 'reverse', fraction, facts: await facts(scrolling) });
      }
      await scrolling.waitForTimeout(900);
      evidence.measurements.push({
        kind: 'editorial-scroll-and-reverse-process',
        width,
        snapshots,
      });
      await scrollContext.close();
      evidence.recordings = evidence.recordings.filter(
        (item) => item.file !== `about-${width}-scroll-and-reverse.mp4`,
      );
      evidence.recordings.push(
        transcode(
          await scrollVideo.path(),
          `about-${width}-scroll-and-reverse.mp4`,
          width,
          'editorial-scroll-and-reverse-process',
        ),
      );
      await save();
    }
  }
  if (only !== 'recordings') {
    for (const width of stillWidths) {
      const context = await browser.newContext({
        baseURL,
        viewport: viewport(width),
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      watch(page, width, 'stills');
      await page.goto('/about');
      await ready(page);
      if (only !== 'full-pages')
        await shot(
          page,
          `about-${width}-hero.png`,
          'Settled hero at the ordinary responsive viewport.',
        );
      await visitWholePage(page);
      await wheelTo(page, 0, { step: 900, delay: 70 });
      await shot(
        page,
        `about-${width}-full-page.png`,
        'Complete rendered page after ordinary scrolling has visited the editorial sections. Decorative process artwork reflects this real scroll position.',
        { fullPage: true },
      );
      if (only !== 'full-pages' && [390, 1440].includes(width)) {
        const selectors = [
          ['origin', '[data-about-origin]'],
          ['founders', '[data-about-founders]'],
          ['manifesto', '[data-about-philosophy]'],
          ['process', '[data-about-process]'],
          ['difference', '[data-about-difference]'],
          ['capabilities', '[data-about-capabilities]'],
          ['invitation', '[data-about-invitation]'],
        ];
        for (const [name, selector] of selectors) {
          const element = page.locator(selector);
          const top = await element.evaluate(
            (node) => node.getBoundingClientRect().top + scrollY - 90,
          );
          await wheelTo(page, top, { step: 650, delay: 100 });
          await page.waitForTimeout(850);
          await shot(
            page,
            `about-${width}-${name}.png`,
            `Actual ${name} section viewport at ${width}px. Long sections continue below this viewport.`,
          );
        }
      }
      await context.close();
    }
    for (const width of [1440, 390])
      for (const mode of ['reduced-motion', 'no-js']) {
        const context = await browser.newContext({
          baseURL,
          viewport: viewport(width),
          deviceScaleFactor: 1,
          reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
          javaScriptEnabled: mode !== 'no-js',
        });
        const page = await context.newPage();
        watch(page, width, mode);
        await page.goto('/about');
        await ready(page, false);
        if (only !== 'full-pages')
          await shot(
            page,
            `about-${width}-${mode}-hero.png`,
            `Native ${mode} hero fallback; no replacement CSS.`,
            { mode },
          );
        await visitWholePage(page);
        await wheelTo(page, 0, { step: 900, delay: 60 });
        await shot(
          page,
          `about-${width}-${mode}-full-page.png`,
          `Complete native ${mode} fallback after loading all lazy images.`,
          { fullPage: true, mode },
        );
        await context.close();
      }
  }
} finally {
  await browser.close();
  await save();
}
assert.equal(evidence.errors.length, 0, JSON.stringify(evidence.errors));
assert.equal(evidence.failedRequests.length, 0, JSON.stringify(evidence.failedRequests));
console.log(
  JSON.stringify({
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    errors: evidence.errors.length,
    failedRequests: evidence.failedRequests.length,
    manifest,
  }),
);
