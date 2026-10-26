import {
  enquiryAccepted,
  enquiryFields,
  enquiryLabels,
  formspreeEndpoint,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryValues,
} from '../lib/contact-form';

function enhanceEnquiry(form: HTMLFormElement) {
  if (form.dataset.enhanced) return;
  const section = form.closest<HTMLElement>('[data-form-state]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit-enquiry]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const fields = form.querySelector<HTMLFieldSetElement>('[data-enquiry-fields]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  const summaryList = summary?.querySelector('ul');
  const again = form.querySelector<HTMLButtonElement>('[data-new-enquiry]');
  const failureHelp = form.querySelector<HTMLElement>('[data-failure-help]');
  const unavailable = section?.querySelector<HTMLElement>('[data-form-unconfigured]');
  if (
    !section ||
    !submit ||
    !submitLabel ||
    !fields ||
    !status ||
    !summary ||
    !summaryList ||
    !again ||
    !failureHelp
  )
    return;

  const controls = new Map<
    EnquiryField,
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >();
  for (const name of enquiryFields) {
    const element = form.elements.namedItem(name);
    if (!(
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ))
      return;
    controls.set(name, element);
  }
  const endpoint = formspreeEndpoint(form.dataset.endpoint);
  let pending = false;
  let accepted = false;
  let errors: EnquiryErrors = {};
  let request: AbortController | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  // Native constraint validation remains available when JavaScript does not load.
  form.noValidate = true;
  form.dataset.enhanced = 'true';
  section.dataset.formState = endpoint ? 'ready' : 'unconfigured';
  submit.disabled = !endpoint;
  if (endpoint) {
    form.action = endpoint;
    submit.removeAttribute('aria-describedby');
    if (unavailable) unavailable.hidden = true;
  }

  const values = (): EnquiryValues =>
    Object.fromEntries(
      enquiryFields.map((name) => [name, controls.get(name)!.value]),
    ) as EnquiryValues;

  const showErrors = (next: EnquiryErrors) => {
    errors = Object.fromEntries(Object.entries(next).filter(([, message]) => Boolean(message)));
    summaryList.replaceChildren();
    for (const name of enquiryFields) {
      const control = controls.get(name)!;
      const message = form.querySelector<HTMLElement>(`#${control.id}-error`);
      const error = errors[name];
      control.toggleAttribute('aria-invalid', false);
      if (error) control.setAttribute('aria-invalid', 'true');
      if (message) {
        message.textContent = error ?? '';
        message.hidden = !error;
      }
      if (error) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${control.id}`;
        link.textContent = `${enquiryLabels[name]}: ${error}`;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          control.focus();
        });
        item.append(link);
        summaryList.append(item);
      }
    }
    summary.hidden = !Object.keys(errors).length;
  };

  const setPending = (value: boolean) => {
    pending = value;
    form.setAttribute('aria-busy', String(value));
    fields.disabled = value || accepted;
    submit.disabled = value || accepted || !endpoint;
    submitLabel.textContent = value ? 'Sending…' : 'Send enquiry';
  };

  const fail = (message: string) => {
    section.dataset.formState = 'error';
    status.textContent = message;
    failureHelp.hidden = false;
    status.focus();
  };

  for (const [name, control] of controls) {
    const reconsider = () => {
      if (!errors[name]) return;
      const checked = validateEnquiry(values());
      showErrors({ ...errors, [name]: checked[name] });
    };
    control.addEventListener('input', reconsider);
    control.addEventListener('change', reconsider);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || accepted) return;
    if (!endpoint) {
      status.textContent = 'The enquiry form is not connected yet. Please email us directly.';
      failureHelp.hidden = false;
      return;
    }
    status.textContent = '';
    failureHelp.hidden = true;
    const current = values();
    const validation = validateEnquiry(current);
    showErrors(validation);
    if (Object.keys(validation).length) {
      summary.focus();
      return;
    }
    const trap = form.elements.namedItem('_gotcha');
    if (trap instanceof HTMLInputElement && trap.value) {
      fail('This enquiry could not be submitted. Please use the email link below.');
      return;
    }
    const payload = new FormData(form);
    for (const name of enquiryFields) payload.set(name, current[name].trim());
    // Formspree uses the email field as Reply-To. Recipient is controlled in its account.
    request = new AbortController();
    timeout = setTimeout(() => request?.abort(), 15000);
    section.dataset.formState = 'submitting';
    setPending(true);
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
        signal: request.signal,
        credentials: 'omit',
      });
      const result: unknown = await response.json().catch(() => null);
      if (disposed) return;
      if (!response.ok || !enquiryAccepted(result)) {
        fail(
          response.status === 429
            ? 'The form service is receiving too many requests. Please wait before trying again, or email us directly.'
            : 'The form service did not confirm your enquiry. Your details are still here. Please try again or email us directly.',
        );
        return;
      }
      accepted = true;
      section.dataset.formState = 'success';
      status.textContent =
        'Enquiry received. Our form service has accepted your message. Thank you — we’ll be in touch using the details you provided.';
      again.hidden = false;
      status.focus();
    } catch {
      if (!disposed) {
        fail(
          'We couldn’t confirm whether your enquiry was received. Your details are still here. To avoid sending it twice, please email us before retrying.',
        );
      }
    } finally {
      clearTimeout(timeout);
      timeout = undefined;
      request = undefined;
      if (!disposed) setPending(false);
    }
  });

  again.addEventListener('click', () => {
    if (pending) return;
    accepted = false;
    form.reset();
    showErrors({});
    status.textContent = '';
    failureHelp.hidden = true;
    again.hidden = true;
    section.dataset.formState = 'ready';
    setPending(false);
    controls.get('name')!.focus();
  });

  const cleanup = () => {
    disposed = true;
    request?.abort();
    clearTimeout(timeout);
  };
  window.addEventListener('pagehide', cleanup, { once: true });
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    disposed = false;
    if (pending) {
      setPending(false);
      fail(
        'The page was restored before a submission could be confirmed. Please email us before retrying.',
      );
    }
  });
}

function initializeEnquiries() {
  document.querySelectorAll<HTMLFormElement>('[data-enquiry-form]').forEach(enhanceEnquiry);
}
initializeEnquiries();
document.addEventListener('astro:page-load', initializeEnquiries);
