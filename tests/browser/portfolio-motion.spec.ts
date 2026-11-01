import { expect, test, type Locator, type Page } from '@playwright/test';

const slugs = [
  'bunzo',
  'sol-community-center',
  'triarch',
  'churros',
  'by-tech-group',
  'u-wanna-smoothie',
];

async function playing(video: Locator) {
  // Center the card in the native scroll view: a merely visible neighbor can
  // correctly retain the decoder budget if it has the higher visible ratio.
  await video.evaluate((element) => {
    const box = element.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + box.top - (window.innerHeight - box.height) / 2,
      behavior: 'instant',
    });
  });
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  const state = await video.evaluate((element: HTMLVideoElement) => {
    const box = element.parentElement!.getBoundingClientRect();
    return {
      muted: element.muted,
      loop: element.loop,
      inline: element.playsInline,
      source: element.currentSrc,
      time: element.currentTime,
      paused: element.paused,
      crop: box.width / box.height < 1.1 ? 'portrait' : 'landscape',
    };
  });
  expect(state.muted && state.loop && state.inline).toBe(true);
  expect(state.paused).toBe(false);
  expect(state.source).toContain(`-${state.crop}.mp4`);
  // A playing data attribute alone cannot prove that a browser decoded footage.
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .not.toBe(state.time);
}

async function allSix(page: Page, route: '/' | '/work', width: number) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(`${route}#main`);
  await expect(page.locator('[data-portfolio-video]')).toHaveCount(6);
  const prefix = route === '/' ? 'home' : 'work';
  for (const slug of slugs) {
    const video = page.locator(`#${prefix}-motion-${slug}`);
    await playing(video);
    const budget = width < 768 ? 1 : 2;
    expect(await page.locator('[data-portfolio-video][src]').count()).toBeLessThanOrEqual(budget);
    expect(
      await page
        .locator('[data-portfolio-video]')
        .evaluateAll(
          (videos) => videos.filter((element) => !(element as HTMLVideoElement).paused).length,
        ),
    ).toBeLessThanOrEqual(budget);
    await expect(
      page.locator(
        route === '/'
          ? `[data-project-card][href="/work/${slug}"]`
          : `[data-project-slug="${slug}"] a[href="/work/${slug}"]`,
      ),
    ).toHaveCount(1);
  }
  await page.locator('main h1').scrollIntoViewIfNeeded();
  await expect(page.locator(`#${prefix}-motion-u-wanna-smoothie`)).not.toHaveAttribute('src', /.+/);
  await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('homepage lazily attaches sources at 35% visibility and all six desktop cards autoplay', async ({
  page,
}) => {
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
  await page.evaluate(() => {
    const video = document.querySelector('#home-motion-bunzo')!;
    const box = video.getBoundingClientRect();
    scrollTo(0, scrollY + box.top - innerHeight + box.height * 0.25);
  });
  await page.waitForTimeout(300);
  await expect(first).not.toHaveAttribute('src', /.+/);
  await playing(first);
  expect(requests.every((url) => url.includes('bunzo'))).toBe(true);
  await allSix(page, '/', 1440);
  await allSix(page, '/work', 1440);
});

for (const width of [390, 768]) {
  test(`all six Home and Work animations autoplay without hover and respect the decoder budget at ${width}px`, async ({
    page,
  }) => {
    await allSix(page, '/', width);
    await allSix(page, '/work', width);
  });
}

test('keyboard pause control stays separate from project links and preserves a descriptive poster', async ({
  page,
}) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await playing(video);
  const button = page.locator('[data-motion-toggle="work-motion-bunzo"]');
  expect(await button.evaluate((element) => Boolean(element.closest('a')))).toBe(false);
  await button.focus();
  expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
    'none',
  );
  expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(video).toHaveAttribute('data-motion-state', 'poster');
  await expect(video).not.toHaveAttribute('src', /.+/);
  const poster = video.locator('..').locator('picture img');
  await expect(poster).toBeVisible();
  expect(await poster.getAttribute('alt')).toBeTruthy();
  await page.keyboard.press('Enter');
  await playing(video);
});

test('document visibility changes release decoders and visible cards resume', async ({ page }) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await playing(video);
  // Synthetic visibility events exercise the same handler deterministically in headless Chromium.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await playing(video);
});

for (const mode of ['reduced-motion', 'save-data', 'autoplay-blocked'] as const) {
  test(`${mode} retains meaningful project posters without a broken player`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/media/portfolio/')) requests.push(request.url());
    });
    if (mode === 'reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else
      await page.addInitScript((condition) => {
        if (condition === 'save-data')
          Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
        else
          HTMLMediaElement.prototype.play = () =>
            Promise.reject(new DOMException('Autoplay disabled', 'NotAllowedError'));
      }, mode);
    for (const route of ['/', '/work']) {
      await page.goto(`${route}#main`);
      for (const slug of slugs) {
        const prefix = route === '/' ? 'home' : 'work';
        const video = page.locator(`#${prefix}-motion-${slug}`);
        const poster = video.locator('..').locator('picture img');
        await poster.scrollIntoViewIfNeeded();
        await expect(poster).toBeVisible();
        expect(await poster.getAttribute('alt')).toBeTruthy();
        await expect(video).toHaveAttribute('data-motion-state', 'poster');
      }
      await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
    }
    if (mode !== 'autoplay-blocked') expect(requests).toHaveLength(0);
  });
}

test('no JavaScript leaves clickable descriptive cards and official contact links without video requests', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const requests: string[] = [];
  context.on('request', (request) => {
    if (request.url().includes('/media/portfolio/')) requests.push(request.url());
  });
  try {
    const page = await context.newPage();
    for (const route of ['/', '/work']) {
      await page.goto(route);
      await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
      const prefix = route === '/' ? 'home' : 'work';
      for (const slug of slugs) {
        const poster = page
          .locator(`#${prefix}-motion-${slug}`)
          .locator('..')
          .locator('picture img');
        expect(await poster.getAttribute('alt')).toBeTruthy();
      }
    }
    await page.locator('[data-project-slug="bunzo"] a[href="/work/bunzo"]').click();
    await expect(page).toHaveURL('/work/bunzo');
    await expect(page.locator('main h1')).toContainText('Bunzo');
    await page
      .locator('[data-site-footer]')
      .getByRole('link', { name: "Tell Us What You're Thinking" })
      .click();
    await expect(page).toHaveURL('/contact');
    for (const href of [
      'mailto:official@drawnoutdigital.com',
      'tel:+923019719288',
      'https://wa.me/923019719288',
    ]) {
      await expect(page.locator(`.contact-direct a[href="${href}"]`)).toBeVisible();
    }
    expect(requests).toHaveLength(0);
  } finally {
    await context.close();
  }
});

test('filtering releases hidden animations and keeps category navigation and project links working', async ({
  page,
}) => {
  await page.goto('/work#main');
  const video = page.locator('#work-motion-bunzo');
  await playing(video);
  // Bunzo has no print category, so this actually removes the playing card.
  await page.locator('[data-filter="print"]').click();
  await expect(page.locator('[data-filter="print"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-project-slug="bunzo"]')).toBeHidden();
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(page.locator('[data-work-count]')).toContainText('Print');
  await page.locator('[data-filter="all"]').click();
  await playing(video);
  const link = page.locator('[data-project-slug="bunzo"] a[href="/work/bunzo"]');
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work/bunzo');
});
