import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window, innerWidth, performance */
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', process.env.PORTFOLIO_BASE_URL ?? 'http://127.0.0.1:4363');
const output = path.resolve(argument('--out', 'artifacts/portfolio-rhythm'));
const nativeDirectory = path.resolve(
  argument('--native-out', '/tmp/drawnout-portfolio-rhythm-native-recordings'),
);
const ffmpeg = process.env.FFMPEG_PATH ?? '/usr/bin/ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? '/usr/bin/ffprobe';
const evidence = {
  capturedAt: new Date().toISOString(),
  baseURL,
  method:
    'Unedited production-browser screenshots and native Playwright video recordings, transcoded to silent H.264 MP4 and GIF. No hover, video seeking, injected animation state or CSS replacement. Reduced-motion full-page views are explicitly separate static layout evidence. Chromium uses SwiftShader software WebGL; this is not a physical-device or hardware GPU performance benchmark.',
  browser: '',
  screenshots: [],
  playback: [],
  recordings: [],
  errors: [],
};
await mkdir(output, { recursive: true });
await mkdir(nativeDirectory, { recursive: true });
const save = () =>
  writeFile(path.join(output, 'website-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
const viewportFor = (width) => ({ width, height: width === 390 ? 844 : 900 });

async function screenshot(page, filename, details, fullPage = false) {
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({ path: path.join(output, filename), fullPage });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, filename + ' must fit the viewport');
  evidence.screenshots.push({
    filename,
    ...details,
    viewport: page.viewportSize(),
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    horizontalOverflow: overflow,
  });
  await save();
}

async function videoState(video) {
  return video.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const visibleHeight = Math.max(
      0,
      Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0),
    );
    const visibleWidth = Math.max(
      0,
      Math.min(box.right, window.innerWidth) - Math.max(box.left, 0),
    );
    return {
      currentTime: element.currentTime,
      paused: element.paused,
      muted: element.muted,
      loop: element.loop,
      playsInline: element.playsInline,
      readyState: element.readyState,
      source: element.currentSrc,
      state: element.dataset.motionState,
      intersectionRatio: (visibleHeight * visibleWidth) / (box.width * box.height),
      mediaBox: { width: box.width, height: box.height },
      activeSources: document.querySelectorAll('[data-portfolio-video][src]').length,
      playingVideos: [...document.querySelectorAll('[data-portfolio-video]')].filter(
        (item) => !item.paused,
      ).length,
      introState: document.documentElement.dataset.signatureIntro,
      navigationMs: performance.now(),
    };
  });
}

function transcode(nativeFile, stem) {
  const mp4 = path.join(output, stem + '.mp4');
  const gif = path.join(output, stem + '.gif');
  execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    nativeFile,
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
    mp4,
  ]);
  execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    nativeFile,
    '-filter_complex',
    'fps=6,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer',
    '-threads',
    '2',
    '-loop',
    '0',
    gif,
  ]);
  const metadata = JSON.parse(
    execFileSync(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', mp4], {
      encoding: 'utf8',
    }),
  );
  assert.equal(metadata.streams.filter((stream) => stream.codec_type === 'audio').length, 0);
  return {
    mp4: path.basename(mp4),
    gif: path.basename(gif),
    nativeFile,
    durationSeconds: Number(metadata.format.duration),
    bytes: Number(metadata.format.size),
    video: metadata.streams
      .filter((stream) => stream.codec_type === 'video')
      .map(({ codec_name, width, height, r_frame_rate }) => ({
        codec: codec_name,
        width,
        height,
        frameRate: r_frame_rate,
      })),
  };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
