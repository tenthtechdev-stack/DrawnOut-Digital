import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, performance, scrollY, innerHeight, navigator, EventTarget */
// Browser evidence only: native input, no injected CSS, no seeking or synthetic frames.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4440');
const output = path.resolve(argument('--out', 'artifacts/case-rollout'));
const native = path.resolve(argument('--native-dir', '/workspace/case-rollout-review/native'));
const only = argument('--only', 'all');
assert(['all', 'recordings', 'stills', 'full-pages'].includes(only));
const widths = argument('--widths', '1440,390').split(',').map(Number);
const projects = [
  'churros',
  'khalo',
  'fk-technology',
  'feed-n-seed',
  'abacus-immigration',
  'u-wanna-smoothie',
];
const titles = {
  churros: 'Churros Dessert Shop',
  khalo: 'Khalo',
  'fk-technology': 'FK Technology',
  'feed-n-seed': 'Feed N Seed',
  'abacus-immigration': 'Abacus Immigration',
  'u-wanna-smoothie': 'U Wanna Smoothie',
};
const viewport = (width) => ({ width, height: width < 768 ? 844 : 900 });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = path.join(output, 'capture-evidence.json');
let previous;
try {
  previous = JSON.parse(await readFile(manifest, 'utf8'));
} catch {
  // No earlier capture exists.
}
const candidates = [
  'src/pages/work/[slug].astro',
  'src/components/case/PremiumCaseStudy.astro',
  'src/components/case/PremiumCaseGallery.astro',
  'src/styles/case-premium.css',
  'src/lib/case-presentation.ts',
  'src/data/case-pilots.ts',
  'src/scripts/case-premium-motion.ts',
  'src/scripts/portfolio-motion.ts',
  'src/components/MediaSlot.astro',
  'src/components/PortfolioMotionToggle.astro',
  'src/lib/portfolio-motion-policy.ts',
];
const sourceFiles = {};
for (const file of candidates) {
  try {
    await access(file);
    sourceFiles[file] = hash(await readFile(file));
  } catch {
    // Optional stylesheet/data module names differ with component ownership.
  }
}
assert(
  sourceFiles['src/components/case/PremiumCaseStudy.astro'],
  'Build the approved case-study rollout first',
);
if (previous && only !== 'all')
  assert.deepEqual(previous.sourceFiles, sourceFiles, 'Preserved media must match app source');
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles,
  baseURL,
  method:
    'Real production Chromium viewport screenshots and native Playwright browser videos. Native wheel input drives forward/reverse browsing; real links provide previous/next-project and Work navigation. H.264 transcodes retain browser timing. The Churros and U Wanna Smoothie loops visibly play for at least eight seconds each without seeking. Full-page stills use a separate software compositor to avoid cloud SwiftShader tall-image repetition. Mobile is Chromium touch/viewport emulation, not physical-device testing.',
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
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      width,
      mode,
      url: request.url(),
      error: request.failure()?.errorText,
      deliberateCancellation: request.failure()?.errorText === 'net::ERR_ABORTED',
    }),
  );
}
async function facts(page) {
  return page.evaluate(() => {
    const rect = (node) => {
      if (!node) return null;
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    const root = document.querySelector('[data-premium-case], [data-case-premium]');
    return {
      at: performance.now(),
      url: window.location.pathname,
      scrollY,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      slug: root?.getAttribute('data-project-slug'),
      title: root?.querySelector('h1')?.textContent.trim(),
      hero: rect(root?.querySelector('[data-case-hero]')),
      gallery: rect(root?.querySelector('[data-case-gallery]')),
      variant: root?.querySelector('[data-case-mosaic]')?.getAttribute('data-case-mosaic'),
      images: [...(root?.querySelectorAll('[data-case-gallery] picture img') ?? [])].map((img) => ({
        source: img.currentSrc,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        bounds: rect(img),
      })),
      videos: [...(root?.querySelectorAll('[data-portfolio-video]') ?? [])].map((video) => ({
        id: video.id,
        source: video.currentSrc,
        time: video.currentTime,
        paused: video.paused,
        state: video.dataset.motionState,
        bounds: rect(video),
      })),
    };
  });
}
async function ready(page) {
  await page.waitForLoadState('load');
  await page.waitForSelector('[data-premium-case], [data-case-premium]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(850);
  assert.equal((await facts(page)).overflow, false);
}
async function wheelTo(page, target, { step = 74, delay = 34 } = {}) {
  const destination = Math.max(
    0,
    Math.min(
      target,
      await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    ),
  );
  let current = await page.evaluate(() => scrollY);
  let count = 0;
  while (Math.abs(destination - current) > 3 && count++ < 600) {
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
async function align(page, locator, offset = 120, scrollOptions) {
  const target = await locator.evaluate(
    (node, inset) => node.getBoundingClientRect().top + scrollY - inset,
    offset,
  );
  await wheelTo(page, target, scrollOptions);
  await page.waitForTimeout(700);
}
async function shot(page, file, description, { fullPage = false, mode = 'normal' } = {}) {
  const before = await facts(page);
  assert.equal(before.overflow, false, `Horizontal overflow in ${file}`);
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
async function galleryView(page) {
  const gallery = page.locator('[data-case-gallery]');
  // Visit the actual gallery once so ordinary lazy loading and reveals settle.
  const bottom = await gallery.evaluate(
    (node) => node.getBoundingClientRect().bottom + scrollY - innerHeight + 100,
  );
  await wheelTo(page, bottom, { step: 190, delay: 30 });
  await align(page, gallery, 120, { step: 160, delay: 30 });
}
async function playback(page, slug, width) {
  const video = page.locator(`#case-motion-${slug}`);
  const target = await video.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return scrollY + box.top - (innerHeight - box.height) / 2;
  });
  await wheelTo(page, target);
  await page.waitForFunction(
    (id) => document.getElementById(id)?.dataset.motionState === 'playing',
    `case-motion-${slug}`,
  );
  const samples = [];
  const start = await page.evaluate(() => performance.now());
  for (let index = 0; index < 18; index += 1) {
    samples.push(
      await video.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return {
          at: performance.now(),
          time: node.currentTime,
          paused: node.paused,
          source: node.currentSrc,
          state: node.dataset.motionState,
          visibleRatio:
            Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0)) / box.height,
        };
      }),
    );
    await page.waitForTimeout(500);
  }
  const end = await page.evaluate(() => performance.now());
  assert(end - start >= 8_000);
  assert(
    samples.every(
      (sample) => !sample.paused && sample.state === 'playing' && sample.visibleRatio >= 0.35,
    ),
  );
  assert(
    new Set(samples.map((sample) => sample.time)).size >= 12,
    'Footage must actually decode and advance',
  );
  assert.equal(
    new Set(samples.map((sample) => sample.source)).size,
    1,
    'Playback source must remain stable',
  );
  evidence.measurements.push({
    kind: 'visible-approved-playback',
    slug,
    width,
    elapsedMs: end - start,
    samples,
  });
  await save();
}
function transcode(source, file, width) {
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
      watch(page, width, 'rollout-journey');
      const nativeVideo = page.video();
      await page.goto('/work/churros');
      await ready(page);
      await playback(page, 'churros', width);
      await shot(
        page,
        `case-${width}-churros-motion.png`,
        'Approved Churros footage after more than eight seconds of actual visible playback.',
      );
      await galleryView(page);
      await shot(
        page,
        `case-${width}-churros-journey-gallery.png`,
        'Churros gallery during native forward browsing.',
      );
      await align(page, page.locator('[data-case-interlude], [data-case-overview]').first());
      await align(page, page.locator('[data-case-gallery]'), 120, { step: 120, delay: 30 });
      await align(page, page.locator('[data-case-navigation]'), 130, { step: 180, delay: 30 });
      await page.locator('[data-case-next]').click();
      await page.waitForURL('**/work/capture');
      await ready(page);
      await shot(
        page,
        `case-${width}-next-capture.png`,
        'Existing next-project link opens the previously approved Capture pilot.',
      );
      await align(page, page.locator('[data-case-navigation]'), 130, { step: 220, delay: 30 });
      await page.locator('[data-case-previous]').click();
      await page.waitForURL('**/work/churros');
      await ready(page);
      await wheelTo(page, 0, { step: 180, delay: 30 });
      await page.locator('[data-premium-case] a[href="/work"]').first().click();
      await page.waitForURL('**/work');
      await page.waitForLoadState('load');
      await page.evaluate(() => document.fonts.ready);
      const smoothieLink = page.locator(
        '[data-work-card][data-project-slug="u-wanna-smoothie"] a[href="/work/u-wanna-smoothie"]',
      );
      await align(page, smoothieLink, 130, { step: 250, delay: 30 });
      await smoothieLink.click();
      await page.waitForURL('**/work/u-wanna-smoothie');
      await ready(page);
      await playback(page, 'u-wanna-smoothie', width);
      await shot(
        page,
        `case-${width}-u-wanna-smoothie-motion.png`,
        'Approved U Wanna Smoothie footage after more than eight seconds of actual visible playback.',
      );
      await galleryView(page);
      await align(page, page.locator('[data-case-interlude], [data-case-overview]').first());
      await align(page, page.locator('[data-case-gallery]'), 120, { step: 95, delay: 30 });
      await wheelTo(page, 0, { step: 140, delay: 30 });
      const allWork = page.locator('[data-premium-case] a[href="/work"]').first();
      await allWork.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/work');
      await page.waitForLoadState('load');
      await page.waitForTimeout(900);
      await shot(
        page,
        `case-${width}-return-work.png`,
        'Native All Work navigation returns to the approved eleven-project index.',
      );
      evidence.measurements.push({
        kind: 'native-navigation',
        width,
        sequence: [
          '/work/churros',
          '/work/capture',
          '/work/churros',
          '/work',
          '/work/u-wanna-smoothie',
          '/work',
        ],
        finalURL: page.url(),
        workScenes: await page.locator('[data-work-scene]').count(),
      });
      await context.close();
      transcode(await nativeVideo.path(), `case-${width}-churros-smoothie-journey.mp4`, width);
      await save();
    }
  }
  if (only === 'all' || only === 'stills') {
    for (const width of widths) {
      const context = await browser.newContext(options(width));
      const page = await context.newPage();
      watch(page, width, 'rollout-stills');
      for (const slug of projects) {
        await page.goto(`/work/${slug}`);
        await ready(page);
        await shot(
          page,
          `case-${width}-${slug}-arrival.png`,
          `${titles[slug]}: complete editorial arrival at ${width}px.`,
        );
        await galleryView(page);
        await shot(
          page,
          `case-${width}-${slug}-mosaic.png`,
          `${titles[slug]}: curated responsive artwork composition at ${width}px.`,
        );
        await align(page, page.locator('[data-case-interlude], [data-case-overview]').first());
        await shot(
          page,
          `case-${width}-${slug}-editorial.png`,
          `${titles[slug]}: artwork-grounded editorial statement and navigation context.`,
        );
      }
      await context.close();
    }
    for (const width of [320, 768, 1024]) {
      const context = await browser.newContext(options(width));
      const page = await context.newPage();
      watch(page, width, 'responsive-stills');
      await page.goto('/work/churros');
      await ready(page);
      await shot(
        page,
        `case-${width}-churros-arrival.png`,
        `Churros responsive arrival at ${width}px.`,
      );
      await galleryView(page);
      await shot(
        page,
        `case-${width}-churros-mosaic.png`,
        `Churros responsive mosaic at ${width}px.`,
      );
      await context.close();
    }
    for (const width of widths) {
      for (const mode of ['reduced-motion', 'save-data', 'no-js']) {
        const context = await browser.newContext({
          ...options(width),
          reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
          javaScriptEnabled: mode !== 'no-js',
        });
        if (mode === 'save-data')
          await context.addInitScript(() => {
            const connection = new EventTarget();
            Object.defineProperty(connection, 'saveData', { value: true });
            Object.defineProperty(navigator, 'connection', { value: connection });
          });
        const page = await context.newPage();
        watch(page, width, mode);
        await page.goto('/work/churros');
        await ready(page);
        await galleryView(page);
        assert.equal(await page.locator('[data-portfolio-video][src]').count(), 0);
        await shot(
          page,
          `case-${width}-${mode}.png`,
          `Churros ${mode} fallback with readable artwork, captions and no mounted video.`,
          { mode },
        );
        await context.close();
      }
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
      watch(page, width, 'full-pages');
      for (const slug of projects) {
        await page.goto(`/work/${slug}`);
        await ready(page);
        await wheelTo(page, await page.evaluate(() => document.documentElement.scrollHeight), {
          step: 410,
          delay: 45,
        });
        await wheelTo(page, 0, { step: 430, delay: 45 });
        await page.waitForTimeout(650);
        await shot(
          page,
          `case-${width}-${slug}-full-page.png`,
          `${titles[slug]}: actual complete page after visiting lazy artwork; software compositor avoids tall-image repetition.`,
          { fullPage: true },
        );
      }
      await context.close();
    }
  } finally {
    await software.close();
    await save();
  }
}
const image = (file, label) =>
  evidence.screenshots.some((item) => item.file === file)
    ? `![${label}](${file})`
    : 'Capture pending';
