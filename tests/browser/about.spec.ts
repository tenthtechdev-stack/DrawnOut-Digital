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
  expect(geometry.art.width).toBeGreaterThan(viewportWidth * (viewportWidth < 768 ? 0.8 : 0.35));
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

async function crop(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box).not.toBeNull();
  const buffer = await page.screenshot({ fullPage: true, animations: 'allow' });
  return sharp(buffer)
    .extract({
      left: Math.floor(box!.x),
      top: Math.floor(box!.y),
      width: Math.floor(box!.width),
      height: Math.floor(box!.height),
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function pixelsChanged(before: Buffer, after: Buffer) {
  expect(before.length).toBe(after.length);
  let changed = 0;
  let difference = 0;
  for (let index = 0; index < before.length; index += 3) {
    const distance =
      Math.abs(before[index]! - after[index]!) +
      Math.abs(before[index + 1]! - after[index + 1]!) +
      Math.abs(before[index + 2]! - after[index + 2]!);
    difference += distance;
    if (distance > 24) changed += 1;
  }
  return { fraction: changed / (before.length / 3), mean: difference / before.length };
}

for (const width of [390, 1440]) {
  test(`real hero frames draw and settle once within 4.2 seconds at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.addInitScript(() => {
      const samples: unknown[] = [];
      Reflect.set(window, '__aboutSamples', samples);
      function sample() {
        const entrance = document.querySelector<HTMLElement>('[data-about-hero]');
        const line = document.querySelector('[data-about-hero-line]');
        const headline = document.querySelector('[data-about-headline]');
        const masks = [...document.querySelectorAll('[data-about-mask]')];
        if (entrance && line && headline)
          samples.push({
            time: performance.now(),
            state: entrance.dataset.aboutEntrance,
            line: getComputedStyle(line).strokeDashoffset,
            headline: getComputedStyle(headline).transform,
            masks: masks.map((node) => getComputedStyle(node).strokeDashoffset).join('|'),
            overlayVisible: [...document.querySelectorAll('[data-signature-intro-overlay]')].some(
              (node) =>
                getComputedStyle(node).visibility !== 'hidden' &&
                getComputedStyle(node).display !== 'none',
            ),
          });
        if (performance.now() < 6000) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
    await expectReleased(page);
    await page.waitForTimeout(1000);
    const early = await crop(page, portrait);
    await page.waitForTimeout(900);
    const middle = await crop(page, portrait);
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'settled');
    const finished = await crop(page, portrait);
    await expect(page.locator(hero)).toHaveAttribute('data-about-settle-reason', 'complete');
    await page.waitForTimeout(600);
    const stable = await crop(page, portrait);
    const observations = (await page.evaluate(() => Reflect.get(window, '__aboutSamples'))) as {
      time: number;
      state: string;
      line: string;
      headline: string;
      masks: string;
      overlayVisible: boolean;
    }[];
    const running = observations.filter(({ state }) => state === 'running');
    const settled = observations.find(({ state }) => state === 'settled');
    expect(running.length).toBeGreaterThan(8);
    expect(new Set(running.map(({ line }) => line)).size).toBeGreaterThan(3);
    expect(new Set(running.map(({ headline }) => headline)).size).toBeGreaterThan(3);
    expect(new Set(running.map(({ masks }) => masks)).size).toBeGreaterThan(3);
    expect(settled!.time - running[0]!.time).toBeLessThanOrEqual(4200);
    expect(observations.some(({ overlayVisible }) => overlayVisible)).toBe(false);
    const earlyToMiddle = pixelsChanged(early.data, middle.data);
    const middleToFinished = pixelsChanged(middle.data, finished.data);
    const afterSettle = pixelsChanged(finished.data, stable.data);
    expect(earlyToMiddle.fraction + middleToFinished.fraction).toBeGreaterThan(0.005);
    expect(afterSettle.fraction).toBeLessThan(0.001);
    await expectFullPortrait(page);
    await test.info().attach('rendered-frame-evidence', {
      body: JSON.stringify({
        width,
        earlyToMiddle,
        middleToFinished,
        afterSettle,
        firstRunning: running[0],
        firstSettled: settled,
        samples: observations,
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
