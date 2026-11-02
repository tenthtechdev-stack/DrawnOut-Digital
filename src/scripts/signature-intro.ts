interface IntroGate {
  fullUntil: number;
  start: (mode?: 'full' | 'brief') => boolean;
  finish: (reason?: string) => void;
}

declare global {
  interface Window {
    __drawnoutIntro?: IntroGate;
  }
}

/** CSS owns the short timeline; this runtime only coordinates its bounded lifetime. */
const gate = window.__drawnoutIntro;
const overlay = document.querySelector<HTMLElement>('[data-signature-intro-overlay]');
if (gate && overlay) {
  const controller = new AbortController();
  const { signal } = controller;
  const cleanup = () => {
    controller.abort();
  };
  window.addEventListener('signature:intro-end', cleanup, { once: true, signal });
  overlay
    .querySelector('[data-signature-skip]')
    ?.addEventListener('click', () => gate.finish('skip'), { signal });
  for (const image of overlay.querySelectorAll<HTMLImageElement>('img')) {
    image.addEventListener('error', () => gate.finish('asset-error'), { once: true, signal });
    if (image.complete && image.naturalWidth === 0) gate.finish('asset-error');
  }
  // The parser-time inline controller owns start/completion. This optional module
  // provides HMR cleanup without becoming a prerequisite for the opening.
  if (!['pending', 'playing'].includes(document.documentElement.dataset.signatureIntro ?? ''))
    cleanup();
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      gate.finish('module-replaced');
      cleanup();
    });
}

export {};
