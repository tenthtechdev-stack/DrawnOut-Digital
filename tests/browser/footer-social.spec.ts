import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

const socialLinks = [
  ['Facebook', 'https://www.facebook.com/DrawnOutDigital/'],
  ['Instagram', 'https://www.instagram.com/drawnout_digital/'],
  ['LinkedIn', 'https://www.linkedin.com/company/drawnout-digital/'],
] as const;

async function expectFooterLinks(footer: Locator) {
  const social = footer.getByRole('navigation', { name: 'DrawnOut Digital social profiles' });
  await expect(social.getByRole('link')).toHaveCount(3);
  for (const [name, href] of socialLinks) {
    const link = social.getByRole('link', { name: `DrawnOut Digital on ${name}`, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toBeVisible();
    const icon = link.locator('svg');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(footer.locator('[data-footer-credit]')).toHaveText(
    'Designed and Developed by Tenth Tech',
  );
  await expect(footer.getByRole('link', { name: 'Tenth Tech', exact: true })).toHaveAttribute(
    'href',
    'https://www.thetenthtech.com/',
  );
  await expect(
    footer.getByRole('link', { name: 'official@drawnoutdigital.com', exact: true }),
  ).toHaveAttribute('href', 'mailto:official@drawnoutdigital.com');
  await expect(footer.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible();
  await expect(
    footer.getByRole('link', { name: "Tell Us What You're Thinking", exact: true }),
  ).toHaveAttribute('href', '/contact');
}

for (const width of [320, 390, 768, 1440]) {
  test(`footer social icons and exact development credit are usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact');
    await page.evaluate(() => document.fonts.ready);
    const footer = page.locator('[data-site-footer]');
    await footer.scrollIntoViewIfNeeded();
    await expectFooterLinks(footer);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );

    const social = footer.getByRole('navigation', { name: 'DrawnOut Digital social profiles' });
    const firstLink = social.getByRole('link').first();
    await firstLink.focus();
    for (const [index, [name]] of socialLinks.entries()) {
      const link = social.getByRole('link', { name: `DrawnOut Digital on ${name}`, exact: true });
      if (index > 0) await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      expect(await link.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    }
    await page.keyboard.press('Tab');
    const credit = footer.getByRole('link', { name: 'Tenth Tech', exact: true });
    await expect(credit).toBeFocused();
    expect(await credit.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    const visible = await credit.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight && !!hit && node.contains(hit);
    });
    expect(visible).toBe(true);
    const scan = await new AxeBuilder({ page })
      .include('[data-site-footer]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  });
}

test('footer social and attribution links remain usable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/work/bunzo');
  const footer = page.locator('[data-site-footer]');
  await footer.scrollIntoViewIfNeeded();
  await expectFooterLinks(footer);
  const credit = footer.getByRole('link', { name: 'Tenth Tech', exact: true });
  // Intercept navigation locally: this proves keyboard activation and the exact
  // destination, not external service availability or a hosted deployment.
  await page.route('https://www.thetenthtech.com/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Test destination</title><h1>Test destination</h1></html>',
    }),
  );
  await credit.focus();
  await credit.press('Enter');
  await expect(page).toHaveURL('https://www.thetenthtech.com/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test destination');
  await context.close();
});
