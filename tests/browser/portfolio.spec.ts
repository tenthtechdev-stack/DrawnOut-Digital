import { readFileSync, readdirSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { canPublish, type PublicationState } from '../../src/lib/project-schema';

interface DraftRecord extends PublicationState {
  title: string;
  slug: string;
  categories: string[];
  contentVerified?: boolean;
}

const directory = new URL('../../src/content/projects/', import.meta.url);
const records = readdirSync(directory)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(new URL(name, directory), 'utf8')) as DraftRecord);

function projectHref(record: DraftRecord) {
  return `${canPublish(record) ? '/work' : '/_preview/work'}/${record.slug}`;
}

async function loadImages(images: Locator) {
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
    expect(await image.getAttribute('alt')).toBeTruthy();
    const masterWidth = Number(await image.getAttribute('width'));
    expect(masterWidth).toBeGreaterThan(0);
    expect(await image.getAttribute('height')).toBeTruthy();
    await expect(image).toHaveAttribute('srcset', /\d+w/);
    for (const candidate of (await image.getAttribute('srcset'))!.split(',')) {
      const candidateWidth = Number(candidate.trim().match(/\s(\d+)w$/)?.[1]);
      expect(candidateWidth).toBeGreaterThan(0);
      expect(candidateWidth).toBeLessThanOrEqual(masterWidth);
    }
    expect(await image.getAttribute('src')).not.toContain('portfolio-originals');
  }
}

async function assertNoOverflow(page: Page, width: number) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const heading of await page.locator('main h1, main h2, main h3').all()) {
    if (!(await heading.isVisible())) continue;
    const bounds = await heading.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const rectangles: { left: number; right: number }[] = [];
      let node = walker.nextNode();
      while (node) {
        if (node.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          rectangles.push(
            ...Array.from(range.getClientRects(), ({ left, right }) => ({ left, right })),
          );
        }
        node = walker.nextNode();
      }
      return rectangles;
    });
    expect(bounds.length).toBeGreaterThan(0);
    for (const bound of bounds) {
      expect(bound.left).toBeGreaterThanOrEqual(-1);
      expect(bound.right).toBeLessThanOrEqual(width + 1);
    }
  }
}

async function expectCategory(page: Page, category: string) {
  const expected = records.filter((record) => record.categories.includes(category));
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(expected.length);
  for (const record of records) {
    const card = page
      .locator('[data-work-card]')
      .filter({ has: page.locator(`a[href="${projectHref(record)}"]`) });
    if (record.categories.includes(category)) await expect(card).toBeVisible();
    else await expect(card).toBeHidden();
  }
  await expect(page.locator(`[data-filter="${category}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-work-count]')).toContainText(`${expected.length} of`);
}

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`editorial Work index loads responsive draft artwork at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/work');
    await expect(page.locator('main h1')).toHaveText(/The work speaks\.\s+We.?ll let it\./i);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-work-index]')).toBeVisible();
    await expect(page.locator('[data-work-card]')).toHaveCount(records.length);
    await expect(page.locator('[data-work-card]:visible')).toHaveCount(records.length);
    await expect(page.locator('[data-work-filters]')).toBeVisible();
    await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-work-count]')).toContainText(`${records.length} projects`);
    for (const record of records) {
      await expect(
        page.locator('[data-work-card]').getByRole('heading', { name: record.title, exact: true }),
      ).toHaveCount(1);
      await expect(page.locator(`[data-work-card] a[href="${projectHref(record)}"]`)).toHaveCount(
        1,
      );
    }
    await expect(page.locator('[data-work-card] a[href^="/work/"]')).toHaveCount(
      records.filter(canPublish).length,
    );
    await expect(page.locator('video')).toHaveCount(0);
    await loadImages(page.locator('[data-work-card] img'));
    const aspectRatios = await page.locator('[data-work-card] img').evaluateAll((images) =>
      images.map((image) => {
        const box = image.getBoundingClientRect();
        return (box.width / box.height).toFixed(1);
      }),
    );
    expect(new Set(aspectRatios).size).toBeGreaterThan(1);
    await assertNoOverflow(page, width);
    expect(errors).toEqual([]);
    await page.evaluate(() => document.fonts.ready);
    if ([390, 768, 1440].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `artifacts/phase-3/work-${width}.png`, fullPage: true });
      await page.locator('[data-filter="packaging"]').click();
      await expectCategory(page, 'packaging');
      await loadImages(page.locator('[data-work-card]:visible img'));
      await page.locator('[data-work-filters]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `artifacts/phase-3/work-${width}-filters.png` });
    }
  });
}

