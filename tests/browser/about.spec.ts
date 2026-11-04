import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';
import { aboutPage } from '../../src/data/about';
import { serviceIndex } from '../../src/data/service-index';

const hero = '[data-about-hero]';
const overlay = '[data-signature-intro-overlay]';
const portrait = `${hero} [data-founder-portrait]`;
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
  expect(geometry.art.width).toBeGreaterThan(page.viewportSize()!.width * 0.3);
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

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`premium hero and seven editorial chapters preserve copy, links, layout and accessibility at ${width}px`, async ({
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
    await expect(page.locator('[data-about-editorial] > section')).toHaveCount(7);
    expect(
      await page
        .locator('[data-about-editorial] > section')
        .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.aboutSection)),
    ).toEqual(['01', '02', '03', '04', '05', '06', '07']);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Two twins. One idea. A whole lot of creativity.',
    );
    for (const chapter of [
      aboutPage.origin,
      aboutPage.founders,
      aboutPage.philosophy,
      aboutPage.approach,
      aboutPage.invitation,
    ])
      await expect(
        page.getByRole('heading', { level: 2, name: chapter.heading, exact: true }),
      ).toBeVisible();
    for (const copy of [
      ...aboutPage.hero.paragraphs,
      ...aboutPage.origin.paragraphs,
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
      ...aboutPage.approach.phases.flatMap(({ description }) => [description]),
    ])
      await expect(page.locator('[data-about-page]')).toContainText(copy);
    await expect(page.locator('[data-about-intro] > p')).toHaveText([...aboutPage.hero.paragraphs]);
    await expect(page.locator('[data-about-invitation] h2')).toHaveText(
      "Have something in mind? Let's make it matter.",
    );
    await expect(page.locator('[data-about-invitation]')).toContainText(
      'Every meaningful brand starts somewhere. Tell us where yours begins.',
    );
    await expectFullPortrait(page);
    await expect(page.locator(`${hero} [data-about-plaque] img`)).toHaveAttribute(
      'src',
      /emblem-plaque/,
    );
    await expect(page.locator(`${hero} [data-about-plaque]`)).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator(`${hero} .about-hero__circle`)).toHaveCount(0);
    await expect(page.locator(hero)).not.toContainText(aboutPage.hero.eyebrow);
    await expect(page.locator('[data-about-gradient]')).toBeVisible();
    await expect(page.locator('[data-about-gradient]')).toHaveAttribute('aria-hidden', 'true');
    const heroColor = await page
      .locator(hero)
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(
      Math.max(
        ...heroColor
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number),
      ),
    ).toBeLessThan(60);
    for (const text of await page
      .locator(
        '[data-about-page] h1, [data-about-page] h2, [data-about-page] h3, [data-about-founder-name]',
      )
      .all())
      await textFits(text, width);
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('h1')!.getBoundingClientRect();
      const art = document.querySelector('[data-about-portrait]')!.getBoundingClientRect();
      const intro = document.querySelector('[data-about-intro]')!.getBoundingClientRect();
      return {
        headingBottom: heading.bottom,
        headingLeft: heading.left,
        portraitLeft: art.left,
        portraitTop: art.top,
        portraitBottom: art.bottom,
        introTop: intro.top,
      };
    });
    if (width < 768) {
      expect(layout.portraitTop).toBeGreaterThanOrEqual(layout.headingBottom - 8);
      expect(layout.introTop).toBeGreaterThanOrEqual(layout.portraitBottom - 1);
    } else expect(layout.portraitLeft).toBeGreaterThan(layout.headingLeft);
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
    for (const [slug, service] of Object.entries(serviceIndex)) {
      const link = page.locator(`[data-about-capabilities] a[href="/services/${slug}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAccessibleName(
        new RegExp(service.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
    }
    const cta = page.getByRole('link', { name: aboutPage.invitation.cta.label, exact: true });
    await cta.focus();
    await expect(cta).toBeFocused();
    expect(await cta.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    expect((await cta.boundingBox())!.height).toBeGreaterThanOrEqual(44);
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
  scene?: string;
  headline: number;
  artwork: number;
  plaque: number;
  gradient: number;
  paragraphs: number[];
  overlay: boolean;
  heroHeight: number;
}

async function sampleArrival(page: Page) {
  await page.addInitScript(() => {
    const samples: unknown[] = [];
    Reflect.set(window, '__aboutPremiumFrames', samples);
    function opacity(node: Element | null): number {
      if (!node) return -1;
      let value = 1;
      for (let ancestor: Element | null = node; ancestor; ancestor = ancestor.parentElement)
        value *= Number(getComputedStyle(ancestor).opacity);
      return value;
    }
    function frame() {
      const hero = document.querySelector<HTMLElement>('[data-about-hero]');
      if (hero)
        samples.push({
          time: performance.now(),
          state: hero.dataset.aboutEntrance,
          scene: hero.dataset.aboutArrivalScene,
          headline: opacity(hero.querySelector('[data-about-headline]')),
          artwork: opacity(hero.querySelector('[data-about-artwork]')),
          plaque: opacity(hero.querySelector('[data-about-plaque]')),
          gradient: opacity(hero.querySelector('[data-about-gradient]')),
          paragraphs: [...hero.querySelectorAll('[data-about-hero-paragraph]')].map(opacity),
          overlay: document.querySelector('[data-signature-intro-overlay]') !== null,
          heroHeight: hero.getBoundingClientRect().height,
        });
      if (performance.now() < 6500) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

for (const width of [390, 1440]) {
  test(`portrait, approved plaque, atmosphere and copy arrive in order within four seconds at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await sampleArrival(page);
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
    await expectReleased(page);
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'settled');
    await expect(page.locator(hero)).toHaveAttribute('data-about-settle-reason', 'complete');
    const frames = (await page.evaluate(() =>
      Reflect.get(window, '__aboutPremiumFrames'),
    )) as ArrivalFrame[];
    const running = frames.filter(({ state }) => state === 'running');
    const final = frames.find(({ state }) => state === 'settled')!;
    expect(running.length).toBeGreaterThan(20);
    const firstPortrait = running.find(({ artwork }) => artwork >= 0.8)!;
    const firstPlaque = running.find(({ plaque }) => plaque >= 0.15)!;
    const firstAtmosphere = running.find(({ gradient }) => gradient >= 0.15)!;
    const firstHeadline = running.find(({ headline }) => headline >= 0.15)!;
    const firstCopy = running.find(({ paragraphs }) => paragraphs.some((value) => value >= 0.15))!;
    for (const sample of [
      firstPortrait,
      firstPlaque,
      firstAtmosphere,
      firstHeadline,
      firstCopy,
      final,
    ])
      expect(sample).toBeDefined();
    expect(firstPortrait.time).toBeLessThan(firstPlaque.time);
    expect(firstPlaque.time).toBeLessThan(firstAtmosphere.time);
    expect(firstAtmosphere.time).toBeLessThan(firstHeadline.time);
    expect(firstHeadline.time).toBeLessThan(firstCopy.time);
    for (const key of ['artwork', 'plaque', 'gradient', 'headline'] as const) {
      expect(running.some((frame) => frame[key] > 0.1 && frame[key] < 0.9)).toBe(true);
      expect(final[key]).toBe(1);
    }
    expect(final.paragraphs).toEqual([1, 1, 1]);
    expect(final.time - running[0]!.time).toBeGreaterThanOrEqual(3000);
    expect(final.time - running[0]!.time).toBeLessThanOrEqual(4000);
    expect(final.time).toBeLessThanOrEqual(4500);
    expect(frames.some(({ overlay }) => overlay)).toBe(false);
    expect(
      Math.max(...running.map((frame) => frame.heroHeight)) -
        Math.min(...running.map((frame) => frame.heroHeight)),
    ).toBeLessThan(2);
    await expectFullPortrait(page);
    await test.info().attach('real-arrival-opacity-and-timing', {
      body: JSON.stringify({
        width,
        firstPortrait,
        firstPlaque,
        firstAtmosphere,
        firstHeadline,
        firstCopy,
        final,
        frames,
      }),
      contentType: 'application/json',
    });
  });
}

