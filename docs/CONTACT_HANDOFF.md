# Contact page handoff

The Contact page replaces the temporary route with the approved Afterglow typography, warm paper background, orange accents and a prominent enquiry form. The exact supplied headline and supporting copy are retained. Desktop pairs the form with direct contact details; tablet and mobile place the form first and keep every contact method available below it. Existing heading reveals, responsive navigation, portfolio routes and the signature footer remain in use.

This is an integration-ready static page, **not a live email-delivery service yet**. The owner confirmed that no Formspree endpoint exists. The production build therefore explains that the form is not connected, disables submission and offers a working email link. No enquiry is silently discarded or presented as successful in that state.

## Scope and source

- `src/pages/contact.astro`: editorial page composition and direct contact links.
- `src/data/contact.ts`: canonical official email, phone, WhatsApp and social URLs supplied by the client.
- `src/components/contact/EnquiryForm.astro`: semantic form fields, native fallback, labels, privacy explanation and responsive presentation.
- `src/lib/contact-form.ts`: endpoint validation, field limits and enquiry validation.
- `src/scripts/contact-form.ts`: progressive enhancement, accessible errors, loading and provider-response handling.
- `src/components/SiteFooter.astro`: the official email link; the signature animation and shared navigation remain intact.
- `.env.example`: deliberately empty public endpoint configuration.
- `scripts/capture-contact.mjs`: repeatable, unedited production screenshot capture.

The Contact branch starts from the preserved, client-approved signature direction represented by PR #4. PR #4 was merged into `main` during Contact validation; its merge commit has the same source tree as the preserved base. Contact now branches from that latest `main` commit (`3ed6f16`) and its pull request targets `main`. No opening or gradient implementation is changed. This task does not authorize merging or publicly deploying Contact.

## Official contact information

| Method    | Exact destination                                    |
| --------- | ---------------------------------------------------- |
| Email     | `official@drawnoutdigital.com`                       |
| Phone     | `+923019719288`                                      |
| WhatsApp  | `https://wa.me/923019719288`                         |
| Facebook  | `https://www.facebook.com/DrawnOutDigital/`          |
| Instagram | `https://www.instagram.com/drawnout_digital/`        |
| LinkedIn  | `https://www.linkedin.com/company/drawnout-digital/` |

Email and phone use `mailto:` and `tel:` links. WhatsApp and social links have descriptive accessible names and use the supplied HTTPS URLs. They open in the same tab, avoiding an unexpected new window. No contact details embedded inside portfolio artwork are substituted for these official details.

## Form behavior

Required fields are Name, Email, Project type or service and Project description. Company / organization, Phone / WhatsApp and Approximate budget are optional. The service options reuse the website's existing capability names and include “Something else / not sure yet”; no budget currency or minimum spend is imposed.

Client limits are 100 characters for name, 254 for email, 160 for company, 50 for phone, 100 for budget and 5,000 for project description. Required values are checked after trimming; email format and service choices are validated. Fields keep their values after a failure.

With JavaScript, submission errors appear beside the relevant fields and in a focused, linked error summary. Submission sets a busy state, disables the fields and submit button, and announces progress. Only an HTTP success response with a valid JSON acknowledgement containing `ok: true` is treated as accepted by Formspree. A successful acknowledgement is not proof that the recipient's mail server delivered the email to an inbox.

The form prevents concurrent requests and stays disabled after acceptance until the visitor explicitly starts another enquiry. A 15-second timeout, network failure, provider rejection or invalid response cannot show success. Ambiguous network outcomes explain that receipt could not be confirmed and recommend contacting the studio before retrying; there are no automatic retries.

A hidden `_gotcha` honeypot and client-side validation provide basic safeguards. They are **not server-side anti-spam or security boundaries**. The provider must enforce validation and abuse protection. The visitor's submitted `email` field is used for Formspree's Reply-To behavior; the real account's generated notification headers must be checked during live verification.

