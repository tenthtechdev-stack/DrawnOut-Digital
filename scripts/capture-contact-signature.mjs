import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, innerHeight, innerWidth, performance, scrollY, fetch */
// Real browser evidence only: no timeline seeks, rewritten CSS or composited screenshots.
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4471');
const beforeURL = argument('--before-url', '');
const beforeOnly = process.argv.includes('--before-only');
const output = path.resolve(argument('--out', 'artifacts/contact-signature'));
const native = path.resolve(argument('--native-dir', '/workspace/contact-signature-review/native'));
const recordWidths = argument('--widths', '1440,390').split(',').map(Number);
const layoutWidths = argument('--layout-widths', '320,390,768,1024,1440,1920')
  .split(',')
  .map(Number);
const baselineCommit = '106d63ca5d50f4f84a715c407073f6d7c8fc7424';
const fixtureEndpoint = 'https://formspree.io/f/contactsignaturefixture';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const root = path.resolve('.');
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
assert(!beforeOnly || beforeURL, '--before-only requires a preserved-parent --before-url.');
const sourceFiles = {};
if (!beforeOnly) {
  const contactFiles = execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      'src/components/contact',
      'src/scripts/contact*',
      'src/lib/contact*',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean);
  for (const file of new Set([
    'scripts/capture-contact-signature.mjs',
    'src/pages/contact.astro',
    'src/data/contact.ts',
    'src/layouts/SiteLayout.astro',
    'src/styles/global.css',
    ...contactFiles,
  ])) {
    const bytes = await readFile(file);
    const committed = execFileSync('git', ['show', `HEAD:${file}`]);
    assert.equal(
      hash(bytes),
      hash(committed),
      `Commit the final formatted ${file} before capture.`,
    );
    sourceFiles[file] = hash(bytes);
  }
}
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles,
  baseURL,
  beforeURL: beforeURL || undefined,
  baselineCommit,
  method:
    'Actual production Chromium recordings and unretouched screenshots. Main recordings use native wheel input and normal unconfigured form controls; scene screenshots observe real lifecycle phases without seeks. Static full-page evidence uses the real reduced-motion/no-JavaScript fallbacks and GPU-disabled Chromium to avoid tall software-renderer screenshot artifacts. Provider-state images are separate, clearly labelled intercepted fixtures; no real submission, provider account or inbox delivery is tested.',
  browsers: {},
  screenshots: [],
  recordings: [],
  animationSamples: [],
  mockedSubmissions: [],
  errors: [],
  failedRequests: [],
};
const save = () =>
  writeFile(path.join(output, 'contact-capture.json'), `${JSON.stringify(evidence, null, 2)}\n`);
