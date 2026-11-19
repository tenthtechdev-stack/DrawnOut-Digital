# Contact — The First Thought

This milestone preserves the existing Contact form and refines its presentation around an original, one-time line study. It is stacked on PR #21, commit `106d63ca5d50f4f84a715c407073f6d7c8fc7424`. The exact pre-implementation source/failure record is in [BASELINE.md](BASELINE.md).

## Creative composition

The approved headline and supporting copy remain verbatim. Desktop places the large headline on the left and the line study on the right; the gesture resolves above the enquiry column. The form and direct-contact columns retain their existing architecture. On mobile, the compact artwork sits beside the introductory copy, rather than adding a large panel before the form. A native anchor gives immediate access to enquiry fields. Tighter form-introduction spacing keeps the first field reachable. Full before/after screenshots accompany the final gallery.

Actual initial viewport review found an accidental third headline line at 1920px; the desktop font cap was reduced to 116px so the largest frame retains the intended two-line composition. Other breakpoints retain their type scale. The final browser tests explicitly check this desktop line count.

## Original animation source

- [FirstThought.astro](../../src/components/contact/FirstThought.astro): original inline SVG path and static completed composition; no replacement logo or Services puzzle.
- [contact-first-thought.ts](../../src/scripts/contact-first-thought.ts): scoped, existing-GSAP enhancement with native visibility handling.
- [contact-thought-policy.ts](../../src/lib/contact-thought-policy.ts): 4.8-second duration, phase and pause policy.

The exploratory mark runs 0–1.15s, connection 1.15–3.75s and conversation 3.75–4.8s. Only SVG strokes, small registration marks and a caption move. The server renders the complete final pose. No heading, input, contact link or form state waits for motion. A delayed/failed import keeps the final artwork usable; no new startup deadline or hidden-content boot is introduced.

Reduced motion and Save Data settle immediately. Hidden/offscreen states pause the remaining active time; form focus settles immediately. Completion destroys only this component's GSAP context and restores the server pose. Same-DOM/bfcache restoration does not replay. The finite 4.8-second sequence has no endless loop or animation-dependent control. Native scrolling and keyboard order remain intact.

## Provider acknowledgement stays separate

The existing endpoint allowlist, seven fields, four required values, limits, validation, honeypot, 15-second uncertainty timeout and duplicate-prevention rules remain in place. The validation library and canonical contact data are unchanged. A small confirmation stroke appears only after the existing successful HTTP and explicit JSON acknowledgement gate. Reduced motion, Save Data and hidden-page behavior select its static version. Its absolute decorative slot does not move inputs; the existing live status communicates acceptance in words.

Provider acceptance is not inbox delivery. An unconfigured, rejected, malformed or ambiguous request never displays success. No real provider call or recipient verification is part of mocked automated evidence. See [the owner activation checklist](FORMSPREE_ACTIVATION.md) for the public build-time endpoint, actual account/recipient verification, spam controls, approved privacy policy, real delivery and Reply-To tests still required.

## Preserved boundaries

Shared layout/navigation/footer, homepage/gradient/intro, Work and all eleven cases, six portfolio compositions/exports/posters/source artwork, Services and its Brand Identity puzzle, About, favicon, publication/attribution and preview noindex controls remain intact. The production-quality 3D hand/footer is a separate milestone. No merge, public activation, deployment or Netlify mirror push is authorized by this review.

## Contact-only arrival behavior

Normal-motion recording exposed the existing global loader covering Contact while the line study played behind it. Contact now uses the shared layout’s existing `enableLoader={false}` prop. This is a local usability choice: the form and contact methods are available immediately and the new sequence is visible. Shared layout and homepage loader sources remain unchanged. Cold-entry tests and recordings must verify actual hit-testing/occlusion, rather than only CSS visibility. Earlier occluded recordings are rejected and kept outside the review gallery.
