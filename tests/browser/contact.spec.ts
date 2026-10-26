import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

// This deliberately non-production identifier exists only in intercepted test HTML.
// Every request to it is intercepted; these checks do not send an email.
const fixtureEndpoint = 'https://formspree.io/f/contacttestfixture';
const email = 'official@drawnoutdigital.com';

async function configuredForm(page: Page, respond: (route: Route) => Promise<void>) {
  await page.route(fixtureEndpoint, respond);
  await interceptConfiguredHTML(page);
  await page.goto('/contact');
  await expect(page.locator('[data-enquiry-form]')).toHaveAttribute('data-enhanced', 'true');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeEnabled();
}

async function interceptConfiguredHTML(page: Page) {
  await page.route('**/contact', async (route) => {
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(/<form\b[^>]*\bdata-enquiry-form\b[^>]*>/, (tag) => {
      const attributes = tag
        .replace(/\sdata-endpoint(?:="[^"]*")?(?=\s|>)/, '')
        .replace(/\saction="[^"]*"/, '');
      return attributes.replace(
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
  await form.locator('[name="name"]').fill('Alex Example');
  await form.locator('[name="email"]').fill('alex@example.com');
  await form.locator('[name="service"]').selectOption('not-sure');
  await form
    .locator('[name="description"]')
    .fill('We are exploring a new visual identity and would like to discuss the project.');
}

async function accepted(route: Route) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const width of [390, 768, 1440]) {
  test(`Contact is responsive and accessible at ${width}px with official contact links`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/contact');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Have something in mind?',
    );
    await expect(page.locator('main')).toContainText(
      "You don't need a perfect brief. You just need somewhere to start.",
    );
    const links = [
      `mailto:${email}`,
      'tel:+923019719288',
      'https://wa.me/923019719288',
      'https://www.facebook.com/DrawnOutDigital/',
      'https://www.instagram.com/drawnout_digital/',
      'https://www.linkedin.com/company/drawnout-digital/',
    ];
    for (const href of links) {
      const link = page.locator(`main a[href="${href}"]`).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAccessibleName(/\S/);
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    }
    const form = page.locator('[data-enquiry-form]');
    for (const name of ['name', 'email', 'service', 'description', 'company', 'phone', 'budget']) {
      const field = form.locator(`[name="${name}"]`);
      await expect(field).toHaveAccessibleName(/\S/);
      const bounds = await field.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBeGreaterThan(120);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
    await expect(page.locator('[data-site-footer]')).toBeVisible();
  });
}

test('an unconfigured form never posts or reports success and offers email instead', async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') submissions.push(request.url());
  });
  await page.goto('/contact');
  const form = page.locator('[data-enquiry-form]');
  await expect(form).toHaveAttribute('data-enhanced', 'true');
  await expect(form).not.toHaveAttribute('action');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await expect(page.locator('main')).toContainText('not connected yet');
  await expect(page.locator(`main a[href="mailto:${email}"]`).first()).toBeVisible();
  await fillEnquiry(page);
  await form.dispatchEvent('submit', { bubbles: true, cancelable: true });
  await expect(page.locator('[data-form-status]')).not.toContainText('Enquiry received');
  expect(submissions).toEqual([]);
});

test('no JavaScript leaves the unconfigured form safe and direct contact usable', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.goto('/contact');
  const form = page.locator('[data-enquiry-form]');
  await expect(form).not.toHaveAttribute('action');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await expect(page.locator(`main a[href="mailto:${email}"]`).first()).toBeVisible();
  await expect(page.locator('main a[href="https://wa.me/923019719288"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-site-footer]')).toBeVisible();
  await fillEnquiry(page);
  await form.locator('[name="email"]').press('Enter');
  await expect(page).toHaveURL('/contact');
  expect(posts).toEqual([]);
  await context.close();
});