const viewportFor = (width) => ({ width, height: width < 640 ? 844 : 900 });
function observe(page, description) {
  page.on('pageerror', (error) => evidence.errors.push({ description, message: error.message }));
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      description,
      url: request.url(),
      error: request.failure()?.errorText,
      deliberateCancellation: request.failure()?.errorText === 'net::ERR_ABORTED',
    }),
  );
}
async function capture(page, filename, details, target) {
  if (target) {
    const focus = target.locator(
      details.state === 'validation' ? '[data-error-summary]' : '.form-feedback',
    );
    const documentTop = await focus.evaluate((node) => scrollY + node.getBoundingClientRect().top);
    await wheelTo(
      page,
      documentTop -
        (details.state === 'validation' ? 130 : Math.min(450, details.viewport.height * 0.58)),
    );
  }
  // A true viewport preserves sticky navigation at its real screen edge. A tall locator
  // screenshot can composite that header into the middle of the captured form.
  const bytes = await page.screenshot({
    path: path.join(output, filename),
    fullPage: Boolean(details.fullPage),
    animations: 'allow',
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, `${filename}: horizontal overflow`);
  evidence.screenshots.push({
    file: filename,
    ...details,
    captureScope: details.fullPage ? 'full-page' : 'actual-viewport',
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
    sha256: hash(bytes),
    horizontalOverflow: overflow,
  });
}
async function staticPage(page, url) {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode()));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(180);
}
async function wheelTo(page, requested) {
  const target = Math.max(
    0,
    Math.min(
      requested,
      await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    ),
  );
  for (let attempt = 0; attempt < 100; attempt++) {
    const current = await page.evaluate(() => scrollY);
    if (Math.abs(current - target) <= 4) {
      await page.waitForTimeout(220);
      if (Math.abs((await page.evaluate(() => scrollY)) - target) <= 4) return;
    }
    await page.mouse.wheel(
      0,
      Math.sign(target - current) * Math.min(360, Math.abs(target - current)),
    );
    await page.waitForTimeout(70);
  }
  assert.fail(`Native scrolling did not settle at ${target}.`);
}
async function thoughtState(page) {
  return page.locator('[data-first-thought]').evaluate((node) => {
    const box = node.getBoundingClientRect();
    const drawing = node.querySelector('svg').getBoundingClientRect();
    const hitTests = [0.2, 0.5, 0.8].map((fraction) => {
      const x = drawing.left + drawing.width * fraction;
      const y = drawing.top + drawing.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        x,
        y,
        inViewport: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight,
        unobstructed: Boolean(hit && node.contains(hit)),
        hitTag: hit?.tagName,
        hitClass: hit?.getAttribute('class'),
      };
    });
    return {
      at: performance.now(),
      globalArrivalOverlayCount: document.querySelectorAll('[data-signature-intro-overlay]').length,
      hitTests,
      state: node.dataset.thoughtState,
      phase: node.dataset.thoughtPhase,
      time: Number(node.dataset.thoughtTime),
      reason: node.dataset.thoughtReason,
      box: { top: box.top, bottom: box.bottom, width: box.width, height: box.height },
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
}
async function transcode(video, filename, viewport) {
  const original = await video.path();
  const target = path.join(output, filename);
  const probe = (file) =>
    JSON.parse(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file],
        {
          encoding: 'utf8',
        },
      ),
    );
  const originalProbe = probe(original);
  execFileSync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    original,
    '-an',
    '-c:v',
    'libx264',
    '-threads',
    '2',
    '-preset',
    'medium',
    '-crf',
    '22',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    target,
  ]);
  const converted = probe(target);
  execFileSync('ffmpeg', ['-v', 'error', '-i', target, '-f', 'null', '-']);
  const bytes = await readFile(target);
  evidence.recordings.push({
    file: filename,
    viewport,
    bytes: bytes.length,
    sha256: hash(bytes),
    durationSeconds: Number(converted.format.duration),
    decodedAllFrames: true,
    nativeStreams: originalProbe.streams,
    streams: converted.streams,
    note: 'Native browser timing retained; no speed changes, colour grading or animation seeks.',
  });
  await save();
}
async function captureAnimation(browser, width) {
  const viewport = viewportFor(width);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    hasTouch: width < 640,
    reducedMotion: 'no-preference',
    recordVideo: { dir: native, size: viewport },
  });
  const page = await context.newPage();
  observe(page, `normal-${width}`);
  const video = page.video();
  assert(video);
  await page.goto(`${baseURL}/contact`, { waitUntil: 'commit' });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-first-thought]')?.getAttribute('data-thought-state') ===
      'playing',
  );
  assert.equal(
    await page.locator('[data-signature-intro-overlay]').count(),
    0,
    'Cold Contact must expose its content without the global arrival overlay.',
  );
  const observed = new Set();
  const samples = [];
  const began = Date.now();
  while (Date.now() - began < 12_000) {
    const state = await thoughtState(page);
    samples.push(state);
    assert.equal(state.globalArrivalOverlayCount, 0, 'Unexpected Contact arrival overlay.');
    assert(
      state.hitTests.every((hit) => hit.inViewport && hit.unobstructed),
      `The actual ${width}px ${state.phase} artwork is occluded: ${JSON.stringify(state.hitTests)}`,
    );
    const name =
      state.state === 'settled'
        ? 'settled'
        : state.phase === 'thought'
          ? 'opening'
          : state.phase === 'connection' && state.time >= 1.6
            ? 'intermediate'
            : undefined;
    if (name && !observed.has(name)) {
      await capture(page, `contact-${width}-${name}.png`, {
        viewport,
        kind: 'actual-animation-phase',
        phase: state.phase,
        lifecycleState: state.state,
        sampledAnimationTime: state.time,
        hitTests: state.hitTests,
        globalArrivalOverlayCount: state.globalArrivalOverlayCount,
      });
      observed.add(name);
    }
    if (state.state === 'settled') break;
    await page.waitForTimeout(60);
  }
  assert.deepEqual([...observed].sort(), ['intermediate', 'opening', 'settled']);
  assert.equal(samples.at(-1).state, 'settled');
  assert.equal(samples.at(-1).phase, 'conversation');
  assert.equal(samples.at(-1).time, 4.8);
  assert.equal(samples.at(-1).reason, 'complete');
  evidence.animationSamples.push({ width, samples, elapsedMs: Date.now() - began });
  const form = page.locator('[data-enquiry-form]');
  assert.equal(
    await form.getAttribute('data-endpoint'),
    '',
    'Main recordings must stay genuinely unconfigured.',
  );
  const name = form.locator('[name="name"]');
  await wheelTo(
    page,
    await name.evaluate((node) => scrollY + node.getBoundingClientRect().top - 150),
  );
  await name.click();
  await page.keyboard.type('Alex Example', { delay: 65 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  assert.equal(
    await page.locator('[data-form-state]').getAttribute('data-form-state'),
    'unconfigured',
  );
  await context.close();
  await transcode(video, `contact-${width}-animation.mp4`, viewport);
}
async function interceptConfiguredHTML(page) {
  await page.route('**/contact', async (route) => {
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(/<form\b[^>]*\bdata-enquiry-form\b[^>]*>/, (tag) => {
      const cleaned = tag
        .replace(/\sdata-endpoint(?:="[^"]*")?(?=\s|>)/, '')
        .replace(/\saction="[^"]*"/, '');
      return cleaned.replace(
        />$/,
        ` data-endpoint="${fixtureEndpoint}" action="${fixtureEndpoint}">`,
      );
    });
    html = html.replace(/<button\b[^>]*\bdata-submit-enquiry\b[^>]*>/, (tag) =>
      tag.replace(/\sdisabled(?:="[^"]*")?/, ''),
    );
    await route.fulfill({ response, body: html });
  });
}
async function fillForm(page) {
  const form = page.locator('[data-enquiry-form]');
  await form.locator('[name="name"]').fill('Alex Example');
  await form.locator('[name="email"]').fill('alex@example.com');
  await form.locator('[name="service"]').selectOption('not-sure');
  await form
    .locator('[name="description"]')
    .fill('An intercepted interface test. This is not a live enquiry.');
}
async function mockedFormEvidence(browser, width) {
  const viewport = viewportFor(width);
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  observe(page, `mocked-form-${width}`);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let failure = false;
  const submissions = [];
  await page.route('https://formspree.io/**', (route) => route.abort());
  await page.route(fixtureEndpoint, async (route) => {
    submissions.push({
      method: route.request().method(),
      url: route.request().url(),
      intercepted: true,
    });
    if (!failure) await gate;
    await route.fulfill({
      status: failure ? 503 : 200,
      contentType: 'application/json',
      body: failure ? '{"errors":[{"message":"Intercepted provider failure"}]}' : '{"ok":true}',
    });
  });
  await interceptConfiguredHTML(page);
  await page.goto(`${baseURL}/contact`);
  await page.waitForSelector('[data-enquiry-form][data-enhanced="true"]');
  const section = page.locator('.enquiry[data-form-state]');
  const submit = page.locator('[data-submit-enquiry]');
  await submit.click();
  await page.locator('[data-error-summary]:not([hidden])').waitFor();
  await capture(
    page,
    `contact-${width}-form-mocked-validation.png`,
    {
      viewport,
      kind: 'intercepted-test-only',
      state: 'validation',
      liveDeliveryVerified: false,
    },
    section,
  );
  await fillForm(page);
  await submit.click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-form-state]')?.getAttribute('data-form-state') === 'submitting',
  );
  await capture(
    page,
    `contact-${width}-form-mocked-pending.png`,
    {
      viewport,
      kind: 'intercepted-test-only',
      state: 'submitting',
      liveDeliveryVerified: false,
    },
    section,
  );
  assert.equal(submissions.length, 1);
  release();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-form-state]')?.getAttribute('data-form-state') === 'success',
  );
  await capture(
    page,
    `contact-${width}-form-mocked-success.png`,
    {
      viewport,
      kind: 'intercepted-test-only',
      state: 'provider-accepted-fixture',
      liveDeliveryVerified: false,
    },
    section,
  );
  await page.locator('[data-new-enquiry]').click();
  failure = true;
  await fillForm(page);
  await submit.click();
  await page.waitForFunction(
    () => document.querySelector('[data-form-state]')?.getAttribute('data-form-state') === 'error',
  );
  await capture(
    page,
    `contact-${width}-form-mocked-failure.png`,
    {
      viewport,
      kind: 'intercepted-test-only',
      state: 'provider-rejected-fixture',
      liveDeliveryVerified: false,
    },
    section,
  );
  assert.equal(submissions.length, 2);
  evidence.mockedSubmissions.push({ width, submissions, realProviderOrInboxVerified: false });
  await context.close();
}

