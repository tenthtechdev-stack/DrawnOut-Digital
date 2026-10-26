import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/* global requestAnimationFrame */

// Faithful format conversion of the intact supplied SVG, including its opacity
// mask and viewBox crop. This never fabricates separate hand/emblem layers.
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'design-assets/brand-originals/hand-and-icon-supplied.svg');
const output = path.resolve(process.argv[2] ?? path.join(root, 'src/assets/signature'));
const bytes = await readFile(source);
const logoBytes = await readFile(
  path.join(root, 'design-assets/brand-originals/logo-as-supplied.svg'),
);
const hash = createHash('sha256').update(bytes).digest('hex');
if (hash !== 'ea295f96073b0e789532551ec1787a9c10728fa46767ce27fb428ff1c3affcbb') {
  throw new Error('Supplied source changed; inspect the new asset before converting it.');
}
if (!bytes.equals(logoBytes)) {
  throw new Error(
    'Supplied assets are no longer identical; inspect their layers before converting.',
  );
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
});
try {
  const page = await browser.newPage({
    viewport: { width: 810, height: 1440 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:810px;height:1440px}</style>${bytes.toString('utf8')}`,
  );
  await page.locator('svg').waitFor();
  // SVG embeds its raster bytes; two frames allow the embedded image/mask to paint.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const png = await page.screenshot({ omitBackground: true });
  await writeFile(path.join(output, 'hand-emblem-reference.png'), png);
  await sharp(png)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(output, 'hand-emblem-reference.webp'));
  console.log(JSON.stringify({ sourceSHA256: hash, width: 810, height: 1440, output }));
} finally {
  await browser.close();
}
