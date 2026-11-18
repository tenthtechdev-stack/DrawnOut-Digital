import { mkdir, readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';

const caseSlugs = [
  'bunzo',
  'sol-community-center',
  'triarch',
  'churros',
  'capture',
  'by-tech-group',
  'khalo',
  'fk-technology',
  'feed-n-seed',
  'abacus-immigration',
  'u-wanna-smoothie',
];
const serviceSlugs = [
  'brand-identity',
  'digital-design',
  'marketing-campaigns',
  'words-storytelling',
  'creative-direction',
];
const brandPage = '/services/brand-identity';
const widths = [320, 390, 768, 1024, 1440, 1920];
const viewport = (width: number) => ({ width, height: width < 768 ? 844 : 900 });
const puzzle = (page: Page) => page.locator('[data-enquiry-puzzle]');
const stage = (page: Page) => page.locator('[data-enquiry-stage]');
const enquiryLink = (page: Page) => puzzle(page).locator('[data-service-enquiry]');

async function showStage(page: Page) {
  await stage(page).evaluate((node) => {
    const box = node.getBoundingClientRect();
    scrollTo({ top: scrollY + box.top - (innerHeight - box.height) / 2, behavior: 'instant' });
  });
}
async function svgState(page: Page) {
  return puzzle(page).evaluate((root) => ({
    pieces: [...root.querySelectorAll('[data-enquiry-piece]')].map((node) =>
      node.getAttribute('transform'),
    ),
    trace: getComputedStyle(root.querySelector('[data-enquiry-thread]')!).strokeDashoffset,
    time: Number((root as HTMLElement).dataset.enquiryTime ?? 0),
  }));
}
async function stableState(page: Page) {
  const before = await svgState(page);
  await page.waitForTimeout(350);
  expect(await svgState(page)).toEqual(before);
}
async function clickTarget(link: Locator) {
  return link.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  });
}

test('all shared page heads declare retrievable faithful icons, with no default framework favicon', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const automaticIconRequests: { url: string; status: number }[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/icons/drawnout-emblem-'))
      automaticIconRequests.push({ url: response.url(), status: response.status() });
  });
  const routes = [
    '/',
    '/about',
    '/work',
    '/contact',
    '/services',
    ...serviceSlugs.map((slug) => `/services/${slug}`),
    ...caseSlugs.map((slug) => `/work/${slug}`),
    '/motion-quality-route-does-not-exist',
  ];
  let canonical: string[] | undefined;
  for (const route of routes) {
    expect((await page.goto(route))?.status(), route).toBe(
      route === '/motion-quality-route-does-not-exist' ? 404 : 200,
    );
    const references = await page
      .locator('link[rel*="icon"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({ href: node.getAttribute('href')!, rel: node.getAttribute('rel')! })),
      );
    expect(references.length, route).toBeGreaterThanOrEqual(5);
    const urls = references.map(({ href }) => href);
    canonical ??= urls;
    expect(urls, route).toEqual(canonical);
    expect(urls.every((url) => /\/icons\/drawnout-emblem-[a-f0-9]{10}/.test(url))).toBe(true);
    expect(urls.join(' ')).not.toMatch(/astro|netlify/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  }
  // A page response event proves Chromium itself requested its tab icon;
  // the explicit API requests below independently cover every declared variant.
  await expect
    .poll(() => automaticIconRequests.some((response) => response.status === 200))
    .toBe(true);
  await writeFile(
    'artifacts/motion-quality/browser-favicon-audit.json',
    JSON.stringify({ automaticIconRequests, routes, canonical }, null, 2) + '\n',
  );
  for (const url of canonical!) {
    const response = await request.get(url);
    expect(response.ok(), url).toBe(true);
    expect((await response.body()).length).toBeGreaterThan(50);
  }
  expect((await request.get('/favicon.ico')).ok()).toBe(true);
});

