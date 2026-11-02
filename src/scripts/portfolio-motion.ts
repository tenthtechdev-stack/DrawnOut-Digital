import { selectMotionCandidates, selectPortfolioRhythm } from '../lib/portfolio-motion-policy';

type Connection = EventTarget & { saveData?: boolean };
type Entry = {
  video: HTMLVideoElement;
  button?: HTMLButtonElement;
  ratio: number;
  paused: boolean;
  failed: boolean;
  eligible: boolean;
  source?: string;
  generation: number;
};

const lifecycle = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 767px), (pointer: coarse)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let cleanup: (() => void) | undefined;
let activeRoot: Element | null;
let activeVideos: HTMLVideoElement[] = [];

function stop() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
  activeVideos = [];
}

function initialize() {
  const root = document.querySelector('main');
  const videos = [...document.querySelectorAll<HTMLVideoElement>('[data-portfolio-video]')];
  // Astro may announce an already initialized document. Keep its playback,
  // pause choices and observers instead of unloading the same media nodes.
  if (
    cleanup &&
    root === activeRoot &&
    videos.length === activeVideos.length &&
    videos.every((video, index) => video === activeVideos[index])
  )
    return;
  stop();
  if (!videos.length || !('IntersectionObserver' in window)) return;
  activeRoot = root;
  activeVideos = videos;
  const controller = new AbortController();
  const { signal } = controller;
  const entries: Entry[] = videos.map((video) => ({
    video,
    button:
      document.querySelector<HTMLButtonElement>(`[data-motion-toggle="${CSS.escape(video.id)}"]`) ??
      undefined,
    ratio: 0,
    paused: false,
    failed: false,
    eligible: false,
    generation: 0,
  }));
  let footerVisible = false;
  let disposed = false;
  let scrollFrame = 0;
  const groups = [...document.querySelectorAll<HTMLElement>('[data-portfolio-rhythm]')].map(
    (group) => [...group.querySelectorAll<HTMLElement>('[data-portfolio-card]')],
  );
  const footer = document.querySelector('[data-site-footer]');

  function visibleRatio(element: Element) {
    if (element.closest('[hidden]')) return 0;
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return 0;
    const width = Math.max(0, Math.min(bounds.right, innerWidth) - Math.max(bounds.left, 0));
    const height = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0));
    return (width * height) / (bounds.width * bounds.height);
  }

  function curate() {
    const eligible = new Set<HTMLVideoElement>();
    for (const cards of groups) {
      const visible = cards.filter((card) => !card.closest('[hidden]'));
      const selected = new Set(
        selectPortfolioRhythm(
          visible.map((card) => ({
            id: card.dataset.projectSlug!,
            hasMotion: Boolean(card.querySelector('[data-portfolio-video]')),
            // SOL remains the prominent animated choice in its approved order.
            priority: card.dataset.projectSlug === 'sol-community-center' ? 1 : 0,
          })),
        ),
      );
      for (const card of cards) {
        const animated = selected.has(card.dataset.projectSlug!);
        card.dataset.projectPresentation = animated ? 'animated' : 'static';
        const video = card.querySelector<HTMLVideoElement>('[data-portfolio-video]');
        if (animated && video) eligible.add(video);
      }
    }
    for (const entry of entries) {
      entry.eligible = eligible.has(entry.video);
      // Filtering changes geometry synchronously; an old observer ratio must
      // not briefly start a newly shown but now offscreen card.
      entry.ratio = visibleRatio(entry.video);
    }
    footerVisible = footer ? visibleRatio(footer) > 0 : false;
  }

  function release(entry: Entry) {
    if (!entry.source && entry.video.dataset.motionState === 'poster') return;
    entry.generation += 1;
    entry.video.pause();
    entry.video.dataset.motionState = 'poster';
    // Pausing alone retains a decoder and buffered media. Releasing src keeps
    // the budget meaningful as visitors move through all six projects.
    if (entry.source) {
      entry.video.removeAttribute('src');
      entry.video.load();
      entry.source = undefined;
    }
  }

  function controls(entry: Entry, allowed: boolean) {
    if (!entry.button) return;
    entry.button.hidden = !allowed;
    const paused = entry.paused || entry.failed;
    const action = paused ? 'Play' : 'Pause';
    entry.button.setAttribute('aria-pressed', String(entry.paused));
    entry.button.setAttribute(
      'aria-label',
      `${action} ${entry.button.dataset.motionTitle} animation`,
    );
    const label = entry.button.querySelector('[data-motion-control-label]');
    if (label && label.textContent !== `${action} animation`)
      label.textContent = `${action} animation`;
  }

  function update() {
    if (disposed) return;
    const allowed = !reduced.matches && !connection?.saveData;
    const intro = document.documentElement.dataset.signatureIntro;
    const suspended =
      !allowed || document.hidden || footerVisible || ['pending', 'playing'].includes(intro ?? '');
    const selected = new Set(
      suspended
        ? []
        : selectMotionCandidates(
            entries.map((entry) => ({
              id: entry.video.id,
              ratio: entry.ratio,
              centerDistance: Math.abs(
                entry.video.getBoundingClientRect().top +
                  entry.video.getBoundingClientRect().height / 2 -
                  innerHeight / 2,
              ),
              disabled:
                !entry.eligible ||
                entry.paused ||
                entry.failed ||
                Boolean(entry.video.closest('[hidden]')),
            })),
            mobile.matches,
          ),
    );
    // Free unselected decoders before starting any replacement.
    for (const entry of entries) {
      controls(entry, allowed && entry.eligible);
      if (!selected.has(entry.video.id)) release(entry);
    }
    for (const entry of entries) {
      if (!selected.has(entry.video.id)) continue;
      const bounds = entry.video.parentElement!.getBoundingClientRect();
      const source =
        bounds.width / bounds.height < 1.1
          ? entry.video.dataset.portrait
          : entry.video.dataset.landscape;
      if (!source || (entry.source === source && !entry.video.paused)) continue;
      if (entry.source !== source) {
        release(entry);
        entry.source = source;
        entry.video.src = source;
      }
      entry.video.muted = true;
      entry.video.defaultMuted = true;
      const generation = ++entry.generation;
      void entry.video
        .play()
        .then(() => {
          if (entry.generation !== generation || disposed) return;
          entry.video.dataset.motionState = 'playing';
        })
        .catch((error: unknown) => {
          if (entry.generation !== generation || disposed) return;
          if (error instanceof DOMException && error.name === 'AbortError') return;
          entry.failed = true;
          release(entry);
          controls(entry, allowed && entry.eligible);
        });
    }
  }

  const observer = new IntersectionObserver(
    (observations) => {
      for (const observation of observations) {
        const entry = entries.find(({ video }) => video === observation.target);
        if (entry) entry.ratio = observation.isIntersecting ? observation.intersectionRatio : 0;
        else footerVisible = observation.isIntersecting;
      }
      update();
    },
    { threshold: [0, 0.1, 0.35, 0.5, 0.75, 1] },
  );
  for (const entry of entries) {
    observer.observe(entry.video);
    entry.button?.addEventListener(
      'click',
      () => {
        entry.paused = entry.failed ? false : !entry.paused;
        entry.failed = false;
        update();
      },
      { signal },
    );
    entry.video.addEventListener(
      'error',
      () => {
        if (!entry.source) return;
        entry.failed = true;
        release(entry);
        controls(entry, entry.eligible && !reduced.matches && !connection?.saveData);
      },
      { signal },
    );
  }
  if (footer) observer.observe(footer);
  const entrance = new MutationObserver(update);
  entrance.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-signature-intro'],
  });
  document.addEventListener(
    'portfolio:filterchange',
    () => {
      curate();
      update();
    },
    { signal },
  );
  document.addEventListener('visibilitychange', update, { signal });
  window.addEventListener('resize', update, { passive: true, signal });
  window.addEventListener(
    'scroll',
    () => {
      if (scrollFrame || disposed) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        update();
      });
    },
    { passive: true, signal },
  );
  reduced.addEventListener('change', update, { signal });
  mobile.addEventListener('change', update, { signal });
  connection?.addEventListener?.('change', update, { signal });
  curate();
  update();
  cleanup = () => {
    disposed = true;
    cancelAnimationFrame(scrollFrame);
    controller.abort();
    observer.disconnect();
    entrance.disconnect();
    for (const entry of entries) release(entry);
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
