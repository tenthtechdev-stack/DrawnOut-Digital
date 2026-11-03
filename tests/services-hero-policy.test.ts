import assert from 'node:assert/strict';
import test from 'node:test';
import {
  servicesHeroFrame,
  servicesHeroPauseReasons,
  servicesHeroPreviewTime,
  servicesHeroTiming,
  type ServicesHeroPauseState,
} from '../src/lib/services-hero-policy';

test('the five service windows each have 2.1 seconds in the 14-second loop', () => {
  assert.equal(servicesHeroTiming.duration, 14);
  for (let index = 0; index < 5; index += 1) {
    const start = 1 + index * 2.1;
    assert.deepEqual(servicesHeroFrame(start).index, index);
    assert.equal(servicesHeroFrame(start + 0.001).phase, 'service');
    assert.equal(servicesHeroFrame(start + 2.099).index, index);
  }
  assert.equal(servicesHeroFrame(0).phase, 'sweep');
  assert.equal(servicesHeroFrame(11.5).phase, 'wordmark');
  assert.equal(servicesHeroFrame(13.3).phase, 'reset');
  assert.equal(servicesHeroFrame(13.65).index, 0);
  assert.deepEqual(servicesHeroFrame(14), servicesHeroFrame(0));
});

test('manual previews always land in their own completed-artwork interval', () => {
  for (let index = 0; index < 5; index += 1) {
    const preview = servicesHeroPreviewTime(index);
    assert.equal(servicesHeroFrame(preview).index, index);
    assert.equal(servicesHeroFrame(preview).phase, 'service');
    assert.ok(preview - (1 + index * 2.1) > 1.6);
    assert.ok(1 + (index + 1) * 2.1 - preview > 0.3);
  }
  assert.equal(servicesHeroPreviewTime(-10), servicesHeroPreviewTime(0));
  assert.equal(servicesHeroPreviewTime(99), servicesHeroPreviewTime(4));
  assert.equal(servicesHeroPreviewTime(Number.NaN), servicesHeroPreviewTime(0));
});

test('independent pause reasons retain user intent when focus and visibility change', () => {
  const normal: ServicesHeroPauseState = {
    userPaused: false,
    focused: false,
    inViewport: true,
    documentHidden: false,
    reducedMotion: false,
    saveData: false,
  };
  assert.deepEqual(servicesHeroPauseReasons(normal), []);
  const all = {
    ...normal,
    userPaused: true,
    focused: true,
    inViewport: false,
    documentHidden: true,
  };
  assert.deepEqual(servicesHeroPauseReasons(all), ['user', 'focus', 'offscreen', 'hidden']);
  assert.deepEqual(
    servicesHeroPauseReasons({ ...all, focused: false, documentHidden: false, inViewport: true }),
    ['user'],
  );
  assert.deepEqual(servicesHeroPauseReasons({ ...normal, focused: true }), ['focus']);
  assert.deepEqual(servicesHeroPauseReasons({ ...normal, reducedMotion: true, saveData: true }), [
    'reduced-motion',
    'save-data',
  ]);
});

test('invalid and repeated-cycle times remain bounded and deterministic', () => {
  for (const time of [-100, -0.1, 0, 5.2, 14, 28, 1400, Number.NaN, Number.POSITIVE_INFINITY]) {
    const frame = servicesHeroFrame(time);
    assert.ok(frame.time >= 0 && frame.time < 14);
    assert.ok(frame.index >= 0 && frame.index <= 4);
  }
  assert.equal(servicesHeroFrame(14 + 3.2).index, servicesHeroFrame(3.2).index);
});
