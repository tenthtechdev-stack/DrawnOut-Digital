import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const preference = (page: Page) => page.locator('[data-portfolio-motion-preference]');
const oldControls = '[data-motion-toggle], .portfolio-motion-controls, .portfolio-motion-toggle';

async function center(video: Locator) {
  await video.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    scrollTo({
      top: scrollY + bounds.top - (innerHeight - bounds.height) / 2,
      behavior: 'instant',
    });
  });
}

async function decoded(video: Locator) {
  await center(video);
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  await expect(video).toHaveAttribute('data-motion-frame', 'presented');
  const before = await video.evaluate((node: HTMLVideoElement) => ({
    time: node.currentTime,
    source: node.currentSrc,
    frames: node.getVideoPlaybackQuality().totalVideoFrames,
  }));
  await expect
    .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
    .not.toBe(before.time);
  await expect
    .poll(() => video.evaluate((node) => Number(getComputedStyle(node).opacity)))
    .toBeGreaterThan(0.95);
  return before;
}

async function probe(video: Locator) {
  await video.evaluate((node: HTMLVideoElement) => {
    const observations = { loads: 0, plays: 0, sourceMutations: 0, seeking: 0, emptied: 0 };
    const load = node.load.bind(node);
    const play = node.play.bind(node);
    node.load = () => {
      observations.loads += 1;
      load();
    };
    node.play = () => {
      observations.plays += 1;
      return play();
    };
    new MutationObserver((records) => {
      observations.sourceMutations += records.length;
    }).observe(node, { attributes: true, attributeFilter: ['src'] });
    node.addEventListener('seeking', () => {
      observations.seeking += 1;
    });
    node.addEventListener('emptied', () => {
      observations.emptied += 1;
    });
    Object.assign(node, { motionLifecycleProbe: observations });
  });
}

async function observations(video: Locator) {
  return video.evaluate(
    (node) =>
      (
        node as HTMLVideoElement & {
          motionLifecycleProbe: {
            loads: number;
            plays: number;
            sourceMutations: number;
            seeking: number;
            emptied: number;
          };
        }
      ).motionLifecycleProbe,
  );
}

