import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, scrollY, innerWidth, getComputedStyle */
const baseURL = process.env.REVIEW_URL ?? 'http://127.0.0.1:4406';
const output = path.resolve('artifacts/services-overview');
const native = '/workspace/services-overview-review/native';
const screenshotsOnly = process.argv.includes('--screenshots-only');
const previous = screenshotsOnly
  ? JSON.parse(await readFile(path.join(output, 'capture-evidence.json'), 'utf8'))
  : undefined;
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
  sourceFiles: Object.fromEntries(
    await Promise.all(
      [
        'src/components/services/ServicesOverview.astro',
        'src/components/services/overview-art/IdentityArtwork.astro',
        'src/components/services/overview-art/DigitalArtwork.astro',
        'src/components/services/overview-art/CampaignArtwork.astro',
        'src/components/services/overview-art/StorytellingArtwork.astro',
        'src/components/services/overview-art/DirectionArtwork.astro',
        'src/styles/services-overview.css',
        'src/scripts/services-overview.ts',
        'src/pages/services.astro',
      ].map(async (file) => [file, hash(await readFile(file))]),
    ),
  ),
  method:
    'Real production Chromium screenshots and native Playwright recordings at original speed, with ordinary browser scrolling, reverse scrolling and actual service-link navigation. No timeline seeking or replacement styles. Software rendering only; no physical-device or Safari claim.',
  screenshots: [],
  recordings: previous?.recordings ?? [],
  recordingsCapturedAt: previous?.recordingsCapturedAt ?? previous?.capturedAt,
  errors: [],
  failedRequests: [],
};
await mkdir(output, { recursive: true });
await mkdir(native, { recursive: true });
const save = () =>
  writeFile(path.join(output, 'capture-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
async function shot(page, filename, target, description) {
  assert(
    (await page.evaluate(() => document.documentElement.scrollWidth)) <= page.viewportSize().width,
  );
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
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }),
  );
}
async function scrollChapter(page, slug) {
  const target = page.locator(`[data-service-chapter][id="${slug}"]`);
  await target.evaluate((node) => {
    const header = document.querySelector('[data-site-header]');
    const inset = header ? header.getBoundingClientRect().height + 16 : 100;
    window.scrollTo({
      top: node.getBoundingClientRect().top + scrollY - inset,
      behavior: 'smooth',
    });
  });
  await page.waitForTimeout(1500);
  return target.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const art = node.querySelector('[data-service-chapter-art]');
    return {
      id: node.id,
      scrollY,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      overflow: document.documentElement.scrollWidth > innerWidth,
      artOpacity: art ? Number(getComputedStyle(art).opacity) : null,
    };
  });
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  for (const width of screenshotsOnly ? [] : [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewport(width),
      recordVideo: { dir: native, size: viewport(width) },
    });
    const page = await context.newPage();
    watch(page);
    const video = page.video();
    const visits = [];
    const scrolls = [];
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);
    for (const slug of slugs) {
      scrolls.push({ direction: 'forward', ...(await scrollChapter(page, slug)) });
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
    for (const slug of [...slugs].reverse())
      scrolls.push({ direction: 'reverse', ...(await scrollChapter(page, slug)) });
    for (const slug of slugs) {
      await scrollChapter(page, slug);
      await page.locator(`[data-service-chapter][id="${slug}"] a`).click();
      await page.waitForURL(`**/services/${slug}`);
      assert.equal(await page.locator('h1').count(), 1);
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
        '-threads',
        '2',
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
      scrolls,
      streams: meta.streams.map(({ codec_type, codec_name, width, height, r_frame_rate }) => ({
        type: codec_type,
        codec: codec_name,
        width,
        height,
        frameRate: r_frame_rate,
      })),
      sha256: hash(await readFile(path.join(output, file))),
    });
    await save();
  }
  for (const width of [320, 390, 768, 1440]) {
    // Fit each complete chapter in the actual viewport before capturing it.
    // Chromium can cull SVG compositing below the visible viewport when a
    // locator capture temporarily expands beyond it. Widths stay authoritative;
    // videos and responsive tests retain the ordinary 844/900px heights.
    const context = await browser.newContext({ baseURL, viewport: { width, height: 1100 } });
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
