import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, getComputedStyle, performance, DOMMatrixReadOnly */
// The browser callbacks only observe actual animation clocks and rendered states.
const baseURL = process.env.MOTION_BASE_URL ?? 'http://127.0.0.1:4323';
const outputArgument = process.argv.indexOf('--out');
const output = path.resolve(
  outputArgument < 0 ? 'artifacts/signature-squares' : process.argv[outputArgument + 1],
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe';
const manifestFile = path.join(output, 'square-evidence.json');
const manifest = { baseURL, capturedAt: new Date().toISOString(), screenshots: [], recordings: [] };
const save = () => writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.querySelector('[data-signature-intro-overlay]');
    const animation = overlay
      .getAnimations()
      .find((item) => item.animationName?.includes('intro-exit'));
    const bounds = (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const frames = [...overlay.querySelectorAll('[data-intro-square]')].map((frame) => {
      const image = frame.querySelector('[data-intro-artwork]');
      const style = image && getComputedStyle(image);
      return {
        slug:
          frame.dataset.introProject ?? frame.closest('[data-intro-project]')?.dataset.introProject,
        bounds: bounds(frame),
        frameOpacity: Number(getComputedStyle(frame).opacity),
        image: image?.currentSrc,
        loaded: Boolean(image?.complete && image.naturalWidth > 0),
        imageOpacity: style ? Number(style.opacity) : null,
        clipPath: style?.clipPath,
        objectPosition: style?.objectPosition,
      };
    });
    const signature = overlay.querySelector('[data-intro-signature]');
    const hand = signature.querySelector('[data-signature-hand]');
    const plaque = signature.querySelector('[data-signature-plaque]');
    const gradient = document.querySelector('[data-living-gradient]');
    return {
      navigationMs: performance.now(),
      cssTimeMs: typeof animation?.currentTime === 'number' ? animation.currentTime : null,
      intro: root.dataset.signatureIntro,
      reason: root.dataset.signatureIntroReason,
      endedMs: Number(root.dataset.signatureIntroEnded) || null,
      waveRemaining: Number.parseFloat(
        getComputedStyle(overlay.querySelector('[data-intro-wave]')).strokeDashoffset,
      ),
      projectOpacity: Number(
        getComputedStyle(overlay.querySelector('[data-intro-projects]')).opacity,
      ),
      frames,
      wordmark: bounds(overlay.querySelector('[data-intro-name]')),
      skip: bounds(overlay.querySelector('[data-signature-skip]')),
      signatureOpacity: Number(getComputedStyle(signature).opacity),
      handY: new DOMMatrixReadOnly(getComputedStyle(hand).transform).m42,
      plaqueY: new DOMMatrixReadOnly(getComputedStyle(plaque).transform).m42,
      gradientRenderer: gradient?.dataset.gradientRenderer,
      gradientActive: gradient?.dataset.gradientActive,
    };
  });
}

function assertPosters(state) {
  assert.equal(state.frames.length, 6, 'Exactly six project frames');
  assert.equal(
    new Set(state.frames.map((frame) => frame.slug)).size,
    6,
    'Six distinct project slugs',
  );
  assert.equal(new Set(state.frames.map((frame) => frame.image)).size, 6, 'Six distinct posters');
  assert(
    state.frames.some((frame) => frame.slug === 'sol-community-center'),
    'SOL must be included',
  );
  assert(
    state.frames.every((frame) => frame.loaded),
    'Every approved poster must decode',
  );
}

async function captureStill(browser, width, state, time) {
  const context = await browser.newContext({ viewport: viewportFor(width) });
  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await page.goto(baseURL, { waitUntil: 'commit' });
    await page.waitForFunction(() => document.documentElement.dataset.signatureIntro === 'playing');
    await page.waitForFunction(
      ({ state, time }) => {
        if (state === 'homepage') return performance.now() >= time;
        const animation = document
          .querySelector('[data-signature-intro-overlay]')
          .getAnimations()
          .find((item) => item.animationName?.includes('intro-exit'));
        return typeof animation?.currentTime === 'number' && animation.currentTime >= time;
      },
      { state, time },
    );
    if (state === 'all-artwork') {
      await page.waitForFunction(
        () => {
          const images = [...document.querySelectorAll('[data-intro-artwork]')];
          return (
            images.length === 6 &&
            images.every((image) => {
              const style = getComputedStyle(image);
              return (
                image.complete &&
                image.naturalWidth > 0 &&
                Number(style.opacity) > 0.99 &&
                Number.parseFloat(style.clipPath.match(/inset\(([^ ]+)/)?.[1] ?? '0') < 0.1
              );
            })
          );
        },
        undefined,
        { timeout: 1000 },
      );
    }
    const before = await snapshot(page);
    assertPosters(before);
    if (state === 'homepage') {
      assert.equal(before.reason, 'complete');
      assert.equal(before.intro, 'completed');
      assert(before.endedMs <= 5000, 'Automatic five-second deadline');
    } else {
      assert.equal(before.intro, 'playing');
      assert(
        before.cssTimeMs <
          { squares: 1000, 'mid-wave': 1850, 'all-artwork': 2300, held: 3600 }[state],
        `Missed ${state} live window`,
      );
    }
    const visible = before.frames.filter((frame) => frame.imageOpacity > 0.02).length;
    if (state === 'squares') assert(visible < 3, 'Initial frame appearances retain empty outlines');
    if (state === 'mid-wave') assert(visible > 0 && visible < 6, 'Images reveal progressively');
    if (state === 'all-artwork')
      assert(before.projectOpacity > 0.9, 'All six artworks must still be visibly on stage');
    if (state === 'held')
      assert(
        before.signatureOpacity > 0.95 &&
          Math.abs(before.handY) < 0.5 &&
          Math.abs(before.plaqueY) < 0.5,
      );
    const result = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    const after = await snapshot(page);
    const file = `opening-${width}-${state}.png`;
    await writeFile(path.join(output, file), Buffer.from(result.data, 'base64'));
    manifest.screenshots.push({ file, width, state, targetCssMs: time, before, after });
    await save();
  } finally {
    await context.close();
  }
}