test('every case artwork selects a real native-bounded responsive resource at mobile and desktop DPR 2', async ({
  browser,
  baseURL,
}, testInfo) => {
  const audit = JSON.parse(
    await readFile('artifacts/motion-quality/image-source-audit.json', 'utf8'),
  ) as { assets: { file: string; after: { width: number; height: number } }[] };
  const samples: unknown[] = [];
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewport(width),
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const slug of caseSlugs) {
      await page.goto(`/work/${slug}`);
      for (const figure of await page.locator('[data-case-figure]').all()) {
        await figure.scrollIntoViewIfNeeded();
        const image = figure.locator('picture img');
        await expect(image).toHaveJSProperty('complete', true);
        const sample = await image.evaluate((node: HTMLImageElement) => {
          const box = node.getBoundingClientRect();
          const sourceWidth = Number(node.getAttribute('width'));
          const sourceHeight = Number(node.getAttribute('height'));
          return {
            currentSrc: node.currentSrc,
            candidates: (node.srcset || '').split(',').map((entry) => {
              const [url, descriptor] = entry.trim().split(/\s+/);
              return {
                url: new URL(url!, location.href).href,
                width: Number(descriptor?.replace('w', '')),
              };
            }),
            sourceWidth,
            sourceHeight,
            width: box.width,
            height: box.height,
            paintedWidth: Math.min(box.width, (box.height * sourceWidth) / sourceHeight),
            filter: getComputedStyle(node).filter,
            fit: getComputedStyle(node).objectFit,
            transform: getComputedStyle(node).transform,
            alt: node.alt,
            dpr: devicePixelRatio,
          };
        });
        const key = (await figure.getAttribute('data-case-image-key'))!;
        const source = audit.assets.find((asset) => asset.file === `${key}.webp`)!;
        expect(source, key).toBeTruthy();
        expect(sample.sourceWidth, key).toBe(source.after.width);
        expect(sample.sourceHeight, key).toBe(source.after.height);
        expect(
          sample.candidates.every(
            (candidate) => candidate.width > 0 && candidate.width <= source.after.width,
          ),
        ).toBe(true);
        const selected = sample.candidates.find((candidate) => candidate.url === sample.currentSrc);
        expect(selected, sample.currentSrc).toBeTruthy();
        const response = await page.request.get(sample.currentSrc);
        expect(response.ok()).toBe(true);
        const decoded = await sharp(await response.body()).metadata();
        expect(decoded.width).toBe(selected!.width);
        // Resource pixels, not density-corrected naturalWidth, establish actual selected detail.
        expect(decoded.width!).toBeGreaterThanOrEqual(
          Math.min(source.after.width, sample.paintedWidth * sample.dpr * 0.8),
        );
        expect(sample.filter).toBe('none');
        expect(sample.fit).toBe('contain');
        expect(sample.alt.length).toBeGreaterThan(0);
        if (source.after.width < 840) {
          expect(sample.width).toBeLessThanOrEqual(source.after.width + 1);
          expect(sample.height).toBeLessThanOrEqual(source.after.height + 1);
        }
        samples.push({
          slug,
          viewportWidth: width,
          key,
          ...sample,
          selectedResource: {
            width: decoded.width,
            height: decoded.height,
            bytes: (await response.body()).length,
          },
        });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
    await context.close();
  }
  await mkdir('artifacts/motion-quality', { recursive: true });
  await writeFile(
    'artifacts/motion-quality/browser-image-audit.json',
    JSON.stringify(samples, null, 2) + '\n',
  );
  await testInfo.attach('source-to-browser-image-audit', {
    body: JSON.stringify(samples, null, 2),
    contentType: 'application/json',
  });
});

test('an early native pointer gesture can pause SOL while its visual arrival is still active', async ({
  page,
}) => {
  await page.setViewportSize(viewport(390));
  await page.goto('/work/sol-community-center', { waitUntil: 'domcontentloaded' });
  const figure = page.locator('[data-case-hero]');
  const control = page.locator('[data-motion-toggle="case-motion-sol-community-center"]');
  await control.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute('data-case-reveal-state', 'running');
  await control.evaluate((node: HTMLElement) => {
    node.dataset.testClickCount = '0';
    node.addEventListener('click', () => {
      node.dataset.testClickCount = String(Number(node.dataset.testClickCount) + 1);
    });
  });
  const before = (await control.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  // Native mousedown focuses the control. Focus deliberately settles the
  // artwork, but its button must retain the same hit target until pointerup.
  await expect(figure).toHaveAttribute('data-case-reveal-state', 'complete');
  const focused = (await control.boundingBox())!;
  expect(Math.abs(focused.x - before.x)).toBeLessThan(0.5);
  expect(Math.abs(focused.y - before.y)).toBeLessThan(0.5);
  await page.mouse.up();
  await expect(control).toHaveAttribute('data-test-click-count', '1');
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-portfolio-video]')).not.toHaveAttribute('src', /.+/);
});

