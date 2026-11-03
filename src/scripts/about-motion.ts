/** Portrait → atmosphere → story. The verified 3D-emblem beat remains an asset dependency. */
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
  let atmosphereObserver: IntersectionObserver | undefined;
  let disposed = false;
  let refreshFrame = 0;
  let settleHero = (reason: string) => {
    const hero = page.querySelector<HTMLElement>('[data-about-hero]');
    if (hero) {
      hero.dispatchEvent(new Event('about:boot-release'));
      hero.removeAttribute('data-about-prepaint');
      hero.dataset.aboutEntrance = 'static';
      hero.dataset.aboutHeroPhase = 'settled';
      hero.dataset.aboutArrivalScene = 'settled';
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
    atmosphereObserver?.disconnect();
    const hero = page.querySelector<HTMLElement>('[data-about-hero]');
    if (hero) hero.dataset.aboutAmbient = 'paused';
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

  // Transform only three bounded radial layers. CSS stays static without this
  // visibility/preference opt-in, and never animates a global background.
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

  if (hero && raster && firstVisit && typeof Element.prototype.animate === 'function') {
    const heroController = new AbortController();
    const heroSignal = heroController.signal;
    const heroAnimations = new Set<Animation>();
    const composition = hero.querySelector<HTMLElement>('[data-about-composition]');
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
      hero.dispatchEvent(new Event('about:boot-release'));
      hero.removeAttribute('data-about-prepaint');
      hero.dataset.aboutEntrance = started ? 'settled' : 'static';
      hero.dataset.aboutHeroPhase = 'settled';
      hero.dataset.aboutArrivalScene = 'settled';
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
    window.addEventListener('resize', () => settleHero('resize'), { signal: heroSignal });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) settleHero('hidden');
      },
      { signal: heroSignal },
    );
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
          if (!composition) {
            settleHero('missing-composition');
            return;
          }
          // Measure the static final slot; the entrance only transforms its
          // decoration. No grid dimensions or document scroll positions change.
          // Handoff, untransformed measurement and WAAPI setup share one turn;
          // the browser cannot paint a static right pose between them.
          hero.dispatchEvent(new Event('about:boot-handoff'));
          hero.removeAttribute('data-about-prepaint');
          const finalBox = composition.getBoundingClientRect();
          const heroBox = hero.getBoundingClientRect();
          const visibleTop = Math.max(0, heroBox.top);
          const visibleHeight = Math.min(heroBox.height, innerHeight - visibleTop);
          const centerX = heroBox.left + heroBox.width / 2;
          const centerY = visibleTop + visibleHeight / 2;
          const fromX = centerX - (finalBox.left + finalBox.width / 2);
          const fromY = centerY - (finalBox.top + finalBox.height / 2);
          // On the stacked layout the portrait settles below the title.
          // Let it clear that reading area before the title begins to reveal.
          const mobile = window.matchMedia('(max-width: 767px)').matches;
          const headlineDelay = mobile ? 2100 : 1700;
          const copyDelay = mobile ? 2500 : 2350;
          // Arm rollback before any copy fades or composition movement begins.
          deadline = schedule(
            () => settleHero('deadline'),
            Math.max(0, arrival + 4050 - performance.now()),
          );
          hero.dataset.aboutStartedAt = performance.now().toFixed(2);
          hero.dataset.aboutEntrance = 'running';
          hero.dataset.aboutHeroPhase = 'center';
          hero.dataset.aboutArrivalScene = 'portrait';
          started = true;
          const clock = document.timeline.currentTime;
          const play = (
            target: Element,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions,
          ) => {
            const animation = animate(target, keyframes, options);
            heroAnimations.add(animation);
            if (typeof clock === 'number') animation.startTime = clock;
          };
          play(
            composition,
            [
              { transform: `translate(${fromX}px, ${fromY}px)` },
              { transform: 'translate(0px, 0px)' },
            ],
            { delay: 850, duration: 1500, easing: 'cubic-bezier(.4,0,.2,1)' },
          );
          const artwork = hero.querySelector('[data-about-artwork]');
          if (artwork)
            play(
              artwork,
              [
                { opacity: 0, transform: 'translateY(18px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration: 700, easing: 'cubic-bezier(.22,.7,.22,1)' },
            );
          // No flat emblem stands in for the missing approved 3D asset. Its
          // independently reviewed entrance can be inserted before this bloom.
          const gradient = hero.querySelector('[data-about-gradient]');
          if (gradient)
            play(
              gradient,
              [
                { opacity: 0, transform: 'scale(.86)' },
                { opacity: 1, transform: 'scale(1)' },
              ],
              { delay: 700, duration: 1150, easing: 'cubic-bezier(.22,.7,.22,1)' },
            );
          schedule(() => {
            if (!finished) hero.dataset.aboutArrivalScene = 'atmosphere';
          }, 700);
          schedule(() => {
            if (!finished) hero.dataset.aboutHeroPhase = 'transition';
          }, 850);
          schedule(() => {
            if (!finished) hero.dataset.aboutArrivalScene = 'copy';
          }, headlineDelay);
          hero.querySelectorAll('[data-about-headline]').forEach((headline, index) => {
            play(
              headline,
              [
                { transform: 'translateY(75%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 },
              ],
              {
                duration: 800,
                delay: headlineDelay + index * 110,
                easing: 'cubic-bezier(.2,.7,.2,1)',
              },
            );
          });
          hero.querySelectorAll('[data-about-hero-paragraph]').forEach((copy, index) => {
            play(
              copy,
              [
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'none' },
              ],
              {
                duration: 750,
                delay: copyDelay + index * 100,
                easing: 'cubic-bezier(.2,.7,.2,1)',
              },
            );
          });
          for (const detail of hero.querySelectorAll('[data-about-caption], [data-about-signoff]'))
            play(detail, [{ opacity: 0 }, { opacity: 1 }], { delay: 2700, duration: 750 });
          // All copy finishes by 3450ms. Complete within the existing absolute
          // 4050ms watchdog even when an otherwise healthy startup takes 550ms.
          schedule(() => settleHero('complete'), 3500);
        } catch {
          settleHero('failure');
        }
      };
      // Decode the same displayed assets without adding painted duplicates.
      // A late portrait keeps the complete static final composition.
      const sources = [raster.getAttribute('href')];
      readyDeadline = schedule(() => settleHero('late-asset'), 450);
      const decodeAsset = (source: string | null | undefined) =>
        new Promise<void>((resolve, reject) => {
          if (!source) {
            reject(new Error('Missing hero artwork'));
            return;
          }
          const asset = new Image();
          let decoding = false;
          const loaded = () => {
            if (decoding) return;
            decoding = true;
            if (typeof asset.decode === 'function')
              void asset.decode().then(() => resolve(), reject);
            else resolve();
          };
          asset.addEventListener('error', reject, { once: true, signal: heroSignal });
          asset.addEventListener('load', loaded, { once: true, signal: heroSignal });
          asset.src = source;
          if (asset.complete && asset.naturalWidth > 0) loaded();
        });
      void Promise.all(sources.map(decodeAsset)).then(startHero, () => settleHero('asset-failure'));
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
          { strokeDashoffset: 0, duration: 1, autoRound: false },
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
          { strokeDashoffset: 0, duration: 1, autoRound: false },
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
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            process.dataset.aboutScrollProgress = self.progress.toFixed(4);
          },
          onRefresh: (self) => {
            syncProcess();
            process.dataset.aboutScrollProgress = self.progress.toFixed(4);
          },
        });
        triggers.add(trigger);
        syncProcess();
        process.dataset.aboutScrollProgress = trigger.progress.toFixed(4);
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
