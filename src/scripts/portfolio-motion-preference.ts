import {
  parsePortfolioMotionChoice,
  portfolioMotionPreference,
  portfolioMotionStorageKey,
} from '../lib/portfolio-motion-preference';

type Connection = EventTarget & { saveData?: boolean };
const lifecycle = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let cleanup: (() => void) | undefined;
let activeButton: HTMLButtonElement | null = null;
let refresh: (() => void) | undefined;

function initialize() {
  const button = document.querySelector<HTMLButtonElement>('[data-portfolio-motion-preference]');
  if (button === activeButton && cleanup) {
    refresh?.();
    return;
  }
  cleanup?.();
  activeButton = button;
  if (!button) return;
  const abort = new AbortController();
  const { signal } = abort;
  let choice = parsePortfolioMotionChoice(document.documentElement.dataset.portfolioMotionChoice);
  try {
    choice = parsePortfolioMotionChoice(localStorage.getItem(portfolioMotionStorageKey));
  } catch {
    /* retain session choice */
  }

  function update() {
    const preference = portfolioMotionPreference(
      choice,
      reduced.matches,
      Boolean(connection?.saveData),
    );
    const html = document.documentElement;
    html.dataset.portfolioMotion = preference.enabled ? 'on' : 'off';
    html.dataset.portfolioMotionChoice = choice ?? 'auto';
    html.dataset.portfolioMotionReason = preference.reason;
    button!.setAttribute('aria-pressed', String(preference.enabled));
    button!.setAttribute('aria-disabled', String(preference.constrained));
    const label = button!.querySelector('[data-portfolio-motion-label]');
    if (label) label.textContent = preference.enabled ? 'On' : 'Off';
    const description = document.querySelector('[data-portfolio-motion-description]');
    if (description)
      description.textContent =
        preference.reason === 'reduced-motion'
          ? 'Project animations are off because your device requests reduced motion.'
          : preference.reason === 'save-data'
            ? 'Project animations are off because your device requests reduced data usage.'
            : preference.enabled
              ? 'Turn off repeating project animations across the website.'
              : 'Turn on repeating project animations while artwork is visible.';
    document.dispatchEvent(new CustomEvent('portfolio:motion-change'));
  }
  button.addEventListener(
    'click',
    () => {
      if (reduced.matches || connection?.saveData) return;
      choice = htmlEnabled() ? 'off' : 'on';
      try {
        localStorage.setItem(portfolioMotionStorageKey, choice);
      } catch {
        /* memory-only choice remains usable */
      }
      update();
    },
    { signal },
  );
  window.addEventListener(
    'storage',
    (event) => {
      if (event.key !== portfolioMotionStorageKey && event.key !== null) return;
      choice = parsePortfolioMotionChoice(event.newValue);
      update();
    },
    { signal },
  );
  reduced.addEventListener('change', update, { signal });
  connection?.addEventListener?.('change', update, { signal });
  refresh = () => {
    try {
      choice = parsePortfolioMotionChoice(localStorage.getItem(portfolioMotionStorageKey));
    } catch {
      /* preserve memory choice */
    }
    update();
  };
  update();
  const container = document.querySelector<HTMLElement>('[data-portfolio-preference-container]');
  if (container) container.hidden = false;
  cleanup = () => abort.abort();
}
function htmlEnabled() {
  return document.documentElement.dataset.portfolioMotion !== 'off';
}
initialize();
document.addEventListener('astro:page-load', initialize, { signal: lifecycle.signal });
window.addEventListener('pageshow', initialize, { capture: true, signal: lifecycle.signal });
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    cleanup?.();
    lifecycle.abort();
  });
