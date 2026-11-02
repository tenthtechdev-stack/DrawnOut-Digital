import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'astro/zod';
import { projectSchema } from '../src/lib/project-schema';
import {
  selectMotionCandidates,
  selectPortfolioRhythm,
  type PortfolioRhythmProject,
} from '../src/lib/portfolio-motion-policy';

const rhythmProjects: readonly PortfolioRhythmProject[] = [
  { id: 'bunzo', hasMotion: true },
  { id: 'sol-community-center', hasMotion: true, priority: 1 },
  { id: 'triarch', hasMotion: true },
  { id: 'churros', hasMotion: true },
  { id: 'capture', hasMotion: false },
  { id: 'by-tech-group', hasMotion: true },
  { id: 'khalo', hasMotion: false },
  { id: 'fk-technology', hasMotion: false },
  { id: 'feed-n-seed', hasMotion: false },
  { id: 'abacus-immigration', hasMotion: false },
  { id: 'u-wanna-smoothie', hasMotion: true },
];

test('visible project rhythm preserves SOL and approved ordering with genuine static spacers', () => {
  const immutable = rhythmProjects.map((project) => Object.freeze({ ...project }));
  const before = structuredClone(immutable);
  assert.deepEqual(selectPortfolioRhythm(Object.freeze(immutable)), [
    'sol-community-center',
    'churros',
    'by-tech-group',
    'u-wanna-smoothie',
  ]);
  assert.deepEqual(immutable, before);
  // The homepage omits Capture, so By Tech provides the static beat before Smoothie.
  const featured = rhythmProjects.filter(({ hasMotion }) => hasMotion);
  assert.deepEqual(selectPortfolioRhythm(featured), [
    'sol-community-center',
    'churros',
    'u-wanna-smoothie',
  ]);
});

test('filters curate the visible subset, counting poster-only cards rather than motion parity', () => {
  const select = (ids: string[]) =>
    selectPortfolioRhythm(rhythmProjects.filter(({ id }) => ids.includes(id)));
  assert.deepEqual(select(['bunzo', 'churros', 'khalo', 'feed-n-seed', 'u-wanna-smoothie']), [
    'bunzo',
    'u-wanna-smoothie',
  ]);
  assert.deepEqual(
    select(['bunzo', 'capture', 'by-tech-group', 'fk-technology', 'abacus-immigration']),
    ['bunzo', 'by-tech-group'],
  );
  assert.deepEqual(
    select([
      'sol-community-center',
      'triarch',
      'capture',
      'by-tech-group',
      'fk-technology',
      'feed-n-seed',
      'abacus-immigration',
      'u-wanna-smoothie',
    ]),
    ['sol-community-center', 'by-tech-group', 'u-wanna-smoothie'],
  );
  assert.deepEqual(select(['triarch']), ['triarch']);
  assert.deepEqual(select(['capture', 'khalo']), []);
  assert.deepEqual(selectPortfolioRhythm([]), []);
});

test('curation is deterministic and priority never invents motion for a poster-only project', () => {
  const input = [
    { id: 'still', hasMotion: false, priority: 10 },
    { id: 'first', hasMotion: true },
    { id: 'second', hasMotion: true },
    { id: 'space', hasMotion: false },
    { id: 'last', hasMotion: true },
  ];
  assert.deepEqual(selectPortfolioRhythm(input), ['first', 'last']);
  assert.deepEqual(selectPortfolioRhythm(input), ['first', 'last']);
});

test('mobile selects one visible motion decoder, desktop two, without mutating candidates', () => {
  const candidates = [
    { id: 'low', ratio: 0.34, disabled: false },
    { id: 'middle', ratio: 0.5, disabled: false },
    { id: 'paused', ratio: 1, disabled: true },
    { id: 'best', ratio: 0.9, disabled: false },
    { id: 'edge', ratio: 0.35, disabled: false },
  ];
  assert.deepEqual(selectMotionCandidates(candidates, true), ['best']);
  assert.deepEqual(selectMotionCandidates(candidates, false), ['best', 'middle']);
  assert.equal(candidates[0]?.id, 'low');
  assert.deepEqual(selectMotionCandidates(candidates.slice(0, 1), true), []);
});

test('equal visibility selection is deterministic and paused/offscreen loops do not consume capacity', () => {
  assert.deepEqual(
    selectMotionCandidates(
      [
        { id: 'b', ratio: 0.8, disabled: false },
        { id: 'a', ratio: 0.8, disabled: false },
        { id: 'c', ratio: 0, disabled: false },
      ],
      true,
    ),
    ['a'],
  );
});

test('motion records require provenance and confined local MP4 filenames', () => {
  const schema = projectSchema(z.string());
  const record = {
    title: 'Synthetic motion record',
    slug: 'synthetic',
    summary: 'Testing media paths.',
    cover: '../../assets/portfolio/cover.webp',
    coverAlt: 'Synthetic artwork.',
    assetSource: 'Test.',
    motion: {
      landscape: 'synthetic-landscape.mp4',
      portrait: 'synthetic-portrait.mp4',
      source: 'Test source.',
    },
  };
  assert.equal(schema.safeParse(record).success, true);
  for (const landscape of [
    '../private.mp4',
    '/private-landscape.mp4',
    'https://example.com/a.mp4',
    'file.webm',
    'UPPER-landscape.mp4',
  ]) {
    assert.equal(
      schema.safeParse({ ...record, motion: { ...record.motion, landscape } }).success,
      false,
    );
  }
  assert.equal(
    schema.safeParse({ ...record, motion: { ...record.motion, source: '' } }).success,
    false,
  );
});

test('equally visible cards prefer the viewport center instead of starving a later project', () => {
  const candidates = [
    { id: 'by-tech', ratio: 1, centerDistance: 262, disabled: false },
    { id: 'u-wanna', ratio: 0.999814, centerDistance: 120, disabled: false },
    { id: 'offscreen', ratio: 0.1, centerDistance: 0, disabled: false },
  ];
  assert.deepEqual(selectMotionCandidates(candidates, true), ['u-wanna']);
  assert.deepEqual(selectMotionCandidates(candidates, false), ['u-wanna', 'by-tech']);
});