async function visibleFraction(video: Locator, fraction: number) {
  await video.evaluate((node, ratio) => {
    const bounds = node.getBoundingClientRect();
    scrollTo({ top: scrollY + bounds.bottom - bounds.height * ratio, behavior: 'instant' });
  }, fraction);
}

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`one keyboard-accessible motion preference replaces artwork controls without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto('/work/sol-community-center#main');
    const video = page.locator('[data-portfolio-video]');
    await decoded(video);
    await expect(page.locator(oldControls)).toHaveCount(0);
    await expect(preference(page)).toHaveCount(1);
    await expect(preference(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'on');
    expect(
      await preference(page).evaluate((node) =>
        Boolean(node.closest('a, [data-case-figure], [data-project-card]')),
      ),
    ).toBe(false);
    const before = (await preference(page).boundingBox())!;
    expect(before.height).toBeGreaterThanOrEqual(44);
    expect(before.x).toBeGreaterThanOrEqual(0);
    expect(before.x + before.width).toBeLessThanOrEqual(width);
    await preference(page).focus();
    expect(await preference(page).evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe(
      'none',
    );
    await page.keyboard.press('Enter');
    await expect(preference(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
    await expect(video).not.toHaveAttribute('src', /.+/);
    await expect(video.locator('..').locator('picture img')).toBeVisible();
    await page.keyboard.press('Enter');
    await decoded(video);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const audit = await new AxeBuilder({ page })
      .include('[data-portfolio-motion-preference]')
      .analyze();
    expect(audit.violations).toEqual([]);
  });
}

test('Motion Off persists through project navigation, browser history and a document refresh', async ({
  page,
}) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-sol-community-center');
  await decoded(video);
  await preference(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
  expect(await page.evaluate(() => localStorage.getItem('drawnout:portfolio-motion'))).toBe('off');
  await page
    .locator('[data-project-slug="sol-community-center"] a[href="/work/sol-community-center"]')
    .click();
  await expect(page).toHaveURL('/work/sol-community-center');
  await center(page.locator('[data-portfolio-video]'));
  await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/work#main');
  await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
  await page.reload();
  await center(page.locator('#work-motion-sol-community-center'));
  await expect(preference(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  await preference(page).click();
  await decoded(page.locator('#work-motion-sol-community-center'));
});

for (const mode of ['reduced-motion', 'save-data'] as const) {
  test(`${mode} takes precedence over a stored On choice and leaves static meaningful artwork`, async ({
    page,
  }) => {
    await page.addInitScript((setting) => {
      localStorage.setItem('drawnout:portfolio-motion', 'on');
      if (setting === 'save-data') {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
      }
    }, mode);
    if (mode === 'reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/media/portfolio/')) requests.push(request.url());
    });
    await page.goto('/work/sol-community-center#main');
    await center(page.locator('[data-portfolio-video]'));
    await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
    await expect(preference(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(preference(page)).toHaveAttribute('aria-disabled', 'true');
    await preference(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
    await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    await expect(page.locator('[data-case-hero] picture img')).toBeVisible();
    expect(requests).toEqual([]);
  });
}

test('blocked storage keeps a truthful usable preference in the current document', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage unavailable', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage unavailable', 'SecurityError');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  await decoded(video);
  await preference(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion', 'off');
  await expect(video).not.toHaveAttribute('src', /.+/);
  await preference(page).click();
  await decoded(video);
  expect(errors).toEqual([]);
});

test('visible loops retain their source and presented frame through threshold noise and a short offscreen return', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  await decoded(video);
  await expect(page.locator('[data-case-hero]')).toHaveAttribute(
    'data-case-reveal-state',
    'complete',
  );
  await probe(video);
  const source = await video.getAttribute('src');
  for (const ratio of [0.34, 0.29, 0.36, 0.26, 0.38]) {
    await visibleFraction(video, ratio);
    await page.waitForTimeout(120);
    await expect(video).toHaveAttribute('data-motion-state', 'playing');
    await expect(video).toHaveAttribute('data-motion-frame', 'presented');
    expect(await video.getAttribute('src')).toBe(source);
  }
  await visibleFraction(video, 0);
  await expect(video).toHaveAttribute('data-motion-state', 'paused');
  await center(video);
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  await expect(video).toHaveAttribute('data-motion-frame', 'presented');
  expect(await observations(video)).toEqual({
    loads: 0,
    plays: 1,
    sourceMutations: 0,
    seeking: 0,
    emptied: 0,
  });
});

test('a short background suspension holds the decoded pose and resumes without unloading or seeking', async ({
  page,
}) => {
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  await decoded(video);
  await probe(video);
  // A controlled event exercises the actual handler; physical backgrounding
  // is separately recorded and is not claimed by this deterministic fixture.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(video).toHaveAttribute('data-motion-state', 'paused');
  await expect(video).toHaveAttribute('data-motion-frame', 'presented');
  const held = await video.evaluate((node: HTMLVideoElement) => ({
    time: node.currentTime,
    source: node.currentSrc,
  }));
  await page.waitForTimeout(180);
  expect(await video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBe(held.time);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  await expect
    .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
    .not.toBe(held.time);
  expect(await video.evaluate((node: HTMLVideoElement) => node.currentSrc)).toBe(held.source);
  expect(await observations(video)).toEqual({
    loads: 0,
    plays: 1,
    sourceMutations: 0,
    seeking: 0,
    emptied: 0,
  });
});

for (const [width, dpr] of [
  [390, 3],
  [768, 2],
  [1440, 1],
  [1920, 2],
] as const) {
  test(`native rapid reverse scrolling and filters retain the decoder budget at ${width}px DPR ${dpr}`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: width < 768 ? 844 : 1000 },
      deviceScaleFactor: dpr,
    });
    try {
      const page = await context.newPage();
      await page.goto('/work#main');
      await decoded(page.locator('#work-motion-sol-community-center'));
      const snapshots = [];
      for (const amount of [400, 600, -300, 700, -1100, 450, -450]) {
        await page.mouse.wheel(0, amount);
        await page.waitForTimeout(120);
        const state = await page.locator('[data-portfolio-video]').evaluateAll((nodes) =>
          nodes.map((node) => {
            const video = node as HTMLVideoElement;
            return {
              id: video.id,
              source: video.getAttribute('src'),
              playing: !video.paused,
              ready: video.readyState,
              presented: video.dataset.motionFrame,
              opacity: Number(getComputedStyle(video).opacity),
              time: video.currentTime,
            };
          }),
        );
        snapshots.push(state);
        expect(state.filter((video) => video.source).length).toBeLessThanOrEqual(
          width < 768 ? 1 : 2,
        );
        expect(state.filter((video) => video.playing).length).toBeLessThanOrEqual(
          width < 768 ? 1 : 2,
        );
        for (const video of state.filter((video) => video.opacity > 0.05)) {
          expect(video.ready).toBeGreaterThanOrEqual(2);
          expect(video.presented).toBe('presented');
        }
      }
      await page.locator('[data-filter="packaging"]').click();
      await expect(page.locator('[data-project-slug="sol-community-center"]')).toBeHidden();
      await expect(page.locator('#work-motion-sol-community-center')).not.toHaveAttribute(
        'src',
        /.+/,
      );
      await decoded(page.locator('#work-motion-bunzo'));
      await page.locator('[data-filter="all"]').click();
      await decoded(page.locator('#work-motion-sol-community-center'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await testInfo.attach('actual-decoder-and-visible-frame-samples', {
        body: JSON.stringify({ width, dpr, snapshots }),
        contentType: 'application/json',
      });
    } finally {
      await context.close();
    }
  });
}

test('homepage image and decoded-video expansion use the same actual transform', async ({
  page,
}) => {
  await page.goto('/#main');
  const video = page.locator('#home-motion-sol-community-center');
  await decoded(video);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);
  const transforms = await video.evaluate((node) => ({
    image: getComputedStyle(node.parentElement!.querySelector('picture img')!).transform,
    video: getComputedStyle(node).transform,
  }));
  expect(transforms.video).toBe(transforms.image);
  expect(transforms.video).not.toBe('none');
});

test('orientation changes preserve a valid decoded surface within the coarse-pointer mobile budget', async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  try {
    const page = await context.newPage();
    await page.goto('/work/sol-community-center#main');
    const video = page.locator('[data-portfolio-video]');
    await decoded(video);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const samples = [];
    for (const viewport of [
      { width: 844, height: 390 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await decoded(video);
      const sample = await video.evaluate((node: HTMLVideoElement) => ({
        source: node.currentSrc,
        time: node.currentTime,
        ready: node.readyState,
        opacity: getComputedStyle(node).opacity,
        ratio:
          node.parentElement!.getBoundingClientRect().width /
          node.parentElement!.getBoundingClientRect().height,
      }));
      expect(sample.source).toContain(sample.ratio < 1.1 ? '-portrait.mp4' : '-landscape.mp4');
      expect(sample.ready).toBeGreaterThanOrEqual(2);
      expect(await page.locator('[data-portfolio-video][src]').count()).toBeLessThanOrEqual(1);
      samples.push(sample);
    }
    await testInfo.attach('native-orientation-presented-frames', {
      body: JSON.stringify(samples),
      contentType: 'application/json',
    });
  } finally {
    await context.close();
  }
});

test('no JavaScript keeps links and descriptive posters, with no unusable motion button', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/work/sol-community-center');
    await expect(page.locator(oldControls)).toHaveCount(0);
    await expect(preference(page)).toBeHidden();
    await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    const image = page.locator('[data-case-hero] picture img');
    expect(await image.getAttribute('alt')).toBeTruthy();
    await expect(image).toBeVisible();
    const next = page.locator('[data-case-next]');
    await expect(next).toHaveCount(1);
    const destination = (await next.getAttribute('href'))!;
    await next.click();
    await expect(page).toHaveURL(destination);
    await expect(page.locator('main h1')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('same-DOM restored pages and repeated Astro initialization keep the existing decoder and clock', async ({
  page,
}) => {
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  const initial = await decoded(video);
  await probe(video);
  // This is a deterministic lifecycle-handler fixture, not a claim that the
  // browser admitted a physical bfcache entry (the native-history test is above).
  await page.evaluate(() => {
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect
    .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
    .not.toBe(initial.time);
  await expect(video).toHaveAttribute('data-motion-frame', 'presented');
  expect(await observations(video)).toEqual({
    loads: 0,
    plays: 0,
    sourceMutations: 0,
    seeking: 0,
    emptied: 0,
  });
});

test('long background suspension eventually releases its decoder and recovers a decoded surface', async ({
  page,
}) => {
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  await decoded(video);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(video).toHaveAttribute('data-motion-state', 'paused');
  await expect(video).toHaveAttribute('src', /.+/);
  await expect(video).not.toHaveAttribute('src', /.+/, { timeout: 18_000 });
  await expect(video).toHaveAttribute('data-motion-state', 'poster');
  await expect(video).not.toHaveAttribute('data-motion-frame', 'presented');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await decoded(video);
});

test('an actual native loop advances decoded frames without reloading its source', async ({
  page,
}, testInfo) => {
  await page.goto('/work/sol-community-center#main');
  const video = page.locator('[data-portfolio-video]');
  await decoded(video);
  await probe(video);
  const result = await video.evaluate(async (node: HTMLVideoElement) => {
    const samples: { at: number; time: number; frames: number; ready: number }[] = [];
    const before = node.getVideoPlaybackQuality();
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const sample: VideoFrameRequestCallback = (now, metadata) => {
        samples.push({
          at: now,
          time: metadata.mediaTime,
          frames: metadata.presentedFrames,
          ready: node.readyState,
        });
        if (now - startedAt >= (node.duration + 1.2) * 1000) resolve();
        else node.requestVideoFrameCallback(sample);
      };
      node.requestVideoFrameCallback(sample);
    });
    const after = node.getVideoPlaybackQuality();
    const intervals = samples
      .slice(1)
      .map((sample, index) => sample.at - samples[index]!.at)
      .sort((a, b) => a - b);
    return {
      duration: node.duration,
      source: node.currentSrc,
      sampledSeconds: (samples.at(-1)!.at - samples[0]!.at) / 1000,
      observedLoopWraps: samples
        .slice(1)
        .filter((sample, index) => sample.time < samples[index]!.time).length,
      presentedSamples: samples.length,
      decodedFrameDelta: after.totalVideoFrames - before.totalVideoFrames,
      droppedFrameDelta: after.droppedVideoFrames - before.droppedVideoFrames,
      callbackIntervalMs: {
        median: intervals[Math.floor(intervals.length * 0.5)],
        p95: intervals[Math.floor(intervals.length * 0.95)],
        max: intervals.at(-1),
      },
      allVisibleSamplesDecoded: samples.every((sample) => sample.ready >= 2),
      readinessBoundarySamples: samples.filter(
        (sample, index) =>
          sample.ready < 2 || (index > 0 && sample.time < samples[index - 1]!.time),
      ),
    };
  });
  const lifecycle = await observations(video);
  await testInfo.attach('actual-loop-and-software-browser-frame-observations', {
    body: JSON.stringify({
      ...result,
      lifecycle,
      limitation:
        'Measured Chromium/SwiftShader callback cadence; not physical-device GPU/FPS certification.',
    }),
    contentType: 'application/json',
  });
  expect(result.observedLoopWraps).toBeGreaterThanOrEqual(1);
  expect(result.decodedFrameDelta).toBeGreaterThan(0);
  expect(result.presentedSamples).toBeGreaterThan(0);
  expect(result.allVisibleSamplesDecoded).toBe(true);
  expect(lifecycle.loads).toBe(0);
  expect(lifecycle.sourceMutations).toBe(0);
  expect(lifecycle.emptied).toBe(0);
});

test('failure of only the preference enhancement leaves static artwork instead of uncontrolled autoplay', async ({
  page,
}, testInfo) => {
  let excludedPreferenceModules = 0;
  await page.route('**/work/sol-community-center', async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    const inlineScripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      (match) => !/\bsrc=/.test(match[1]!),
    );
    const allowedHashes = inlineScripts.flatMap((match) => {
      const source = match[2]!;
      if (source.includes('data-portfolio-motion-preference')) {
        excludedPreferenceModules += 1;
        return [];
      }
      return [`'sha256-${createHash('sha256').update(source).digest('base64')}'`];
    });
    // The production optimizer inlines this small module. A restrictive real
    // CSP blocks just its unlisted hash while preserving every other inline
    // module plus same-origin external bundles; no HTML or application state
    // is rewritten to manufacture the failure fallback.
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy': `script-src 'self' 'unsafe-eval' ${allowedHashes.join(' ')}`,
      },
    });
  });
  await page.goto('/work/sol-community-center#main');
  expect(excludedPreferenceModules).toBe(1);
  const video = page.locator('[data-portfolio-video]');
  await center(video);
  // Availability is maintained by the independent portfolio controller. This
  // prevents an all-JavaScript-blocked page from trivially passing the test.
  await expect(page.locator('html')).toHaveAttribute('data-portfolio-motion-available', 'true');
  await expect(page.locator('[data-case-hero]')).toHaveAttribute(
    'data-case-reveal-state',
    'complete',
  );
  await center(video);
  // Source assignment is synchronous when the independent controller sees
  // eligibility. Hold a stable, actually visible composition through several
  // observer/paint turns rather than passing on an initial empty src.
  await page.waitForTimeout(650);
  const steady = await video.evaluate((node: HTMLVideoElement) => {
    const box = node.getBoundingClientRect();
    const width = Math.max(0, Math.min(box.right, innerWidth) - Math.max(box.left, 0));
    const height = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0));
    return {
      visibleRatio: (width * height) / (box.width * box.height),
      source: node.getAttribute('src'),
      state: node.dataset.motionState,
      frame: node.dataset.motionFrame,
      rootPreference: document.documentElement.dataset.portfolioMotion,
      ready: document.documentElement.dataset.portfolioMotionReady,
      available: document.documentElement.dataset.portfolioMotionAvailable,
    };
  });
  await testInfo.attach('steady-isolated-preference-failure-state', {
    body: JSON.stringify(steady),
    contentType: 'application/json',
  });
  expect(steady.visibleRatio).toBeGreaterThan(0.5);
  await expect(preference(page)).toBeHidden();
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(video).not.toHaveAttribute('data-motion-frame', 'presented');
  await expect(video.locator('..').locator('picture img')).toBeVisible();
  const next = page.locator('[data-case-next]');
  await expect(next).toHaveAttribute('href', /\/work\//);
  const destination = (await next.getAttribute('href'))!;
  await next.click();
  await expect(page).toHaveURL(destination);
  await testInfo.attach('isolated-preference-module-failure', {
    body: JSON.stringify({
      excludedPreferenceModules,
      method:
        'Real CSP hash policy excludes only compiled inline preference enhancer; independent media controller still computes visible availability. No HTML/state rewriting.',
    }),
    contentType: 'application/json',
  });
});
