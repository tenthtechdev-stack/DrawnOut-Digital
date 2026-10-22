import { allowsMotion, expansionProfile, motionTiming } from '../lib/motion-policy';

type Gsap = (typeof import('gsap'))['gsap'];
type ScrollTriggerPlugin = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];
type Timeline = ReturnType<Gsap['timeline']>;
type Trigger = ReturnType<ScrollTriggerPlugin['create']>;
type Connection = EventTarget & { saveData?: boolean };
interface Scene {
  id: number;
  media: HTMLElement;
  image: HTMLImageElement;
  frame: HTMLElement;
  timeline: Timeline;
  trigger: Trigger;
  focused: boolean;
}

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let generation = 0;
let activeRoot: HTMLElement | undefined;
let dispose: (() => void) | undefined;
let library: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerPlugin }> | undefined;
let sceneSnapshot: () => { id: number; start: number; end: number; progress: number }[] = () => [];
const stats = { initializationCount: 0, cleanupCount: 0, revealCount: 0, refreshCount: 0 };
let triggerSnapshot = () => 0;

if (import.meta.env.DEV) {
  Object.defineProperty(window, '__drawnoutMotion', {
    configurable: true,
    value: Object.freeze({
      get state() {
        return document.documentElement.dataset.motionState;
      },
      get sceneCount() {
        return sceneSnapshot().length;
      },
      get triggerCount() {
        return triggerSnapshot();
      },
      get revealCount() {
        return stats.revealCount;
      },
      get refreshCount() {
        return stats.refreshCount;
      },
      get initializationCount() {
        return stats.initializationCount;
      },
      get cleanupCount() {
        return stats.cleanupCount;
      },
      get scenes() {
        return sceneSnapshot();
      },
    }),
  });
}

function releaseHeroBoot(state = 'static') {
  const html = document.documentElement;
  if (html.dataset.heroBoot === 'pending' || html.dataset.heroEntrance === 'running') {
    delete html.dataset.heroBoot;
    delete html.dataset.heroBootUntil;
    html.dataset.heroEntrance = state;
  }
}

function stop() {
  generation += 1;
  dispose?.();
  if (activeRoot) releaseHeroBoot();
  dispose = undefined;
  activeRoot = undefined;
  sceneSnapshot = () => [];
  triggerSnapshot = () => 0;
}

function getLibrary() {
  library ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    },
  );
  return library;
}

function revealTargets(root: HTMLElement): HTMLElement[] {
  const targets = new Set<HTMLElement>();
  for (const candidate of root.querySelectorAll<HTMLElement>(
    '[data-motion-text], [data-motion-support], .section-heading, [data-text-reveal]',
  )) {
    const target = candidate.matches('h1, h2, h3, p, [data-motion-support]')
      ? candidate
      : candidate.querySelector<HTMLElement>('h1, h2, h3');
    if (target && !target.closest('[data-hero], [data-site-footer]')) targets.add(target);
  }
  // A heading is never animated twice through an editorial wrapper.
  return [...targets].filter(
    (target) => ![...targets].some((parent) => parent !== target && parent.contains(target)),
  );
}

