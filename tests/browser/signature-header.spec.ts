import { expect, test, type Page } from '@playwright/test';

interface HeaderSample {
  time: number;
  mainTop: number;
  height: number;
  actionLeft: number;
  actionWidth: number;
  enhanced: boolean;
}
interface HeaderProbe {
  samples: HeaderSample[];
  layoutShiftSum: number;
  headerShiftSum: number;
}

async function observeHeader(page: Page) {
  await page.addInitScript(() => {
    const probe: HeaderProbe = { samples: [], layoutShiftSum: 0, headerShiftSum: 0 };
    Reflect.set(window, '__headerProbe', probe);
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (Reflect.get(entry, 'hadRecentInput')) continue;
          const value = Number(Reflect.get(entry, 'value'));
          probe.layoutShiftSum += value;
          const sources = Reflect.get(entry, 'sources') as { node?: Node }[];
          if (
            sources.some(({ node }) => {
              const element = node instanceof Element ? node : node?.parentElement;
              return Boolean(element?.closest('[data-site-header]'));
            })
          )
            probe.headerShiftSum += value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }
    function sample() {
      const header = document.querySelector<HTMLElement>('[data-site-header]');
      const main = document.querySelector<HTMLElement>('main');
      const actions = header?.querySelector<HTMLElement>('.header-actions');
      // Only measure painted, styled geometry, not the parser's incomplete tree.
      if (header && main && actions && getComputedStyle(header).position === 'sticky') {
        const action = actions.getBoundingClientRect();
        const next = {
          time: performance.now(),
          mainTop: main.getBoundingClientRect().top + scrollY,
          height: header.getBoundingClientRect().height,
          actionLeft: action.left,
          actionWidth: action.width,
          enhanced: header.hasAttribute('data-enhanced'),
        };
        const previous = probe.samples.at(-1);
        if (
          !previous ||
          Object.entries(next).some(
            ([key, value]) => key !== 'time' && value !== Reflect.get(previous, key),
          )
        )
          probe.samples.push(next);
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}

async function expectStableHeader(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
  const result = await page.evaluate(() => Reflect.get(window, '__headerProbe') as HeaderProbe);
  expect(result.samples.length).toBeGreaterThan(0);
  for (const key of ['mainTop', 'height', 'actionLeft', 'actionWidth'] as const) {
    const values = result.samples.map((sample) => sample[key]);
    expect(Math.max(...values) - Math.min(...values), `${label}: ${key}`).toBeLessThanOrEqual(0.5);
  }
  expect(result.headerShiftSum, `${label}: shifts attributed to header`).toBe(0);
  await test.info().attach(label, {
    body: JSON.stringify(result, null, 2),
    contentType: 'application/json',
  });
  return result;
}

for (const width of [320, 390]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`stable mobile header at ${width}px with ${reducedMotion}, reload and direct case`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion });
      await observeHeader(page);
      await page.goto('/');
      await expect(page.locator('[data-site-header]')).toHaveAttribute('data-enhanced', '');
      await expectStableHeader(page, `${width}-${reducedMotion}-home`);
      await page.reload();
      await expectStableHeader(page, `${width}-${reducedMotion}-reload`);
      await page.goto('/work/bunzo');
      await expectStableHeader(page, `${width}-${reducedMotion}-direct-case`);
    });
  }

  test(`stable header through delayed navigation and fonts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await observeHeader(page);
    let releaseModule!: () => void;
    const moduleGate = new Promise<void>((resolve) => {
      releaseModule = resolve;
    });
    await page.route('**/src/scripts/navigation.ts', async (route) => {
      await moduleGate;
      await route.continue();
    });
    await page.route(/\.woff2?(?:\?.*)?$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    const fallback = page.locator('[data-menu-fallback]');
    await expect(fallback).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await fallback.locator('summary').click();
    await expect(fallback.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
    releaseModule();
    await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
    const measured = await expectStableHeader(page, `${width}-delayed-module-fonts`);
    expect(measured.samples.some(({ enhanced }) => !enhanced)).toBe(true);
    expect(measured.samples.some(({ enhanced }) => enhanced)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-menu-trigger]')).toBeFocused();
  });

  test(`failed navigation module keeps native menu and stable geometry at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await observeHeader(page);
    await page.route('**/src/scripts/navigation.ts', (route) => route.abort());
    await page.goto('/');
    const fallback = page.locator('[data-menu-fallback]');
    await expect(fallback).toBeVisible();
    await fallback.locator('summary').click();
    await expect(fallback.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
    await expectStableHeader(page, `${width}-failed-module`);
    await fallback.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL('/work');
    await expectStableHeader(page, `${width}-failed-module-internal`);
  });

  test(`no-JavaScript native menu preserves header geometry at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
      viewport: { width, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    const geometry = () =>
      page.locator('main').evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const before = await geometry();
    const fallback = page.locator('[data-menu-fallback]');
    await fallback.locator('summary').click();
    await expect(fallback.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
    expect(await geometry()).toBe(before);
    await fallback.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL('http://127.0.0.1:4321/work');
    expect(await geometry()).toBe(before);
    await page.reload();
    expect(await geometry()).toBe(before);
    await expect(page.locator('[data-menu-fallback] summary')).toBeVisible();
    await context.close();
  });
}
