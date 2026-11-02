import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { canPublish } from '../src/lib/project-schema.ts';
import { servicePages } from '../src/data/services.ts';

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

async function projectRecords() {
  const directory = 'src/content/projects';
  const names = (await readdir(directory)).filter((name) => name.endsWith('.json'));
  return Promise.all(
    names.map(async (name) => JSON.parse(await readFile(path.join(directory, name), 'utf8'))),
  );
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mediaSources(record) {
  return [record.cover, ...record.gallery.map((media) => media.src)];
}

function casePathPattern(slug) {
  return new RegExp(`/work/${escapePattern(slug)}(?:["'/\\s?#]|$)`);
}

test('production emits foundation routes and approved cases without private preview or draft routes', async () => {
  const output = await files('dist');
  const records = await projectRecords();
  const drafts = records.filter((record) => !canPublish(record));
  const approved = records.filter(canPublish);
  const publicTitles = new Set(approved.map((record) => record.title));
  assert.ok(records.length >= 11, 'The complete supplied collection must be inspected.');
  const htmlFiles = output.filter((file) => file.endsWith('.html'));
  assert.deepEqual(
    htmlFiles.map((file) => path.relative('dist', file).split(path.sep).join('/')).sort(),
    [
      '404.html',
      'about/index.html',
      'contact/index.html',
      'index.html',
      'services/index.html',
      ...servicePages.map((service) => `services/${service.slug}/index.html`),
      'work/index.html',
      ...approved.map((record) => `work/${record.slug}/index.html`),
    ].sort(),
  );
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /noindex, nofollow/, `${file} must retain review indexing restrictions`);
    assert.match(html, /<title>[^<]+<\/title>/, `${file} needs a useful title`);
    assert.match(html, /name="description"\s+content="[^"]+"/, `${file} needs a description`);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${file} needs one H1`);
    assert.doesNotMatch(html, /\/_preview\/work\//i);
    for (const record of drafts) {
      if (!publicTitles.has(record.title)) {
        assert.doesNotMatch(
          html,
          new RegExp(escapePattern(record.title)),
          `${file} must exclude unapproved project ${record.title}.`,
        );
      }
      assert.doesNotMatch(
        html,
        casePathPattern(record.slug),
        `${file} must not link a draft case.`,
      );
    }
  }
  const home = await readFile('dist/index.html', 'utf8');
  assert.match(home, /We make ideas/);
  assert.match(home, /data-site-header/);
  assert.match(home, /data-site-footer/);
  for (const section of ['studio', 'services', 'approach', 'process', 'fit']) {
    assert.match(
      home,
      new RegExp(`data-${section}`),
      `Production must retain the ${section} story without draft art.`,
    );
  }
  const text = home.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const heading of [
    /Not another creative agency\./i,
    /Pretty isn't the point\./i,
    /Small details\. Big picture\./i,
    /Built for brands going somewhere\./i,
  ])
    assert.match(text, heading);
});

test('production asset output excludes every draft project image', async () => {
  const output = await files('dist');
  const records = await projectRecords();
  const approvedSources = new Set(records.filter(canPublish).flatMap(mediaSources));
  const privateSources = records
    .filter((record) => !canPublish(record))
    .flatMap(mediaSources)
    .filter((source) => !approvedSources.has(source));
  assert.ok(
    !output.some((file) => /portfolio-originals|design-assets|_preview/i.test(file)),
    'Original archives and private preview routes must remain outside production.',
  );
  for (const source of privateSources) {
    const stem = path.parse(source).name;
    const pattern = new RegExp(`(?:^|/)${escapePattern(stem)}(?:[._-])`);
    assert.ok(
      !output.some((file) => pattern.test(file)),
      `Unapproved image ${stem} must not appear in production asset filenames.`,
    );
  }
});

test('production text and generated assets do not expose original portfolio files or draft metadata', async () => {
  const output = await files('dist');
  const records = await projectRecords();
  const drafts = records.filter((record) => !canPublish(record));
  const approved = records.filter(canPublish);
  const publicTitles = new Set(approved.map((record) => record.title));
  const approvedSources = new Set(approved.flatMap(mediaSources));
  for (const file of output.filter((name) => /\.(?:html|css|js|json|xml)$/.test(name))) {
    const payload = await readFile(file, 'utf8');
    assert.doesNotMatch(
      payload,
      /portfolio-originals|design-assets\/portfolio|\/_preview\/work\//i,
      `${file} must not leak unapproved project content.`,
    );
    for (const record of drafts) {
      if (!publicTitles.has(record.title)) {
        assert.ok(!payload.includes(record.title), `${file} leaked project title ${record.title}.`);
      }
      assert.doesNotMatch(
        payload,
        casePathPattern(record.slug),
        `${file} leaked a draft case URL.`,
      );
      assert.ok(
        !payload.includes(record.assetSource),
        `${file} leaked original provenance metadata.`,
      );
      for (const source of mediaSources(record).filter((source) => !approvedSources.has(source))) {
        assert.ok(
          !payload.includes(path.basename(source)),
          `${file} leaked draft image ${path.basename(source)}.`,
        );
      }
    }
  }
});

