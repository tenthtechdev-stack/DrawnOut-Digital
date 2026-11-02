import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, innerWidth, innerHeight, scrollY, performance, requestAnimationFrame, getComputedStyle, Image */
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', process.env.ABOUT_BASE_URL ?? 'http://127.0.0.1:4383');
const output = path.resolve(argument('--out', 'artifacts/about'));
const nativeDirectory = path.resolve(
  argument('--native-out', '/tmp/drawnout-about-native-recordings'),
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe';
const nativePortraitOnly = process.argv.includes('--native-portrait-only');
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });
const evidence = {
  capturedAt: new Date().toISOString(),
  baseURL,
  route: '/about',
  method:
    'Actual local production Chromium rendering at DPR 1. Screenshots are unedited. Videos are native real-time Playwright recordings transcoded at their original speed to silent H.264 MP4. No animation seeking, CSS replacement or fabricated frames. Scroll sequences use native document scrolling; reduced-motion and no-JavaScript views are explicitly identified. Software WebGL is used for the existing footer and is not a device performance benchmark.',
  portrait:
    'Owner-approved derived raster sketch revealed with broad SVG masks. The masks are not independently drawable portrait strokes. No original personal photograph or rejected portrait is included.',
  browser: '',
  screenshots: [],
  recordings: [],
  measurements: [],
  errors: [],
  failedRequests: [],
};
if (nativePortraitOnly)
  Object.assign(
    evidence,
    JSON.parse(await readFile(path.join(output, 'capture-evidence.json'), 'utf8')),
  );
evidence.method =
  'Actual local production Chromium rendering at DPR 1. Screenshots are unedited. Videos are native real-time Playwright recordings transcoded at their original speed to silent H.264 MP4. No animation seeking, CSS replacement or fabricated frames. Scroll sequences use native document scrolling; reduced-motion and no-JavaScript views are explicitly identified. The separately labelled native portrait presentation renders the approved derived PNG on the same Afterglow paper colour in a standalone browser canvas. Software WebGL is used for the existing footer and is not a device performance benchmark.';
evidence.sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await mkdir(output, { recursive: true });
await mkdir(nativeDirectory, { recursive: true });
const save = () =>
  writeFile(path.join(output, 'capture-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);

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
    const art = document.querySelector('[data-about-portrait-raster]');
    const box = art.getBoundingClientRect();
    return {
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map((node) =>
        node.textContent.replace(/\s+/g, ' ').trim(),
      ),
      chapters: document.querySelectorAll('[data-about-page] > section').length,
      robots: document.querySelector('meta[name="robots"]').content,
      globalOverlayCount: document.querySelectorAll('[data-signature-intro-overlay]').length,
      entrance: document.querySelector('[data-about-hero]').dataset.aboutEntrance,
      settleReason: document.querySelector('[data-about-hero]').dataset.aboutSettleReason,
      startedAt: Number(document.querySelector('[data-about-hero]').dataset.aboutStartedAt) || null,
      endedAt: Number(document.querySelector('[data-about-hero]').dataset.aboutEndedAt) || null,
      sampledAt: performance.now(),
      portraitMask: art.getAttribute('mask'),
      preserveAspectRatio: art.getAttribute('preserveAspectRatio'),
      portrait: { width: box.width, height: box.height },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      cta: [...document.querySelectorAll('[data-about-invitation] a')].map((node) => ({
        label: node.textContent.trim(),
        href: node.getAttribute('href'),
      })),
    };
  });
}

async function screenshot(
  page,
  filename,
  { target, fullPage = false, mode = 'normal-motion', description = '' } = {},
) {
  await page.evaluate(() => document.fonts.ready);
  const buffer = target
    ? await page
        .locator(target)
        .screenshot({ path: path.join(output, filename), animations: 'allow' })
    : await page.screenshot({ path: path.join(output, filename), fullPage, animations: 'allow' });
  const observations = await facts(page);
  assert.equal(observations.horizontalOverflow, false, `${filename} must fit the viewport`);
  assert.equal(observations.chapters, 7);
  assert.equal(observations.globalOverlayCount, 0);
  assert.equal(observations.robots, 'noindex, nofollow');
  evidence.screenshots.push({
    filename,
    description,
    mode,
    viewport: page.viewportSize(),
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    facts: observations,
  });
  await save();
}

