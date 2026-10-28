import { expect, test, type Page } from '@playwright/test';

const overlay = '[data-signature-intro-overlay]';

test('a zero-position scroll notification preserves the loader while actual scrolling skips it', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.evaluate(() => window.scrollTo(0, 80));
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
  await expect(page.locator(overlay)).toBeHidden();
});

test('a missing route opens error recovery immediately without a branded loader', async ({
  page,
}) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator(overlay)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
});

test('readable but unwritable session storage keeps navigation immediately available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage writes blocked', 'QuotaExceededError');
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-signature-intro-reason',
    'storage-unavailable',
  );
  await expect(page.locator(overlay)).toBeHidden();
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
});

async function completed(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'completed');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-reason', 'complete');
  const ended = Number(await page.locator('html').getAttribute('data-signature-intro-ended'));
  const started = Number(await page.locator('html').getAttribute('data-signature-intro-started'));
  expect(ended - started).toBeGreaterThanOrEqual(4190);
  expect(ended).toBeLessThanOrEqual(5000);
  await expect(page.locator(overlay)).toBeHidden();
  return ended;
}

for (const width of [390, 1440]) {
  test(`a fresh load and both consecutive refreshes play the full loop at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: width < 768 ? 844 : 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    try {
      const page = await context.newPage();
      await page.addInitScript(() => sessionStorage.setItem('drawnout-loop-seen', '1'));
      await page.goto('/', { waitUntil: 'commit' });
      const timings = [await completed(page)];
      for (let refresh = 0; refresh < 2; refresh += 1) {
        await page.reload({ waitUntil: 'commit' });
        timings.push(await completed(page));
        expect(
          await page.evaluate(
            () =>
              (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type,
          ),
        ).toBe('reload');
      }
      await test.info().attach(`refreshes-${width}`, {
        body: JSON.stringify({ width, completionsMs: timings }),
        contentType: 'application/json',
      });
    } finally {
      await context.close();
    }
  });
}

test('a manual same-session revisit replays while clicked internal routes and Work filters do not', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Escape');
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator('html')).toHaveAttribute(
    'data-signature-intro-reason',
    'internal-navigation',
  );
  await expect(page.locator(overlay)).toBeHidden();
  const initialDocument = await page.evaluate(() => performance.timeOrigin);
  await page.locator('[data-filter="packaging"]').click();
  await expect(page.locator('[data-filter="packaging"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(initialDocument);
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation'))).toBeNull();
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.keyboard.press('Escape');
});

test('a scrolled mobile refresh preserves the browser position and skips the loader', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
    await expect(page.locator(overlay)).toBeHidden();
    await expect.poll(() => page.evaluate(() => Math.abs(scrollY - 500))).toBeLessThan(10);
  } finally {
    await context.close();
  }
});

for (const route of ['/work', '/work/bunzo', '/contact', '/services', '/about']) {
  test(`direct ${route} loading is skippable without a homepage handoff`, async ({ page }) => {
    await page.addInitScript(() => {
      Reflect.set(window, '__testHeroHandoffs', 0);
      window.addEventListener('signature:intro-handoff', () =>
        Reflect.set(
          window,
          '__testHeroHandoffs',
          Number(Reflect.get(window, '__testHeroHandoffs')) + 1,
        ),
      );
    });
    await page.goto(route, { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
    if (route === '/contact') await completed(page);
    else await page.keyboard.press('Escape');
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('[data-hero]')).toHaveCount(0);
    expect(await page.evaluate(() => Reflect.get(window, '__testHeroHandoffs'))).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.dataset.heroEntrance),
    ).toBeUndefined();
  });
}

test('browser back/forward preserves content and scroll without restarting the loader', async ({
  page,
}) => {
  await page.goto('/#main');
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.evaluate(() => {
    // Capture the browser's actual departure position; clicking an offscreen
    // header link can itself scroll it into view before navigation.
    window.addEventListener(
      'pagehide',
      () => sessionStorage.setItem('__test-history-scroll', String(scrollY)),
      { once: true },
    );
  });
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page.locator(overlay)).toBeHidden();
  const scroll = await page.evaluate(() => Number(sessionStorage.getItem('__test-history-scroll')));
  expect(scroll).toBeGreaterThan(0);
  await page.goBack();
  await expect(page).toHaveURL('/work');
  await expect(page.locator(overlay)).toBeHidden();
  await expect
    .poll(() => page.evaluate((departure) => Math.abs(scrollY - departure), scroll))
    .toBeLessThan(10);
  await page.goForward();
  await expect(page).toHaveURL('/contact');
  await expect(page.locator(overlay)).toBeHidden();
});

for (const intent of [
  { label: 'stale matching', to: '/', age: 60000 },
  { label: 'fresh mismatched', to: '/contact', age: 0 },
]) {
  test(`a ${intent.label} navigation token cannot suppress a direct load`, async ({ page }) => {
    await page.addInitScript(
      ({ to, age }) =>
        sessionStorage.setItem(
          'drawnout-loop-navigation',
          JSON.stringify({ to, at: Date.now() - age }),
        ),
      intent,
    );
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
    expect(
      await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation')),
    ).toBeNull();
    await page.keyboard.press('Escape');
  });
}

test('new-tab and modified links do not leave a same-tab suppression token', async ({ page }) => {
  await page.goto('/#main');
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Work', exact: true })
    .evaluate((link) => {
      // Registered after the boot listener: its modifier guard sees an uncanceled
      // event, then this later listener prevents the test from opening a real tab.
      window.addEventListener('click', (event) => event.preventDefault(), { once: true });
      link.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
      );
    });
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation'))).toBeNull();
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Work', exact: true })
    .evaluate((link) => {
      (link as HTMLAnchorElement).target = '_blank';
      window.addEventListener('click', (event) => event.preventDefault(), { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation'))).toBeNull();
});

for (const mode of ['reduced', 'save-data', 'hidden'] as const) {
  test(`development replay cannot bypass ${mode}`, async ({ page }) => {
    if (mode === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
    else
      await page.addInitScript((preference) => {
        if (preference === 'save-data')
          Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
        else Object.defineProperty(document, 'hidden', { get: () => true });
      }, mode);
    await page.goto('/?showIntro=1');
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute(
      'data-signature-intro-reason',
      mode === 'reduced' ? 'reduced-motion' : mode,
    );
  });
}

test('development replay link starts a new full sequence without a production preference override', async ({
  page,
}) => {
  await page.goto('/#main');
  await page.locator('[data-intro-replay]').click();
  await expect(page).toHaveURL('/?showIntro=1');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-debug', 'replay');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.keyboard.press('Escape');
});

for (const availableAt of [620, 850]) {
  test(`stylesheet readiness at ${availableAt}ms respects the full-sequence navigation budget`, async ({
    page,
  }) => {
    // Keep actual CSS and animation clocks intact; model a late stylesheet-ready
    // signal independently of slow test-runner network/compilation overhead.
    await page.addInitScript((readyAt) => {
      const read = CSSStyleDeclaration.prototype.getPropertyValue;
      CSSStyleDeclaration.prototype.getPropertyValue = function (name) {
        if (name === '--intro-styles-ready' && performance.now() < readyAt) return '';
        return read.call(this, name);
      };
    }, availableAt);
    await page.goto('/', { waitUntil: 'commit' });
    if (availableAt === 620) {
      await completed(page);
      expect(
        Number(await page.locator('html').getAttribute('data-signature-intro-started')),
      ).toBeGreaterThanOrEqual(620);
    } else {
      await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
      await expect(page.locator(overlay)).toBeHidden();
      await expect(page.locator(overlay)).toHaveAttribute('hidden', '');
      await page.waitForTimeout(1000);
      await expect(page.locator(overlay)).toBeHidden();
      await expect(page.locator('main h1')).toBeVisible();
    }
  });
}

test('prevented same-tab clicks and same-document hash actions leave no navigation intent', async ({
  page,
}) => {
  await page.goto('/#main');
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Work', exact: true })
    .evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault(), { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation'))).toBeNull();
  await page.locator('.skip-link').evaluate((link) => (link as HTMLAnchorElement).click());
  expect(await page.evaluate(() => sessionStorage.getItem('drawnout-loop-navigation'))).toBeNull();
});

test('missing stylesheet readiness never reveals the loader or blocks content', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const read = CSSStyleDeclaration.prototype.getPropertyValue;
    CSSStyleDeclaration.prototype.getPropertyValue = function (name) {
      return name === '--intro-styles-ready' ? '' : read.call(this, name);
    };
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
  await expect(page.locator('html')).toHaveAttribute(
    'data-signature-intro-reason',
    'initialization-timeout',
  );
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(overlay)).toHaveAttribute('hidden', '');
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator('main h1')).toBeVisible();
});

test('development replay keeps deep-link content visible', async ({ page }) => {
  await page.goto('/work?showIntro=1#main');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-reason', 'deep-link');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
});