When a valid endpoint is configured and JavaScript is unavailable, the semantic form submits directly to Formspree using normal browser constraint validation and the provider's confirmation/error page. The unconfigured build does not offer a submit path. Both modes retain direct email contact.

## Owner setup required before form launch

1. Create a form in the owner's actual Formspree account. Set **`official@drawnoutdigital.com` as the recipient** and complete the provider's recipient verification. Confirm the form belongs to DrawnOut Digital and that the account/plan supports the expected enquiry volume.
2. Review Formspree's account settings for spam filtering, allowed submission domains and server-side field validation. Enable the appropriate available controls and test them. Keep the `_gotcha` field. If the selected plan requires an additional challenge or workflow, configure and verify it before launch; no CAPTCHA account or secret is supplied by this repository.
3. Copy the real public `/f/` endpoint from that form. Configure `PUBLIC_FORMSPREE_ENDPOINT` in the build environment. For local work, copy `.env.example` to the ignored `.env` file and replace its empty value with the actual endpoint. Do not guess a form ID, put the recipient address into the endpoint or commit private API keys.
4. Rebuild the static Astro site. This variable is read at **build time**; changing a runtime setting without rebuilding does not change the generated form. Only HTTPS `formspree.io/f/<alphanumeric ID>` endpoints without credentials, query strings, fragments or custom ports are accepted. An empty or invalid value leaves the form safely unconfigured.
5. Review the generated form's actual `action`, configured state and Formspree privacy disclosure. Confirm the provider still routes this form to the verified official recipient, independently of the website's displayed email link.
6. Send a real test enquiry with a controlled visitor email address. Confirm acceptance in Formspree, then check the official inbox and spam folder. Verify the received fields, subject, encoding, optional empty values and Reply-To header. Reply to the message and confirm it goes to the visitor's supplied address. Record the date, form ID, provider submission ID and delivery result without publishing enquiry personal data.
7. Test a rejected submission and an interrupted request against the real configured form. Confirm a failed or ambiguous request does not receive website success feedback and that provider spam controls behave as intended. Review notification failures and quota exhaustion behavior in the account.
8. Approve the final privacy policy and launch configuration. Public deployment remains a separate authorized action.

The integration uses a public form identifier, not a privileged key. The website stays in Astro static build mode and adds no server adapter, custom admin, tracking or marketing-consent defaults.

## Privacy launch dependency

The current concise notice says enquiry details are used to understand and respond to the enquiry and that the form does not sign visitors up for marketing. When configured, it discloses Formspree processing and links to Formspree's privacy policy. It does not invent retention periods, a legal entity, legal jurisdiction or a DrawnOut policy approval.

A complete **DrawnOut privacy policy remains a launch dependency**. The owner must approve the responsible business details, retention practice, provider/processors, international processing where applicable, rights/contact procedure and other applicable requirements. Publish the approved policy and add its real link beside the form before activating public submissions. Formspree's policy is a provider disclosure, not a substitute for DrawnOut's policy.

## Evidence and validation

The final validation report and GitHub gallery accompanying the Contact pull request record the commands actually run and their results. Mocked browser submissions verify interface behavior only; they do not prove a provider account, recipient verification or email delivery.

Production screenshots can be regenerated after a static build and preview server are running:

```sh
npm run build
npm run preview -- --port 4333
# In another terminal:
node scripts/capture-contact.mjs --out artifacts/contact
```

The script captures 390px, 768px and 1440px layouts, form, direct contacts and footer. Full-page and component layout evidence uses the real reduced-motion fallback so all content remains visible; separately labelled normal-motion hero/footer images observe the existing reveals after native scrolling. Screenshots are not composited or retouched. `capture-evidence.json` records viewport, motion preference, form state, image dimensions and checksums. It makes no real form submissions.

**Unresolved launch requirements:** owner-created endpoint; recipient verification; real enquiry delivery and Reply-To verification; provider spam/security settings; approved DrawnOut privacy policy; separate deployment approval.
