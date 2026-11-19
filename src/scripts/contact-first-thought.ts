import {
  contactThoughtDuration,
  contactThoughtPauseReasons,
  contactThoughtPhase,
} from '../lib/contact-thought-policy';

type Gsap = (typeof import('gsap'))['gsap'];
type Timeline = ReturnType<Gsap['timeline']>;
type Context = ReturnType<Gsap['context']>;
type Connection = EventTarget & { saveData?: boolean };

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let current: HTMLElement | undefined;
let dispose: (() => void) | undefined;

function stop() {
  dispose?.();
  dispose = undefined;
  current = undefined;
}

function initialize() {
  const root = document.querySelector<HTMLElement>('[data-first-thought]');
  if (root === current && dispose) return;
  stop();
  current = root ?? undefined;
  if (!root) return;

  const stroke = root.querySelector<SVGPathElement>('[data-thought-stroke]');
  const tip = root.querySelector<SVGCircleElement>('[data-thought-tip]');
  const seed = root.querySelector<SVGCircleElement>('[data-thought-seed]');
  const invitation = root.querySelector<SVGPathElement>('[data-thought-invitation]');
  const marks = [...root.querySelectorAll<SVGGElement>('[data-thought-mark]')];
  const note = root.querySelector<HTMLElement>('[data-thought-note]');
  if (!stroke || !tip || !seed || !invitation || !note || marks.length !== 2) return;

  const events = new AbortController();
  const { signal } = events;
  let observer: IntersectionObserver | undefined;
  let timeline: Timeline | undefined;
  let context: Context | undefined;
  let pending = false;
  let disposed = false;
  let settled = false;
  let inViewport = false;
  let ticket = 0;
  const allowsMotion = () => !preference.matches && !connection?.saveData;
  const formFocused = () =>
    document.activeElement instanceof Element &&
    Boolean(document.activeElement.closest('[data-enquiry-form]'));

  function settle(reason: string) {
    ticket += 1;
    settled = true;
    pending = false;
    timeline?.pause();
    context?.revert();
    timeline = undefined;
    context = undefined;
    // The server-rendered pose remains the one source of the completed artwork.
    tip!.setAttribute('cx', '499');
    tip!.setAttribute('cy', '253');
    root!.dataset.thoughtState = 'settled';
    root!.dataset.thoughtPhase = 'conversation';
    root!.dataset.thoughtTime = String(contactThoughtDuration);
    root!.dataset.thoughtReason = reason;
    root!.dataset.thoughtPlayed = 'true';
    delete root!.dataset.thoughtPauseReasons;
    observer?.disconnect();
    observer = undefined;
  }

  function playback() {
    if (disposed || settled) return;
    if (!allowsMotion()) {
      settle(preference.matches ? 'reduced-motion' : 'save-data');
      return;
    }
    if (formFocused()) {
      settle('form-focus');
      return;
    }
    const reasons = contactThoughtPauseReasons(inViewport, document.hidden);
    root!.dataset.thoughtPauseReasons = reasons.join(',');
    if (!timeline) {
      if (!pending && !reasons.length) void enhance();
      return;
    }
    timeline.paused(Boolean(reasons.length));
    root!.dataset.thoughtState = reasons.length ? 'paused' : 'playing';
    root!.dataset.thoughtReason = reasons.length ? reasons.join(',') : 'visible';
  }

  async function enhance() {
    if (pending || timeline || settled || disposed) return;
    pending = true;
    const attempt = ++ticket;
    root!.dataset.thoughtState = 'loading';
    try {
      const { gsap } = await import('gsap');
      if (disposed || settled || attempt !== ticket) return;
      if (!allowsMotion() || formFocused()) {
        settle(formFocused() ? 'form-focus' : preference.matches ? 'reduced-motion' : 'save-data');
        return;
      }
      if (!inViewport || document.hidden) {
        root!.dataset.thoughtState = 'ready';
        return;
      }

      const length = stroke!.getTotalLength();
      const drawing = { progress: 0 };
      context = gsap.context(() => {
        // Only decorative SVG elements are enhanced. Nothing in the page or
        // form waits for this import, timeline, first frame or completion.
        gsap.set(stroke!, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(seed!, { opacity: 0, scale: 0.65, transformOrigin: '50% 50%' });
        gsap.set(tip!, { opacity: 0 });
        gsap.set(marks[0]!, { opacity: 0, x: -5, y: 5 });
        gsap.set(marks[1]!, { opacity: 0, x: 9, y: -6 });
        gsap.set(invitation!, { opacity: 0, x: -7 });
        gsap.set(note!, { y: 4 });
        timeline = gsap.timeline({
          paused: true,
          onUpdate: () => {
            const distance = drawing.progress * length;
            const point = stroke!.getPointAtLength(distance);
            stroke!.style.strokeDashoffset = String(length - distance);
            tip!.setAttribute('cx', String(point.x));
            tip!.setAttribute('cy', String(point.y));
            const time = timeline?.time() ?? 0;
            root!.dataset.thoughtTime = time.toFixed(3);
            root!.dataset.thoughtPhase = contactThoughtPhase(time);
          },
          onComplete: () => settle('complete'),
        });
        // A short exploratory knot opens into one confident connected line.
        timeline
          .to(seed!, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0)
          .to(tip!, { opacity: 1, duration: 0.2 }, 0.08)
          .to(drawing, { progress: 0.12, duration: 1.05, ease: 'sine.inOut' }, 0.08)
          .to(marks[0]!, { opacity: 0.42, x: 0, y: 0, duration: 0.65 }, 0.45)
          .to(drawing, { progress: 0.87, duration: 2.5, ease: 'power1.inOut' }, 1.15)
          .to(marks[1]!, { opacity: 0.42, x: 0, y: 0, duration: 0.8 }, 3.05)
          .to(drawing, { progress: 1, duration: 0.8, ease: 'power3.out' }, 3.7)
          .to(invitation!, { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' }, 3.85)
          .to(note!, { y: 0, duration: 0.8, ease: 'power2.out' }, 4);
      }, root!);
      root!.dataset.thoughtPlayed = 'true';
      root!.dataset.thoughtTime = '0';
      root!.dataset.thoughtPhase = 'thought';
      playback();
    } catch {
      if (!disposed && attempt === ticket) settle('animation-error');
    } finally {
      if (attempt === ticket) pending = false;
    }
  }

  dispose = () => {
    if (disposed) return;
    settle('navigation');
    disposed = true;
    events.abort();
    observer?.disconnect();
  };
  root.dataset.thoughtEnhanced = 'true';
  if (root.dataset.thoughtPlayed === 'true') {
    settle('restored');
    return;
  }
  if (!allowsMotion()) {
    settle(preference.matches ? 'reduced-motion' : 'save-data');
    return;
  }
  if (formFocused()) {
    settle('form-focus');
    return;
  }
  if (!('IntersectionObserver' in window)) {
    settle('unsupported-observer');
    return;
  }

  root.dataset.thoughtState = 'ready';
  root.dataset.thoughtReason = 'waiting-for-view';
  observer = new IntersectionObserver(
    ([entry]) => {
      inViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.2);
      playback();
    },
    { threshold: [0, 0.2, 0.5] },
  );
  observer.observe(root);
  document.addEventListener('visibilitychange', playback, { signal });
  document.addEventListener(
    'focusin',
    (event) => {
      if (event.target instanceof Element && event.target.closest('[data-enquiry-form]'))
        settle('form-focus');
    },
    { signal },
  );
  preference.addEventListener('change', playback, { signal });
  connection?.addEventListener?.('change', playback, { signal });
}

initialize();
document.addEventListener('astro:page-load', initialize);
document.addEventListener('astro:before-swap', stop);
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) initialize();
});
