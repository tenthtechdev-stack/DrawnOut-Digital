import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';
import { aboutPage } from '../../src/data/about';

const hero = '[data-about-hero]';
const overlay = '[data-signature-intro-overlay]';
const portrait = '[data-founder-portrait]';
const viewportFor = (width: number) => ({ width, height: width < 768 ? 844 : 900 });

async function expectReleased(page: Page) {
  await expect(page.locator(overlay)).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

async function expectFullPortrait(page: Page) {
  const drawing = page.locator(portrait);
  await expect(drawing).toHaveAttribute('data-portrait-state', 'approved');
  const svg = drawing.locator('svg[role="img"]');
  await expect(svg).toHaveAccessibleName(/twin founders/i);
  const raster = drawing.locator('[data-about-portrait-raster]');
  await expect(raster).toHaveCount(1);
  const geometry = await raster.evaluate((node) => {
    const image = node as SVGImageElement;
    const frame = image.ownerSVGElement!;
    const art = image.getBoundingClientRect();
    const outer = frame.getBoundingClientRect();
    return {
      meet: image.getAttribute('preserveAspectRatio') ?? frame.getAttribute('preserveAspectRatio'),
      art: { x: art.x, y: art.y, width: art.width, height: art.height },
      outer: { x: outer.x, y: outer.y, width: outer.width, height: outer.height },
      href: image.href.baseVal,
      label: frame.getAttribute('aria-label') ?? frame.textContent,
    };
  });
  expect(geometry.meet).toContain('meet');
  expect(geometry.href).toContain('founders-sketch-approved');
  const viewportWidth = page.viewportSize()!.width;
  expect(geometry.art.width).toBeGreaterThan(viewportWidth * (viewportWidth < 768 ? 0.75 : 0.35));
  expect(geometry.art.x).toBeGreaterThanOrEqual(geometry.outer.x - 1);
  expect(geometry.art.y).toBeGreaterThanOrEqual(geometry.outer.y - 1);
  expect(geometry.art.x + geometry.art.width).toBeLessThanOrEqual(
    geometry.outer.x + geometry.outer.width + 1,
  );
  expect(geometry.art.y + geometry.art.height).toBeLessThanOrEqual(
    geometry.outer.y + geometry.outer.height + 1,
  );
  expect(geometry.label).not.toMatch(/Mariah.*(?:left|right)|Mariam.*(?:left|right)/i);
  await expect(raster).not.toHaveAttribute('mask');
}

async function textFits(element: Locator, width: number) {
  const rectangles = await element.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const result: { left: number; right: number }[] = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      result.push(...Array.from(range.getClientRects(), ({ left, right }) => ({ left, right })));
    }
    return result;
  });
  expect(rectangles.length).toBeGreaterThan(0);
  for (const box of rectangles) {
    expect(box.left).toBeGreaterThanOrEqual(-1);
    expect(box.right).toBeLessThanOrEqual(width + 1);
  }
}

