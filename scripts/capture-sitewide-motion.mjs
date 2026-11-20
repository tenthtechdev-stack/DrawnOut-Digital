import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, performance, scrollY, innerHeight, getComputedStyle */
// Actual browser inputs and real media clocks. No application-state or timeline rewriting.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const mode = argument('--mode', 'before');
assert(['before', 'after'].includes(mode));
const baseURL = argument('--base-url', 'http://127.0.0.1:4480');
const sourceRoot = path.resolve(argument('--source-root', mode === 'before' ? '/workspace/drawnout-contact-signature' : '.'));
const output = path.resolve(argument('--out', 'artifacts/sitewide-motion'));
const native = path.resolve(argument('--native-dir', '/workspace/sitewide-motion-review/native'));
const widths = argument('--widths', '1440,390').split(',').map(Number);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim();
if (mode === 'before') assert.equal(sourceCommit, 'b1c7db29a186c7413cad0bc5cdb59d62d5200f66');
const sourceFiles = {};
for (const name of ['src/scripts/portfolio-motion.ts', 'src/lib/portfolio-motion-policy.ts', 'src/components/MediaSlot.astro', 'src/pages/contact.astro', 'src/scripts/contact-first-thought.ts', 'src/scripts/about-motion.ts']) {
  const bytes = await readFile(path.join(sourceRoot, name));
  assert.equal(hash(bytes), hash(execFileSync('git', ['show', `HEAD:${name}`], { cwd: sourceRoot })), `Commit ${name} before final evidence.`);
  sourceFiles[name] = hash(bytes);
}
const evidence = {
  capturedAt: new Date().toISOString(), mode, sourceCommit, sourceFiles, baseURL,
  productionContactHTMLSHA256: hash(await readFile(path.join(sourceRoot, 'dist/contact/index.html'))),
  method: 'Actual production Chromium browser videos and viewport screenshots. Native wheel input drives scroll and reversal; ordinary links navigate to Work, SOL case and Contact. Live video frames/currentTime are observed without seeks or rewritten attributes/styles. Actual alternate-tab activation attempts background return; measured visibility is retained, with limitations explicit if this headless runtime does not background the original tab. H.264 transcodes retain browser timing. Mobile is Chromium touch/viewport emulation, not a physical device.',
  browser: '', screenshots: [], recordings: [], measurements: [], background: [], pageErrors: [], failedRequests: [],
};
const save = () => writeFile(path.join(output, `${mode}-capture.json`), `${JSON.stringify(evidence, null, 2)}\n`);
async function facts(page, label, width) {
  const entry = await page.evaluate(() => ({
    at: performance.now(), route: window.location.pathname, scrollY,
    visible: !document.hidden, visibilityState: document.visibilityState,
    intro: document.documentElement.dataset.signatureIntro,
    preference: document.documentElement.dataset.portfolioMotion,
    available: document.documentElement.dataset.portfolioMotionAvailable,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    oldControls: document.querySelectorAll('[data-motion-toggle]').length,
    globalControls: document.querySelectorAll('[data-portfolio-motion-preference]').length,
    thought: (() => { const t = document.querySelector('[data-first-thought]'); return t ? { state: t.dataset.thoughtState, phase: t.dataset.thoughtPhase, time: t.dataset.thoughtTime, reason: t.dataset.thoughtReason } : null; })(),
    videos: [...document.querySelectorAll('[data-portfolio-video]')].map((v) => {
      const bounds = v.getBoundingClientRect();
      const quality = v.getVideoPlaybackQuality?.();
      return { id: v.id, state: v.dataset.motionState, frame: v.dataset.motionFrame, source: v.getAttribute('src'), currentSrc: v.currentSrc, time: v.currentTime, duration: Number.isFinite(v.duration) ? v.duration : null, paused: v.paused, readyState: v.readyState, dimensions: [v.videoWidth, v.videoHeight], presented: quality?.totalVideoFrames, dropped: quality?.droppedVideoFrames, opacity: getComputedStyle(v).opacity, bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }, ratio: Math.max(0, Math.min(innerHeight, bounds.bottom) - Math.max(0, bounds.top)) / Math.max(1, bounds.height) };
    }),
    scenes: [...document.querySelectorAll('[data-work-scene]')].filter((s) => ['bunzo', 'sol-community-center'].includes(s.dataset.projectSlug)).map((s) => ({ slug: s.dataset.projectSlug, progress: getComputedStyle(s).getPropertyValue('--work-progress'), presentation: s.dataset.projectPresentation })),
  }));
  evidence.measurements.push({ label, width, ...entry });
  await save();
  assert.equal(entry.overflow, false, `No horizontal overflow at ${label}/${width}`);
  return entry;
}
async function shot(page, name, width, description) {
  const bytes = await page.screenshot({ path: path.join(output, name), animations: 'allow' });
  evidence.screenshots.push({ file: name, width, description, bytes: bytes.length, sha256: hash(bytes), dimensions: [bytes.readUInt32BE(16), bytes.readUInt32BE(20)] });
  await save();
}
async function wheelTo(page, requested, step = 300) {
  const destination = Math.max(0, Math.min(requested, await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)));
  for (let n = 0; n < 200; n++) {
    const current = await page.evaluate(() => scrollY);
    if (Math.abs(current - destination) < 4) {
      await page.waitForTimeout(100);
      if (Math.abs((await page.evaluate(() => scrollY)) - destination) < 4) return;
    }
    await page.mouse.wheel(0, Math.sign(destination - current) * Math.min(step, Math.abs(destination - current)));
    await page.waitForTimeout(48);
  }
  throw new Error(`Native scroll could not reach ${destination}`);
}
async function align(page, locator, top = 160) {
  await wheelTo(page, await locator.evaluate((node, inset) => scrollY + node.getBoundingClientRect().top - inset, top));
  await page.waitForTimeout(700);
}
async function nav(page, route, width) {
  if (width < 1024) {
    await page.locator('[data-menu-trigger]').click();
    await page.locator(`dialog[open] .mobile-nav a[href="${route}"]`).click();
  } else {
    await page.locator(`[data-site-header] .primary-nav a[href="${route}"]`).click();
  }
  await page.waitForURL((url) => url.pathname === route);
  await page.waitForLoadState('load');
}
async function progress(page, slug, fraction) {
  const scene = page.locator(`[data-work-scene][data-project-slug="${slug}"]`);
  const target = await scene.evaluate((node, p) => { const style = getComputedStyle(node); const start = Number(style.getPropertyValue('--work-scroll-start')); const end = Number(style.getPropertyValue('--work-scroll-end')); return scrollY + node.getBoundingClientRect().top - innerHeight * (start + (end - start) * p); }, fraction);
  await wheelTo(page, target, 70);
  await page.waitForTimeout(350);
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
evidence.browser = browser.version();
try {
  for (const width of widths) {
    const viewport = { width, height: width < 768 ? 844 : 900 };
    const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor: 1, hasTouch: width < 768, isMobile: width < 768, reducedMotion: 'no-preference', recordVideo: { dir: native, size: viewport } });
    const page = await context.newPage();
    const video = page.video();
    page.on('pageerror', (e) => evidence.pageErrors.push({ width, message: e.message }));
    page.on('requestfailed', (r) => evidence.failedRequests.push({ width, url: r.url(), error: r.failure()?.errorText, navigationCancellation: r.failure()?.errorText === 'net::ERR_ABORTED' }));
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('[data-signature-intro-overlay]').waitFor({ state: 'hidden', timeout: 8000 });
    await page.waitForTimeout(700);
    await facts(page, 'homepage settled', width);
    await shot(page, `${mode}-${width}-home.png`, width, 'Natural settled homepage, approved intro and hero intact');
    const homeSol = page.locator('[data-portfolio-card][data-project-slug="sol-community-center"]').first();
    await align(page, homeSol, 125);
    await page.waitForTimeout(1800);
    await facts(page, 'homepage SOL before scroll', width);
    await shot(page, `${mode}-${width}-home-sol.png`, width, 'Homepage SOL card; individual controls in parent, removed in new implementation');
    await wheelTo(page, Math.max(0, (await page.evaluate(() => scrollY)) - 300), 100);
    await page.waitForTimeout(500);
    await align(page, homeSol, 125);
    await page.waitForTimeout(1000);
    await facts(page, 'homepage SOL after small reverse scroll', width);
    await nav(page, '/work', width);
    await page.waitForTimeout(400);
    for (const slug of ['bunzo', 'sol-community-center']) {
      for (const [name, fraction] of [['initial', 0], ['middle', 0.5], ['expanded', 1]]) {
        await progress(page, slug, fraction);
        await facts(page, `Work ${slug} ${name}`, width);
        await shot(page, `${mode}-${width}-work-${slug}-${name}.png`, width, `Natural scroll ${slug} ${name} composition`);
      }
    }
    await progress(page, 'sol-community-center', 0.2);
    await facts(page, 'Work SOL reverse contraction', width);
    await progress(page, 'sol-community-center', 1);
    await page.locator('[data-work-scene][data-project-slug="sol-community-center"] .work-card-link').click();
    await page.waitForURL('**/work/sol-community-center');
    await page.waitForLoadState('load');
    const caseVideo = page.locator('#case-motion-sol-community-center');
    await align(page, caseVideo, width < 768 ? 180 : 170);
    await page.waitForTimeout(1600);
    await facts(page, 'SOL case initial playback', width);
    await shot(page, `${mode}-${width}-case-sol.png`, width, 'Real SOL case artwork and playback control arrangement');
    await page.waitForTimeout(7800);
    await facts(page, 'SOL case after one full loop', width);
    const backgroundPage = await context.newPage();
    await backgroundPage.goto('about:blank');
    await backgroundPage.bringToFront();
    await page.waitForTimeout(800);
    const hiddenState = await facts(page, 'actual alternate tab active', width);
    await page.bringToFront();
    await page.waitForTimeout(800);
    const returnState = await facts(page, 'actual tab returned', width);
    evidence.background.push({ width, hidden: !hiddenState.visible, returnVisible: returnState.visible, limitation: hiddenState.visible ? 'Headless Chromium kept the recorded tab visible after ordinary second-tab activation. This movie does not establish hidden-tab suspension; separate browser lifecycle tests must cover that behavior.' : null });
    await backgroundPage.close();
    await nav(page, '/contact', width);
    // Observe all4.8 active seconds; content remains usable from first paint.
    await facts(page, 'Contact arrival', width);
    await page.waitForTimeout(5200);
    await facts(page, 'Contact settled', width);
    await shot(page, `${mode}-${width}-contact.png`, width, 'The First Thought settles naturally; unconfigured enquiry behavior preserved');
    await align(page, page.locator('#enquiry-name'), 180);
    await page.locator('#enquiry-name').click();
    await page.keyboard.type('A first thought', { delay: 55 });
    await shot(page, `${mode}-${width}-contact-form.png`, width, 'Normal unconfigured form remains usable; no provider request sent');
    await context.close();
    const original = await video.path();
    const file = `${mode}-${width}-journey.mp4`;
    execFileSync('ffmpeg', ['-y', '-i', original, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(output, file)], { stdio: 'pipe' });
    const bytes = await readFile(path.join(output, file));
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path.join(output, file)], { encoding: 'utf8' }));
    execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(output, file), '-f', 'null', '-'], { stdio: 'pipe' });
    evidence.recordings.push({ file, width, height: viewport.height, durationSeconds: Number(probe.format.duration), bytes: bytes.length, sha256: hash(bytes), fullyDecoded: true, nativeBrowserVideo: original });
    await save();
  }
} finally {
  await browser.close();
  evidence.completedAt = new Date().toISOString();
  await save();
}
assert.equal(evidence.pageErrors.length, 0, JSON.stringify(evidence.pageErrors));
console.log(JSON.stringify({ mode, sourceCommit, screenshots: evidence.screenshots.length, recordings: evidence.recordings.length, pageErrors: evidence.pageErrors.length, background: evidence.background }));
