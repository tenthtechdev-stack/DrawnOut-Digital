import { expect, test, type Page } from '@playwright/test';

// Explicit software WebGL exercises the real shader in cloud Chromium. This is
// rendering coverage, not a claim about physical-device GPU performance.
test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  },
});

interface GradientState {
  renderer: string;
  active: boolean;
  frames: number;
  time: number;
  width: number;
  height: number;
  pointer: { x: number; y: number };
  target: { x: number; y: number };
}
const snapshot = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __drawnoutGradient: GradientState }).__drawnoutGradient,
  );

async function observeGPUStartup(page: Page) {
  await page.addInitScript(() => {
    const starts: { intro?: string; hero?: string }[] = [];
    Reflect.set(window, '__gradientStarts', starts);
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl') {
        const { signatureIntro: intro, heroEntrance: hero } = document.documentElement.dataset;
        starts.push({ intro, hero });
      }
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
}

async function expectUnblockedEntrance(page: Page) {
  const starts: { intro?: string; hero?: string }[] = await page.evaluate(() =>
    Reflect.get(window, '__gradientStarts'),
  );
  expect(starts).toHaveLength(1);
  expect(['pending', 'playing']).not.toContain(starts[0]!.intro);
  expect(['pending', 'running']).not.toContain(starts[0]!.hero);
}

for (const width of [390, 1440]) {
  test(`living shader keeps painting after the intro at ${width}px and pauses offscreen`, async ({
    page,
  }) => {
    await observeGPUStartup(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const gradient = page.locator('[data-living-gradient]');
    // Software GPU startup follows the entrance and can exceed the default 5s assertion window.
    await expect(gradient).toHaveAttribute('data-gradient-renderer', 'webgl', { timeout: 15_000 });
    await expectUnblockedEntrance(page);
    await page.waitForFunction(() => performance.now() > 5500);
    const canvas = page.locator('[data-gradient-canvas]');
    const before = await canvas.screenshot();
    const state = await snapshot(page);
    await page.waitForTimeout(1100);
    const after = await canvas.screenshot();
    expect(after.equals(before), 'Actual rendered pixels must keep evolving').toBe(false);
    expect((await snapshot(page)).frames).toBeGreaterThan(state.frames + 12);
    expect((await snapshot(page)).frames - state.frames).toBeLessThan(45);
    expect(state.width).toBeLessThanOrEqual(720);
    expect(state.height).toBeLessThanOrEqual(800);
    await page.locator('[data-studio]').scrollIntoViewIfNeeded();
    await expect(gradient).toHaveAttribute('data-gradient-active', 'false');
    const paused = await snapshot(page);
    await page.waitForTimeout(250);
    expect((await snapshot(page)).frames).toBe(paused.frames);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(gradient).toHaveAttribute('data-gradient-active', 'true');
    await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(paused.frames);
  });
}

test('desktop pointer response eases towards the cursor while mobile touch preserves autonomous motion', async ({
  page,
}) => {
  await observeGPUStartup(page);
  await page.addInitScript(() => sessionStorage.setItem('drawnout-loop-seen', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'webgl',
  );
  await expectUnblockedEntrance(page);
  await page.mouse.move(1360, 650);
  await expect.poll(async () => (await snapshot(page)).pointer.x).toBeGreaterThan(0.65);
  const right = await page.locator('[data-gradient-canvas]').screenshot();
  await page.mouse.move(80, 650);
  await expect.poll(async () => (await snapshot(page)).pointer.x).toBeLessThan(-0.65);
  const left = await page.locator('[data-gradient-canvas]').screenshot();
  expect(left.equals(right)).toBe(false);
  await page.locator('[data-hero]').dispatchEvent('pointerleave');
  await expect.poll(async () => Math.abs((await snapshot(page)).pointer.x)).toBeLessThan(0.05);
  await page.locator('[data-hero]').dispatchEvent('pointermove', {
    pointerType: 'touch',
    clientX: 1400,
    clientY: 800,
  });
  expect((await snapshot(page)).target).toEqual({ x: 0, y: 0 });
});

test('visibility suspension pauses the shader clock and resumes without a time jump', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'webgl',
  );
  // Browsers expose visibility read-only. Dispatch its actual lifecycle handler
  // with a controlled visibility getter; no shader/animation values are sought.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const paused = await snapshot(page);
  expect(paused.active).toBe(false);
  await page.waitForTimeout(300);
  expect((await snapshot(page)).frames).toBe(paused.frames);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(paused.frames);
  expect((await snapshot(page)).time - paused.time).toBeLessThan(0.2);
});

test('WebGL context failure selects animated CSS and a live preference change restores static artwork', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('drawnout-loop-seen', '1'));
  await page.goto('/');
  const gradient = page.locator('[data-living-gradient]');
  // Software GPU startup follows the entrance and can exceed the default 5s assertion window.
  await expect(gradient).toHaveAttribute('data-gradient-renderer', 'webgl', { timeout: 15_000 });
  await page.locator('[data-gradient-canvas]').evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(gradient).toHaveAttribute('data-gradient-renderer', 'css');
  const layer = page.locator('.gradient-coral');
  const before = await layer.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(250);
  expect(await layer.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(gradient).toHaveAttribute('data-gradient-renderer', 'static');
  expect(await layer.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.locator('main h1')).toBeVisible();
});

test('unavailable GPU uses visibly flowing CSS without adding a rendering loop', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('drawnout-loop-seen', '1');
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl') return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto('/');
  const gradient = page.locator('[data-living-gradient]');
  await expect(gradient).toHaveAttribute('data-gradient-renderer', 'css');
  const before = await gradient.screenshot();
  await page.waitForTimeout(900);
  expect((await gradient.screenshot()).equals(before)).toBe(false);
  expect((await snapshot(page)).frames).toBe(0);
});

test('initial reduced motion and data saving never initialize GPU rendering', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'static',
  );
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-active',
    'false',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), { saveData: true }),
      configurable: true,
    });
  });
  await page.reload();
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'static',
  );
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-active',
    'false',
  );
});