if (!beforeOnly) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  evidence.browsers.animation = browser.version();
  try {
    const html = await readFile('dist/contact/index.html');
    evidence.productionHTMLSHA256 = hash(html);
    assert(html.includes('data-first-thought'), 'Build must include the new Contact composition.');
    const served = await fetch(`${baseURL}/contact`);
    assert.equal(served.status, 200);
    assert.equal(
      hash(new Uint8Array(await served.arrayBuffer())),
      hash(html),
      'The preview must serve this exact production build.',
    );
    const builtAt = (await stat('dist/contact/index.html')).mtimeMs;
    for (const file of Object.keys(sourceFiles)) {
      if (file === 'scripts/capture-contact-signature.mjs') continue;
      assert(
        (await stat(file)).mtimeMs <= builtAt,
        `Rebuild after the final application change: ${file}`,
      );
    }
    for (const width of recordWidths) await captureAnimation(browser, width);
  } finally {
    await browser.close();
    await save();
  }
}
const staticBrowser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--disable-gpu'],
});
evidence.browsers.staticEvidence = staticBrowser.version();
try {
  for (const width of layoutWidths) {
    const viewport = viewportFor(width);
    if (!beforeOnly) {
      const context = await staticBrowser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      observe(page, `reduced-${width}`);
      await staticPage(page, `${baseURL}/contact`);
      await capture(page, `contact-after-${width}.png`, {
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: true,
        fullPage: true,
        kind: 'actual-static-layout',
      });
      await capture(page, `contact-after-${width}-intro.png`, {
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: true,
        fullPage: false,
        kind: 'actual-static-layout',
      });
      await context.close();
    }
    if (beforeURL) {
      const context = await staticBrowser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      observe(page, `before-${width}`);
      await staticPage(page, `${beforeURL}/contact`);
      assert.equal(
        await page.locator('[data-first-thought]').count(),
        0,
        'Before evidence must use the preserved parent.',
      );
      await capture(page, `contact-before-${width}.png`, {
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: true,
        fullPage: true,
        kind: 'preserved-parent-layout',
        sourceCommit: baselineCommit,
      });
      await capture(page, `contact-before-${width}-intro.png`, {
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: true,
        fullPage: false,
        kind: 'preserved-parent-layout',
        sourceCommit: baselineCommit,
      });
      await context.close();
    }
  }
  if (!beforeOnly) {
    for (const width of [390, 1440]) {
      const viewport = viewportFor(width);
      const context = await staticBrowser.newContext({
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: false,
      });
      const page = await context.newPage();
      await staticPage(page, `${baseURL}/contact`);
      await capture(page, `contact-${width}-no-javascript.png`, {
        viewport,
        reducedMotion: 'reduce',
        javaScriptEnabled: false,
        fullPage: true,
        kind: 'actual-no-javascript-fallback',
      });
      await context.close();
      await mockedFormEvidence(staticBrowser, width);
    }
  }
  assert.equal(evidence.errors.length, 0, 'Capture encountered JavaScript errors.');
  assert.equal(
    evidence.failedRequests.filter((request) => !request.deliberateCancellation).length,
    0,
  );
  for (const [file, digest] of Object.entries(sourceFiles))
    assert.equal(
      hash(await readFile(path.join(root, file))),
      digest,
      `Source changed during capture: ${file}`,
    );
} finally {
  await staticBrowser.close();
  await save();
}
console.log(
  `Captured ${evidence.recordings.length} real recordings and ${evidence.screenshots.length} screenshots.`,
);
