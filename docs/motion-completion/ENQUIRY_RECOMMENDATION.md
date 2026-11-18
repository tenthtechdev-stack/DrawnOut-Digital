# Reusing “Bring us the pieces”

**Recommendation: retain the existing artwork, motion controller and interaction
system; make only service-specific editorial adjustments after separate owner
approval. Do not propagate it during this milestone.**

The current Brand Identity & Design implementation remains unchanged. Its
7.8-second sequence already provides the shared agency idea: fragments connect
around the authentic DrawnOut emblem, align, hold, then return. A second puzzle
system or four competing motion treatments would weaken that continuity.

## Editorial fit on the other services

| Service               | Recommended future adjustment                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Digital Design        | Change the identity-specific headline to introduce a question about the digital experience; keep the common illustration and Contact destination.           |
| Marketing & Campaigns | Frame the headline around the audience and message, without adding promised reach, conversion or campaign results.                                          |
| Words & Storytelling  | Introduce voice or the story's central idea in the headline. Keep the shared conceptual labels rather than turning the diagram into a pretend writing tool. |
| Creative Direction    | Frame the headline around finding a coherent direction. The existing composition fits particularly closely, so only a small copy change should be needed.   |

The approved invitation, “Bring us the pieces. We'll help find the picture.”,
and direct “Tell us what you're thinking” Contact link can remain common.
Final replacement headlines and any copy variants require creative approval.
The current SVG labels describe conceptual fragments, not actual submitted
visitor data or verified client deliverables; retain that distinction.

If reuse is authorized, the smallest maintainable change is optional editorial
properties on the one component, retaining its approved defaults. Keep one
instance per page and preserve the shared SVG, labels, source emblem, timing,
controller and `/contact` destination. No such parameterization or rollout is
implemented here.

## Responsive and accessibility review

The existing markup and behavior support reuse:

- Semantic heading and copy sit outside the decorative, nonfocusable SVG.
  A descriptive figure caption gives screen readers the illustration's meaning.
- The Contact link is permanently rendered outside animated groups; animation
  never gates navigation or simulates an enquiry submission.
- Desktop uses two columns; below 1024px the copy precedes a bounded illustration.
  The SVG reserves a 6:5 aspect ratio, and the mobile treatment keeps the three
  narrative captions and 44px pause control available.
- The server renders the complete final pose. Reduced motion, Save Data,
  missing JavaScript or failed GSAP loading preserve that useful composition.
- Visibility, document-hidden state, keyboard focus and explicit user pause
  suspend active time. Native scrolling and focus are not hijacked.

The established browser suite includes the 320, 390, 768, 1024, 1440 and 1920px
layouts, phase-by-phase Contact clickability, keyboard focus, axe checks and
fallback behavior. This milestone's final validation report records the actual
rerun results; this recommendation does not substitute for those checks or for
physical Safari/Android review.

The completed preservation audit also compares the component, controller,
styles, service integration and policy with PR #20's exact source bytes. The
other four Services pages keep their current enquiry sections until approved.
