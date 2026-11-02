import { expect, test, type Page } from '@playwright/test';

const processSystem = '[data-about-process-system]';
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });

interface BootFrame {
  time: number;
  boot?: string;
  entrance?: string;
  center: number;
  transform: string;
  headline: number;
  intro: number;
}

async function observeBoot(page: Page) {
  await page.addInitScript(() => {
    const samples: unknown[] = [];
    Reflect.set(window, '__aboutBootFrames', samples);
    function frame() {
      const hero = document.querySelector<HTMLElement>('[data-about-hero]');
      const composition = document.querySelector('[data-about-composition]');
      const headline = document.querySelector('[data-about-headline]');
      const intro = document.querySelector('[data-about-intro]');
      if (hero && composition && headline && intro) {
        const box = composition.getBoundingClientRect();
        samples.push({
          time: performance.now(),
          boot: hero.dataset.aboutBoot,
          entrance: hero.dataset.aboutEntrance,
          center: box.x + box.width / 2,
          transform: getComputedStyle(composition).transform,
          headline: Number(getComputedStyle(headline).opacity),
          intro: Number(getComputedStyle(intro).opacity),
        });
      }
      if (performance.now() < 3000) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

for (const mode of ['blocked', 'delayed'] as const) {
  test(`inline About prepaint fails open when all JavaScript bundles are ${mode}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(390));
    await observeBoot(page);
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'script') return route.continue();
      if (mode === 'blocked') return route.abort('failed');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator('[data-about-hero]')).toHaveAttribute('data-about-boot', 'released', {
      timeout: 1500,
    });
    const released = await page.evaluate(() => ({
      elapsed:
        performance.now() -
        Number(document.querySelector<HTMLElement>('[data-about-page]')!.dataset.aboutArrivalAt),
      reason: document.querySelector<HTMLElement>('[data-about-hero]')!.dataset.aboutSettleReason,
    }));
    expect(released.elapsed).toBeLessThan(1100);
    expect(released.reason).toBe('boot-deadline');
    await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
    await expect(page.locator('[data-about-portrait-raster]')).not.toHaveAttribute('mask');
    expect(
      await page
        .locator('[data-about-headline]')
        .first()
        .evaluate((node) => Number(getComputedStyle(node).opacity)),
    ).toBe(1);
    expect(
      await page
        .locator('[data-about-intro]')
        .evaluate((node) => Number(getComputedStyle(node).opacity)),
    ).toBe(1);
    if (mode === 'delayed') {
      // Observe beyond the delayed module's arrival. The expired inline guard
      // must not hand off later and hide or recenter the released composition.
      await page.waitForTimeout(1700);
      const frames = (await page.evaluate(() =>
        Reflect.get(window, '__aboutBootFrames'),
      )) as BootFrame[];
      const firstReleased = frames.find(({ boot }) => boot === 'released')!;
      const afterRelease = frames.filter(({ time }) => time > firstReleased.time + 30);
      expect(afterRelease.length).toBeGreaterThan(5);
      for (const frame of afterRelease) {
        expect(frame.entrance).not.toBe('running');
        expect(frame.headline).toBe(1);
        expect(frame.intro).toBe(1);
        expect(Math.abs(frame.center - firstReleased.center)).toBeLessThan(2);
        expect(frame.transform).toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
      }
      await test
        .info()
        .attach('expired-boot-never-rehides', {
          body: JSON.stringify({ released, frames }),
          contentType: 'application/json',
        });
    } else {
      await page.locator('[data-menu-fallback] summary').click();
      await expect(
        page.locator('[data-menu-fallback]').getByRole('link', { name: 'Work', exact: true }),
      ).toBeVisible();
      const contact = page.getByRole('link', { name: "Tell us what you're thinking", exact: true });
      await expect(contact).toHaveAttribute('href', '/contact');
      await contact.click();
      await expect(page).toHaveURL('/contact');
      await expect(page.locator('main h1')).toHaveAccessibleName('Have something in mind?');
    }
  });
}

for (const width of [390, 1440]) {
  test(`centered composition leaves navigation pointer targets immediately usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator('[data-about-hero]')).toHaveAttribute(
      'data-about-entrance',
      'running',
    );
    await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
    if (width < 768) {
      const menu = page.getByRole('button', { name: 'Open menu', exact: true });
      const box = await menu.boundingBox();
      expect(
        await menu.evaluate(
          (node, point) => node.contains(document.elementFromPoint(point.x, point.y)),
          { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
        ),
      ).toBe(true);
      await menu.click();
      await page
        .getByRole('dialog', { name: 'Navigation', exact: true })
        .getByRole('link', { name: /^(?:\d+\s+)?Work$/ })
        .click();
    } else {
      const work = page
        .locator('[data-site-header]')
        .getByRole('link', { name: 'Work', exact: true });
      const box = await work.boundingBox();
      expect(
        await work.evaluate(
          (node, point) => node.contains(document.elementFromPoint(point.x, point.y)),
          { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
        ),
      ).toBe(true);
      await work.click();
    }
    await expect(page).toHaveURL('/work');
    await expect(page.locator('[data-signature-intro-overlay]')).toBeHidden();
    await expect(page.locator('main h1')).toBeVisible();
  });
}

async function processFrame(page: Page, requestedProgress: number) {
  return page.locator(processSystem).evaluate(async (node, requested) => {
    const initial = node.getBoundingClientRect();
    const absolute = initial.top + scrollY;
    const start = absolute - innerHeight * 0.84;
    const end = absolute + initial.height - innerHeight * 0.34;
    window.scrollTo({ top: start + (end - start) * requested, behavior: 'instant' });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    const box = node.getBoundingClientRect();
    const expected = Math.max(
      0,
      Math.min(1, (innerHeight * 0.84 - box.top) / (box.height + innerHeight * 0.5)),
    );
    const line = node.querySelector('[data-about-process-line]')!;
    return {
      expected,
      progress: Number((node as HTMLElement).dataset.aboutProcessProgress),
      scrollProgress: Number((node as HTMLElement).dataset.aboutScrollProgress),
      lineOffset: Number.parseFloat(getComputedStyle(line).strokeDashoffset),
      scrollY,
      phases: [...node.querySelectorAll<HTMLElement>('[data-about-process-phase]')].map((phase) =>
        Number(phase.dataset.aboutPhaseProgress),
      ),
    };
  }, requestedProgress);
}

for (const width of [390, 1440]) {
  test(`process stays directly synchronized through rapid scroll, reversal and resize at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/about');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-about-page]')).toHaveAttribute('data-about-motion', 'ready');
    const samples = [];
    for (const progress of [0.12, 0.58, 0.86, 0.24, 0.76, 0.04, 0.5]) {
      const sample = await processFrame(page, progress);
      samples.push(sample);
      expect(Math.abs(sample.progress - sample.expected)).toBeLessThan(0.02);
      expect(Math.abs(sample.scrollProgress - sample.expected)).toBeLessThan(0.02);
      expect(Math.abs(sample.lineOffset - (1 - sample.expected))).toBeLessThan(0.025);
      sample.phases.forEach((value, index) =>
        expect(
          Math.abs(value - Math.max(0, Math.min(1, sample.expected * 4 - index))),
        ).toBeLessThan(0.025),
      );
    }
    const stopped = samples.at(-1)!;
    await page.waitForTimeout(120);
    const held = await page
      .locator('[data-about-process-line]')
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).strokeDashoffset));
    expect(Math.abs(held - stopped.lineOffset)).toBeLessThan(0.005);
    const resizedWidth = width === 1440 ? 768 : 320;
    await page.setViewportSize(viewportFor(resizedWidth));
    await page.waitForTimeout(300);
    const resized = await processFrame(page, 0.43);
    expect(Math.abs(resized.progress - resized.expected)).toBeLessThan(0.02);
    expect(Math.abs(resized.lineOffset - (1 - resized.expected))).toBeLessThan(0.025);
    expect(await page.locator('[data-about-page] .pin-spacer').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      resizedWidth,
    );
    await test.info().attach('same-frame-process-geometry', {
      body: JSON.stringify({ width, samples, resizedWidth, resized }),
      contentType: 'application/json',
    });
  });
}