for (const width of [320, 390, 768, 1440]) {
  test(`seven chapters, full portrait, metadata, keyboard and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/about');
    await page.evaluate(() => document.fonts.ready);
    await expectReleased(page);
    await expect(page).toHaveTitle(aboutPage.metadata.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      aboutPage.metadata.description,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-about-page] > section')).toHaveCount(7);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      aboutPage.hero.heading,
    );
    for (const chapter of [
      aboutPage.origin,
      aboutPage.founders,
      aboutPage.philosophy,
      aboutPage.approach,
      aboutPage.audience,
      aboutPage.invitation,
    ])
      await expect(
        page.getByRole('heading', { level: 2, name: chapter.heading, exact: true }),
      ).toBeVisible();
    for (const copy of [
      ...aboutPage.hero.paragraphs,
      ...aboutPage.origin.paragraphs,
      ...aboutPage.audience.paragraphs,
      ...aboutPage.founders.profiles.flatMap(({ name, role, experience, description }) => [
        name,
        role,
        experience,
        description,
      ]),
      aboutPage.hero.supportingLabel,
      aboutPage.founders.signoff,
      aboutPage.philosophy.intro,
      ...aboutPage.philosophy.principles.flatMap(({ heading, description }) => [
        heading,
        description,
      ]),
      ...aboutPage.approach.phases.flatMap(({ heading, description }) => [heading, description]),
    ])
      await expect(page.locator('[data-about-page]')).toContainText(copy);
    await expectFullPortrait(page);
    const colours = await page.evaluate(() => ({
      hero: getComputedStyle(document.querySelector('[data-about-hero]')!).backgroundColor,
      philosophy: getComputedStyle(document.querySelector('[data-about-philosophy]')!)
        .backgroundColor,
    }));
    expect(
      Math.max(
        ...colours.hero
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number),
      ),
    ).toBeLessThan(60);
    expect(colours.hero).toBe(colours.philosophy);
    const emblem = page.locator('[data-about-emblem]');
    await expect(emblem).toBeVisible();
    expect(await emblem.evaluate((node) => Boolean(node.closest('[aria-hidden="true"]')))).toBe(
      true,
    );
    await textFits(page.locator('h1'), width);
    for (const name of await page.locator('[data-about-founder-name]').all())
      await textFits(name, width);
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('h1')!.getBoundingClientRect();
      const art = document.querySelector('[data-about-portrait]')!.getBoundingClientRect();
      const intro = document.querySelector('[data-about-intro]')!.getBoundingClientRect();
      return {
        headingBottom: heading.bottom,
        portraitTop: art.top,
        portraitBottom: art.bottom,
        introTop: intro.top,
      };
    });
    if (width < 768) {
      // Display glyph boxes can extend a few pixels past their grid row because
      // the headline masks balance font leading with negative block margins.
      expect(layout.portraitTop).toBeGreaterThanOrEqual(layout.headingBottom - 8);
      expect(layout.portraitTop - layout.headingBottom).toBeLessThan(120);
      expect(layout.introTop).toBeGreaterThanOrEqual(layout.portraitBottom);
    } else expect(layout.portraitTop).toBeLessThan(layout.headingBottom);
    const schema = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts
          .map((node) => JSON.parse(node.textContent!))
          .find((value) => value['@type'] === 'AboutPage'),
      );
    expect(schema.about).toEqual({ '@type': 'Organization', name: 'DrawnOut Digital' });
    expect(JSON.stringify(schema)).not.toMatch(
      /aggregateRating|review|award|foundingDate|alumniOf/,
    );
    for (const decoration of await page.locator('[data-about-page] svg:not([role="img"])').all())
      expect(
        await decoration.evaluate((node) => Boolean(node.closest('[aria-hidden="true"]'))),
      ).toBe(true);
    for (const href of ['/services', '/work', '/contact'])
      expect(await page.locator(`[data-about-page] a[href="${href}"]`).count()).toBeGreaterThan(0);
    const cta = page.getByRole('link', { name: aboutPage.invitation.cta.label, exact: true });
    await cta.focus();
    await expect(cta).toBeFocused();
    expect(await cta.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    const bounds = await cta.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
    expect(errors).toEqual([]);
    await cta.press('Enter');
    await expect(page).toHaveURL('/contact');
    await expect(page.locator('main h1')).toHaveAccessibleName('Have something in mind?');
  });
}

interface ArrivalFrame {
  time: number;
  state?: string;
  phase?: string;
  center: number;
  top: number;
  width: number;
  transform: string;
  headline: number;
  intro: number;
  logo: number;
  overlay: boolean;
}

async function sampleArrival(page: Page) {
  await page.addInitScript(() => {
    const samples: unknown[] = [];
    Reflect.set(window, '__aboutCorrectionFrames', samples);
    function frame() {
      const hero = document.querySelector<HTMLElement>('[data-about-hero]');
      const composition = document.querySelector('[data-about-composition]');
      const headline = document.querySelector('[data-about-headline]');
      const intro = document.querySelector('[data-about-intro]');
      const logo = document.querySelector('[data-about-emblem]');
      if (hero && composition && headline && intro && logo) {
        const box = composition.getBoundingClientRect();
        samples.push({
          time: performance.now(),
          state: hero.dataset.aboutEntrance,
          phase: hero.dataset.aboutHeroPhase,
          center: box.x + box.width / 2,
          top: box.top,
          width: box.width,
          transform: getComputedStyle(composition).transform,
          headline: Number(getComputedStyle(headline).opacity),
          intro: Number(getComputedStyle(intro).opacity),
          logo: Number(getComputedStyle(logo).opacity),
          overlay: document.querySelector('[data-signature-intro-overlay]') !== null,
        });
      }
      if (performance.now() < 6500) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

async function heroPixels(page: Page) {
  const box = await page.locator(hero).boundingBox();
  // Full-page capture can temporarily resize Chromium's viewport, which must
  // correctly release the real arrival. Observe the unchanged viewport here.
  const buffer = await page.screenshot({ animations: 'allow' });
  return sharp(buffer)
    .extract({
      left: Math.floor(box!.x),
      top: Math.floor(box!.y),
      width: Math.floor(box!.width),
      height: Math.floor(Math.min(box!.height, page.viewportSize()!.height - box!.y)),
    })
    .removeAlpha()
    .raw()
    .toBuffer();
}

function changedFraction(before: Buffer, after: Buffer) {
  expect(before.length).toBe(after.length);
  let changed = 0;
  for (let index = 0; index < before.length; index += 3) {
    if (
      Math.abs(before[index]! - after[index]!) +
        Math.abs(before[index + 1]! - after[index + 1]!) +
        Math.abs(before[index + 2]! - after[index + 2]!) >
      24
    )
      changed += 1;
  }
  return changed / (before.length / 3);
}

for (const width of [390, 1440]) {
  test(`actual centered founder/logo composition moves right and settles nonblockingly at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await sampleArrival(page);
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
    await expectReleased(page);
    await page.waitForFunction(
      () =>
        performance.now() -
          Number(
            document.querySelector<HTMLElement>('[data-about-hero]')!.dataset.aboutStartedAt,
          ) >=
        400,
    );
    const centeredPixels = await heroPixels(page);
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'settled');
    await expect(page.locator(hero)).toHaveAttribute('data-about-settle-reason', 'complete');
    const settledPixels = await heroPixels(page);
    await page.waitForTimeout(350);
    const stablePixels = await heroPixels(page);
    const frames = (await page.evaluate(() =>
      Reflect.get(window, '__aboutCorrectionFrames'),
    )) as ArrivalFrame[];
    const running = frames.filter(({ state }) => state === 'running');
    const final = frames.find(({ state }) => state === 'settled')!;
    // The very first observable paint must already be the centered arrival.
    // A settled SSR pose followed by a centered jump is a visible flash even
    // when every later frame of the main animation is correct.
    const beforeRunning = frames.filter(({ time }) => time <= running[0]!.time);
    for (const frame of beforeRunning) {
      expect(Math.abs(frame.center - width / 2)).toBeLessThan(width * 0.05);
      expect(frame.headline).toBeLessThan(0.05);
      expect(frame.intro).toBeLessThan(0.05);
    }
    // WAAPI and the phase-label timer can run on adjacent event-loop turns at
    // the hold/move boundary. Measure the actual approved first 600ms hold.
    const centerFrames = running.filter(
      ({ phase, time }) => phase === 'center' && time - running[0]!.time < 600,
    );
    expect(centerFrames.length).toBeGreaterThan(3);
    expect(Math.abs(centerFrames[0]!.center - width / 2)).toBeLessThan(width * 0.05);
    expect(
      Math.max(...centerFrames.map(({ center }) => center)) -
        Math.min(...centerFrames.map(({ center }) => center)),
    ).toBeLessThan(3);
    expect(Math.max(...centerFrames.map(({ logo }) => logo))).toBeGreaterThan(0.1);
    const distance = final.center - centerFrames[0]!.center;
    expect(distance).toBeGreaterThan(width < 768 ? 8 : width * 0.12);
    expect(
      running.some(
        ({ center }) =>
          center > centerFrames[0]!.center + distance * 0.2 &&
          center < final.center - distance * 0.2,
      ),
    ).toBe(true);
    expect(new Set(running.map(({ transform }) => transform)).size).toBeGreaterThan(5);
    expect(final.headline).toBe(1);
    expect(final.intro).toBe(1);
    expect(final.time - running[0]!.time).toBeLessThanOrEqual(4200);
    expect(frames.some(({ overlay }) => overlay)).toBe(false);
    const shiftedPixels = changedFraction(centeredPixels, settledPixels);
    const stable = changedFraction(settledPixels, stablePixels);
    expect(shiftedPixels).toBeGreaterThan(0.01);
    expect(stable).toBeLessThan(0.001);
    await expectFullPortrait(page);
    await test.info().attach('actual-center-to-right-evidence', {
      body: JSON.stringify({
        width,
        distance,
        centeredFrame: centerFrames[0],
        final,
        shiftedPixels,
        stable,
        frames,
      }),
      contentType: 'application/json',
    });
  });
}

