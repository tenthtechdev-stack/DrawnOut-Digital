/** Portrait → approved raster plaque → atmosphere → story. All content is static-first. */
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
  const hero = page.querySelector<HTMLElement>('[data-about-hero]');
  const process = page.querySelector<HTMLElement>('[data-about-process-system]');
  const phases = [...page.querySelectorAll<HTMLElement>('[data-about-process-phase]')];
  let context: Context | undefined;
  let observer: IntersectionObserver | undefined;
  let atmosphereObserver: IntersectionObserver | undefined;
  let disposed = false;
  let refreshFrame = 0;
  let settleHero = (reason: string) => {
    if (!hero) return;
    hero.dispatchEvent(new Event('about:boot-release'));
    hero.removeAttribute('data-about-prepaint');
    hero.dataset.aboutEntrance = 'static';
    hero.dataset.aboutHeroPhase = 'settled';
    hero.dataset.aboutArrivalScene = 'settled';
    hero.dataset.aboutSettleReason = reason;
    hero.dataset.aboutEndedAt = performance.now().toFixed(2);
  };

  const staticProcess = () => {
    for (const phase of phases) {
      phase.dataset.aboutPhaseProgress = '1';
      phase.dataset.aboutScrollProgress = '1';
    }
    if (process) {
      process.dataset.aboutProcessProgress = '1';
      process.dataset.aboutScrollProgress = '1';
    }
  };
  // Rollback exists before any hidden pixel or asynchronous library request.
  dispose = () => {
    if (disposed) return;
    disposed = true;
    settleHero('cleanup');
    controller.abort();
    observer?.disconnect();
    atmosphereObserver?.disconnect();
    if (hero) hero.dataset.aboutAmbient = 'paused';
    for (const timer of timers) clearTimeout(timer);
    for (const animation of animations) animation.cancel();
    animations.clear();
    cancelAnimationFrame(refreshFrame);
    context?.revert();
    triggers.clear();
    staticProcess();
    page.dataset.aboutMotion = preference.matches ? 'reduced' : 'static';
  };
  diagnostics = () => ({
    triggers: [...triggers].map((trigger) => String(trigger.vars.id)),
    hero: hero?.dataset.aboutEntrance ?? 'static',
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

  const firstVisit = !visited.has(page);
  visited.add(page);
  if (!allowed() || document.hidden) {
    page.dataset.aboutMotion = preference.matches ? 'reduced' : 'static';
    if (hero) hero.dataset.aboutAmbient = 'paused';
    staticProcess();
    settleHero(document.hidden ? 'hidden' : preference.matches ? 'reduced-motion' : 'save-data');
    return;
  }
  page.dataset.aboutMotion = 'loading';

  // Only bounded, transform-driven gradient layers animate. They pause outside
  // the hero, in a hidden page, and for either motion preference.
  if (hero) {
    const updateAtmosphere = () => {
      const box = hero.getBoundingClientRect();
      hero.dataset.aboutAmbient =
        !disposed && allowed() && !document.hidden && box.bottom > 0 && box.top < innerHeight
          ? 'running'
          : 'paused';
    };
    if (typeof IntersectionObserver === 'function') {
      atmosphereObserver = new IntersectionObserver(updateAtmosphere, { threshold: 0 });
      atmosphereObserver.observe(hero);
    } else window.addEventListener('scroll', updateAtmosphere, { passive: true, signal });
    window.addEventListener('resize', updateAtmosphere, { passive: true, signal });
    updateAtmosphere();
  }

  const artwork = hero?.querySelector<HTMLElement>('[data-about-artwork]');
  const raster = hero?.querySelector<SVGImageElement>('[data-about-portrait-raster]');
  const plaque = hero?.querySelector<HTMLElement>('[data-about-plaque]');
  if (
    hero &&
    artwork &&
    raster &&
    plaque &&
    firstVisit &&
    typeof Element.prototype.animate === 'function'
  ) {
    const heroController = new AbortController();
    const heroSignal = heroController.signal;
    const heroAnimations = new Set<Animation>();
    const heroTimers = new Set<ReturnType<typeof setTimeout>>();
    const arrival = Number(page.dataset.aboutArrivalAt ?? 0);
    const initializedAt = performance.now();
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    let finished = false;
    let started = false;
    const scheduleHero = (callback: () => void, delay: number) => {
      const timer = schedule(() => {
        heroTimers.delete(timer);
        if (!finished) callback();
      }, delay);
      heroTimers.add(timer);
      return timer;
    };
    settleHero = (reason) => {
      if (finished) return;
      finished = true;
      hero.dispatchEvent(new Event('about:boot-release'));
      hero.removeAttribute('data-about-prepaint');
      hero.dataset.aboutEntrance = started ? 'settled' : 'static';
      hero.dataset.aboutHeroPhase = 'settled';
      hero.dataset.aboutArrivalScene = 'settled';
      hero.dataset.aboutSettleReason = reason;
      hero.dataset.aboutEndedAt = performance.now().toFixed(2);
      heroController.abort();
      for (const timer of heroTimers) {
        clearTimeout(timer);
        timers.delete(timer);
      }
      heroTimers.clear();
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
    window.addEventListener('resize', () => settleHero('resize'), { signal: heroSignal });
    const exclusion =
      hero.dataset.aboutBoot === 'released' || hero.dataset.aboutBoot === 'skipped'
        ? 'boot-released'
        : location.hash || window.scrollY > 0
          ? 'restored-scroll'
          : navigation?.type === 'back_forward'
            ? 'history'
            : !arrival || initializedAt - arrival > 550
              ? 'late-init'
              : document.activeElement instanceof HTMLElement &&
                  document.activeElement !== document.body
                ? 'focused'
                : undefined;
    if (exclusion) settleHero(exclusion);
    else {
      const startHero = () => {
        if (finished || started || disposed || !allowed() || document.hidden) return;
        if (hero.dataset.aboutBoot === 'released' || performance.now() - arrival > 550) {
          settleHero('late-init');
          return;
        }
        if (performance.now() - initializedAt > 450) {
          settleHero('late-asset');
          return;
        }
        try {
          clearTimeout(readyDeadline);
          heroTimers.delete(readyDeadline);
          timers.delete(readyDeadline);
          // The complete grid remains in normal flow throughout. Only opacity
          // and small decoration transforms change; no center-to-side jump.
          hero.dispatchEvent(new Event('about:boot-handoff'));
          hero.removeAttribute('data-about-prepaint');
          scheduleHero(
            () => settleHero('deadline'),
            Math.max(0, arrival + 4050 - performance.now()),
          );
          hero.dataset.aboutStartedAt = performance.now().toFixed(2);
          hero.dataset.aboutEntrance = 'running';
          hero.dataset.aboutHeroPhase = 'arrival';
          hero.dataset.aboutArrivalScene = 'portrait';
          started = true;
          const clock = document.timeline.currentTime;
          const play = (target: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
            const animation = animate(target, frames, options);
            heroAnimations.add(animation);
            if (typeof clock === 'number') animation.startTime = clock;
          };
          const enter = (
            target: Element,
            delay: number,
            duration: number,
            travel: number,
            tilt = 0,
          ) => {
            const base = getComputedStyle(target).transform;
            const final = base === 'none' ? '' : base;
            play(
              target,
              [
                {
                  opacity: 0,
                  transform: `translateY(${travel}px) rotate(${tilt}deg) ${final}`.trim(),
                },
                { opacity: 1, transform: final || 'none' },
              ],
              { delay, duration, easing: 'cubic-bezier(.22,.7,.22,1)' },
            );
          };
          enter(artwork, 0, 900, 22);
          // This is the approved source-pixel plaque, layered in 2.5D. It is
          // deliberately not described or treated as a newly rigged 3D object.
          enter(plaque, 700, 900, -26, -3);
          const gradient = hero.querySelector<HTMLElement>('[data-about-gradient]');
          if (gradient)
            play(
              gradient,
              [
                { opacity: 0, transform: 'scale(.93)' },
                { opacity: 1, transform: 'scale(1)' },
              ],
              { delay: 1200, duration: 1100, easing: 'cubic-bezier(.22,.7,.22,1)' },
            );
          scheduleHero(() => {
            hero.dataset.aboutArrivalScene = 'plaque';
          }, 700);
          scheduleHero(() => {
            hero.dataset.aboutArrivalScene = 'atmosphere';
          }, 1200);
          scheduleHero(() => {
            hero.dataset.aboutHeroPhase = 'transition';
            hero.dataset.aboutArrivalScene = 'copy';
          }, 2000);
          hero.querySelectorAll('[data-about-headline]').forEach((headline, index) => {
            enter(headline, 2000 + index * 90, 740, 28);
          });
          hero.querySelectorAll('[data-about-hero-paragraph]').forEach((copy, index) => {
            enter(copy, 2500 + index * 100, 650, 12);
          });
          for (const detail of hero.querySelectorAll(
            '[data-about-caption], [data-about-signoff]',
          )) {
            play(detail, [{ opacity: 0 }, { opacity: 1 }], { delay: 2700, duration: 650 });
          }
          scheduleHero(() => settleHero('complete'), 3500);
        } catch {
          settleHero('failure');
        }
      };
      // Match the actual displayed sources. A slow or failed asset leaves the
      // static readable composition rather than delaying navigation or copy.
      const plaqueImage = plaque.querySelector<HTMLImageElement>('img');
      const sources = [raster.getAttribute('href'), plaqueImage?.currentSrc || plaqueImage?.src];
      const readyDeadline = scheduleHero(() => settleHero('late-asset'), 450);
      const decodeAsset = (source: string | null | undefined) =>
        new Promise<void>((resolve, reject) => {
          if (!source) {
            reject(new Error('Missing About artwork'));
            return;
          }
          const image = new Image();
          let decoding = false;
          const loaded = () => {
            if (decoding) return;
            decoding = true;
            if (typeof image.decode === 'function')
              void image.decode().then(() => resolve(), reject);
            else resolve();
          };
          image.addEventListener('error', reject, { once: true, signal: heroSignal });
          image.addEventListener('load', loaded, { once: true, signal: heroSignal });
          image.src = source;
          if (image.complete && image.naturalWidth > 0) loaded();
        });
      void Promise.all(sources.map(decodeAsset)).then(startHero, () => settleHero('asset-failure'));
    }
  } else settleHero(firstVisit ? 'unsupported' : 'already-seen');

  // A focused control must never wait for a decorative reveal around it.
  document.addEventListener(
    'focusin',
    () => {
      for (const animation of animations) {
        animation.cancel();
        animations.delete(animation);
      }
    },
    { signal },
  );

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
      const updateSummary = () => {
        if (!process || !phases.length) return;
        const average =
          phases.reduce((sum, phase) => sum + Number(phase.dataset.aboutPhaseProgress ?? 0), 0) /
          phases.length;
        process.dataset.aboutProcessProgress = average.toFixed(4);
        process.dataset.aboutScrollProgress = average.toFixed(4);
      };
      phases.forEach((phase, index) => {
        const strokes = phase.querySelectorAll<SVGGeometryElement>('[data-about-process-stroke]');
        const parts = phase.querySelectorAll<SVGElement>('[data-about-process-part]');
        const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
        if (strokes.length)
          timeline.fromTo(
            strokes,
            { strokeDasharray: '1 1', strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1, autoRound: false },
            0,
          );
        if (parts.length)
          timeline.fromTo(parts, { y: 20, opacity: 0.6 }, { y: 0, opacity: 1, duration: 1 }, 0);
        const sync = (self: Trigger) => {
          phase.dataset.aboutPhaseProgress = self.progress.toFixed(4);
          phase.dataset.aboutScrollProgress = self.progress.toFixed(4);
          updateSummary();
        };
        const trigger = ScrollTrigger.create({
          id: `about-process-${phase.dataset.aboutPhase ?? index}`,
          trigger: phase,
          start: 'top 82%',
          end: 'top 30%',
          animation: timeline,
          // Exact scroll-to-art mapping, including reverse scroll. No eased
          // scrub, pinning, timeout or intersection threshold shifts the playhead.
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: sync,
          onRefresh: sync,
        });
        triggers.add(trigger);
        sync(trigger);
      });
    });

    // Content is never pre-hidden below the hero. Viewport entrances decorate
    // readable text once; backscroll retains the complete editorial composition.
    if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const target = entry.target as HTMLElement | SVGElement;
            observer?.unobserve(target);
            if (target.dataset.aboutSeen === 'true') continue;
            target.dataset.aboutSeen = 'true';
            // Reveal the outside container only if markup requests both a parent
            // panel and text; never double-animate the same visual content.
            const parent = target.parentElement?.closest(
              '[data-about-story-panel], [data-about-reveal]',
            );
            if (parent && parent !== target && !parent.closest('[data-about-hero]')) continue;
            const rule = target.matches('[data-about-principle-rule]');
            const founder = target.matches('[data-about-founder-name]');
            const panel = target.matches('[data-about-story-panel]');
            const animation = rule
              ? animate(target, [{ transform: 'scaleX(.18)' }, { transform: 'scaleX(1)' }], {
                  duration: 800,
                  easing: 'cubic-bezier(.2,.7,.2,1)',
                })
              : animate(
                  target,
                  [
                    {
                      opacity: founder ? 1 : 0.72,
                      transform: `translateY(${panel ? 20 : 14}px)`,
                      ...(founder ? { clipPath: 'inset(0 0 100% 0)' } : {}),
                    },
                    {
                      opacity: 1,
                      transform: 'none',
                      ...(founder ? { clipPath: 'inset(0 0 0% 0)' } : {}),
                    },
                  ],
                  { duration: founder ? 800 : 700, easing: 'cubic-bezier(.2,.7,.2,1)' },
                );
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
        { rootMargin: '0px 0px -5% 0px', threshold: 0.08 },
      );
      for (const target of page.querySelectorAll<HTMLElement | SVGElement>(
        '[data-about-reveal], [data-about-story-panel], [data-about-founder-name], [data-about-principle-rule]',
      )) {
        if (target.closest('[data-about-hero]')) continue;
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
    void document.fonts?.ready.then(() => {
      if (!disposed) refresh();
    });
    window.addEventListener('orientationchange', refresh, { signal });
  } catch {
    settleHero('failure');
    context?.revert();
    triggers.clear();
    staticProcess();
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
