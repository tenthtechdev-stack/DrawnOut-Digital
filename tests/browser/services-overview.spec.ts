import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { serviceIndex } from '../../src/data/service-index';
import { servicePages } from '../../src/data/services';

const services = Object.entries(serviceIndex);
const overview = '[data-services-overview]';
const chapters = `${overview} [data-service-chapter]`;
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });

async function readableText(element: Locator, width: number) {
  const state = await element.evaluate((node) => {
    const style = getComputedStyle(node);
    const range = document.createRange();
    range.selectNodeContents(node);
    return {
      opacity: Number(style.opacity),
      visibility: style.visibility,
      rects: [...range.getClientRects()].map(({ left, right }) => ({ left, right })),
    };
  });
  expect(state.visibility).toBe('visible');
  expect(state.opacity).toBe(1);
  expect(state.rects.length).toBeGreaterThan(0);
  for (const rect of state.rects) {
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(width + 1);
  }
}

async function expectCompleteOverview(page: Page, width: number) {
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('[data-services-hero] h1')).toHaveText('We think beyond the brief.');
  await expect(page.locator(chapters)).toHaveCount(5);
  await expect(page.locator(overview).getByRole('tab')).toHaveCount(0);
  await expect(page.locator(overview).getByRole('combobox')).toHaveCount(0);
  await expect(page.locator(overview).getByRole('button')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  for (const [index, [slug, service]] of services.entries()) {
    const chapter = page.locator(chapters).nth(index);
    await expect(chapter).toHaveAttribute('id', slug);
    const heading = chapter.getByRole('heading', { level: 2, name: service.title, exact: true });
    await expect(heading).toBeVisible();
    await readableText(heading, width);
    await expect(chapter).toContainText(service.headline);
    const link = chapter.getByRole('link');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', `/services/${slug}`);
    await expect(link).toHaveAccessibleName(new RegExp(service.title.replace(/[&]/g, '&')));
    await readableText(link, width);
    const artwork = chapter.locator('[data-service-chapter-art]');
    await expect(artwork).toBeVisible();
    const box = await artwork.boundingBox();
    expect(box!.width).toBeGreaterThan(width < 768 ? 200 : 280);
    expect(box!.height).toBeGreaterThan(180);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    await expect(chapter).toContainText(/illustrative study/i);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    width,
  );
}

for (const width of [320, 390, 768, 1440]) {
  test(`five complete editorial chapters, canonical links and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    await expectCompleteOverview(page, width);
    if (width === 1440) {
      const geometries = await page.locator(chapters).evaluateAll((nodes) =>
        nodes.map((node) => {
          const heading = node.querySelector('h2')!.getBoundingClientRect();
          const art = node.querySelector('[data-service-chapter-art]')!.getBoundingClientRect();
          return { height: node.getBoundingClientRect().height, textBeforeArt: heading.x < art.x };
        }),
      );
      expect(new Set(geometries.map(({ textBeforeArt }) => textBeforeArt)).size).toBe(2);
      for (const geometry of geometries) expect(geometry.height).toBeGreaterThanOrEqual(570);
    }
    const links = page.locator(`${chapters} a`);
    await links.first().focus();
    for (let index = 0; index < services.length; index += 1) {
      const link = links.nth(index);
      await expect(link).toBeFocused();
      const focus = await link.evaluate((node) => ({
        style: getComputedStyle(node).outlineStyle,
        width: parseFloat(getComputedStyle(node).outlineWidth),
        height: node.getBoundingClientRect().height,
      }));
      expect(focus.style).not.toBe('none');
      expect(focus.width).toBeGreaterThanOrEqual(2);
      expect(focus.height).toBeGreaterThanOrEqual(44);
      if (index < services.length - 1) await page.keyboard.press('Tab');
    }
    const scan = await new AxeBuilder({ page })
      .include(overview)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`all five chapter links open the original service content and FAQs at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const service of servicePages) {
      await page.goto('/services');
      const link = page.locator(`${overview} a[href="/services/${service.slug}"]`);
      await link.focus();
      await link.press('Enter');
      await expect(page).toHaveURL(`/services/${service.slug}`);
      await expect(page.locator('main h1')).toHaveText(service.headline);
      for (const section of service.sections) {
        await expect(page.locator('main')).toContainText(section.heading);
        await expect(page.locator('main')).toContainText(section.body);
      }
      const faq = page.locator('[data-service-faq] details');
      await expect(faq).toHaveCount(5);
      for (let index = 0; index < service.faqs.length; index += 1) {
        await expect(faq.nth(index).locator('summary')).toHaveText(service.faqs[index]!.question);
        await expect(faq.nth(index).locator('p')).toHaveText(service.faqs[index]!.answer);
      }
      await faq.first().locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(faq.first()).toHaveAttribute('open', '');
      await expect(faq.first().locator('p')).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Breadcrumb', exact: true })
        .getByRole('link', { name: 'Services', exact: true })
        .click();
      await expect(page).toHaveURL('/services');
      await expect(page.locator(chapters)).toHaveCount(5);
    }
  });
}