async function recordOpening(browser, width, label) {
  const rawDirectory = await mkdtemp(path.join(tmpdir(), 'drawnout-opening-video-'));
  const viewport = viewportFor(width);
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: rawDirectory, size: viewport },
  });
  const page = await context.newPage();
  const video = page.video();
  let observed;
  try {
    await page.goto(baseURL, { waitUntil: 'commit' });
    await page.waitForFunction(
      () => document.documentElement.dataset.signatureIntro === 'completed',
    );
    const completed = await snapshot(page);
    assert.equal(completed.reason, 'complete');
    assert(
      completed.endedMs <= 5000,
      'Recording must show automatic completion within five seconds',
    );
    assertPosters(completed);
    await page.waitForFunction(() => {
      const gradient = document.querySelector('[data-living-gradient]');
      return (
        ['webgl', 'css'].includes(gradient?.dataset.gradientRenderer) &&
        gradient?.dataset.gradientActive === 'true'
      );
    });
    await page.waitForFunction(() => performance.now() >= 8000);
    observed = await snapshot(page);
  } finally {
    await context.close();
  }
  try {
    const source = await video.path();
    const file = `${label}-opening.mp4`;
    const gif = `${label}-opening-preview.gif`;
    // Playwright records real browser frames with their original timestamps.
    // Transcode the complete video; never seek or alter an application timeline.
    execFileSync(ffmpeg, [
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
      'veryfast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      path.join(output, file),
    ]);
    execFileSync(ffmpeg, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      path.join(output, file),
      '-filter_complex',
      `[0:v]fps=8,scale=${Math.min(width, 640)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`,
      '-loop',
      '0',
      path.join(output, gif),
    ]);
    const probe = JSON.parse(
      execFileSync(
        ffprobe,
        [
          '-v',
          'error',
          '-show_entries',
          'stream=codec_name,width,height,r_frame_rate:format=duration,size',
          '-of',
          'json',
          path.join(output, file),
        ],
        { encoding: 'utf8' },
      ),
    );
    manifest.recordings.push({
      file,
      gif,
      width,
      viewport,
      bytes: (await stat(path.join(output, file))).size,
      gifBytes: (await stat(path.join(output, gif))).size,
      method: 'Native Playwright timestamped browser video; complete H.264 transcode',
      observed,
      probe,
    });
    await save();
  } finally {
    await rm(rawDirectory, { recursive: true, force: true });
  }
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const warm = await browser.newContext();
  try {
    const page = await warm.newPage();
    await page.goto(`${baseURL}/#main`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-signature-intro-overlay] img')].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
  } finally {
    await warm.close();
  }
  if (process.argv.includes('--recordings-only')) {
    manifest.screenshots = JSON.parse(await readFile(manifestFile, 'utf8')).screenshots;
  } else {
    for (const width of [320, 390, 768, 1440]) {
      for (const [state, time] of [
        ['squares', 550],
        ['mid-wave', 1450],
        ['all-artwork', 2100],
      ]) {
        await captureStill(browser, width, state, time);
      }
      if ([390, 1440].includes(width)) {
        await captureStill(browser, width, 'held', 3420);
        await captureStill(browser, width, 'homepage', 5200);
      }
    }
  }
  if (!process.argv.includes('--stills-only')) {
    await recordOpening(browser, 1440, 'desktop');
    await recordOpening(browser, 390, 'mobile');
  }
} finally {
  await browser.close();
}
await save();
console.log(
  JSON.stringify(
    {
      manifestFile,
      screenshots: manifest.screenshots.length,
      recordings: manifest.recordings.length,
    },
    null,
    2,
  ),
);
