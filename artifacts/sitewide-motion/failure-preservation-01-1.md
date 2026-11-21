# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: production-browser/loader.spec.ts >> optimized production visibly plays full cold/refresh/Home journeys at 390px
- Location: tests/production-browser/loader.spec.ts:120:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('html')
Expected: "internal-navigation"
Received: ""
Timeout:  12000ms

Call log:
  - Expect "toHaveAttribute" locator('html') with timeout 12000ms
  - waiting for locator('html')
    27 × locator resolved to <html lang="en" data-motion-saver="false" data-motion-state="ready" data-astro-cid-tq46r5sz="" data-portfolio-motion="on" data-portfolio-motion-ready="true" data-portfolio-motion-choice="auto" data-portfolio-motion-reason="default">…</html>
       - unexpected value "null"

```

```yaml
- document:
    - link "Skip to content":
        - /url: '#main'
    - banner
    - main
    - contentinfo
    - complementary "Portfolio motion settings"
```

# Test source

```ts
  50  |           };
  51  |         }
  52  |         const art = [...scene.querySelectorAll<HTMLImageElement>('[data-intro-artwork]')];
  53  |         if (
  54  |           art.length === 6 &&
  55  |           art.every(
  56  |             (image) =>
  57  |               image.complete &&
  58  |               image.naturalWidth > 0 &&
  59  |               Number(getComputedStyle(image).opacity) > 0.9,
  60  |           )
  61  |         )
  62  |           sixRevealed = true;
  63  |         const signature = scene.querySelector<HTMLElement>('[data-intro-signature]')!;
  64  |         if (Number(getComputedStyle(signature).opacity) > 0.9) {
  65  |           const handTransform = getComputedStyle(hand).transform;
  66  |           const plaqueTransform = getComputedStyle(plaque).transform;
  67  |           const handY = handTransform === 'none' ? 0 : new DOMMatrixReadOnly(handTransform).m42;
  68  |           const plaqueY =
  69  |             plaqueTransform === 'none' ? 0 : new DOMMatrixReadOnly(plaqueTransform).m42;
  70  |           if (handY > 5 && plaqueY < -5) independentEntrance = true;
  71  |         }
  72  |         if (['completed', 'skipped'].includes(html.dataset.signatureIntro ?? '')) resolve();
  73  |         else requestAnimationFrame(sample);
  74  |       };
  75  |       requestAnimationFrame(sample);
  76  |     });
  77  |     return {
  78  |       mode: html.dataset.signatureIntroMode,
  79  |       reason: html.dataset.signatureIntroReason,
  80  |       started: Number(html.dataset.signatureIntroStarted),
  81  |       ended: Number(html.dataset.signatureIntroEnded),
  82  |       visibleFrames: visible.length,
  83  |       visibleMs: (visible.at(-1) ?? 0) - (visible[0] ?? 0),
  84  |       connectingWaveCount,
  85  |       partialWord,
  86  |       sixRevealed,
  87  |       independentEntrance,
  88  |       wordGeometry: wordGeometry as {
  89  |         left: number;
  90  |         width: number;
  91  |         bottom: number;
  92  |         fontSize: number;
  93  |       } | null,
  94  |       viewport: { width: innerWidth, height: innerHeight },
  95  |       overflow: document.documentElement.scrollWidth > innerWidth,
  96  |     };
  97  |   });
  98  |   expect(observations.mode).toBe('full');
  99  |   expect(observations.reason).toBe('complete');
  100 |   expect(observations.ended).toBeLessThanOrEqual(5000);
  101 |   expect(observations.ended - observations.started).toBeGreaterThanOrEqual(4190);
  102 |   expect(observations.visibleFrames).toBeGreaterThan(20);
  103 |   expect(observations.visibleMs).toBeGreaterThan(3000);
  104 |   expect(observations.connectingWaveCount).toBe(0);
  105 |   expect(observations.partialWord).toBe(true);
  106 |   expect(observations.sixRevealed).toBe(true);
  107 |   expect(observations.independentEntrance).toBe(true);
  108 |   expect(observations.wordGeometry).not.toBeNull();
  109 |   expect(observations.wordGeometry!.left).toBeLessThan(observations.viewport.width * 0.1);
  110 |   expect(observations.wordGeometry!.width).toBeGreaterThan(observations.viewport.width * 0.6);
  111 |   expect(observations.wordGeometry!.fontSize).toBeGreaterThan(observations.viewport.width * 0.14);
  112 |   expect(observations.wordGeometry!.bottom).toBeGreaterThan(observations.viewport.height * 0.5);
  113 |   expect(observations.overflow).toBe(false);
  114 |   await expect(page.locator(overlay)).toBeHidden();
  115 |   await expect(page.locator('[data-intro-replay]')).toHaveCount(0);
  116 |   return observations;
  117 | }
  118 |
  119 | for (const width of [390, 1440]) {
  120 |   test(`optimized production visibly plays full cold/refresh/Home journeys at ${width}px`, async ({
  121 |     browser,
  122 |     baseURL,
  123 |   }) => {
  124 |     test.setTimeout(60_000);
  125 |     // A fresh context provides a genuinely cold browser cache. No network or
  126 |     // animation values are mocked in this strict acceptance path.
  127 |     const context = await browser.newContext({
  128 |       baseURL,
  129 |       viewport: { width, height: width < 768 ? 844 : 900 },
  130 |       isMobile: width < 768,
  131 |       hasTouch: width < 768,
  132 |     });
  133 |     try {
  134 |       const page = await context.newPage();
  135 |       const results = [];
  136 |       await page.goto('/', { waitUntil: 'commit' });
  137 |       results.push({ arrival: 'cold direct', ...(await fullStoryboard(page)) });
  138 |       for (const refresh of [1, 2]) {
  139 |         await page.reload({ waitUntil: 'commit' });
  140 |         results.push({ arrival: `refresh ${refresh}`, ...(await fullStoryboard(page)) });
  141 |       }
  142 |       for (const route of ['/contact', '/work']) {
  143 |         // Real ordinary internal link, independent of desktop/mobile menu layout.
  144 |         await page
  145 |           .locator('[data-site-footer] nav[aria-label="Footer navigation"] a')
  146 |           .filter({ hasText: route === '/contact' ? 'Contact' : 'Work' })
  147 |           .click();
  148 |         await expect(page).toHaveURL(route);
  149 |         await expect(page.locator(overlay)).toBeHidden();
> 150 |         await expect(page.locator('html')).toHaveAttribute(
      |                                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  151 |           'data-signature-intro-reason',
  152 |           'internal-navigation',
  153 |         );
  154 |         await page.locator('[data-site-header] a[aria-label="DrawnOut Digital home"]').click();
  155 |         await expect(page).toHaveURL('/');
  156 |         results.push({ arrival: `${route} Home`, ...(await fullStoryboard(page)) });
  157 |       }
  158 |       await test.info().attach(`production-journeys-${width}`, {
  159 |         body: JSON.stringify(results),
  160 |         contentType: 'application/json',
  161 |       });
  162 |     } finally {
  163 |       await context.close();
  164 |     }
  165 |   });
  166 | }
  167 |
  168 | test('failed storyboard clock initialization reveals a working homepage', async ({ page }) => {
  169 |   await page.addInitScript(() => {
  170 |     Element.prototype.getAnimations = () => {
  171 |       throw new Error('Animation clock unavailable');
  172 |     };
  173 |   });
  174 |   await page.goto('/');
  175 |   await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'skipped');
  176 |   await expect(page.locator('html')).toHaveAttribute(
  177 |     'data-signature-intro-reason',
  178 |     'animation-error',
  179 |   );
  180 |   await expect(page.locator('[data-signature-intro-overlay]')).toBeHidden();
  181 |   await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
  182 |   await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
  183 |   await expect(page).toHaveURL('/work');
  184 | });
  185 |
```
