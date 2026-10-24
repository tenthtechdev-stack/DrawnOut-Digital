/**
 * The closing reference-composite study. The supplied hand/plaque is deliberately
 * kept intact: these transforms are choreography, not a claimed anatomical rig.
 */
import { allowsMotion } from '../lib/motion-policy';

type Connection = EventTarget & { saveData?: boolean };
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
let generation = 0;
let activeFooter: HTMLElement | undefined;
let dispose: (() => void) | undefined;

function stop() {
  generation += 1;
  dispose?.();
  dispose = undefined;
  activeFooter = undefined;
}

async function start() {
  const footer = document.querySelector<HTMLElement>('[data-site-footer]');
  if (!footer || footer === activeFooter) return;
  stop();
  activeFooter = footer;
  footer.dataset.footerMotion = 'static';
  if (
    !allowsMotion({ reducedMotion: preference.matches, saveData: Boolean(connection?.saveData) })
  ) {
    return;
  }
  const ticket = generation;
  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (ticket !== generation || !footer.isConnected) return;
    gsap.registerPlugin(ScrollTrigger);
    const signature = footer.querySelector<HTMLElement>('[data-footer-signature]');
    const composite = footer.querySelector<HTMLElement>('[data-signature-composite]');
    const frame = footer.querySelector<HTMLElement>('[data-signature-frame]');
    const atmosphere = footer.querySelector<HTMLElement>('[data-footer-atmosphere]');
    if (!signature || !composite || !frame || !atmosphere) return;

    const context = gsap.context(() => {
      const mobile = () => window.innerWidth < 768;
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      timeline
        .fromTo(
          composite,
          { yPercent: 38, opacity: 0.3 },
          { yPercent: 0, opacity: 1, duration: 0.48 },
          0,
        )
        .fromTo(
          frame,
          { yPercent: -65, opacity: 0 },
          { yPercent: 0, opacity: 0.5, duration: 0.38 },
          0.08,
        )
        .fromTo(
          signature,
          { scale: 0.78, xPercent: 4 },
          { scale: 1, xPercent: 0, duration: 0.48 },
          0,
        )
        .to(signature, { scale: () => (mobile() ? 1.2 : 1.38), xPercent: -8, duration: 0.38 }, 0.62)
        .fromTo(
          atmosphere,
          { opacity: 0.25, scale: 0.8 },
          { opacity: 1, scale: 1.15, duration: 0.5 },
          0.5,
        );

      const sync = (progress: number) => {
        footer.dataset.footerProgress = progress.toFixed(4);
        footer.dataset.footerPhase =
          progress < 0.48 ? 'arrive' : progress < 0.62 ? 'hold' : 'expand';
      };
      const trigger = ScrollTrigger.create({
        id: 'drawnout-signature-footer',
        trigger: footer,
        start: 'top 92%',
        end: 'bottom bottom',
        animation: timeline,
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => sync(self.progress),
        onRefresh: (self) => sync(self.progress),
      });
      footer.dataset.footerMotion = 'ready';
      sync(trigger.progress);
    }, footer);
    const refresh = () => ScrollTrigger.refresh();
    const image = composite.querySelector('img');
    if (image && !image.complete) image.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(() => {
      if (ticket === generation) refresh();
    });
    dispose = () => {
      image?.removeEventListener('load', refresh);
      context.revert();
      footer.dataset.footerMotion = 'static';
      delete footer.dataset.footerProgress;
      delete footer.dataset.footerPhase;
    };
  } catch {
    // The static reference and every contact/navigation link remain available.
    footer.dataset.footerMotion = 'static';
  }
}

function restart() {
  stop();
  void start();
}

preference.addEventListener('change', restart);
connection?.addEventListener('change', restart);
document.addEventListener('astro:before-swap', stop);
const onPageLoad = () => void start();
const onPageShow = (event: PageTransitionEvent) => {
  if (event.persisted) void start();
};
document.addEventListener('astro:page-load', onPageLoad);
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', onPageShow);
void start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stop();
    preference.removeEventListener('change', restart);
    connection?.removeEventListener('change', restart);
    document.removeEventListener('astro:before-swap', stop);
    document.removeEventListener('astro:page-load', onPageLoad);
    window.removeEventListener('pagehide', stop);
    window.removeEventListener('pageshow', onPageShow);
  });
}
