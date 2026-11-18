import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, innerHeight, performance, scrollY */
// Actual browser evidence: native wheel input, ordinary links and live media clocks.
const argument = (flag, fallback) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', 'http://127.0.0.1:4460');
const output = path.resolve(argument('--out', 'artifacts/motion-completion'));
const native = path.resolve(argument('--native-dir', '/workspace/motion-completion-review/native'));
const widths = argument('--widths', '1440,390').split(',').map(Number);
const slugs = ['triarch', 'by-tech-group', 'u-wanna-smoothie'];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const sourceFiles = {};
for (const file of [
  'scripts/capture-motion-completion.mjs',
  'scripts/portfolio/quality/render.mjs',
  'scripts/portfolio/quality/shared.mjs',
  'scripts/portfolio/quality/triarch.mjs',
  'scripts/portfolio/quality/by-tech.mjs',
  'scripts/portfolio/quality/smoothie.mjs',
  'src/components/MediaSlot.astro',
  'src/scripts/portfolio-motion.ts',
  'src/styles/case-premium.css',
  'src/scripts/case-premium-motion.ts',
  ...slugs.map((slug) => `src/content/projects/${slug}.json`),
  ...slugs.map((slug) => `design-assets/portfolio-motion/quality/${slug}-manifest.json`),
]) {
  const bytes = await readFile(file);
  sourceFiles[file] = hash(bytes);
  const committed = execFileSync('git', ['show', `HEAD:${file}`]);
  assert.equal(
    hash(committed),
    sourceFiles[file],
    `Commit the final, formatted ${file} before capturing review evidence.`,
  );
}
const exports = {};
for (const slug of slugs) {
  const manifest = JSON.parse(
    await readFile(`design-assets/portfolio-motion/quality/${slug}-manifest.json`, 'utf8'),
  );
  exports[slug] = {};
  for (const [format, entry] of Object.entries(manifest.exports)) {
    assert.equal(entry.durationSeconds, 7.5, 'Capture timing must match the actual loop duration.');
    const served = await readFile(`dist/media/portfolio/${entry.file}`);
    assert.equal(
      hash(served),
      entry.sha256,
      `Build must include the final ${slug}/${format} export before capture.`,
    );
    exports[slug][format] = {
      file: entry.file,
      sha256: entry.sha256,
      width: entry.width,
      height: entry.height,
      duration: entry.durationSeconds,
    };
  }
}
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceFiles,
  exports,
  baseURL,
  method:
    'Actual production Chromium viewport recordings. Native wheel input and real Work/case links reach the three completion projects; each visible case video decodes for more than one complete 7.5-second cycle without seeking. Screenshots sample its natural construction phase. Keyboard Enter operates the real pause/play controls, followed by native backscroll. H.264 transcodes preserve the browser recording timing. Mobile means Chromium touch/viewport emulation, not a physical device.',
  browser: '',
  recordings: [],
  screenshots: [],
  measurements: [],
  errors: [],
  failedRequests: [],
};
const save = () =>
  writeFile(path.join(output, 'completion-capture.json'), `${JSON.stringify(evidence, null, 2)}\n`);
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
    if (Math.abs(current - target) <= 4) return;
    await page.mouse.wheel(
      0,
      Math.sign(target - current) * Math.min(420, Math.abs(target - current)),
    );
    await page.waitForTimeout(40);
  }
  assert.fail(`Native wheel did not reach ${target}`);
}
async function align(page, locator, inset = 120) {
  const target = await locator.evaluate(
    (node, offset) => node.getBoundingClientRect().top + scrollY - offset,
    inset,
  );
  await wheelTo(page, target);
  await page.waitForTimeout(180);
}
async function state(video) {
  return video.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return {
      at: performance.now(),
      time: node.currentTime,
      duration: node.duration,
      width: node.videoWidth,
      height: node.videoHeight,
      source: node.currentSrc,
      poster: node.poster,
      paused: node.paused,
      state: node.dataset.motionState,
      visibleRatio:
        Math.max(0, Math.min(innerHeight, box.bottom) - Math.max(0, box.top)) / box.height,
      decoders: document.querySelectorAll('[data-portfolio-video][src]').length,
    };
  });
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
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
    const recording = page.video();
    assert(recording);
    page.on('pageerror', (error) => evidence.errors.push({ width, message: error.message }));
    page.on('requestfailed', (request) =>
      evidence.failedRequests.push({
        width,
        url: request.url(),
        error: request.failure()?.errorText,
        deliberateCancellation: request.failure()?.errorText === 'net::ERR_ABORTED',
      }),
    );
    await page.goto('/work');
    await page.evaluate(() => document.fonts.ready);
    for (const slug of slugs) {
      const link = page
        .locator(`[data-work-card][data-project-slug="${slug}"] a[href="/work/${slug}"]`)
        .first();
      await align(page, link, 140);
      await link.click();
      await page.waitForURL(`**/work/${slug}`);
      await page.waitForSelector('[data-premium-case]');
      await page.evaluate(() => document.fonts.ready);
      const video = page.locator(`#case-motion-${slug}`);
      const target = await video.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return scrollY + box.top - Math.max(120, (innerHeight - box.height) / 2);
      });
      await wheelTo(page, target);
      await page.waitForFunction(
        (id) => document.getElementById(id)?.dataset.motionState === 'playing',
        `case-motion-${slug}`,
      );
      const samples = [];
      let screenshot = false;
      const began = Date.now();
      while (Date.now() - began < 8_200) {
        const sample = await state(video);
        samples.push(sample);
        if (!screenshot && sample.time >= 1.9 && sample.time < 3.2) {
          const file = `completion-${width}-${slug}-construction.png`;
          const bytes = await page.screenshot({
            path: path.join(output, file),
            animations: 'allow',
          });
          evidence.screenshots.push({
            file,
            viewport,
            slug,
            sampledVideoTime: sample.time,
            bytes: bytes.length,
            sha256: hash(bytes),
          });
          screenshot = true;
        }
        await page.waitForTimeout(250);
      }
      assert(screenshot, `A naturally occurring ${slug} construction phase must be captured.`);
      assert(
        samples.every(
          (sample) => sample.state === 'playing' && !sample.paused && sample.visibleRatio >= 0.35,
        ),
      );
      assert(
        new Set(samples.map((sample) => sample.time)).size >= 20,
        'The real media clock must advance.',
      );
      assert.equal(
        new Set(samples.map((sample) => sample.source)).size,
        1,
        'No source switching during the full cycle.',
      );
      const advancedSeconds = samples.slice(1).reduce((elapsed, sample, index) => {
        const delta = sample.time - samples[index].time;
        return elapsed + (delta < -0.5 ? delta + sample.duration : Math.max(0, delta));
      }, 0);
      assert(advancedSeconds >= 7.5, 'The visible media clock must complete a whole real cycle.');
      assert(samples.every((sample) => sample.decoders <= (width < 768 ? 1 : 2)));
      evidence.measurements.push({
        width,
        slug,
        kind: 'complete-visible-native-playback',
        elapsedMs: Date.now() - began,
        advancedMediaSeconds: advancedSeconds,
        samples,
      });
      // Keyboard focus plus Enter operates the same real button without injected clicks.
      const toggle = page.locator(`[data-motion-toggle="case-motion-${slug}"]`);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        (id) =>
          document.querySelector(`[data-motion-toggle="${id}"]`)?.getAttribute('aria-pressed') ===
          'true',
        `case-motion-${slug}`,
      );
      evidence.measurements.push({
        width,
        slug,
        kind: 'keyboard-user-pause',
        video: await state(video),
      });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      // Return with native backscroll and the actual all-work link.
      await wheelTo(page, 0);
      await page.locator('[data-premium-case] a[href="/work"]').first().click();
      await page.waitForURL('**/work');
      await page.waitForTimeout(180);
      await save();
    }
    await context.close();
    const file = `completion-${width}-browser.mp4`;
    const nativeFile = await recording.path();
    const nativeProbe = JSON.parse(
      execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', nativeFile], {
        encoding: 'utf8',
      }),
    );
    execFileSync('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      nativeFile,
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
      path.join(output, file),
    ]);
    const probe = JSON.parse(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path.join(output, file)],
        { encoding: 'utf8' },
      ),
    );
    execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(output, file), '-f', 'null', '-']);
    const bytes = await readFile(path.join(output, file));
    evidence.recordings.push({
      file,
      viewport,
      durationSeconds: Number(probe.format.duration),
      bytes: bytes.length,
      sha256: hash(bytes),
      decodedAllFrames: true,
      nativeStreams: nativeProbe.streams.map((stream) => ({
        codec: stream.codec_name,
        colorSpace: stream.color_space,
        colorRange: stream.color_range,
        colorTransfer: stream.color_transfer,
        colorPrimaries: stream.color_primaries,
      })),
      streams: probe.streams.map(
        ({
          codec_name,
          width,
          height,
          color_space,
          color_range,
          color_transfer,
          color_primaries,
        }) => ({
          codec: codec_name,
          width,
          height,
          colorSpace: color_space,
          colorRange: color_range,
          colorTransfer: color_transfer,
          colorPrimaries: color_primaries,
        }),
      ),
    });
    await save();
  }
  assert.equal(
    evidence.failedRequests.filter((request) => !request.deliberateCancellation).length,
    0,
    'The real browsing journey must have no unexpected failed network requests.',
  );
  for (const [file, capturedHash] of Object.entries(sourceFiles))
    assert.equal(
      hash(await readFile(file)),
      capturedHash,
      `Source changed during capture: ${file}`,
    );
  assert.equal(
    evidence.errors.length,
    0,
    'The real browsing journey must have no JavaScript errors.',
  );
} finally {
  await browser.close();
  await save();
}
