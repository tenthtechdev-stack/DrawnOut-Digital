import { expect, test, type Locator, type Page } from '@playwright/test';

// Isolate editorial motion through the supported storage-unavailable fallback.
// Home links now intentionally replay the intro and have dedicated coverage.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage unavailable in editorial-motion fixture', 'SecurityError');
    };
  });
});

interface MotionScene {
  id: number;
  start: number;
  end: number;
  progress: number;
}

interface MotionSnapshot {
  state: string;
  sceneCount: number;
  triggerCount: number;
  revealCount: number;
  refreshCount: number;
  initializationCount: number;
  cleanupCount: number;
  scenes: MotionScene[];
}

interface HeroPaint {
  time: number;
  lines: { fullyVisible: boolean; phase?: string }[];
}

async function watchHeroPaints(page: Page) {
  await page.addInitScript(() => {
    const paints: HeroPaint[] = [];
    (window as unknown as { __heroPaints: HeroPaint[] }).__heroPaints = paints;
    const sample = () => {
      const lines = [...document.querySelectorAll<HTMLElement>('[data-type-line]')];
      if (lines.length) {
        paints.push({
          time: performance.now(),
          lines: lines.map((line) => {
            const style = getComputedStyle(line);
            const insets = style.clipPath.split('round')[0]?.match(/-?\d*\.?\d+/g) ?? [];
            const bottomInset = Number(insets[2] ?? insets[0] ?? 0);
            return {
              fullyVisible:
                Number(style.opacity) >= 0.99 && style.visibility !== 'hidden' && bottomInset < 0.1,
              phase: line.dataset.motionReveal,
            };
          }),
        });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function heroPaints(page: Page): Promise<HeroPaint[]> {
  return page.evaluate(() => (window as unknown as { __heroPaints: HeroPaint[] }).__heroPaints);
}

function assertNoHeroReplay(paints: HeroPaint[]) {
  expect(paints.length).toBeGreaterThan(5);
  for (const index of [0, 1, 2]) {
    let revealed = false;
    for (const paint of paints) {
      const line = paint.lines[index];
      if (!line) continue;
      if (revealed)
        expect(line.fullyVisible, `Line ${index} hid again at ${paint.time}ms`).toBe(true);
      if (line.fullyVisible) revealed = true;
    }
    expect(revealed, `Line ${index} never became fully visible`).toBe(true);
  }
}

async function snapshot(page: Page): Promise<MotionSnapshot> {
  return page.evaluate(() => {
    const motion = (window as unknown as { __drawnoutMotion: MotionSnapshot }).__drawnoutMotion;
    return {
      state: motion.state,
      sceneCount: motion.sceneCount,
      triggerCount: motion.triggerCount,
      revealCount: motion.revealCount,
      refreshCount: motion.refreshCount,
      initializationCount: motion.initializationCount,
      cleanupCount: motion.cleanupCount,
      scenes: motion.scenes,
    };
  });
}

async function ready(page: Page, route = '/') {
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBeGreaterThan(0);
}

async function sceneAt(page: Page, prefix: string) {
  const scenes = (await snapshot(page)).scenes;
  // A card already in the opening viewport may have a negative trigger start.
  // Choose a later scene whose complete entry range is reachable by real scrolling.
  for (const media of await page.locator(`${prefix} [data-motion-scene]`).all()) {
    const id = Number(await media.getAttribute('data-motion-scene'));
    const scene = scenes.find((entry) => entry.id === id);
    if (scene && scene.start >= 0 && scene.end > scene.start) return { media, scene };
  }
  throw new Error(`No fully scrollable scene for ${prefix}`);
}

async function setProgress(page: Page, media: Locator, scene: MotionScene, progress: number) {
  await page.evaluate(
    ({ start, end, progress }) => window.scrollTo(0, start + (end - start) * progress),
    { ...scene, progress },
  );
  await expect
    .poll(async () => Number(await media.getAttribute('data-motion-progress')))
    .toBeCloseTo(progress, 2);
}

async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [390, 768, 1440]) {
  test(`hero entrance starts before its first painted text and never replays at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await watchHeroPaints(page);
    // Use ordinary loading: delaying library responses can mask GSAP's lazy first render.
    await ready(page);
    await expect
      .poll(async () =>
        page
          .locator('[data-type-line]')
          .evaluateAll((lines) =>
            lines.every((line) => line.getAttribute('data-motion-reveal') === 'complete'),
          ),
      )
      .toBe(true);
    const paints = await heroPaints(page);
    expect(paints[0]?.lines.every((line) => !line.fullyVisible)).toBe(true);
    for (const index of [0, 1, 2]) {
      expect(paints.some((paint) => paint.lines[index]?.phase === 'running')).toBe(true);
    }
    assertNoHeroReplay(paints);
  });
}

test('late GSAP loading releases the hero watchdog and preserves the visible static text', async ({
  page,
}) => {
  await watchHeroPaints(page);
  await page.route(/gsap|ScrollTrigger/i, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    await route.continue();
  });
  await page.goto('/');
  await expect
    .poll(async () => (await heroPaints(page)).at(-1)?.lines.every((line) => line.fullyVisible))
    .toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'loading');
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await page.waitForTimeout(700);
  const paints = await heroPaints(page);
  expect(paints.some((paint) => paint.lines.some((line) => line.phase === 'running'))).toBe(false);
  assertNoHeroReplay(paints);
});

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`motion enhancement preserves readable content and normal scrolling at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'We make ideas impossible to ignore.',
    );
    await expect
      .poll(async () =>
        page.locator('[data-type-line]').evaluateAll((lines) =>
          lines.every((line) => {
            const style = getComputedStyle(line);
            return Number(style.opacity) >= 0.99 && style.visibility !== 'hidden';
          }),
        ),
      )
      .toBe(true);
    await assertNoOverflow(page);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('[data-site-footer] [data-motion-scene]')).toHaveCount(0);
    await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
    await expect(
      page
        .locator('[data-site-footer]')
        .getByRole('link', { name: "Tell Us What You're Thinking" }),
    ).toBeVisible();
    const footer = await page.locator('[data-site-footer]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { transform: style.transform, opacity: style.opacity };
    });
    expect(footer).toEqual({ transform: 'none', opacity: '1' });
    await assertNoOverflow(page);
    expect(errors).toEqual([]);
  });
}

