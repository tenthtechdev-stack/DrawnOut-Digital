// Progressive decoration only. Text, artwork and links are complete in HTML;
// a failed module/observer never leaves a chapter hidden.
export {};

type Connection = EventTarget & { saveData?: boolean };
let cleanup: (() => void) | undefined;

function initialize() {
  cleanup?.();
  const root = document.querySelector<HTMLElement>('[data-services-overview]');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  let observer: IntersectionObserver | undefined;
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-service-chapter]')];
  const settle = () => {
    observer?.disconnect();
    observer = undefined;
    chapters.forEach((chapter) => {
      chapter.dataset.chapterEntry = 'settled';
    });
    root.dataset.servicesOverviewMotion = 'static';
  };
  const configure = () => {
    settle();
    if (motion.matches || connection?.saveData || typeof IntersectionObserver === 'undefined')
      return;
    root.dataset.servicesOverviewMotion = 'ready';
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const chapter = entry.target as HTMLElement;
          chapter.dataset.chapterEntry = 'revealing';
          observer?.unobserve(chapter);
        }
      },
      { threshold: 0.12 },
    );
    chapters.forEach((chapter) => observer?.observe(chapter));
  };
  const focus = () => settle();
  root.addEventListener('focusin', focus);
  motion.addEventListener('change', configure);
  connection?.addEventListener('change', configure);
  configure();
  cleanup = () => {
    settle();
    root.removeEventListener('focusin', focus);
    motion.removeEventListener('change', configure);
    connection?.removeEventListener('change', configure);
  };
}

initialize();
document.addEventListener('astro:page-load', initialize);
document.addEventListener('astro:before-swap', () => cleanup?.());
