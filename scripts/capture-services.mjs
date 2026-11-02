import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

/* global document, getComputedStyle, innerWidth, requestAnimationFrame, window */
const baseURL = process.env.SERVICE_CAPTURE_URL ?? 'http://127.0.0.1:4353';
const output = path.resolve('artifacts/services');
const slugs = [
  'brand-identity',
  'digital-design',
  'marketing-campaigns',
  'words-storytelling',
  'creative-direction',
];
const evidence = {
  capturedAt: new Date().toISOString(),
  method:
    'Actual local production screenshots at DPR1, with the supported reduced-motion preference. Native FAQ controls remain usable; no content or animation timeline is replaced for capture.',
  baseURL,
  pages: [],
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
});
try {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 900 },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    const page = await context.newPage();
    for (const slug of slugs) {
      const response = await page.goto(`${baseURL}/services/${slug}`);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      // Trigger native lazy loading before full-page screenshots, then return
      // to the introduction without changing the page's rendering behavior.
      await page.locator('[data-site-footer]').scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((item) => item.decode()));
      });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      const facts = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]').content,
        robots: document.querySelector('meta[name="robots"]').content,
        h1: [...document.querySelectorAll('main h1')].map((node) => node.textContent.trim()),
        faqCount: document.querySelectorAll('[data-service-faq] details').length,
        overflowing: document.documentElement.scrollWidth > innerWidth,
        headlineFontSize: getComputedStyle(document.querySelector('main h1')).fontSize,
        enquiryHref: document.querySelector('[data-service-enquiry]').getAttribute('href'),
        schema: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(
          (node) => JSON.parse(node.textContent)['@graph'] ?? [],
        ),
      }));
      assert.equal(facts.h1.length, 1);
      assert.equal(facts.faqCount, 5);
      assert.equal(facts.robots, 'noindex, nofollow');
      assert.equal(facts.enquiryHref, '/contact');
      assert.equal(facts.overflowing, false);
      assert.deepEqual(
        facts.schema.map((item) => item['@type']),
        ['BreadcrumbList', 'Service'],
      );
      const full = `${slug}-${width}.png`;
      await page.screenshot({ path: path.join(output, full), fullPage: true });
      let hero;
      let faq;
      if (slug === 'brand-identity') {
        hero = `brand-identity-${width}-hero.png`;
        await page.screenshot({ path: path.join(output, hero) });
        const summary = page.locator('[data-service-faq] details').first().locator('summary');
        await summary.focus();
        await summary.press('Enter');
        assert(
          (await page.locator('[data-service-faq] details').first().getAttribute('open')) !== null,
        );
        faq = `brand-identity-${width}-faq.png`;
        await page.locator('[data-service-faq]').screenshot({ path: path.join(output, faq) });
      }
      evidence.pages.push({ slug, width, full, hero, faq, facts });
      await writeFile(
        path.join(output, 'capture-evidence.json'),
        `${JSON.stringify(evidence, null, 2)}\n`,
      );
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const lines = [
  '# Service pages — structure and editorial review',
  '',
  'Actual screenshots from the local production build at 390px, 768px and 1440px. The shared Afterglow foundation preserves the supplied draft copy and uses native FAQ controls. Captures use the supported reduced-motion preference for stable readable evidence.',
  '',
  '[Validation and editorial dependencies](../../docs/next-milestone/SERVICE_PAGE_VALIDATION.md) · [Implementation handoff](../../docs/next-milestone/SERVICE_PAGE_HANDOFF.md) · [Capture measurements](capture-evidence.json)',
  '',
];
for (const width of [390, 768, 1440]) {
  lines.push(
    `## ${width}px — shared introduction and FAQ`,
    '',
    `![Brand Identity introduction at ${width}px](brand-identity-${width}-hero.png)`,
    '',
    `![Keyboard-open FAQ at ${width}px](brand-identity-${width}-faq.png)`,
    '',
  );
}
for (const slug of slugs) {
  const entry = evidence.pages.find((item) => item.slug === slug);
  lines.push(`## ${entry.facts.schema[1].name}`, '');
  for (const width of [390, 768, 1440])
    lines.push(
      `### ${width}px`,
      '',
      `![${entry.facts.schema[1].name}, ${width}px full page](${slug}-${width}.png)`,
      '',
    );
}
lines.push(
  '## Review boundary',
  '',
  'Copy is an editorial draft. Service scope, delivery responsibilities, handover terms and any related-project attribution still require studio approval before public launch. These pages retain `noindex, nofollow`; no FAQ rich-result claim, pricing, testimonial or campaign result is added. No merge or deployment was performed.',
  '',
);
await writeFile(path.join(output, 'README.md'), lines.join('\n'));
console.log(
  JSON.stringify({ pages: evidence.pages.length, screenshots: evidence.pages.length + 6, output }),
);
