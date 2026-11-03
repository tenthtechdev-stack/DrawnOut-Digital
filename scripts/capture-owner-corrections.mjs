import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, performance, requestAnimationFrame, getComputedStyle,
   innerWidth, WebGLRenderingContext, DOMMatrixReadOnly */
// Observe production frames. Never seek, pause or replace an application timeline.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4401');
const output = path.resolve(argument('--out', 'artifacts/owner-corrections'));
const nativeDirectory = path.resolve(
  argument('--native-dir', '/workspace/owner-corrections-review/native'),
);
const widths = argument('--widths', '390,1440').split(',').map(Number);
const routes = argument('--routes', 'about,home').split(',');
const only = argument('--only', 'all');
const viewportFor = (width) => ({ width, height: width < 768 ? 844 : 900 });
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const sourceFiles = [
  'src/components/about/AboutPage.astro',
  'src/components/about/FounderPortrait.astro',
  'src/styles/about.css',
  'src/scripts/about-motion.ts',
  'src/components/SignatureIntro.astro',
  'src/components/SignatureIntroBoot.astro',
  'src/scripts/signature-intro.ts',
  'src/scripts/living-gradient.ts',
];
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles: Object.fromEntries(
    await Promise.all(sourceFiles.map(async (file) => [file, hash(await readFile(file))])),
  ),
  baseURL,
  method:
    'Real production Chromium frames and native timestamped Playwright video; full untrimmed H.264 transcodes at original speed. No application timeline seeking, paused animations, replacement CSS or synthesized frames. Home clips include a real browser refresh. Software rendering is not a physical-device benchmark.',
  assetStatus:
    'Approved founders sketch unchanged. No approved 3D emblem or verified editable contours are supplied: the About 3D beat is withheld, not represented by a flat PNG. The homepage hand/plaque remains the approved separated-raster motion prototype.',
  browser: '',
  screenshots: [],
  recordings: [],
  measurements: [],
  errors: [],
  failedRequests: [],
};
await mkdir(output, { recursive: true });
await mkdir(nativeDirectory, { recursive: true });
const manifestName = argument('--manifest', 'capture-evidence.json');
const save = () =>
  writeFile(path.join(output, manifestName), `${JSON.stringify(evidence, null, 2)}\n`);

function watch(page, width, route, mode) {
  page.on('pageerror', (error) =>
    evidence.errors.push({ width, route, mode, error: error.message }),
  );
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      width,
      route,
      mode,
      url: request.url(),
      error: request.failure()?.errorText,
    }),
  );
}

async function instrument(context) {
  await context.addInitScript(() => {
    const samples = [];
    const draws = [];
    Reflect.set(window, '__ownerSamples', samples);
    Reflect.set(window, '__ownerGradientDraws', draws);
    let previous = -100;
    const observe = (now) => {
      if (now - previous > 60) {
        previous = now;
        const root = document.documentElement;
        const hero = document.querySelector('[data-about-hero]');
        const overlay = document.querySelector('[data-signature-intro-overlay]');
        const opacity = (selector) => {
          const element = document.querySelector(selector);
          return element ? Number(getComputedStyle(element).opacity) : null;
        };
        samples.push({
          at: now,
          introState: root.dataset.signatureIntro,
          introMode: root.dataset.signatureIntroMode,
          introReason: root.dataset.signatureIntroReason,
          overlayVisible: Boolean(
            overlay &&
            !overlay.hidden &&
            getComputedStyle(overlay).display !== 'none' &&
            Number(getComputedStyle(overlay).opacity) > 0.1,
          ),
          imagesVisible: [...document.querySelectorAll('[data-intro-artwork]')].filter(
            (image) =>
              image.complete &&
              image.naturalWidth > 0 &&
              Number(getComputedStyle(image).opacity) > 0.95,
          ).length,
          aboutState: hero?.dataset.aboutEntrance,
          aboutPhase: hero?.dataset.aboutHeroPhase,
          aboutScene: hero?.dataset.aboutArrivalScene,
          portraitOpacity: opacity('[data-about-artwork]'),
          atmosphereOpacity: opacity('[data-about-gradient]'),
          headlineOpacity: opacity('[data-about-headline]'),
          copyOpacity: opacity('[data-about-hero-paragraph]'),
        });
      }
      if (now < 10000) requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
    const original = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = Reflect.apply(original, this, args);
      if (this.canvas?.hasAttribute('data-gradient-canvas')) draws.push(performance.now());
      return result;
    };
  });
}

