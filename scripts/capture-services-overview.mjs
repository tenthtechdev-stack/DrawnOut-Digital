import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, scrollY */
const baseURL = process.env.REVIEW_URL ?? 'http://127.0.0.1:4406';
const output = path.resolve('artifacts/services-overview');
const native = '/workspace/services-overview-review/native';
const slugs = [
  'brand-identity',
  'digital-design',
  'marketing-campaigns',
  'words-storytelling',
  'creative-direction',
];
const viewport = (width) => ({ width, height: width < 768 ? 844 : 900 });
const hash = (data) => createHash('sha256').update(data).digest('hex');
const evidence = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  method:
    'Real production Chromium screenshots and native Playwright recordings at original speed, with ordinary browser scrolling, reverse scrolling and actual service-link navigation. No timeline seeking or replacement styles. Software rendering only; no physical-device or Safari claim.',
  screenshots: [],
  recordings: [],
  errors: [],
};
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const save = () =>
  writeFile(path.join(output, 'capture-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
async function shot(page, filename, target, description) {
  const bytes = target
    ? await page
        .locator(target)
        .screenshot({ path: path.join(output, filename), animations: 'allow' })
    : await page.screenshot({ path: path.join(output, filename), animations: 'allow' });
  evidence.screenshots.push({
    filename,
    description,
    viewport: page.viewportSize(),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
    sha256: hash(bytes),
  });
  await save();
}
function watch(page) {
  page.on('pageerror', (error) => evidence.errors.push(error.message));
}
async function scrollChapter(page, slug) {
  const target = page.locator(`[data-service-chapter][id="${slug}"]`);
  await target.evaluate((node) =>
    window.scrollTo({ top: node.getBoundingClientRect().top + scrollY - 84, behavior: 'smooth' }),
  );
  await page.waitForTimeout(1500);
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewport(width),
      recordVideo: { dir: native, size: viewport(width) },
    });
    const page = await context.newPage();
    watch(page);
    const video = page.video();
    const visits = [];
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);
    for (const slug of slugs) {
      await scrollChapter(page, slug);
      if (width < 768) {
        await page
          .locator(`[data-service-chapter][id="${slug}"] [data-service-chapter-art]`)
          .evaluate((node) =>
            window.scrollTo({
              top: node.getBoundingClientRect().top + scrollY - 100,
              behavior: 'smooth',
            }),
          );
        await page.waitForTimeout(1300);
      }
    }
    for (const slug of [...slugs].reverse()) await scrollChapter(page, slug);
    for (const slug of slugs) {
      await scrollChapter(page, slug);
      await page.locator(`[data-service-chapter][id="${slug}"] a`).click();
      await page.waitForURL(`**/services/${slug}`);
      assert.equal(await page.locator('[data-service-faq] details').count(), 5);
      await page.waitForTimeout(1000);
      visits.push({ slug, title: await page.locator('h1').innerText(), url: page.url(), faqs: 5 });
      await page.goBack();
    }
    await context.close();
    const source = await video.path();
    const file = `services-${width}-scroll-and-links.mp4`;
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        source,
        '-an',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '24',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        path.join(output, file),
      ],
      { stdio: 'ignore' },
    );
    const meta = JSON.parse(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path.join(output, file)],
        { encoding: 'utf8' },
      ),
    );
    evidence.recordings.push({
      file,
      nativeFile: source,
      durationSeconds: Number(meta.format.duration),
      bytes: Number(meta.format.size),
      viewport: viewport(width),
      visits,
      sha256: hash(await readFile(path.join(output, file))),
    });
    await save();
  }
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ baseURL, viewport: viewport(width) });
    const page = await context.newPage();
    watch(page);
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    for (const slug of slugs) {
      await scrollChapter(page, slug);
      await shot(
        page,
        `${slug}-${width}.png`,
        `[data-service-chapter][id="${slug}"]`,
        `Complete ${slug} editorial chapter at ${width}px.`,
      );
    }
    assert((await page.evaluate(() => document.documentElement.scrollWidth)) <= width);
    await context.close();
  }
  for (const width of [390, 1440])
    for (const mode of ['reduced-motion', 'no-js']) {
      const context = await browser.newContext({
        baseURL,
        viewport: viewport(width),
        reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
        javaScriptEnabled: mode !== 'no-js',
      });
      const page = await context.newPage();
      watch(page);
      await page.goto('/services');
      await page.evaluate(() => document.fonts.ready);
      await shot(
        page,
        `overview-${width}-${mode}.png`,
        '[data-services-overview]',
        `All five chapters with ${mode} at ${width}px.`,
      );
      await context.close();
    }
} finally {
  await browser.close();
  await save();
}
assert.deepEqual(evidence.errors, []);
let gallery =
  '# Services Stage 2 — five editorial chapters\n\nOriginal service illustrations and native scrolling beneath the approved cinematic hero. Each study demonstrates a discipline; it does not claim client work or historical process.\n\n[Validation and scope](../../docs/services-overview/VALIDATION.md) · [Capture measurements](capture-evidence.json)\n\n## Real scrolling, reverse and service navigation\n\n';
for (const clip of evidence.recordings)
  gallery += `- [${clip.viewport.width}px recording — ${clip.durationSeconds.toFixed(2)} seconds](${clip.file})\n`;
for (const slug of slugs) {
  gallery += `\n## ${slug.replaceAll('-', ' ')}\n\n`;
  for (const width of [1440, 390])
    gallery += `### ${width}px\n\n![${slug} at ${width}px](${slug}-${width}.png)\n\n`;
  gallery += `[Tablet 768px](${slug}-768.png) · [Small mobile 320px](${slug}-320.png)\n`;
}
gallery += '\n## Accessible static views\n\n';
for (const width of [390, 1440])
  for (const mode of ['reduced-motion', 'no-js'])
    gallery += `- [${width}px ${mode} — all five chapters](overview-${width}-${mode}.png)\n`;
await writeFile(path.join(output, 'README.md'), gallery);
console.log(
  JSON.stringify({
    screenshots: evidence.screenshots.length,
    recordings: evidence.recordings.length,
    errors: evidence.errors,
  }),
);
