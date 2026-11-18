#!/usr/bin/env node
/** Only the first owner-requested review group; never promotes the remaining three. */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const directory = 'design-assets/portfolio-motion';
const manifestPath = `${directory}/manifest.json`;
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const ready = [];
for (const slug of ['bunzo', 'sol-community-center', 'churros']) {
  const quality = JSON.parse(await readFile(`${directory}/quality/${slug}-manifest.json`, 'utf8'));
  for (const format of ['landscape', 'portrait']) {
    const entry = quality.exports[format];
    assert(entry?.decodedAllFrames && entry.sourceSeamPixelIdentical);
    const bytes = await readFile(`${directory}/quality/${entry.file}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    assert(bytes.length < 3 * 1024 * 1024);
  }
  ready.push({ slug, quality });
}
for (const { slug, quality } of ready) {
  for (const format of ['landscape', 'portrait']) {
    const entry = quality.exports[format];
    await copyFile(`${directory}/quality/${entry.file}`, `${directory}/${entry.file}`);
  }
  manifest.projects[slug] = {
    ...quality,
    reviewStatus: 'First-three creative review; technical validation is not owner approval',
    qualityManifest: `quality/${slug}-manifest.json`,
  };
  const recordPath = `src/content/projects/${slug}.json`;
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  record.motion.poster = `../../../${directory}/quality/${slug}-landscape-poster.webp`;
  record.motion.portraitPoster = `../../../${directory}/quality/${slug}-portrait-poster.webp`;
  record.motion.source =
    'Source-pixel alpha-layer composition from approved original artwork. First-three motion quality review; see scripts/portfolio/quality/ and design-assets/portfolio-motion/quality/ source manifests. No new client, service, credit or outcome claims.';
  await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`);
}
manifest.formatVersion = 2;
manifest.timingNote =
  'Historical top-level timing applies to the three unchanged legacy loops. Upgraded Bunzo, SOL and Churros have explicit per-project and per-export timing.';
manifest.qualityRenderer = 'scripts/portfolio/quality/render.mjs';
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  'Prepared only Bunzo, SOL and Churros for branch review. Other production exports unchanged.',
);