test('Work categories derive from records and support URL history and keyboard operation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work?category=packaging');
  await expectCategory(page, 'packaging');
  const categories = [...new Set(records.flatMap((record) => record.categories))];
  await expect(page.locator('[data-filter]')).toHaveCount(categories.length + 1);
  for (const category of categories) {
    const button = page.locator(`[data-filter="${category}"]`);
    await button.focus();
    await expect(button).toBeFocused();
    expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    );
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Enter');
    await expectCategory(page, category);
    await expect(page).toHaveURL(new RegExp(`[?&]category=${category}(?:&|$)`));
  }
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(records.length);
  await expect(page).toHaveURL('/work');
  await page.goBack();
  await expectCategory(page, categories.at(-1)!);
  await page.goForward();
  await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/work?category=unknown-category');
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(records.length);
  await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
});

for (const slug of ['bunzo', 'triarch']) {
  for (const width of [390, 768, 1440]) {
    test(`${slug} case preview preserves art direction and navigation at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 960 });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const record = records.find((record) => record.slug === slug)!;
      const response = await page.goto(`/_preview/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-case-study]')).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 1, name: record.title, exact: true }),
      ).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
      if (width < 1024) {
        await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        const currentWork = page.getByRole('dialog').locator('a[href="/work"]');
        await expect(currentWork).toBeVisible();
        await expect(currentWork).toHaveAttribute('aria-current', 'page');
        await page.keyboard.press('Escape');
      } else {
        await expect(
          page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }),
        ).toHaveAttribute('aria-current', 'page');
      }
      await expect(page.locator('[data-case-overview]')).toBeVisible();
      await expect(page.locator('[data-case-hero]')).toBeVisible();
      await expect(page.locator('[data-case-gallery]')).toBeVisible();
      await expect(page.locator('[data-case-navigation]')).toBeVisible();
      if (!record.contentVerified) {
        await expect(
          page.locator('[data-case-narrative], [data-case-facts], [data-case-evidence]'),
        ).toHaveCount(0);
        await expect(
          page.getByRole('heading', {
            name: /challenge|creative approach|documented outcomes|credits/i,
          }),
        ).toHaveCount(0);
      }
      await expect(page.locator('[data-case-hero] img')).toHaveAttribute('loading', 'eager');
      for (const image of await page.locator('[data-case-gallery] img').all()) {
        await expect(image).toHaveAttribute('loading', 'lazy');
      }
      await expect(page.locator('video')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /play|watch/i })).toHaveCount(0);
      await loadImages(page.locator('[data-case-study] img'));
      await expect(page.locator('[data-case-gallery] img')).not.toHaveCount(0);
      await assertNoOverflow(page, width);
      expect(errors).toEqual([]);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `artifacts/phase-3/case-${slug}-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({ path: `artifacts/phase-3/case-${slug}-${width}-hero.png` });
      await page.locator('[data-case-gallery]').screenshot({
        path: `artifacts/phase-3/case-${slug}-${width}-gallery.png`,
        style: '[data-site-header], .skip-link { visibility: hidden !important; }',
      });
    });
  }
}

test('draft project navigation stays in the private route namespace and public draft URLs fail', async ({
  page,
}) => {
  await page.goto('/_preview/work/bunzo');
  const next = page.locator('[data-case-next]');
  const nextHref = await next.getAttribute('href');
  expect(nextHref).toMatch(/^\/_preview\/work\/[a-z0-9-]+$/);
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(nextHref!);
  const previous = page.locator('[data-case-previous]');
  await expect(previous).toHaveAttribute('href', '/_preview/work/bunzo');
  await previous.click();
  await expect(page).toHaveURL('/_preview/work/bunzo');
  const draft = records.find((record) => !canPublish(record));
  if (draft) {
    const response = await page.goto(`/work/${draft.slug}`);
    expect(response?.status()).toBe(404);
  }
});

test('Work and case previews remain usable without JavaScript and with reduced motion', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/work?category=packaging');
  await expect(page.locator('[data-work-filters]')).toBeHidden();
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(records.length);
  const firstProject = page.locator('[data-work-card] a').first();
  const firstHref = await firstProject.getAttribute('href');
  await firstProject.focus();
  await expect(firstProject).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(firstHref!);
  await expect(page.locator('[data-case-study]')).toBeVisible();
  await expect(page.locator('[data-case-gallery]')).toBeVisible();
  expect(
    await page
      .locator('[data-case-study]')
      .evaluate((element) => getComputedStyle(element).opacity),
  ).toBe('1');
  await expect(
    page.locator('[data-site-footer]').getByRole('link', { name: "Tell Us What You're Thinking" }),
  ).toBeVisible();
  await context.close();
});

test('reduced-motion Work interactions stay visible with no running animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  const cardLink = page.locator('[data-work-card] a').first();
  await cardLink.focus();
  await expect(cardLink).toBeFocused();
  expect(await cardLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
    'none',
  );
  expect(await cardLink.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
    '0s',
  );
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.locator('[data-filter="print"]').click();
  await expectCategory(page, 'print');
  await expect(page.locator('main h1')).toBeVisible();
});
