import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, window */
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const baseURL = argument('--base-url', process.env.CONTACT_BASE_URL ?? 'http://127.0.0.1:4333');
const output = path.resolve(argument('--out', 'artifacts/contact'));
const reducedOnly = process.argv.includes('--reduced-motion-only');
const manifest = {
  capturedAt: new Date().toISOString(),
  baseURL,
  route: '/contact',
  note: 'Unedited browser screenshots. Layout evidence uses the real reduced-motion fallback; separate normal-motion views observe completed reveals. No form submission is made.',
  screenshots: [],
};
await mkdir(output, { recursive: true });

async function capture(page, target, filename, description, motion, viewport) {
  if (target) await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const payload = target
    ? await target.screenshot({ path: path.join(output, filename) })
    : await page.screenshot({ path: path.join(output, filename), fullPage: true });
  const form = page.locator('[data-enquiry-form]');
  manifest.screenshots.push({
    filename,
    description,
    viewport,
    reducedMotion: motion,
    javaScriptEnabled: true,
    width: payload.readUInt32BE(16),
    height: payload.readUInt32BE(20),
    bytes: payload.length,
    sha256: createHash('sha256').update(payload).digest('hex'),
    endpointConfigured: Boolean(await form.getAttribute('data-endpoint')),
    formState: await page.locator('[data-form-state]').getAttribute('data-form-state'),
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  });
  assert.equal(manifest.screenshots.at(-1).horizontalOverflow, false);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
});
try {
  for (const width of [390, 768, 1440]) {
    const viewport = { width, height: width === 390 ? 844 : 900 };
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const response = await page.goto(new URL('/contact', baseURL).href, {
      waitUntil: 'networkidle',
    });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-enquiry-form][data-enhanced]').waitFor();
    // Visit the footer before the full-page capture so its real lazy-loaded
    // hand and plaque have both decoded. A full-page screenshot alone does
    // not cause offscreen lazy images to load.
    await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => image.decode()));
      window.scrollTo(0, 0);
    });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('[data-site-footer]').count(), 1);
    await capture(
      page,
      null,
      `contact-${width}.png`,
      'Full-page layout and static signature footer',
      'reduce',
      viewport,
    );
    for (const [name, selector, description] of [
      ['hero', '.contact-intro', 'Editorial contact introduction'],
      ['form', '.contact-enquiry', 'Enquiry form, labels and unconfigured email alternative'],
      ['direct', '.contact-direct', 'Official email, phone, WhatsApp and social links'],
      ['footer', '[data-site-footer]', 'Preserved signature footer and shared official email'],
    ]) {
      await capture(
        page,
        page.locator(selector),
        `contact-${width}-${name}.png`,
        description,
        'reduce',
        viewport,
      );
    }
    await context.close();

    if (reducedOnly) continue;
    const animatedContext = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
    const animatedPage = await animatedContext.newPage();
    await animatedPage.goto(new URL('/contact', baseURL).href, { waitUntil: 'networkidle' });
    await animatedPage.evaluate(() => document.fonts.ready);
    // Observe the existing reveal timeline without seeking or rewriting its state.
    await animatedPage.waitForTimeout(1300);
    await capture(
      animatedPage,
      animatedPage.locator('.contact-intro'),
      `contact-${width}-hero-motion.png`,
      'Normal-motion introduction after its existing heading reveal',
      'no-preference',
      viewport,
    );
    await animatedPage.locator('[data-site-footer]').scrollIntoViewIfNeeded();
    await animatedPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await animatedPage.waitForTimeout(1300);
    await capture(
      animatedPage,
      animatedPage.locator('[data-site-footer]'),
      `contact-${width}-footer-motion.png`,
      'Normal-motion signature footer reached by native scrolling',
      'no-preference',
      viewport,
    );
    await animatedContext.close();
  }
} finally {
  await browser.close();
}

for (const { filename, sha256 } of manifest.screenshots) {
  const saved = await readFile(path.join(output, filename));
  assert.equal(createHash('sha256').update(saved).digest('hex'), sha256);
}
await writeFile(
  path.join(output, 'capture-evidence.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Captured ${manifest.screenshots.length} Contact screenshots to ${output}`);
