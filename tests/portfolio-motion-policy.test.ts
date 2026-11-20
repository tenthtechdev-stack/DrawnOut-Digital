import assert from 'node:assert/strict';
import test from 'node:test';
import { selectMotionCandidates } from '../src/lib/portfolio-motion-policy';

test('a visible incumbent survives the entry threshold until it leaves the retention band', () => {
  const selected = (ratio: number, active: boolean) =>
    selectMotionCandidates([{ id: 'loop', ratio, active, disabled: false }], true);
  assert.deepEqual(selected(0.34, false), []);
  assert.deepEqual(selected(0.35, false), ['loop']);
  for (const ratio of [0.36, 0.349, 0.3, 0.21, 0.2])
    assert.deepEqual(selected(ratio, true), ['loop']);
  assert.deepEqual(selected(0.199, true), []);
  assert.deepEqual(selected(0, true), []);
});

test('small clipping and center changes do not replace a visible decoder, meaningful changes do', () => {
  const candidate = (ratio: number) => [
    { id: 'incumbent', ratio: 0.6, centerDistance: 200, active: true, disabled: false },
    { id: 'challenger', ratio, centerDistance: 0, active: false, disabled: false },
  ];
  for (const ratio of [0.6, 0.61, 0.65, 0.67])
    assert.deepEqual(selectMotionCandidates(candidate(ratio), true), ['incumbent']);
  assert.deepEqual(selectMotionCandidates(candidate(0.7), true), ['challenger']);
});

test('retention never revives a hidden, disabled or invalid candidate', () => {
  const invalid = [
    { id: 'hidden', ratio: 1, active: true, disabled: true },
    { id: 'nan', ratio: NaN, active: true, disabled: false },
    { id: 'infinite', ratio: Infinity, active: true, disabled: false },
    { id: 'offscreen', ratio: -0.1, active: true, disabled: false },
    { id: 'visible', ratio: 0.4, active: false, disabled: false },
  ];
  assert.deepEqual(selectMotionCandidates(invalid, false), ['visible']);
});

test('hysteretic selection still enforces one mobile or two desktop leases without mutating inputs', () => {
  const candidates = Object.freeze(
    [0.8, 0.75, 0.7, 0.6].map((ratio, index) =>
      Object.freeze({ id: `loop-${index}`, ratio, active: true, disabled: false }),
    ),
  );
  const before = structuredClone(candidates);
  assert.deepEqual(selectMotionCandidates(candidates, true), ['loop-0']);
  assert.deepEqual(selectMotionCandidates(candidates, false), ['loop-0', 'loop-1']);
  assert.deepEqual(candidates, before);
});