const gallery = [
  '# Premium project cases — complete rollout review',
  '',
  '[Draft PR #19](https://github.com/tenthtech/drawnout-digital/pull/19) · [Validation](../../docs/case-rollout/VALIDATION.md) · [Asset curation](../../docs/case-rollout/ASSET_CURATION.md) · [Capture manifest](capture-evidence.json)',
  '',
  'The five pilots were explicitly approved. This gallery reviews the remaining six projects using the same approved system; the original [pilot evidence](../case-premium/README.md) is preserved. Canonical records, publication controls, artwork and existing video exports remain authoritative.',
  '',
  '## Watch motion and navigation',
  '',
  'These actual production Chromium recordings show more than eight seconds of decoded Churros and U Wanna Smoothie playback, native forward and reverse scrolling, real next/previous project links, and navigation through the approved Work index. No video seeking, CSS injection or synthesized frames are used.',
  '',
  '| View | Recorded journey |',
  '| --- | --- |',
];
for (const recording of evidence.recordings)
  gallery.push(
    `| ${recording.viewport.width}px | [Churros → Capture → Work → U Wanna Smoothie → Work · ${recording.durationSeconds.toFixed(2)}s](${recording.file}?raw=true) |`,
  );
gallery.push(
  '',
  'Desktop is 1440×900; mobile is 390×844 touch/viewport emulation, not physical-device testing.',
  '',
  '## Compare the remaining six projects',
  '',
);
for (const slug of projects) {
  gallery.push(
    `### ${titles[slug]}`,
    '',
    '| View | Desktop · 1440px | Mobile · 390px |',
    '| --- | --- | --- |',
  );
  for (const [part, label] of [
    ['arrival', 'Arrival'],
    ['mosaic', 'Artwork composition'],
    ['editorial', 'Visual statement'],
  ])
    gallery.push(
      `| ${label} | ${image(`case-1440-${slug}-${part}.png`, `${titles[slug]} desktop ${label.toLowerCase()}`)} | ${image(`case-390-${slug}-${part}.png`, `${titles[slug]} mobile ${label.toLowerCase()}`)} |`,
    );
  gallery.push(
    '',
    '<details>',
    `<summary>${titles[slug]} — complete desktop and mobile pages</summary>`,
    '',
    image(`case-1440-${slug}-full-page.png`, `${titles[slug]} complete desktop page`),
    '',
    image(`case-390-${slug}-full-page.png`, `${titles[slug]} complete mobile page`),
    '',
    '</details>',
    '',
  );
}
gallery.push(
  '## Recorded motion and navigation frames',
  '',
  '| Frame | Desktop | Mobile |',
  '| --- | --- | --- |',
);
for (const [part, label] of [
  ['churros-motion', 'Churros decoded playback'],
  ['churros-journey-gallery', 'Native gallery browsing'],
  ['next-capture', 'Next-project Capture arrival'],
  ['u-wanna-smoothie-motion', 'U Wanna Smoothie decoded playback'],
  ['return-work', 'Return to approved Work index'],
])
  gallery.push(
    `| ${label} | ${image(`case-1440-${part}.png`, `${label} desktop`)} | ${image(`case-390-${part}.png`, `${label} mobile`)} |`,
  );
