import { capabilities } from '../data/site';

export const enquiryServices = [
  ...capabilities.map(({ id, title }) => ({ value: id, label: title })),
  { value: 'not-sure', label: 'Something else / not sure yet' },
];

export const enquiryLimits = {
  name: 100,
  email: 254,
  service: 80,
  description: 5000,
  company: 160,
  phone: 50,
  budget: 100,
} as const;

export type EnquiryField = keyof typeof enquiryLimits;
export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export const enquiryLabels: Record<EnquiryField, string> = {
  name: 'Name',
  email: 'Email',
  service: 'Project type or service',
  description: 'Project description',
  company: 'Company / organization',
  phone: 'Phone / WhatsApp',
  budget: 'Approximate budget',
};

export const enquiryFields = Object.keys(enquiryLimits) as EnquiryField[];

/** Public form IDs only. Recipient and spam controls belong in the owner's account. */
export function formspreeEndpoint(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'formspree.io' ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/^\/f\/[a-zA-Z0-9]+$/.test(url.pathname)
    )
      return;
    return url.href;
  } catch {
    return;
  }
}

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const name of enquiryFields) {
    const value = values[name].trim();
    if (['name', 'email', 'service', 'description'].includes(name) && !value) {
      errors[name] =
        `Please enter ${name === 'service' ? 'a project type or service' : name === 'description' ? 'a project description' : `your ${name}`}.`;
    } else if (values[name].length > enquiryLimits[name]) {
      errors[name] = `Use ${enquiryLimits[name]} characters or fewer.`;
    }
  }
  const email = values.email.trim();
  if (email && !errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter an email address like name@example.com.';
  }
  if (
    values.service.trim() &&
    !errors.service &&
    !enquiryServices.some(({ value }) => value === values.service.trim())
  ) {
    errors.service = 'Choose a project type or service from the list.';
  }
  return errors;
}

/** A 2xx alone is not evidence that Formspree accepted the enquiry. */
export function enquiryAccepted(response: unknown): boolean {
  if (typeof response !== 'object' || response === null || Reflect.get(response, 'ok') !== true)
    return false;
  const errors = Reflect.get(response, 'errors');
  return (
    !Reflect.get(response, 'error') && (!errors || (Array.isArray(errors) && errors.length === 0))
  );
}
