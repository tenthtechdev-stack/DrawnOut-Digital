let disposeHeader: (() => void) | undefined;

function initializeNavigation() {
  disposeHeader?.();

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const trigger = header?.querySelector<HTMLButtonElement>('[data-menu-trigger]');
  const dialog = header?.querySelector<HTMLDialogElement>('[data-site-menu]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-menu-close]');
  const fallback = header?.querySelector<HTMLDetailsElement>('[data-menu-fallback]');
  if (!header || !trigger || !dialog || !closeButton || typeof dialog.showModal !== 'function')
    return;

  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia('(min-width: 64rem)');
  let originalOverflow: string | undefined;

  const releaseScroll = () => {
    if (originalOverflow !== undefined) {
      document.body.style.overflow = originalOverflow;
      originalOverflow = undefined;
    }
    trigger.setAttribute('aria-expanded', 'false');
  };
  const closeMenu = () => {
    if (dialog.open) dialog.close();
    releaseScroll();
  };

  // The native disclosure already reserves this control's footprint and works
  // before JS, with JS disabled, or if this module fails to load. Switching to
  // the dialog never adds or removes an in-flow navigation row.
  const fallbackWasOpen = fallback?.open ?? false;
  const fallbackHadFocus = fallback?.contains(document.activeElement) ?? false;
  if (fallback) fallback.open = false;
  header.setAttribute('data-enhanced', '');
  trigger.hidden = false;

  const openMenu = () => {
    if (desktop.matches || dialog.open) return;
    dialog.showModal();
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  };

  trigger.addEventListener('click', openMenu, { signal });

  closeButton.addEventListener('click', closeMenu, { signal });
  dialog.addEventListener(
    'keydown',
    (event) => {
      if (!dialog.open || event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey)
        return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(':disabled, [inert]') &&
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== 'hidden',
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      const active = document.activeElement;
      // Keep focus in page content rather than letting Chromium's final Tab move
      // into browser chrome. Escape remains the native dialog behavior.
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        (last ?? closeButton).focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        (first ?? closeButton).focus();
      }
    },
    { signal },
  );
  dialog.addEventListener(
    'close',
    () => {
      releaseScroll();
      if (header.isConnected) {
        if (desktop.matches)
          header
            .querySelector<HTMLAnchorElement>('.primary-nav a[aria-current], .primary-nav a')
            ?.focus();
        else trigger.focus();
      }
    },
    { signal },
  );
  dialog.addEventListener(
    'click',
    (event) => {
      if ((event.target as HTMLElement).closest('a')) {
        closeMenu();
        return;
      }
      const bounds = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom)
      )
        closeMenu();
    },
    { signal },
  );
  // Native dialog handles Escape; close releases our scroll lock.
  desktop.addEventListener(
    'change',
    () => {
      if (desktop.matches) closeMenu();
    },
    { signal },
  );

  const sentinel = document.querySelector<HTMLElement>('[data-header-sentinel]');
  const observer =
    sentinel && 'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            header.toggleAttribute('data-scrolled', entry ? !entry.isIntersecting : false);
          },
          { threshold: 0 },
        )
      : undefined;
  if (sentinel) observer?.observe(sentinel);

  // A slow module may finish while the native menu is in use. Keep that
  // interaction open and move focus into the enhanced menu rather than hiding it.
  if (fallbackWasOpen) openMenu();
  else if (fallbackHadFocus) trigger.focus();

  disposeHeader = () => {
    controller.abort();
    observer?.disconnect();
    closeMenu();
    header.removeAttribute('data-enhanced');
    trigger.hidden = true;
  };
}

initializeNavigation();
document.addEventListener('astro:page-load', initializeNavigation);
const beforeSwap = () => disposeHeader?.();
document.addEventListener('astro:before-swap', beforeSwap);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeHeader?.();
    document.removeEventListener('astro:page-load', initializeNavigation);
    document.removeEventListener('astro:before-swap', beforeSwap);
  });
}
