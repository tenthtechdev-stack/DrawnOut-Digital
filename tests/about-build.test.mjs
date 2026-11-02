import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { aboutPage } from '../src/data/about.ts';

const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

test('production About includes the full story, approved derived portrait and truthful schema', async () => {
  const html = await readFile('dist/about/index.html', 'utf8');
  const text = decode(html.replace(/<[^>]*>/g, ' '));
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal((html.match(/<section\b[^>]*aria-labelledby="about-/g) ?? []).length, 7);
  assert.ok(html.includes(`<title>${aboutPage.metadata.title}</title>`));
  assert.ok(html.includes(aboutPage.metadata.description));
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.doesNotMatch(html, /<div\b[^>]*data-signature-intro-overlay/);
  for (const chapter of [
    aboutPage.hero,
    aboutPage.origin,
    aboutPage.founders,
    aboutPage.philosophy,
    aboutPage.approach,
    aboutPage.audience,
    aboutPage.invitation,
  ])
    assert.ok(text.includes(chapter.heading), `Missing chapter: ${chapter.heading}`);
  for (const paragraph of [
    ...aboutPage.hero.paragraphs,
    ...aboutPage.origin.paragraphs,
    ...aboutPage.audience.paragraphs,
    ...aboutPage.founders.profiles.flatMap(({ role, experience, description }) => [
      role,
      experience,
      description,
    ]),
    aboutPage.philosophy.intro,
    ...aboutPage.philosophy.principles.flatMap(({ heading, description }) => [
      heading,
      description,
    ]),
    ...aboutPage.approach.phases.flatMap(({ heading, description }) => [heading, description]),
  ])
    assert.ok(text.includes(paragraph), `Missing supplied copy: ${paragraph}`);
  assert.match(html, /data-portrait-state="approved"/);
  assert.match(html, /founders-sketch-approved/);
  assert.doesNotMatch(html, /data-private-portrait-review|data:image\/|Private portrait review/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (match) => JSON.parse(match[1]),
  );
  const schema = schemas.find((value) => value['@type'] === 'AboutPage');
  assert.ok(schema);
  assert.deepEqual(schema.about, { '@type': 'Organization', name: 'DrawnOut Digital' });
  assert.equal(schema.name, aboutPage.metadata.title);
  assert.equal(schema.description, aboutPage.metadata.description);
  assert.doesNotMatch(JSON.stringify(schema), /aggregateRating|review|award|foundingDate|alumniOf/);
});

test('production packages only the approved derived founder source asset', async () => {
  const sourceAssets = await readdir('src/assets/about');
  assert.deepEqual(
    sourceAssets.filter((name) => !name.startsWith('.')),
    ['founders-sketch-approved.png'],
  );
  const html = await readFile('dist/about/index.html', 'utf8');
  assert.doesNotMatch(html, /ABOUT_PORTRAIT_REVIEW_FILE|file:\/\/|\/workspace\/|\/tmp\//);
  const home = await readFile('dist/index.html', 'utf8');
  assert.match(home, /<div\b[^>]*data-signature-intro-overlay/);
});