const routes = [
  ['home', '/', '[data-work]'],
  ['work', '/work', '[data-work-index]'],
  ['case', '/work/bunzo', '[data-case-gallery]'],
] as const;

for (const [name, route, prefix] of routes) {
  for (const width of [390, 768, 1440]) {
    test(`${name} image expansion completes and reverses without layout shifts at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await ready(page, route);
      const { media, scene } = await sceneAt(page, prefix);
      expect(scene.end).toBeGreaterThan(scene.start);
      const geometry = () =>
        media.evaluate((element) => {
          const rectangle = element.getBoundingClientRect();
          const caption = element
            .closest('[data-project-card], [data-work-card], figure')
            ?.querySelector('.media-caption, .work-card-caption, figcaption');
          return {
            top: rectangle.top + window.scrollY,
            width: rectangle.width,
            height: rectangle.height,
            documentHeight: document.documentElement.scrollHeight,
            caption: caption
              ? {
                  text: caption.textContent,
                  transform: getComputedStyle(caption).transform,
                  opacity: getComputedStyle(caption).opacity,
                }
              : null,
          };
        });
      const before = await geometry();
      await setProgress(page, media, scene, 0.08);
      const beginning = await media.evaluate((element) => getComputedStyle(element).clipPath);
      await setProgress(page, media, scene, 0.5);
      const middle = await media.evaluate((element) => getComputedStyle(element).clipPath);
      await setProgress(page, media, scene, 0.98);
      const complete = await media.evaluate((element) => getComputedStyle(element).clipPath);
      const inset = (clip: string) => {
        expect(clip).toMatch(/^inset\(/);
        return Number(clip.match(/-?\d*\.?\d+/g)?.[1]);
      };
      expect(inset(beginning)).toBeGreaterThan(inset(middle));
      expect(inset(middle)).toBeGreaterThan(inset(complete));
      expect(inset(complete)).toBeLessThan(0.5);
      await setProgress(page, media, scene, 0.08);
      const reverse = await media.evaluate((element) => getComputedStyle(element).clipPath);
      expect(inset(reverse)).toBeGreaterThan(inset(complete));
      expect(Math.abs(inset(reverse) - inset(beginning))).toBeLessThan(0.5);
      const after = await geometry();
      expect(after.caption).toEqual(before.caption);
      for (const key of ['top', 'width', 'height', 'documentHeight'] as const) {
        expect(Math.abs(after[key] - before[key])).toBeLessThanOrEqual(1);
      }
      await assertNoOverflow(page);
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
    });
  }
}

test('filter changes, resize and repeated initialization keep one scoped motion system', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await ready(page, '/work');
  const before = await snapshot(page);
  await page.locator('[data-filter="packaging"]').click();
  await expect
    .poll(async () => (await snapshot(page)).refreshCount)
    .toBeGreaterThan(before.refreshCount);
  await expect(page.locator('[data-filter="packaging"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-filter="all"]').click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBe(before.sceneCount);
  const refreshed = await snapshot(page);
  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBe(before.sceneCount);
  await expect.poll(async () => (await snapshot(page)).triggerCount).toBe(refreshed.triggerCount);
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect.poll(async () => (await snapshot(page)).triggerCount).toBe(0);
  await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBe(before.sceneCount);
  const restored = await snapshot(page);
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })),
  );
  await expect.poll(async () => (await snapshot(page)).triggerCount).toBe(0);
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  );
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBe(before.sceneCount);
  await expect
    .poll(async () => (await snapshot(page)).initializationCount)
    .toBe(restored.initializationCount + 1);
});

test('live reduced-motion changes remove scroll choreography and restore it without duplicates', async ({
  page,
}) => {
  await ready(page);
  const before = await snapshot(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'reduced');
  await expect.poll(async () => (await snapshot(page)).triggerCount).toBe(0);
  await expect(page.locator('main h1')).toBeVisible();
  for (const line of await page.locator('[data-type-line]').all()) {
    expect(await line.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  }
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect.poll(async () => (await snapshot(page)).sceneCount).toBe(before.sceneCount);
  await expect.poll(async () => (await snapshot(page)).triggerCount).toBe(before.triggerCount);
});

test('no-JavaScript pages retain readable text, portfolio imagery and navigation', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('[data-work] img')).toHaveCount(5);
  for (const line of await page.locator('[data-type-line]').all()) {
    expect(await line.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  }
  await page.locator('[data-menu-fallback] summary').click();
  await page
    .locator('[data-menu-fallback]')
    .getByRole('link', { name: 'Work', exact: true })
    .click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator('[data-work-card]:visible')).not.toHaveCount(0);
  await page.locator('[data-work-card] a').first().click();
  await expect(page.locator('[data-case-study]')).toBeVisible();
  await expect(page.locator('[data-case-gallery] img')).not.toHaveCount(0);
  await context.close();
});

test('failed GSAP downloads leave visible content and a usable static page', async ({ page }) => {
  await page.route(/gsap|ScrollTrigger/i, (route) => route.abort('failed'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', /error|static/);
  await expect(page.locator('main h1')).toBeVisible();
  for (const line of await page.locator('[data-type-line]').all()) {
    expect(await line.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  }
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator('[data-work-card]:visible')).not.toHaveCount(0);
});

test('keyboard focus exposes the complete interactive portfolio image', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page, '/work');
  const { media, scene } = await sceneAt(page, '[data-work-index]');
  await setProgress(page, media, scene, 0.08);
  const card = media.locator('xpath=ancestor::a[1]');
  await card.focus();
  await expect(card).toBeFocused();
  await expect
    .poll(async () => Number(await media.getAttribute('data-motion-progress')))
    .toBeGreaterThan(0.95);
  expect(await card.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  const destination = await card.getAttribute('href');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(destination!);
  await expect(page.locator('[data-case-study]')).toBeVisible();
});
