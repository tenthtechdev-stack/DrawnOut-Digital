import { expect, test } from '@playwright/test';

const slugs = ['bunzo', 'sol-community-center', 'triarch', 'churros', 'by-tech-group', 'u-wanna-smoothie'];

test('homepage keeps all six video sources unloaded until their cards enter view', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/media/portfolio/')) requests.push(request.url());
  });
  await page.goto('/#main');
  await expect(page.locator('[data-portfolio-video]')).toHaveCount(6);
  await page.waitForTimeout(300);
  expect(requests).toHaveLength(0);
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  const first = page.locator('#home-motion-bunzo');
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute('data-motion-state', 'playing');
  const before = await first.evaluate((video) => (video as HTMLVideoElement).currentTime);
  await expect.poll(() => first.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(before);
  await expect(page.locator('[data-project-card][href="/work/bunzo"]')).toHaveCount(1);
  expect(requests.every((url) => url.includes('bunzo'))).toBe(true);
});

for (const width of [390, 1440]) {
  test(`all six Work animations autoplay without hover, retain links and respect the decoder budget at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work#main');
    for (const slug of slugs) {
      const video = page.locator(`#work-motion-${slug}`);
      await video.scrollIntoViewIfNeeded();
      await expect(video).toHaveAttribute('data-motion-state', 'playing', { timeout: 10000 });
      const state = await video.evaluate((element) => {
        const video = element as HTMLVideoElement;
        return { muted: video.muted, loop: video.loop, inline: video.playsInline, source: video.currentSrc, time: video.currentTime };
      });
      expect(state.muted && state.loop && state.inline).toBe(true);
      expect(state.source).toContain(width < 640 ? '-portrait.mp4' : '-landscape.mp4');
      await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(state.time);
      expect(await page.locator('[data-portfolio-video][src]').count()).toBeLessThanOrEqual(width < 768 ? 1 : 2);
      await expect(page.locator(`[data-project-slug="${slug}"] a[href="/work/${slug}"]`)).toHaveCount(1);
    }
    await page.locator('main h1').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  });
}

test('keyboard pause control is separate from the project link and preserves the poster', async ({ page }) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  const button = page.locator('[data-motion-toggle="work-motion-bunzo"]');
  expect(await button.evaluate((element) => Boolean(element.closest('a')))).toBe(false);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(video).toHaveAttribute('data-motion-state', 'poster');
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(video.locator('..').locator('picture img')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
});

test('hidden tabs stop and release video decoders, then visible cards resume', async ({ page }) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
});

for (const mode of ['reduced-motion', 'save-data', 'autoplay-blocked'] as const) {
  test(`${mode} retains meaningful project posters without a broken player`, async ({ page }) => {
    if (mode === 'reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.addInitScript((condition) => {
      if (condition === 'save-data') Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
      else HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay disabled', 'NotAllowedError'));
    }, mode);
    await page.goto('/work#main');
    const poster = page.locator('[data-project-slug="bunzo"] picture img').first();
    await poster.scrollIntoViewIfNeeded();
    await expect(poster).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    expect(await poster.getAttribute('alt')).not.toBe('');
  });
}

test('no JavaScript leaves clickable cards, descriptive posters and no video requests', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/work');
    await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    const link = page.locator('[data-project-slug="bunzo"] a[href="/work/bunzo"]');
    await link.click();
    await expect(page).toHaveURL('/work/bunzo');
    await expect(page.locator('main h1')).toContainText('Bunzo');
  } finally { await context.close(); }
});

test('filtering releases hidden project videos and keeps category navigation working', async ({ page }) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  await page.locator('[data-filter="digital"]').click();
  await expect(page.locator('[data-filter="digital"]')).toHaveAttribute('aria-pressed', 'true');
  const bunzo = page.locator('[data-project-slug="bunzo"]');
  if (await bunzo.isHidden()) await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(page.locator('[data-work-count]')).toContainText('Digital');
});
