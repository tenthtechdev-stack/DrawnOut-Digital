export interface MotionPreference {
  reducedMotion: boolean;
  saveData: boolean;
}

/** Motion is an enhancement; either user preference selects the static experience. */
export function allowsMotion({ reducedMotion, saveData }: MotionPreference): boolean {
  return !reducedMotion && !saveData;
}

export const motionTiming = Object.freeze({
  heroDuration: 0.82,
  heroStagger: 0.12,
  headingDuration: 0.78,
  statementDuration: 0.94,
  supportDuration: 0.6,
  revealSafetyMs: 2200,
});

/** Amplitude changes, rather than document dimensions, adapt scenes to small screens. */
export function expansionProfile(viewportWidth: number, aspectRatio: number) {
  const mobile = !Number.isFinite(viewportWidth) || viewportWidth < 768;
  const wide = Number.isFinite(aspectRatio) && aspectRatio > 1.8;
  return {
    inset: mobile ? 4 : wide ? 9 : 5.5,
    radius: mobile ? 28 : wide ? 84 : 58,
    scale: mobile ? 1.018 : 1.045,
    drift: mobile ? 0.65 : 1.6,
    scrub: mobile ? 0.32 : 0.48,
    end: mobile ? 'top 34%' : 'top 22%',
  };
}
