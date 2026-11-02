export interface MotionCandidate {
  id: string;
  ratio: number;
  disabled: boolean;
  centerDistance?: number;
}

export interface PortfolioRhythmProject {
  id: string;
  hasMotion: boolean;
  priority?: number;
}

/**
 * Curate the supplied visible order around its strongest motion selection.
 * Existing poster-only projects provide breathing room; they never gain an
 * invented video. A required selection can give the opening a static beat.
 */
export function selectPortfolioRhythm(projects: readonly PortfolioRhythmProject[]): string[] {
  let anchor = -1;
  for (const [index, project] of projects.entries()) {
    if (
      project.hasMotion &&
      (anchor === -1 || (project.priority ?? 0) > (projects[anchor]?.priority ?? 0))
    )
      anchor = index;
  }
  if (anchor === -1) return [];
  const selected = new Set([anchor]);
  for (let index = anchor - 1; index >= 0; index -= 1)
    if (projects[index]?.hasMotion && !selected.has(index + 1)) selected.add(index);
  for (let index = anchor + 1; index < projects.length; index += 1)
    if (projects[index]?.hasMotion && !selected.has(index - 1)) selected.add(index);
  return projects.filter((_, index) => selected.has(index)).map(({ id }) => id);
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