async function open(page) {
  const response = await page.goto('/about', { waitUntil: 'commit' });
  assert.equal(response.status(), 200);
  await page.waitForSelector('[data-about-hero]');
  await page.evaluate(() => document.fonts.ready);
}

async function settled(page) {
  await page.waitForFunction(() =>
    ['settled', 'static'].includes(
      document.querySelector('[data-about-hero]')?.dataset.aboutEntrance,
    ),
  );

  assert.equal(await page.locator('[data-about-portrait-raster][mask]').count(), 0);
}

async function decodeFooter(page) {
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode()));
    const portrait = new Image();
    portrait.src = document.querySelector('[data-about-portrait-raster]').getAttribute('href');
    await portrait.decode();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(150);
}

function transcode(nativeFile, filename) {
  const destination = path.join(output, filename);
  execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    nativeFile,
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
      ffprobe,
      ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination],
      { encoding: 'utf8' },
    ),
  );
  assert.equal(metadata.streams.filter((stream) => stream.codec_type === 'audio').length, 0);
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

async function scrollToProgress(page, selector, progress, duration = 1400) {
  await page.locator(selector).evaluate(
    async (node, values) => {
      const box = node.getBoundingClientRect();
      const absolute = box.top + scrollY;
      const destination = Math.max(
        0,
        absolute - innerHeight + (box.height + innerHeight) * values.progress,
      );
      const from = scrollY;
      const start = performance.now();
      await new Promise((resolve) => {
        const frame = () => {
          const portion = Math.min(1, (performance.now() - start) / values.duration);
          window.scrollTo({ top: from + (destination - from) * portion, behavior: 'instant' });
          if (portion < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    },
    { progress, duration },
  );
  await page.waitForTimeout(400);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  for (const width of nativePortraitOnly ? [] : [1440, 390]) {
    const viewport = viewportFor(width);
    const context = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      isMobile: width < 768,
      hasTouch: width < 768,
      recordVideo: { dir: nativeDirectory, size: viewport },
    });
    const page = await context.newPage();
    watch(page, width, 'normal-motion');
    await open(page);
    await page.waitForFunction(
      () => document.querySelector('[data-about-hero]')?.dataset.aboutEntrance === 'running',
    );
    await page.waitForFunction(
      () =>
        performance.now() -
          Number(document.querySelector('[data-about-hero]').dataset.aboutStartedAt) >=
        1000,
    );
    await screenshot(page, `about-${width}-arrival-frame.png`, {
      description:
        'Actual viewport during the coordinated hero arrival, approximately one second after initial parsing.',
    });
    await settled(page);
    await page.waitForTimeout(800);
    await screenshot(page, `about-${width}-viewport.png`, {
      description: 'Settled viewport; portrait remains part of the page.',
    });
    const heroFacts = await facts(page);
    assert.equal(heroFacts.entrance, 'settled');
    assert.equal(heroFacts.settleReason, 'complete');
    assert(heroFacts.endedAt - heroFacts.startedAt <= 4200);
    evidence.measurements.push({ width, scene: 'hero', ...heroFacts });
    await context.close();
    evidence.recordings.push({
      ...transcode(await page.video().path(), `about-${width}-hero-reveal.mp4`),
      width,
      scene: 'hero',
      description: 'Uninterrupted native real-time About arrival and settled hold.',
    });
    await save();

    // This second recording reaches the editorial systems by normal scrolling.
    // Each normalized value and actual SVG dash offset is recorded for review.
    const scrollContext = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      isMobile: width < 768,
      hasTouch: width < 768,
      recordVideo: { dir: nativeDirectory, size: viewport },
    });
    const scrollPage = await scrollContext.newPage();
    watch(scrollPage, width, 'normal-motion-scroll');
    await open(scrollPage);
    await scrollPage.keyboard.press('Escape');
    await settled(scrollPage);
    const scenes = [];
    for (const [scene, selector, attribute, line] of [
      ['origin', '[data-about-story]', 'data-about-story-progress', '[data-about-story-line]'],
      [
        'process',
        '[data-about-process-system]',
        'data-about-process-progress',
        '[data-about-process-line]',
      ],
    ]) {
      const observations = [];
      for (const progress of [0.1, 0.78, 0.22, 0.86]) {
        await scrollToProgress(scrollPage, selector, progress);
        observations.push({
          requestedViewportProgress: progress,
          progress: Number(await scrollPage.locator(selector).getAttribute(attribute)),
          dashOffsets: await scrollPage
            .locator(line)
            .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).strokeDashoffset)),
          scrollY: await scrollPage.evaluate(() => scrollY),
        });
      }
      assert(observations[1].progress > observations[0].progress, `${scene} draws forward`);
      assert(observations[2].progress < observations[1].progress, `${scene} reverses`);
      scenes.push({ scene, observations });
      await screenshot(scrollPage, `about-${width}-${scene}.png`, {
        description: `Actual ${scene} composition after native forward/reverse scrolling.`,
      });
    }
    await scrollPage.locator('[data-about-invitation]').scrollIntoViewIfNeeded();
    await scrollPage.waitForTimeout(700);
    await screenshot(scrollPage, `about-${width}-invitation.png`, {
      description: 'Invitation and Contact CTA flowing into the signature footer.',
    });
    await scrollPage.locator('[data-site-footer]').scrollIntoViewIfNeeded();
    await scrollPage.evaluate(async () =>
      Promise.all([...document.images].map((image) => image.decode().catch(() => {}))),
    );
    await scrollPage.waitForTimeout(700);
    await screenshot(scrollPage, `about-${width}-footer.png`, {
      description: 'Preserved signature footer reached through the About narrative.',
    });
    await scrollContext.close();
    evidence.recordings.push({
      ...transcode(await scrollPage.video().path(), `about-${width}-origin-process-footer.mp4`),
      width,
      scene: 'origin-process-footer',
      description:
        'Native scroll progression forward and backward through origin and process, then invitation and existing signature footer.',
      scenes,
    });
    await save();
  }

  for (const width of nativePortraitOnly ? [] : [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    watch(page, width, 'reduced-motion');
    await open(page);
    await settled(page);
    await decodeFooter(page);
    await screenshot(page, `about-${width}-full-reduced.png`, {
      fullPage: true,
      mode: 'reduced-motion',
      description:
        'Complete seven-chapter layout using the real supported reduced-motion fallback.',
    });
    await screenshot(page, `about-${width}-hero.png`, {
      target: '[data-about-hero]',
      mode: 'reduced-motion',
      description:
        'Complete settled hero composition; the mobile image includes both founders without cropping.',
    });
    if (width === 1440)
      await screenshot(page, 'founders-cream-presentation.png', {
        target: '[data-founder-portrait]',
        mode: 'reduced-motion',
        description: 'Approved raster illustration on the actual Afterglow cream hero background.',
      });
    await context.close();
  }
  for (const width of nativePortraitOnly ? [] : [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      javaScriptEnabled: false,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    watch(page, width, 'no-JavaScript');
    await open(page);
    await decodeFooter(page);
    await screenshot(page, `about-${width}-full-no-js.png`, {
      fullPage: true,
      mode: 'no-JavaScript',
      description:
        'Complete page without JavaScript: full portrait, seven chapters and normal links remain rendered.',
    });
    await screenshot(page, `about-${width}-hero-no-js.png`, {
      target: '[data-about-hero]',
      mode: 'no-JavaScript',
      description: 'Native static hero without JavaScript or reveal masks.',
    });
    await context.close();
  }
  // A separately labelled presentation renders only the approved derived PNG
  // at its native dimensions on the same paper colour used by the real hero.
  // Page evidence above remains unmodified production rendering.
  const portraitContext = await browser.newContext({
    viewport: { width: 1445, height: 1088 },
    deviceScaleFactor: 1,
  });
  const portraitPage = await portraitContext.newPage();
  watch(portraitPage, 1445, 'standalone-approved-portrait-presentation');
  const approvedPNG = await readFile('src/assets/about/founders-sketch-approved.png');
  await portraitPage.setContent(
    `<!doctype html><html lang="en"><head><title>Approved founder sketch on Afterglow paper</title></head><body style="margin:0;background:#f7f5f1"><img alt="Approved expressive sketch of the twin founders" src="data:image/png;base64,${approvedPNG.toString('base64')}" width="1445" height="1088" style="display:block"></body></html>`,
  );
  await portraitPage.locator('img').evaluate((image) => image.decode());
  evidence.screenshots = evidence.screenshots.filter(
    ({ filename }) => filename !== 'founders-cream-native-1445.png',
  );
  const nativeFilename = 'founders-cream-native-1445.png';
  const nativeBuffer = await portraitPage.screenshot({ path: path.join(output, nativeFilename) });
  assert.equal(nativeBuffer.readUInt32BE(16), 1445);
  assert.equal(nativeBuffer.readUInt32BE(20), 1088);
  evidence.screenshots.push({
    filename: nativeFilename,
    mode: 'standalone-approved-portrait-presentation',
    description:
      'Approved derived PNG rendered at its full 1445×1088 source dimensions on the actual Afterglow paper colour (#f7f5f1), in a separately labelled standalone browser presentation. No original photo, artwork edit, resize or composite.',
    viewport: { width: 1445, height: 1088 },
    width: 1445,
    height: 1088,
    deviceScaleFactor: 1,
    bytes: nativeBuffer.length,
    sha256: createHash('sha256').update(nativeBuffer).digest('hex'),
  });
  await portraitContext.close();
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
  '# About — actual production-browser evidence',
  '',
  'Native Chromium screenshots and real-time recordings from the local production build. The portrait is the owner-approved derived raster sketch, revealed with broad SVG masks. No original personal photograph or rejected review candidate is included.',
  '',
  '[Observed validation](../../docs/next-milestone/ABOUT_PAGE_VALIDATION.md) · [Capture facts, dimensions and hashes](capture-evidence.json) · [Browser test report](browser-tests.json)',
  '',
  '## Desktop and mobile hero',
  '',
];
for (const width of [1440, 390])
  gallery.push(
    `### ${width}px`,
    '',
    `![Settled About hero at ${width}px](about-${width}-hero.png)`,
    '',
    `[Play real-time hero reveal MP4](about-${width}-hero-reveal.mp4) · [Play origin/process forward-reverse and footer MP4](about-${width}-origin-process-footer.mp4)`,
    '',
    `![Actual arrival frame at ${width}px](about-${width}-arrival-frame.png)`,
    '',
  );
gallery.push('## Complete responsive pages', '');
for (const width of [320, 390, 768, 1440])
  gallery.push(
    `### ${width}px — reduced-motion layout`,
    '',
    `![Complete About page at ${width}px](about-${width}-full-reduced.png)`,
    '',
  );
gallery.push('## Native no-JavaScript fallback', '');
for (const width of [390, 1440])
  gallery.push(`![No-JavaScript About page at ${width}px](about-${width}-full-no-js.png)`, '');
gallery.push(
  '## Approved portrait on the actual cream background',
  '',
  '![Approved derived founder sketch rendered on the Afterglow hero background](founders-cream-presentation.png)',
  '',
  '[Full source resolution cream presentation](founders-cream-native-1445.png) — approved derived PNG rendered at 1445×1088 on the same Afterglow paper colour in a standalone browser canvas. The image above is cropped directly from the actual About hero.',
  '',
  '## Review limits',
  '',
  'Recordings preserve real playback speed and native scrolling. Chromium uses software rendering in this environment; these are visual and interaction observations, not physical-device performance measurements. Founder identity positions are not asserted. The private reference comparison and illustration approval occurred in the conversation and are not reproduced here. Philosophy and approach copy still require final studio editorial approval. Preview indexing remains disabled. No merge, deployment or separate Netlify repository publication was performed.',
  '',
);
await writeFile(path.join(output, 'README.md'), gallery.join('\n'));
console.log(
  JSON.stringify({
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    browser: evidence.browser,
    errors: evidence.errors,
    output,
  }),
);
