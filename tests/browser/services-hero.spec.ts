import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { serviceIndex } from '../../src/data/service-index';

const services = Object.entries(serviceIndex);
const hero = '[data-services-hero]';
const stage = '[data-services-stage]';
const pause = '[data-services-pause]';
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });

async function snapshot(page: Page) {
  return page.locator(hero).evaluate((node) => {
    const root = node as HTMLElement;
    return {
      state: root.dataset.servicesState,
      phase: root.dataset.servicesPhase,
      active: Number(root.dataset.servicesActive),
      cycle: Number(root.dataset.servicesCycle),
      time: Number(root.dataset.servicesTime),
      reasons: (root.dataset.servicesPauseReasons ?? '').split(',').filter(Boolean),
    };
  });
}

async function normalPage(page: Page, width = 1440) {
  await page.setViewportSize(viewportFor(width));
  await page.goto('/services');
  await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'playing');
  await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
}

async function centerStage(page: Page) {
  await page.locator(stage).evaluate((node) => {
    const box = node.getBoundingClientRect();
    window.scrollTo({ top: scrollY + box.top - 100, behavior: 'instant' });
  });
  await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'playing');
}

async function expectStopped(page: Page) {
  const before = await snapshot(page);
  await page.waitForTimeout(260);
  const after = await snapshot(page);
  expect(after.active).toBe(before.active);
  expect(after.cycle).toBe(before.cycle);
  expect(Math.abs(after.time - before.time)).toBeLessThan(0.06);
  return after;
}

