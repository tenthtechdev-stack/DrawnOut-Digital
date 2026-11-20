import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, performance, scrollY, innerHeight, location */
// Separate real-tab visibility probe. No mocked visibility or application state.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4481');
const output = path.resolve(argument('--out', 'artifacts/sitewide-motion'));
const native = path.resolve(
  argument('--native-dir', '/workspace/sitewide-motion-review/native-background'),
);
const widths = argument('--widths', '1440,390').split(',').map(Number);
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  baseURL,
  method:
    'Separate headed Chromium launched with the real headless Ozone display backend (without Chrome --headless). Ordinary new-tab creation and bringToFront attempt native visibility changes; measurements report actual document.hidden/visibilityState, source, currentTime, decoded-frame counts and original page state. No browser/application state, visibility accessor, attributes, clocks or timelines are rewritten. This platform probe is separate from the main headless before/after movies and is not a physical-device performance benchmark.',
  platformSupported: false,
  browser: null,
  attempts: [],
  pageErrors: [],
  launchError: null,
  executionError: null,
};
const save = () =>
  writeFile(
    path.join(output, 'native-background-capture.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
let browser;
try {
  browser = await chromium.launch({
    headless: false,
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    args: [
      '--ozone-platform=headless',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  });
  evidence.platformSupported = true;
  evidence.browser = browser.version();
  for (const width of widths) {
    const viewport = { width, height: width < 768 ? 844 : 900 };
    const context = await browser.newContext({
      baseURL,
      viewport,
      hasTouch: width < 768,
      isMobile: width < 768,
      reducedMotion: 'no-preference',
      recordVideo: { dir: native, size: viewport },
    });
    const page = await context.newPage();
    const video = page.video();
    const attempt = { width, snapshots: [], visibilityChanged: false, limitation: null };
    evidence.attempts.push(attempt);
    page.on('pageerror', (e) => evidence.pageErrors.push({ width, message: e.message }));
    const snapshot = async (label) => {
      const state = await page.evaluate(() => ({
        at: performance.now(),
        wallClock: Date.now(),
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        route: location.pathname,
        videos: [...document.querySelectorAll('[data-portfolio-video]')].map((v) => ({
          id: v.id,
          state: v.dataset.motionState,
          frame: v.dataset.motionFrame,
          source: v.getAttribute('src'),
          time: v.currentTime,
          paused: v.paused,
          readyState: v.readyState,
          totalVideoFrames: v.getVideoPlaybackQuality?.().totalVideoFrames,
          droppedVideoFrames: v.getVideoPlaybackQuality?.().droppedVideoFrames,
        })),
      }));
      attempt.snapshots.push({ label, ...state });
      await save();
      return state;
    };
    await page.goto('/work/sol-community-center', { waitUntil: 'load' });
    if (await page.locator('[data-signature-intro-overlay]').count())
      await page
        .locator('[data-signature-intro-overlay]')
        .waitFor({ state: 'hidden', timeout: 8000 });
    const artwork = page.locator('#case-motion-sol-community-center');
    const target = await artwork.evaluate(
      (v) =>
        scrollY +
        v.getBoundingClientRect().top -
        Math.max(120, (innerHeight - v.getBoundingClientRect().height) / 2),
    );
    for (let n = 0; n < 100; n++) {
      const current = await page.evaluate(() => scrollY);
      if (Math.abs(current - target) < 4) break;
      await page.mouse.wheel(
        0,
        Math.sign(target - current) * Math.min(220, Math.abs(target - current)),
      );
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(1800);
    const before = await snapshot('visible playing before ordinary tab switch');
    const alternate = await context.newPage();
    await alternate.goto('about:blank');
    await alternate.bringToFront();
    await page.waitForTimeout(650);
    const background = await snapshot('alternate tab active,650ms');
    attempt.visibilityChanged =
      !before.hidden &&
      before.visibilityState === 'visible' &&
      background.hidden &&
      background.visibilityState === 'hidden';
    await page.waitForTimeout(2400);
    await snapshot('alternate tab active,3050ms');
    await page.bringToFront();
    await page.waitForTimeout(1600);
    const returned = await snapshot('returned to recorded tab');
    attempt.returnVisible = !returned.hidden && returned.visibilityState === 'visible';
    await page.screenshot({
      path: path.join(output, `native-background-${width}-returned.png`),
      animations: 'allow',
    });
    await alternate.close();
    if (!attempt.visibilityChanged)
      attempt.limitation =
        'This display backend did not expose a native hidden document on ordinary tab activation. No hidden-tab proof is claimed.';
    await context.close();
    const original = await video.path();
    const file = `native-background-${width}.mp4`;
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        original,
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '22',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        path.join(output, file),
      ],
      { stdio: 'pipe' },
    );
    const bytes = await readFile(path.join(output, file));
    const probe = JSON.parse(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_format', '-of', 'json', path.join(output, file)],
        { encoding: 'utf8' },
      ),
    );
    execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(output, file), '-f', 'null', '-'], {
      stdio: 'pipe',
    });
    attempt.recording = {
      file,
      durationSeconds: Number(probe.format.duration),
      bytes: bytes.length,
      sha256: hash(bytes),
      fullyDecoded: true,
      nativeBrowserVideo: original,
    };
    await save();
  }
} catch (error) {
  if (browser) evidence.executionError = String(error?.message ?? error);
  else evidence.launchError = String(error?.message ?? error);
} finally {
  await browser?.close();
  evidence.completedAt = new Date().toISOString();
  await save();
}
console.log(
  JSON.stringify({
    platformSupported: evidence.platformSupported,
    browser: evidence.browser,
    hiddenObserved: evidence.attempts.map((a) => ({ width: a.width, hidden: a.visibilityChanged })),
    launchError: evidence.launchError,
    executionError: evidence.executionError,
    pageErrors: evidence.pageErrors,
  }),
);
assert.equal(evidence.pageErrors.length, 0);
assert.equal(evidence.executionError, null);
