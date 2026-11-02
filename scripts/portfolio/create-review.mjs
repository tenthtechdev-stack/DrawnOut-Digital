#!/usr/bin/env node
/** Create an offline review gallery and lightweight GIFs from the finished MP4s. */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'design-assets/portfolio-motion');
const evidence = path.join(root, 'artifacts/portfolio-motion');
const executeFile = promisify(execFile);
const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
const entries = Object.entries(manifest.projects);
assert.equal(entries.length, 6, 'The review contains all six projects');
await mkdir(evidence, { recursive: true });
const htmlEscape = (value) =>
  value.replace(
    /[&<>"]/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character],
  );
const kib = (bytes) => `${Math.round(bytes / 1024)} KiB`;

for (const [slug, project] of entries) {
  assert(project.exports.landscape && project.exports.portrait, `${slug}: both formats required`);
  for (const entry of Object.values(project.exports)) {
    const bytes = await readFile(path.join(output, entry.file));
    assert.equal(bytes.length, entry.bytes, `${slug}: completed export matches its manifest`);
    assert(bytes.length > 0 && bytes.length < 3 * 1024 * 1024, `${slug}: export size budget`);
  }
  await executeFile('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-threads',
    '1',
    '-i',
    path.join(output, project.exports.landscape.file),
    '-filter_complex_threads',
    '1',
    '-filter_complex',
    'fps=8,scale=384:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
    '-loop',
    '0',
    path.join(evidence, `${slug}-preview.gif`),
  ]);
  console.log(`Created ${slug}-preview.gif`);
}

const cards = entries
  .map(([slug, project], index) => {
    const title = htmlEscape(project.title);
    const landscape = project.exports.landscape;
    const portrait = project.exports.portrait;
    return `<article id="${slug}">
    <div class="card-heading"><span class="number">0${index + 1}</span><h2>${title}</h2></div>
    <p>${htmlEscape(project.direction)}</p>
    <video controls muted loop playsinline preload="none" width="960" height="540" poster="${slug}-landscape-opening.png" aria-label="${title}, landscape motion composition">
      <source src="../../design-assets/portfolio-motion/${landscape.file}" type="video/mp4">
    </video>
    <div class="downloads"><a href="../../design-assets/portfolio-motion/${landscape.file}" download>Landscape MP4 · ${kib(landscape.bytes)}</a><a href="../../design-assets/portfolio-motion/${portrait.file}" download>Portrait MP4 · ${kib(portrait.bytes)}</a><a href="${slug}-preview.gif">GIF preview</a></div>
    <details><summary>View portrait composition</summary><video class="portrait" controls muted loop playsinline preload="none" width="600" height="750" poster="${slug}-portrait-opening.png" aria-label="${title}, portrait motion composition"><source src="../../design-assets/portfolio-motion/${portrait.file}" type="video/mp4"></video></details>
  </article>`;
  })
  .join('\n');

await writeFile(
  path.join(evidence, 'assets-gallery.html'),
  `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DrawnOut Digital — portfolio motion review</title>
<style>
:root{color-scheme:dark;font-family:Arial,sans-serif;background:#121214;color:#f8f5ed;line-height:1.5}*{box-sizing:border-box}body{margin:0;padding:clamp(20px,4vw,64px)}main{max-width:1440px;margin:auto}header{max-width:850px;margin-bottom:48px}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#cbb4ff}h1{font-size:clamp(36px,5vw,72px);line-height:1.05;letter-spacing:-.04em;margin:16px 0 24px}header p{color:#cfccd5}a{color:#dfccff;text-underline-offset:3px}a:focus-visible,summary:focus-visible{outline:3px solid #cbb4ff;outline-offset:5px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}article{padding:22px;background:#1e1e22;border:1px solid #3b3842;border-radius:12px;min-width:0}.card-heading{display:flex;gap:14px;align-items:baseline}.number{font-size:12px;color:#cbb4ff}h2{font-size:23px;line-height:1.2;margin:0}article p{font-size:14px;color:#cbc7d0;min-height:42px}video{width:100%;height:auto;display:block;background:#111;border-radius:6px;aspect-ratio:16/9}.downloads{display:flex;gap:10px 20px;flex-wrap:wrap;margin:15px 0 20px;font-size:12px}summary{cursor:pointer;font-size:14px}video.portrait{max-width:360px;aspect-ratio:4/5;margin:16px auto 0}footer{max-width:850px;color:#bbb7c2;font-size:13px;margin:42px 0 0}footer p{margin:10px 0}@media(max-width:760px){.grid{grid-template-columns:1fr}article p{min-height:0}}
</style></head>
<body><main><header><div class="eyebrow">DrawnOut Digital · motion review</div><h1>Six identities.<br>Six motion stories.</h1><p>Original 2D compositions using unchanged source artwork. Each silent loop runs for 5.75 seconds at 24 fps, with separate landscape and portrait framing.</p><p>Play a composition to review its complete loop. Open its portrait view to compare the mobile composition.</p></header><div class="grid">${cards}</div>
<footer><p>The supplied presentation boards are flattened PNGs. These compositions animate image panels, masks and presentation guides; they do not claim independently rigged vector marks, 3D product simulation or new client outcomes.</p><p><a href="PORTFOLIO_MOTION_ASSETS.md">Review notes</a> · <a href="../../design-assets/portfolio-motion/manifest.json">Source crops, hashes and export manifest</a></p></footer></main></body></html>\n`,
);

