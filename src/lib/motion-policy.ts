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
export function expansionProfile(viewportWidth: number, aspectRatio: number, immersive = false) {
  const mobile = !Number.isFinite(viewportWidth) || viewportWidth < 768;
  const wide = Number.isFinite(aspectRatio) && aspectRatio > 1.8;
  return {
    inset: immersive ? (mobile ? 12 : 22) : mobile ? 5 : wide ? 12 : 7,
    radius: immersive ? (mobile ? 42 : 110) : mobile ? 30 : wide ? 88 : 62,
    scale: immersive ? (mobile ? 1.06 : 1.12) : mobile ? 1.025 : 1.06,
    drift: mobile ? 0.85 : 2.2,
    scrub: mobile ? 0.32 : 0.48,
    end: mobile ? 'top 34%' : 'top 22%',
  };
}
