/** Native scroll-linked editorial motion, independent of the parser-owned hero arrival. */
import { allowsMotion } from '../lib/motion-policy';

type Connection = EventTarget & { saveData?: boolean };
type Gsap = (typeof import('gsap'))['gsap'];
type ScrollTriggerPlugin = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];
type Context = ReturnType<Gsap['context']>;
type Trigger = ReturnType<ScrollTriggerPlugin['create']>;

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
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
  const hero = page.querySelector<HTMLElement>('[data-about-hero]');
  const process = page.querySelector<HTMLElement>('[data-about-process-system]');
  const phases = [...page.querySelectorAll<HTMLElement>('[data-about-process-phase]')];
  let context: Context | undefined;
  let observer: IntersectionObserver | undefined;
  let disposed = false;
  let refreshFrame = 0;

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
    controller.abort();
    observer?.disconnect();
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
  const animate = (target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = target.animate(keyframes, { fill: 'both', ...options });
    animations.add(animation);
    return animation;
  };

  // The parser-local hero controller owns its finite arrival and atmosphere.
  // Editorial GSAP loading cannot delay, restart or cancel that choreography.
  if (!allowed() || document.hidden) {
    page.dataset.aboutMotion = preference.matches ? 'reduced' : 'static';
    staticProcess();
    return;
  }
  page.dataset.aboutMotion = 'loading';

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