async function facts(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const hero = document.querySelector('[data-about-hero]');
    const gradient = document.querySelector('[data-living-gradient]');
    const rect = (node) => {
      if (!node) return null;
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    const opacity = (node) => (node ? Number(getComputedStyle(node).opacity) : null);
    const matrixY = (selector) => {
      const node = document.querySelector(selector);
      return node ? new DOMMatrixReadOnly(getComputedStyle(node).transform).m42 : null;
    };
    return {
      navigationMs: performance.now(),
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map((node) =>
        node.textContent.replace(/\s+/g, ' ').trim(),
      ),
      overflow: root.scrollWidth > innerWidth,
      intro: {
        state: root.dataset.signatureIntro,
        mode: root.dataset.signatureIntroMode,
        reason: root.dataset.signatureIntroReason,
        started: Number(root.dataset.signatureIntroStarted) || null,
        ended: Number(root.dataset.signatureIntroEnded) || null,
        waveCount: document.querySelectorAll('[data-intro-wave], .intro-wave').length,
        projectsOpacity: opacity(document.querySelector('[data-intro-projects]')),
        wordmark: rect(document.querySelector('[data-intro-name]')),
        signatureOpacity: opacity(document.querySelector('[data-intro-signature]')),
        handY: matrixY('[data-intro-signature] [data-signature-hand]'),
        plaqueY: matrixY('[data-intro-signature] [data-signature-plaque]'),
        squares: [...document.querySelectorAll('[data-intro-square]')].map((node) => {
          const image = node.querySelector('img');
          const style = getComputedStyle(node);
          return {
            slug: node.dataset.introProject,
            bounds: rect(node),
            radius: style.borderRadius,
            border: style.borderWidth,
            image: image?.currentSrc,
            loaded: Boolean(image?.complete && image.naturalWidth),
            opacity: opacity(image),
            clip: image ? getComputedStyle(image).clipPath : null,
          };
        }),
      },
      about: hero
        ? {
            state: hero.dataset.aboutEntrance,
            phase: hero.dataset.aboutHeroPhase,
            scene: hero.dataset.aboutArrivalScene,
            reason: hero.dataset.aboutSettleReason,
            emblemStatus: hero.dataset.aboutEmblemStatus,
            started: Number(hero.dataset.aboutStartedAt) || null,
            ended: Number(hero.dataset.aboutEndedAt) || null,
            chapters: document.querySelectorAll('[data-about-page] > section').length,
            composition: rect(document.querySelector('[data-about-composition]')),
          }
        : null,
      gradient: {
        renderer: gradient?.dataset.gradientRenderer,
        active: gradient?.dataset.gradientActive,
        frames: Reflect.get(window, '__ownerGradientDraws')?.length ?? 0,
      },
    };
  });
}

async function screenshot(page, file, description, { selector, mode = 'normal' } = {}) {
  const before = await facts(page);
  assert.equal(before.overflow, false);
  let buffer;
  if (selector) buffer = await page.locator(selector).screenshot({ animations: 'allow' });
  else {
    const cdp = await page.context().newCDPSession(page);
    const result = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    buffer = Buffer.from(result.data, 'base64');
    await cdp.detach();
  }
  await writeFile(path.join(output, file), buffer);
  evidence.screenshots.push({
    file,
    description,
    mode,
    viewport: page.viewportSize(),
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
    sha256: hash(buffer),
    before,
    after: await facts(page),
  });
  await save();
}

