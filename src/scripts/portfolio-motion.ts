import { selectMotionCandidates, selectPortfolioRhythm } from '../lib/portfolio-motion-policy';

type Connection = EventTarget & { saveData?: boolean };
type Entry = {
  video: HTMLVideoElement;
  ratio: number;
  centerDistance: number;
  failed: boolean;
  eligible: boolean;
  selected: boolean;
  starting: boolean;
  source?: string;
  resumeTime?: number;
  generation: number;
  releaseTimer?: number;
  videoFrame?: number;
  paintFrame?: number;
};

const lifecycle = new AbortController();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 767px), (pointer: coarse)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const offscreenGrace = 1500;
const backgroundGrace = 15000;
const playheads = new WeakMap<HTMLVideoElement, number>();
let cleanup: (() => void) | undefined;
let activeRoot: Element | null;
let activeVideos: HTMLVideoElement[] = [];

function stop() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
  activeVideos = [];
  delete document.documentElement.dataset.portfolioMotionAvailable;
}

function initialize() {
  const root = document.querySelector('main');
  const videos = [...document.querySelectorAll<HTMLVideoElement>('[data-portfolio-video]')];
  // An already initialized Astro document keeps its media nodes and playheads.
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
    ratio: 0,
    centerDistance: Infinity,
    failed: false,
    eligible: false,
    selected: false,
    starting: false,
    resumeTime: playheads.get(video),
    generation: 0,
  }));
  let disposed = false;
  let scrollFrame = 0;
  const groups = [...document.querySelectorAll<HTMLElement>('[data-portfolio-rhythm]')].map(
    (group) => [...group.querySelectorAll<HTMLElement>('[data-portfolio-card]')],
  );

  function measure(entry: Entry) {
    const bounds = entry.video.getBoundingClientRect();
    entry.centerDistance = Math.abs(bounds.top + bounds.height / 2 - innerHeight / 2);
    if (entry.video.closest('[hidden]') || !bounds.width || !bounds.height) {
      entry.ratio = 0;
      return;
    }
    const width = Math.max(0, Math.min(bounds.right, innerWidth) - Math.max(bounds.left, 0));
    const height = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0));
    entry.ratio = (width * height) / (bounds.width * bounds.height);
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
    for (const entry of entries) entry.eligible = eligible.has(entry.video);
  }

  function cancelRelease(entry: Entry) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = undefined;
  }

  function cancelPresentation(entry: Entry) {
    if (
      entry.videoFrame !== undefined &&
      typeof entry.video.cancelVideoFrameCallback === 'function'
    )
      entry.video.cancelVideoFrameCallback(entry.videoFrame);
    if (entry.paintFrame !== undefined) cancelAnimationFrame(entry.paintFrame);
    entry.videoFrame = undefined;
    entry.paintFrame = undefined;
  }

  function pause(entry: Entry) {
    if (entry.starting || !entry.video.paused) {
      entry.generation += 1;
      cancelPresentation(entry);
      entry.starting = false;
    }
    // Also clear the browser's pending-autoplay flag while still loading.
    // pause() is idempotent and never removes/reloads a warm source.
    entry.video.pause();
    if (entry.source) entry.video.dataset.motionState = 'paused';
    // Keep the last decoded frame and the paused playhead during ordinary
    // visibility/intro/background interruptions. There is no poster flash.
  }

  function release(entry: Entry) {
    cancelRelease(entry);
    pause(entry);
    cancelPresentation(entry);
    entry.generation += 1;
    entry.video.dataset.motionState = 'poster';
    delete entry.video.dataset.motionFrame;
    if (!entry.source) return;
    if (Number.isFinite(entry.video.currentTime)) {
      entry.resumeTime = entry.video.currentTime;
      playheads.set(entry.video, entry.resumeTime);
    }
    entry.video.removeAttribute('src');
    entry.video.load();
    entry.source = undefined;
  }

  function deferRelease(entry: Entry, delay: number) {
    if (!entry.source || entry.releaseTimer !== undefined) return;
    entry.releaseTimer = window.setTimeout(() => {
      entry.releaseTimer = undefined;
      if (!disposed && !entry.selected && (document.hidden || entry.ratio < 0.2 || !entry.eligible))
        release(entry);
    }, delay);
  }

  function present(entry: Entry, generation: number) {
    if (disposed || !entry.selected || entry.generation !== generation) return;
    entry.starting = false;
    entry.video.dataset.motionFrame = 'presented';
    entry.video.dataset.motionState = 'playing';
  }

  function awaitPresentedFrame(entry: Entry, generation: number) {
    if (entry.videoFrame !== undefined || entry.paintFrame !== undefined) return;
    const valid = () => !disposed && entry.selected && entry.generation === generation;
    if (typeof entry.video.requestVideoFrameCallback === 'function') {
      entry.videoFrame = entry.video.requestVideoFrameCallback(() => {
        entry.videoFrame = undefined;
        if (!valid()) return;
        if (entry.video.seeking) awaitPresentedFrame(entry, generation);
        else present(entry, generation);
      });
      return;
    }
    // Older engines still wait for decoded current data and two browser paint
    // opportunities. This finite startup check is not a perpetual video ticker.
    const video = entry.video;
    const afterPaint = () => {
      entry.paintFrame = undefined;
      if (!valid()) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.seeking)
        return;
      entry.paintFrame = requestAnimationFrame(() => {
        entry.paintFrame = undefined;
        present(entry, generation);
      });
    };
    entry.paintFrame = requestAnimationFrame(afterPaint);
  }

  function start(entry: Entry) {
    cancelRelease(entry);
    const bounds = entry.video.parentElement!.getBoundingClientRect();
    const ratio = bounds.width / bounds.height;
    // Container orientation has its own small deadband during responsive resize.
    const portrait =
      entry.source === entry.video.dataset.portrait
        ? ratio < 1.18
        : entry.source === entry.video.dataset.landscape
          ? ratio < 1.02
          : ratio < 1.1;
    const source = portrait ? entry.video.dataset.portrait : entry.video.dataset.landscape;
    if (!source) return;
    if (entry.source !== source) {
      release(entry);
      entry.source = source;
      const poster = portrait
        ? entry.video.dataset.portraitPoster
        : entry.video.dataset.landscapePoster;
      if (poster) entry.video.poster = poster;
      entry.video.src = source;
      entry.video.dataset.motionState = 'loading';
    }
    if (entry.starting || (!entry.video.paused && entry.video.dataset.motionState === 'playing'))
      return;
    entry.video.muted = true;
    entry.video.defaultMuted = true;
    entry.starting = true;
    const generation = ++entry.generation;
    void entry.video
      .play()
      .then(() => {
        if (disposed || !entry.selected || entry.generation !== generation) return;
        if (entry.video.dataset.motionFrame === 'presented') present(entry, generation);
        else awaitPresentedFrame(entry, generation);
      })
      .catch((error: unknown) => {
        if (disposed || entry.generation !== generation) return;
        entry.starting = false;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        entry.failed = true;
        release(entry);
      });
  }

  function update() {
    if (disposed) return;
    for (const entry of entries) measure(entry);
    const available = entries.some((entry) => entry.eligible && entry.ratio >= 0.2);
    document.documentElement.dataset.portfolioMotionAvailable = String(available);
    const allowed =
      document.documentElement.dataset.portfolioMotionReady === 'true' &&
      !reduced.matches &&
      !connection?.saveData &&
      document.documentElement.dataset.portfolioMotion !== 'off';
    const intro = document.documentElement.dataset.signatureIntro;
    const suspended = document.hidden || ['pending', 'playing'].includes(intro ?? '');
    const selected = new Set(
      !allowed || suspended
        ? []
        : selectMotionCandidates(
            entries.map((entry) => ({
              id: entry.video.id,
              ratio: entry.ratio,
              centerDistance: entry.centerDistance,
              active: Boolean(entry.source),
              disabled: !entry.eligible || entry.failed || Boolean(entry.video.closest('[hidden]')),
            })),
            mobile.matches,
          ),
    );
    for (const entry of entries) {
      entry.selected = selected.has(entry.video.id);
      if (entry.selected) cancelRelease(entry);
      else if (!allowed || !entry.eligible || entry.video.closest('[hidden]')) release(entry);
      else {
        pause(entry);
        if (document.hidden) deferRelease(entry, backgroundGrace);
        else if (entry.ratio < 0.2) deferRelease(entry, offscreenGrace);
        else cancelRelease(entry);
      }
    }

    // Warm, paused media also count toward the decoder budget. Evict the least
    // visible warm lease before loading a replacement, never after starting it.
    const budget = mobile.matches ? 1 : 2;
    const unloadedSelected = entries.filter((entry) => entry.selected && !entry.source).length;
    const warm = entries
      .filter((entry) => entry.source && !entry.selected)
      .sort((a, b) => a.ratio - b.ratio || b.centerDistance - a.centerDistance);
    let leases = entries.filter((entry) => entry.source).length;
    while (leases + unloadedSelected > budget && warm.length) {
      release(warm.shift()!);
      leases -= 1;
    }
    for (const entry of entries) if (entry.selected) start(entry);
  }

  const observer = new IntersectionObserver(() => update(), {
    threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
  });
  for (const entry of entries) {
    observer.observe(entry.video);
    for (const name of ['playing', 'loadeddata', 'seeked'])
      entry.video.addEventListener(
        name,
        () => {
          if (entry.starting && entry.selected && !entry.video.paused)
            awaitPresentedFrame(entry, entry.generation);
        },
        { signal },
      );
    entry.video.addEventListener(
      'loadedmetadata',
      () => {
        if (!entry.source || entry.resumeTime === undefined) return;
        const duration = entry.video.duration;
        if (Number.isFinite(duration) && duration > 0 && entry.resumeTime > 0) {
          try {
            entry.video.currentTime = entry.resumeTime % duration;
          } catch {
            // A non-seekable/failed stream still retains its real poster.
          }
        }
        entry.resumeTime = undefined;
      },
      { signal },
    );
    entry.video.addEventListener(
      'error',
      () => {
        if (!entry.source) return;
        entry.failed = true;
        release(entry);
      },
      { signal },
    );
  }
  const entrance = new MutationObserver(update);
  entrance.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      'data-signature-intro',
      'data-portfolio-motion',
      'data-portfolio-motion-ready',
    ],
  });
  document.addEventListener(
    'portfolio:filterchange',
    () => {
      curate();
      update();
    },
    { signal },
  );
  document.addEventListener(
    'portfolio:motion-change',
    () => {
      for (const entry of entries) entry.failed = false;
      update();
    },
    { signal },
  );
  document.addEventListener('visibilitychange', update, { signal });
  window.addEventListener('resize', requestUpdate, { passive: true, signal });
  window.addEventListener('scroll', requestUpdate, { passive: true, signal });
  reduced.addEventListener('change', update, { signal });
  mobile.addEventListener('change', update, { signal });
  connection?.addEventListener?.('change', update, { signal });

  function requestUpdate() {
    if (scrollFrame || disposed) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      update();
    });
  }

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
