export type PortfolioMotionChoice = 'on' | 'off' | null;
export const portfolioMotionStorageKey = 'drawnout:portfolio-motion';

export function parsePortfolioMotionChoice(value: unknown): PortfolioMotionChoice {
  return value === 'on' || value === 'off' ? value : null;
}

/** Browser accessibility/data preferences always take precedence over a stored choice. */
export function portfolioMotionPreference(
  choice: PortfolioMotionChoice,
  reducedMotion: boolean,
  saveData: boolean,
) {
  const reason = reducedMotion
    ? 'reduced-motion'
    : saveData
      ? 'save-data'
      : choice
        ? 'user'
        : 'default';
  return {
    enabled: !reducedMotion && !saveData && choice !== 'off',
    constrained: reducedMotion || saveData,
    reason,
  };
}