gallery.push(
  '',
  '## Responsive compositions',
  '',
  '| Width | Arrival | Artwork composition |',
  '| --- | --- | --- |',
);
for (const width of [320, 768, 1024])
  gallery.push(
    `| ${width}px | ${image(`case-${width}-churros-arrival.png`, `Churros arrival at ${width}px`)} | ${image(`case-${width}-churros-mosaic.png`, `Churros mosaic at ${width}px`)} |`,
  );
gallery.push(
  '',
  '## Static fallbacks',
  '',
  'Artwork and captions remain readable without mounted footage. Save Data uses a real EventTarget-based connection mock.',
  '',
  '| Mode | Desktop | Mobile |',
  '| --- | --- | --- |',
);
for (const [mode, label] of [
  ['reduced-motion', 'Reduced motion'],
  ['save-data', 'Save Data'],
  ['no-js', 'JavaScript disabled'],
])
  gallery.push(
    `| ${label} | ${image(`case-1440-${mode}.png`, `${label} desktop`)} | ${image(`case-390-${mode}.png`, `${label} mobile`)} |`,
  );
gallery.push(
  '',
  '## Evidence boundaries',
  '',
  'All screenshots retain their original browser resolution. Full-page stills use a separate software compositor to avoid the cloud GPU backend’s tall-image repetition. The manifest records application hashes, geometry, image loading, playback samples and errors.',
  '',
  'Some artwork is a detail crop from a shared source board, not an independently verified deliverable. No clients, services, results, credits or custom SEO approval are inferred from visual-display approval. Existing hand/plaque artwork remains a layered raster prototype.',
  '',
  'Physical iOS Safari/Android testing, field performance and final owner rollout review remain outstanding. No merge, deployment or Netlify mirror push is part of this review.',
  '',
);
await writeFile(path.join(output, 'README.md'), gallery.join('\n'));
assert.equal(evidence.errors.length, 0, JSON.stringify(evidence.errors));
assert.equal(
  evidence.failedRequests.filter((request) => !request.deliberateCancellation).length,
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
