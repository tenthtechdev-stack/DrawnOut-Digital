import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);
const baseline = 'e9a4b74fc1ebfb2d082c78a218883c9252a8ee3b';
const frozen = ['bunzo', 'sol-community-center', 'churros'];
const completed = ['triarch', 'by-tech-group', 'u-wanna-smoothie'];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function tree(prefixes) {
  const { stdout } = await run('git', ['ls-tree', '-r', baseline, '--', ...prefixes], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/);
      assert(match, `Baseline contains an ordinary file: ${line}`);
      return { blob: match[1], file: match[2] };
    });
}

async function unchanged(entries) {
  assert(entries.length > 0, 'The preservation audit must cover real baseline files');
  const stdout = await new Promise((resolve, reject) => {
    const child = execFile(
      'git',
      ['hash-object', '--stdin-paths'],
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      },
      (error, output) => (error ? reject(error) : resolve(output)),
    );
    assert(child.stdin, 'Git must expose its input pipe for the batch hash audit');
    child.stdin.end(entries.map(({ file }) => file).join('\n') + '\n');
  });
  const hashes = String(stdout).trim().split('\n');
  assert.equal(hashes.length, entries.length);
  for (const [index, entry] of entries.entries())
    assert.equal(hashes[index], entry.blob, `${entry.file}: preserve the approved bytes`);
}

async function originalJSON(file) {
  const { stdout } = await run('git', ['show', `${baseline}:${file}`], { encoding: 'utf8' });
  return JSON.parse(stdout);
}

test('Bunzo, SOL and Churros compositions, exports, posters, layers and records remain byte-identical to PR #20', async (context) => {
  const entries = await tree([
    'design-assets/portfolio-motion',
    'artifacts/motion-quality',
    'scripts/portfolio/quality',
    'src/content/projects',
  ]);
  const frozenModules = new Set([
    'scripts/portfolio/quality/bunzo.mjs',
    'scripts/portfolio/quality/sol.mjs',
    'scripts/portfolio/quality/churros.mjs',
    'scripts/portfolio/quality/shared.mjs',
    'scripts/portfolio/quality/mattes.mjs',
  ]);
  const protectedFiles = entries.filter(
    ({ file }) =>
      frozenModules.has(file) ||
      frozen.some(
        (slug) =>
          file === `src/content/projects/${slug}.json` ||
          file.startsWith(`design-assets/portfolio-motion/${slug}-`) ||
          file.startsWith(`design-assets/portfolio-motion/quality/${slug}-`) ||
          file.startsWith(`design-assets/portfolio-motion/quality/layers/${slug}/`) ||
          file.startsWith(`artifacts/motion-quality/${slug}-`),
      ),
  );
  await unchanged(protectedFiles);
  const current = JSON.parse(
    await readFile('design-assets/portfolio-motion/manifest.json', 'utf8'),
  );
  const original = await originalJSON('design-assets/portfolio-motion/manifest.json');
  for (const slug of frozen)
    assert.deepEqual(
      current.projects[slug],
      original.projects[slug],
      `${slug}: unchanged shared manifest entry`,
    );
  context.diagnostic(
    `${protectedFiles.length} frozen source/media files and three manifest entries match ${baseline}`,
  );
});

test('approved website, enquiry, favicon and image sources stay unchanged outside the three authorized motion records', async (context) => {
  const allowed = new Set(completed.map((slug) => `src/content/projects/${slug}.json`));
  const entries = (
    await tree([
      'src',
      'public',
      'design-assets/portfolio-originals',
      'design-assets/brand-originals',
      'astro.config.mjs',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
    ])
  ).filter(({ file }) => !allowed.has(file));
  await unchanged(entries);
  for (const file of allowed) {
    const before = await originalJSON(file);
    const after = JSON.parse(await readFile(file, 'utf8'));
    const { motion: oldMotion, ...oldContent } = before;
    const { motion: newMotion, ...newContent } = after;
    assert.deepEqual(
      newContent,
      oldContent,
      `${file}: publication, content, ordering and attribution stay unchanged`,
    );
    assert.equal(
      newMotion.landscape,
      oldMotion.landscape,
      `${file}: preserve the public landscape URL`,
    );
    assert.equal(
      newMotion.portrait,
      oldMotion.portrait,
      `${file}: preserve the public portrait URL`,
    );
  }
  context.diagnostic(
    `${entries.length} original website/assets files match; only three records' motion fields may change`,
  );
});

test('new canonical motion poster references resolve to the matching quality exports', async () => {
  for (const slug of completed) {
    const recordPath = path.resolve(`src/content/projects/${slug}.json`);
    const record = JSON.parse(await readFile(recordPath, 'utf8'));
    const manifest = JSON.parse(
      await readFile(`design-assets/portfolio-motion/quality/${slug}-manifest.json`, 'utf8'),
    );
    for (const [format, field] of [
      ['landscape', 'poster'],
      ['portrait', 'portraitPoster'],
    ]) {
      assert.equal(
        typeof record.motion[field],
        'string',
        `${slug}: explicit ${format} poster record`,
      );
      const referenced = fileURLToPath(new URL(record.motion[field], pathToFileURL(recordPath)));
      const bytes = await readFile(referenced);
      assert.equal(
        hash(bytes),
        manifest.exports[format].poster.sha256,
        `${slug}/${format}: the actual matching poster is referenced`,
      );
    }
  }
});
