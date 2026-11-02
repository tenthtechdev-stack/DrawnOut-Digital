/** Draw → reveal → connect. The portrait is one approved raster under SVG masks. */
import { allowsMotion } from '../lib/motion-policy';

type Connection = EventTarget & { saveData?: boolean };
type Gsap = (typeof import('gsap'))['gsap'];
type ScrollTriggerPlugin = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];
type Context = ReturnType<Gsap['context']>;
type Trigger = ReturnType<ScrollTriggerPlugin['create']>;

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const visited = new WeakSet<HTMLElement>();
const lifecycle = new AbortController();
let activePage: HTMLElement | undefined;
let dispose: (() => void) | undefined;
let generation = 0;
let diagnostics = () => ({ triggers: [] as string[], hero: 'static' });

if (import.meta.env.DEV) {
  Object.defineProperty(window, '__drawnoutAboutMotion', {
    configurable: true,
    value: Object.freeze({ snapshot: () => diagnostics() }),
  });
}

const allowed = () =>
  allowsMotion({ reducedMotion: preference.matches, saveData: Boolean(connection?.saveData) });

function stop() {
  generation += 1;
  dispose?.();
  dispose = undefined;
  activePage = undefined;
  diagnostics = () => ({ triggers: [], hero: 'static' });
}