for (const width of [320, 390, 768, 1440]) {
  test(`Services hero preserves readable layout, authentic emblem, five links and overview at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/services');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('We think beyond the brief.');
    await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
    await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'static');
    await expect(page.locator(`${hero} [data-services-scene]`)).toHaveCount(5);
    const sceneClasses = await page
      .locator(`${hero} [data-services-scene] svg`)
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('class')));
    expect(new Set(sceneClasses).size).toBe(5);
    for (const [slug, service] of services) {
      await expect(page.locator(`${hero} nav a[href="/services/${slug}"]`)).toHaveAccessibleName(
        service.title,
      );
      await expect(page.locator(`.service-foundation a[href="/services/${slug}"]`)).toHaveCount(1);
      await expect(page.locator(hero)).toContainText(service.headline);
    }
    const emblem = page.locator('[data-services-emblem] [data-brand-emblem]');
    await expect(emblem).toHaveAttribute('viewBox', '160 245 470 620');
    await expect(emblem.locator('image')).toHaveAttribute('width', '1920');
    const emblemBox = await emblem.boundingBox();
    expect(emblemBox!.width).toBeGreaterThan(60);
    expect(emblemBox!.width).toBeLessThanOrEqual(440);
    expect(await page.locator(`${hero} .pin-spacer`).count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`real rendered ${width}px loop features all five scenes, wordmark and return in fourteen seconds`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await normalPage(page, width);
    const samples = await page.locator(hero).evaluate(async (node) => {
      const root = node as HTMLElement;
      const sceneNodes = [...root.querySelectorAll<HTMLElement>('[data-services-scene]')];
      const logo = root.querySelector<HTMLElement>('[data-services-emblem]')!;
      const wordmark = root.querySelector<HTMLElement>('[data-services-wordmark]')!;
      const stage = root.querySelector<HTMLElement>('[data-services-stage]')!;
      const started = performance.now();
      const result: {
        at: number;
        time: number;
        cycle: number;
        phase: string;
        active: number;
        visible: number[];
        logoLeft: number;
        logoRight: number;
        stageWidth: number;
        wordmarkOpacity: number;
        wordmarkRightInset: number;
        fingerprint: string;
        fractionalDraw: boolean;
        scrollY: number;
      }[] = [];
      let previous = -100;
      await new Promise<void>((resolve) => {
        const sample = () => {
          const now = performance.now();
          if (now - previous >= 35) {
            previous = now;
            const active = Number(root.dataset.servicesActive);
            const scene = sceneNodes[active];
            const parts = scene
              ? [...scene.querySelectorAll('[data-services-part], [data-services-draw]')]
              : [];
            const partStyles = parts.map((part) => getComputedStyle(part));
            const logoBox = logo.getBoundingClientRect();
            const stageBox = stage.getBoundingClientRect();
            const wordStyle = getComputedStyle(wordmark);
            const rightInset = wordStyle.clipPath.match(/inset\(\S+\s+([^ )]+)/)?.[1];
            result.push({
              at: now - started,
              time: Number(root.dataset.servicesTime),
              cycle: Number(root.dataset.servicesCycle),
              phase: root.dataset.servicesPhase ?? '',
              active,
              visible: sceneNodes.flatMap((scene, index) =>
                !scene.hidden && Number(getComputedStyle(scene).opacity) > 0.65 ? [index] : [],
              ),
              logoLeft: logoBox.left - stageBox.left,
              logoRight: logoBox.right - stageBox.left,
              stageWidth: stageBox.width,
              wordmarkOpacity: wordmark.hidden ? 0 : Number(wordStyle.opacity),
              wordmarkRightInset:
                wordStyle.clipPath === 'none' ? 0 : Number.parseFloat(rightInset ?? '100'),
              fingerprint: partStyles
                .map((style) => [style.transform, style.opacity, style.strokeDashoffset].join('/'))
                .join('|'),
              fractionalDraw: partStyles.some((style) => {
                const value = Number.parseFloat(style.strokeDashoffset);
                return value > 0.05 && value < 0.95;
              }),
              scrollY,
            });
          }
          if (now - started >= 14_650) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      return result;
    });
    expect(new Set(samples.filter((s) => s.phase === 'service').map((s) => s.active))).toEqual(
      new Set([0, 1, 2, 3, 4]),
    );
    const firstCycle = samples[0]!.cycle;
    for (let index = 0; index < 5; index += 1) {
      const featured = samples.filter(
        (sample) =>
          sample.cycle === firstCycle && sample.phase === 'service' && sample.active === index,
      );
      expect(featured.length).toBeGreaterThan(15);
      expect((featured.at(-1)!.at - featured[0]!.at) / 1000).toBeGreaterThan(1.7);
      expect((featured.at(-1)!.at - featured[0]!.at) / 1000).toBeLessThan(2.4);
      expect(featured.some((sample) => sample.visible.includes(index))).toBe(true);
      expect(new Set(featured.map((sample) => sample.fingerprint)).size).toBeGreaterThan(2);
    }
    expect(samples.some((sample) => sample.fractionalDraw)).toBe(true);
    expect(
      samples.some((sample) => sample.wordmarkOpacity > 0.8 && sample.wordmarkRightInset < 10),
    ).toBe(true);
    expect(Math.min(...samples.map((sample) => sample.logoLeft))).toBeLessThan(
      samples[0]!.stageWidth * 0.15,
    );
    const wrap = samples.find((sample) => sample.cycle > firstCycle)!;
    expect(wrap).toBeTruthy();
    const observedCycleSeconds = (wrap.at - samples[0]!.at) / 1000 + samples[0]!.time;
    expect(observedCycleSeconds).toBeGreaterThan(13.5);
    expect(observedCycleSeconds).toBeLessThan(14.5);
    expect(wrap.logoRight / wrap.stageWidth).toBeGreaterThan(0.85);
    const beforeWrap = samples.filter((sample) => sample.cycle === firstCycle).at(-1)!;
    expect(Math.abs(beforeWrap.logoLeft - wrap.logoLeft)).toBeLessThan(wrap.stageWidth * 0.035);
    expect(beforeWrap.visible).toContain(0);
    expect(wrap.visible).toContain(0);
    expect(beforeWrap.wordmarkOpacity).toBeLessThan(0.1);
    expect(wrap.wordmarkOpacity).toBeLessThan(0.1);
    expect(new Set(samples.map((sample) => sample.scrollY)).size).toBe(1);
    expect(errors).toEqual([]);
    await test.info().attach('rendered-real-time-cycle', {
      body: JSON.stringify({ width, observedCycleSeconds, samples }),
      contentType: 'application/json',
    });
  });
}

for (const width of [390, 1440]) {
  test(`focus, explicit pause and resize preserve the active service at ${width}px`, async ({
    page,
  }) => {
    await normalPage(page, width);
    await centerStage(page);
    const button = page.locator(pause);
    await button.focus();
    await expect(page.locator(hero)).toHaveAttribute('data-services-pause-reasons', /focus/);
    await expectStopped(page);
    expect(await button.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.click(8, 250);
    await expectStopped(page);
    await page.setViewportSize(viewportFor(width === 390 ? 768 : 390));
    await page.waitForTimeout(150);
    const resized = await expectStopped(page);
    expect(resized.reasons).toContain('user');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width === 390 ? 768 : 390,
    );
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expectStopped(page);
    await page.mouse.click(8, 250);
    await page.locator(stage).evaluate((node) => {
      const box = node.getBoundingClientRect();
      window.scrollTo({ top: scrollY + box.top - 100, behavior: 'instant' });
    });
    await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'playing');
    const before = await snapshot(page);
    await page.waitForTimeout(300);
    expect((await snapshot(page)).time).not.toBe(before.time);
  });
}

test('hidden/offscreen pauses combine without losing an explicit user pause', async ({ page }) => {
  await normalPage(page);
  await centerStage(page);
  await page.locator(pause).click();
  await page.mouse.click(8, 250);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator(hero)).toHaveAttribute('data-services-pause-reasons', /hidden/);
  await expectStopped(page);
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await expect(page.locator(hero)).toHaveAttribute('data-services-pause-reasons', /offscreen/);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    Reflect.deleteProperty(document, 'visibilityState');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.locator(stage).scrollIntoViewIfNeeded();
  await expect(page.locator(hero)).toHaveAttribute('data-services-pause-reasons', /user/);
  await expectStopped(page);
});

test('Services permits immediate native scrolling and ordinary internal navigation without a loader', async ({
  page,
}) => {
  await page.goto('/services', { waitUntil: 'commit' });
  await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
  await page.mouse.wheel(0, 480);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await page.goto('/about');
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Services', exact: true })
    .click();
  await expect(page).toHaveURL('/services');
  await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
});

test('reduced motion offers static manual previews and every direct service route', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/services');
  await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'static');
  await expect(page.locator(pause)).toBeHidden();
  for (let index = 0; index < services.length; index += 1) {
    const [slug, service] = services[index]!;
    await page.locator(`[data-services-select="${index}"]`).click();
    await expect(page.locator(`[data-services-caption="${index}"] h2`)).toHaveText(service.title);
    await expect(page.locator(`[data-services-caption="${index}"]`)).toContainText(
      service.headline,
    );
    await expect(page.locator(`[data-services-select="${index}"]`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const response = await page.request.get(`/services/${slug}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('data-service-enquiry');
  }
  const before = await snapshot(page);
  await page.waitForTimeout(300);
  expect((await snapshot(page)).active).toBe(before.active);
});