function transcode(source, file) {
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
  const metadata = JSON.parse(
    execFileSync(
      process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe',
      ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination],
      { encoding: 'utf8' },
    ),
  );
  assert.equal(metadata.streams.filter(({ codec_type }) => codec_type === 'audio').length, 0);
  return {
    file,
    nativeFile: source,
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

async function waitAfterStart(page, route, time) {
  await page.waitForFunction(
    ({ route, time }) => {
      const started =
        route === 'about'
          ? Number(document.querySelector('[data-about-hero]')?.dataset.aboutStartedAt)
          : Number(document.documentElement.dataset.signatureIntroStarted);
      return started > 0 && performance.now() - started >= time;
    },
    { route, time },
    { timeout: 10000 },
  );
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  if (only !== 'fallbacks')
    for (const width of widths)
      for (const route of routes) {
        const viewport = viewportFor(width);
        const context = await browser.newContext({
          baseURL,
          viewport,
          deviceScaleFactor: 1,
          reducedMotion: 'no-preference',
          recordVideo: { dir: nativeDirectory, size: viewport },
        });
        await instrument(context);
        const page = await context.newPage();
        watch(page, width, route, 'normal');
        const video = page.video();
        try {
          assert.equal(
            (await page.goto(route === 'about' ? '/about' : '/', { waitUntil: 'commit' })).status(),
            200,
          );
          if (route === 'about') {
            await waitAfterStart(page, route, 450);
            await screenshot(
              page,
              `about-${width}-portrait.png`,
              'Real early portrait arrival before atmospheric and text reveal. The unapproved 3D beat is withheld.',
            );
            await waitAfterStart(page, route, 1550);
            await screenshot(
              page,
              `about-${width}-atmosphere.png`,
              'Real localized orange/coral/amber atmosphere during the nonblocking arrival.',
            );
            await waitAfterStart(page, route, 2600);
            await screenshot(
              page,
              `about-${width}-copy.png`,
              'Real headline and copy reveal as the composition settles.',
            );
            await page.waitForFunction(() =>
              ['settled', 'static'].includes(
                document.querySelector('[data-about-hero]')?.dataset.aboutEntrance,
              ),
            );
            const final = await facts(page);
            assert.equal(final.about.chapters, 7);
            assert.equal(final.about.reason, 'complete');
            await screenshot(
              page,
              `about-${width}-settled.png`,
              'Settled editorial About hero viewport with unchanged founder-story paragraphs; full responsive hero views appear in the fallback captures.',
            );
            await page.waitForFunction(() => performance.now() >= 8500);
            evidence.measurements.push({
              route,
              width,
              final,
              samples: await page.evaluate(() => Reflect.get(window, '__ownerSamples')),
            });
          } else {
            await waitAfterStart(page, route, 1250);
            await screenshot(
              page,
              `home-${width}-progressive.png`,
              'Real progressive appearance of the six borderless rounded project artworks.',
            );
            await waitAfterStart(page, route, 2120);
            await screenshot(
              page,
              `home-${width}-six-artworks.png`,
              'All six approved project artworks, including the original SOL signage, without the connecting wave.',
            );
            await waitAfterStart(page, route, 3420);
            await screenshot(
              page,
              `home-${width}-held.png`,
              'Preserved independent hand/plaque raster prototype at its final held pose.',
            );
            await page.waitForFunction(
              () => document.documentElement.dataset.signatureIntro === 'completed',
            );
            const completed = await facts(page);
            assert.equal(completed.intro.reason, 'complete');
            assert(completed.intro.ended <= 5000);
            assert.equal(completed.intro.waveCount, 0);
            assert.equal(completed.intro.squares.length, 6);
            assert(completed.intro.squares.every(({ loaded }) => loaded));
            await page.waitForFunction(() => performance.now() >= 6500);
            const gradientBefore = await facts(page);
            await screenshot(
              page,
              `home-${width}-settled.png`,
              'Normal Afterglow homepage after the automatic introduction.',
            );
            await page.waitForFunction(() => performance.now() >= 8500);
            const gradientAfter = await facts(page);
            assert.equal(gradientAfter.gradient.active, 'true');
            if (gradientAfter.gradient.renderer === 'webgl')
              assert(gradientAfter.gradient.frames > gradientBefore.gradient.frames + 5);
            await screenshot(
              page,
              `home-${width}-gradient-later.png`,
              'Living homepage gradient two seconds later, with cursor stationary.',
            );
            evidence.measurements.push({
              route,
              width,
              navigation: 'initial',
              completed,
              gradientBefore,
              gradientAfter,
              samples: await page.evaluate(() => Reflect.get(window, '__ownerSamples')),
            });
            // Ordinary browser refresh: exercise the recurring loader in the same browsing context.
            await page.reload({ waitUntil: 'commit' });
            await page.waitForFunction(
              () => document.documentElement.dataset.signatureIntro === 'completed',
            );
            const refreshed = await facts(page);
            assert.equal(refreshed.intro.reason, 'complete');
            assert.equal(refreshed.intro.mode, 'full');
            assert(refreshed.intro.ended <= 5000);
            await page.waitForFunction(() => performance.now() >= 8500);
            evidence.measurements.push({
              route,
              width,
              navigation: 'refresh',
              completed: refreshed,
              final: await facts(page),
              samples: await page.evaluate(() => Reflect.get(window, '__ownerSamples')),
            });
          }
        } finally {
          await context.close();
        }
        evidence.recordings.push({
          ...transcode(
            await video.path(),
            `${route}-${width}-${route === 'home' ? 'opening-refresh' : 'arrival'}.mp4`,
          ),
          route,
          width,
        });
        await save();
      }
  if (only !== 'recordings')
    for (const width of [320, 390, 768, 1440])
      for (const route of routes)
        for (const mode of ['reduced-motion', 'no-js']) {
          const context = await browser.newContext({
            baseURL,
            viewport: viewportFor(width),
            deviceScaleFactor: 1,
            reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
            javaScriptEnabled: mode !== 'no-js',
          });
          const page = await context.newPage();
          watch(page, width, route, mode);
          assert.equal(
            (await page.goto(route === 'about' ? '/about' : '/', { waitUntil: 'load' })).status(),
            200,
          );
          await page.evaluate(() => document.fonts.ready);
          await screenshot(
            page,
            `${route}-${width}-${mode}.png`,
            `${route === 'about' ? 'About hero' : 'Afterglow homepage'} with ${mode === 'no-js' ? 'JavaScript disabled' : 'reduced motion enabled'}.`,
            { selector: route === 'about' ? '[data-about-hero]' : undefined, mode },
          );
          await context.close();
        }
} finally {
  await browser.close();
  await save();
}

const gallery = [
  '# Owner corrections — About and homepage opening',
  '',
  'Real production Chromium screenshots and native real-time recordings. Videos are full, silent H.264 transcodes at the original speed. Home recordings include an actual refresh and the continuing ambient gradient. No application timeline was sought or paused.',
  '',
  '**3D asset dependency remains open:** the About 3D emblem beat is withheld because no approved editable emblem geometry or 3D source was supplied. These previews do not represent the final requested 3D sequence. The existing homepage hand/plaque is the approved separated-raster prototype. [Asset audit and exact requirements](../../docs/owner-corrections/ASSET_STATUS.md).',
  '',
  '[Capture facts, timings and file hashes](capture-evidence.json)',
  '',
];
for (const width of [1440, 390]) {
  gallery.push(
    `## ${width}px About arrival`,
    '',
    `[Real About arrival recording](about-${width}-arrival.mp4)`,
    '',
  );
  for (const [scene, title] of [
    ['portrait', 'Portrait arrives first'],
    ['atmosphere', 'Localized atmosphere develops'],
    ['copy', 'Headline and copy reveal'],
    ['settled', 'Complete settled hero'],
  ])
    gallery.push(`### ${title}`, '', `![${title} at ${width}px](about-${width}-${scene}.png)`, '');
  gallery.push(
    `## ${width}px homepage opening`,
    '',
    `[Real opening, living gradient and browser refresh recording](home-${width}-opening-refresh.mp4)`,
    '',
  );
  for (const [scene, title] of [
    ['progressive', 'Progressive artwork reveal'],
    ['six-artworks', 'Six enlarged approved artworks'],
    ['held', 'Preserved hand/plaque choreography'],
    ['settled', 'Automatic Afterglow transition'],
    ['gradient-later', 'Living gradient with stationary cursor'],
  ])
    gallery.push(`### ${title}`, '', `![${title} at ${width}px](home-${width}-${scene}.png)`, '');
}
gallery.push(
  '## Responsive and fallback evidence',
  '',
  'The following views are captured with real reduced-motion preferences or JavaScript disabled. No CSS was injected to imitate a fallback.',
  '',
);
for (const width of [320, 390, 768, 1440]) {
  gallery.push(`### ${width}px`, '');
  for (const route of ['about', 'home'])
    for (const mode of ['reduced-motion', 'no-js'])
      gallery.push(`![${route} ${mode} at ${width}px](${route}-${width}-${mode}.png)`, '');
}
if (only === 'all' && widths.length === 2 && routes.length === 2)
  await writeFile(path.join(output, 'README.md'), `${gallery.join('\n')}\n`);
console.log(
  JSON.stringify(
    {
      output,
      screenshots: evidence.screenshots.length,
      recordings: evidence.recordings.length,
      errors: evidence.errors,
      failedRequests: evidence.failedRequests,
    },
    null,
    2,
  ),
);
