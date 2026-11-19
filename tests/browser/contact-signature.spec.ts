import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

const thought = '[data-first-thought]';
const fixtureEndpoint = 'https://formspree.io/f/contactsignaturefixture';
const sizes = [320, 390, 768, 1024, 1440, 1920];

async function openContact(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
  await page.goto('/contact', { waitUntil: 'commit' });
  await expect(page.locator(thought)).toBeVisible();
  await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
  await expect(page.locator('[data-enquiry-form]')).toHaveAttribute('data-enhanced', 'true');
}

async function playing(page: Page) {
  await expect(page.locator(thought)).toHaveAttribute('data-thought-state', 'playing');
}

async function settled(page: Page) {
  await expect(page.locator(thought)).toHaveAttribute('data-thought-state', 'settled');
  await expect(page.locator(thought)).toHaveAttribute('data-thought-phase', 'conversation');
}

async function visualState(page: Page) {
  return page.locator(thought).evaluate((root) => {
    const stroke = root.querySelector('[data-thought-stroke]');
    const style = stroke ? getComputedStyle(stroke) : null;
    const box = root.getBoundingClientRect();
    const drawing = root.querySelector('svg')!.getBoundingClientRect();
    const hitTests = [0.2, 0.5, 0.8].map((fraction) => {
      const x = drawing.left + drawing.width * fraction;
      const y = drawing.top + drawing.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        x,
        y,
        inViewport: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight,
        unobstructed: Boolean(hit && root.contains(hit)),
        hitTag: hit?.tagName,
        hitClass: hit?.getAttribute('class'),
      };
    });
    return {
      state: root.getAttribute('data-thought-state'),
      phase: root.getAttribute('data-thought-phase'),
      time: Number(root.getAttribute('data-thought-time')),
      reason: root.getAttribute('data-thought-reason'),
      hitTests,
      dash: style?.strokeDashoffset,
      opacity: style?.opacity,
      box: { left: box.left, top: box.top, width: box.width, height: box.height },
    };
  });
}

