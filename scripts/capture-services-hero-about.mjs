import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, innerHeight, innerWidth, scrollY, performance, requestAnimationFrame, getComputedStyle, Image */
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', process.env.ABOUT_CORRECTION_URL ?? 'http://127.0.0.1:4393');
const output = path.resolve(argument('--out', 'artifacts/services-hero'));
const nativeDirectory = path.resolve('/tmp/drawnout-services-hero-about-native');
const previewOnly = process.argv.includes('--preview-only');
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: argument(
    '--source-commit',
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  ),
  aboutSourceFiles: Object.fromEntries(
    await Promise.all(
      [
        'src/components/about/AboutPage.astro',
        'src/components/about/FounderPortrait.astro',
        'src/styles/about.css',
        'src/scripts/about-motion.ts',
        'src/components/BrandEmblem.astro',
        'src/pages/about.astro',
      ].map(async (filename) => [
        filename,
        createHash('sha256')
          .update(await readFile(filename))
          .digest('hex'),
      ]),
    ),
  ),
  baseURL,
  route: '/about',
  captureMode: previewOnly ? 'private-quick-preview' : 'complete-about-correction-evidence',
  method:
    'Unedited production-browser screenshots at DPR 1 and native real-time Playwright recordings transcoded at unchanged speed to silent H.264 MP4. No animation seeking, replacement CSS or fabricated frames. Process footage uses native document scrolling, including rapid reversal. Software rendering is not a physical-device performance benchmark.',
  artwork:
    'The previously approved derived raster portrait is unchanged. This revised arrival moves the complete portrait, high-resolution emblem and circle together; it does not draw independent portrait strokes. No private original photograph or rejected candidate is used.',
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
    path.join(output, 'about-capture-evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );

function watch(page, width, mode) {
  page.on('pageerror', (error) => evidence.errors.push({ width, mode, error: error.message }));
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
    const hero = document.querySelector('[data-about-hero]');
    const composition = document.querySelector('[data-about-composition]');
    const portrait = document.querySelector('[data-about-portrait-raster]');
    const box = composition.getBoundingClientRect();
    return {
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map((node) =>
        node.textContent.replace(/\s+/g, ' ').trim(),
      ),
      chapters: document.querySelectorAll('[data-about-page] > section').length,
      robots: document.querySelector('meta[name="robots"]').content,
      overlayCount: document.querySelectorAll('[data-signature-intro-overlay]').length,
      entrance: hero.dataset.aboutEntrance,
      phase: hero.dataset.aboutHeroPhase,
      settleReason: hero.dataset.aboutSettleReason,
      startedAt: Number(hero.dataset.aboutStartedAt) || null,
      endedAt: Number(hero.dataset.aboutEndedAt) || null,
      sampledAt: performance.now(),
      background: getComputedStyle(hero).backgroundColor,
      composition: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        center: box.x + box.width / 2,
        transform: getComputedStyle(composition).transform,
      },
      mask: portrait.getAttribute('mask'),
      fullImageFit: portrait.getAttribute('preserveAspectRatio'),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

async function screenshot(
  page,
  filename,
  description,
  { target, fullPage = false, mode = 'normal-motion' } = {},
) {
  const buffer = target
    ? await page
        .locator(target)
        .screenshot({ path: path.join(output, filename), animations: 'allow' })
    : await page.screenshot({ path: path.join(output, filename), fullPage, animations: 'allow' });
  const observed = await facts(page);
  assert.equal(observed.overflow, false);
  assert.equal(observed.overlayCount, 0);
  assert.equal(observed.chapters, 7);
  assert.equal(observed.robots, 'noindex, nofollow');
  assert.equal(observed.mask, null);
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

async function open(page) {
  assert.equal((await page.goto('/about', { waitUntil: 'commit' })).status(), 200);
  await page.waitForSelector('[data-about-hero]');
  await page.evaluate(() => document.fonts.ready);
}

async function settled(page) {
  await page.waitForFunction(() =>
    ['settled', 'static'].includes(
      document.querySelector('[data-about-hero]')?.dataset.aboutEntrance,
    ),
  );
}

async function warmFullPage(page) {
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode()));
    await Promise.all(
      [...document.querySelectorAll('svg image')].map(async (node) => {
        const image = new Image();
        image.src = node.href.baseVal;
        await image.decode();
      }),
    );
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(150);
}

function transcode(source, filename) {
  const destination = path.join(output, filename);
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
    '24',
    '-threads',
    '2',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    destination,
  ]);
  const metadata = JSON.parse(
    execFileSync(
      process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe',
      ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination],
      { encoding: 'utf8' },
    ),
  );
  assert.equal(metadata.streams.filter(({ codec_type }) => codec_type === 'audio').length, 0);
  return {
    filename,
    durationSeconds: Number(metadata.format.duration),
    bytes: Number(metadata.format.size),
    streams: metadata.streams
      .filter(({ codec_type }) => codec_type === 'video')
      .map(({ codec_name, width, height, r_frame_rate }) => ({
        codec: codec_name,
        width,
        height,
        frameRate: r_frame_rate,
      })),
  };
}

