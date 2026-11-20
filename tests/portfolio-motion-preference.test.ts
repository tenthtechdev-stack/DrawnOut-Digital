import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parsePortfolioMotionChoice,
  portfolioMotionPreference,
} from '../src/lib/portfolio-motion-preference';

test('a missing or invalid stored choice defaults to visible portfolio motion', () => {
  for (const value of [undefined, null, '', 'false', 'disabled', {}, 1]) {
    assert.equal(parsePortfolioMotionChoice(value), null);
    assert.equal(
      portfolioMotionPreference(parsePortfolioMotionChoice(value), false, false).enabled,
      true,
    );
  }
});
test('explicit preference survives ordinary navigation without overriding device constraints', () => {
  assert.equal(portfolioMotionPreference('off', false, false).enabled, false);
  assert.equal(portfolioMotionPreference('on', false, false).enabled, true);
  for (const choice of ['on', 'off', null] as const) {
    assert.deepEqual(portfolioMotionPreference(choice, true, false), {
      enabled: false,
      constrained: true,
      reason: 'reduced-motion',
    });
    assert.deepEqual(portfolioMotionPreference(choice, false, true), {
      enabled: false,
      constrained: true,
      reason: 'save-data',
    });
  }
});
