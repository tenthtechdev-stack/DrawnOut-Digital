export interface MotionCandidate {
  id: string;
  ratio: number;
  disabled: boolean;
}

/** A small deterministic decoder budget, shared with behavioral unit tests. */
export function selectMotionCandidates(candidates: readonly MotionCandidate[], mobile: boolean) {
  return candidates
    .filter((candidate) => !candidate.disabled && candidate.ratio >= 0.35)
    .sort((a, b) => b.ratio - a.ratio || a.id.localeCompare(b.id))
    .slice(0, mobile ? 1 : 2)
    .map(({ id }) => id);
}