async function processScroll(page, progress, duration) {
  await page.locator('[data-about-process-system]').evaluate(
    async (node, values) => {
      const box = node.getBoundingClientRect();
      const start = box.top + scrollY - innerHeight * 0.84;
      const end = box.top + scrollY + box.height - innerHeight * 0.34;
      const from = scrollY;
      const target = start + (end - start) * values.progress;
      const time = performance.now();
      await new Promise((resolve) => {
        const frame = () => {
          const progress = Math.min(1, (performance.now() - time) / values.duration);
          window.scrollTo({ top: from + (target - from) * progress, behavior: 'instant' });
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    },
    { progress, duration },
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  return page.locator('[data-about-process-system]').evaluate((node) => ({
    progress: Number(node.dataset.aboutProcessProgress),
    scrollProgress: Number(node.dataset.aboutScrollProgress),
    offset: Number.parseFloat(
      getComputedStyle(node.querySelector('[data-about-process-line]')).strokeDashoffset,
    ),
    scrollY,
  }));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    watch(page, width, 'reduced-motion-preview');
    await open(page);
    await settled(page);
    await page.evaluate(async () =>
      Promise.all(
        [...document.querySelectorAll('svg image')].map(async (node) => {
          const image = new Image();
          image.src = node.href.baseVal;
          await image.decode();
        }),
      ),
    );
    await screenshot(
      page,
      `about-${width}-hero.png`,
      'Complete settled dark hero, approved portrait and large emblem.',
      { target: '[data-about-hero]', mode: 'reduced-motion' },
    );
    await context.close();
  }
  console.log(
    JSON.stringify({
      phase: 'settled-hero-previews',
      files: ['about-1440-hero.png', 'about-390-hero.png'],
    }),
  );
  for (const width of [390, 1440]) {
    const viewport = viewportFor(width);
    const context = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      recordVideo: { dir: nativeDirectory, size: viewport },
    });
    const page = await context.newPage();
    watch(page, width, 'normal-arrival');
    await open(page);
    await page.waitForFunction(
      () => document.querySelector('[data-about-hero]')?.dataset.aboutEntrance === 'running',
    );
    await page.waitForFunction(
      () =>
        performance.now() -
          Number(document.querySelector('[data-about-hero]').dataset.aboutStartedAt) >=
        400,
    );
    const centered = await facts(page);
    assert.equal(centered.phase, 'center');
    assert(Math.abs(centered.composition.center - width / 2) < width * 0.05);
    await screenshot(
      page,
      `about-${width}-center.png`,
      'Actual centered full portrait, emblem and supporting circle during the opening hold.',
    );
    await page.waitForFunction(
      () =>
        performance.now() -
          Number(document.querySelector('[data-about-hero]').dataset.aboutStartedAt) >=
        1500,
    );
    const transition = await facts(page);
    await screenshot(
      page,
      `about-${width}-transition.png`,
      'Actual mid-transition composition while moving right and revealing the editorial text.',
    );
    await page.waitForFunction(
      () =>
        performance.now() -
          Number(document.querySelector('[data-about-hero]').dataset.aboutStartedAt) >=
        2100,
    );
    await screenshot(
      page,
      `about-${width}-copy-entry.png`,
      'Actual late transition at approximately 2.1 seconds, verifying headline clearance as the composition reaches its final position.',
    );
    await settled(page);
    const final = await facts(page);
    assert.equal(final.settleReason, 'complete');
    assert(final.endedAt - final.startedAt <= 4200);
    assert(
      final.composition.center > centered.composition.center + (width < 768 ? 8 : width * 0.12),
    );
    await page.waitForTimeout(900);
    await screenshot(
      page,
      `about-${width}-settled-viewport.png`,
      'Actual settled dark hero viewport after the nonblocking arrival.',
    );
    evidence.measurements.push({ width, scene: 'arrival', centered, transition, final });
    await context.close();
    evidence.recordings.push({
      ...transcode(await page.video().path(), `about-${width}-arrival.mp4`),
      width,
      scene: 'arrival',
    });
    await save();

    if (previewOnly) continue;

    const scrollContext = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      recordVideo: { dir: nativeDirectory, size: viewport },
    });
    const scrollPage = await scrollContext.newPage();
    watch(scrollPage, width, 'process-scroll');
    await open(scrollPage);
    await scrollPage.keyboard.press('Escape');
    await settled(scrollPage);
    await scrollPage.waitForFunction(
      () => document.querySelector('[data-about-page]').dataset.aboutMotion === 'ready',
    );
    const samples = [];
    for (const [progress, duration] of [
      [0.12, 900],
      [0.58, 900],
      [0.9, 300],
      [0.24, 250],
      [0.76, 180],
      [0.04, 180],
      [0.5, 600],
    ]) {
      const observed = await processScroll(scrollPage, progress, duration);
      assert(Math.abs(observed.progress - observed.scrollProgress) < 0.02);
      assert(Math.abs(observed.offset - (1 - observed.scrollProgress)) < 0.025);
      samples.push({ requested: progress, duration, ...observed });
      await scrollPage.waitForTimeout(300);
    }
    await screenshot(
      scrollPage,
      `about-${width}-process-midpoint.png`,
      'Actual half-drawn process connector after rapid forward/reverse native scrolling.',
    );
    await scrollPage.waitForTimeout(800);
    evidence.measurements.push({ width, scene: 'process', samples });
    await scrollContext.close();
    evidence.recordings.push({
      ...transcode(await scrollPage.video().path(), `about-${width}-process-sync.mp4`),
      width,
      scene: 'process-forward-reverse',
    });
    await save();
  }
  for (const width of previewOnly ? [] : [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    watch(page, width, 'reduced-motion');
    await open(page);
    await settled(page);
    await warmFullPage(page);
    await screenshot(
      page,
      `about-${width}-full-reduced.png`,
      'All seven retained chapters with the supported reduced-motion fallback.',
      { fullPage: true, mode: 'reduced-motion' },
    );
    if (![390, 1440].includes(width))
      await screenshot(
        page,
        `about-${width}-hero.png`,
        'Complete settled dark hero, approved portrait and large emblem.',
        { target: '[data-about-hero]', mode: 'reduced-motion' },
      );
    await context.close();
  }
  for (const width of previewOnly ? [] : [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      deviceScaleFactor: 1,
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    watch(page, width, 'no-JavaScript');
    await open(page);
    await warmFullPage(page);
    await screenshot(
      page,
      `about-${width}-full-no-js.png`,
      'Complete dark About page without JavaScript.',
      { fullPage: true, mode: 'no-JavaScript' },
    );
    await screenshot(
      page,
      `about-${width}-hero-no-js.png`,
      'Full settled illustration/emblem and copy without JavaScript.',
      { target: '[data-about-hero]', mode: 'no-JavaScript' },
    );
    await context.close();
  }
} finally {
  await browser.close();
}
for (const { filename, sha256 } of evidence.screenshots)
  assert.equal(
    createHash('sha256')
      .update(await readFile(path.join(output, filename)))
      .digest('hex'),
    sha256,
  );
await save();
const gallery = [
  '# About correction — actual production evidence',
  '',
  'Unedited browser frames and native real-time MP4s for the revised dark About arrival and directly synchronized process. Historical About evidence remains unchanged in `artifacts/about`.',
  '',
  '[Capture measurements and hashes](about-capture-evidence.json) · [Browser acceptance report](about-browser-tests.json)',
  '',
];
for (const width of [1440, 390])
  gallery.push(
    `## ${width}px arrival and process`,
    '',
    `![Centered full founder/emblem composition at ${width}px](about-${width}-center.png)`,
    '',
    `![Actual transition at ${width}px](about-${width}-transition.png)`,
    '',
    `![Actual copy entry at ${width}px](about-${width}-copy-entry.png)`,
    '',
    `![Settled dark hero at ${width}px](about-${width}-hero.png)`,
    '',
    `[Real-time arrival MP4](about-${width}-arrival.mp4) · [Fast process forward/reverse MP4](about-${width}-process-sync.mp4)`,
    '',
    `![Half-drawn process at ${width}px](about-${width}-process-midpoint.png)`,
    '',
  );
gallery.push('## Responsive reduced-motion layouts', '');
for (const width of [320, 390, 768, 1440])
  gallery.push(`![Complete About page at ${width}px](about-${width}-full-reduced.png)`, '');
gallery.push('## No-JavaScript fallback', '');
for (const width of [390, 1440])
  gallery.push(`![Native no-JavaScript page at ${width}px](about-${width}-full-no-js.png)`, '');
gallery.push(
  'The approved portrait is unchanged raster artwork. No private photograph is included. These Chromium software-rendering observations do not establish physical-device performance or Safari/Firefox behavior. No merge or deployment is performed by capture.',
  '',
);
await writeFile(path.join(output, 'about-README.md'), gallery.join('\n'));
console.log(
  JSON.stringify({
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    errors: evidence.errors,
    failedRequests: evidence.failedRequests,
    output,
  }),
);
