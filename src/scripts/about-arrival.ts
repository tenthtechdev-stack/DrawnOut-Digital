/**
 * Lightweight acknowledgement for the parser-owned native About arrival.
 * It intentionally has no imports: editorial GSAP and image.decode promises
 * must not compete with the bounded first-paint fallback.
 */
const lifecycle = new AbortController();
function acknowledge() {
  const hero = document.querySelector<HTMLElement>('[data-about-hero]');
  if (hero?.dataset.aboutBoot === 'pending') hero.dispatchEvent(new Event('about:boot-handoff'));
}
acknowledge();
document.addEventListener('astro:page-load', acknowledge, { signal: lifecycle.signal });
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    lifecycle.abort();
    document
      .querySelector('[data-about-hero]')
      ?.dispatchEvent(new CustomEvent('about:arrival-release', { detail: { reason: 'cleanup' } }));
  });
