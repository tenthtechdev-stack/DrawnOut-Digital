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
      const name = document.querySelector<HTMLElement>('[data-intro-name]')!;
      const signature = document.querySelector<HTMLElement>('[data-intro-signature]')!;
      const hand = signature.querySelector<HTMLElement>('[data-signature-hand]')!;
      const plaque = signature.querySelector<HTMLElement>('[data-signature-plaque]')!;
      const images = [...signature.querySelectorAll('img')];
      const range = document.createRange();
      range.selectNodeContents(name);
      const animation = (element: Element, animationName: string) => {
        const result = element
          .getAnimations()
          .find((entry) => (entry as CSSAnimation).animationName.includes(animationName));
        if (!(result?.effect instanceof KeyframeEffect) || result.startTime === null)
          throw new Error(`Missing live ${animationName} animation`);
        const timing = result.effect.getComputedTiming();
        return {
          start: Number(result.startTime) + Number(timing.delay),
          end: Number(result.startTime) + Number(timing.endTime),
          keyframes: result.effect.getKeyframes(),
        };
      };
      // Read the browser's actual effects without seeking them. A slow rAF
      // observer may miss the short fully written hold; its scheduled interval
      // is independently checked alongside real partial/finished render samples.
      const wordDraw = animation(name, 'name-draw');
      const waveDraw = animation(path, 'connect-projects');
      const wordFade = animation(name, 'name-resolve');
      const completeClip = String(wordDraw.keyframes.at(-1)?.clipPath ?? '');
      const hold = {
        from: wordDraw.end,
        until: wordFade.start,
        duration: wordFade.start - wordDraw.end,
        waveStart: waveDraw.start,
        waveEnd: waveDraw.end,
        wordStart: wordDraw.start,
        wordEnd: wordDraw.end,
        completeClip,
        fadeFrom: Number(wordFade.keyframes[0]?.opacity),
        fadeTo: Number(wordFade.keyframes.at(-1)?.opacity),
      };
      let lastVisible = 0;
      let sawPartialWave = false;
      let synchronizedSamples = 0;
      let maximumRevealDrift = 0;
      let sawFullName = false;
      let sawCompletedWipe = false;
      let readablePartialSamples = 0;
      const holdSamples: { time: number; fullyVisible: boolean }[] = [];
      let previousSample: number | undefined;
      let maximumSampleGap = 0;
      let sawIndependentEntrance = false;
      let sawHeldPose = false;
      const fullNameGeometries: {
        text: string | null;
        left: number;
        right: number;
        top: number;
        bottom: number;
        boxTop: number;
        boxBottom: number;
        width: number;
        fontSize: number;
        gridLeft: number;
        skipTop: number;
        viewportWidth: number;
        viewportHeight: number;
      }[] = [];
      const layerCheckpoints: {
        phase: string;
        time: number;
        handY: number;
        plaqueY: number;
        imagesLoaded: boolean;
      }[] = [];
      const revealCheckpoints: { time: number; waveRemaining: number; textRemaining: number }[] =
        [];
      await new Promise<void>((resolve) => {
        function sample() {
          const time = Number(document.timeline.currentTime ?? performance.now());
          if (previousSample !== undefined)
            maximumSampleGap = Math.max(maximumSampleGap, time - previousSample);
          previousSample = time;
          const style = getComputedStyle(scene);
          if (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) > 0
          )
            lastVisible = performance.now();
          const wave = parseFloat(getComputedStyle(path).strokeDashoffset);
          const nameStyle = getComputedStyle(name);
          const inset = nameStyle.clipPath.match(/^inset\(([^)]+)\)$/)?.[1]?.split(/\s+/);
          // A full wipe serializes as inset(0px); during the reveal the right
          // inset is a percentage of the actual wordmark box.
          const rightInset = inset?.[1] ?? inset?.[0];
          const remaining = rightInset?.endsWith('%') ? parseFloat(rightInset) / 100 : 0;
          const fullyWritten = wave < 0.001 && remaining < 0.001;
          const fullyVisible = fullyWritten && Number(nameStyle.opacity) > 0.95;
          if (fullyWritten) sawCompletedWipe = true;
          if (remaining > 0.05 && remaining < 0.9 && Number(nameStyle.opacity) > 0.95)
            readablePartialSamples += 1;
          if (time >= hold.from + 1 && time <= hold.until - 1)
            holdSamples.push({ time, fullyVisible });
          if (wave > 0.05 && wave < 0.95 && remaining > 0.05 && remaining < 0.95) {
            sawPartialWave = true;
            synchronizedSamples += 1;
            maximumRevealDrift = Math.max(maximumRevealDrift, Math.abs(wave - remaining));
            if (
              revealCheckpoints.length === 0 ||
              revealCheckpoints.at(-1)!.waveRemaining - wave > 0.2
            ) {
              revealCheckpoints.push({
                time: performance.now(),
                waveRemaining: wave,
                textRemaining: remaining,
              });
            }
          }
          if (fullyVisible) sawFullName = true;
          // Range geometry describes the laid-out letters even while the wipe
          // clips some pixels. Capture it once while drawable, not only during
          // a 200ms observation window that can fall between sampled frames.
          if (
            fullNameGeometries.length === 0 &&
            Number(nameStyle.opacity) > 0.95 &&
            remaining < 0.9
          ) {
            const text = range.getBoundingClientRect();
            const box = name.getBoundingClientRect();
            fullNameGeometries[0] = {
              text: name.textContent?.trim() ?? null,
              left: text.left,
              right: text.right,
              top: text.top,
              bottom: text.bottom,
              boxTop: box.top,
              boxBottom: box.bottom,
              width: text.width,
              fontSize: parseFloat(nameStyle.fontSize),
              gridLeft: scene.querySelector('.intro-top')!.getBoundingClientRect().left,
              skipTop: scene.querySelector('[data-signature-skip]')!.getBoundingClientRect().top,
              viewportWidth: innerWidth,
              viewportHeight: innerHeight,
            };
          }
          if (Number(getComputedStyle(signature).opacity) > 0.95 && Number(style.opacity) > 0.95) {
            const handY = new DOMMatrixReadOnly(getComputedStyle(hand).transform).m42;
            const plaqueY = new DOMMatrixReadOnly(getComputedStyle(plaque).transform).m42;
            const imagesLoaded =
              images.length === 2 &&
              images.every((image) => image.complete && image.naturalWidth > 0);
            if (!sawIndependentEntrance && handY > 5 && plaqueY < -5 && imagesLoaded) {
              sawIndependentEntrance = true;
              layerCheckpoints.push({
                phase: 'separate entrance',
                time: performance.now(),
                handY,
                plaqueY,
                imagesLoaded,
              });
            }
            if (!sawHeldPose && Math.abs(handY) < 0.2 && Math.abs(plaqueY) < 0.2 && imagesLoaded) {
              sawHeldPose = true;
              layerCheckpoints.push({
                phase: 'registered held pose',
                time: performance.now(),
                handY,
                plaqueY,
                imagesLoaded,
              });
            }
          }
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
        synchronizedSamples,
        maximumRevealDrift,
        revealCheckpoints,
        sawFullName,
        sawCompletedWipe,
        readablePartialSamples,
        hold,
        holdSamples,
        maximumSampleGap,
        fullNameGeometry: fullNameGeometries[0] ?? null,
        sawIndependentEntrance,
        sawHeldPose,
        layerCheckpoints,
        imageSources: images.map((image) => image.currentSrc),
        legacyCompositeCount: signature.querySelectorAll(
          '[data-signature-composite], [data-signature-frame]',
        ).length,
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
    expect(observations.synchronizedSamples).toBeGreaterThan(2);
    expect(observations.maximumRevealDrift).toBeLessThan(0.02);
    expect(observations.readablePartialSamples).toBeGreaterThan(2);
    expect(observations.sawCompletedWipe).toBe(true);
    expect(Math.abs(observations.hold.wordStart - observations.hold.waveStart)).toBeLessThan(1);
    expect(Math.abs(observations.hold.wordEnd - observations.hold.waveEnd)).toBeLessThan(1);
    expect(observations.hold.duration + 0.01).toBeGreaterThanOrEqual(200);
    expect(observations.hold.completeClip).toMatch(/^inset\(0(?:px|%)?(?:\s+0(?:px|%)?)*\)$/);
    expect(observations.hold.fadeFrom).toBe(1);
    expect(observations.hold.fadeTo).toBe(0);
    for (const sample of observations.holdSamples)
      expect(
        sample.fullyVisible,
        `Wordmark was not complete during its hold at ${sample.time}ms`,
      ).toBe(true);
    expect(observations.fullNameGeometry).not.toBeNull();
    const geometry = observations.fullNameGeometry!;
    expect(geometry.text).toBe('DrawnOut');
    expect(Math.abs(geometry.left - geometry.gridLeft)).toBeLessThan(2);
    expect(geometry.width).toBeGreaterThan(geometry.viewportWidth * 0.6);
    expect(geometry.fontSize).toBeGreaterThan(geometry.viewportWidth * 0.14);
    expect(geometry.left).toBeGreaterThanOrEqual(12);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth - 12);
    // Range bounds expose horizontally clipped letters, but their vertical
    // font metrics include unused ascender/descender space outside line-height.
    // Use the wordmark's actual layout box for placement and Skip clearance.
    expect(geometry.boxTop).toBeGreaterThan(geometry.viewportHeight * 0.5);
    expect(geometry.boxBottom).toBeLessThan(geometry.skipTop - 10);
    expect(observations.sawIndependentEntrance).toBe(true);
    expect(observations.sawHeldPose).toBe(true);
    expect(observations.layerCheckpoints[0]!.time).toBeLessThan(
      observations.layerCheckpoints[1]!.time,
    );
    expect(observations.legacyCompositeCount).toBe(0);
    expect(new Set(observations.imageSources).size).toBe(2);
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

test('internal navigation keeps its first action and the next manual refresh replays', async ({
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
  await page.reload({ waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.keyboard.press('Escape');
  await expectSkipped(page);
});

test('direct case loads use the loader while hash destinations reach content immediately', async ({
  page,
}) => {
  await page.goto('/work/bunzo');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.keyboard.press('Escape');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toContainText('Bunzo');
  await page.goto('/#main');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-reason', 'deep-link');
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

test('a homepage return respects the current motion preference instead of a past opt-out', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(overlay)).toBeHidden();
  await page.goto('/work');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'DrawnOut Digital home' })
    .click();
  await expect(page).toHaveURL('/');
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
  await page.keyboard.press('Escape');
  await expect(page.locator(overlay)).toBeHidden();
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
  await page.route('**/*hand-empty*', (route) => route.abort());
  await page.goto('/');
  await expectSkipped(page);
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
});

test('failed storyboard clock initialization reveals a working homepage', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.getAnimations = () => {
      throw new Error('Animation clock unavailable');
    };
  });
  await page.goto('/');
  await expectSkipped(page);
  await expect(page.locator('html')).toHaveAttribute(
    'data-signature-intro-reason',
    'animation-error',
  );
  await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
});
