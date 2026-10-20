import { expect, test } from '@playwright/test';

for (const concept of ['a', 'b']) {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    test(`concept ${concept}: usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(`/concepts/${concept}`);
      await expect(page.locator('h1')).toHaveText('We make ideasimpossibleto ignore.');
      await expect(page.getByRole('link', { name: 'Explore Our Work' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Have Something in Mind?' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const heading = await page.locator('h1').boundingBox();
      expect(heading?.x).toBeGreaterThanOrEqual(0);
      expect((heading?.x ?? 0) + (heading?.width ?? 0)).toBeLessThanOrEqual(width);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(
          await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        ).toBeGreaterThan(0);
      }
      await page.getByRole('link', { name: 'Explore Our Work' }).click();
      await expect(page).toHaveURL(/#work$/);
      if (width === 390 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `artifacts/concept-${concept}-${width}.png`,
          fullPage: true,
        });
        await page.screenshot({ path: `artifacts/concept-${concept}-${width}-hero.png` });
      }
    });
  }
  test(`concept ${concept}: no JavaScript and reduced motion remain readable`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4321/concepts/${concept}`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Have a good idea/ })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await context.close();
  });
}

test('concept switch changes the layout and preserves the supplied copy', async ({ page }) => {
  await page.goto('/concepts/a');
  await page.getByRole('link', { name: 'B — Studio Edit' }).click();
  await expect(page).toHaveURL('/concepts/b');
  await expect(page.locator('.capability-strip')).toBeVisible();
  await expect(page.locator('.hero-feature')).toBeVisible();
  await expect(page.getByRole('link', { name: 'B — Studio Edit' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