evidence.browser = browser.version();
try {
  for (const width of [390, 768, 1440]) {
    for (const [name, route] of [
      ['home', '/'],
      ['work', '/work'],
    ]) {
      const viewport = viewportFor(width);
      const record = width !== 768;
      const context = await browser.newContext({
        baseURL,
        viewport,
        deviceScaleFactor: 1,
        isMobile: width === 390,
        hasTouch: width === 390,
        reducedMotion: 'no-preference',
        ...(record ? { recordVideo: { dir: nativeDirectory, size: viewport } } : {}),
      });
      const page = await context.newPage();
      page.on('pageerror', (error) =>
        evidence.errors.push({ route, width, message: error.message }),
      );
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      await page.waitForFunction(
        () =>
          !['pending', 'playing'].includes(document.documentElement.dataset.signatureIntro ?? ''),
      );
      assert.equal(await page.locator('[data-portfolio-video]').count(), 6);
      if (route === '/') {
        assert.equal(await page.locator('[data-portfolio-video][src]').count(), 0);
      }
      await screenshot(page, name + '-' + width + '-top.png', {
        route,
        mode: 'normal-motion',
        position: 'top',
      });
      const cards = await page.locator('[data-portfolio-card]').all();
      for (const card of cards) {
        const slug = await card.getAttribute('data-project-slug');
        const presentation = await card.getAttribute('data-project-presentation');
        assert.ok(['animated', 'static'].includes(presentation));
        const video = card.locator('[data-portfolio-video]');
        const target = (await video.count()) ? video : card.locator('[data-media-slot]');
        await target.evaluate((element) => {
          const box = element.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + box.top - (window.innerHeight - box.height) / 2,
            behavior: 'instant',
          });
        });
        let before = null;
        let after = null;
        let crop = null;
        if (presentation === 'animated') {
          await page.waitForFunction(
            (id) => document.getElementById(id)?.dataset.motionState === 'playing',
            await video.getAttribute('id'),
          );
          before = await videoState(video);
          assert.equal(before.paused, false);
          assert.equal(before.muted && before.loop && before.playsInline, true);
          assert.ok(before.intersectionRatio >= 0.35);
          assert.ok(before.activeSources <= (width === 390 ? 1 : 2));
          assert.ok(before.playingVideos <= (width === 390 ? 1 : 2));
          crop = before.mediaBox.width / before.mediaBox.height < 1.1 ? 'portrait' : 'landscape';
          assert.ok(before.source.endsWith('-' + crop + '.mp4'));
          // Selected footage runs naturally for a complete loop in recordings.
          await page.waitForTimeout(record ? 6250 : 400);
          after = await videoState(video);
          assert.notEqual(
            after.currentTime,
            before.currentTime,
            name + ' ' + slug + ' must advance',
          );
          assert.equal(after.paused, false);
        } else {
          // Static selections keep their approved poster even when a motion asset exists.
          await page.waitForTimeout(record ? 1400 : 400);
          if (await video.count()) {
            before = await videoState(video);
            assert.equal(await video.getAttribute('src'), null);
            assert.equal(before.paused, true);
            assert.equal(before.state, 'poster');
          }
          assert.equal(await card.locator('[data-motion-toggle]:visible').count(), 0);
          assert.ok(await card.locator('picture img').getAttribute('alt'));
        }
        const caption = card.locator('[data-portfolio-caption]');
        await caption.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          (slug) =>
            document.querySelector(
              '[data-portfolio-card][data-project-slug="' + slug + '"] [data-portfolio-caption]',
            )?.dataset.portfolioReveal === 'complete',
          slug,
        );
        evidence.playback.push({
          route,
          width,
          slug,
          presentation,
          crop,
          before,
          after,
          titleReveal: await caption.getAttribute('data-portfolio-reveal'),
        });
        await screenshot(page, name + '-' + width + '-' + slug + '.png', {
          route,
          mode: 'normal-motion',
          slug,
          presentation,
        });
        await save();
      }
      await page.locator('main h1').scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (id) => !document.getElementById(id).hasAttribute('src'),
        name + '-motion-u-wanna-smoothie',
      );
      const native = page.video();
      await context.close();
      if (record) {
        const nativeFile = await native.path();
        evidence.recordings.push({
          route,
          viewport,
          reducedMotion: false,
          method:
            'Continuous native Playwright browser video; MP4/GIF conversion changes encoding only.',
          ...transcode(nativeFile, name + '-' + width + '-rhythm'),
        });
        await save();
      }
      console.log('Captured normal ' + name + ' at ' + width);
    }
  }

  for (const width of [390, 768, 1440]) {
    for (const [name, route] of [
      ['home', '/'],
      ['work', '/work'],
    ]) {
      const context = await browser.newContext({
        baseURL,
        viewport: viewportFor(width),
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.goto(route, { waitUntil: 'networkidle' });
      for (const image of await page.locator('main img, [data-site-footer] img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal(await page.locator('[data-portfolio-video][src]').count(), 0);
      await screenshot(
        page,
        name + '-' + width + '-reduced-motion.png',
        { route, mode: 'reduced-motion-static-layout' },
        true,
      );
      await context.close();
    }
  }
  assert.equal(evidence.errors.length, 0, 'Normal motion pages must not throw browser errors');
  const html =
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio motion — live website evidence</title><style>body{font:16px/1.6 system-ui;background:#f8f6ef;color:#24221f;margin:0;padding:clamp(20px,5vw,70px)}main{max-width:1280px;margin:auto}h1{font-size:clamp(32px,5vw,64px);line-height:1.1}h2{margin-top:60px}a{color:#68523d}video{width:100%;background:#e9e4d8;max-height:680px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:28px}article{min-width:0}img{width:100%;height:250px;object-fit:cover;object-position:top;border:1px solid #d4ccbc}p{max-width:850px}.meta{font-size:13px;color:#665f53}code{overflow-wrap:anywhere}</style><main><h1>Portfolio motion in the live website</h1><p>Curated animated projects alternate with descriptive static posters in the preserved project order, with SOL retained as an animated anchor. All six motion assets remain available. These continuous browser recordings show the real Home and Work pages at 390px and 1440px, including the one-time title reveals. Selected footage plays naturally for at least 6.25 seconds; static projects remain on their posters. The 768px views and reduced-motion layouts are below.</p><p class="meta">Captured ' +
    evidence.capturedAt +
    ' from a local production build. Chromium ' +
    evidence.browser +
    ' with SwiftShader software WebGL. This is browser behavior evidence, not a physical-device performance benchmark. MP4/GIF are transcodes of native Playwright recordings; no animation was sought or composited.</p><p><a href="../portfolio-motion/assets-gallery.html">Six individual project exports and source-artwork keyframes</a> · <a href="website-evidence.json">Browser playback measurements</a> · <a href="browser-tests.json">Browser test report</a></p><h2>Live portfolio rhythm recordings</h2><section>' +
    evidence.recordings
      .map(
        (recording) =>
          '<article><h3>' +
          (recording.route === '/' ? 'Home' : 'Work') +
          ' · ' +
          recording.viewport.width +
          'px</h3><video controls muted playsinline preload="metadata" src="' +
          recording.mp4 +
          '"></video><p><a href="' +
          recording.mp4 +
          '">MP4</a> · <a href="' +
          recording.gif +
          '">GIF</a> · ' +
          recording.durationSeconds.toFixed(1) +
          ' seconds</p></article>',
      )
      .join('') +
    '</section><h2>Normal-motion browser views</h2><section>' +
    evidence.screenshots
      .filter((item) => item.mode === 'normal-motion')
      .map(
        (item) =>
          '<article><a href="' +
          item.filename +
          '"><img loading="lazy" src="' +
          item.filename +
          '" alt="' +
          (item.route === '/' ? 'Home' : 'Work') +
          ' at ' +
          item.viewport.width +
          'px, ' +
          (item.slug ?? 'page top') +
          '"></a><p class="meta">' +
          (item.route === '/' ? 'Home' : 'Work') +
          ' · ' +
          item.viewport.width +
          'px · ' +
          (item.slug ?? 'page top') +
          '</p></article>',
      )
      .join('') +
    '</section><h2>Reduced-motion static layouts</h2><p>These full-page images deliberately use the real reduced-motion preference. Videos remain unloaded and descriptive posters stay visible.</p><section>' +
    evidence.screenshots
      .filter((item) => item.mode === 'reduced-motion-static-layout')
      .map(
        (item) =>
          '<article><a href="' +
          item.filename +
          '"><img loading="lazy" src="' +
          item.filename +
          '" alt="Static reduced-motion ' +
          (item.route === '/' ? 'Home' : 'Work') +
          ' at ' +
          item.viewport.width +
          'px"></a><p class="meta">' +
          (item.route === '/' ? 'Home' : 'Work') +
          ' · ' +
          item.viewport.width +
          'px · reduced motion</p></article>',
      )
      .join('') +
    '</section></main></html>';
  await writeFile(path.join(output, 'index.html'), html);
  await save();
  console.log('Portfolio website evidence ready: ' + path.join(output, 'index.html'));
} finally {
  await browser.close();
  await save();
}