test('approved artwork has real public cards and cases without invented facts or review labels', async () => {
  const records = (await projectRecords()).filter(canPublish);
  const home = await readFile('dist/index.html', 'utf8');
  const work = await readFile('dist/work/index.html', 'utf8');
  assert.ok(records.length >= 11, 'The supplied 11 structured projects are approved for display.');
  for (const record of records) {
    assert.match(work, new RegExp(`href="/work/${escapePattern(record.slug)}"`));
    if (record.featured)
      assert.match(home, new RegExp(`href="/work/${escapePattern(record.slug)}"`));
    const html = await readFile(`dist/work/${record.slug}/index.html`, 'utf8');
    assert.doesNotMatch(html, /Private draft|Pending studio review|Visual preview|data-case-draft/);
    assert.match(html, /data-case-previous/);
    assert.match(html, /data-case-next/);
    if (!record.contentVerified) {
      assert.doesNotMatch(html, /data-case-facts|data-case-narrative|data-case-evidence/);
    }
    if (!record.creditApproved) {
      assert.doesNotMatch(html, /<h2>Credits\.<\/h2>|<dt>Organization<\/dt>|<dt>Our role<\/dt>/);
    }
  }
  for (const html of [home, work])
    assert.doesNotMatch(
      html,
      /Private draft|Pending studio review|Visual preview|Local portfolio preview/,
    );
});

test('service previews have distinct metadata, complete copy, FAQs and truthful structured data', async () => {
  const titles = new Set();
  const home = await readFile('dist/index.html', 'utf8');
  const overview = await readFile('dist/services/index.html', 'utf8');
  for (const service of servicePages) {
    const route = `/services/${service.slug}`;
    const html = await readFile(`dist${route}/index.html`, 'utf8');
    titles.add(service.seoTitle);
    assert.ok(html.includes(service.seoTitle.replaceAll('&', '&amp;')));
    assert.match(html, /noindex, nofollow/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal(
      (html.match(/<details[\s>]/g) ?? []).length,
      6,
      'Five FAQs plus the shared no-JS menu',
    );
    for (const faq of service.faqs)
      assert.ok(html.includes(faq.question.replaceAll('&', '&amp;').replaceAll("'", '&#39;')));
    assert.match(html, /href="\/contact"[^>]*data-service-enquiry/);
    const schema = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
    );
    assert.deepEqual(
      schema['@graph'].map((entry) => entry['@type']),
      ['BreadcrumbList', 'Service'],
    );
    assert.equal(schema['@graph'][0].itemListElement[2].item, route);
    assert.equal(schema['@graph'][1].name, service.title);
    assert.equal(schema['@graph'][1].url, route);
    assert.equal(schema['@graph'][1].aggregateRating, undefined);
    assert.equal(schema['@graph'][1].offers, undefined);
    assert.ok(home.includes(`href="${route}"`));
    assert.ok(overview.includes(`href="${route}"`));
  }
  assert.equal(titles.size, 5);
});

test('only approved motion exports ship, and cards defer video sources until visible', async () => {
  const records = await projectRecords();
  const expected = records
    .filter(canPublish)
    .flatMap((record) => (record.motion ? [record.motion.landscape, record.motion.portrait] : []));
  const emitted = (await files('dist/media/portfolio')).map((file) => path.basename(file));
  assert.deepEqual(emitted.sort(), [...new Set(expected)].sort());
  for (const file of emitted)
    assert.ok((await readFile(`dist/media/portfolio/${file}`)).length > 0);
  for (const route of ['dist/index.html', 'dist/work/index.html']) {
    const html = await readFile(route, 'utf8');
    const videos = html.match(/<video\b[^>]*data-portfolio-video[^>]*>/g) ?? [];
    assert.equal(videos.length, 6, `${route} needs all six project compositions.`);
    for (const video of videos) {
      assert.doesNotMatch(video, /\ssrc=/);
      assert.match(video, /preload="none"/);
      assert.match(video, /aria-hidden="true"/);
      assert.match(video, /\bmuted\b/);
      assert.match(video, /\bplaysinline\b/);
    }
    assert.equal((html.match(/<button\b[^>]*data-motion-toggle=/g) ?? []).length, 6);
  }
});
