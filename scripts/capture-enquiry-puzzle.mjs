import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, scrollY, innerHeight */
// Real browser evidence only: no injected styles, timeline seeking or synthetic frames.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4450');
const output = path.resolve(argument('--out', 'artifacts/motion-quality'));
const native = path.resolve(
  argument('--native-dir', '/workspace/motion-quality-review/enquiry-native'),
);
const widths = argument('--widths', '1440,390').split(',').map(Number);
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const sourceFiles = {};
for (const file of [
  'src/components/services/EnquiryPuzzle.astro',
  'src/components/services/ServicePage.astro',
  'src/scripts/enquiry-puzzle.ts',
  'src/styles/enquiry-puzzle.css',
  'src/lib/enquiry-puzzle-policy.ts',
  'src/assets/brand/drawnout-emblem-isolated.png',
])
  sourceFiles[file] = createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
const evidence = {
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles,
  baseURL,
  method:
    'Actual Chromium viewport recordings and screenshots of the production build. Native wheel input enters the enquiry illustration, two complete active-time cycles play without seeking, then the browser leaves and reverses back before the user pauses. H.264 transcodes preserve native timing. Reduced-motion and no-JavaScript screenshots show the real server-rendered final composition. Mobile is Chromium touch/viewport emulation, not a physical device.',
  browser: '',
  recordings: [],
  screenshots: [],
  measurements: [],
  errors: [],
};
const save = () =>
  writeFile(path.join(output, 'enquiry-capture.json'), `${JSON.stringify(evidence, null, 2)}\n`);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();

function observe(page, width, mode) {
  page.on('pageerror', (error) => evidence.errors.push({ width, mode, message: error.message }));
}
async function ready(page) {
  await page.waitForFunction(
    () => !['pending', 'playing'].includes(document.documentElement.dataset.signatureIntro ?? ''),
  );
  await page.evaluate(() => document.fonts.ready);
}
async function wheelTo(page, target) {
  for (let attempt = 0; attempt < 45; attempt++) {
    const current = await page.evaluate(() => scrollY);
    if (Math.abs(target - current) <= 4) break;
    await page.mouse.wheel(
      0,
      Math.sign(target - current) * Math.min(650, Math.abs(target - current)),
    );
    await page.waitForTimeout(55);
  }
}
async function centerStage(page) {
  const target = await page.locator('[data-enquiry-stage]').evaluate((element) => {
    const box = element.getBoundingClientRect();
    return Math.max(0, scrollY + box.top - Math.max(115, (innerHeight - box.height) / 2));
  });
  await wheelTo(page, target);
}
async function shot(page, filename, label, element) {
  if (element) await page.locator(element).screenshot({ path: path.join(output, filename) });
  else await page.screenshot({ path: path.join(output, filename) });
  evidence.screenshots.push({ file: filename, label, viewport: page.viewportSize() });
  await save();
}
async function state(page) {
  return page.locator('[data-enquiry-puzzle]').evaluate((element) => ({
    ...element.dataset,
    fragments: [...element.querySelectorAll('[data-enquiry-piece]')].map((piece) => ({
      name: piece.getAttribute('data-enquiry-piece'),
      transform: piece.getAttribute('transform'),
    })),
    thread: element.querySelector('[data-enquiry-thread]')?.getAttribute('style'),
  }));
}

