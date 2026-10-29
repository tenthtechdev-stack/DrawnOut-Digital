import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'astro/zod';
import { projectSchema } from '../src/lib/project-schema';
import { selectMotionCandidates } from '../src/lib/portfolio-motion-policy';

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
  assert.deepEqual(selectMotionCandidates([
    { id: 'b', ratio: 0.8, disabled: false },
    { id: 'a', ratio: 0.8, disabled: false },
    { id: 'c', ratio: 0, disabled: false },
  ], true), ['a']);
});

test('motion records require provenance and confined local MP4 filenames', () => {
  const schema = projectSchema(z.string());
  const record = {
    title: 'Synthetic motion record', slug: 'synthetic', summary: 'Testing media paths.',
    cover: '../../assets/portfolio/cover.webp', coverAlt: 'Synthetic artwork.', assetSource: 'Test.',
    motion: {
      landscape: 'synthetic-landscape.mp4', portrait: 'synthetic-portrait.mp4', source: 'Test source.',
    },
  };
  assert.equal(schema.safeParse(record).success, true);
  for (const landscape of ['../private.mp4', '/private-landscape.mp4', 'https://example.com/a.mp4', 'file.webm', 'UPPER-landscape.mp4']) {
    assert.equal(schema.safeParse({ ...record, motion: { ...record.motion, landscape } }).success, false);
  }
  assert.equal(schema.safeParse({ ...record, motion: { ...record.motion, source: '' } }).success, false);
});