async function initialize() {
  const page = document.querySelector<HTMLElement>('[data-about-page]');
  if (!page || page === activePage) return;
  stop();
  activePage = page;
  const ticket = generation;
  const controller = new AbortController();
  const { signal } = controller;
  const animations = new Set<Animation>();
  const triggers = new Set<Trigger>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let context: Context | undefined;
  let observer: IntersectionObserver | undefined;
  let disposed = false;
  let refreshFrame = 0;
  let settleHero = (reason: string) => {
    const hero = page.querySelector<HTMLElement>('[data-about-hero]');
    if (hero) {
      hero.dataset.aboutEntrance = 'static';
      hero.dataset.aboutSettleReason = reason;
    }
  };

  // Rollback exists before any mask, animation or asynchronous library work.
  dispose = () => {
    if (disposed) return;
    disposed = true;
    settleHero('cleanup');
    controller.abort();
    observer?.disconnect();
    for (const timer of timers) clearTimeout(timer);
    for (const animation of animations) animation.cancel();
    animations.clear();
    cancelAnimationFrame(refreshFrame);
    context?.revert();
    triggers.clear();
    page.dataset.aboutMotion = preference.matches ? 'reduced' : 'static';
  };
  diagnostics = () => ({
    triggers: [...triggers].map((trigger) => String(trigger.vars.id)),
    hero: page.querySelector<HTMLElement>('[data-about-hero]')?.dataset.aboutEntrance ?? 'static',
  });

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed) callback();
    }, delay);
    timers.add(timer);
    return timer;
  };
  const animate = (target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = target.animate(keyframes, { fill: 'both', ...options });
    animations.add(animation);
    return animation;
  };

  const hero = page.querySelector<HTMLElement>('[data-about-hero]');
  const raster = hero?.querySelector<SVGImageElement>('[data-about-portrait-raster]');
  const firstVisit = !visited.has(page);
  visited.add(page);
  if (!allowed() || document.hidden) {
    page.dataset.aboutMotion = preference.matches ? 'reduced' : 'static';
    settleHero(document.hidden ? 'hidden' : preference.matches ? 'reduced-motion' : 'save-data');
    return;
  }
  page.dataset.aboutMotion = 'loading';

  if (hero && raster && firstVisit && typeof Element.prototype.animate === 'function') {
    const heroController = new AbortController();
    const heroSignal = heroController.signal;
    const heroAnimations = new Set<Animation>();
    const arrival = Number(page.dataset.aboutArrivalAt ?? 0);
    const initializedAt = performance.now();
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    let finished = false;
    let started = false;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let readyDeadline: ReturnType<typeof setTimeout> | undefined;
    settleHero = (reason) => {
      if (finished) return;
      finished = true;
      // Remove the mask first: every approved raster pixel is visible even if
      // browser animation cancellation or another library fails afterwards.
      raster.removeAttribute('mask');
      hero.dataset.aboutEntrance = started ? 'settled' : 'static';
      hero.dataset.aboutSettleReason = reason;
      hero.dataset.aboutEndedAt = performance.now().toFixed(2);
      heroController.abort();
      clearTimeout(deadline);
      clearTimeout(readyDeadline);
      for (const animation of heroAnimations) {
        animation.cancel();
        animations.delete(animation);
      }
      heroAnimations.clear();
    };
    hero.dataset.aboutEntrance = 'pending';
    const input = (event: Event) => {
      if (event.type === 'scroll' && window.scrollY === 0 && window.scrollX === 0) return;
      settleHero('input');
    };
    window.addEventListener('wheel', input, { passive: true, signal: heroSignal });
    window.addEventListener('touchstart', input, { passive: true, signal: heroSignal });
    window.addEventListener('pointerdown', input, {
      passive: true,
      capture: true,
      signal: heroSignal,
    });
    window.addEventListener('keydown', input, { capture: true, signal: heroSignal });
    window.addEventListener('scroll', input, { passive: true, signal: heroSignal });
    document.addEventListener('focusin', input, { signal: heroSignal });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) settleHero('hidden');
      },
      { signal: heroSignal },
    );
    const exclusion =
      location.hash || window.scrollY > 0
        ? 'restored-scroll'
        : navigation?.type === 'back_forward'
          ? 'history'
          : !arrival || initializedAt - arrival > 900
            ? 'late-init'
            : document.activeElement instanceof HTMLElement &&
                document.activeElement !== document.body
              ? 'focused'
              : undefined;
    if (exclusion) settleHero(exclusion);
    else {
      const startHero = () => {
        if (finished || started || disposed || !allowed() || document.hidden) return;
        if (performance.now() - initializedAt > 450) {
          settleHero('late-asset');
          return;
        }
        try {
          clearTimeout(readyDeadline);
          // The independent watchdog is armed before the first hidden pixel.
          deadline = schedule(() => settleHero('deadline'), 4050);
          hero.dataset.aboutStartedAt = performance.now().toFixed(2);
          hero.dataset.aboutEntrance = 'running';
          started = true;
          raster.setAttribute('mask', 'url(#about-portrait-reveal-mask)');
          const clock = document.timeline.currentTime;
          const play = (
            target: Element,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions,
          ) => {
            const animation = animate(target, keyframes, options);
            if (typeof clock === 'number') animation.startTime = clock;
            heroAnimations.add(animation);
          };
          for (const line of hero.querySelectorAll('[data-about-hero-line]')) {
            play(line, [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], {
              duration: 500,
              easing: 'cubic-bezier(.3,0,.3,1)',
            });
          }
          hero.querySelectorAll('[data-about-headline]').forEach((headline, index) => {
            play(
              headline,
              [
                { transform: 'translateY(104%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 },
              ],
              { duration: 620, delay: 500 + index * 90, easing: 'cubic-bezier(.2,.7,.2,1)' },
            );
          });
          for (const group of ['contour', 'face', 'fabric'] as const) {
            hero.querySelectorAll(`[data-about-mask="${group}"]`).forEach((path, index) => {
              play(path, [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], {
                duration: group === 'contour' ? 1050 : group === 'face' ? 750 : 650,
                delay: (group === 'contour' ? 800 : group === 'face' ? 1350 : 1850) + index * 90,
                easing: 'cubic-bezier(.25,.1,.3,1)',
              });
            });
          }
          const complete = hero.querySelector('[data-about-mask-complete]');
          if (complete) {
            play(complete, [{ opacity: 0 }, { opacity: 1 }], {
              delay: 2350,
              duration: 350,
              easing: 'ease-out',
            });
          }
          hero
            .querySelectorAll('[data-about-intro], [data-about-caption]')
            .forEach((copy, index) => {
              play(
                copy,
                [
                  { opacity: 0, transform: 'translateY(12px)' },
                  { opacity: 1, transform: 'none' },
                ],
                {
                  duration: 900,
                  delay: 2200 + index * 120,
                  easing: 'cubic-bezier(.2,.7,.2,1)',
                },
              );
            });
          schedule(() => settleHero('complete'), 3500);
        } catch {
          settleHero('failure');
        }
      };
      // Decode the same preloaded optimized URL without adding a second painted
      // portrait. Until it is ready, the HTML artwork and all copy stay static.
      const asset = new Image();
      const source = raster.getAttribute('href');
      readyDeadline = schedule(() => settleHero('late-asset'), 450);
      asset.addEventListener('error', () => settleHero('asset-failure'), {
        once: true,
        signal: heroSignal,
      });
      const decoded = () => {
        if (typeof asset.decode === 'function')
          void asset.decode().then(startHero, () => settleHero('asset-failure'));
        else startHero();
      };
      asset.addEventListener('load', decoded, { once: true, signal: heroSignal });
      if (source) asset.src = source;
      else settleHero('asset-failure');
      if (asset.complete && asset.naturalWidth > 0) decoded();
    }
  } else settleHero(firstVisit ? 'unsupported' : 'already-seen');

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (ticket !== generation || disposed || !page.isConnected || !allowed() || document.hidden)
      return;
    gsap.registerPlugin(ScrollTrigger);
    context = gsap.context(() => {}, page);
    context.add(() => {
      const story = page.querySelector<HTMLElement>('[data-about-story]');
      if (story) {
        const lines = story.querySelectorAll<SVGPathElement>('[data-about-story-line]');
        const markers = story.querySelectorAll<HTMLElement>('[data-about-story-marker]');
        const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
        const progress = { value: 0 };
        timeline.fromTo(
          lines,
          { strokeDasharray: '1 1', strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1 },
          0,
        );
        timeline.to(progress, { value: 1, duration: 1 }, 0);
        markers.forEach((marker, index) => {
          const dot = marker.querySelector('.about-origin__dot');
          timeline.fromTo(
            dot,
            { scale: 0.65, opacity: 0.28 },
            { scale: 1, opacity: 1, duration: 0.2 },
            index / 3,
          );
        });
        const syncStory = () => {
          story.dataset.aboutStoryProgress = progress.value.toFixed(4);
          markers.forEach((marker, index) => {
            marker.dataset.aboutMarkerProgress = Math.max(
              0,
              Math.min(1, (progress.value - index / 3) * 5),
            ).toFixed(4);
          });
        };
        timeline.eventCallback('onUpdate', syncStory);
        const trigger = ScrollTrigger.create({
          id: 'about-origin',
          trigger: story,
          start: 'top 88%',
          end: 'bottom 34%',
          animation: timeline,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onRefresh: syncStory,
        });
        triggers.add(trigger);
        syncStory();
      }
      const process = page.querySelector<HTMLElement>('[data-about-process-system]');
      if (process) {
        const phases = process.querySelectorAll<HTMLElement>('[data-about-process-phase]');
        const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
        const progress = { value: 0 };
        timeline.fromTo(
          process.querySelector('[data-about-process-line]'),
          { strokeDasharray: '1 1', strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1 },
          0,
        );
        timeline.to(progress, { value: 1, duration: 1 }, 0);
        phases.forEach((phase, index) => {
          const name = phase.dataset.aboutPhase;
          const shapes = process.querySelectorAll<SVGElement>(
            `[data-about-process-shape="${name}"], [data-about-process-shape-mobile="${name}"]`,
          );
          for (const shape of shapes) {
            const strokes = shape.querySelectorAll<SVGGeometryElement>(
              ':scope > :not(.about-process__paper)',
            );
            for (const stroke of strokes) {
              const length = stroke.getTotalLength();
              timeline.fromTo(
                stroke,
                { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
                { strokeDashoffset: 0, duration: 0.25 },
                index * 0.25,
              );
            }
            timeline.fromTo(shape, { opacity: 0.3 }, { opacity: 1, duration: 0.25 }, index * 0.25);
          }
        });
        const syncProcess = () => {
          process.dataset.aboutProcessProgress = progress.value.toFixed(4);
          phases.forEach((phase, index) => {
            phase.dataset.aboutPhaseProgress = Math.max(
              0,
              Math.min(1, progress.value * 4 - index),
            ).toFixed(4);
          });
        };
        timeline.eventCallback('onUpdate', syncProcess);
        const trigger = ScrollTrigger.create({
          id: 'about-process',
          trigger: process,
          start: 'top 84%',
          end: 'bottom 34%',
          animation: timeline,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onRefresh: syncProcess,
        });
        triggers.add(trigger);
        syncProcess();
      }
    });

    // Ordinary editorial reveals are once-only and never hidden while awaiting
    // their observer. Body copy remains readable even during its short reveal.
    if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const target = entry.target as HTMLElement | SVGElement;
            observer?.unobserve(target);
            if (target.dataset.aboutSeen === 'true') continue;
            target.dataset.aboutSeen = 'true';
            let animation: Animation;
            if (target.matches('[data-about-draw]')) {
              animation = animate(
                target,
                [
                  { strokeDasharray: '1 1', strokeDashoffset: '1' },
                  { strokeDasharray: '1 1', strokeDashoffset: '0' },
                ],
                { duration: 850, easing: 'ease-out' },
              );
            } else if (target.matches('[data-about-principle-rule]')) {
              animation = animate(
                target,
                [{ transform: 'scaleX(0.2)' }, { transform: 'scaleX(1)' }],
                { duration: 650, easing: 'ease-out' },
              );
            } else {
              const founder = target.matches('[data-about-founder-name]');
              animation = animate(
                target,
                [
                  {
                    opacity: founder ? 1 : 0.72,
                    transform: 'translateY(14px)',
                    ...(founder ? { clipPath: 'inset(0 0 100% 0)' } : {}),
                  },
                  {
                    opacity: 1,
                    transform: 'none',
                    ...(founder ? { clipPath: 'inset(0 0 0% 0)' } : {}),
                  },
                ],
                { duration: founder ? 650 : 550, easing: 'cubic-bezier(.2,.7,.2,1)' },
              );
            }
            animation.addEventListener(
              'finish',
              () => {
                animation.cancel();
                animations.delete(animation);
              },
              { once: true },
            );
          }
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
      );
      for (const target of page.querySelectorAll<HTMLElement | SVGElement>(
        '[data-about-reveal], [data-about-founder-name], [data-about-principle-rule], [data-about-draw]',
      )) {
        if (target.closest('[data-about-hero], [data-about-story], [data-about-process-system]'))
          continue;
        if (target.dataset.aboutSeen !== 'true') observer.observe(target);
      }
    }
    page.dataset.aboutMotion = 'ready';
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!disposed && !document.hidden) ScrollTrigger.refresh();
      });
    };
    document.fonts?.ready.then(() => {
      if (!disposed) refresh();
    });
    window.addEventListener('orientationchange', refresh, { signal });
  } catch {
    // A failed scroll library cannot leave the entrance or content masked.
    settleHero('failure');
    context?.revert();
    triggers.clear();
    page.dataset.aboutMotion = 'static';
  }
}

const restart = () => {
  stop();
  void initialize();
};
preference.addEventListener('change', restart, { signal: lifecycle.signal });
connection?.addEventListener('change', restart, { signal: lifecycle.signal });
document.addEventListener(
  'visibilitychange',
  () => {
    if (document.hidden) stop();
    else void initialize();
  },
  { signal: lifecycle.signal },
);
document.addEventListener('astro:before-swap', stop, { signal: lifecycle.signal });
document.addEventListener('astro:page-load', () => void initialize(), { signal: lifecycle.signal });
window.addEventListener('pagehide', stop, { signal: lifecycle.signal });
window.addEventListener(
  'pageshow',
  (event) => {
    if (event.persisted) restart();
  },
  { signal: lifecycle.signal },
);
void initialize();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stop();
    lifecycle.abort();
    delete (window as Window & { __drawnoutAboutMotion?: unknown }).__drawnoutAboutMotion;
  });
}
