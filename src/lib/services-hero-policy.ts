/** Active animation time, never a gate on scrolling or navigation. */
export const servicesHeroTiming = Object.freeze({
  duration: 14,
  sweepEnd: 1.2,
  featureStart: 1,
  featureDuration: 2.1,
  featureCount: 5,
  wordmarkStart: 11.5,
  returnEnd: 13.3,
  resetArtworkStart: 13.65,
});

export type ServicesHeroPhase = 'sweep' | 'service' | 'wordmark' | 'reset';

export function servicesHeroFrame(time: number): {
  time: number;
  index: number;
  phase: ServicesHeroPhase;
} {
  const seconds = Number.isFinite(time)
    ? ((time % servicesHeroTiming.duration) + servicesHeroTiming.duration) %
      servicesHeroTiming.duration
    : 0;
  const at = (boundary: number) => seconds + 1e-9 >= boundary;
  if (!at(servicesHeroTiming.featureStart)) return { time: seconds, index: 0, phase: 'sweep' };
  if (at(servicesHeroTiming.wordmarkStart))
    return {
      time: seconds,
      index: at(servicesHeroTiming.resetArtworkStart) ? 0 : 4,
      phase: at(servicesHeroTiming.returnEnd) ? 'reset' : 'wordmark',
    };
  const index = Math.min(
    4,
    Math.floor(
      (seconds - servicesHeroTiming.featureStart + 1e-9) / servicesHeroTiming.featureDuration,
    ),
  );
  return { time: seconds, index, phase: 'service' };
}

/** A useful completed-artwork pose, still inside its own service interval. */
export function servicesHeroPreviewTime(index: number): number {
  const safe = Number.isFinite(index) ? Math.min(4, Math.max(0, Math.trunc(index))) : 0;
  return servicesHeroTiming.featureStart + safe * servicesHeroTiming.featureDuration + 1.75;
}

export interface ServicesHeroPauseState {
  userPaused: boolean;
  focused: boolean;
  inViewport: boolean;
  documentHidden: boolean;
  reducedMotion: boolean;
  saveData: boolean;
}

/** Independent reasons prevent visibility/focus changes from overriding a pause. */
export function servicesHeroPauseReasons(state: ServicesHeroPauseState): string[] {
  const reasons: string[] = [];
  if (state.reducedMotion) reasons.push('reduced-motion');
  if (state.saveData) reasons.push('save-data');
  if (state.userPaused) reasons.push('user');
  if (state.focused) reasons.push('focus');
  if (!state.inViewport) reasons.push('offscreen');
  if (state.documentHidden) reasons.push('hidden');
  return reasons;
}
