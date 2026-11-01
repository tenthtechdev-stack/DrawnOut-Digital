export interface MotionCandidate {
  id: string;
  ratio: number;
  disabled: boolean;
  centerDistance?: number;
}

/** A small deterministic decoder budget, shared with behavioral unit tests. */
export function selectMotionCandidates(candidates: readonly MotionCandidate[], mobile: boolean) {
  return candidates
    .filter((candidate) => !candidate.disabled && candidate.ratio >= 0.35)
    .sort(
      (a, b) =>
        // Ignore sub-percent clipping noise when several cards fit on screen.
        Math.round(b.ratio * 100) - Math.round(a.ratio * 100) ||
        (a.centerDistance ?? Infinity) - (b.centerDistance ?? Infinity) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, mobile ? 1 : 2)
    .map(({ id }) => id);
}
