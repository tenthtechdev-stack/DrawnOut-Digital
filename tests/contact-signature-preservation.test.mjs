import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const parent = '106d63ca5d50f4f84a715c407073f6d7c8fc7424';
const allowedExisting = new Set([
  'src/pages/contact.astro',
  'src/components/contact/EnquiryForm.astro',
  'src/scripts/contact-form.ts',
]);
const allowedNew = new Set([
  'src/components/contact/FirstThought.astro',
  'src/scripts/contact-first-thought.ts',
  'src/lib/contact-thought-policy.ts',
]);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const parentFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', parent])
  .toString('utf8')
  .split('\0')
  .filter(Boolean);
const guarded = parentFiles.filter(
  (file) =>
    ['src/', 'public/', 'design-assets/'].some((prefix) => file.startsWith(prefix)) ||
    [
      'package.json',
      'package-lock.json',
      'astro.config.mjs',
      'tsconfig.json',
      'eslint.config.js',
      '.prettierrc.json',
    ].includes(file),
);

test('all existing portfolio, shared website, contact data and configuration bytes remain unchanged', async (t) => {
  let count = 0;
  for (const file of guarded) {
    if (allowedExisting.has(file)) continue;
    const before = execFileSync('git', ['show', `${parent}:${file}`], {
      maxBuffer: 32 * 1024 * 1024,
    });
    const after = await readFile(file);
    assert.equal(hash(after), hash(before), `Outside this Contact milestone: ${file}`);
    count += 1;
  }
  t.diagnostic(`${count} tracked source, asset and configuration files match immutable ${parent}.`);
});

test('new application source stays inside the dedicated Contact motion boundary', () => {
  const tracked = execFileSync('git', [
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
  ])
    .toString('utf8')
    .split('\0')
    .filter((file) => file.startsWith('src/') && !parentFiles.includes(file));
  for (const file of tracked)
    assert(allowedNew.has(file), `Review the exact new application source boundary: ${file}`);
});

test('production server markup is settled and the owner-unconfigured form cannot pretend to submit', async () => {
  const html = await readFile('dist/contact/index.html', 'utf8');
  assert.match(html, /data-first-thought/);
  assert.match(html, /data-thought-state="settled"/);
  assert.match(html, /data-thought-phase="conversation"/);
  assert.match(html, /data-form-state="unconfigured"/);
  const form = html.match(/<form\b[^>]*\bdata-enquiry-form\b[^>]*>/)?.[0];
  assert(form);
  assert.doesNotMatch(form, /\saction=/);
  assert.doesNotMatch(html, /formspree\.io\/f\//);
  assert.match(html, /mailto:official@drawnoutdigital\.com/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(html, /data-site-footer/);
});
