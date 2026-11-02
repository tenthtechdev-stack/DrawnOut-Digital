import { expect, test, type Locator, type Page } from '@playwright/test';

const capabilityNames = [
  'Brand Identity & Design',
  'Digital Design',
  'Marketing & Campaigns',
  'Words & Storytelling',
  'Creative Direction',
];

async function loadPosters(page: Page) {
  // The transient intro is absent after its session ends. Exercise the images
  // in the persistent page, including the shared signature footer.
  for (const image of await page
    .locator('main img, [data-site-header] img, [data-site-footer] img')
    .all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
  }
  await page.evaluate(() => document.fonts.ready);
}

async function expectTextInViewport(heading: Locator, width: number) {
  const rectangles = await heading.evaluate((element) => {
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
  expect(rectangles.length).toBeGreaterThan(0);
  for (const rectangle of rectangles) {
    expect(rectangle.left).toBeGreaterThanOrEqual(-1);
    expect(rectangle.right).toBeLessThanOrEqual(width + 1);
  }
}

for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
  test(`Afterglow foundation is readable and complete at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/');
    const heading = page.locator('main h1');
    await expect(heading).toHaveText('We make ideas impossible to ignore.');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#main')).toHaveCount(1);
    await expect(page.locator('[data-site-header]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Our Work', exact: true })).toBeVisible();
    await expectTextInViewport(heading, width);
    const capabilities = page.locator('[data-capabilities]');
    for (const capability of capabilityNames) {
      await expect(capabilities.getByText(capability, { exact: true })).toBeVisible();
    }
    const work = page.locator('[data-work]');
    // The approved homepage now features all six supplied motion projects.
    await expect(work.locator('img')).toHaveCount(6);
    await expect(work.locator('a[href^="/work/"]')).toHaveCount(6);
    await expect(page.locator('[data-site-footer]')).toBeVisible();
    await loadPosters(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(pageErrors).toEqual([]);
    if ([390, 768, 1440].includes(width)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `artifacts/phase-1/afterglow-${width}.png`, fullPage: true });
      await page.screenshot({ path: `artifacts/phase-1/afterglow-${width}-hero.png` });
      for (const [label, selector] of [
        ['header', '[data-site-header]'],
        ['capabilities', '[data-capabilities]'],
        ['work', '[data-work]'],
        ['footer', '[data-site-footer]'],
      ]) {
        await page.locator(selector!).screenshot({
          path: `artifacts/phase-1/afterglow-${width}-${label}.png`,
          style:
            label === 'header'
              ? undefined
              : '[data-site-header], .skip-link { visibility: hidden !important; }',
        });
      }
    }
  });
}

test('mobile navigation traps focus, closes with Escape, and restores the trigger', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
  await page.screenshot({ path: 'artifacts/phase-1/afterglow-390-navigation.png' });
  for (let index = 0; index < 9; index++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
});

test('mobile navigation closes after link selection and desktop resize releases its lock', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Navigation', exact: true })
    .getByRole('link', { name: /^(?:\d+\s+)?Services$/ })
    .click();
  await expect(page).toHaveURL('/services');
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).not.toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 960 });
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).not.toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await expect(
    page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }),
  ).toBeVisible();
});

test('mobile navigation dismisses on the backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true });
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  if (box && box.x > 5) {
    await page.mouse.click(box.x / 2, box.y + box.height / 2);
  } else if (box && box.y + box.height < 839) {
    await page.mouse.click(195, box.y + box.height + 3);
  } else {
    throw new Error('The modal design must expose a usable backdrop dismissal area.');
  }
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused();
});

test('no-JavaScript mobile navigation and reduced-motion content stay usable', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  const header = page.locator('[data-site-header]');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await header.locator('[data-menu-fallback] summary').click();
  for (const name of ['Work', 'Services', 'About', 'Contact']) {
    await expect(header.getByRole('link', { name, exact: true })).toBeVisible();
  }
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('[data-site-footer]')).toBeVisible();
  await header.getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await context.close();
});

for (const [route, name] of [
  ['/work', 'Work'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]) {
  test(`${name} route has shared navigation, metadata, and correct current-page state`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(route!);
    const header = page.locator('[data-site-header]');
    await expect(header.getByRole('link', { name: name!, exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#main')).toHaveCount(1);
    await expect(page.locator('[data-site-footer]')).toBeVisible();
    expect(await page.title()).toContain('DrawnOut');
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
}
