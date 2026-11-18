import assert from 'node:assert/strict';
import test from 'node:test';
import {
  enquiryPuzzlePauseReasons,
  enquiryPuzzlePhase,
  enquiryPuzzleTiming,
} from '../src/lib/enquiry-puzzle-policy';

test('enquiry narrative has a useful final hold within the eight-second brief', () => {
  assert.ok(enquiryPuzzleTiming.duration >= 6 && enquiryPuzzleTiming.duration <= 8);
  assert.ok(enquiryPuzzleTiming.returnStart - enquiryPuzzleTiming.directionStart >= 1.5);
  assert.equal(enquiryPuzzlePhase(0), 'idea');
  assert.equal(enquiryPuzzlePhase(2), 'connect');
  assert.equal(enquiryPuzzlePhase(5.5), 'direction');
  assert.equal(enquiryPuzzlePhase(7.4), 'idea');
  assert.equal(enquiryPuzzlePhase(7.8), 'idea');
  assert.equal(enquiryPuzzlePhase(7.8 + 5.5), 'direction');
  assert.equal(enquiryPuzzlePhase(Number.NaN), 'idea');
});

test('user pause survives viewport, document visibility and keyboard focus changes', () => {
  const intent = { inViewport: true, documentHidden: false, userPaused: true, focused: false };
  assert.deepEqual(enquiryPuzzlePauseReasons(intent), ['user']);
  assert.deepEqual(
    enquiryPuzzlePauseReasons({
      ...intent,
      inViewport: false,
      documentHidden: true,
      focused: true,
    }),
    ['offscreen', 'hidden', 'user', 'focus'],
  );
  assert.deepEqual(enquiryPuzzlePauseReasons({ ...intent, userPaused: false }), []);
});
