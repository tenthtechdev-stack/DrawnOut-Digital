/** Active time only. Native scrolling and the enquiry link are never gated. */
export const enquiryPuzzleTiming = Object.freeze({
  duration: 7.8,
  connectionStart: 1.1,
  directionStart: 4.45,
  returnStart: 6.45,
});

export function enquiryPuzzlePhase(time: number): 'idea' | 'connect' | 'direction' {
  const safe = Number.isFinite(time) ? time : 0;
  const normalized =
    ((safe % enquiryPuzzleTiming.duration) + enquiryPuzzleTiming.duration) %
    enquiryPuzzleTiming.duration;
  if (normalized + 1e-9 >= enquiryPuzzleTiming.returnStart) return 'idea';
  if (normalized + 1e-9 >= enquiryPuzzleTiming.directionStart) return 'direction';
  return normalized + 1e-9 >= enquiryPuzzleTiming.connectionStart ? 'connect' : 'idea';
}

export interface EnquiryPuzzlePauseState {
  inViewport: boolean;
  documentHidden: boolean;
  userPaused: boolean;
  focused: boolean;
}

export function enquiryPuzzlePauseReasons(state: EnquiryPuzzlePauseState): string[] {
  return [
    ...(!state.inViewport ? ['offscreen'] : []),
    ...(state.documentHidden ? ['hidden'] : []),
    ...(state.userPaused ? ['user'] : []),
    ...(state.focused ? ['focus'] : []),
  ];
}
