import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contactThoughtDuration,
  contactThoughtPauseReasons,
  contactThoughtPhase,
} from '../src/lib/contact-thought-policy';

test('The First Thought has three ordered scenes and ends within five active seconds', () => {
  assert.equal(contactThoughtPhase(0), 'thought');
  assert.equal(contactThoughtPhase(1.149), 'thought');
  assert.equal(contactThoughtPhase(1.15), 'connection');
  assert.equal(contactThoughtPhase(3.749), 'connection');
  assert.equal(contactThoughtPhase(3.75), 'conversation');
  assert.equal(contactThoughtPhase(contactThoughtDuration), 'conversation');
  assert(contactThoughtDuration >= 4 && contactThoughtDuration <= 5);
});

test('unknown and negative scene clocks do not jump to a completed narrative', () => {
  assert.equal(contactThoughtPhase(Number.NaN), 'thought');
  assert.equal(contactThoughtPhase(-1), 'thought');
  assert.equal(contactThoughtPhase(100), 'conversation');
});

test('hidden and offscreen pause reasons remain independent until both clear', () => {
  assert.deepEqual(contactThoughtPauseReasons(false, true), ['offscreen', 'document-hidden']);
  assert.deepEqual(contactThoughtPauseReasons(true, true), ['document-hidden']);
  assert.deepEqual(contactThoughtPauseReasons(false, false), ['offscreen']);
  assert.deepEqual(contactThoughtPauseReasons(true, false), []);
});