test('direct, internal and refresh About arrivals stay nonblocking; Work is immediate and Home retains its full loop', async ({
  page,
}) => {
  await page.goto('/about');
  await expectReleased(page);
  await page.reload();
  await expectReleased(page);
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'About', exact: true })
    .click();
  await expect(page).toHaveURL('/about');
  await expectReleased(page);
  await page.locator('[data-site-header] a[href="/"]').first().click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro-mode', 'full');
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'completed');
  const elapsed = await page
    .locator('html')
    .evaluate(
      (node) =>
        Number((node as HTMLElement).dataset.signatureIntroEnded) -
        Number((node as HTMLElement).dataset.signatureIntroStarted),
    );
  expect(elapsed).toBeGreaterThanOrEqual(4190);
  await expect(page.locator(overlay)).toBeHidden();
});

for (const input of ['keyboard', 'scroll']) {
  test(`early ${input} settles the entrance without blocking content`, async ({ page }) => {
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
    if (input === 'keyboard') await page.keyboard.press('Tab');
    else await page.mouse.wheel(0, 180);
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'settled');
    await expectReleased(page);
    await expectFullPortrait(page);
  });
}

for (const mode of ['reduced', 'save-data', 'hidden', 'init-failure'] as const) {
  test(`${mode} provides the complete static story`, async ({ page }) => {
    if (mode === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (mode === 'save-data')
      await page.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
      });
    if (mode === 'hidden')
      await page.addInitScript(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          get: () => 'hidden',
        });
      });
    if (mode === 'init-failure')
      await page.addInitScript(() => {
        Object.defineProperty(window, 'IntersectionObserver', {
          configurable: true,
          value: undefined,
        });
      });
    await page.goto('/about');
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', /static|settled/);
    await expectReleased(page);
    await expectFullPortrait(page);
    for (const text of await page
      .locator(
        '[data-about-headline], [data-about-intro], [data-about-founder-name], [data-about-reveal]',
      )
      .all()) {
      await expect(text).toBeVisible();
      expect(await text.evaluate((node) => Number(getComputedStyle(node).opacity))).toBe(1);
    }
  });
}

