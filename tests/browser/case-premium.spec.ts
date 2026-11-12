import { readFileSync, readdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { canPublish } from '../../src/lib/project-schema';

const pilotSlugs = [
  'sol-community-center',
  'bunzo',
  'triarch',
  'capture',
  'by-tech-group',
] as const;
const expectedArtworkCounts: Record<(typeof pilotSlugs)[number], number> = {
  'sol-community-center': 5,
  bunzo: 5,
  triarch: 3,
  capture: 3,
  'by-tech-group': 2,
};
const contentDirectory = new URL('../../src/content/projects/', import.meta.url);
const records = readdirSync(contentDirectory)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(new URL(name, contentDirectory), 'utf8')))
  .filter(canPublish)
  .sort((a, b) => (a.workOrder ?? a.featuredOrder) - (b.workOrder ?? b.featuredOrder));
const recordFor = (slug: string) => records.find((record) => record.slug === slug)!;
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });
const rootFor = (page: Page) => page.locator('[data-case-premium]');
const artwork = (page: Page) => rootFor(page).locator('[data-case-figure]');

async function ready(page: Page, slug: string) {
  await page.goto(`/work/${slug}#main`);
  await expect(rootFor(page)).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

async function readable(element: Locator, width: number) {
  await expect(element).toBeVisible();
  await expect(element).toHaveCSS('opacity', '1');
  const bounds = await element.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const rects: { left: number; right: number }[] = [];
    let text = walker.nextNode();
    while (text) {
      if (text.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(text);
        rects.push(...[...range.getClientRects()].map(({ left, right }) => ({ left, right })));
      }
      text = walker.nextNode();
    }
    return rects;
  });
  expect(bounds.length).toBeGreaterThan(0);
  for (const rect of bounds) {
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(width + 1);
  }
}

async function loadArtwork(page: Page, width: number) {
  const figures = artwork(page);
  expect(await figures.count()).toBeGreaterThanOrEqual(2);
  const sources: string[] = [];
  for (const figure of await figures.all()) {
    await figure.scrollIntoViewIfNeeded();
    const image = figure.locator('picture img');
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty('complete', true);
    const geometry = await image.evaluate((node: HTMLImageElement) => {
      const box = node.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        left: box.left,
        right: box.right,
        fit: getComputedStyle(node).objectFit,
        natural: node.naturalWidth,
      };
    });
    expect(geometry.width).toBeGreaterThan(70);
    expect(geometry.height).toBeGreaterThan(70);
    expect(geometry.left).toBeGreaterThanOrEqual(-1);
    expect(geometry.right).toBeLessThanOrEqual(width + 1);
    expect(geometry.natural).toBeGreaterThan(0);
    expect(geometry.fit).toBe('contain');
    expect(await image.getAttribute('alt')).toBeTruthy();
    expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    await expect(image).toHaveAttribute('srcset', /\d+w/);
    sources.push((await image.getAttribute('src'))!);
    const caption = figure.locator('figcaption');
    if (await caption.count()) await readable(caption, width);
  }
  // Each chosen image is placed once; next-project artwork is outside this set.
  expect(new Set(sources).size).toBe(sources.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    width,
  );
  for (const heading of await rootFor(page).locator('h1, h2').all()) await readable(heading, width);
}

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`five pilot presentations load unique readable artwork without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const slug of pilotSlugs) {
      await ready(page, slug);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(recordFor(slug).title);
      await loadArtwork(page, width);
      await expect(artwork(page)).toHaveCount(expectedArtworkCounts[slug]);
    }
    expect(errors).toEqual([]);
  });
}

for (const slug of pilotSlugs) {
  test(`${slug} uses the intended distinct mosaic without duplicated or empty tiles`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page, slug);
    const mosaic = rootFor(page).locator('[data-case-mosaic]');
    const frames = mosaic.locator('[data-case-figure]');
    const count = Math.min(4, expectedArtworkCounts[slug]);
    await expect(frames).toHaveCount(count);
    await frames.first().scrollIntoViewIfNeeded();
    const boxes = await frames.evaluateAll((nodes) =>
      nodes.map((node) => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    expect(new Set(boxes.map((box) => `${Math.round(box.x)}:${Math.round(box.y)}`)).size).toBe(
      count,
    );
    if (count === 4) {
      expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
      expect(boxes[0]!.height).toBeGreaterThan(boxes[2]!.height);
      expect(boxes[1]!.y).toBeLessThan(boxes[2]!.y);
      expect(boxes[1]!.width).toBeGreaterThan(boxes[2]!.width);
      expect(boxes[2]!.x).toBeLessThan(boxes[3]!.x);
    }
    const allowedStems = [
      recordFor(slug).cover,
      ...recordFor(slug).gallery.map((image: { src: string }) => image.src),
    ].map((path: string) =>
      path
        .split('/')
        .at(-1)!
        .replace(/\.webp$/, ''),
    );
    for (const image of await artwork(page).locator('picture img').all()) {
      const src = await image.getAttribute('src');
      expect(allowedStems.some((stem: string) => src!.includes(stem))).toBe(true);
    }
  });
  test(`${slug} preserves accessible artwork and navigation at mobile and desktop widths`, async ({
    page,
  }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize(viewportFor(width));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await ready(page, slug);
      await loadArtwork(page, width);
      const scan = await new AxeBuilder({ page })
        .include('[data-case-premium]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(scan.violations).toEqual([]);
      const previous = rootFor(page).locator('[data-case-previous]');
      await previous.focus();
      expect(await previous.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe(
        'none',
      );
    }
  });
}

test('exactly five approved routes receive the pilot design and metadata remains factual-gated', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [index, record] of records.entries()) {
    const response = await page.goto(`/work/${record.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-case-study]')).toHaveCount(1);
    await expect(rootFor(page)).toHaveCount(pilotSlugs.includes(record.slug) ? 1 : 0);
    await expect(page).toHaveTitle(`${record.title} — DrawnOut Digital`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      record.summary,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(record.contentVerified).toBe(false);
    expect(record.creditApproved).toBe(false);
    expect(record.projectType).toBe('unknown');
    await expect(
      page.locator(
        '[data-case-facts], [data-case-narrative], [data-case-evidence], [data-case-draft]',
      ),
    ).toHaveCount(0);
    await expect(page.locator('[data-case-next]')).toHaveAttribute(
      'href',
      `/work/${records[(index + 1) % records.length].slug}`,
    );
    await expect(page.locator('[data-case-previous]')).toHaveAttribute(
      'href',
      `/work/${records[(index - 1 + records.length) % records.length].slug}`,
    );
  }
});

