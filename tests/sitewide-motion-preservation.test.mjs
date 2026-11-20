import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const parent = 'b1c7db29a186c7413cad0bc5cdb59d62d5200f66';
const approvedEdits = new Set([
  'src/layouts/SiteLayout.astro',
  'src/components/ProjectCard.astro',
  'src/components/work/WorkCard.astro',
  'src/components/case/PremiumCaseGallery.astro',
  'src/components/case/PremiumCaseStudy.astro',
  'src/components/PortfolioMotionToggle.astro',
  'src/components/MediaSlot.astro',
  'src/components/about/PremiumAboutHero.astro',
  'src/scripts/about-motion.ts',
  'src/scripts/portfolio-motion.ts',
  'src/scripts/motion.ts',
  'src/lib/portfolio-motion-policy.ts',
  'tests/browser/portfolio-motion.spec.ts',
  'tests/browser/motion-completion.spec.ts',
  'tests/browser/motion-quality.spec.ts',
  'tests/browser/case-premium.spec.ts',
  'tests/browser/storytelling.spec.ts',
  'tests/build-output.test.mjs',
]);
const approvedNewSource = new Set([
  'src/components/PortfolioMotionBoot.astro',
  'src/components/PortfolioMotionPreference.astro',
  'src/lib/portfolio-motion-preference.ts',
  'src/scripts/portfolio-motion-preference.ts',
  'src/scripts/about-arrival.ts',
]);
const parentFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', parent])
  .toString()
  .split('\0')
  .filter(Boolean);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('all approved media, source assets, content, enquiry logic and unrelated code remain byte-identical to PR22', async (t) => {
  let count = 0;
  for (const file of parentFiles) {
    if (approvedEdits.has(file)) continue;
    if (
      !['src/', 'public/', 'design-assets/', 'tests/', 'scripts/portfolio/'].some((prefix) =>
        file.startsWith(prefix),
      ) &&
      !/^(?:playwright\..*\.config\.ts|package(?:-lock)?\.json|astro\.config\.mjs|tsconfig\.json|eslint\.config\.js)$/.test(
        file,
      )
    )
      continue;
    const before = execFileSync('git', ['show', `${parent}:${file}`], {
      maxBuffer: 32 * 1024 * 1024,
    });
    assert.equal(
      hash(await readFile(file)),
      hash(before),
      `Outside Issue23's authorized scope: ${file}`,
    );
    count += 1;
  }
  t.diagnostic(`${count} protected files match immutable ${parent}.`);
});

test('the obsolete control component is removed and new application source stays scoped', async () => {
  await assert.rejects(access('src/components/PortfolioMotionToggle.astro'));
  const files = execFileSync('git', [
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
  ])
    .toString()
    .split('\0');
  for (const file of files.filter((file) => file.startsWith('src/') && !parentFiles.includes(file)))
    assert(approvedNewSource.has(file), `Unreviewed new application source: ${file}`);
});

test('all public pages retain noindex, official contact fallback and one motion preference without individual control markup', async () => {
  for (const route of [
    'index.html',
    'work/index.html',
    'work/sol-community-center/index.html',
    'about/index.html',
    'services/index.html',
    'services/brand-identity/index.html',
    'contact/index.html',
  ]) {
    const html = await readFile(`dist/${route}`, 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.match(html, /mailto:official@drawnoutdigital\.com/);
    assert.equal(
      (html.match(/<button\b[^>]*data-portfolio-motion-preference(?:\s|=|>)/g) ?? []).length,
      1,
    );
    assert.doesNotMatch(
      html,
      /data-motion-toggle=|portfolio-motion-controls|work-controls-reservation/,
    );
  }
  const contact = await readFile('dist/contact/index.html', 'utf8');
  assert.match(contact, /data-form-state="unconfigured"/);
  assert.doesNotMatch(contact, /formspree\.io\/f\//);
});