try {
  for (const width of widths) {
    const viewport = { width, height: width < 768 ? 844 : 900 };
    const context = await browser.newContext({
      baseURL,
      viewport,
      deviceScaleFactor: 1,
      hasTouch: width < 768,
      reducedMotion: 'no-preference',
      recordVideo: { dir: native, size: viewport },
    });
    const page = await context.newPage();
    observe(page, width, 'motion');
    const video = page.video();
    assert(video, 'Native browser recording must exist');
    await page.goto('/services/brand-identity');
    await ready(page);
    await centerStage(page);
    await page.waitForFunction(
      () =>
        document.querySelector('[data-enquiry-puzzle]')?.getAttribute('data-enquiry-state') ===
        'playing',
    );
    // Sample naturally occurring phases. Never seek or freeze the timeline.
    for (const [label, minimum, maximum] of [
      ['idea', 0.25, 0.85],
      ['connecting', 2.55, 3.15],
      ['direction', 5.15, 5.95],
    ]) {
      await page.waitForFunction(
        ({ minimum, maximum }) => {
          const time = Number(
            document.querySelector('[data-enquiry-puzzle]')?.getAttribute('data-enquiry-time'),
          );
          return time >= minimum && time <= maximum;
        },
        { minimum, maximum },
        { timeout: 25_000 },
      );
      evidence.measurements.push({ width, phase: label, ...(await state(page)) });
      await shot(
        page,
        `enquiry-${width}-${label}.png`,
        `${width}px: actual ${label} phase in the live browser.`,
      );
    }
    await page.waitForFunction(
      () =>
        Number(
          document.querySelector('[data-enquiry-puzzle]')?.getAttribute('data-enquiry-cycle'),
        ) >= 2,
      undefined,
      { timeout: 35_000 },
    );
    evidence.measurements.push({ width, phase: 'two-complete-cycles', ...(await state(page)) });
    const beforeLeave = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, -Math.max(viewport.height, 1000));
    await page.waitForTimeout(450);
    evidence.measurements.push({ width, phase: 'native-backscroll-away', ...(await state(page)) });
    await wheelTo(page, beforeLeave);
    await page.waitForTimeout(500);
    await page.locator('[data-enquiry-pause]').click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(650);
    const paused = await state(page);
    assert(paused.enquiryPauseReasons.includes('user'), 'Explicit pause intent must persist');
    evidence.measurements.push({ width, phase: 'user-pause', ...paused });
    await shot(
      page,
      `enquiry-${width}-paused.png`,
      `${width}px: user pause remains available without blocking the enquiry.`,
    );
    await context.close();
    const filename = `enquiry-${width}-browser.mp4`;
    execFileSync(process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      await video.path(),
      '-an',
      '-c:v',
      'libx264',
      '-threads',
      '2',
      '-preset',
      'medium',
      '-crf',
      '21',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      path.join(output, filename),
    ]);
    const probe = JSON.parse(
      execFileSync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_streams',
          '-show_format',
          '-of',
          'json',
          path.join(output, filename),
        ],
        { encoding: 'utf8' },
      ),
    );
    evidence.recordings.push({
      file: filename,
      viewport,
      durationSeconds: Number(probe.format.duration),
      bytes: Number(probe.format.size),
      codec: probe.streams[0].codec_name,
    });
    await save();

    for (const mode of ['reduced-motion', 'no-javascript']) {
      const stillContext = await browser.newContext({
        baseURL,
        viewport,
        hasTouch: width < 768,
        reducedMotion: 'reduce',
        javaScriptEnabled: mode !== 'no-javascript',
      });
      const stillPage = await stillContext.newPage();
      observe(stillPage, width, mode);
      await stillPage.goto('/services/brand-identity');
      await stillPage.evaluate(() => document.fonts.ready);
      await stillPage.locator('[data-enquiry-puzzle]').scrollIntoViewIfNeeded();
      await shot(
        stillPage,
        `enquiry-${width}-${mode}-settled.png`,
        `${width}px: complete final composition with ${mode}.`,
        '[data-enquiry-puzzle]',
      );
      assert.equal(
        await stillPage.locator('[data-service-enquiry]').getAttribute('href'),
        '/contact',
      );
      await stillContext.close();
    }
  }
} finally {
  await browser.close();
  await save();
}
assert.equal(evidence.errors.length, 0, 'Evidence must not conceal browser runtime errors');
console.log(
  `Captured ${evidence.recordings.length} real enquiry recordings and ${evidence.screenshots.length} screenshots.`,
);
