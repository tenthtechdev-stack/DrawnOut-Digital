type Connection = EventTarget & { saveData?: boolean };
type Caption = { element: HTMLElement; animations: Animation[] };

const lifecycle = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const revealed = new WeakSet<HTMLElement>();
let activeRoot: HTMLElement | null;
let cleanup: (() => void) | undefined;

function stop() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
}

function initialize() {
  const root = document.querySelector<HTMLElement>('main');
  if (!root || (cleanup && root === activeRoot)) return;
  stop();
  activeRoot = root;
  const controller = new AbortController();
  const captions: Caption[] = [
    ...root.querySelectorAll<HTMLElement>('[data-portfolio-caption]'),
  ].map((element) => ({ element, animations: [] }));
  const allowed = () => !reduced.matches && !connection?.saveData && !document.hidden;
  const focused = (element: HTMLElement) =>
    element.contains(document.activeElement) ||
    Boolean(element.closest('a')?.contains(document.activeElement));

  function finish(caption: Caption) {
    for (const animation of caption.animations) animation.cancel();
    caption.animations = [];
    revealed.add(caption.element);
    caption.element.dataset.portfolioReveal = 'complete';
  }

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (observations) => {
            for (const observation of observations) {
              if (!observation.isIntersecting) continue;
              const caption = captions.find(({ element }) => element === observation.target);
              if (!caption || caption.element.closest('[hidden]')) continue;
              observer?.unobserve(caption.element);
              if (
                revealed.has(caption.element) ||
                !allowed() ||
                focused(caption.element) ||
                !caption.element.animate
              ) {
                finish(caption);
                continue;
              }
              revealed.add(caption.element);
              caption.element.dataset.portfolioReveal = 'running';
              const parts = caption.element.querySelectorAll<HTMLElement>(
                '[data-portfolio-title], [data-portfolio-meta]',
              );
              for (const part of parts) {
                const metadata = part.hasAttribute('data-portfolio-meta');
                const animation = part.animate(
                  [
                    {
                      transform: `translateY(${metadata ? 10 : 16}px)`,
                      opacity: 0.4,
                      clipPath: 'inset(0 0 100% 0)',
                    },
                    { transform: 'translateY(0)', opacity: 1, clipPath: 'inset(0)' },
                  ],
                  {
                    duration: 620,
                    delay: metadata ? 80 : 0,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    fill: 'backwards',
                  },
                );
                caption.animations.push(animation);
              }
              void Promise.all(caption.animations.map((animation) => animation.finished))
                .then(() => finish(caption))
                .catch(() => {
                  /* Cancellation restores the visible HTML immediately. */
                });
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
        )
      : undefined;

  for (const caption of captions) {
    if (!observer || !allowed() || focused(caption.element) || revealed.has(caption.element))
      finish(caption);
    else observer.observe(caption.element);
  }
  root.addEventListener(
    'focusin',
    (event) => {
      const target = event.target as Element;
      for (const caption of captions) {
        const link = caption.element.closest('a');
        if (caption.element.contains(target) || link?.contains(target)) {
          observer?.unobserve(caption.element);
          finish(caption);
        }
      }
    },
    { signal: controller.signal },
  );
  const preferences = () => {
    if (allowed()) return;
    observer?.disconnect();
    for (const caption of captions) finish(caption);
  };
  reduced.addEventListener('change', preferences, { signal: controller.signal });
  connection?.addEventListener?.('change', preferences, { signal: controller.signal });
  document.addEventListener('visibilitychange', preferences, { signal: controller.signal });
  cleanup = () => {
    controller.abort();
    observer?.disconnect();
    for (const caption of captions) {
      if (revealed.has(caption.element)) finish(caption);
    }
  };
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
