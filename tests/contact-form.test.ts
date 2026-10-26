import assert from 'node:assert/strict';
import test from 'node:test';
import {
  enquiryAccepted,
  enquiryFields,
  enquiryLimits,
  formspreeEndpoint,
  validateEnquiry,
  type EnquiryValues,
} from '../src/lib/contact-form';

const valid: EnquiryValues = {
  name: 'Sam Rivera',
  email: 'sam@example.com',
  service: 'brand-identity',
  description: 'A visual identity for a community project.',
  company: '',
  phone: '',
  budget: '',
};

test('contact configuration only accepts a public HTTPS Formspree form endpoint', () => {
  assert.equal(
    formspreeEndpoint(' https://formspree.io/f/contacttestfixture '),
    'https://formspree.io/f/contacttestfixture',
  );
  for (const candidate of [
    undefined,
    '',
    'not a url',
    'http://formspree.io/f/example',
    'https://formspree.io/official@drawnoutdigital.com',
    'https://formspree.io.evil.example/f/example',
    'https://example.com/f/example',
    'https://formspree.io:444/f/example',
    'https://user:secret@formspree.io/f/example',
    'https://formspree.io/f/example?recipient=somewhere',
    'https://formspree.io/f/example#hash',
    'https://formspree.io/f/example/extra',
    'javascript:alert(1)',
  ])
    assert.equal(formspreeEndpoint(candidate), undefined);
});

test('enquiry validation accepts optional omissions and trimmed required values', () => {
  assert.deepEqual(validateEnquiry(valid), {});
  assert.deepEqual(
    validateEnquiry({ ...valid, name: ' Sam ', email: ' sam@example.com ', service: 'not-sure' }),
    {},
  );
  assert.deepEqual(
    validateEnquiry({
      ...valid,
      company: 'Example',
      phone: '+92 300 0000000',
      budget: 'PKR 250,000–500,000',
    }),
    {},
  );
});

test('enquiry validation rejects whitespace-only required fields and invalid email/service', () => {
  const errors = validateEnquiry({
    ...valid,
    name: '  ',
    email: ' ',
    service: '',
    description: '\n ',
  });
  assert.deepEqual(Object.keys(errors).sort(), ['description', 'email', 'name', 'service']);
  for (const email of [
    'name',
    'name@',
    '@example.com',
    'a b@example.com',
    'a@example',
    'a@@example.com',
  ]) {
    assert.ok(validateEnquiry({ ...valid, email }).email, email);
  }
  assert.ok(validateEnquiry({ ...valid, service: 'invented-service' }).service);
});

test('every enquiry text field enforces its input limit independently', () => {
  for (const field of enquiryFields) {
    const errors = validateEnquiry({ ...valid, [field]: 'x'.repeat(enquiryLimits[field] + 1) });
    assert.match(errors[field] ?? '', /characters or fewer/);
  }
});

test('success requires explicit Formspree acceptance, never an empty or error response', () => {
  assert.equal(enquiryAccepted({ ok: true }), true);
  for (const value of [
    undefined,
    null,
    '',
    true,
    {},
    { ok: false },
    { ok: 'true' },
    { success: true },
    { errors: [] },
    { ok: true, error: 'rejected' },
    { ok: true, errors: [{ message: 'rejected' }] },
  ]) {
    assert.equal(enquiryAccepted(value), false);
  }
});
