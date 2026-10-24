import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('drawnout-loop-seen', '1'));
});

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [390, 1440]) {
  test(`major portfolio image opens from an editorial frame to near full bleed at ${width}px`, async ({
    page,
  }) => {
    await open(page, width);
    const media = page.locator('[data-motion-immersive] .media-slot');
    const scroll = async (progress: number) => {
      await page.evaluate((progress) => {
        const media = document.querySelector<HTMLElement>('[data-motion-immersive] .media-slot')!;
        const runtime = Reflect.get(window, '__drawnoutMotion');
        const scene = runtime.scenes.find(
          (entry: { id: number }) => entry.id === Number(media.dataset.motionScene),
        );
        window.scrollTo(0, scene.start + (scene.end - scene.start) * progress);
      }, progress);
      await expect
        .poll(async () => Number(await media.getAttribute('data-motion-progress')))
        .toBeCloseTo(progress, 2);
    };
    const geometry = () =>
      media.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const inset = Number(getComputedStyle(element).clipPath.match(/-?\d*\.?\d+/g)?.[1] ?? 0);
        return {
          width: box.width,
          height: box.height,
          top: box.top + scrollY,
          visibleWidth: box.width * (1 - inset * 0.02),
        };
      });
    await scroll(0.08);
    const framed = await geometry();
    await scroll(0.99);
    const immersive = await geometry();
    expect(immersive.visibleWidth / width).toBeGreaterThan(0.94);
    expect(immersive.visibleWidth - framed.visibleWidth).toBeGreaterThan(
      width * (width < 768 ? 0.17 : 0.33),
    );
    for (const key of ['width', 'height', 'top'] as const)
      expect(Math.abs(immersive[key] - framed[key])).toBeLessThan(1);
    await scroll(0.08);
    expect(Math.abs((await geometry()).visibleWidth - framed.visibleWidth)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(media.locator('xpath=ancestor::a[1]')).toHaveAttribute('href', '/work/bunzo');
  });

  test(`manifesto words follow actual scroll and reverse at ${width}px`, async ({ page }) => {
    await open(page, width);
    const title = page.locator('#approach-title');
    await expect(title.locator('.motion-word')).not.toHaveCount(0);
    const scroll = async (progress: number) => {
      await title.evaluate((element, progress) => {
        const start = Number((element as HTMLElement).dataset.textStart);
        const end = Number((element as HTMLElement).dataset.textEnd);
        window.scrollTo(0, start + (end - start) * progress);
      }, progress);
      await expect
        .poll(async () => Number(await title.getAttribute('data-text-progress')))
        .toBeCloseTo(progress, 2);
    };
    const pose = () =>
      title.locator('.motion-word').evaluateAll((words) =>
        words.map((word) => {
          const style = getComputedStyle(word);
          const matrix = new DOMMatrixReadOnly(style.transform);
          return { y: matrix.m42, opacity: Number(style.opacity) };
        }),
      );
    await scroll(0.08);
    const beginning = await pose();
    await scroll(0.5);
    const middle = await pose();
    await scroll(0.99);
    const end = await pose();
    expect(beginning[0]!.y).toBeGreaterThan(middle[0]!.y);
    expect(middle[0]!.y).toBeGreaterThan(end[0]!.y);
    expect(end.every((word) => Math.abs(word.y) < 3 && word.opacity > 0.98)).toBe(true);
    expect(middle[0]!.y).toBeLessThan(middle.at(-1)!.y);
    await scroll(0.08);
    const reverse = await pose();
    for (let index = 0; index < beginning.length; index++) {
      expect(Math.abs(beginning[index]!.y - reverse[index]!.y)).toBeLessThan(3);
    }
    // Wait for a real SplitText re-split, then verify its replacement words stay
    // attached to native scroll in both directions at the other breakpoint.
    await title
      .locator('.motion-word')
      .first()
      .evaluate((word) => {
        (word as HTMLElement).dataset.beforeResize = 'true';
      });
    await page.setViewportSize({ width: width < 768 ? 1440 : 390, height: 900 });
    await expect(title.locator('[data-before-resize]')).toHaveCount(0);
    await scroll(0.5);
    const resizedMiddle = await pose();
    expect(resizedMiddle[0]!.y).toBeLessThan(resizedMiddle.at(-1)!.y);
    await scroll(0.99);
    expect((await pose()).every((word) => Math.abs(word.y) < 3 && word.opacity > 0.98)).toBe(true);
    await scroll(0.08);
    expect((await pose())[0]!.y).toBeGreaterThan(resizedMiddle[0]!.y);
    await expect(title).toHaveAttribute('aria-label', /Pretty isn't\s+the point\./);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(title.locator('.motion-word')).toHaveCount(0);
    await expect(title).toHaveText(/Pretty isn't\s+the point\./);
    await expect(title).toBeVisible();
    expect(await title.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  });
}

test('selected editorial lines and words reveal once and reflow safely after resizing', async ({
  page,
}) => {
  await open(page, 1440);
  const heading = page.locator('#studio-title');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading.locator('.motion-line')).not.toHaveCount(0);
  await expect(heading).toHaveAttribute('data-motion-reveal', 'complete');
  // Split wrappers must preserve the approved orange emphasis on the original span.
  await expect(heading.locator('span').first()).toHaveCSS('color', 'rgb(166, 59, 28)');
  const lead = page.locator('.studio-lead');
  await expect(lead.locator('.motion-word')).not.toHaveCount(0);
  await expect(lead).toHaveAttribute('data-motion-reveal', 'complete');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(heading).toHaveAttribute('data-motion-reveal', 'complete');
  await expect(lead).toHaveAttribute('data-motion-reveal', 'complete');
  await page.waitForTimeout(300);
  for (const target of [heading, lead]) {
    const words = await target.locator('.motion-word').evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, opacity: getComputedStyle(element).opacity };
      }),
    );
    expect(
      words.every((word) => word.left >= -1 && word.right <= 391 && word.opacity === '1'),
    ).toBe(true);
  }
});