async function heroPixels(page: Page) {
  const box = await page.locator(hero).boundingBox();
  const buffer = await page.screenshot({ animations: 'allow' });
  return sharp(buffer)
    .extract({
      left: Math.floor(box!.x),
      top: Math.max(0, Math.floor(box!.y)),
      width: Math.floor(box!.width),
      height: Math.floor(Math.min(box!.height, page.viewportSize()!.height - Math.max(0, box!.y))),
    })
    .removeAlpha()
    .raw()
    .toBuffer();
}
function changedFraction(before: Buffer, after: Buffer) {
  expect(before.length).toBe(after.length);
  let changed = 0;
  for (let index = 0; index < before.length; index += 3)
    if (
      Math.abs(before[index]! - after[index]!) +
        Math.abs(before[index + 1]! - after[index + 1]!) +
        Math.abs(before[index + 2]! - after[index + 2]!) >
      24
    )
      changed += 1;
  return changed / (before.length / 3);
}

for (const width of [390, 1440]) {
  test(`localized atmosphere visibly moves after arrival and pauses offscreen at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/about');
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'settled');
    await expect(page.locator(hero)).toHaveAttribute('data-about-ambient', 'running');
    const before = await heroPixels(page);
    const copyGeometry = () =>
      page.locator('[data-about-headline], [data-about-intro] > p').evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            opacity: getComputedStyle(node).opacity,
            transform: getComputedStyle(node).transform,
          };
        }),
      );
    const stableCopy = await copyGeometry();
    await page.waitForTimeout(1100);
    const changed = changedFraction(before, await heroPixels(page));
    expect(changed).toBeGreaterThan(0.0001);
    expect(await copyGeometry()).toEqual(stableCopy);
    await page.locator('[data-about-philosophy]').scrollIntoViewIfNeeded();
    await expect(page.locator(hero)).toHaveAttribute('data-about-ambient', 'paused');
    expect(
      await page
        .locator('[data-about-gradient] span')
        .evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).animationPlayState === 'paused'),
        ),
    ).toBe(true);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator(hero)).toHaveAttribute('data-about-ambient', 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-ambient', 'paused');
    await test.info().attach('visible-ambient-pixel-change', {
      body: JSON.stringify({ width, changed }),
      contentType: 'application/json',
    });
  });
}

test('direct, internal and refresh About arrivals stay nonblocking; Home retains its full loop', async ({
  page,
}) => {
  await page.goto('/about');
  await expectReleased(page);
  await page.reload();
  await expectReleased(page);
  await page.locator('[data-site-header]').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL('/work');
  await expect(page.locator(overlay)).toBeHidden();
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
  expect(elapsed).toBeLessThanOrEqual(5000);
  await expect(page.locator(overlay)).toBeHidden();
});

for (const input of ['keyboard', 'scroll']) {
  test(`early ${input} settles the entrance without blocking content`, async ({ page }) => {
    await page.goto('/about', { waitUntil: 'commit' });
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', 'running');
    if (input === 'keyboard') await page.keyboard.press('Tab');
    else await page.mouse.wheel(0, 180);
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', /static|settled/);
    await expectReleased(page);
    await expectFullPortrait(page);
    expect(
      await page
        .locator('[data-about-headline], [data-about-intro] > p, [data-about-plaque]')
        .evaluateAll((nodes) =>
          nodes.every((node) => Number(getComputedStyle(node).opacity) === 1),
        ),
    ).toBe(true);
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
        '[data-about-headline], [data-about-intro], [data-about-intro] > p, [data-about-founder-name], [data-about-reveal]',
      )
      .all()) {
      await expect(text).toBeVisible();
      expect(await text.evaluate((node) => Number(getComputedStyle(node).opacity))).toBe(1);
    }
  });
}

test('changing motion preferences during arrival releases the full composition immediately', async ({
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
    await expect(page.locator('[data-about-editorial] > section')).toHaveCount(7);
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

for (const width of [390, 1440]) {
  test(`story panels, names and principles reveal once without trapping native backscroll at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewportFor(width));
    await page.goto('/about');
    await page.keyboard.press('Escape');
    await expect(page.locator(hero)).toHaveAttribute('data-about-entrance', /settled|static/);
    const targets = page.locator(
      '[data-about-story-panel], [data-about-founder-name], [data-about-principle] h3',
    );
    for (const target of await targets.all()) {
      await target.scrollIntoViewIfNeeded();
      await expect(target).toHaveAttribute('data-about-seen', 'true');
      await expect
        .poll(() => target.evaluate((node) => getComputedStyle(node).transform))
        .toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    for (const target of await targets.all()) {
      await expect(target).toHaveAttribute('data-about-seen', 'true');
      expect(await target.evaluate((node) => Number(getComputedStyle(node).opacity))).toBe(1);
    }
    expect(await page.locator('[data-about-page] .pin-spacer').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