for (const mode of ['no-javascript', 'failed-bundles', 'save-data'] as const) {
  test(`${mode} preserves the complete overview and native service navigation`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(390),
      javaScriptEnabled: mode !== 'no-javascript',
    });
    if (mode === 'save-data')
      await context.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
      });
    const page = await context.newPage();
    if (mode === 'failed-bundles')
      await page.route('**/*', async (route) =>
        route.request().resourceType() === 'script' ? route.abort('failed') : route.continue(),
      );
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    await expectCompleteOverview(page, 390);
    const running = await page
      .locator(overview)
      .evaluate(
        (node) =>
          node
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === 'running').length,
      );
    expect(running).toBe(0);
    await page.locator(`${overview} a[href="/services/digital-design"]`).click();
    await expect(page).toHaveURL('/services/digital-design');
    const faq = page.locator('[data-service-faq] details').first();
    await faq.locator('summary').click();
    await expect(faq.locator('p')).toBeVisible();
    await context.close();
  });
}

for (const width of [390, 1440]) {
  test(`native forward and reverse scrolling keep all five chapters readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    const measurements = [];
    for (const index of [0, 1, 2, 3, 4, 3, 2, 1, 0]) {
      const chapter = page.locator(chapters).nth(index);
      // Scroll the document to actual chapter geometry; no application timeline
      // is sought, no wheel event is consumed and no CSS state is replaced.
      const expected = await chapter.evaluate((node) => {
        const target = node.getBoundingClientRect().top + scrollY - 100;
        window.scrollTo({ top: target, behavior: 'instant' });
        return target;
      });
      await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(expected, 0);
      await expect(chapter.getByRole('heading', { level: 2 })).toBeInViewport();
      const artwork = chapter.locator('[data-service-chapter-art]');
      await page.waitForTimeout(60);
      const atEntry = await artwork.evaluate((node) => ({
        opacity: Number(getComputedStyle(node).opacity),
        transform: getComputedStyle(node).transform,
      }));
      await expect
        .poll(() => artwork.evaluate((node) => Number(getComputedStyle(node).opacity)))
        .toBe(1);
      const settled = await artwork.evaluate((node) => ({
        opacity: Number(getComputedStyle(node).opacity),
        transform: getComputedStyle(node).transform,
      }));
      expect(settled.opacity).toBeGreaterThanOrEqual(0.99);
      await readableText(chapter.getByRole('heading', { level: 2 }), width);
      const native = await chapter.evaluate((node) => ({
        position: getComputedStyle(node).position,
        spacer: Boolean(node.closest('.pin-spacer')),
        overflow: getComputedStyle(document.body).overflow,
        docWidth: document.documentElement.scrollWidth,
      }));
      expect(native.position).not.toBe('fixed');
      expect(native.position).not.toBe('sticky');
      expect(native.spacer).toBe(false);
      expect(native.overflow).not.toBe('hidden');
      expect(native.docWidth).toBeLessThanOrEqual(width);
      measurements.push({ index, expected, atEntry, settled });
    }
    expect(measurements.slice(0, 5).some(({ atEntry }) => atEntry.opacity < 0.999)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect
      .poll(() =>
        page
          .locator(overview)
          .evaluate(
            (node) =>
              node
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === 'running').length,
          ),
      )
      .toBe(0);
    await test.info().attach(`native-service-scroll-${width}`, {
      body: JSON.stringify(measurements),
      contentType: 'application/json',
    });
  });
}
