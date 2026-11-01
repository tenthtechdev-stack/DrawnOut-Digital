import { expect, test, type Page } from '@playwright/test';

const overlay = '[data-signature-intro-overlay]';

async function fullStoryboard(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-mode', 'full');
  await expect(page.locator(overlay)).toBeVisible();
  const observations = await page.evaluate(async () => {
    const html = document.documentElement;
    const scene = document.querySelector<HTMLElement>('[data-signature-intro-overlay]')!;
    const name = scene.querySelector<HTMLElement>('[data-intro-name]')!;
    const wave = scene.querySelector<SVGPathElement>('[data-intro-wave]')!;
    const hand = scene.querySelector<HTMLElement>('[data-signature-hand]')!;
    const plaque = scene.querySelector<HTMLElement>('[data-signature-plaque]')!;
    const visible: number[] = [];
    let partialWave = false;
    let partialWord = false;
    let sixRevealed = false;
    let independentEntrance = false;
    let wordGeometry: { left: number; width: number; bottom: number; fontSize: number } | null =
      null;
    await new Promise<void>((resolve) => {
      const sample = () => {
        const style = getComputedStyle(scene);
        const bounds = scene.getBoundingClientRect();
        if (
          !scene.hidden &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.1 &&
          bounds.width >= innerWidth - 1 &&
          bounds.height >= innerHeight - 1
        )
          visible.push(performance.now());
        const remaining = parseFloat(getComputedStyle(wave).strokeDashoffset);
        if (remaining > 0.05 && remaining < 0.95) partialWave = true;
        const wordStyle = getComputedStyle(name);
        if (
          !scene.hidden &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.1 &&
          wordStyle.clipPath.includes('%') &&
          Number(wordStyle.opacity) > 0.9
        ) {
          partialWord = true;
          const box = name.getBoundingClientRect();
          wordGeometry = {
            left: box.left,
            width: box.width,
            bottom: box.bottom,
            fontSize: parseFloat(wordStyle.fontSize),
          };
        }
        const art = [...scene.querySelectorAll<HTMLImageElement>('[data-intro-artwork]')];
        if (
          art.length === 6 &&
          art.every(
            (image) =>
              image.complete &&
              image.naturalWidth > 0 &&
              Number(getComputedStyle(image).opacity) > 0.9,
          )
        )
          sixRevealed = true;
        const signature = scene.querySelector<HTMLElement>('[data-intro-signature]')!;
        if (Number(getComputedStyle(signature).opacity) > 0.9) {
          const handTransform = getComputedStyle(hand).transform;
          const plaqueTransform = getComputedStyle(plaque).transform;
          const handY = handTransform === 'none' ? 0 : new DOMMatrixReadOnly(handTransform).m42;
          const plaqueY =
            plaqueTransform === 'none' ? 0 : new DOMMatrixReadOnly(plaqueTransform).m42;
          if (handY > 5 && plaqueY < -5) independentEntrance = true;
        }
        if (['completed', 'skipped'].includes(html.dataset.signatureIntro ?? '')) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    return {
      mode: html.dataset.signatureIntroMode,
      reason: html.dataset.signatureIntroReason,
      started: Number(html.dataset.signatureIntroStarted),
      ended: Number(html.dataset.signatureIntroEnded),
      visibleFrames: visible.length,
      visibleMs: (visible.at(-1) ?? 0) - (visible[0] ?? 0),
      partialWave,
      partialWord,
      sixRevealed,
      independentEntrance,
      wordGeometry: wordGeometry as {
        left: number;
        width: number;
        bottom: number;
        fontSize: number;
      } | null,
      viewport: { width: innerWidth, height: innerHeight },
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(observations.mode).toBe('full');
  expect(observations.reason).toBe('complete');
  expect(observations.ended).toBeLessThanOrEqual(5000);
  expect(observations.ended - observations.started).toBeGreaterThanOrEqual(4190);
  expect(observations.visibleFrames).toBeGreaterThan(20);
  expect(observations.visibleMs).toBeGreaterThan(3000);
  expect(observations.partialWave).toBe(true);
  expect(observations.partialWord).toBe(true);
  expect(observations.sixRevealed).toBe(true);
  expect(observations.independentEntrance).toBe(true);
  expect(observations.wordGeometry).not.toBeNull();
  expect(observations.wordGeometry!.left).toBeLessThan(observations.viewport.width * 0.1);
  expect(observations.wordGeometry!.width).toBeGreaterThan(observations.viewport.width * 0.6);
  expect(observations.wordGeometry!.fontSize).toBeGreaterThan(observations.viewport.width * 0.14);
  expect(observations.wordGeometry!.bottom).toBeGreaterThan(observations.viewport.height * 0.5);
  expect(observations.overflow).toBe(false);
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('[data-intro-replay]')).toHaveCount(0);
  return observations;
}

for (const width of [390, 1440]) {
  test(`optimized production visibly plays full cold/refresh/Home journeys at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(60_000);
    // A fresh context provides a genuinely cold browser cache. No network or
    // animation values are mocked in this strict acceptance path.
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: width < 768 ? 844 : 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    try {
      const page = await context.newPage();
      const results = [];
      await page.goto('/', { waitUntil: 'commit' });
      results.push({ arrival: 'cold direct', ...(await fullStoryboard(page)) });
      for (const refresh of [1, 2]) {
        await page.reload({ waitUntil: 'commit' });
        results.push({ arrival: `refresh ${refresh}`, ...(await fullStoryboard(page)) });
      }
      for (const route of ['/contact', '/work']) {
        // Real ordinary internal link, independent of desktop/mobile menu layout.
        await page
          .locator('[data-site-footer] nav[aria-label="Footer navigation"] a')
          .filter({ hasText: route === '/contact' ? 'Contact' : 'Work' })
          .click();
        await expect(page).toHaveURL(route);
        await expect(page.locator(overlay)).toBeHidden();
        await expect(page.locator('html')).toHaveAttribute(
          'data-signature-intro-reason',
          'internal-navigation',
        );
        await page.locator('[data-site-header] a[aria-label="DrawnOut Digital home"]').click();
        await expect(page).toHaveURL('/');
        results.push({ arrival: `${route} Home`, ...(await fullStoryboard(page)) });
      }
      await test.info().attach(`production-journeys-${width}`, {
        body: JSON.stringify(results),
        contentType: 'application/json',
      });
    } finally {
      await context.close();
    }
  });
}

test('failed storyboard clock initialization reveals a working homepage', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.getAnimations = () => {
      throw new Error('Animation clock unavailable');
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
  await expect(page.locator('html')).toHaveAttribute(
    'data-signature-intro-reason',
    'animation-error',
  );
  await expect(page.locator('[data-signature-intro-overlay]')).toBeHidden();
  await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
});
