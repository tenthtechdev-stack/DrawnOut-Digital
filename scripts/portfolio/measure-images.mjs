#!/usr/bin/env node
/** Compare every derivative with its exact native original crop, without sharpening. */
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const { baseline, assets } = JSON.parse(
  await readFile('design-assets/portfolio-derivatives.json', 'utf8'),
);
const results = [];
for (const asset of assets) {
  const reference = await sharp(asset.source).extract(asset.crop).removeAlpha().raw().toBuffer();
  const before = (
    await run('git', ['show', `${baseline}:src/assets/portfolio/${asset.file}`], {
      encoding: 'buffer',
      maxBuffer: 2 * 1024 * 1024,
    })
  ).stdout;
  const record = { file: asset.file, width: asset.crop.width, height: asset.crop.height };
  for (const [label, input] of [
    ['before', before],
    ['after', await readFile(`src/assets/portfolio/${asset.file}`)],
  ]) {
    const pixels = await sharp(input)
      .resize(asset.crop.width, asset.crop.height)
      .removeAlpha()
      .raw()
      .toBuffer();
    let squareError = 0;
    for (let index = 0; index < pixels.length; index++)
      squareError += (pixels[index] - reference[index]) ** 2;
    record[`${label}PSNRdB`] = Number(
      (10 * Math.log10(255 ** 2 / (squareError / pixels.length))).toFixed(3),
    );
  }
  results.push(record);
}
await writeFile(
  'artifacts/motion-quality/image-comparison-metrics.json',
  `${JSON.stringify({ method: 'RGB PSNR to the exact original crop at native dimensions. The older reduced master is resampled to the same reference scale. Higher means less source deviation; this does not measure creative quality or recover missing source detail.', baseline, assets: results }, null, 2)}\n`,
);
console.log(
  `Compared ${results.length} exact source crops; improved fidelity in ${results.filter((row) => row.afterPSNRdB > row.beforePSNRdB).length}/${results.length}.`,
);