const table = entries
  .map(
    ([slug, project]) =>
      `| ${project.title} | [${kib(project.exports.landscape.bytes)}](../../design-assets/portfolio-motion/${project.exports.landscape.file}) | [${kib(project.exports.portrait.bytes)}](../../design-assets/portfolio-motion/${project.exports.portrait.file}) | [GIF](${slug}-preview.gif) |`,
  )
  .join('\n');
await writeFile(
  path.join(evidence, 'PORTFOLIO_MOTION_ASSETS.md'),
  `# Portfolio motion review

[Open the local gallery](assets-gallery.html) to play all six completed compositions and compare their portrait framing. Native video controls make the loops reviewable without autoplay. Each project also has a small looping GIF preview.

All 12 MP4s are silent H.264/yuv420p, 138 frames, 24 fps and 5.75 seconds. Landscape is 960 × 540; portrait is 600 × 750. The files remain below the 3 MiB per-loop budget.

| Project | Landscape MP4 | Portrait MP4 | Preview |
| --- | --- | --- | --- |
${table}

## Source artwork and limitations

The source images are the approved flattened presentation boards under [portfolio-originals](../../design-assets/portfolio-originals/). Every source crop and source SHA-256 is recorded in the [export manifest](../../design-assets/portfolio-motion/manifest.json). Marks and illustrations remain source pixels; decorative construction guides and masks are separate presentation elements. The compositions do not claim rigged vector animation, physically simulated products, new services or client outcomes.

The SOL opening samples the original color emblem from \`02_SOL_Community_Center_01.png\` at source bounds \`[607, 27, 186, 186]\`. A circular presentation mask with a 92-source-pixel radius removes the surrounding banner photograph. The emblem's original pixels and proportions are retained, with no redraw or recoloring.

Each direction has a separate motion vocabulary: SOL uses concentric apertures and stationery; Bunzo uses staggered shutters and packaging panels; Triarch uses architectural guides and a measured gate; Churros uses orbiting circular windows; By Tech Group uses a progressive module grid; U Wanna Smoothie uses an organic wave reveal.

## Reproduction and verification

From the repository root, with Node, Sharp and FFmpeg available:

\`\`\`sh
node scripts/portfolio/render-loops.mjs
node --test tests/portfolio-motion-exports.test.mjs
node scripts/portfolio/create-review.mjs
\`\`\`

The renderer asserts pixel-identical unencoded first and last frames. The export test reads the actual MP4s and checks their hashes, stream properties, duration, frame count, dimensions and size budget. It also checks that decoded first/last frames remain visually matched after H.264 compression and that the application scene visibly differs from the opening identity scene.

Four PNG keyframes per format show the opening, construction, applications and return stages. GIF previews are reduced review copies; the MP4s are the delivery assets.
`,
);

await writeFile(
  path.join(output, 'README.md'),
  `# Portfolio motion exports

Six completed silent 2D source-art compositions, each exported in landscape (960 × 540) and portrait (600 × 750). All 12 MP4s are 5.75 seconds, 24 fps, 138 frames, H.264/yuv420p, and below 3 MiB per file.

- [Review gallery](../../artifacts/portfolio-motion/assets-gallery.html)
- [Review notes, MP4 links and GIF previews](../../artifacts/portfolio-motion/PORTFOLIO_MOTION_ASSETS.md)
- [Source crops, source SHA-256 hashes and export metadata](manifest.json)

The source artwork is flattened approved PNG boards. Original marks and illustrations are cropped source pixels, composed using 2D image panels, masks and decorative presentation guides. These exports do not claim independently rigged vectors or simulated 3D products.

The SOL opening uses the original color emblem from \`02_SOL_Community_Center_01.png\`, crop \`[607, 27, 186, 186]\`, with a 92-source-pixel circular presentation mask to remove the surrounding banner photograph. The emblem retains its source pixels and proportions, without a redraw or recoloring.

Rebuild with \`node scripts/portfolio/render-loops.mjs\`; verify with \`node --test tests/portfolio-motion-exports.test.mjs\`; regenerate review material with \`node scripts/portfolio/create-review.mjs\`.
`,
);
console.log('Created gallery and review documentation for six compositions / twelve MP4s.');