async function playVisible(video: Locator) {
  await video.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    scrollTo({
      top: scrollY + bounds.top - (innerHeight - bounds.height) / 2,
      behavior: 'instant',
    });
  });
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  const state = await video.evaluate((node: HTMLVideoElement) => ({
    source: node.currentSrc,
    time: node.currentTime,
    muted: node.muted,
    inline: node.playsInline,
    loop: node.loop,
    portrait: node.getBoundingClientRect().width / node.getBoundingClientRect().height < 1.1,
  }));
  expect(state.muted && state.inline && state.loop).toBe(true);
  expect(state.source).toContain(state.portrait ? '-portrait.mp4' : '-landscape.mp4');
  await expect
    .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
    .not.toBe(state.time);
}

for (const width of [390, 1440]) {
  test(`existing case footage plays only when visible and pause controls work at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    for (const slug of ['sol-community-center', 'bunzo', 'triarch', 'by-tech-group']) {
      await ready(page, slug);
      const video = rootFor(page).locator('[data-portfolio-video]');
      await expect(video).toHaveCount(1);
      await playVisible(video);
      await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(1);
      const toggle = rootFor(page).locator('[data-motion-toggle]');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(video).not.toHaveAttribute('src', /.+/);
      await expect(video.locator('..').locator('picture img')).toBeVisible();
      await page.keyboard.press('Enter');
      await playVisible(video);
      await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
      await expect(video).not.toHaveAttribute('src', /.+/);
    }
    await ready(page, 'capture');
    await expect(rootFor(page).locator('video')).toHaveCount(0);
  });
}

test('native Work, case-to-case, service and enquiry links remain immediate and keyboard operable', async ({
  page,
}) => {
  await page.goto('/work#main');
  const workLink = page.locator('[data-project-slug="bunzo"] a[href="/work/bunzo"]');
  await workLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work/bunzo');
  await expect(rootFor(page)).toHaveCount(1);
  expect(
    await page.evaluate(() =>
      ['pending', 'playing'].includes(document.documentElement.dataset.signatureIntro ?? ''),
    ),
  ).toBe(false);
  await rootFor(page).locator('[data-case-next]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work/sol-community-center');
  expect(
    await page.evaluate(() =>
      ['pending', 'playing'].includes(document.documentElement.dataset.signatureIntro ?? ''),
    ),
  ).toBe(false);
  const service = rootFor(page).locator('[data-case-service]');
  const href = await service.getAttribute('href');
  expect(href).toMatch(/^\/services\/[a-z-]+$/);
  await service.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(href!);
  await page.goto('/work/capture#main');
  await rootFor(page).locator('[data-case-enquiry]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/contact');
});

test('mobile touch navigation reaches the real project and returns to the Work index', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: viewportFor(390),
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/work#main');
    await page
      .locator('[data-project-slug="sol-community-center"] a[href="/work/sol-community-center"]')
      .tap();
    await expect(page).toHaveURL('/work/sol-community-center');
    await rootFor(page).locator('[data-case-previous]').tap();
    await expect(page).toHaveURL('/work/bunzo');
    await rootFor(page).getByRole('link', { name: 'All work', exact: true }).tap();
    await expect(page).toHaveURL('/work');
    await expect(page.locator('[data-work-card]')).toHaveCount(11);
  } finally {
    await context.close();
  }
});

for (const mode of ['reduced-motion', 'save-data', 'no-javascript', 'blocked-scripts'] as const) {
  test(`${mode} leaves complete pilot artwork and ordinary links without downloading video`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(390),
      javaScriptEnabled: mode !== 'no-javascript',
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
    });
    if (mode === 'save-data')
      await context.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { value: connection });
      });
    const footage: string[] = [];
    context.on('request', (request) => {
      if (request.url().includes('/media/portfolio/')) footage.push(request.url());
    });
    try {
      const page = await context.newPage();
      if (mode === 'blocked-scripts')
        await page.route('**/*', async (route) => {
          if (route.request().resourceType() !== 'document') return route.continue();
          const response = await route.fetch();
          await route.fulfill({
            response,
            headers: { ...response.headers(), 'content-security-policy': "script-src 'none'" },
          });
        });
      for (const slug of ['sol-community-center', 'bunzo', 'capture']) {
        await ready(page, slug);
        await loadArtwork(page, 390);
        await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
        expect(
          await rootFor(page).evaluate(
            (node) =>
              node
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === 'running').length,
          ),
        ).toBe(0);
      }
      expect(footage).toHaveLength(0);
      await rootFor(page).locator('[data-case-next]').click();
      await expect(page).toHaveURL('/work/by-tech-group');
    } finally {
      await context.close();
    }
  });
}

test('case reveals settle once on reverse scrolling and keyboard focus restores complete text', async ({
  page,
}) => {
  await ready(page, 'bunzo');
  const late = rootFor(page).locator('[data-case-reveal]').last();
  await late.evaluate((node) => {
    const states: string[] = [];
    new MutationObserver(() =>
      states.push((node as HTMLElement).dataset.caseRevealState ?? ''),
    ).observe(node, { attributes: true, attributeFilter: ['data-case-reveal-state'] });
    Object.assign(node, { testCaseRevealStates: states });
  });
  await late.scrollIntoViewIfNeeded();
  await expect(late).toHaveAttribute('data-case-reveal-state', 'complete');
  await page.locator('h1').scrollIntoViewIfNeeded();
  await late.scrollIntoViewIfNeeded();
  await expect(late).toHaveAttribute('data-case-reveal-state', 'complete');
  const state = await late.evaluate((node) => ({
    runs: (node as HTMLElement & { testCaseRevealStates: string[] }).testCaseRevealStates.filter(
      (value) => value === 'running',
    ).length,
    active: node
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState === 'running').length,
  }));
  expect(state.runs).toBeLessThanOrEqual(1);
  expect(state.active).toBe(0);
  await ready(page, 'capture');
  const enquiry = rootFor(page).locator('[data-case-enquiry]');
  await enquiry.focus();
  await readable(enquiry, 1440);
  expect(
    await enquiry.evaluate(
      (node) =>
        node
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
});

test('changing motion preferences releases case footage and immediately restores static presentation', async ({
  page,
}) => {
  await ready(page, 'sol-community-center');
  const video = rootFor(page).locator('[data-portfolio-video]');
  await playVisible(video);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(rootFor(page)).toHaveAttribute('data-case-motion', 'reduced');
  await loadArtwork(page, 1440);
  expect(
    await rootFor(page).evaluate(
      (node) =>
        node
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await playVisible(video);
});
