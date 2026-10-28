import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';

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

// Capture the painted composition directly: locator.screenshot waits for layout
// stability and can wait forever on an intentionally moving atmospheric layer.
async function visibleGradient(page: Page) {
  const bounds = await page.locator('[data-living-gradient]').boundingBox();
  expect(bounds).not.toBeNull();
  return page.screenshot({ clip: bounds! });
}

async function pixels(image: Buffer) {
  return sharp(image).resize(160, 96, { fit: 'fill' }).removeAlpha().raw().toBuffer();
}

function frameMetrics(before: Buffer, after: Buffer) {
  const quadrants = Array.from({ length: 4 }, () => ({ pixels: 0, changed: 0, colourful: 0 }));
  let totalDifference = 0;
  let warmPixels = 0;
  let colourfulPixels = 0;
  for (let pixel = 0; pixel < 160 * 96; pixel += 1) {
    const x = pixel % 160;
    const y = Math.floor(pixel / 160);
    const quadrant = quadrants[(x >= 80 ? 1 : 0) + (y >= 48 ? 2 : 0)]!;
    const index = pixel * 3;
    const channels = [after[index]!, after[index + 1]!, after[index + 2]!];
    const difference =
      channels.reduce(
        (sum, channel, offset) => sum + Math.abs(channel - before[index + offset]!),
        0,
      ) / 3;
    quadrant.pixels += 1;
    if (difference > 6) quadrant.changed += 1;
    if (Math.max(...channels) - Math.min(...channels) > 28) {
      quadrant.colourful += 1;
      colourfulPixels += 1;
      if (channels[0]! - channels[2]! > 25 && channels[0]! - channels[1]! > 12) warmPixels += 1;
    }
    totalDifference += difference;
  }
  return {
    meanChannelChange: totalDifference / (160 * 96),
    colourfulFraction: colourfulPixels / (160 * 96),
    warmShare: warmPixels / Math.max(1, colourfulPixels),
    quadrants: quadrants.map((item) => ({
      changedFraction: item.changed / item.pixels,
      colourfulFraction: item.colourful / item.pixels,
    })),
  };
}

for (const width of [320, 390, 768, 1440]) {
  test(`fluid shader evolves at 0/2/5s after the loader at ${width}px and pauses offscreen`, async ({
    page,
  }) => {
    await observeGPUStartup(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const gradient = page.locator('[data-living-gradient]');
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
    await expect(gradient).toHaveAttribute('data-gradient-active', 'false');
    expect(
      await page
        .locator('.gradient-coral')
        .evaluate((element) => getComputedStyle(element).animationPlayState),
    ).toBe('paused');
    // Software GPU startup follows the entrance and can exceed the default 5s assertion window.
    await expect(gradient).toHaveAttribute('data-gradient-renderer', 'webgl', { timeout: 15_000 });
    await expectUnblockedEntrance(page);
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'completed');
    const frames: { elapsedMs: number; state: GradientState; pixels: Buffer }[] = [];
    const started = Date.now();
    for (const at of [0, 2000, 5000]) {
      const remaining = at - (Date.now() - started);
      if (remaining > 0) await page.waitForTimeout(remaining);
      frames.push({
        elapsedMs: Date.now() - started,
        state: await snapshot(page),
        pixels: await pixels(await visibleGradient(page)),
      });
    }
    const first = frames[0]!;
    const changes = frames.slice(1).map((frame) => ({
      elapsedMs: frame.elapsedMs,
      ...frameMetrics(first.pixels, frame.pixels),
    }));
    for (const change of changes) {
      // Reject a static shader, imperceptibly drifting wash, or a sole corner hotspot.
      expect(change.meanChannelChange).toBeGreaterThan(3);
      expect(change.colourfulFraction).toBeGreaterThan(0.22);
      expect(change.warmShare).toBeGreaterThan(0.45);
      for (const quadrant of change.quadrants) {
        expect(quadrant.changedFraction).toBeGreaterThan(0.04);
      }
    }
    // A moving cream region can occupy a quadrant at one instant. Across both
    // observations, colour must reach every quadrant rather than stay in a corner.
    for (let index = 0; index < 4; index += 1) {
      expect(
        Math.max(...changes.map((change) => change.quadrants[index]!.colourfulFraction)),
      ).toBeGreaterThan(0.05);
    }
    const last = frames.at(-1)!.state;
    const elapsed = last.time - first.state.time;
    expect(last.frames).toBeGreaterThan(first.state.frames + 35);
    expect((last.frames - first.state.frames) / elapsed).toBeLessThanOrEqual(32);
    expect(first.state.width).toBeLessThanOrEqual(720);
    expect(first.state.height).toBeLessThanOrEqual(800);
    await test.info().attach(`fluid-gradient-${width}`, {
      body: JSON.stringify({
        width,
        frames: frames.map(({ elapsedMs, state }) => ({ elapsedMs, state })),
        changes,
      }),
      contentType: 'application/json',
    });
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
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'webgl',
    { timeout: 15_000 },
  );
  await expectUnblockedEntrance(page);
  await page.mouse.move(1360, 650);
  await expect.poll(async () => (await snapshot(page)).pointer.x).toBeGreaterThan(0.65);
  const right = await visibleGradient(page);
  await page.mouse.move(80, 650);
  await expect.poll(async () => (await snapshot(page)).pointer.x).toBeLessThan(-0.65);
  const left = await visibleGradient(page);
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
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-living-gradient]')).toHaveAttribute(
    'data-gradient-renderer',
    'webgl',
    { timeout: 15_000 },
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
  await page.goto('/');
  await page.keyboard.press('Escape');
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
  await page.keyboard.press('Escape');
  const gradient = page.locator('[data-living-gradient]');
  await expect(gradient).toHaveAttribute('data-gradient-renderer', 'css');
  const before = await visibleGradient(page);
  await page.waitForTimeout(900);
  expect((await visibleGradient(page)).equals(before)).toBe(false);
  expect((await snapshot(page)).frames).toBe(0);
});

test('initial reduced motion and data saving never initialize GPU rendering', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Escape');
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
