import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, navigator, performance, getComputedStyle, scrollY, innerHeight */
// Real browser captures: no application timeline seeking, injected styles or synthesized frames.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4420');
const output = path.resolve(argument('--out', 'artifacts/work-immersive'));
const native = path.resolve(argument('--native-dir', '/workspace/work-immersive-review/native'));
const only = argument('--only', 'all');
assert(['all', 'recordings', 'stills', 'full-pages'].includes(only));
const widthsArgument = argument('--widths', '');
const widths = widthsArgument ? widthsArgument.split(',').map(Number) : [1440, 390];
const viewport = (width) => ({ width, height: width < 768 ? 844 : 900 });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = path.join(output, 'capture-evidence.json');
let previous;
try {
  previous = JSON.parse(await readFile(manifest, 'utf8'));
} catch {
  // A first capture has no earlier evidence.
}
const sourcePaths = [
  'src/pages/work.astro',
  'src/components/work/WorkPortfolio.astro',
  'src/components/work/WorkCard.astro',
  'src/scripts/work-immersive.ts',
  'src/scripts/portfolio-motion.ts',
  'src/scripts/portfolio-titles.ts',
  'src/components/MediaSlot.astro',
  'src/lib/portfolio-motion-policy.ts',
];
const sourceFiles = Object.fromEntries(
  await Promise.all(sourcePaths.map(async (file) => [file, hash(await readFile(file))])),
);
if (previous && only !== 'all')
  assert.deepEqual(previous.sourceFiles, sourceFiles, 'Preserved media must match source files');
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles,
  baseURL,
  method:
    'Real production Chromium viewport screenshots and native Playwright browser videos. H.264 transcodes retain original timing. Native wheel input drives forward and reverse expansion; controls and real links are operated through browser input. No timeline seeking, style injection or synthesized frames. Full-page stills use the software compositor to avoid cloud SwiftShader tall-image repetition. Mobile is Chromium touch/viewport emulation, not a physical-device benchmark.',
  browser: '',
  screenshots: only === 'all' ? [] : (previous?.screenshots ?? []),
  recordings: only === 'all' ? [] : (previous?.recordings ?? []),
  measurements: only === 'all' ? [] : (previous?.measurements ?? []),
  errors: [],
  failedRequests: [],
};
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const save = () => writeFile(manifest, `${JSON.stringify(evidence, null, 2)}\n`);
const options = (width) => ({
  baseURL,
  viewport: viewport(width),
  deviceScaleFactor: 1,
  hasTouch: width < 768,
  reducedMotion: 'no-preference',
});
function watch(page, width, mode) {
  page.on('pageerror', (error) => evidence.errors.push({ width, mode, message: error.message }));
  page.on('requestfailed', (request) => {
    // Native navigation can cancel an outgoing media request. Retain it in the
    // evidence without treating a deliberate navigation cancellation as a crash.
    evidence.failedRequests.push({
      width,
      mode,
      url: request.url(),
      error: request.failure()?.errorText,
      navigationCancellation: request.failure()?.errorText === 'net::ERR_ABORTED',
    });
  });
}
async function facts(page) {
  return page.evaluate(() => {
    const rect = (node) => {
      if (!node) return null;
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    return {
      at: performance.now(),
      url: window.location.pathname + window.location.search,
      scrollY,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      scenes: [...document.querySelectorAll('[data-work-scene]')].map((scene) => ({
        slug: scene.dataset.projectSlug,
        hidden: scene.hidden,
        progress: Number(getComputedStyle(scene).getPropertyValue('--work-progress')),
        enhanced: scene.hasAttribute('data-work-enhanced'),
        presentation: scene.dataset.projectPresentation,
        bounds: rect(scene),
        composition: rect(scene.querySelector('[data-work-composition]')),
        frame: rect(scene.querySelector('[data-work-frame]')),
        caption: rect(scene.querySelector('[data-portfolio-caption]')),
        title: scene.querySelector('[data-portfolio-title]')?.textContent.trim(),
        reveal: scene.querySelector('[data-portfolio-caption]')?.dataset.portfolioReveal,
        video: [...scene.querySelectorAll('[data-portfolio-video]')].map((video) => ({
          id: video.id,
          source: video.currentSrc,
          time: video.currentTime,
          state: video.dataset.motionState,
          paused: video.paused,
        })),
      })),
    };
  });
}
async function ready(page, normal = true) {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  if (normal) await page.waitForSelector('[data-work-scene][data-work-enhanced]');
  assert.equal((await facts(page)).overflow, false);
}
async function shot(page, file, description, { fullPage = false, mode = 'normal' } = {}) {
  const before = await facts(page);
  assert.equal(before.overflow, false, `Horizontal overflow while capturing ${file}`);
  const bytes = await page.screenshot({
    path: path.join(output, file),
    fullPage,
    animations: 'allow',
  });
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
async function wheelTo(page, target, { step = 46, delay = 36 } = {}) {
  const destination = Math.max(
    0,
    Math.min(
      target,
      await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    ),
  );
  let current = await page.evaluate(() => scrollY);
  let count = 0;
  while (Math.abs(destination - current) > 3 && count++ < 500) {
    await page.mouse.wheel(
      0,
      Math.sign(destination - current) * Math.min(step, Math.abs(destination - current)),
    );
    await page.waitForTimeout(delay);
    current = await page.evaluate(() => scrollY);
  }
  assert(
    Math.abs(destination - current) <= 4,
    `Wheel destination ${destination}, actual ${current}`,
  );
  await page.waitForTimeout(140);
}
async function scrollProgress(page, slug, progress, scrollOptions) {
  const target = await page
    .locator(`[data-work-scene][data-project-slug="${slug}"]`)
    .evaluate((scene, fraction) => {
      const style = getComputedStyle(scene);
      const start = Number(style.getPropertyValue('--work-scroll-start'));
      const end = Number(style.getPropertyValue('--work-scroll-end'));
      return (
        scene.getBoundingClientRect().top +
        scrollY -
        innerHeight * (start + (end - start) * fraction)
      );
    }, progress);
  await wheelTo(page, target, scrollOptions);
  await page.waitForTimeout(850);
  const state = await facts(page);
  const scene = state.scenes.find((item) => item.slug === slug);
  assert(scene, `Missing ${slug}`);
  assert(
    Math.abs(scene.progress - progress) < 0.025,
    `Expected ${progress}, actual ${scene.progress}`,
  );
  assert(
    scene.caption.y >= 0 && scene.caption.y + scene.caption.height <= page.viewportSize().height,
    `Caption must remain visible at ${slug} progress ${progress}`,
  );
  return state;
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
  evidence.recordings = evidence.recordings.filter((item) => item.file !== file);
  evidence.recordings.push({
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
  });
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  if (only === 'all' || only === 'recordings') {
    for (const width of widths) {
      const context = await browser.newContext({
        ...options(width),
        recordVideo: { dir: native, size: viewport(width) },
      });
      const page = await context.newPage();
      watch(page, width, 'forward-and-reverse');
      const video = page.video();
      assert.equal((await page.goto('/work')).status(), 200);
      await ready(page);
      await page.waitForTimeout(900);
      await shot(
        page,
        `work-${width}-entry.png`,
        'Existing editorial entry and responsive navigation, before browsing the index.',
      );
      const snapshots = [];
      for (const slug of ['bunzo', 'sol-community-center', 'triarch', 'churros']) {
        for (const progress of [0, 0.5, 1]) {
          const state = await scrollProgress(page, slug, progress);
          snapshots.push({ direction: 'forward', slug, progress, state });
          if (['bunzo', 'sol-community-center'].includes(slug))
            await shot(
              page,
              `work-${width}-${slug}-${progress * 100}.png`,
              `${slug} at measured ${progress * 100}% expansion with its connected title and metadata in the viewport.`,
            );
        }
        await page.waitForTimeout(900);
        if (['triarch', 'churros'].includes(slug))
          await shot(
            page,
            `work-${width}-${slug}-expanded.png`,
            `${slug} fully expanded in the first-four editorial rhythm.`,
          );
      }
      for (const slug of ['churros', 'triarch', 'sol-community-center', 'bunzo'])
        for (const progress of [1, 0.5, 0])
          snapshots.push({
            direction: 'reverse',
            slug,
            progress,
            state: await scrollProgress(page, slug, progress),
          });
      await page.waitForTimeout(800);
      evidence.measurements.push({ kind: 'forward-and-reverse', width, snapshots });
      await context.close();
      transcode(
        await video.path(),
        `work-${width}-forward-and-reverse.mp4`,
        width,
        'forward-and-reverse',
      );
      await save();

      const interactions = await browser.newContext({
        ...options(width),
        recordVideo: { dir: native, size: viewport(width) },
      });
      const active = await interactions.newPage();
      watch(active, width, 'filters-and-navigation');
      const interactionVideo = active.video();
      await active.goto('/work');
      await ready(active);
      const controlsTop = await active
        .locator('[data-work-filters]')
        .evaluate((node) => node.getBoundingClientRect().top + scrollY - 110);
      await wheelTo(active, controlsTop, { step: 90, delay: 40 });
      const available = await active
        .locator('[data-filter]')
        .evaluateAll((buttons) =>
          buttons.map((button) => ({
            value: button.dataset.filter,
            label: button.dataset.filterLabel,
          })),
        );
      const category =
        available.find(({ value }) => value === 'packaging') ??
        available.find(({ value }) => value !== 'all');
      assert(category);
      const button = active.locator(`[data-filter="${category.value}"]`);
      if (width < 768) await button.tap();
      else {
        await button.focus();
        await active.keyboard.press('Enter');
      }
      await active.waitForTimeout(900);
      assert.equal(new URL(active.url()).searchParams.get('category'), category.value);
      await shot(
        active,
        `work-${width}-filter.png`,
        `${category.label} selected through ${width < 768 ? 'touch' : 'keyboard'} input; URL and visible project count updated.`,
      );
      const selected = await facts(active);
      const firstVisible = selected.scenes.find((scene) => !scene.hidden);
      await scrollProgress(active, firstVisible.slug, 1);
      await active.waitForTimeout(900);
      await active.goBack();
      await active.waitForTimeout(650);
      assert.equal(new URL(active.url()).searchParams.get('category'), null);
      const back = await facts(active);
      await active.goForward();
      await active.waitForTimeout(650);
      assert.equal(new URL(active.url()).searchParams.get('category'), category.value);
      const forward = await facts(active);
      await wheelTo(active, controlsTop, { step: 90, delay: 40 });
      await active.locator('[data-filter="all"]').click();
      await scrollProgress(active, 'bunzo', 1);
      await active.locator('[data-project-slug="bunzo"] a[href="/work/bunzo"]').click();
      await active.waitForURL('**/work/bunzo');
      await active.waitForLoadState('load');
      await active.waitForTimeout(1000);
      await shot(
        active,
        `work-${width}-case-bunzo.png`,
        'Real Bunzo case-study navigation from the native Work link; existing case layout is preserved.',
      );
      assert.equal(
        await active
          .locator('[data-case-facts], [data-case-narrative], [data-case-evidence]')
          .count(),
        0,
      );
      const next = active.locator('[data-case-next]');
      const nextHref = await next.getAttribute('href');
      await wheelTo(
        active,
        await next.evaluate((node) => node.getBoundingClientRect().top + scrollY - 100),
        { step: 180, delay: 35 },
      );
      await active.waitForTimeout(750);
      await next.click();
      await active.waitForURL(`**${nextHref}`);
      await active.waitForLoadState('load');
      await active.waitForTimeout(900);
      await shot(
        active,
        `work-${width}-case-next.png`,
        'Existing next-project navigation opens the real neighboring case-study route.',
      );
      const previousLink = active.locator('[data-case-previous]');
      const previousHref = await previousLink.getAttribute('href');
      await wheelTo(
        active,
        await previousLink.evaluate((node) => node.getBoundingClientRect().top + scrollY - 120),
        { step: 260, delay: 32 },
      );
      await previousLink.click();
      await active.waitForURL(`**${previousHref}`);
      await active.waitForTimeout(900);
      evidence.measurements.push({
        kind: 'filters-and-navigation',
        width,
        category,
        selected,
        back,
        forward,
        nextHref,
        previousHref,
        finalURL: active.url(),
      });
      await interactions.close();
      transcode(
        await interactionVideo.path(),
        `work-${width}-filters-and-navigation.mp4`,
        width,
        'filters-and-navigation',
      );
      await save();
    }
  }
  if (only === 'all' || only === 'stills') {
    const tablet = await browser.newContext(options(768));
    const page = await tablet.newPage();
    watch(page, 768, 'tablet');
    await page.goto('/work');
    await ready(page);
    await shot(page, 'work-768-entry.png', 'Tablet editorial entry and category filters.');
    await scrollProgress(page, 'sol-community-center', 1);
    await shot(
      page,
      'work-768-sol-community-center-expanded.png',
      'SOL expanded on the 768px tablet composition.',
    );
    await tablet.close();
    for (const width of widths)
      for (const mode of ['reduced-motion', 'save-data', 'no-js']) {
        const context = await browser.newContext({
          ...options(width),
          reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
          javaScriptEnabled: mode !== 'no-js',
        });
        if (mode === 'save-data')
          await context.addInitScript(() =>
            Object.defineProperty(navigator, 'connection', { value: { saveData: true } }),
          );
        const fallback = await context.newPage();
        watch(fallback, width, mode);
        await fallback.goto('/work');
        await ready(fallback, false);
        await wheelTo(
          fallback,
          await fallback
            .locator('[data-project-slug="sol-community-center"]')
            .evaluate((node) => node.getBoundingClientRect().top + scrollY - 95),
          { step: 180, delay: 32 },
        );
        await fallback.waitForTimeout(450);
        assert.equal(await fallback.locator('[data-portfolio-video][src]').count(), 0);
        assert.equal(await fallback.locator('[data-work-scene][data-work-enhanced]').count(), 0);
        await shot(
          fallback,
          `work-${width}-${mode}.png`,
          `SOL's static, readable ${mode} fallback with no mounted portfolio video.`,
          { mode },
        );
        await context.close();
      }
  }
} finally {
  await browser.close();
  await save();
}
if (only === 'all' || only === 'full-pages') {
  const software = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    args: ['--disable-gpu'],
  });
  try {
    for (const width of widths) {
      const context = await software.newContext(options(width));
      const page = await context.newPage();
      watch(page, width, 'full-page');
      await page.goto('/work');
      await ready(page);
      await wheelTo(page, await page.evaluate(() => document.documentElement.scrollHeight), {
        step: 620,
        delay: 70,
      });
      await page.waitForTimeout(700);
      await wheelTo(page, 0, { step: 700, delay: 70 });
      await shot(
        page,
        `work-${width}-full-page.png`,
        'Complete Work page after visiting every scene to load lazy artwork, captured at the real top-of-page scroll position. Offscreen scenes retain their native scroll geometry. Native Chromium software-compositor capture avoids tall-image repetition.',
        { fullPage: true },
      );
      await context.close();
    }
  } finally {
    await software.close();
    await save();
  }
}
assert.equal(evidence.errors.length, 0, JSON.stringify(evidence.errors));
assert.equal(
  evidence.failedRequests.filter((request) => !request.navigationCancellation).length,
  0,
  JSON.stringify(evidence.failedRequests),
);
console.log(
  JSON.stringify({
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    errors: evidence.errors.length,
    failedRequests: evidence.failedRequests.length,
    manifest,
  }),
);
