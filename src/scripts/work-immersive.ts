type Connection = EventTarget & { saveData?: boolean };
type WorkScene = {
  element: HTMLElement;
  start: number;
  end: number;
  progress?: number;
};

const lifecycle = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let activeRoot: HTMLElement | null;
let cleanup: (() => void) | undefined;

function stop() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
}

function initialize() {
  const root = document.querySelector<HTMLElement>('[data-work-index]');
  if (!root || (root === activeRoot && cleanup)) return;
  stop();
  const scenes: WorkScene[] = [...root.querySelectorAll<HTMLElement>('[data-work-scene]')].map(
    (element) => ({ element, start: 0.36, end: 0.08 }),
  );
  if (!scenes.length) return;
  activeRoot = root;
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;
  let readRanges = true;
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;

  const restore = (scene: WorkScene) => {
    scene.element.removeAttribute('data-work-enhanced');
    scene.element.style.removeProperty('--work-progress');
    delete scene.element.dataset.workProgress;
    scene.progress = undefined;
  };

  // Install rollback before reading styles or enabling an enhanced composition.
  // No motion class is present in the server HTML: failed/blocked JavaScript
  // leaves the full artwork, title and ordinary project link available.
  cleanup = () => {
    disposed = true;
    controller.abort();
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    for (const scene of scenes) restore(scene);
    delete root.dataset.workMotion;
  };

  function render() {
    frame = 0;
    if (disposed || !root?.isConnected) return;
    try {
      if (reduced.matches || connection?.saveData) {
        for (const scene of scenes) restore(scene);
        root.dataset.workMotion = 'static';
        return;
      }
      if (document.hidden) {
        root.dataset.workMotion = 'paused';
        return;
      }

      const viewport = window.innerHeight;
      if (!viewport) return;
      // Layout owns the travel range so the complete caption/artwork remains
      // visible at the beginning and end on each responsive composition.
      if (readRanges) {
        for (const scene of scenes) {
          const style = getComputedStyle(scene.element);
          const start = Number.parseFloat(style.getPropertyValue('--work-scroll-start'));
          const end = Number.parseFloat(style.getPropertyValue('--work-scroll-end'));
          if (Number.isFinite(start) && Number.isFinite(end) && start > end) {
            scene.start = start;
            scene.end = end;
          }
        }
        readRanges = false;
      }

      // Read all stable scene wrappers before writing their inner composition.
      // No pins, transformed scroll containers, wheel listeners or idle ticker.
      // Only changed values are written; offscreen scenes remain clamped.
      const positions = scenes.map((scene) => ({
        scene,
        progress: scene.element.closest('[hidden]')
          ? undefined
          : Math.max(
              0,
              Math.min(
                1,
                (viewport * scene.start - scene.element.getBoundingClientRect().top) /
                  (viewport * (scene.start - scene.end)),
              ),
            ),
      }));
      for (const { scene, progress } of positions) {
        if (progress === undefined) {
          if (scene.progress !== undefined) restore(scene);
          continue;
        }
        const rounded = Math.round(progress * 10_000) / 10_000;
        if (scene.progress === rounded) continue;
        scene.progress = rounded;
        scene.element.style.setProperty('--work-progress', String(rounded));
        scene.element.dataset.workProgress = rounded.toFixed(4);
        scene.element.setAttribute('data-work-enhanced', '');
      }
      root.dataset.workMotion = 'active';
    } catch {
      // A presentation enhancement must never strand a half-built scene.
      cleanup?.();
      root.dataset.workMotion = 'unavailable';
    }
  }

  function requestRender() {
    if (!disposed && !frame) frame = requestAnimationFrame(render);
  }

  function refreshLayout() {
    readRanges = true;
    requestRender();
  }

  window.addEventListener('scroll', requestRender, { passive: true, signal });
  window.addEventListener('resize', refreshLayout, { passive: true, signal });
  window.addEventListener('load', refreshLayout, { once: true, signal });
  root.addEventListener('portfolio:filterchange', refreshLayout, { signal });
  document.addEventListener('visibilitychange', requestRender, { signal });
  reduced.addEventListener('change', requestRender, { signal });
  connection?.addEventListener?.('change', requestRender, { signal });
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(refreshLayout);
    resizeObserver.observe(root);
  }
  void document.fonts.ready.then(() => {
    if (!disposed) refreshLayout();
  });
  render();
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
