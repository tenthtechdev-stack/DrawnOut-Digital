import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isAbsolute, relative, sep } from 'node:path';
import test from 'node:test';
import { z } from 'astro/zod';
import {
  canPublish,
  projectSchema,
  selectPublicProjects,
  type PublicationState,
} from '../src/lib/project-schema';

const schema = projectSchema(z.string().min(1));
const approved: PublicationState = {
  status: 'published',
  visibility: 'public',
  projectType: 'client',
  publicationApproved: true,
  creditApproved: true,
};
const minimalRecord = {
  title: 'Review sample',
  slug: 'review-sample',
  summary: 'Schema validation fixture.',
  cover: '../../assets/projects/bunzo.webp',
  coverAlt: 'Portfolio presentation board.',
  assetSource: 'Test fixture only.',
};

test('missing approval metadata defaults to private, unpublished content', () => {
  const record = schema.parse(minimalRecord);
  assert.equal(record.status, 'draft');
  assert.equal(record.visibility, 'private');
  assert.equal(record.projectType, 'unknown');
  assert.equal(record.publicationApproved, false);
  assert.equal(record.creditApproved, false);
  assert.equal(canPublish(record), false);
});

test('every approval and known provenance is required independently', () => {
  for (const status of ['draft', 'review', 'published'] as const) {
    for (const visibility of ['private', 'public'] as const) {
      for (const projectType of ['unknown', 'client', 'concept', 'internal'] as const) {
        for (const publicationApproved of [false, true]) {
          for (const creditApproved of [false, true]) {
            const record = {
              status,
              visibility,
              projectType,
              publicationApproved,
              creditApproved,
            };
            const expected =
              status === 'published' &&
              visibility === 'public' &&
              projectType !== 'unknown' &&
              publicationApproved &&
              creditApproved;
            assert.equal(canPublish(record), expected, JSON.stringify(record));
          }
        }
      }
    }
  }
});

test('URL slugs reject traversal, separators, unsafe text and ambiguous casing', () => {
  for (const slug of [
    '../bunzo',
    'work/bunzo',
    'work\\bunzo',
    '%2e%2e',
    'Bunzo',
    'bunzo?',
    'two words',
    '-bunzo',
    'bunzo-',
    'bunzo--draft',
    '',
  ]) {
    assert.equal(schema.safeParse({ ...minimalRecord, slug }).success, false, slug);
  }
  for (const slug of ['bunzo', 'sol-community-center', 'project-2026']) {
    assert.equal(schema.safeParse({ ...minimalRecord, slug }).success, true, slug);
  }
});

test('a missing or invalid runtime provenance value fails closed', () => {
  for (const projectType of [undefined, null, '', 'unverified']) {
    assert.equal(canPublish({ ...approved, projectType } as unknown as PublicationState), false);
  }
});

test('cover alternatives and result evidence cannot be empty', () => {
  assert.equal(schema.safeParse({ ...minimalRecord, coverAlt: '  ' }).success, false);
  assert.equal(
    schema.safeParse({
      ...minimalRecord,
      results: [{ label: 'Result', value: 'Unverified', evidenceSource: '' }],
    }).success,
    false,
  );
});

test('the public selector excludes drafts and applies deterministic featured ordering', () => {
  const entries = [
    { id: 'b', data: { ...approved, slug: 'b', featured: true, featuredOrder: 2 } },
    { id: 'a', data: { ...approved, slug: 'a', featured: true, featuredOrder: 2 } },
    { id: 'first', data: { ...approved, slug: 'first', featured: true, featuredOrder: 1 } },
    { id: 'other', data: { ...approved, slug: 'other', featured: false } },
    {
      id: 'draft',
      data: { ...approved, slug: 'draft', featured: true, status: 'draft' as const },
    },
    {
      id: 'uncredited',
      data: { ...approved, slug: 'uncredited', featured: true, creditApproved: false },
    },
  ];
  assert.deepEqual(
    selectPublicProjects(entries).map(({ id }) => id),
    ['first', 'a', 'b', 'other'],
  );
  assert.deepEqual(
    selectPublicProjects(entries, { featuredOnly: true }).map(({ id }) => id),
    ['first', 'a', 'b'],
  );
  assert.equal(entries[0]?.id, 'b', 'selection must not reorder source content');
});

test('project records retain the supplied collection, safe local media and publication safeguards', async () => {
  const directory = new URL('../src/content/projects/', import.meta.url);
  const filenames = (await readdir(directory)).filter((name) => name.endsWith('.json'));
  assert.ok(filenames.length >= 11);
  for (const original of [
    'abacus-immigration',
    'bunzo',
    'by-tech-group',
    'churros',
    'feed-n-seed',
    'sol-community-center',
    'triarch',
    'capture',
    'khalo',
    'fk-technology',
    'u-wanna-smoothie',
  ]) {
    assert.ok(filenames.includes(`${original}.json`), `${original} must remain available.`);
  }
  const records = [];
  for (const filename of filenames) {
    const path = new URL(filename, directory);
    const record = schema.parse(JSON.parse(await readFile(path, 'utf8')));
    if (!canPublish(record)) {
      assert.equal(record.visibility, 'private', `${filename} must remain private until approved.`);
      assert.ok(
        record.status === 'draft' || record.status === 'review',
        `${filename} must not claim publication before all approvals are present.`,
      );
    }
    assert.equal(record.slug, filename.replace(/\.json$/, ''));
    for (const source of [record.cover, ...record.gallery.map((media) => media.src)]) {
      const mediaPath = new URL(source, path);
      const localAssetPath = relative(
        fileURLToPath(new URL('../src/assets/', import.meta.url)),
        fileURLToPath(mediaPath),
      );
      assert.ok(
        localAssetPath !== '..' &&
          !localAssetPath.startsWith(`..${sep}`) &&
          !isAbsolute(localAssetPath),
        'Project media must remain inside src/assets.',
      );
      assert.ok((await readFile(mediaPath)).length > 0);
    }
    records.push({ id: record.slug, data: record });
  }
  assert.equal(new Set(records.map(({ id }) => id)).size, filenames.length);
  assert.deepEqual(
    new Set(selectPublicProjects(records).map(({ id }) => id)),
    new Set(records.filter(({ data }) => canPublish(data)).map(({ id }) => id)),
  );
});