test('changing motion preferences during arrival releases the full portrait immediately', async ({
  page,
}) => {
  await page.goto('/about', { waitUntil: 'commit' });
  await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', /static|settled/);
  await expectFullPortrait(page);
  await expectReleased(page);
});

test('no-JavaScript mobile story, native menu, portrait and invitation remain usable', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: viewportFor(390),
  });
  try {
    const page = await context.newPage();
    await page.goto('/about');
    await expectReleased(page);
    await expectFullPortrait(page);
    await expect(page.locator('[data-about-page] > section')).toHaveCount(7);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
    await page.locator('[data-menu-fallback] summary').click();
    await expect(
      page.locator('[data-menu-fallback]').getByRole('link', { name: 'Work', exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: aboutPage.invitation.cta.label, exact: true }).click();
    await expect(page).toHaveURL('/contact');
  } finally {
    await context.close();
  }
});

async function scrollProgress(page: Page, selector: string, progress: number) {
  await page.locator(selector).evaluate((node, value) => {
    const box = node.getBoundingClientRect();
    const absolute = box.top + scrollY;
    window.scrollTo({
      top: Math.max(0, absolute - innerHeight + (box.height + innerHeight) * value),
      behavior: 'instant',
    });
  }, progress);
  await page.waitForTimeout(450);
}

for (const width of [390, 1440]) {
  test(`origin and process drawing reverse with native scrolling; names and principles reveal once at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/about');
    await page.keyboard.press('Escape');
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', /settled|static/);
    for (const [selector, attribute, line] of [
      ['[data-about-story]', 'data-about-story-progress', '[data-about-story-line]'],
      ['[data-about-process-system]', 'data-about-process-progress', '[data-about-process-line]'],
    ]) {
      const samples: { progress: number; offset: number[]; scroll: number }[] = [];
      for (const position of [0.12, 0.78, 0.22]) {
        await scrollProgress(page, selector!, position);
        samples.push({
          progress: Number(await page.locator(selector!).getAttribute(attribute!)),
          offset: await page
            .locator(line!)
            .evaluateAll((nodes) =>
              nodes.map((node) => Number.parseFloat(getComputedStyle(node).strokeDashoffset)),
            ),
          scroll: await page.evaluate(() => scrollY),
        });
      }
      expect(samples[1]!.progress).toBeGreaterThan(samples[0]!.progress + 0.1);
      expect(samples[2]!.progress).toBeLessThan(samples[1]!.progress - 0.1);
      expect(
        samples[1]!.offset.some((value, index) => value < samples[0]!.offset[index]! - 0.1),
      ).toBe(true);
      expect(
        samples[2]!.offset.some((value, index) => value > samples[1]!.offset[index]! + 0.1),
      ).toBe(true);
      await test
        .info()
        .attach(attribute!, { body: JSON.stringify(samples), contentType: 'application/json' });
    }
    for (const target of await page
      .locator('[data-about-founder-name], [data-about-principle] h3')
      .all()) {
      await target.scrollIntoViewIfNeeded();
      await expect(target).toHaveAttribute('data-about-seen', 'true');
      await expect
        .poll(() => target.evaluate((node) => getComputedStyle(node).transform))
        .toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);
    for (const target of await page
      .locator('[data-about-founder-name], [data-about-principle] h3')
      .all()) {
      await expect(target).toHaveAttribute('data-about-seen', 'true');
      expect(await target.evaluate((node) => Number(getComputedStyle(node).opacity))).toBe(1);
    }
    expect(await page.locator('[data-about-page] .pin-spacer').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
