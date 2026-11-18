import {
  enquiryPuzzlePhase,
  enquiryPuzzlePauseReasons,
  enquiryPuzzleTiming,
} from '../lib/enquiry-puzzle-policy';

type Gsap = (typeof import('gsap'))['gsap'];
type Timeline = ReturnType<Gsap['timeline']>;
type Context = ReturnType<Gsap['context']>;
type Connection = EventTarget & { saveData?: boolean };

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let dispose: (() => void) | undefined;
let current: HTMLElement | undefined;

function initialize() {
  const root = document.querySelector<HTMLElement>('[data-enquiry-puzzle]');
  if (root === current && dispose) return;
  dispose?.();
  current = root ?? undefined;
  if (!root) return;
  const stage = root.querySelector<HTMLElement>('[data-enquiry-stage]');
  const thread = root.querySelector<SVGPathElement>('[data-enquiry-thread]');
  const guides = [...root.querySelectorAll<SVGPathElement>('[data-enquiry-draw]')];
  const pieces = [...root.querySelectorAll<SVGGElement>('[data-enquiry-piece]')];
  const emblem = root.querySelector<SVGGElement>('[data-enquiry-emblem]');
  const pause = root.querySelector<HTMLButtonElement>('[data-enquiry-pause]');
  const pauseLabel = root.querySelector<HTMLElement>('[data-enquiry-pause-label]');
  if (!stage || !thread || !emblem || !pause || !pauseLabel || pieces.length !== 5) return;

  const events = new AbortController();
  const { signal } = events;
  let observer: IntersectionObserver | undefined;
  let timeline: Timeline | undefined;
  let context: Context | undefined;
  let pending = false;
  let disposed = false;
  let inViewport = false;
  let userPaused = false;
  let cycle = 0;
  let ticket = 0;
  const allows = () => !preference.matches && !connection?.saveData;

  function playback() {
    if (disposed) return;
    const reasons = enquiryPuzzlePauseReasons({
      inViewport,
      documentHidden: document.hidden,
      userPaused,
      focused: root!.contains(document.activeElement),
    });
    root!.dataset.enquiryPauseReasons = reasons.join(',');
    pause!.setAttribute('aria-pressed', String(userPaused));
    pauseLabel!.textContent = userPaused ? 'Play motion' : 'Pause motion';
    if (!timeline) return;
    if (reasons.length) timeline.pause();
    else timeline.play();
    root!.dataset.enquiryState = reasons.length ? 'paused' : 'playing';
  }

  function staticPose() {
    ticket += 1;
    timeline?.pause();
    context?.revert();
    context = undefined;
    timeline = undefined;
    pending = false;
    root!.dataset.enquiryState = 'static';
    root!.dataset.enquiryPhase = 'direction';
    delete root!.dataset.enquiryTime;
    pause!.hidden = true;
  }

  async function enhance() {
    if (disposed || pending || timeline || !allows() || !inViewport || document.hidden) return;
    pending = true;
    const attempt = ++ticket;
    try {
      const { gsap } = await import('gsap');
      if (disposed || attempt !== ticket || !allows()) return;
      context = gsap.context(() => {
        const shifts = pieces.map((piece) => {
          const [x = 0, y = 0, rotation = 0] = (piece.dataset.enquiryShift ?? '')
            .split(',')
            .map(Number);
          return { x, y, rotation };
        });
        const threadLength = thread!.getTotalLength();
        gsap.set(thread!, {
          strokeDasharray: threadLength,
          strokeDashoffset: threadLength,
          opacity: 0.85,
        });
        guides.forEach((guide) => {
          const length = guide.getTotalLength();
          gsap.set(guide, { strokeDasharray: length, strokeDashoffset: length });
        });
        pieces.forEach((piece, index) =>
          gsap.set(piece, { ...shifts[index], transformOrigin: '50% 50%' }),
        );
        gsap.set(emblem!, { scale: 0.92, opacity: 0.42, transformOrigin: '50% 50%' });
        timeline = gsap.timeline({
          paused: true,
          repeat: -1,
          onRepeat: () => {
            cycle += 1;
            root!.dataset.enquiryCycle = String(cycle);
          },
          onUpdate: () => {
            const time = timeline?.time() ?? 0;
            root!.dataset.enquiryTime = time.toFixed(3);
            root!.dataset.enquiryPhase = enquiryPuzzlePhase(time);
          },
        });
        // The moving trace reaches the independent fragments before they align.
        timeline.to(thread!, { strokeDashoffset: 0, duration: 2.5, ease: 'power1.inOut' }, 1.1);
        pieces.forEach((piece, index) => {
          timeline!.to(
            piece,
            { x: 0, y: 0, rotation: 0, duration: 1.15, ease: 'power3.inOut' },
            1.9 + index * 0.32,
          );
        });
        timeline.to(
          guides,
          { strokeDashoffset: 0, duration: 1.1, stagger: 0.11, ease: 'power2.inOut' },
          3.1,
        );
        timeline.to(emblem!, { scale: 1, opacity: 1, duration: 1.15, ease: 'power2.out' }, 3.45);
        timeline.to(thread!, { opacity: 0.55, duration: 0.65 }, 4.35);
        // A real hold. Returning parts overlap gently instead of popping to frame zero.
        pieces.forEach((piece, index) => {
          timeline!.to(
            piece,
            { ...shifts[index], duration: 1.05, ease: 'power2.inOut' },
            6.45 + index * 0.055,
          );
        });
        timeline.to(
          guides,
          {
            strokeDashoffset: (_: number, element: SVGPathElement) => element.getTotalLength(),
            duration: 0.9,
            stagger: 0.05,
            ease: 'power2.inOut',
          },
          6.6,
        );
        timeline.to(
          thread!,
          { strokeDashoffset: threadLength, opacity: 0.85, duration: 1.15, ease: 'power2.inOut' },
          6.6,
        );
        timeline.to(
          emblem!,
          { scale: 0.92, opacity: 0.42, duration: 1.05, ease: 'power2.inOut' },
          6.65,
        );
        timeline.to({}, { duration: enquiryPuzzleTiming.duration }, 0);
      }, root!);
      pause!.hidden = false;
      root!.dataset.enquiryCycle = String(cycle);
      playback();
    } catch {
      // The complete illustration and permanent link are already rendered by Astro.
      staticPose();
    } finally {
      if (attempt === ticket) pending = false;
    }
  }

  function preferences() {
    if (!allows()) staticPose();
    else void enhance();
  }
  function visibility() {
    if (!document.hidden && !timeline) void enhance();
    playback();
  }
  staticPose();
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
        if (inViewport) void enhance();
        playback();
      },
      { threshold: [0, 0.35, 0.65] },
    );
    observer.observe(stage);
  }
  pause.addEventListener(
    'click',
    () => {
      userPaused = !userPaused;
      playback();
    },
    { signal },
  );
  root.addEventListener('focusin', playback, { signal });
  root.addEventListener('focusout', () => queueMicrotask(playback), { signal });
  document.addEventListener('visibilitychange', visibility, { signal });
  preference.addEventListener('change', preferences, { signal });
  connection?.addEventListener('change', preferences, { signal });
  dispose = () => {
    disposed = true;
    events.abort();
    observer?.disconnect();
    staticPose();
  };
}

initialize();
document.addEventListener('astro:page-load', initialize);
document.addEventListener('astro:before-swap', () => {
  dispose?.();
  dispose = undefined;
  current = undefined;
});
