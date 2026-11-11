/** One-time, static-first case arrivals. The page and its links never await motion. */
type Connection = EventTarget & { saveData?: boolean };
type Cue = {
  element: HTMLElement;
  arrival: boolean;
  animation?: Animation;
  deadline?: ReturnType<typeof setTimeout>;
};

const lifecycle = new AbortController();
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const revealed = new WeakSet<HTMLElement>();
let activeRoot: HTMLElement | undefined;
let cleanup: (() => void) | undefined;

function stop() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = undefined;
}

function initialize() {
  const root = document.querySelector<HTMLElement>('[data-premium-case]');
  if (root === activeRoot && cleanup) return;
  stop();
  if (!root) return;
  activeRoot = root;
  const controller = new AbortController();
  const { signal } = controller;
  const cues: Cue[] = [
    ...root.querySelectorAll<HTMLElement>('[data-case-arrival], [data-case-reveal]'),
  ].map((element) => ({ element, arrival: element.hasAttribute('data-case-arrival') }));
  let observer: IntersectionObserver | undefined;
  let disposed = false;

  const allowed = () => !preference.matches && !connection?.saveData && !document.hidden;
  const focused = (cue: Cue) =>
    cue.element.contains(document.activeElement) ||
    Boolean(cue.element.closest('a')?.contains(document.activeElement));

  function finish(cue: Cue) {
    if (cue.deadline) clearTimeout(cue.deadline);
    cue.deadline = undefined;
    // Cancel removes the temporary WAAPI effect. No hidden class or inline
    // transform is needed in either the normal or failed-animation state.
    const animation = cue.animation;
    cue.animation = undefined;
    animation?.cancel();
    revealed.add(cue.element);
    cue.element.dataset.caseRevealState = 'complete';
    observer?.unobserve(cue.element);
  }

  const finishAll = () => {
    observer?.disconnect();
    for (const cue of cues) finish(cue);
  };

  // Rollback is registered before creating observers or animation effects.
  cleanup = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    finishAll();
    root.dataset.caseMotion = 'static';
  };

  function reveal(cue: Cue, order = 0) {
    if (
      disposed ||
      revealed.has(cue.element) ||
      !allowed() ||
      focused(cue) ||
      typeof cue.element.animate !== 'function'
    ) {
      finish(cue);
      return;
    }
    revealed.add(cue.element);
    observer?.unobserve(cue.element);
    cue.element.dataset.caseRevealState = 'running';
    try {
      const artwork = cue.element.tagName === 'FIGURE';
      const animation = cue.element.animate(
        cue.arrival
          ? [
              { transform: 'translateY(20px)', opacity: 0.65, clipPath: 'inset(0 0 14% 0)' },
              { transform: 'translateY(0)', opacity: 1, clipPath: 'inset(0)' },
            ]
          : [
              { transform: `translateY(${artwork ? 22 : 14}px)`, opacity: 0.6 },
              { transform: 'translateY(0)', opacity: 1 },
            ],
        {
          duration: cue.arrival ? 740 : artwork ? 780 : 640,
          delay: cue.arrival ? Math.min(order, 2) * 90 : 0,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        },
      );
      cue.animation = animation;
      cue.deadline = setTimeout(() => finish(cue), 1100);
      void animation.finished.then(
        () => finish(cue),
        () => finish(cue),
      );
    } catch {
      finish(cue);
    }
  }

  function preferences() {
    if (allowed()) {
      root.dataset.caseMotion = 'active';
      return;
    }
    finishAll();
    root.dataset.caseMotion = preference.matches
      ? 'reduced'
      : connection?.saveData
        ? 'save-data'
        : 'hidden';
  }

  try {
    root.addEventListener(
      'focusin',
      (event) => {
        const target = event.target as Node;
        for (const cue of cues) {
          if (cue.element.contains(target) || cue.element.closest('a')?.contains(target))
            finish(cue);
        }
      },
      { signal },
    );
    window.addEventListener(
      'resize',
      () => {
        // Resizing cannot leave a title or caption partway through a mask.
        // Unseen artwork remains observed using its new native geometry.
        for (const cue of cues) if (cue.animation) finish(cue);
      },
      { passive: true, signal },
    );
    window.addEventListener(
      'scroll',
      () => {
        for (const cue of cues) if (cue.arrival) finish(cue);
      },
      { passive: true, once: true, signal },
    );
    preference.addEventListener('change', preferences, { signal });
    connection?.addEventListener?.('change', preferences, { signal });
    document.addEventListener('visibilitychange', preferences, { signal });

    if (!allowed() || !('IntersectionObserver' in window)) {
      finishAll();
      root.dataset.caseMotion = preference.matches
        ? 'reduced'
        : connection?.saveData
          ? 'save-data'
          : 'static';
      return;
    }
    root.dataset.caseMotion = 'active';
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cue = cues.find(({ element }) => element === entry.target);
          if (cue) reveal(cue);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -4% 0px' },
    );
    let arrival = 0;
    for (const cue of cues) {
      if (revealed.has(cue.element) || focused(cue)) finish(cue);
      else if (cue.arrival) {
        // A late module must not animate text someone has already started reading.
        if (scrollY > 40 || performance.now() > 1800) finish(cue);
        else reveal(cue, arrival++);
      } else observer.observe(cue.element);
    }
  } catch {
    cleanup?.();
    root.dataset.caseMotion = 'unavailable';
  }
}

initialize();
document.addEventListener('astro:page-load', initialize, { signal: lifecycle.signal });
document.addEventListener('astro:before-swap', stop, { signal: lifecycle.signal });
window.addEventListener('pagehide', stop, { signal: lifecycle.signal });
window.addEventListener(
  'pageshow',
  (event) => {
    if (event.persisted) initialize();
  },
  { signal: lifecycle.signal },
);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    lifecycle.abort();
    stop();
  });
