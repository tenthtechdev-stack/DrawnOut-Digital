import { expect, test, type Page } from '@playwright/test';

async function footerProgress(page: Page, progress: number) {
  await page.locator('[data-site-footer]').evaluate((footer, progress) => {
    const box = footer.getBoundingClientRect();
    const top = box.top + window.scrollY;
    const start = top - window.innerHeight * 0.92;
    const end = top + box.height - window.innerHeight;
    window.scrollTo(0, start + (end - start) * progress);
  }, progress);
  await expect
    .poll(async () =>
      Number(await page.locator('[data-site-footer]').getAttribute('data-footer-progress')),
    )
    .toBeCloseTo(progress, 1);
  await page.waitForTimeout(500);
}

async function composition(page: Page) {
  return page.locator('[data-site-footer]').evaluate((footer) => {
    const signature = footer.querySelector<HTMLElement>('[data-footer-signature]')!;
    const signatureStyle = getComputedStyle(signature);
    const layer = (selector: string) => {
      const element = footer.querySelector<HTMLElement>(selector)!;
      const style = getComputedStyle(element);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return {
        y: matrix.m42,
        identity: matrix.isIdentity,
        opacity: Number(style.opacity),
      };
    };
    return {
      hand: layer('[data-signature-hand]'),
      plaque: layer('[data-signature-plaque]'),
      scale: new DOMMatrixReadOnly(signatureStyle.transform).m11,
      footerHeight: footer.getBoundingClientRect().height,
      documentHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

async function expectArtwork(page: Page) {
  const footer = page.locator('[data-site-footer]');
  await expect(footer.locator('[data-signature-artwork]')).toHaveAttribute(
    'data-signature-asset',
    'separated-raster-prototype',
  );
  await expect(footer.locator('[data-signature-composite], [data-signature-frame]')).toHaveCount(0);
  const images = footer.locator('img');
  await expect(images).toHaveCount(2);
  for (const selector of ['[data-signature-hand]', '[data-signature-plaque]']) {
    const image = footer.locator(`${selector} img`);
    await expect(image).toHaveCount(1);
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty('complete', true);
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
}

function expectAssembled(state: Awaited<ReturnType<typeof composition>>) {
  expect(state.hand).toEqual({ y: 0, identity: true, opacity: 1 });
  expect(state.plaque).toEqual(state.hand);
}

for (const width of [390, 768, 1440]) {
  test(`signature footer hand rises, plaque descends, and both reverse without moving layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/bunzo');
    await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-motion', 'ready');
    await page.evaluate(() => document.fonts.ready);
    await footerProgress(page, 0.96);
    await expectArtwork(page);
    await footerProgress(page, 0.08);
    const beginning = await composition(page);
    await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-phase', 'arrive');
    await footerProgress(page, 0.55);
    const assembled = await composition(page);
    await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-phase', 'hold');
    await footerProgress(page, 0.96);
    const expanded = await composition(page);
    await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-phase', 'expand');
    await footerProgress(page, 0.08);
    const reversed = await composition(page);
    expect(beginning.hand.y).toBeGreaterThan(30);
    expect(beginning.plaque.y).toBeLessThan(-20);
    expect(beginning.hand.identity).toBe(false);
    expect(beginning.plaque.identity).toBe(false);
    expectAssembled(assembled);
    expect(assembled.scale).toBe(1);
    expect(expanded.scale).toBeGreaterThan(assembled.scale + 0.1);
    expectAssembled(expanded);
    for (const layer of ['hand', 'plaque'] as const) {
      expect(reversed[layer].y).toBeCloseTo(beginning[layer].y, 0);
      expect(reversed[layer].opacity).toBeCloseTo(beginning[layer].opacity, 2);
    }
    expect(reversed.scale).toBeCloseTo(beginning.scale, 1);
    for (const state of [beginning, assembled, expanded, reversed]) {
      expect(state.footerHeight).toBeCloseTo(beginning.footerHeight, 0);
      expect(state.documentHeight).toBeCloseTo(beginning.documentHeight, 0);
      expect(state.overflow).toBe(false);
    }
    const contact = page
      .locator('[data-site-footer]')
      .getByRole('link', { name: "Tell Us What You're Thinking" });
    await contact.focus();
    await expect(contact).toBeFocused();
    await contact.press('Enter');
    await expect(page).toHaveURL('/contact');
  });
}

test('footer reduced-motion preference restores composed static artwork and working navigation', async ({
  page,
}) => {
  await page.goto('/work');
  await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-motion', 'ready');
  await footerProgress(page, 0.12);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-motion', 'static');
  await expect(page.locator('[data-site-footer]')).not.toHaveAttribute('data-footer-progress');
  const state = await composition(page);
  expectAssembled(state);
  expect(state.scale).toBe(1);
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await expectArtwork(page);
  const link = page
    .locator('[data-site-footer] nav')
    .getByRole('link', { name: 'Work', exact: true });
  await link.focus();
  await expect(link).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-site-footer]')).toHaveAttribute('data-footer-motion', 'ready');
});

test('footer remains composed with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/work/bunzo');
  const footer = page.locator('[data-site-footer]');
  await footer.scrollIntoViewIfNeeded();
  await expectArtwork(page);
  expectAssembled(await composition(page));
  const contact = footer.getByRole('link', { name: "Tell Us What You're Thinking" });
  await contact.click();
  await expect(page).toHaveURL('/contact');
  await context.close();
});

test('footer stays available when the animation libraries fail to load', async ({ page }) => {
  await page.route(/gsap|ScrollTrigger/, (route) => route.abort());
  await page.goto('/work');
  const footer = page.locator('[data-site-footer]');
  await expect(footer).toHaveAttribute('data-footer-motion', 'static');
  await footer.scrollIntoViewIfNeeded();
  await expectArtwork(page);
  expectAssembled(await composition(page));
  await expect(footer.getByRole('heading', { name: /Have a good idea/ })).toBeVisible();
  await expect(footer.getByRole('link', { name: "Tell Us What You're Thinking" })).toBeVisible();
});
