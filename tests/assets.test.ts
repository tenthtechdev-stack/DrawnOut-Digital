import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const assetCommit = 'fe15b550542e32ef224e506dcd2c5ff13eb3ba10';
const originalsRoot = path.join(root, 'design-assets/portfolio-originals');

async function pngFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const filename = path.join(directory, entry.name);
        return entry.isDirectory()
          ? pngFiles(filename)
          : entry.name.endsWith('.png')
            ? [filename]
            : [];
      }),
    )
  ).flat();
}

test('all 46 original PNG files in 15 project folders match the authorized asset commit byte for byte', async () => {
  const folders = (await readdir(originalsRoot, { withFileTypes: true })).filter((entry) =>
    entry.isDirectory(),
  );
  assert.equal(folders.length, 15);
  const files = (await pngFiles(originalsRoot)).sort();
  assert.equal(files.length, 46);
  const reference = execFileSync(
    'git',
    ['ls-tree', '-r', assetCommit, '--', 'design-assets/portfolio-originals'],
    { cwd: root, encoding: 'utf8' },
  );
  const expected = new Map(
    reference
      .trim()
      .split('\n')
      .map((line) => {
        const match = line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/);
        assert.ok(match, 'Asset tree must contain ordinary file blobs.');
        return [match[2]!, match[1]!] as const;
      }),
  );
  const relative = files.map((filename) => path.relative(root, filename).split(path.sep).join('/'));
  assert.deepEqual([...expected.keys()].sort(), [...relative].sort());
  const observed = execFileSync('git', ['hash-object', '--stdin-paths'], {
    cwd: root,
    encoding: 'utf8',
    input: `${relative.join('\n')}\n`,
  })
    .trim()
    .split('\n');
  for (const [index, name] of relative.entries()) {
    assert.equal(observed[index], expected.get(name), `${name} must remain unchanged.`);
    const bytes = await readFile(files[index]!);
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
});

test('portfolio derivatives keep local provenance and every project remains an unapproved draft', async () => {
  const directory = new URL('../src/content/projects/', import.meta.url);
  const records = (await readdir(directory)).filter((name) => name.endsWith('.json'));
  assert.equal(records.length, 7);
  for (const filename of records) {
    const recordPath = new URL(filename, directory);
    const record = JSON.parse(await readFile(recordPath, 'utf8')) as {
      status: string;
      visibility: string;
      projectType: string;
      publicationApproved: boolean;
      creditApproved: boolean;
      assetSource: string;
      cover: string;
      coverAlt: string;
      gallery: { src: string; alt: string }[];
    };
    assert.equal(record.status, 'draft', filename);
    assert.equal(record.visibility, 'private', filename);
    assert.equal(record.projectType, 'unknown', filename);
    assert.equal(record.publicationApproved, false, filename);
    assert.equal(record.creditApproved, false, filename);
    const sourceFiles =
      record.assetSource.match(/design-assets\/portfolio-originals\/[A-Za-z0-9_/-]+\.png/g) ?? [];
    assert.ok(sourceFiles.length > 0, `${filename} must identify its original supplied PNG.`);
    const largestOriginal = Math.max(
      ...(await Promise.all(
        sourceFiles.map(async (source) => (await stat(path.join(root, source))).size),
      )),
    );
    for (const media of [{ src: record.cover, alt: record.coverAlt }, ...record.gallery]) {
      assert.ok(media.alt.trim().length > 0, `${filename} needs descriptive media alternatives.`);
      const resolved = fileURLToPath(new URL(media.src, recordPath));
      assert.ok(resolved.startsWith(path.join(root, 'src/assets/portfolio') + path.sep), resolved);
      const bytes = await readFile(resolved);
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      assert.ok(
        bytes.length < largestOriginal,
        `${media.src} must be optimized below its original PNG size.`,
      );
    }
  }
});
