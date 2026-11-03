import {
  servicesHeroFrame,
  servicesHeroPauseReasons,
  servicesHeroPreviewTime,
  servicesHeroTiming,
} from '../lib/services-hero-policy';

type Gsap = (typeof import('gsap'))['gsap'];
type Timeline = ReturnType<Gsap['timeline']>;
type Context = ReturnType<Gsap['context']>;
type Connection = EventTarget & { saveData?: boolean };

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const lifecycle = new AbortController();
const memory = new WeakMap<
  HTMLElement,
  { userPaused: boolean; time: number; index: number; cycle: number }
>();
let activeHero: HTMLElement | undefined;
let dispose: (() => void) | undefined;

function stop() {
  dispose?.();
  dispose = undefined;
  activeHero = undefined;
}

function initialize() {
  const hero = document.querySelector<HTMLElement>('[data-services-hero]');
  if (!hero || (hero === activeHero && dispose)) return;
  stop();
  activeHero = hero;
  const stage = hero.querySelector<HTMLElement>('[data-services-stage]');
  const travel = hero.querySelector<HTMLElement>('[data-services-travel]');
  const emblem = hero.querySelector<HTMLElement>('[data-services-emblem]');
  const wordmark = hero.querySelector<HTMLElement>('[data-services-wordmark]');
  const pause = hero.querySelector<HTMLButtonElement>('[data-services-pause]');
  const pauseLabel = hero.querySelector<HTMLElement>('[data-services-pause-label]');
  const scenes = [...hero.querySelectorAll<HTMLElement>('[data-services-scene]')];
  const captions = [...hero.querySelectorAll<HTMLElement>('[data-services-caption]')];
  const selectors = [...hero.querySelectorAll<HTMLButtonElement>('[data-services-select]')];
  if (
    !stage ||
    !travel ||
    !emblem ||
    !wordmark ||
    !pause ||
    !pauseLabel ||
    scenes.length !== 5 ||
    captions.length !== 5 ||
    selectors.length !== 5
  )
    return;

  const controller = new AbortController();
  const { signal } = controller;
  const saved = memory.get(hero) ?? { userPaused: false, time: 0, index: 0, cycle: 0 };
  let gsap: Gsap | undefined;
  let timeline: Timeline | undefined;
  let context: Context | undefined;
  let observer: IntersectionObserver | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let resizeFrame = 0;
  let ticket = 0;
  let disposed = false;
  let enhanced = false;
  let configuring = false;
  let lastWidth = travel.clientWidth;
  let desktopClip = false;
  let wordWidth = 1;
  let wordLeft = 0;
  let logoRightPose = 0;
  const parts = [
    ...hero.querySelectorAll<SVGElement>('[data-services-part], [data-services-draw]'),
  ];
  const animated = [...scenes, ...parts, emblem, wordmark];
  const allows = () => !preference.matches && !connection?.saveData;
  const visibleNow = () => {
    const box = stage.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  };
  let inViewport = visibleNow();

  function reasons() {
    return servicesHeroPauseReasons({
      userPaused: saved.userPaused,
      focused: hero!.contains(document.activeElement),
      inViewport,
      documentHidden: document.hidden,
      reducedMotion: preference.matches,
      saveData: Boolean(connection?.saveData),
    });
  }

  function caption(index: number) {
    saved.index = index;
    hero!.dataset.servicesActive = String(index);
    captions.forEach((element, current) => {
      element.hidden = current !== index;
    });
    selectors.forEach((button, current) =>
      button.setAttribute('aria-pressed', String(current === index)),
    );
  }

  function updateFrame() {
    if (!timeline || !gsap) return;
    saved.time = timeline.time();
    const frame = servicesHeroFrame(saved.time);
    if (Number(hero!.dataset.servicesActive) !== frame.index) caption(frame.index);
    hero!.dataset.servicesPhase = frame.phase;
    hero!.dataset.servicesTime = saved.time.toFixed(3);
    hero!.dataset.servicesCycle = String(saved.cycle);
    // Desktop letters appear behind the advancing emblem's trailing edge,
    // rather than being covered by a logo crossing fully revealed typography.
    if (desktopClip && frame.phase === 'wordmark') {
      const x = Number(gsap.getProperty(emblem!, 'x')) || 0;
      const revealed = Math.max(0, Math.min(1, (logoRightPose + x - wordLeft - 18) / wordWidth));
      wordmark!.style.clipPath = `inset(0 ${(100 * (1 - revealed)).toFixed(3)}% 0 0)`;
    }
  }

  function playback() {
    if (disposed) return;
    const pausedFor = reasons();
    hero!.dataset.servicesPauseReasons = pausedFor.join(',');
    pause!.setAttribute('aria-pressed', String(saved.userPaused));
    pauseLabel!.textContent = saved.userPaused ? 'Play animation' : 'Pause animation';
    if (!enhanced || !timeline) {
      hero!.dataset.servicesState = configuring ? 'loading' : 'static';
      return;
    }
    if (pausedFor.length) timeline.pause();
    else timeline.play();
    hero!.dataset.servicesState = pausedFor.length ? 'paused' : 'playing';
  }

  function clearAnimation() {
    timeline?.pause();
    context?.revert();
    context = undefined;
    timeline = undefined;
    enhanced = false;
    for (const element of animated)
      for (const property of [
        'opacity',
        'visibility',
        'transform',
        'stroke-dasharray',
        'stroke-dashoffset',
        'clip-path',
      ])
        element.style.removeProperty(property);
  }

  function staticPose(index = saved.index) {
    clearAnimation();
    scenes.forEach((scene, current) => {
      scene.hidden = current !== index;
    });
    wordmark!.hidden = true;
    pause!.hidden = true;
    selectors.forEach((button) => {
      button.hidden = false;
    });
    caption(index);
    hero!.dataset.servicesPhase = 'service';
    hero!.dataset.servicesTime = servicesHeroPreviewTime(index).toFixed(3);
    hero!.dataset.servicesCycle = String(saved.cycle);
    hero!.dataset.servicesMode = 'static';
    playback();
  }

  function createTimeline() {
    if (!gsap || disposed) return;
    clearAnimation();
    scenes.forEach((scene) => {
      scene.hidden = false;
    });
    wordmark!.hidden = false;
    const distance = Math.max(0, travel!.clientWidth - emblem!.offsetWidth);
    desktopClip = matchMedia('(min-width: 640px)').matches;
    wordWidth = wordmark!.offsetWidth || 1;
    wordLeft = wordmark!.offsetLeft;
    logoRightPose = travel!.offsetLeft + distance;
    const engine = gsap;
    context = engine.context(() => {
      const sequence = engine.timeline({
        paused: true,
        repeat: -1,
        defaults: { ease: 'power2.out' },
        onUpdate: updateFrame,
        onRepeat: () => {
          saved.cycle += 1;
        },
      });
      timeline = sequence;
      sequence.set(scenes, { opacity: 0, visibility: 'visible' }, 0);
      sequence.set(scenes[0]!, { opacity: 1 }, 0);
      sequence.set(wordmark!, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, 0);
      sequence.set(emblem!, { x: 0 }, 0);
      sequence.to(scenes[0]!, { opacity: 0, duration: 0.25 }, 0.2);
      sequence.to(
        emblem!,
        { x: -distance, duration: servicesHeroTiming.sweepEnd, ease: 'power2.inOut' },
        0,
      );

      const part = (name: string) => [
        ...hero!.querySelectorAll<SVGElement>(`[data-services-part="${name}"]`),
      ];
      const enter = (name: string, at: number, from: Record<string, number>, duration = 0.6) => {
        const featureStart =
          servicesHeroTiming.featureStart +
          servicesHeroFrame(at).index * servicesHeroTiming.featureDuration;
        sequence.set(part(name), { ...from, opacity: 0 }, featureStart);
        sequence.fromTo(
          part(name),
          { ...from, opacity: 0 },
          { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration, immediateRender: false },
          at,
        );
      };
      const draw = (scene: HTMLElement, at: number, duration: number) => {
        const paths = scene.querySelectorAll<SVGPathElement>('[data-services-draw]');
        const featureStart =
          servicesHeroTiming.featureStart +
          scenes.indexOf(scene) * servicesHeroTiming.featureDuration;
        sequence.set(paths, { strokeDasharray: '1 1', strokeDashoffset: 1 }, featureStart);
        sequence.fromTo(
          paths,
          { strokeDasharray: '1 1', strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration, ease: 'none', autoRound: false, immediateRender: false },
          at,
        );
      };
      scenes.forEach((scene, index) => {
        const start = servicesHeroTiming.featureStart + index * servicesHeroTiming.featureDuration;
        sequence.fromTo(
          scene,
          { opacity: 0 },
          { opacity: 1, duration: 0.18, immediateRender: false },
          start,
        );
        sequence.to(
          scene,
          { opacity: 0, duration: 0.18 },
          start + servicesHeroTiming.featureDuration - 0.18,
        );
      });

      // Construction and sketch give way to the completed type/identity system.
      sequence.fromTo(
        part('identity-guides'),
        { opacity: 0.25, scale: 0.95 },
        { opacity: 0.8, scale: 1, duration: 0.4, immediateRender: false },
        1,
      );
      draw(scenes[0]!, 1, 0.7);
      sequence.fromTo(
        part('identity-sketch'),
        { opacity: 1 },
        { opacity: 0.12, duration: 0.5, immediateRender: false },
        1.75,
      );
      enter('identity-type', 1.5, { y: 18 }, 0.6);
      enter('identity-lockup', 1.85, { y: 12 }, 0.5);
      enter('identity-swatches', 1.8, { x: 28 }, 0.55);

      // A wireframe resolves into a desktop composition and companion screen.
      sequence.fromTo(
        part('digital-wireframe'),
        { opacity: 1 },
        { opacity: 0.14, duration: 0.8, immediateRender: false },
        3.1,
      );
      enter('digital-layout', 3.35, { scale: 0.96 }, 0.5);
      enter('digital-content', 3.65, { y: 14 }, 0.6);
      enter('digital-mobile', 4.05, { x: 28, y: 16, rotation: 4 }, 0.65);
      enter('digital-detail', 4.15, { x: -8 }, 0.5);

      // One campaign idea propagates into coordinated, differently sized outputs.
      enter('campaign-idea', 5.2, { scale: 0.7, rotation: -25 }, 0.45);
      draw(scenes[2]!, 5.25, 1);
      enter('campaign-poster', 5.45, { y: 22, rotation: 3 }, 0.6);
      enter('campaign-social', 5.8, { x: -36, y: 12, rotation: -7 }, 0.65);
      enter('campaign-banner', 6.15, { x: 35, y: 20, rotation: 5 }, 0.65);

      // Individual typographic fragments settle onto one clear editorial rhythm.
      enter('words-rules', 7.3, { scale: 0.98 }, 0.55);
      part('words-fragment').forEach((fragment, index) => {
        sequence.set(
          fragment,
          {
            x: [-32, 28, -18][index],
            y: [18, -16, 24][index],
            rotation: [-4, 3, -2][index],
            opacity: 0.35,
          },
          7.3,
        );
        sequence.fromTo(
          fragment,
          {
            x: [-32, 28, -18][index],
            y: [18, -16, 24][index],
            rotation: [-4, 3, -2][index],
            opacity: 0.35,
          },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.85, immediateRender: false },
          7.4 + index * 0.16,
        );
      });
      draw(scenes[3]!, 8.2, 0.65);
      enter('words-emphasis', 8.15, { x: -8 }, 0.6);

      // Colour, typography and texture are aligned into a deliberate whole.
      enter('direction-colour', 9.4, { x: -24, y: 12, rotation: -9 }, 0.85);
      enter('direction-type', 9.55, { y: -22, rotation: 6 }, 0.85);
      enter('direction-texture', 9.7, { x: 26, y: 18, rotation: 10 }, 0.85);
      enter('direction-composition', 10.05, { scale: 1.04 }, 0.8);
      draw(scenes[4]!, 10, 0.8);

      sequence.to(emblem!, { x: 0, duration: 1.8, ease: 'power2.inOut' }, 11.5);
      sequence.to(wordmark!, { opacity: 1, duration: 0.3 }, 11.65);
      if (!desktopClip)
        sequence.to(
          wordmark!,
          { clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: 'power2.inOut' },
          11.7,
        );
      sequence.set(wordmark!, { clipPath: 'inset(0 0% 0 0)' }, 13.3);
      sequence.to(wordmark!, { opacity: 0, duration: 0.3 }, 13.35);
      // End and start poses match, including the static first-scene artwork.
      sequence.set(
        parts.filter((node) => scenes[0]!.contains(node)),
        { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 },
        13.65,
      );
      sequence.set(
        scenes[0]!.querySelectorAll('[data-services-draw]'),
        { strokeDashoffset: 0 },
        13.65,
      );
      sequence.to(scenes[0]!, { opacity: 1, duration: 0.35 }, 13.65);
      sequence.to({}, { duration: 0.01 }, servicesHeroTiming.duration - 0.01);
    }, hero!);
    enhanced = true;
    hero!.dataset.servicesMode = 'animated';
    pause!.hidden = false;
    selectors.forEach((button) => {
      button.hidden = false;
    });
    timeline?.time(saved.time, true);
    updateFrame();
    playback();
  }

  async function configure() {
    const current = ++ticket;
    if (timeline) saved.time = timeline.time();
    configuring = false;
    staticPose();
    if (!allows()) return;
    configuring = true;
    playback();
    try {
      const library = await import('gsap');
      if (disposed || current !== ticket || !allows()) return;
      gsap = library.gsap;
      configuring = false;
      createTimeline();
    } catch {
      if (disposed || current !== ticket) return;
      configuring = false;
      staticPose();
      hero!.dataset.servicesState = 'error';
    }
  }

  // Bind controls before exposing them. Every failure path retains working links.
  selectors.forEach((button, index) =>
    button.addEventListener(
      'click',
      () => {
        saved.time = servicesHeroPreviewTime(index);
        caption(index);
        if (enhanced && timeline) {
          timeline.time(saved.time, true);
          updateFrame();
          playback();
        } else staticPose(index);
      },
      { signal },
    ),
  );
  pause.addEventListener(
    'click',
    () => {
      saved.userPaused = !saved.userPaused;
      playback();
    },
    { signal },
  );
  hero.addEventListener('focusin', playback, { signal });
  hero.addEventListener('focusout', () => queueMicrotask(playback), { signal });
  document.addEventListener('visibilitychange', playback, { signal });
  preference.addEventListener('change', () => void configure(), { signal });
  connection?.addEventListener?.('change', () => void configure(), { signal });
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.1;
        playback();
      },
      { threshold: [0, 0.1] },
    );
    observer.observe(stage);
  } else {
    const viewport = () => {
      inViewport = visibleNow();
      playback();
    };
    window.addEventListener('scroll', viewport, { passive: true, signal });
    window.addEventListener('resize', viewport, { signal });
  }
  const resize = () => {
    const width = travel.clientWidth;
    if (Math.abs(width - lastWidth) < 0.5) return;
    lastWidth = width;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (disposed || !enhanced || !timeline) return;
      saved.time = timeline.time();
      createTimeline();
    });
  };
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(travel);
  } else window.addEventListener('resize', resize, { signal });
  dispose = () => {
    if (disposed) return;
    disposed = true;
    ticket += 1;
    if (timeline) saved.time = timeline.time();
    memory.set(hero, saved);
    clearAnimation();
    controller.abort();
    observer?.disconnect();
    resizeObserver?.disconnect();
    cancelAnimationFrame(resizeFrame);
    scenes.forEach((scene, index) => {
      scene.hidden = index !== saved.index;
    });
    captions.forEach((element, index) => {
      element.hidden = index !== saved.index;
    });
    wordmark.hidden = true;
    pause.hidden = true;
    selectors.forEach((button) => {
      button.hidden = true;
    });
    hero.dataset.servicesState = 'static';
    hero.dataset.servicesMode = 'static';
  };
  void configure();
}

initialize();
document.addEventListener('astro:page-load', initialize, { signal: lifecycle.signal });
document.addEventListener('astro:before-swap', stop, { signal: lifecycle.signal });
window.addEventListener('pagehide', stop, { signal: lifecycle.signal });
window.addEventListener('pageshow', initialize, { signal: lifecycle.signal });
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    stop();
    lifecycle.abort();
  });