test('early pointer gestures keep both case-closing links stable and navigate during the text reveal', async ({
  page,
}) => {
  await page.setViewportSize(viewport(390));
  for (const selector of ['[data-case-service]', '[data-case-enquiry]']) {
    await page.goto('/work/sol-community-center', { waitUntil: 'domcontentloaded' });
    const closing = page.locator('.cp-closing');
    const link = closing.locator(selector);
    const destination = (await link.getAttribute('href'))!;
    await link.scrollIntoViewIfNeeded();
    await expect(closing).toHaveAttribute('data-case-reveal-state', 'running');
    expect(
      await link.evaluate((node) =>
        document.getAnimations().some((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          return target instanceof Element && target.contains(node);
        }),
      ),
    ).toBe(false);
    const before = (await link.boundingBox())!;
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    await expect(closing).toHaveAttribute('data-case-reveal-state', 'complete');
    const focused = (await link.boundingBox())!;
    expect(Math.abs(focused.x - before.x)).toBeLessThan(0.5);
    expect(Math.abs(focused.y - before.y)).toBeLessThan(0.5);
    await page.mouse.up();
    await expect(page).toHaveURL(new RegExp(`${destination}/?$`));
  }
});

for (const width of [390, 1440]) {
  test(`the first three new case-study loops decode with their matching responsive posters at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport(width));
    for (const slug of ['bunzo', 'sol-community-center', 'churros']) {
      await page.goto(`/work/${slug}`);
      const video = page.locator('[data-portfolio-video]');
      const showVideo = async () =>
        video.evaluate((node) => {
          const box = node.getBoundingClientRect();
          scrollTo({
            top: scrollY + box.top - (innerHeight - box.height) / 2,
            behavior: 'instant',
          });
        });
      await showVideo();
      await expect(video).toHaveAttribute('data-motion-state', 'playing');
      await expect
        .poll(() =>
          video.evaluate(
            (node: HTMLVideoElement) => node.getVideoPlaybackQuality().totalVideoFrames,
          ),
        )
        .toBeGreaterThan(0);
      const decoded = await video.evaluate((node: HTMLVideoElement) => {
        const box = node.parentElement!.getBoundingClientRect();
        const portrait = box.width / box.height < 1.1;
        return {
          variant: portrait ? 'portrait' : 'landscape',
          expectedPoster: portrait ? node.dataset.portraitPoster : node.dataset.landscapePoster,
          poster: node.getAttribute('poster'),
          source: node.currentSrc,
          width: node.videoWidth,
          height: node.videoHeight,
          duration: node.duration,
          time: node.currentTime,
          paused: node.paused,
        };
      });
      expect(decoded.source).toContain(`/${slug}-${decoded.variant}.mp4`);
      expect([decoded.width, decoded.height]).toEqual(
        decoded.variant === 'portrait' ? [810, 1080] : [1440, 810],
      );
      expect(decoded.duration).toBe(7.5);
      expect(decoded.paused).toBe(false);
      expect(decoded.poster).toBe(decoded.expectedPoster);
      expect(decoded.poster).toContain(`${slug}-${decoded.variant}-poster`);
      const posterResponse = await page.request.get(decoded.expectedPoster!);
      expect(posterResponse.ok()).toBe(true);
      const poster = await sharp(await posterResponse.body()).metadata();
      expect([poster.width, poster.height]).toEqual([decoded.width, decoded.height]);
      await expect
        .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
        .not.toBe(decoded.time);
      expect(await page.locator('[data-portfolio-video][src]').count()).toBeLessThanOrEqual(
        width < 768 ? 1 : 2,
      );
      const control = page.locator(`[data-motion-toggle="case-motion-${slug}"]`);
      await control.click();
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await expect(video).not.toHaveAttribute('src', /.+/);
      await expect(video).toHaveAttribute('data-motion-state', 'poster');
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await showVideo();
      await expect(video).not.toHaveAttribute('src', /.+/);
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await control.click();
      await expect(video).toHaveAttribute('data-motion-state', 'playing');
      await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    }
  });
}

test('new matching-poster assets and videos remain unfetched under Save Data, reduced motion and no JavaScript', async ({
  browser,
  baseURL,
}) => {
  for (const mode of ['save-data', 'reduced-motion', 'no-javascript']) {
    const context = await browser.newContext({
      baseURL,
      viewport: viewport(390),
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
      javaScriptEnabled: mode !== 'no-javascript',
    });
    const page = await context.newPage();
    if (mode === 'save-data') {
      await page.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
      });
    }
    const mediaRequests: string[] = [];
    page.on('request', (request) => {
      if (
        /\/media\/portfolio\/|(?:bunzo|sol-community-center|churros)-(?:landscape|portrait)-poster/.test(
          request.url(),
        )
      )
        mediaRequests.push(request.url());
    });
    for (const slug of ['bunzo', 'sol-community-center', 'churros']) {
      await page.goto(`/work/${slug}`);
      const video = page.locator('[data-portfolio-video]');
      await page.locator('[data-case-hero]').scrollIntoViewIfNeeded();
      await expect(video).not.toHaveAttribute('src', /.+/);
      await expect(video).not.toHaveAttribute('poster', /.+/);
      await expect(video.locator('..').locator('picture img')).toBeVisible();
      await expect(page.locator('[data-motion-toggle]')).toBeHidden();
    }
    expect(mediaRequests, mode).toEqual([]);
    await context.close();
  }
});

for (const width of widths) {
  test(`Brand Identity enquiry is readable, reachable and contained at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(brandPage);
    await expect(puzzle(page)).toHaveCount(1);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'static');
    await expect(puzzle(page)).toContainText('A good identity starts with a better question.');
    await expect(puzzle(page)).toContainText("Bring us the pieces. We'll help find the picture.");
    await expect(enquiryLink(page)).toHaveAttribute('href', '/contact');
    await enquiryLink(page).scrollIntoViewIfNeeded();
    await enquiryLink(page).focus();
    expect(
      await enquiryLink(page).evaluate((node) => getComputedStyle(node).outlineStyle),
    ).not.toBe('none');
    expect(await clickTarget(enquiryLink(page))).toBe(true);
    await showStage(page);
    const box = await stage(page).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(puzzle(page).locator('[data-enquiry-emblem] image')).toBeVisible();
    await expect(puzzle(page).locator('[data-enquiry-pause]')).toBeHidden();
  });
}