async function initialize(force = false) {
  const root = document.querySelector<HTMLElement>('main[data-motion-root]');
  if (!root || (!force && root === activeRoot)) return;
  stop();
  activeRoot = root;
  const currentGeneration = generation;
  const html = document.documentElement;
  const saveData = connection?.saveData === true;
  html.dataset.motionSaver = String(saveData);
  html.toggleAttribute('data-motion-paused', document.hidden);
  if (!allowsMotion({ reducedMotion: preference.matches, saveData })) {
    releaseHeroBoot();
    html.dataset.motionState = preference.matches ? 'reduced' : 'static';
    return;
  }
  if (!('IntersectionObserver' in window)) {
    releaseHeroBoot();
    html.dataset.motionState = 'static';
    return;
  }
  const editorialTargets = revealTargets(root);
  const heroTarget = root.querySelector<HTMLElement>('[data-hero]') ?? undefined;
  const hasExpansion = [...root.querySelectorAll<HTMLElement>('[data-expansion-frame]')].some(
    (frame) =>
      !frame.closest('[data-site-footer], [data-case-navigation]') &&
      frame.querySelector('.media-slot img'),
  );
  if (!heroTarget && editorialTargets.length === 0 && !hasExpansion) {
    releaseHeroBoot();
    html.dataset.motionState = 'static';
    return;
  }
  html.dataset.motionState = 'loading';

  try {
    const { gsap, ScrollTrigger } = await getLibrary();
    if (generation !== currentGeneration || !root.isConnected) return;
    stats.initializationCount += 1;
    const abort = new AbortController();
    const { signal } = abort;
    const savedStyles = new Map<HTMLElement, string | null>();
    const safetyTimers = new Set<ReturnType<typeof setTimeout>>();
    const scenes = new Set<Scene>();
    const ownTriggers = new Set<Trigger>();
    const revealAnimations = new Map<HTMLElement, ReturnType<Gsap['to']>>();
    let refreshFrame = 0;
    let progressFrame = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const observers: {
      text?: IntersectionObserver;
      hero?: IntersectionObserver;
      layout?: MutationObserver;
    } = {};
    const hero = heroTarget;
    const context = gsap.context(() => {}, root);
    const mediaQueries = gsap.matchMedia(root);
    const remember = (target: HTMLElement) => {
      if (!savedStyles.has(target)) savedStyles.set(target, target.getAttribute('style'));
    };
    const restore = (target: HTMLElement) => {
      const style = savedStyles.get(target);
      if (style === undefined) return;
      if (style === null) target.removeAttribute('style');
      else target.setAttribute('style', style);
    };
    const syncProgress = (scene: Scene) => {
      scene.media.dataset.motionProgress = (scene.focused ? 1 : scene.timeline.progress()).toFixed(
        4,
      );
    };
    const syncScenes = () => {
      if (disposed) return;
      for (const scene of scenes) syncProgress(scene);
    };
    // Refresh restores animation progress with GSAP callbacks suppressed. Mirror
    // that rendered state explicitly, including the next frame after scrub settles.
    const afterRefresh = () => {
      syncScenes();
      cancelAnimationFrame(progressFrame);
      progressFrame = requestAnimationFrame(syncScenes);
    };
    ScrollTrigger.addEventListener('refresh', afterRefresh);
    // Install rollback before configuring any animation: synchronous setup errors
    // receive the same complete cleanup as navigation or preference changes.
    dispose = () => {
      if (disposed) return;
      disposed = true;
      stats.cleanupCount += 1;
      abort.abort();
      observers.text?.disconnect();
      observers.hero?.disconnect();
      observers.layout?.disconnect();
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(progressFrame);
      ScrollTrigger.removeEventListener('refresh', afterRefresh);
      clearTimeout(refreshTimer);
      for (const timer of safetyTimers) clearTimeout(timer);
      safetyTimers.clear();
      mediaQueries.revert();
      context.revert();
      for (const scene of scenes) {
        scene.trigger.kill();
        scene.timeline.kill();
        delete scene.media.dataset.motionScene;
        delete scene.media.dataset.motionProgress;
      }
      scenes.clear();
      ownTriggers.clear();
      for (const target of savedStyles.keys()) restore(target);
      for (const target of root.querySelectorAll<HTMLElement>('[data-motion-revealed]')) {
        delete target.dataset.motionRevealed;
        delete target.dataset.motionReveal;
      }
      if (hero) delete hero.dataset.heroInView;
      releaseHeroBoot();
      html.dataset.motionState = 'static';
    };
    const requestRefresh = () => {
      if (disposed) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          if (disposed) return;
          ScrollTrigger.refresh();
          stats.refreshCount += 1;
        });
      }, 90);
    };
    const safeReveal = (target: HTMLElement, duration: number, delay = 0, isHeroLine = false) => {
      if (target.dataset.motionRevealed === 'true' || target.closest('[hidden]')) return;
      target.dataset.motionRevealed = 'true';
      remember(target);
      const finish = () => {
        revealAnimations.delete(target);
        restore(target);
        target.dataset.motionReveal = 'complete';
        if (
          html.dataset.heroEntrance === 'running' &&
          hero?.contains(target) &&
          ![...revealAnimations.keys()].some((element) => hero.contains(element))
        )
          html.dataset.heroEntrance = 'complete';
      };
      context.add(() => {
        // Establish every delayed target's start styles synchronously. A lazy
        // fromTo startAt can revert those styles before its delay begins, which
        // would expose the static headline after releasing the pre-paint gate.
        gsap.set(target, {
          y: isHeroLine ? 28 : target.dataset.motionText === 'copy' ? 10 : 23,
          opacity: isHeroLine ? 0.35 : 0.3,
          clipPath: isHeroLine || target.matches('h1, h2, h3') ? 'inset(0% 0% 100% 0%)' : 'none',
          lazy: false,
        });
        const animation = gsap.to(target, {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration,
          delay,
          ease: 'power3.out',
          onComplete: finish,
          onInterrupt: finish,
        });
        revealAnimations.set(target, animation);
        target.dataset.motionReveal = 'running';
        stats.revealCount += 1;
      });
      const timer = setTimeout(
        () => {
          safetyTimers.delete(timer);
          if (revealAnimations.has(target)) {
            revealAnimations.get(target)?.kill();
            finish();
          }
        },
        motionTiming.revealSafetyMs + delay * 1000,
      );
      safetyTimers.add(timer);
    };

    observers.text = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          observers.text?.unobserve(target);
          const statement = target.dataset.motionText === 'statement';
          const supporting = target.hasAttribute('data-motion-support');
          safeReveal(
            target,
            statement
              ? motionTiming.statementDuration
              : supporting
                ? motionTiming.supportDuration
                : motionTiming.headingDuration,
          );
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
    );
    for (const target of editorialTargets) observers.text.observe(target);

    observers.hero = hero
      ? new IntersectionObserver(
          ([entry]) => {
            if (hero) hero.dataset.heroInView = String(entry?.isIntersecting ?? false);
          },
          { threshold: 0 },
        )
      : undefined;
    if (hero) {
      hero.dataset.heroInView = String(hero.getBoundingClientRect().bottom > 0);
      observers.hero?.observe(hero);
      // Only consume the pre-paint ticket while its CSS gate is still in force.
      // A slow library, restored scroll or early keyboard focus gets static content.
      const entranceReady =
        html.dataset.heroBoot === 'pending' &&
        performance.now() < Number(html.dataset.heroBootUntil) &&
        window.scrollY < 60 &&
        !document.hidden &&
        !hero.contains(document.activeElement) &&
        getComputedStyle(hero).getPropertyValue('--hero-boot-gate').trim() === '1';
      if (entranceReady) {
        const heroLines = [...hero.querySelectorAll<HTMLElement>('[data-type-line]')];
        heroLines.forEach((line, index) =>
          safeReveal(line, motionTiming.heroDuration, index * motionTiming.heroStagger, true),
        );
        for (const [index, target] of [
          ...hero.querySelectorAll<HTMLElement>(
            '[data-hero-kicker], [data-hero-support], [data-hero-actions], [data-hero-note]',
          ),
        ].entries()) {
          safeReveal(target, motionTiming.supportDuration, 0.2 + index * 0.07);
        }
        // Explicit sets apply every starting style synchronously. Remove the CSS gate
        // in this same task, so a fully painted headline can never be hidden later.
        releaseHeroBoot('running');
      } else {
        releaseHeroBoot();
        html.dataset.heroEntrance = 'static';
      }
    }

    context.add(() => {
      mediaQueries.add({ mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' }, () => {
        const frameCandidates = [...root.querySelectorAll<HTMLElement>('[data-expansion-frame]')];
        const registered = new Set<HTMLElement>();
        const localScenes: Scene[] = [];
        for (const frame of frameCandidates) {
          if (frame.closest('[data-site-footer], [data-case-navigation]')) continue;
          const media = frame.querySelector<HTMLElement>('.media-slot');
          const image = media?.querySelector<HTMLImageElement>('img');
          if (!media || !image || registered.has(media)) continue;
          registered.add(media);
          remember(media);
          remember(image);
          const profile = expansionProfile(window.innerWidth, image.width / image.height);
          const id = localScenes.length;
          media.dataset.motionScene = String(id);
          const timeline = gsap.timeline({
            scrollTrigger: {
              id: `drawnout-expansion-${id}`,
              trigger: media,
              start: 'top 90%',
              end: profile.end,
              scrub: profile.scrub,
              invalidateOnRefresh: true,
              onToggle: (trigger) => {
                media.style.willChange = trigger.isActive ? 'clip-path' : '';
                image.style.willChange = trigger.isActive ? 'transform' : '';
              },
            },
          });
          timeline
            .fromTo(
              media,
              {
                clipPath: `inset(0% ${profile.inset}% 0% ${profile.inset}% round ${profile.radius}px)`,
              },
              { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 },
              0,
            )
            .fromTo(
              image,
              { scale: profile.scale, yPercent: profile.drift },
              { scale: 1, yPercent: 0, ease: 'none', duration: 1 },
              0,
            );
          const trigger = timeline.scrollTrigger!;
          const scene: Scene = { id, frame, media, image, timeline, trigger, focused: false };
          timeline.eventCallback('onUpdate', () => {
            if (scene.focused) {
              gsap.set(scene.media, { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
              gsap.set(scene.image, { scale: 1, yPercent: 0 });
              return;
            }
            syncProgress(scene);
          });
          syncProgress(scene);
          scenes.add(scene);
          ownTriggers.add(trigger);
          localScenes.push(scene);
        }
        const heading = hero?.querySelector<HTMLElement>('h1');
        let heroExit: ReturnType<Gsap['to']> | undefined;
        if (hero && heading) {
          remember(heading);
          heroExit = gsap.to(heading, {
            y: () => -Math.min(28, window.innerHeight * 0.025),
            opacity: 0.72,
            ease: 'none',
            scrollTrigger: {
              id: 'drawnout-hero-exit',
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          });
          if (heroExit.scrollTrigger) ownTriggers.add(heroExit.scrollTrigger);
        }
        return () => {
          for (const scene of localScenes) {
            scene.trigger.kill();
            scene.timeline.kill();
            ownTriggers.delete(scene.trigger);
            scenes.delete(scene);
            restore(scene.media);
            restore(scene.image);
            delete scene.media.dataset.motionScene;
            delete scene.media.dataset.motionProgress;
          }
          if (heroExit) {
            if (heroExit.scrollTrigger) ownTriggers.delete(heroExit.scrollTrigger);
            heroExit.scrollTrigger?.kill();
            heroExit.kill();
            if (heading) restore(heading);
          }
        };
      });
    });

    root.addEventListener(
      'focusin',
      (event) => {
        const target = event.target as HTMLElement;
        for (const [element, animation] of revealAnimations) {
          if (element.contains(target)) animation.progress(1);
        }
        for (const scene of scenes) {
          const owner = scene.frame.closest('a, figure') ?? scene.frame;
          if (!owner.contains(target)) continue;
          scene.focused = true;
          scene.timeline.pause();
          gsap.set(scene.media, { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
          gsap.set(scene.image, { scale: 1, yPercent: 0 });
          scene.media.dataset.motionProgress = '1.0000';
        }
      },
      { signal },
    );
    root.addEventListener(
      'focusout',
      () => {
        queueMicrotask(() => {
          if (disposed) return;
          for (const scene of scenes) {
            if (!scene.focused) continue;
            const owner = scene.frame.closest('a, figure') ?? scene.frame;
            if (owner.contains(document.activeElement)) continue;
            scene.focused = false;
            scene.timeline.invalidate().progress(scene.trigger.progress);
          }
        });
      },
      { signal },
    );

    for (const image of root.querySelectorAll('img')) {
      if (!image.complete) image.addEventListener('load', requestRefresh, { once: true, signal });
    }
    document.fonts.ready.then(() => {
      if (!disposed) requestRefresh();
    });
    observers.layout = new MutationObserver(requestRefresh);
    const workList = root.querySelector('[data-work-project-list]');
    if (workList)
      observers.layout.observe(workList, {
        subtree: true,
        attributes: true,
        attributeFilter: ['hidden'],
      });
    window.addEventListener('resize', requestRefresh, { passive: true, signal });
    root.addEventListener('portfolio:filterchange', requestRefresh, { signal });
    document.addEventListener(
      'visibilitychange',
      () => {
        html.toggleAttribute('data-motion-paused', document.hidden);
        if (!document.hidden) requestRefresh();
      },
      { signal },
    );

    sceneSnapshot = () =>
      [...scenes].map(({ id, trigger, timeline, focused }) => ({
        id,
        start: trigger.start,
        end: trigger.end,
        progress: focused ? 1 : timeline.progress(),
      }));
    triggerSnapshot = () => ownTriggers.size;
    html.dataset.motionState = 'ready';
    requestRefresh();
  } catch {
    if (generation !== currentGeneration) return;
    dispose?.();
    releaseHeroBoot();
    html.dataset.motionState = 'error';
  }
}

const lifecycle = new AbortController();
const { signal: lifecycleSignal } = lifecycle;
void initialize();
document.addEventListener('astro:page-load', () => void initialize(), { signal: lifecycleSignal });
document.addEventListener('astro:before-swap', stop, { signal: lifecycleSignal });
window.addEventListener('pagehide', stop, { signal: lifecycleSignal });
window.addEventListener(
  'pageshow',
  (event) => {
    if (event.persisted) void initialize(true);
  },
  { signal: lifecycleSignal },
);
preference.addEventListener('change', () => void initialize(true), { signal: lifecycleSignal });
connection?.addEventListener('change', () => void initialize(true), { signal: lifecycleSignal });
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stop();
    lifecycle.abort();
  });
}
