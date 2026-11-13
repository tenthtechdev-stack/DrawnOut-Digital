import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

test('favicon is a faithful isolated source emblem with native-size outputs and cache-safe head links', async () => {
  const provenance = JSON.parse(await readFile('public/icons/source.json', 'utf8'));
  const source = await readFile(provenance.source);
  assert.equal(createHash('sha256').update(source).digest('hex'), provenance.sourceSHA256);
  const originalPixels = await sharp(source)
    .extract(provenance.bounds)
    .ensureAlpha()
    .raw()
    .toBuffer();
  const isolated = await sharp('src/assets/brand/drawnout-emblem-isolated.png')
    .ensureAlpha()
    .raw()
    .toBuffer();
  assert.deepEqual(isolated, originalPixels, 'derived emblem pixels must match the supplied crop');
  assert.equal(provenance.bounds.width, 464);
  assert.equal(provenance.bounds.height, 610);
  assert.deepEqual(
    provenance.files.map((entry: { size: number }) => entry.size),
    [16, 32, 180, 192, 512],
  );
  for (const entry of provenance.files) {
    const bytes = await readFile(`public/icons/${entry.file}`);
    const info = await sharp(bytes).metadata();
    assert.equal(info.width, entry.size);
    assert.equal(info.height, entry.size);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    assert(entry.size < provenance.bounds.height, 'favicon does not upscale the source emblem');
  }
  const ico = await readFile(`public/icons/drawnout-emblem-${provenance.version}.ico`);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 2);
  assert.equal(ico[6], 16);
  assert.equal(ico[22], 32);
  assert.deepEqual(ico, await readFile('public/favicon.ico'));
  const head = await readFile('src/layouts/SiteLayout.astro', 'utf8');
  for (const suffix of ['.svg', '-16.png', '-32.png', '-180.png', '.ico']) {
    assert(head.includes(`/icons/drawnout-emblem-${provenance.version}${suffix}`));
  }
  assert(head.includes('rel="apple-touch-icon"'));
  assert(!/favicon[^\n]*(astro|netlify)/i.test(head));
});
