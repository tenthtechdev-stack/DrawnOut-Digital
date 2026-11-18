#!/usr/bin/env node
/** Publish only the three completion compositions into this review branch. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';

const directory = 'design-assets/portfolio-motion';
const manifestFile = `${directory}/manifest.json`;
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
const references = ['bunzo', 'sol-community-center', 'churros'];
const referenceRecords = references.map((slug) => JSON.stringify(manifest.projects[slug]));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const prepared = [];
for (const slug of ['triarch', 'by-tech-group', 'u-wanna-smoothie']) {
  const quality = JSON.parse(await readFile(`${directory}/quality/${slug}-manifest.json`, 'utf8'));
  for (const orientation of ['landscape', 'portrait']) {
    const entry = quality.exports[orientation];
    assert(entry?.decodedAllFrames && entry.sourceSeamPixelIdentical);
    assert.equal(entry.colorEncoding?.matrix, 'bt709');
    assert.equal(entry.colorEncoding?.range, 'tv');
    const bytes = await readFile(`${directory}/quality/${entry.file}`);
    assert.equal(hash(bytes), entry.sha256);
    assert(bytes.length < 3 * 1024 * 1024);
  }
  prepared.push({ slug, quality });
}
const writeJSON = async (file, value) =>
  writeFile(file, await format(JSON.stringify(value), { parser: 'json', printWidth: 100 }));
for (const { slug, quality } of prepared) {
  for (const orientation of ['landscape', 'portrait']) {
    const entry = quality.exports[orientation];
    await copyFile(`${directory}/quality/${entry.file}`, `${directory}/${entry.file}`);
  }
  manifest.projects[slug] = {
    ...quality,
    reviewStatus: 'Completion creative review; technical validation is not owner approval',
    qualityManifest: `quality/${slug}-manifest.json`,
  };
  const file = `src/content/projects/${slug}.json`;
  const record = JSON.parse(await readFile(file, 'utf8'));
  record.motion.poster = `../../../${directory}/quality/${slug}-landscape-poster.webp`;
  record.motion.portraitPoster = `../../../${directory}/quality/${slug}-portrait-poster.webp`;
  record.motion.source =
    'Source-pixel alpha-layer composition from the supplied artwork, authorized by Complete Portfolio Motion Production. See scripts/portfolio/quality/ and the per-project quality manifest. Visual display does not verify clients, services, credits or outcomes.';
  await writeJSON(file, record);
}
references.forEach((slug, index) =>
  assert.equal(JSON.stringify(manifest.projects[slug]), referenceRecords[index]),
);
manifest.formatVersion = 3;
manifest.generator = 'scripts/portfolio/quality/render.mjs';
manifest.compositionSource = 'scripts/portfolio/quality/';
manifest.durationSeconds = 7.5;
manifest.frameCount = 180;
manifest.timingNote =
  'All six current loops use explicit per-project and per-export timing. The original three reference compositions remain unchanged.';
await writeJSON(manifestFile, manifest);
console.log(
  'Prepared only Triarch, By Tech Group and U Wanna Smoothie; reference records unchanged.',
);