async function configureFixture(page: Page, respond: (route: Route) => Promise<void>) {
  await page.route(fixtureEndpoint, respond);
  await page.route('**/contact', async (route) => {
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(/<form\b[^>]*\bdata-enquiry-form\b[^>]*>/, (tag) => {
      const clean = tag
        .replace(/\sdata-endpoint(?:="[^"]*")?(?=\s|>)/, '')
        .replace(/\saction="[^"]*"/, '');
      return clean.replace(
        />$/,
        ` data-endpoint="${fixtureEndpoint}" action="${fixtureEndpoint}">`,
      );
    });
    html = html.replace(/<button\b[^>]*\bdata-submit-enquiry\b[^>]*>/, (tag) =>
      tag.replace(/\sdisabled(?:="[^"]*")?/, ''),
    );
    await route.fulfill({ response, body: html });
  });
}

async function fillEnquiry(page: Page) {
  const form = page.locator('[data-enquiry-form]');
  await form.locator('[name="name"]').fill('Jamie Example');
  await form.locator('[name="email"]').fill('jamie@example.com');
  await form.locator('[name="service"]').selectOption('not-sure');
  await form
    .locator('[name="description"]')
    .fill('We have a first idea and would like to discuss it.');
}

async function confirmationPainted(page: Page) {
  return page.locator('[data-form-confirmation]').evaluate((node) => {
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    return (
      !node.hasAttribute('hidden') &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0.01 &&
      box.width > 0 &&
      box.height > 0
    );
  });
}

for (const width of sizes) {
  test(`Contact introduction, artwork, labels and direct methods are usable at ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openContact(page, width);
    await page.evaluate(() => document.fonts.ready);
    await settled(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Have something in mind?',
    );
    await expect(page.locator('main')).toContainText(
      "You don't need a perfect brief. You just need somewhere to start.",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const svg = page.locator(`${thought} svg`).first();
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(await svg.evaluate((node) => getComputedStyle(node).pointerEvents)).toBe('none');
    const bounds = await svg.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    if (width < 640) expect(bounds!.height).toBeLessThanOrEqual(200);
    const name = page.locator('[data-enquiry-form] [name="name"]');
    const position = await name.evaluate((node) => node.getBoundingClientRect().top + scrollY);
    if (width < 640) expect(position).toBeLessThanOrEqual(844 * 1.6);
    await test.info().attach(`contact-layout-${width}`, {
      body: JSON.stringify({
        width,
        inputDocumentTop: position,
        drawing: bounds,
        heading: await page.locator('main h1').evaluate((node) => ({
          text: node.textContent?.replace(/\s+/g, ' ').trim(),
          fontSize: getComputedStyle(node).fontSize,
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        })),
      }),
      contentType: 'application/json',
    });
    if (width >= 1024) {
      const lines = await page
        .locator('main h1')
        .evaluate(
          (node) =>
            node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight),
        );
      expect(lines).toBeLessThanOrEqual(2.1);
    }
    if ([320, 390, 1440, 1920].includes(width))
      await page.screenshot({ path: `artifacts/contact-signature/contact-review-${width}.png` });
    for (const href of [
      'mailto:official@drawnoutdigital.com',
      'tel:+923019719288',
      'https://wa.me/923019719288',
      'https://www.facebook.com/DrawnOutDigital/',
      'https://www.instagram.com/drawnout_digital/',
      'https://www.linkedin.com/company/drawnout-digital/',
    ]) {
      const link = page.locator(`main a[href="${href}"]`).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAccessibleName(/\S/);
    }
    await name.focus();
    await expect(name).toBeFocused();
    expect(await name.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`a cold normal-motion ${width}px Contact visit exposes artwork and accepts immediate pointer input`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openContact(page, width);
    await playing(page);
    const arrival = await visualState(page);
    expect(arrival.time).toBeLessThan(1.15);
    expect(arrival.hitTests.every((hit) => hit.inViewport && hit.unobstructed)).toBe(true);
    const anchor = page.locator('main a[href="#enquiry"]').first();
    const target = await anchor.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      return { x, y, unobstructed: node.contains(document.elementFromPoint(x, y)) };
    });
    expect(target.unobstructed).toBe(true);
    // Raw pointer input has no locator actionability wait that could hide an arrival overlay.
    await page.mouse.click(target.x, target.y);
    await expect(page).toHaveURL(/\/contact#enquiry$/, { timeout: 1000 });
    const name = page.locator('[data-enquiry-form] [name="name"]');
    await name.scrollIntoViewIfNeeded({ timeout: 1000 });
    const input = await name.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      return { x, y, unobstructed: document.elementFromPoint(x, y) === node };
    });
    expect(input.unobstructed).toBe(true);
    await page.mouse.click(input.x, input.y);
    await page.keyboard.type('An immediate first thought');
    await expect(name).toBeFocused();
    await expect(name).toHaveValue('An immediate first thought');
    await settled(page);
    await expect(page.locator('[data-form-status]')).toBeEmpty();
  });
}

for (const width of [390, 1440]) {
  test(`the actual ${width}px drawing has distinct phases, finishes once and leaves the form available`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openContact(page, width);
    await playing(page);
    const samples: Awaited<ReturnType<typeof visualState>>[] = [];
    const began = Date.now();
    while (Date.now() - began < 8_000) {
      samples.push(await visualState(page));
      if (samples.at(-1)?.state === 'settled') break;
      await page.waitForTimeout(80);
    }
    await settled(page);
    await expect(page.locator('[data-signature-intro-overlay]')).toHaveCount(0);
    for (const sample of samples)
      expect(sample.hitTests.every((hit) => hit.inViewport && hit.unobstructed)).toBe(true);
    const phases = new Set(samples.map((sample) => sample.phase));
    expect(phases.has('thought')).toBe(true);
    expect(phases.has('connection')).toBe(true);
    expect(phases.has('conversation')).toBe(true);
    expect(new Set(samples.map((sample) => sample.dash)).size).toBeGreaterThan(8);
    const final = await visualState(page);
    expect(final.time).toBeGreaterThanOrEqual(4);
    expect(final.time).toBeLessThanOrEqual(6);
    const form = page.locator('[data-enquiry-form]');
    await expect(form).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
    await expect(page.locator('[data-form-status]')).toBeEmpty();
    const rects = samples.map((sample) => sample.box);
    expect(
      Math.max(...rects.map((rect) => rect.height)) - Math.min(...rects.map((rect) => rect.height)),
    ).toBeLessThanOrEqual(1);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(500);
    expect((await visualState(page)).state).toBe('settled');
    expect((await visualState(page)).time).toBe(final.time);
    await page.evaluate(() => {
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
    });
    await page.waitForTimeout(150);
    expect((await visualState(page)).state).toBe('settled');
    expect((await visualState(page)).time).toBe(final.time);
    await test.info().attach(`actual-contact-drawing-${width}`, {
      body: JSON.stringify({
        method: 'Natural production playback; no animation seeking',
        samples,
      }),
      contentType: 'application/json',
    });
  });
}

for (const width of [390, 1440]) {
  test(`focusing a real form input during ${width}px motion settles artwork without displacing the field`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openContact(page, width);
    await playing(page);
    const input = page.locator('[data-enquiry-form] [name="name"]');
    await input.focus();
    await input.fill('A first thought');
    await settled(page);
    await page.evaluate(() => document.fonts.ready);
    const before = await input.boundingBox();
    await page.waitForTimeout(900);
    const after = await input.boundingBox();
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.x - before!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('A first thought');
    await expect(page.locator('[data-form-status]')).toBeEmpty();
  });
}

for (const mode of ['reduced', 'save-data', 'no-javascript'] as const) {
  test(`${mode} shows the complete static drawing and usable Contact content`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: mode !== 'no-javascript',
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    if (mode === 'save-data')
      await context.addInitScript(() => {
        const connection = new EventTarget();
        Object.defineProperty(connection, 'saveData', { value: true });
        Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
      });
    const page = await context.newPage();
    await page.goto('/contact');
    await settled(page);
    expect(Number(await page.locator(thought).getAttribute('data-thought-time'))).toBe(4.8);
    const stroke = page.locator('[data-thought-stroke]');
    expect(Number(await stroke.evaluate((node) => getComputedStyle(node).opacity))).toBeGreaterThan(
      0.9,
    );
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('[data-enquiry-form] [name="name"]')).toBeEditable();
    await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
    await expect(
      page.locator('main a[href="mailto:official@drawnoutdigital.com"]').first(),
    ).toBeVisible();
    if (mode !== 'no-javascript')
      await expect(page.locator('[data-enquiry-form]')).toHaveAttribute('data-enhanced', 'true');
    await context.close();
  });
}

test('failed decorative script loading leaves the settled drawing and independent enquiry enhancement', async ({
  page,
}) => {
  let blocked = 0;
  await page.route(/\/_astro\/FirstThought[^/]*\.js$/, async (route) => {
    blocked += 1;
    await route.abort('failed');
  });
  await openContact(page);
  expect(blocked).toBeGreaterThan(0);
  await settled(page);
  await expect(page.locator('[data-enquiry-form] [name="name"]')).toBeEditable();
  await expect(page.locator('[data-form-status]')).toBeEmpty();
  expect(await confirmationPainted(page)).toBe(false);
});

test('native input remains usable before delayed motion initialization and cannot trigger a late replay', async ({
  page,
}) => {
  let release: (() => void) | undefined;
  let delayed = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_astro\/FirstThought[^/]*\.js$/, async (route) => {
    delayed += 1;
    await gate;
    await route.continue();
  });
  await page.goto('/contact', { waitUntil: 'commit' });
  const input = page.locator('[data-enquiry-form] [name="name"]');
  await expect(input).toBeVisible();
  await input.focus();
  await input.fill('Already writing');
  release!();
  await expect(page.locator('[data-enquiry-form]')).toHaveAttribute('data-enhanced', 'true');
  expect(delayed).toBeGreaterThan(0);
  await settled(page);
  await page.waitForTimeout(700);
  await settled(page);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Already writing');
});

test('a live reduced-motion change settles the drawing without changing enquiry state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openContact(page);
  await playing(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  expect(Number(await page.locator(thought).getAttribute('data-thought-time'))).toBe(4.8);
  await expect(page.locator('[data-form-state]')).toHaveAttribute(
    'data-form-state',
    'unconfigured',
  );
  await expect(page.locator('[data-form-status]')).toBeEmpty();
});

test('the visibility handler pauses active drawing time and resumes without a restart', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openContact(page);
  await playing(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator(thought)).toHaveAttribute('data-thought-state', 'paused');
  const before = await visualState(page);
  await page.waitForTimeout(700);
  const after = await visualState(page);
  expect(Math.abs(after.time - before.time)).toBeLessThanOrEqual(0.02);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await playing(page);
  expect((await visualState(page)).time).toBeGreaterThanOrEqual(before.time);
  await settled(page);
});

test('native offscreen scrolling pauses the decorative clock without holding the page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openContact(page);
  await playing(page);
  await page.mouse.wheel(0, 1200);
  await expect(page.locator(thought)).toHaveAttribute('data-thought-state', 'paused');
  const before = await visualState(page);
  await page.waitForTimeout(700);
  const after = await visualState(page);
  expect(Math.abs(after.time - before.time)).toBeLessThanOrEqual(0.02);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await page.mouse.wheel(0, -10000);
  await playing(page);
  expect((await visualState(page)).time).toBeGreaterThanOrEqual(before.time);
  await settled(page);
});

test('native early anchor navigation reaches the enquiry while the artwork is active', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openContact(page, 390);
  await playing(page);
  await page.locator('main a[href="#enquiry"]').first().click();
  await expect(page).toHaveURL(/\/contact#enquiry$/);
  const name = page.locator('[data-enquiry-form] [name="name"]');
  await name.focus();
  await name.fill('Jamie');
  await expect(name).toBeFocused();
  await expect(name).toHaveValue('Jamie');
  await settled(page);
});

test('a genuine intercepted provider acknowledgement alone permits the confirmation accent', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release: (() => void) | undefined;
  const responseReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  await configureFixture(page, async (route) => {
    await responseReady;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await openContact(page);
  expect(await confirmationPainted(page)).toBe(false);
  await fillEnquiry(page);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-form-state]')).toHaveAttribute('data-form-state', 'submitting');
  expect(await confirmationPainted(page)).toBe(false);
  release!();
  await expect(page.locator('[data-form-state]')).toHaveAttribute('data-form-state', 'success');
  await expect.poll(() => confirmationPainted(page)).toBe(true);
  await expect(page.locator('[data-form-status]')).toContainText('form service has accepted');
  await expect(page.locator('[data-form-status]')).not.toContainText(
    /delivered to|inbox delivery/i,
  );
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Start another enquiry', exact: true }).click();
  expect(await confirmationPainted(page)).toBe(false);
  await expect(page.locator('[data-enquiry-form] [name="name"]')).toBeFocused();
});

for (const fixture of [
  { name: 'provider rejection', status: 422, body: '{"error":"Rejected"}' },
  { name: 'ambiguous successful HTTP', status: 200, body: '{"ok":false}' },
  { name: 'contradictory acknowledgement', status: 200, body: '{"ok":true,"errors":["Rejected"]}' },
]) {
  test(`${fixture.name} cannot show the confirmation accent or erase submitted input`, async ({
    page,
  }) => {
    await configureFixture(page, async (route) => {
      await route.fulfill({
        status: fixture.status,
        contentType: 'application/json',
        body: fixture.body,
      });
    });
    await openContact(page);
    await fillEnquiry(page);
    await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
    await expect(page.locator('[data-form-state]')).toHaveAttribute('data-form-state', 'error');
    expect(await confirmationPainted(page)).toBe(false);
    await expect(page.locator('[name="name"]')).toHaveValue('Jamie Example');
    await expect(page.locator('[data-form-status]')).not.toContainText('Enquiry received');
  });
}
