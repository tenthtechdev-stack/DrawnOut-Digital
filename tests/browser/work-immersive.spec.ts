import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const projects = [
  ['bunzo', 'Bunzo'],
  ['sol-community-center', 'SOL Community Center'],
  ['triarch', 'Triarch'],
  ['churros', 'Churros Dessert Shop'],
  ['capture', 'Capture'],
  ['by-tech-group', 'By Tech Group'],
  ['khalo', 'Khalo'],
  ['fk-technology', 'FK Technology'],
  ['feed-n-seed', 'Feed N Seed'],
  ['abacus-immigration', 'Abacus Immigration'],
  ['u-wanna-smoothie', 'U Wanna Smoothie'],
] as const;
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });
const cardFor = (page: Page, slug: string) =>
  page.locator(`[data-work-card][data-project-slug="${slug}"]`);
const sceneFor = (page: Page, slug: string) =>
  page.locator(
    `[data-work-scene][data-project-slug="${slug}"], [data-project-slug="${slug}"] [data-work-scene]`,
  );

/** Native document scroll to the public scene geometry, never seeking a timeline. */
async function scrollProgress(scene: Locator, progress: number) {
  const target = await scene.evaluate((node, value) => {
    const style = getComputedStyle(node);
    const start = Number(style.getPropertyValue('--work-scroll-start'));
    const end = Number(style.getPropertyValue('--work-scroll-end'));
    if (!(start > end && end > 0)) throw new Error('Missing scene scroll geometry');
    const top =
      node.getBoundingClientRect().top + scrollY - innerHeight * (start - (start - end) * value);
    window.scrollTo({ top, behavior: 'instant' });
    return top;
  }, progress);
  await expect.poll(() => scene.evaluate(() => scrollY)).toBeCloseTo(target, 0);
  await expect
    .poll(() =>
      scene.evaluate((node) => Number(getComputedStyle(node).getPropertyValue('--work-progress'))),
    )
    .toBeCloseTo(progress, 1);
  await scene.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function geometry(scene: Locator) {
  return scene.evaluate((node) => {
    const rect = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const frame = node.querySelector('[data-work-frame]')!;
    const caption = node.querySelector('[data-portfolio-caption]')!;
    const composition = node.querySelector('[data-work-composition]')!;
    const scene = node.getBoundingClientRect();
    return {
      scene: { top: scene.top + scrollY, height: scene.height },
      composition: rect(composition),
      frame: rect(frame),
      caption: rect(caption),
      radius: getComputedStyle(frame).borderRadius,
      position: getComputedStyle(node).position,
      pinned: Boolean(node.closest('.pin-spacer')),
      documentWidth: document.documentElement.scrollWidth,
      imageTransform: getComputedStyle(frame.querySelector('img')!).transform,
    };
  });
}

async function readable(element: Locator, width: number) {
  await expect(element).toBeVisible();
  const state = await element.evaluate((node) => {
    const style = getComputedStyle(node);
    const range = document.createRange();
    range.selectNodeContents(node);
    return {
      opacity: Number(style.opacity),
      visibility: style.visibility,
      rects: [...range.getClientRects()].map(({ left, right }) => ({ left, right })),
    };
  });
  expect(state.opacity).toBe(1);
  expect(state.visibility).toBe('visible');
  expect(state.rects.length).toBeGreaterThan(0);
  for (const rect of state.rects) {
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(width + 1);
  }
}

for (const width of [390, 1440]) {
  test(`Bunzo and SOL expand frame and caption together, then restore native backscroll at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/work');
    await page.evaluate(() => document.fonts.ready);
    const samples = [];
    for (const slug of ['bunzo', 'sol-community-center']) {
      const scene = sceneFor(page, slug);
      await expect(scene).toHaveAttribute('data-work-enhanced', '');
      await scrollProgress(scene, 0);
      const initial = await geometry(scene);
      await scrollProgress(scene, 0.5);
      const middle = await geometry(scene);
      await scrollProgress(scene, 1);
      const expanded = await geometry(scene);
      expect(middle.frame.width).toBeGreaterThan(initial.frame.width + 5);
      expect(expanded.frame.width).toBeGreaterThan(middle.frame.width + 5);
      expect(expanded.frame.width).toBeGreaterThan(initial.frame.width * 1.08);
      expect(expanded.frame.height).toBeGreaterThan(initial.frame.height * 1.05);
      expect(expanded.composition.width).toBeGreaterThan(initial.composition.width * 1.08);
      expect(expanded.caption.width).toBeGreaterThan(initial.caption.width * 1.08);
      expect(expanded.radius).not.toBe(initial.radius);
      // A fixed document reservation avoids feedback between growth and scroll progress.
      expect(expanded.scene.top).toBeCloseTo(initial.scene.top, 0);
      expect(expanded.scene.height).toBeCloseTo(initial.scene.height, 0);
      for (const sample of [initial, middle, expanded]) {
        expect(sample.pinned).toBe(false);
        expect(['fixed', 'sticky']).not.toContain(sample.position);
        expect(sample.documentWidth).toBeLessThanOrEqual(width);
        expect(sample.frame.x).toBeGreaterThanOrEqual(-1);
        expect(sample.frame.x + sample.frame.width).toBeLessThanOrEqual(width + 1);
        expect(sample.caption.y).toBeGreaterThanOrEqual(0);
        expect(sample.caption.y + sample.caption.height).toBeLessThanOrEqual(
          viewportFor(width).height + 1,
        );
        // Artwork is not separately zoomed; the containing composition changes geometry.
        expect(sample.imageTransform).toBe('none');
      }
      await scrollProgress(scene, 0.5);
      const reverseMiddle = await geometry(scene);
      expect(reverseMiddle.frame.width).toBeCloseTo(middle.frame.width, 0);
      expect(reverseMiddle.frame.height).toBeCloseTo(middle.frame.height, 0);
      expect(reverseMiddle.caption.x).toBeCloseTo(middle.caption.x, 0);
      await scrollProgress(scene, 0);
      const reversed = await geometry(scene);
      expect(reversed.frame.width).toBeCloseTo(initial.frame.width, 0);
      expect(reversed.frame.height).toBeCloseTo(initial.frame.height, 0);
      expect(reversed.caption.x).toBeCloseTo(initial.caption.x, 0);
      samples.push({ slug, initial, middle, expanded, reverseMiddle, reversed });
    }
    expect(errors).toEqual([]);
    await test.info().attach(`work-expansion-${width}`, {
      body: JSON.stringify(samples, null, 2),
      contentType: 'application/json',
    });
  });

  test(`the approved first-four rhythm and SOL decoder survive continuous expansion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/work');
    await expect(page.locator('[data-portfolio-video]')).toHaveCount(6);
    for (const [index, [slug]] of projects.slice(0, 4).entries()) {
      const card = cardFor(page, slug);
      await expect(card).toHaveAttribute(
        'data-project-presentation',
        index % 2 ? 'animated' : 'static',
      );
      await scrollProgress(sceneFor(page, slug), 0.7);
      const video = card.locator('video');
      if (index % 2) {
        await expect(video).toHaveAttribute('data-motion-state', 'playing');
        const before = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
        await expect
          .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
          .not.toBe(before);
      } else {
        await expect(video).not.toHaveAttribute('src', /.+/);
        await expect(card.locator('picture img')).toBeVisible();
      }
      expect(await page.locator('[data-portfolio-video][src]').count()).toBeLessThanOrEqual(
        width < 768 ? 1 : 2,
      );
    }
    const solScene = sceneFor(page, 'sol-community-center');
    const sol = cardFor(page, 'sol-community-center').locator('video');
    await scrollProgress(solScene, 0.5);
    await expect(sol).toHaveAttribute('data-motion-state', 'playing');
    await sol.evaluate((node: HTMLVideoElement) => {
      const counts = { loads: 0, sourceMutations: 0 };
      const load = node.load.bind(node);
      node.load = () => {
        counts.loads += 1;
        load();
      };
      new MutationObserver((records) => {
        counts.sourceMutations += records.length;
      }).observe(node, { attributes: true, attributeFilter: ['src'] });
      Object.assign(node, { testWorkPlayback: counts });
    });
    const source = await sol.getAttribute('src');
    for (const progress of [0.6, 0.8, 1, 0.8, 0.6, 0.5]) {
      await scrollProgress(solScene, progress);
      await expect(sol).toHaveAttribute('data-motion-state', 'playing');
      await expect(sol).toHaveAttribute('src', source!);
    }
    expect(
      await sol.evaluate(
        (node) => (node as HTMLVideoElement & { testWorkPlayback: object }).testWorkPlayback,
      ),
    ).toEqual({ loads: 0, sourceMutations: 0 });
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`all eleven ordered projects remain readable, linked and accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work');
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator('[data-work-card]');
    await expect(cards).toHaveCount(11);
    expect(
      await cards.evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLElement).dataset.projectSlug),
      ),
    ).toEqual(projects.map(([slug]) => slug));
    for (const [slug, title] of projects) {
      const card = cardFor(page, slug);
      const heading = card.getByRole('heading', { level: 2, name: title, exact: true });
      await readable(heading, width);
      const link = card.locator(`a[href="/work/${slug}"]`);
      await expect(link).toHaveAccessibleName(title);
      const image = card.locator('picture img');
      expect(await image.getAttribute('alt')).toBeTruthy();
      const frame = card.locator('[data-work-frame]');
      const box = (await frame.boundingBox())!;
      expect(box.width).toBeGreaterThan(width < 768 ? 240 : 500);
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      expect(await image.evaluate((node) => getComputedStyle(node).objectFit)).toBe('contain');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const link = cardFor(page, 'bunzo').locator('a');
    await link.focus();
    const focus = await link.evaluate((node) => ({
      style: getComputedStyle(node).outlineStyle,
      width: parseFloat(getComputedStyle(node).outlineWidth),
    }));
    expect(focus.style).not.toBe('none');
    expect(focus.width).toBeGreaterThanOrEqual(2);
    const scan = await new AxeBuilder({ page })
      .include('[data-work-index]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  });
}

test('filters update the URL, preserve browser history and remeasure visible scenes', async ({
  page,
}) => {
  await page.goto('/work');
  const packaging = page.locator('[data-filter="packaging"]');
  await packaging.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work?category=packaging');
  await expect(packaging).toHaveAttribute('aria-pressed', 'true');
  await expect(cardFor(page, 'sol-community-center')).toBeHidden();
  await expect(page.locator('[data-work-count]')).toContainText('5 of 11');
  await scrollProgress(sceneFor(page, 'churros'), 0.5);
  const packagingGeometry = await geometry(sceneFor(page, 'churros'));
  await page.locator('[data-filter="print"]').click();
  await expect(page).toHaveURL('/work?category=print');
  await expect(cardFor(page, 'bunzo')).toBeHidden();
  await scrollProgress(sceneFor(page, 'sol-community-center'), 1);
  await expect(cardFor(page, 'sol-community-center').locator('video')).toHaveAttribute(
    'data-motion-state',
    'playing',
  );
  await page.goBack();
  await expect(page).toHaveURL('/work?category=packaging');
  await expect(packaging).toHaveAttribute('aria-pressed', 'true');
  await expect(cardFor(page, 'sol-community-center')).toBeHidden();
  await expect(cardFor(page, 'sol-community-center').locator('video')).not.toHaveAttribute(
    'src',
    /.+/,
  );
  await scrollProgress(sceneFor(page, 'churros'), 0.5);
  expect((await geometry(sceneFor(page, 'churros'))).frame.width).toBeCloseTo(
    packagingGeometry.frame.width,
    0,
  );
  await page.goForward();
  await expect(page).toHaveURL('/work?category=print');
  await expect(page.locator('[data-filter="print"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-filter="all"]').click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(11);
  await page.goto('/work?category=not-a-category');
  await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-work-card]:visible')).toHaveCount(11);
});

test('mobile touch filtering and project navigation retain ordinary links', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: viewportFor(390),
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/work');
    await page.locator('[data-filter="packaging"]').tap();
    await expect(page).toHaveURL('/work?category=packaging');
    const scene = sceneFor(page, 'bunzo');
    await scrollProgress(scene, 1);
    await cardFor(page, 'bunzo').locator('a').tap();
    await expect(page).toHaveURL('/work/bunzo');
    await expect(page.locator('[data-case-study] h1')).toContainText('Bunzo');
    await page.locator('[data-case-next]').tap();
    await expect(page).toHaveURL('/work/sol-community-center');
    await page.locator('[data-case-previous]').tap();
    await expect(page).toHaveURL('/work/bunzo');
  } finally {
    await context.close();
  }
});

test('title reveals happen once and keyboard focus immediately restores semantic text', async ({
  page,
}) => {
  await page.goto('/work');
  const scene = sceneFor(page, 'churros');
  const card = cardFor(page, 'churros');
  const caption = card.locator('[data-portfolio-caption]');
  await caption.evaluate((node) => {
    const changes: string[] = [];
    new MutationObserver(() =>
      changes.push((node as HTMLElement).dataset.portfolioReveal ?? ''),
    ).observe(node, { attributes: true, attributeFilter: ['data-portfolio-reveal'] });
    Object.assign(node, { testRevealChanges: changes });
  });
  await scrollProgress(scene, 0);
  await expect(caption).toHaveAttribute('data-portfolio-reveal', 'complete');
  await scrollProgress(scene, 1);
  await page.locator('main h1').scrollIntoViewIfNeeded();
  await scrollProgress(scene, 0.5);
  expect(
    await caption.evaluate(
      (node) =>
        (node as HTMLElement & { testRevealChanges: string[] }).testRevealChanges.filter(
          (value) => value === 'running',
        ).length,
    ),
  ).toBe(1);
  expect(
    await caption.locator('[data-portfolio-title]').evaluate((node) => node.getAnimations().length),
  ).toBe(0);
  const later = cardFor(page, 'u-wanna-smoothie');
  await later.locator('a').focus();
  await expect(later.locator('[data-portfolio-caption]')).toHaveAttribute(
    'data-portfolio-reveal',
    'complete',
  );
  await readable(later.locator('[data-portfolio-title]'), 1440);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work/u-wanna-smoothie');
});

for (const mode of ['reduced-motion', 'save-data', 'no-javascript', 'failed-bundles'] as const) {
  test(`${mode} leaves a complete static index and working case links without footage`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: viewportFor(390),
      javaScriptEnabled: mode !== 'no-javascript',
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
    });
    if (mode === 'save-data')
      await context.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
      });
    const requests: string[] = [];
    context.on('request', (request) => {
      if (request.url().includes('/media/portfolio/')) requests.push(request.url());
    });
    try {
      const page = await context.newPage();
      if (mode === 'failed-bundles')
        await page.route('**/*', (route) =>
          route.request().resourceType() === 'script' ? route.abort('failed') : route.continue(),
        );
      await page.goto('/work');
      await expect(page.locator('[data-work-card]')).toHaveCount(11);
      await expect(page.locator('[data-work-enhanced]')).toHaveCount(0);
      for (const [slug] of projects) {
        const card = cardFor(page, slug);
        await card.scrollIntoViewIfNeeded();
        await readable(card.locator('[data-portfolio-title]'), 390);
        await expect(card.locator('picture img')).toBeVisible();
        expect(
          await card
            .locator('[data-work-frame]')
            .evaluate((node) => node.getBoundingClientRect().width),
        ).toBeGreaterThan(300);
      }
      await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
      expect(requests).toHaveLength(0);
      expect(
        await page
          .locator('[data-work-index]')
          .evaluate(
            (node) =>
              node
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === 'running').length,
          ),
      ).toBe(0);
      if (mode === 'no-javascript' || mode === 'failed-bundles')
        await expect(page.locator('[data-work-filters]')).toBeHidden();
      await cardFor(page, 'sol-community-center').locator('a').click();
      await expect(page).toHaveURL('/work/sol-community-center');
      await expect(page.locator('[data-case-study] h1')).toContainText('SOL Community Center');
      await expect(
        page.locator(
          '[data-case-facts], [data-case-narrative], [data-case-evidence], [data-case-draft]',
        ),
      ).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
}

test('all eleven real case routes preserve display-only facts and circular neighbors', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [index, [slug, title]] of projects.entries()) {
    await page.goto('/work');
    await cardFor(page, slug).locator('a').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`/work/${slug}`);
    await expect(page.locator('[data-case-study] h1')).toContainText(title);
    await expect(
      page.locator(
        '[data-case-facts], [data-case-narrative], [data-case-evidence], [data-case-draft]',
      ),
    ).toHaveCount(0);
    await expect(page.locator('[data-case-next]')).toHaveAttribute(
      'href',
      `/work/${projects[(index + 1) % projects.length]![0]}`,
    );
    await expect(page.locator('[data-case-previous]')).toHaveAttribute(
      'href',
      `/work/${projects[(index - 1 + projects.length) % projects.length]![0]}`,
    );
  }
});

test('responsive resizing remeasures the scene without horizontal overflow or stale expansion', async ({
  page,
}) => {
  await page.goto('/work');
  const scene = sceneFor(page, 'sol-community-center');
  for (const width of [1440, 768, 390, 320, 1440]) {
    await page.setViewportSize(viewportFor(width));
    await scrollProgress(scene, 0.5);
    const middle = await geometry(scene);
    await scrollProgress(scene, 1);
    const expanded = await geometry(scene);
    expect(expanded.frame.width).toBeGreaterThan(middle.frame.width + 5);
    expect(expanded.frame.x).toBeGreaterThanOrEqual(-1);
    expect(expanded.frame.x + expanded.frame.width).toBeLessThanOrEqual(width + 1);
    expect(expanded.documentWidth).toBeLessThanOrEqual(width);
    expect(expanded.scene.height).toBeCloseTo(middle.scene.height, 0);
    await readable(scene.locator('[data-portfolio-title]'), width);
  }
});

test('changing reduced motion or Save Data restores static geometry and releases video immediately', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.defineProperty(connection, 'saveData', {
      configurable: true,
      writable: true,
      value: false,
    });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  });
  await page.goto('/work');
  const scene = sceneFor(page, 'sol-community-center');
  const video = scene.locator('video');
  await scrollProgress(scene, 0.5);
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  const moving = await geometry(scene);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-work-enhanced]')).toHaveCount(0);
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  expect((await geometry(scene)).frame.width).toBeGreaterThan(moving.frame.width);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await scrollProgress(scene, 0.5);
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  expect((await geometry(scene)).frame.width).toBeCloseTo(moving.frame.width, 0);
  await page.evaluate(() => {
    const connection = (
      navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
    ).connection;
    connection.saveData = true;
    connection.dispatchEvent(new Event('change'));
  });
  await expect(page.locator('[data-work-enhanced]')).toHaveCount(0);
  await expect(page.locator('[data-portfolio-video][src]')).toHaveCount(0);
  expect((await geometry(scene)).frame.width).toBeGreaterThan(moving.frame.width);
  await readable(scene.locator('[data-portfolio-title]'), 1440);
  await page.evaluate(() => {
    const connection = (
      navigator as Navigator & { connection: EventTarget & { saveData: boolean } }
    ).connection;
    connection.saveData = false;
    connection.dispatchEvent(new Event('change'));
  });
  await scrollProgress(scene, 0.5);
  await expect(video).toHaveAttribute('data-motion-state', 'playing');
  expect((await geometry(scene)).frame.width).toBeCloseTo(moving.frame.width, 0);
});
