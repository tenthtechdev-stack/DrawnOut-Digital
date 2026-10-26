import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  for (const route of ['/', '/work', '/work/bunzo', '/contact']) {
    test(`signature WCAG scan ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
      const footer = page.locator('[data-site-footer]');
      const contact = footer.getByRole('link', { name: "Tell Us What You're Thinking" });
      await contact.focus();
      await expect(contact).toBeFocused();
      await expect(contact).toHaveAttribute('href', '/contact');
      await expect(footer.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible();
    });
  }
}

test('mobile menu remains accessible with the signature experience', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});
