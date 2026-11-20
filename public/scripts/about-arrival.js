/* global document, HTMLElement, Event */
// This tiny acknowledgement is intentionally external: a blocked or delayed
// script must leave the parser-owned arrival's existing 550ms fallback active.
function acknowledge() {
  const hero = document.querySelector('[data-about-hero]');
  if (hero instanceof HTMLElement && hero.dataset.aboutBoot === 'pending')
    hero.dispatchEvent(new Event('about:boot-handoff'));
}
acknowledge();
document.addEventListener('astro:page-load', acknowledge);