test('required fields announce errors, focus the summary and link back to controls', async ({
  page,
}) => {
  let requests = 0;
  await configuredForm(page, async (route) => {
    requests += 1;
    await accepted(route);
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  const summary = page.locator('[data-error-summary]');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  for (const name of ['name', 'email', 'service', 'description']) {
    const field = page.locator(`[data-enquiry-form] [name="${name}"]`);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    const errorIds = (await field.getAttribute('aria-describedby'))!.split(/\s+/);
    expect(errorIds.length).toBeGreaterThan(0);
    const errorId = errorIds.find((id) => id.endsWith('-error'));
    expect(errorId).toBeTruthy();
    await expect(page.locator(`[id="${errorId}"]`)).toContainText(/\S/);
  }
  const firstError = summary.getByRole('link').first();
  const target = await firstError.getAttribute('href');
  await firstError.click();
  await expect(page.locator(target!)).toBeFocused();
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(scan.violations).toEqual([]);
  expect(requests).toBe(0);
});

test('a configured form has a native POST fallback without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  let method = '';
  let payload = '';
  await page.route(fixtureEndpoint, async (route) => {
    method = route.request().method();
    payload = route.request().postData() ?? '';
    await route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Test provider</title><h1>Intercepted test submission</h1></html>',
    });
  });
  await interceptConfiguredHTML(page);
  await page.goto('/contact');
  await fillEnquiry(page);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page).toHaveURL(fixtureEndpoint);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Intercepted test submission');
  expect(method).toBe('POST');
  const fields = new URLSearchParams(payload);
  expect(fields.get('name')).toBe('Alex Example');
  expect(fields.get('email')).toBe('alex@example.com');
  expect(fields.get('service')).toBe('not-sure');
  expect(fields.get('_gotcha')).toBe('');
  await context.close();
});

test('whitespace-only values and malformed email are rejected without a request', async ({
  page,
}) => {
  let requests = 0;
  await configuredForm(page, async (route) => {
    requests += 1;
    await accepted(route);
  });
  await fillEnquiry(page);
  const form = page.locator('[data-enquiry-form]');
  await form.locator('[name="name"]').fill('   ');
  await form.locator('[name="email"]').fill('not-an-email');
  await form.locator('[name="description"]').fill('  ');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  for (const name of ['name', 'email', 'description'])
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute('aria-invalid', 'true');
  expect(requests).toBe(0);
});

