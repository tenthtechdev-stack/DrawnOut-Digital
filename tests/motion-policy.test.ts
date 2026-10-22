import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsMotion, expansionProfile } from '../src/lib/motion-policy';

test('reduced motion and data saving independently opt out of motion', () => {
  for (const reducedMotion of [false, true]) {
    for (const saveData of [false, true]) {
      assert.equal(allowsMotion({ reducedMotion, saveData }), !reducedMotion && !saveData);
    }
  }
});

test('small screens reduce expansion amplitude without changing the aspect ratio or document geometry', () => {
  for (const ratio of [0.6, 1, 1.77, 3.9]) {
    const mobile = expansionProfile(390, ratio);
    const desktop = expansionProfile(1440, ratio);
    assert.ok(mobile.inset < desktop.inset);
    assert.ok(mobile.radius < desktop.radius);
    assert.ok(mobile.scale < desktop.scale);
    assert.ok(mobile.drift < desktop.drift);
    assert.ok(mobile.scrub <= desktop.scrub);
    assert.ok(mobile.inset >= 0 && desktop.inset < 15);
    assert.ok(mobile.scale >= 1 && desktop.scale < 1.1);
  }
});

test('unknown viewport measurements choose the restrained mobile profile', () => {
  assert.deepEqual(expansionProfile(Number.NaN, 2), expansionProfile(390, 2));
  const unknownRatio = expansionProfile(1440, Number.NaN);
  assert.ok(Number.isFinite(unknownRatio.inset));
  assert.ok(Number.isFinite(unknownRatio.scale));
});