test('Save Data remains static and can preview a different service', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), { saveData: true }),
    });
  });
  await page.goto('/services');
  await expect(page.locator(hero)).toHaveAttribute('data-services-state', 'static');
  await expect(page.locator(pause)).toBeHidden();
  await page.locator('[data-services-select="3"]').click();
  await expect(page.locator('[data-services-caption="3"]')).toBeVisible();
  await expect(page.locator('[data-services-caption="3"]')).toContainText(
    serviceIndex['words-storytelling'].headline,
  );
});

for (const width of [390, 1440]) {
  test(`native no-JavaScript ${width}px view keeps all five service links and complete content`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(width),
      javaScriptEnabled: false,
    });
    try {
      const page = await context.newPage();
      await page.goto('/services');
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
      await expect(page.locator(`${hero} nav a`)).toHaveCount(5);
      await expect(page.locator(`${hero} button:visible`)).toHaveCount(0);
      await expect(page.locator('[data-services-scene="0"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await page.locator(`${hero} nav a[href="/services/digital-design"]`).click();
      await expect(page).toHaveURL('/services/digital-design');
      await expect(page.locator('main h1')).toHaveText(serviceIndex['digital-design'].headline);
    } finally {
      await context.close();
    }
  });
}

test('a failed external script bundle leaves the Services content and five links usable', async ({
  page,
}) => {
  await page.route('**/*.js', (route) => route.abort('failed'));
  await page.goto('/services');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator(`${hero} nav a`)).toHaveCount(5);
  await expect(page.locator(`${hero} button:visible`)).toHaveCount(0);
  await expect(page.locator('[data-services-scene="0"]')).toBeVisible();
  await page.locator(`${hero} nav a[href="/services/creative-direction"]`).click();
  await expect(page).toHaveURL('/services/creative-direction');
  await expect(page.locator('main h1')).toHaveText(serviceIndex['creative-direction'].headline);
});