test('input limits and the honeypot reject oversized or automated submissions', async ({
  page,
}) => {
  let requests = 0;
  await configuredForm(page, async (route) => {
    requests += 1;
    await accepted(route);
  });
  await fillEnquiry(page);
  const form = page.locator('[data-enquiry-form]');
  for (const [name, limit] of Object.entries({
    name: 100,
    email: 254,
    company: 160,
    phone: 50,
    budget: 100,
    description: 5000,
  }))
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute('maxlength', String(limit));
  await form.locator('[name="description"]').evaluate((node) => {
    (node as HTMLTextAreaElement).value = 'x'.repeat(5001);
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(form.locator('[name="description"]')).toHaveAttribute('aria-invalid', 'true');
  await form.locator('[name="description"]').fill('A new identity for a community initiative.');
  await form.locator('[name="_gotcha"]').evaluate((node) => {
    (node as HTMLInputElement).value = 'automated-entry';
  });
  await form.dispatchEvent('submit', { bubbles: true, cancelable: true });
  await expect(page.locator('[data-form-status]')).not.toContainText('Enquiry received');
  expect(requests).toBe(0);
});

test('provider acceptance is announced honestly and duplicate submissions stay blocked', async ({
  page,
}) => {
  let requests = 0;
  let payload = '';
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await configuredForm(page, async (route) => {
    requests += 1;
    payload = route.request().postData() ?? '';
    await pending;
    await accepted(route);
  });
  await fillEnquiry(page);
  await page.locator('[name="company"]').fill('Example Studio');
  await page.locator('[name="phone"]').fill('+1234567890');
  await page.locator('[name="budget"]').fill('To be discussed');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  const form = page.locator('[data-enquiry-form]');
  await expect(page.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
  await expect(form).toHaveAttribute('aria-busy', 'true');
  await form.dispatchEvent('submit', { bubbles: true, cancelable: true });
  await expect.poll(() => requests).toBe(1);
  release!();
  await expect(page.locator('[data-form-status]')).toContainText('Enquiry received');
  await expect(page.locator('[data-form-status]')).not.toContainText(/delivered|inbox/i);
  expect(payload).toContain('alex@example.com');
  expect(payload).toContain('Alex Example');
  expect(payload).toContain('Example Studio');
  expect(payload).toContain('To be discussed');
  expect(payload).not.toContain(email);
  await expect(page.locator('[data-submit-enquiry]')).toBeDisabled();
  await form.dispatchEvent('submit', { bubbles: true, cancelable: true });
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Start another enquiry', exact: true }).click();
  await expect(form.locator('[name="name"]')).toBeFocused();
  await expect(form.locator('[name="name"]')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeEnabled();
});

for (const failure of [
  'http',
  'network',
  'malformed',
  'not-accepted',
  'conflicting-error',
] as const) {
  test(`${failure} provider failure keeps the enquiry and never announces success`, async ({
    page,
  }) => {
    await configuredForm(page, async (route) => {
      if (failure === 'network') return route.abort('failed');
      await route.fulfill({
        status: failure === 'http' ? 422 : 200,
        contentType: failure === 'malformed' ? 'text/html' : 'application/json',
        body:
          failure === 'malformed'
            ? '<html>Unexpected gateway response</html>'
            : failure === 'conflicting-error'
              ? '{"ok":true,"errors":[{"message":"Provider rejected the enquiry"}]}'
              : '{"ok":false,"errors":[{"message":"Provider rejected the enquiry"}]}',
      });
    });
    await fillEnquiry(page);
    await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
    const status = page.locator('[data-form-status]');
    await expect(status).toContainText(/could not|couldn.t|unable|not sent|not confirm/i);
    await expect(status).not.toContainText('Enquiry received');
    await expect(page.locator('[name="name"]')).toHaveValue('Alex Example');
    await expect(page.locator('[data-enquiry-form] [name="description"]')).toHaveValue(/exploring/);
    await expect(page.locator(`[data-failure-help] a[href="mailto:${email}"]`)).toBeVisible();
  });
}

test('a timed-out request reports uncertainty without an automatic retry', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await configuredForm(page, async () => {
    requests += 1;
    // Intentionally leave the intercepted request unanswered until the client aborts it.
  });
  await fillEnquiry(page);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect.poll(() => requests).toBe(1);
  await page.clock.fastForward(15_100);
  const status = page.locator('[data-form-status]');
  await expect(status).toContainText('couldn’t confirm whether your enquiry was received');
  await expect(status).toContainText('email us before retrying');
  await expect(status).not.toContainText('Enquiry received');
  await expect(page.locator('[name="email"]')).toHaveValue('alex@example.com');
  await page.clock.fastForward(30_000);
  expect(requests).toBe(1);
});

test('correcting errors and explicitly retrying a rejected submission preserves a valid enquiry', async ({
  page,
}) => {
  let requests = 0;
  await configuredForm(page, async (route) => {
    requests += 1;
    if (requests === 1) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: '{"ok":false,"errors":[{"message":"Rejected for this test"}]}',
      });
      return;
    }
    await accepted(route);
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-error-summary]')).toBeVisible();
  await fillEnquiry(page);
  await expect(page.locator('[data-error-summary]')).toBeHidden();
  await expect(page.locator('[data-enquiry-form] [aria-invalid="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-form-status]')).toContainText('did not confirm your enquiry');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-form-status]')).toContainText('Enquiry received');
  expect(requests).toBe(2);
});
