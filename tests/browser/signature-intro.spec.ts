import { expect, test, type Page } from '@playwright/test';

const overlay = '[data-signature-intro-overlay]';

async function openIntro(page: Page) {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await expect(page.locator(overlay)).toBeVisible();
}

async function expectSkipped(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
}

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`opening completes automatically within five navigation seconds at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openIntro(page);
    const observations = await page.evaluate(async () => {
      let layoutShiftSum = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!Reflect.get(entry, 'hadRecentInput'))
            layoutShiftSum += Number(Reflect.get(entry, 'value'));
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      const scene = document.querySelector<HTMLElement>('[data-signature-intro-overlay]')!;
      const path = document.querySelector('[data-intro-wave]')!;
      const letters = [...document.querySelectorAll('[data-intro-name] span')];
      const signature = document.querySelector('[data-intro-signature]')!;
      let lastVisible = 0;
      let sawPartialWave = false;
      let sawOrderedLetters = false;
      let sawSignature = false;
      await new Promise<void>((resolve) => {
        function sample() {
          const style = getComputedStyle(scene);
          if (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) > 0
          )
            lastVisible = performance.now();
          const wave = parseFloat(getComputedStyle(path).strokeDashoffset);
          if (wave > 0.05 && wave < 0.95) sawPartialWave = true;
          if (
            Number(getComputedStyle(letters[0]!).opacity) > 0.95 &&
            Number(getComputedStyle(letters.at(-1)!).opacity) < 0.05 &&
            wave > 0 &&
            wave < 1
          )
            sawOrderedLetters = true;
          if (Number(getComputedStyle(signature).opacity) > 0.95) sawSignature = true;
          if (['completed', 'skipped'].includes(document.documentElement.dataset.signatureIntro!))
            resolve();
          else requestAnimationFrame(sample);
        }
        sample();
      });
      observer.disconnect();
      return {
        layoutShiftSum,
        lastVisible,
        ended: Number(document.documentElement.dataset.signatureIntroEnded),
        reason: document.documentElement.dataset.signatureIntroReason,
        sawPartialWave,
        sawOrderedLetters,
        sawSignature,
      };
    });
    await test.info().attach(`intro-${width}`, {
      body: JSON.stringify(observations),
      contentType: 'application/json',
    });
    expect(observations.layoutShiftSum).toBeLessThan(0.05);
    expect(observations.reason).toBe('complete');
    expect(observations.ended).toBeLessThanOrEqual(5000);
    expect(observations.lastVisible).toBeLessThanOrEqual(5000);
    expect(observations.sawPartialWave).toBe(true);
    expect(observations.sawOrderedLetters).toBe(true);
    expect(observations.sawSignature).toBe(true);
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const key of ['Escape', 'Enter', 'Space', 'Tab']) {
  test(`${key} immediately bypasses the opening`, async ({ page }) => {
    await openIntro(page);
    const before = await page.evaluate(() => performance.now());
    await page.keyboard.press(key);
    await expectSkipped(page);
    const ended = Number(await page.locator('html').getAttribute('data-signature-intro-ended'));
    expect(ended - before).toBeLessThan(250);
  });
}

test('wheel bypass preserves the original native scroll input', async ({ page }) => {
  await openIntro(page);
  await page.mouse.wheel(0, 260);
  await expectSkipped(page);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test('visible skip control immediately reveals the homepage', async ({ page }) => {
  await openIntro(page);
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expectSkipped(page);
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
});

test('an underlying navigation click keeps its first action and the intro never replays', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openIntro(page);
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'DrawnOut Digital home' })
    .click();
  await expect(page).toHaveURL('/');
  await expect(page.locator(overlay)).toBeHidden();
  await page.reload();
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-seen'))).toBe('1');
});

test('direct case and hash destinations bypass the intro', async ({ page }) => {
  await page.goto('/work/bunzo');
  await expect(page.locator(overlay)).toHaveCount(0);
  await expect(page.locator('main h1')).toContainText('Bunzo');
  await page.goto('/#main');
  await expect(page.locator(overlay)).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.dataset.signatureIntro),
  ).toBeUndefined();
});

test('reduced motion reaches the homepage immediately and remains readable without JavaScript', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4321/');
    await expect(staticPage.locator(overlay)).toBeHidden();
    await expect(staticPage.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
    await expect(staticPage.locator('[data-work] a[href^="/work/"]').first()).toBeVisible();
  } finally {
    await context.close();
  }
});

test('data saving bypasses the opening', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
  });
  await page.goto('/');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
});

test('an opted-out first homepage visit never introduces the intro on an internal return', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(overlay)).toBeHidden();
  await page.goto('/work');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-seen'))).toBe('1');
});

test('unavailable session storage fails open', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    };
  });
  await page.goto('/');
  await expectSkipped(page);
  await expect(page.locator('[data-work] a[href^="/work/"]').first()).toBeVisible();
});

test('a mobile tap immediately bypasses the intro', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4321',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await openIntro(page);
    const before = await page.evaluate(() => performance.now());
    await page.touchscreen.tap(195, 300);
    await expectSkipped(page);
    expect(
      Number(await page.locator('html').getAttribute('data-signature-intro-ended')) - before,
    ).toBeLessThan(250);
  } finally {
    await context.close();
  }
});

test('live reduced-motion preference immediately cancels the opening', async ({ page }) => {
  await openIntro(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectSkipped(page);
});

test('delayed optional module never delays or replays the inline opening', async ({ page }) => {
  await page.route('**/src/scripts/signature-intro.ts*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5500));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'completed');
  const ended = Number(await page.locator('html').getAttribute('data-signature-intro-ended'));
  expect(ended).toBeLessThanOrEqual(5000);
  await page.waitForTimeout(1800);
  await expect(page.locator(overlay)).toBeHidden();
  expect(Number(await page.locator('html').getAttribute('data-signature-intro-ended'))).toBe(ended);
});

test('failed signature media reveals the working homepage', async ({ page }) => {
  await page.route('**/*hand-emblem-reference*', (route) => route.abort());
  await page.goto('/');
  await expectSkipped(page);
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
});