for (const width of [390, 1440]) {
  test(`enquiry has independent motion, a complete hold, smooth repeating return and native visibility pause at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport(width));
    await page.goto(brandPage);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'static');
    await showStage(page);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', 'idea');
    const initial = await svgState(page);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', 'connect');
    // The phase boundary is also the trace tween's start. Wait for real painted
    // progression rather than sampling the boundary frame before it moves.
    await expect.poll(async () => (await svgState(page)).trace).not.toBe(initial.trace);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', 'direction');
    await expect.poll(async () => (await svgState(page)).time).toBeGreaterThan(5);
    const resolved = await svgState(page);
    expect(resolved.pieces).not.toEqual(initial.pieces);
    await page.waitForTimeout(300);
    expect((await svgState(page)).pieces).toEqual(resolved.pieces);
    await expect
      .poll(() => puzzle(page).getAttribute('data-enquiry-cycle'), { timeout: 12_000 })
      .not.toBe('0');
    // Native scrolling removes the artwork from view and must suspend its clock.
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'paused');
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-pause-reasons', /offscreen/);
    await stableState(page);
    await showStage(page);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
    const pause = puzzle(page).locator('[data-enquiry-pause]');
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    await stableState(page);
    await pause.click();
    await page.mouse.click(2, 2);
    await showStage(page);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
    await enquiryLink(page).scrollIntoViewIfNeeded();
    await enquiryLink(page).focus();
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-pause-reasons', /focus/);
    await stableState(page);
    await enquiryLink(page).press('Enter');
    await expect(page).toHaveURL(/\/contact\/?$/);
  });
}

test('the enquiry link remains clickable at each real-time animation phase', async ({ page }) => {
  for (const phase of ['idea', 'connect', 'direction']) {
    await page.goto(brandPage);
    await showStage(page);
    await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', phase);
    await enquiryLink(page).click();
    await expect(page).toHaveURL(/\/contact\/?$/);
  }
});

test('reduced-motion changes restore the complete static enquiry without hiding the CTA', async ({
  page,
}) => {
  await page.goto(brandPage);
  await showStage(page);
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'static');
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', 'direction');
  await stableState(page);
  await expect(puzzle(page).locator('[data-enquiry-emblem]')).toHaveCSS('opacity', '1');
  await enquiryLink(page).click();
  await expect(page).toHaveURL(/\/contact\/?$/);
});

test('the document visibility handler suspends the enquiry clock and preserves explicit pause intent', async ({
  page,
}) => {
  await page.goto(brandPage);
  await showStage(page);
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
  // Headless pages cannot prove real OS backgrounding. Exercise the actual
  // visibilitychange handler with a controlled document.hidden getter instead.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-pause-reasons', /hidden/);
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'paused');
  await stableState(page);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'playing');
  const pause = puzzle(page).locator('[data-enquiry-pause]');
  await pause.click();
  await page.mouse.click(2, 2);
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-pause-reasons', /user/);
  await stableState(page);
});

test('failed animation-module loading leaves the complete illustration and Contact link usable', async ({
  page,
}) => {
  let blockedModules = 0;
  await page.route(/\/_astro\/gsap\.[^/]+\.js$/, async (route) => {
    blockedModules += 1;
    await route.abort('failed');
  });
  await page.goto(brandPage);
  await showStage(page);
  await expect.poll(() => blockedModules).toBeGreaterThan(0);
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'static');
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-phase', 'direction');
  await stableState(page);
  await expect(puzzle(page).locator('[data-enquiry-emblem]')).toHaveCSS('opacity', '1');
  await expect(puzzle(page).locator('[data-enquiry-pause]')).toBeHidden();
  await enquiryLink(page).click();
  await expect(page).toHaveURL(/\/contact\/?$/);
});

test('Save Data preserves complete static enquiry and unloaded portfolio decoders', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.defineProperty(connection, 'saveData', { value: true });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  });
  await page.goto(brandPage);
  await showStage(page);
  await expect(puzzle(page)).toHaveAttribute('data-enquiry-state', 'static');
  await stableState(page);
  await enquiryLink(page).click();
  await expect(page).toHaveURL(/\/contact\/?$/);
  await page.goto('/work');
  for (const card of await page.locator('[data-work-card]').all())
    await card.scrollIntoViewIfNeeded();
  expect(await page.locator('[data-portfolio-video][src]').count()).toBe(0);
});

test('without JavaScript the enquiry resolves visibly, contact navigation works and eleven cases remain accessible', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: viewport(390),
  });
  const page = await context.newPage();
  await page.goto(brandPage);
  await expect(puzzle(page)).toHaveCount(1);
  await expect(puzzle(page).locator('[data-enquiry-emblem] image')).toBeVisible();
  await expect(puzzle(page).locator('[data-enquiry-pause]')).toBeHidden();
  await enquiryLink(page).click();
  await expect(page).toHaveURL(/\/contact\/?$/);
  await page.goto('/work');
  await expect(page.locator('[data-work-card]')).toHaveCount(11);
  await expect(page.locator('[data-work-filters]')).toBeHidden();
  await page.locator('[data-work-card][data-project-slug="bunzo"] a').first().click();
  await expect(page).toHaveURL(/\/work\/bunzo\/?$/);
  await expect(page.locator('[data-case-figure]')).toHaveCount(5);
  await context.close();
});

test('only Brand Identity receives the first puzzle and its static composition passes accessibility checks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(brandPage);
  await puzzle(page).scrollIntoViewIfNeeded();
  const scan = await new AxeBuilder({ page })
    .include('[data-enquiry-puzzle]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(scan.violations).toEqual([]);
  for (const slug of serviceSlugs.filter((slug) => slug !== 'brand-identity')) {
    await page.goto(`/services/${slug}`);
    await expect(puzzle(page)).toHaveCount(0);
    await expect(page.locator('[data-service-enquiry]')).toHaveAttribute('href', '/contact');
  }
});

test('Work filtering, browser back and real case navigation retain the approved index', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work');
  const cards = page.locator('[data-work-card]');
  await expect(cards).toHaveCount(11);
  const order = await cards.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLElement).dataset.projectSlug),
  );
  expect(order).toEqual(caseSlugs);
  await page.locator('[data-filter="packaging"]').click();
  await expect(page).toHaveURL(/category=packaging/);
  const visible = page.locator('[data-work-card]:not([hidden])');
  expect(await visible.count()).toBeGreaterThan(0);
  expect(await visible.count()).toBeLessThan(11);
  await page.goBack();
  await expect(visible).toHaveCount(11);
  await page
    .locator('[data-work-card][data-project-slug="sol-community-center"] a')
    .first()
    .click();
  await expect(page).toHaveURL(/\/work\/sol-community-center\/?$/);
  await expect(page.locator('[data-case-next]')).toHaveAttribute('href', '/work/triarch');
});
