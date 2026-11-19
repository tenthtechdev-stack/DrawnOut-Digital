/** Active time only: hidden and offscreen time never extends this sequence. */
export const contactThoughtDuration = 4.8;

export function contactThoughtPhase(seconds: number) {
  const time = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (time < 1.15) return 'thought';
  if (time < 3.75) return 'connection';
  return 'conversation';
}

export function contactThoughtPauseReasons(inViewport: boolean, documentHidden: boolean) {
  const reasons: string[] = [];
  if (!inViewport) reasons.push('offscreen');
  if (documentHidden) reasons.push('document-hidden');
  return reasons;
}
