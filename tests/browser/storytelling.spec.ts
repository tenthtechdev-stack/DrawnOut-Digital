import { expect, test, type Locator, type Page } from '@playwright/test';

const storySections = [
  ['studio', '[data-studio]'],
  ['work', '[data-work]'],
  ['services', '[data-services]'],
  ['approach', '[data-approach]'],
  ['process', '[data-process]'],
  ['fit', '[data-fit]'],
  ['footer', '[data-site-footer]'],
] as const;

const sourceHeadings = [
  ['[data-studio]', /Not another creative agency\./i],
  ['[data-services]', /We think beyond the brief\./i],
  ['[data-approach]', /Pretty isn't the point\./i],
  ['[data-process]', /Small details\. Big picture\./i],
  ['[data-fit]', /Built for brands going somewhere\./i],
] as const;

const capabilityNames = [
  'Brand Identity & Design',
  'Digital Design',
  'Marketing & Campaigns',
  'Words & Storytelling',
  'Creative Direction',
];

async function loadPortfolioPosters(page: Page) {
  for (const image of await page.locator('[data-work] img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
    expect(await image.getAttribute('alt')).toBeTruthy();
    expect(await image.getAttribute('width')).toBeTruthy();
    expect(await image.getAttribute('height')).toBeTruthy();
    await expect(image).toHaveAttribute('srcset', /\d+w/);
    expect(await image.getAttribute('src')).not.toContain('portfolio-originals');
  }
  await page.evaluate(() => document.fonts.ready);
}

async function expectVisibleTextFits(locator: Locator, width: number) {
  for (const element of await locator.all()) {
    const bounds = await element.evaluate((heading) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const bounds: { left: number; right: number }[] = [];
      let text = walker.nextNode();
      while (text) {
        if (text.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(text);
          bounds.push(
            ...Array.from(range.getClientRects(), ({ left, right }) => ({ left, right })),
          );
        }
        text = walker.nextNode();
      }
      return bounds;
    });
    expect(bounds.length).toBeGreaterThan(0);
    for (const bound of bounds) {
      expect(bound.left).toBeGreaterThanOrEqual(-1);
      expect(bound.right).toBeLessThanOrEqual(width + 1);
    }
  }
}

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`Phase 2 storytelling and original portfolio remain readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/');
    await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
    for (const [selector, heading] of sourceHeadings) {
      await expect(page.locator(selector).getByRole('heading', { name: heading })).toBeVisible();
    }
    for (const capability of capabilityNames) {
      await expect(
        page.locator('[data-services]').getByRole('heading', { name: capability, exact: true }),
      ).toBeVisible();
    }
    const process = page.locator('[data-process]');
    for (const step of [
      'First, we ask why.',
      'Then, we find the idea.',
      'Next, we make it real.',
      'Finally, we make it work.',
    ]) {
      await expect(process.getByRole('heading', { name: step, exact: true })).toBeVisible();
    }
    const work = page.locator('[data-work]');
    for (const project of [
      'Bunzo',
      'SOL Community Center',
      'Triarch',
      'Churros Dessert Shop',
      'By Tech Group',
    ]) {
      await expect(work.getByRole('heading', { name: project, exact: true })).toBeVisible();
    }
    await expect(work.locator('img')).toHaveCount(5);
    await expect(work.locator('a[href^="/work/"]')).toHaveCount(5);
    await expect(work.locator('.preview-tag')).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /play|watch/i })).toHaveCount(0);
    await loadPortfolioPosters(page);
    for (const [project, mobilePoster, widePoster] of [
      ['Bunzo', 'bunzo-applications.webp', 'bunzo-packaging-wide.webp'],
      ['Churros Dessert Shop', 'churros-applications.webp', 'churros-retail-wide.webp'],
    ]) {
      const image = work
        .locator('[data-project-card]')
        .filter({ has: page.getByRole('heading', { name: project!, exact: true }) })
        .locator('img');
      const currentSource = await image.evaluate((element: HTMLImageElement) =>
        decodeURIComponent(element.currentSrc),
      );
      expect(currentSource).toContain(width < 640 ? mobilePoster! : widePoster!);
    }
    const mediaRatios = await work.locator('.media-slot').evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return (bounds.width / bounds.height).toFixed(1);
      }),
    );
    expect(new Set(mediaRatios).size).toBeGreaterThan(1);
    await expectVisibleTextFits(page.locator('main h1, main h2, main h3'), width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(pageErrors).toEqual([]);

    if ([390, 768, 1440].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `artifacts/phase-2/afterglow-${width}.png`, fullPage: true });
      await page.screenshot({ path: `artifacts/phase-2/afterglow-${width}-hero.png` });
      for (const [label, selector] of storySections) {
        await page.locator(selector).screenshot({
          path: `artifacts/phase-2/afterglow-${width}-${label}.png`,
          style: '[data-site-header], .skip-link { visibility: hidden !important; }',
        });
      }
    }
  });
}

test('new homepage story remains usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  for (const [selector, heading] of sourceHeadings) {
    await expect(page.locator(selector).getByRole('heading', { name: heading })).toBeVisible();
  }
  await expect(page.locator('[data-work] img')).toHaveCount(5);
  await expect(
    page.locator('[data-site-footer]').getByRole('link', { name: "Tell Us What You're Thinking" }),
  ).toBeVisible();
  await page.locator('[data-menu-fallback] summary').click();
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'Services', exact: true })
    .click();
  await expect(page).toHaveURL('/services');
  await context.close();
});

test('reduced-motion storytelling preserves visibility and a keyboard-usable mobile menu', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const [, selector] of storySections) {
    await expect(page.locator(selector)).toBeVisible();
  }
  expect(await page.locator('main').evaluate((element) => getComputedStyle(element).opacity)).toBe(
    '1',
  );
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: 'artifacts/phase-2/afterglow-390-navigation.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused();
});
