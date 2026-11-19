# Formspree activation — owner checklist

**Current status: not activated.** No real endpoint, provider-account access or verified recipient has been supplied. The static build must continue showing its unconfigured message, disabled submit button and direct email alternative. No request, mocked test or decorative animation in this milestone establishes inbox delivery.

The canonical recipient is **official@drawnoutdigital.com**. It must be set and verified inside the owner's actual Formspree account; the website's displayed email and form subject do not configure notification routing.

## Before enabling public enquiries

1. In the owner's Formspree account, create or identify the real DrawnOut form. Confirm account ownership, the form's public `/f/` identifier and the plan's submission/notification limits. Complete verification of `official@drawnoutdigital.com` as the recipient. Do not use an identifier from test fixtures, portfolio artwork or an example URL.
2. Configure the anti-spam, allowed-domain and server-side validation controls available to that account/plan. Review provider behavior for blocked submissions, abuse, rate limits and quota exhaustion. Keep the existing `_gotcha` honeypot. Browser-side field checks and honeypots are basic safeguards, not a security boundary or a substitute for provider enforcement. If a challenge is required, approve and test it separately; this milestone creates no CAPTCHA account or secret.
3. Approve DrawnOut's complete privacy policy and publish its approved link alongside the form before live activation. The existing concise purpose notice says enquiry information is used to understand and answer the enquiry and is not a marketing signup. The conditional Formspree policy link discloses the processor; it does not substitute for DrawnOut's own policy. Responsible-business details, actual retention practice, processors and applicable rights/contact procedure need owner confirmation; none are invented here.
4. Supply the actual public HTTPS endpoint in the build environment as `PUBLIC_FORMSPREE_ENDPOINT`. The existing allowlist accepts only `https://formspree.io/f/<alphanumeric ID>`, without credentials, query strings, fragments or custom ports. An empty or invalid value stays unconfigured. This is a public form identifier, never a private API credential. Keep local `.env` files ignored and private keys out of source, screenshots and browser bundles.
5. Rebuild the static Astro site after setting the variable. This is build-time configuration; changing an environment value after the build does not change the generated form. Inspect the generated `action`, enhanced state and provider/privacy disclosure. Confirm that the account still routes the endpoint to the verified official recipient. No SSR conversion is required.

## Real acceptance and delivery verification

A genuine accepted HTTP response with the expected JSON acknowledgement permits the website to say that the **provider accepted the message**. It does not establish that an email reached the recipient's inbox. The small confirmation mark is decorative and appears only after this existing acceptance gate. It is unrelated to “The First Thought” opening illustration.

Use a controlled, non-public visitor address and clearly labelled test content for live verification:

- Submit once through the configured website with only required fields, then with optional company, phone and budget fields. Confirm the exact fields and subject in the provider submission record.
- Confirm the notification reaches `official@drawnoutdigital.com`; check both inbox and spam. Verify content, Unicode/currency text, optional empty values and any notification errors. A provider dashboard record alone is not inbox evidence.
- Inspect the notification's actual `Reply-To` header and send a controlled reply. Formspree is intended to use the visitor's submitted `email` field; confirm that the account/notification configuration actually sends the reply to that visitor address.
- Test a provider rejection, throttling/quota behavior and an interrupted request. Confirm there is no website success animation/message for failure, malformed acknowledgement or an uncertain timeout. Values should remain available, with the email alternative and a warning to contact the studio before retrying an ambiguous request. There are no automatic retries.
- Test keyboard validation, linked error summaries and double-click/Enter submission. Confirm only one request is accepted while pending and that accepted forms stay locked until “Start another enquiry” is chosen.
- With JavaScript disabled, verify configured native POST reaches the real provider's confirmation/error page. The website cannot independently interpret or animate that provider page. Verify the ordinary unconfigured build still has no submit action and retains working direct contact links.

Keep test personal data and mail headers private. Record the date, approved site/build commit, public form ID, recipient-verification status, provider submission ID, notification result and Reply-To result in an owner-controlled launch record. Redact personal data in any shared proof.

| Launch item                                     | Status in this milestone         |
| ----------------------------------------------- | -------------------------------- |
| Actual owner Formspree endpoint                 | Missing                          |
| Official recipient set and verified in provider | Not verified                     |
| Plan limits, spam/domain/validation controls    | Owner setup and testing required |
| Approved DrawnOut privacy policy and link       | Owner approval required          |
| Real provider acknowledgement                   | Not tested                       |
| Notification delivered to official inbox        | Not tested                       |
| Visitor Reply-To behavior                       | Not tested                       |
| Owner visual approval                           | Pending review                   |
| Public activation/deployment                    | Not authorized by this delivery  |

## What automated evidence establishes

The existing unit and browser tests check field validation, endpoint allowlisting, state transitions, duplicate prevention, loading, timeout/network/provider errors, strict accepted acknowledgements, keyboard feedback and native/no-JavaScript fallbacks. Browser fixtures are explicitly intercepted and labelled; they never send a real enquiry. Mocked success screenshots demonstrate only the interface after a simulated accepted response.

See the original [Contact handoff](../CONTACT_HANDOFF.md), the preserved [Contact validation](../CONTACT_VALIDATION.md), and this milestone's final validation report/gallery for the commands actually run. Live configuration, real delivery verification and public deployment require the separate owner steps above.
