import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, performance, scrollY, innerHeight, innerWidth, location, getComputedStyle */
// Supplementary real startup and preserved-experience evidence. No state seeking.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const mode = argument('--mode', 'before');
assert(['before', 'after'].includes(mode));
const baseURL = argument('--base-url', 'http://127.0.0.1:4480');
const sourceRoot = path.resolve(
  argument('--source-root', mode === 'before' ? '/workspace/drawnout-contact-signature' : '.'),
);
const output = path.resolve(argument('--out', 'artifacts/sitewide-motion'));
const native = path.resolve(
  argument('--native-dir', '/workspace/sitewide-motion-review/native-scenes'),
);
const widths = argument('--widths', '1440,390').split(',').map(Number);
const sections = argument('--sections', 'about,preserved').split(',');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: sourceRoot,
  encoding: 'utf8',
}).trim();
if (mode === 'before') assert.equal(sourceCommit, 'b1c7db29a186c7413cad0bc5cdb59d62d5200f66');
const sourceFiles = {};
for (const name of [
  'src/components/about/PremiumAboutHero.astro',
  'src/scripts/about-motion.ts',
  'src/styles/about-premium-hero.css',
  'src/scripts/services-hero.ts',
  'src/scripts/enquiry-puzzle.ts',
  'src/scripts/signature-footer.ts',
  ...(mode === 'after' ? ['public/scripts/about-arrival.js'] : []),
]) {
  const bytes = await readFile(path.join(sourceRoot, name));
  assert.equal(
    hash(bytes),
    hash(execFileSync('git', ['show', `HEAD:${name}`], { cwd: sourceRoot })),
    `Commit ${name} before final captures.`,
  );
  sourceFiles[name] = hash(bytes);
}
const evidence = {
  capturedAt: new Date().toISOString(),
  mode,
  sourceCommit,
  sourceFiles,
  baseURL,
  productionAboutHTMLSHA256: hash(await readFile(path.join(sourceRoot, 'dist/about/index.html'))),
  method:
    'Actual production Chromium viewport recordings and unretouched PNGs. About is a cold direct visit; phase samples follow the real startup clock without timeline seeks or altered attributes/styles. The actual observed entrance/scene/state/reason and image/animation state accompany every scheduled sample, including any parent static fallback. Native wheel input and an ordinary service link reach the preserved Services hero, Brand Identity puzzle and reversible raster footer. Mobile is Chromium touch/viewport emulation, not a physical-device benchmark.',
  browser: '',
  screenshots: [],
  recordings: [],
  measurements: [],
  pageErrors: [],
  failedRequests: [],
};
const manifest = path.join(output, `${mode}-scenes-capture.json`);
const save = () => writeFile(manifest, `${JSON.stringify(evidence, null, 2)}\n`);
async function facts(page, label, width) {
  const state = await page.evaluate(() => {
    const hero = document.querySelector('[data-about-hero]');
    const service = document.querySelector('[data-services-hero]');
    const puzzle = document.querySelector('[data-enquiry-puzzle]');
    const footer = document.querySelector('[data-site-footer]');
    const transform = (node) =>
      node
        ? { transform: getComputedStyle(node).transform, opacity: getComputedStyle(node).opacity }
        : null;
    return {
      at: performance.now(),
      route: location.pathname,
      scrollY,
      overflow: document.documentElement.scrollWidth > innerWidth,
      hero: hero
        ? {
            ...hero.dataset,
            artwork: transform(hero.querySelector('[data-about-artwork]')),
            plaque: transform(hero.querySelector('[data-about-plaque]')),
            gradient: transform(hero.querySelector('[data-about-gradient]')),
            headline: transform(hero.querySelector('[data-about-headline]')),
            nativeAnimations: hero.getAnimations({ subtree: true }).map((a) => ({
              state: a.playState,
              currentTime: a.currentTime,
              effectDuration: a.effect?.getTiming().duration,
            })),
            images: [...hero.querySelectorAll('img')].map((i) => ({
              complete: i.complete,
              width: i.naturalWidth,
              source: i.currentSrc,
            })),
          }
        : null,
      services: service
        ? {
            ...service.dataset,
            visibleScene: [...service.querySelectorAll('[data-services-scene]')]
              .filter((s) => !s.hidden)
              .map((s) => s.dataset.servicesScene),
          }
        : null,
      puzzle: puzzle
        ? {
            ...puzzle.dataset,
            pieces: [...puzzle.querySelectorAll('[data-enquiry-piece]')].map((p) => ({
              name: p.dataset.enquiryPiece,
              ...transform(p),
            })),
          }
        : null,
      footer: footer
        ? {
            ...footer.dataset,
            signature: transform(footer.querySelector('[data-footer-signature]')),
            hand: transform(footer.querySelector('[data-signature-hand]')),
            plaque: transform(footer.querySelector('[data-signature-plaque]')),
          }
        : null,
    };
  });
  assert.equal(state.overflow, false, `No horizontal overflow at ${label}/${width}`);
  evidence.measurements.push({ label, width, ...state });
  await save();
  return state;
}
async function shot(page, file, width, description) {
  const before = await facts(page, description, width);
  const bytes = await page.screenshot({ path: path.join(output, file), animations: 'allow' });
  const after = await facts(page, `${description} captured`, width);
  evidence.screenshots.push({
    file,
    width,
    description,
    bytes: bytes.length,
    sha256: hash(bytes),
    dimensions: [bytes.readUInt32BE(16), bytes.readUInt32BE(20)],
    actualTimeBefore: before.at,
    actualTimeAfter: after.at,
  });
  await save();
}
async function wheelTo(page, requested, step = 260) {
  const destination = Math.max(
    0,
    Math.min(
      requested,
      await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    ),
  );
  for (let n = 0; n < 240; n++) {
    const current = await page.evaluate(() => scrollY);
    if (Math.abs(current - destination) < 4) {
      await page.waitForTimeout(100);
      if (Math.abs((await page.evaluate(() => scrollY)) - destination) < 4) return;
    }
    await page.mouse.wheel(
      0,
      Math.sign(destination - current) * Math.min(step, Math.abs(destination - current)),
    );
    await page.waitForTimeout(44);
  }
  throw new Error(`Native wheel did not reach ${destination}`);
}
async function align(page, locator, top = 130) {
  await wheelTo(
    page,
    await locator.evaluate(
      (node, inset) => scrollY + node.getBoundingClientRect().top - inset,
      top,
    ),
  );
  await page.waitForTimeout(650);
}
async function record(context, page, file, width, description) {
  const recording = page.video();
  await context.close();
  const original = await recording.path();
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
      ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path.join(output, file)],
      { encoding: 'utf8' },
    ),
  );
  execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(output, file), '-f', 'null', '-'], {
    stdio: 'pipe',
  });
  evidence.recordings.push({
    file,
    width,
    height: width < 768 ? 844 : 900,
    description,
    durationSeconds: Number(probe.format.duration),
    bytes: bytes.length,
    sha256: hash(bytes),
    fullyDecoded: true,
    nativeBrowserVideo: original,
  });
  await save();
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
const setup = async (width) => {
  const viewport = { width, height: width < 768 ? 844 : 900 };
  const context = await browser.newContext({
    baseURL,
    viewport,
    deviceScaleFactor: 1,
    hasTouch: width < 768,
    isMobile: width < 768,
    reducedMotion: 'no-preference',
    recordVideo: { dir: native, size: viewport },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => evidence.pageErrors.push({ width, message: e.message }));
  page.on('requestfailed', (r) =>
    evidence.failedRequests.push({
      width,
      url: r.url(),
      error: r.failure()?.errorText,
      navigationCancellation: r.failure()?.errorText === 'net::ERR_ABORTED',
    }),
  );
  return { page, context };
};
try {
  for (const width of widths) {
    if (sections.includes('about')) {
      const { page, context } = await setup(width);
      await page.goto('/about', { waitUntil: 'commit' });
      await page.locator('[data-about-hero]').waitFor({ state: 'attached' });
      const first = await facts(page, 'About cold markup available', width);
      const start = Number(first.hero?.aboutStartedAt ?? first.hero?.aboutArrivalAt ?? first.at);
      for (const [name, target] of [
        ['opening', 180],
        ['plaque', 900],
        ['atmosphere', 1450],
        ['copy', 2250],
        ['settled', 3950],
      ]) {
        const now = await page.evaluate(() => performance.now());
        await page.waitForTimeout(Math.max(0, start + target - now));
        await shot(
          page,
          `${mode}-${width}-about-${name}.png`,
          width,
          `About natural ${name} startup sample (target ${target}ms from real start)`,
        );
      }
      await page.waitForTimeout(750);
      await wheelTo(page, Math.min(650, width < 768 ? 500 : 650), 110);
      await page.waitForTimeout(650);
      await shot(
        page,
        `${mode}-${width}-about-story.png`,
        width,
        'About native scroll into the story after settled arrival',
      );
      await record(
        context,
        page,
        `${mode}-${width}-about-startup.mp4`,
        width,
        'Cold About startup, real ordered scenes/static fallback, settled composition and native scroll',
      );
    }
    if (sections.includes('preserved')) {
      const { page, context } = await setup(width);
      await page.goto('/services', { waitUntil: 'load' });
      const started = await page.evaluate(() => performance.now());
      for (const [name, target] of [
        ['opening', 1000],
        ['middle', 6500],
        ['completed-cycle', 14700],
      ]) {
        const now = await page.evaluate(() => performance.now());
        await page.waitForTimeout(Math.max(0, started + target - now));
        await shot(
          page,
          `${mode}-${width}-services-${name}.png`,
          width,
          `Preserved Services live ${name} sample`,
        );
      }
      const link = page.locator('[data-service-chapter-link][href="/services/brand-identity"]');
      await align(page, link, 180);
      await link.click();
      await page.waitForURL('**/services/brand-identity');
      await page.waitForLoadState('load');
      const puzzle = page.locator('[data-enquiry-puzzle]');
      await align(page, puzzle.locator('[data-enquiry-stage]'), 150);
      await page.waitForTimeout(1000);
      await shot(
        page,
        `${mode}-${width}-puzzle-early.png`,
        width,
        'Preserved Brand Identity enquiry puzzle after native arrival',
      );
      await page.waitForTimeout(7200);
      await shot(
        page,
        `${mode}-${width}-puzzle-composed.png`,
        width,
        'Preserved enquiry puzzle after its natural complete cycle',
      );
      const footer = page.locator('[data-site-footer]');
      const bounds = await footer.evaluate((node) => ({
        top: scrollY + node.getBoundingClientRect().top,
        height: node.getBoundingClientRect().height,
      }));
      await wheelTo(page, bounds.top - (width < 768 ? 844 : 900) * 0.8, 150);
      await page.waitForTimeout(700);
      await shot(
        page,
        `${mode}-${width}-footer-arrive.png`,
        width,
        'Existing raster footer prototype: native arrival',
      );
      await wheelTo(page, bounds.top + bounds.height - (width < 768 ? 844 : 900), 80);
      await page.waitForTimeout(750);
      await shot(
        page,
        `${mode}-${width}-footer-expanded.png`,
        width,
        'Existing raster footer prototype: expanded settled composition, contact and navigation',
      );
      await wheelTo(page, bounds.top - (width < 768 ? 844 : 900) * 0.7, 80);
      await page.waitForTimeout(750);
      await shot(
        page,
        `${mode}-${width}-footer-reverse.png`,
        width,
        'Existing raster footer prototype: native reverse scroll',
      );
      await record(
        context,
        page,
        `${mode}-${width}-preserved-services-footer.mp4`,
        width,
        'Preserved Services cycle, real Brand Identity navigation/puzzle and forward/reverse raster footer',
      );
    }
  }
} finally {
  await browser.close();
  evidence.completedAt = new Date().toISOString();
  await save();
}
assert.equal(evidence.pageErrors.length, 0, JSON.stringify(evidence.pageErrors));
console.log(
  JSON.stringify({
    mode,
    sourceCommit,
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    pageErrors: evidence.pageErrors.length,
  }),
);
