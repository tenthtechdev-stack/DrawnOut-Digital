import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'astro/zod';
import {
  canPublish,
  projectSchema,
  selectPublicProjects,
  type PublicationState,
  type ProjectCategory,
} from '../src/lib/project-schema';
import {
  filterWorkProjects,
  getCategoryFilters,
  getProjectNeighbors,
  isProjectCategory,
  sortWorkProjects,
} from '../src/lib/portfolio';

const schema = projectSchema(z.string().min(1));
const minimal = {
  title: 'Artwork review',
  slug: 'artwork-review',
  summary: 'Observed artwork, not a commissioned service claim.',
  cover: '../../assets/portfolio/artwork.webp',
  coverAlt: 'A supplied identity presentation.',
  assetSource: 'A supplied original PNG; review fixture only.',
};

function project(
  slug: string,
  categories: ProjectCategory[] = [],
  workOrder?: number,
  featuredOrder?: number,
) {
  return { id: slug, data: { slug, categories, workOrder, featuredOrder } };
}

test('new editorial fields default safely without verifying narratives or publication', () => {
  const record = schema.parse({
    ...minimal,
    gallery: [{ src: '../../assets/portfolio/detail.webp', alt: 'A packaging detail.' }],
  });
  assert.deepEqual(record.categories, []);
  assert.equal(record.contentVerified, false);
  assert.equal(record.presentation, 'wide');
  assert.equal(record.gallery[0]?.layout, 'full');
  assert.equal(record.workOrder, undefined);
  assert.equal(canPublish(record), false);
  const verifiedDraft = { ...record, contentVerified: true };
  assert.equal(canPublish(verifiedDraft), false);
});

test('editorial metadata rejects unsupported categories, duplicate tags and invalid ordering', () => {
  for (const invalid of [
    { categories: ['invented-service'] },
    { categories: ['identity', 'identity'] },
    { workOrder: -1 },
    { workOrder: 1.5 },
    { presentation: 'automatic-cinematic' },
    { gallery: [{ src: 'detail.webp', alt: 'Detail.', layout: 'unknown' }] },
  ]) {
    assert.equal(schema.safeParse({ ...minimal, ...invalid }).success, false);
  }
  assert.equal(
    schema.safeParse({
      ...minimal,
      categories: ['identity', 'print'],
      workOrder: 0,
      presentation: 'portrait',
      overview: 'A supplied business-card composition.',
    }).success,
    true,
  );
});

test('Work order is deterministic, falls back to featured order and does not mutate input', () => {
  const records = [
    project('zeta', [], undefined, 2),
    project('first', [], 0, 99),
    project('unranked'),
    project('alpha', [], 2, 20),
    project('legacy', [], undefined, 1),
  ];
  assert.deepEqual(
    sortWorkProjects(records).map(({ id }) => id),
    ['first', 'legacy', 'alpha', 'zeta', 'unranked'],
  );
  assert.equal(records[0]?.id, 'zeta');
  assert.equal(records[1]?.data.featuredOrder, 99);
});

test('filters are derived only from actual tags, with exact overlapping counts', () => {
  const records = [
    project('first', ['identity', 'packaging']),
    project('second', ['identity', 'print']),
    project('untagged'),
  ];
  assert.deepEqual(getCategoryFilters(records), [
    { id: 'all', label: 'All work', count: 3 },
    { id: 'identity', label: 'Identity', count: 2 },
    { id: 'packaging', label: 'Packaging', count: 1 },
    { id: 'print', label: 'Print', count: 1 },
  ]);
  assert.deepEqual(getCategoryFilters([]), [{ id: 'all', label: 'All work', count: 0 }]);
  assert.deepEqual(
    filterWorkProjects(records, 'identity').map(({ id }) => id),
    ['first', 'second'],
  );
  assert.deepEqual(
    filterWorkProjects(records, 'packaging').map(({ id }) => id),
    ['first'],
  );
  assert.deepEqual(filterWorkProjects(records, 'digital'), []);
  assert.deepEqual(filterWorkProjects(records, 'unknown'), []);
  assert.equal(filterWorkProjects(records).length, 3);
  assert.equal(isProjectCategory('identity'), true);
  assert.equal(isProjectCategory('Identity'), false);
});

test('public filtering and neighboring case links never regain excluded draft records', () => {
  const approved: PublicationState = {
    status: 'published',
    visibility: 'public',
    projectType: 'client',
    publicationApproved: true,
    creditApproved: true,
  };
  const records = [
    {
      id: 'first',
      data: { ...project('first', ['identity'], 1).data, ...approved, featured: false },
    },
    {
      id: 'draft',
      data: {
        ...project('draft', ['packaging'], 2).data,
        ...approved,
        status: 'draft' as const,
        featured: false,
      },
    },
    {
      id: 'last',
      data: { ...project('last', ['print'], 3).data, ...approved, featured: false },
    },
  ];
  const eligible = selectPublicProjects(records);
  assert.deepEqual(getCategoryFilters(eligible), [
    { id: 'all', label: 'All work', count: 2 },
    { id: 'identity', label: 'Identity', count: 1 },
    { id: 'print', label: 'Print', count: 1 },
  ]);
  const neighbors = getProjectNeighbors(eligible, 'first');
  assert.equal(neighbors.previous?.id, 'last');
  assert.equal(neighbors.next?.id, 'last');
  assert.deepEqual(getProjectNeighbors(eligible, 'draft'), {
    previous: undefined,
    next: undefined,
  });
  assert.deepEqual(getProjectNeighbors(eligible.slice(0, 1), 'first'), {
    previous: undefined,
    next: undefined,
  });
  assert.deepEqual(getProjectNeighbors([], 'first'), { previous: undefined, next: undefined });
});
