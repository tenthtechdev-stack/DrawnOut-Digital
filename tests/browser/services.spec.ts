import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { servicePages } from '../../src/data/services';

for (const width of [390, 768, 1440]) {
  for (const service of servicePages) {
    test(`${service.slug} copy, FAQs, navigation and accessibility at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/services/${service.slug}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveTitle(service.seoTitle);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        service.description,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(service.headline);
      await expect(page.locator('main h1')).toHaveCount(1);
      for (const section of service.sections) {
        await expect(
          page.getByRole('heading', { name: section.heading, exact: true }),
        ).toBeVisible();
        await expect(page.locator('main')).toContainText(section.body);
      }
      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb', exact: true });
      await expect(crumbs.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute(
        'href',
        '/',
      );
      await expect(crumbs.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute(
        'href',
        '/services',
      );
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(service.title);
      const faq = page.locator('[data-service-faq]');
      await expect(faq.locator('details')).toHaveCount(5);
      for (let i = 0; i < service.faqs.length; i += 1) {
        const details = faq.locator('details').nth(i);
        const summary = details.locator('summary');
        await summary.focus();
        await expect(summary).toBeFocused();
        expect(await summary.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe(
          'none',
        );
        await summary.press('Enter');
        await expect(details).toHaveAttribute('open', '');
        await expect(details.locator('p')).toHaveText(service.faqs[i]!.answer);
        await summary.press('Space');
        await expect(details).not.toHaveAttribute('open');
      }
      await expect(page.locator('[data-service-enquiry]')).toHaveAttribute('href', '/contact');
      await expect(
        page.getByRole('navigation', { name: 'Explore other services' }).locator('li a'),
      ).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(scan.violations).toEqual([]);
    });
  }
}

test('homepage and overview links open service pages and the enquiry CTA reaches Contact', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const service of servicePages) {
    await expect(page.locator(`[data-services] a[href="/services/${service.slug}"]`)).toHaveCount(
      1,
    );
    await expect(
      page.locator(`[data-capabilities] a[href="/services/${service.slug}"]`),
    ).toHaveCount(1);
  }
  await page.locator('[data-services] a[href="/services/brand-identity"]').click();
  await expect(page).toHaveURL('/services/brand-identity');
  await page.locator('[data-service-enquiry]').click();
  await expect(page).toHaveURL('/contact');
  await expect(page.locator('[data-enquiry-form]')).not.toHaveAttribute('action');
  await page.goto('/services');
  for (const service of servicePages)
    await expect(page.locator(`main a[href="/services/${service.slug}"]`)).toHaveCount(1);
});

test('service copy, native FAQ controls and navigation work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/services/digital-design');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const details = page.locator('[data-service-faq] details').nth(1);
  await details.locator('summary').click();
  await expect(details.locator('p')).toBeVisible();
  await expect(details).toContainText('Not automatically.');
  await page.locator('[data-service-enquiry]').click();
  await expect(page).toHaveURL('/contact');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Have something in mind?');
  await context.close();
});
