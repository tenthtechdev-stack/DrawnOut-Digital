import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat();
}

test('production emits the six foundation routes without concept or draft case routes', async () => {
  const output = await files('dist');
  const htmlFiles = output.filter((file) => file.endsWith('.html'));
  assert.deepEqual(
    htmlFiles.map((file) => path.relative('dist', file).split(path.sep).join('/')).sort(),
    [
      '404.html',
      'about/index.html',
      'contact/index.html',
      'index.html',
      'services/index.html',
      'work/index.html',
    ],
  );
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /noindex, nofollow/, `${file} must retain review indexing restrictions`);
    assert.match(html, /<title>[^<]+<\/title>/, `${file} needs a useful title`);
    assert.match(html, /name="description"\s+content="[^"]+"/, `${file} needs a description`);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${file} needs one H1`);
    assert.doesNotMatch(
      html,
      /Bunzo|Triarch|SOL Community|Churros|Feed N Seed|Abacus Immigration|By Tech Group|Visual preview/i,
      `${file} must exclude unapproved portfolio content`,
    );
  }
  const home = await readFile('dist/index.html', 'utf8');
  assert.match(home, /We make ideas/);
  assert.match(home, /data-site-header/);
  assert.match(home, /data-site-footer/);
});

test('production asset output excludes every draft project image', async () => {
  const output = await files('dist');
  assert.ok(
    !output.some((file) =>
      /bunzo|triarch|churros|feed-n-seed|sol-community|abacus|by-tech|\.webp$/i.test(file),
    ),
    'Draft project media must not be emitted into any production asset directory',
  );
});
