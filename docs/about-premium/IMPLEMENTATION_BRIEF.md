# DRAWNOUT DIGITAL — FINAL PREMIUM ABOUT PAGE REDESIGN

**Repository:** `tenthtech/drawnout-digital`

**Objective:** Completely redesign the existing About page into a premium, editorial, highly art-directed brand experience.

The current About page is functional but visually too basic. Treat this as a full creative redesign of `/about`, not another minor styling pass.

Use the two creative-agency reference images supplied by the owner as art-direction references. Capture their oversized typography, confident grids, orange/black contrast, asymmetrical compositions and premium editorial treatment without copying them.

## 1. Git and scope

Inspect the latest branches and PRs before implementation.

- PR #10: About foundation.
- PR #12: About corrections and Services cinematic hero.
- PR #14: Five Services overview chapters.

These branches are stacked. Preserve the entire latest implementation, including PR #14.

Create a dedicated branch:

`feature/about-premium-redesign`

Base it on `feature/services-overview-chapters` if the PRs remain unmerged; otherwise use the latest integrated `main`.

Open a draft stacked PR against the appropriate parent branch.

Do not overwrite Services, portfolio, homepage, Contact or footer functionality.

## 2. Design system

Create a premium editorial visual language using:

- Deep charcoal and near-black backgrounds.
- Warm off-white typography.
- DrawnOut orange as the primary accent.
- Selective cream panels for contrast.
- Strong modular and asymmetrical grids.
- Oversized, exceptionally well-composed typography.
- Thin dividers and numbered editorial sections.
- Subtle gradient atmosphere and original abstract visual details.
- Generous, deliberate spacing.

Avoid generic cards, repetitive layouts, unnecessary icons, excessive effects or childish animations.

Reuse the existing website typography and brand assets wherever appropriate.

## 3. About hero and opening animation

Completely redesign the About hero.

### Exact headline

**Two twins. One idea. A whole lot of creativity.**

### Exact supporting copy

DrawnOut Digital began on a random night, with a conversation between two twin sisters and an idea we couldn't leave alone.

That idea became our university thesis. And somewhere between exploring what it could be and imagining what came next, it grew into something bigger: a shared dream of building a creative agency of our own.

Today, we bring that same curiosity to the brands we help shape. We believe the best ideas deserve more than a good-looking finish. They deserve thought, character and a reason to be remembered.

### Desktop composition

- Large, expressive headline and story content on the left.
- Approved founders illustration on the right.
- Localized orange/amber atmospheric gradient.
- Strong typographic hierarchy and premium negative space.
- Carefully positioned branded plaque/logo object.
- No plain circular background or generic two-column appearance.

### Mobile composition

- Large responsive headline.
- Full visibility of both founders.
- Natural reading order.
- Thoughtful typography and spacing.
- No clipping or horizontal overflow.

### Opening choreography

1. Establish the dark editorial composition.
2. Reveal the approved twin-founders illustration.
3. Introduce the existing branded logo/plaque object from the homepage opening/footer animation.
4. Develop a subtle warm atmospheric gradient behind the illustration.
5. Transition into the final hero composition.
6. Reveal the headline and supporting paragraphs elegantly.

Target approximately 3–4 seconds.

**Important asset clarification:** Reuse the existing approved branded plaque/emblem appearance from `src/components/SignatureArtwork.astro` and its associated assets. This is the object the owner refers to as the 3D logo. The current source is a separated raster prototype, not an editable 3D model. Do not claim otherwise or create an unrelated substitute. Use a refined 2.5D/layered presentation if necessary, preserving the approved object.

The animation must be nonblocking, interruptible, accessible and visually polished.

## 4. Rebuild the complete About page

Implement the following editorial sequence.

### Section 01 — Origin story

Create an asymmetric modular story grid featuring:

- The thought.
- The university thesis.
- The shift from academic project to studio ambition.
- DrawnOut Digital.
- The belief behind the work.

Use large numbers, expressive typography, original abstract graphic panels and editorial dividers.

Do not invent historical details.

### Section 02 — Meet the founders

Preserve:

**Mariah — Creative Director — 7+ years in design**

**Mariam — Branding Lead — 4+ years in digital marketing and branding**

Use a premium editorial layout, not ordinary profile cards. Integrate the approved portrait naturally.

Do not assign either name to a side of the illustration without confirmation.

### Section 03 — What we believe

Create a high-impact manifesto section using these approved principles:

- Ideas before decoration.
- Character over sameness.
- One story, many touchpoints.
- Room for curiosity.

Preserve their existing explanatory copy.

Use oversized editorial rows with refined dividers and restrained animated accents.

### Section 04 — From the first scribble to the final detail

Redesign the existing process section.

Maintain the underlying process meaning:

1. Listen / Ask.
2. Explore / Find the direction.
3. Shape / Give it form.
4. Refine / Make it connected.

Each step should include a custom abstract design-system illustration.

Alternate text/artwork placement.

Correct the existing scroll-synchronization issues.

Use accurate reversible scroll-linked transitions without delayed scrubbing, excessive pinning or scroll hijacking.

### Section 05 — The DrawnOut difference

Create an editorial modular grid communicating:

- Twin-led creative studio.
- Origin in a university thesis.
- Brand-first thinking.
- Connected creative disciplines.
- Independent creative perspective.

Use truthful source-supported information only.

Use 02 founders and the supplied 2022 founding/impact statement if appropriate.

Do not invent awards, client counts, agency scale or business achievements.

### Section 06 — Capabilities bridge

Present the five existing services with large typography and subtle interactions:

- Brand Identity & Design.
- Digital Design.
- Marketing & Campaigns.
- Words & Storytelling.
- Creative Direction.

All five must link to their actual service pages.

Do not duplicate the full Services overview or its cinematic animation.

### Section 07 — Closing invitation

Build a premium final CTA section.

Headline:

**Have something in mind? Let's make it matter.**

Supporting line:

**Every meaningful brand starts somewhere. Tell us where yours begins.**

CTA:

**Tell us what you're thinking** → `/contact`

Create a confident final typographic composition that flows naturally into the existing signature footer.

## 5. Original visual assets

Create original, production-ready About-specific design elements:

- Modular editorial background compositions.
- Fine graphic lines and grid details.
- Subtle atmospheric gradient layers.
- Brand-story typography artwork.
- Abstract process illustrations.
- Minimal designed accents connecting sections.

Use SVG, CSS, existing layered assets and current motion libraries.

Avoid stock visuals, generic placeholder icons and fabricated portfolio artwork.

Do not reuse competitor graphics.

## 6. Motion standards

Motion must be cinematic, sophisticated and restrained.

Implement:

- One coordinated About hero entrance.
- Subtle background atmosphere.
- Story-panel reveals.
- Manifesto typography transitions.
- Scroll-linked process illustrations.
- Refined founder-name reveals.
- Closing CTA transition.

Ensure that all animation works coherently as one motion language.

No bouncing, random floating, aggressive zooms, excessive letter animation or distracting perpetual effects.

Support reduced motion, Save Data, keyboard navigation, static rendering and no-JavaScript fallback.

Every section must remain readable if animations fail.

## 7. Responsive and technical requirements

Test at 1440px, 1024px, 768px, 390px and 320px.

Preserve:

- Site header and mobile navigation.
- Homepage opening animation and fluid gradient.
- Six portfolio videos and card rhythm.
- Services cinematic hero and five new overview chapters.
- All five service-detail pages and FAQs.
- Contact form and current unconfigured Formspree state.
- Existing signature footer, social links and Tenth Tech attribution.
- SEO metadata and preview indexing restrictions.

Do not add unnecessary packages.

Prioritize semantic markup, contrast, accessibility, stable layout, responsive media and fast rendering.

## 8. Execution checkpoints

Commit and push early to prevent cloud usage-limit interruptions.

**Checkpoint A:** New About art direction, hero layout and branded assets.

**Checkpoint B:** Complete editorial layout and final About copy.

**Checkpoint C:** Hero animation, scroll-linked interactions and responsive polish.

**Checkpoint D:** Validation, screenshots, recordings and review PR.

Do not sacrifice visual quality just to increase test counts.

## 9. Required delivery

Provide:

- Desktop full-page About screenshot.
- Mobile full-page About screenshot.
- Desktop hero arrival recording.
- Mobile hero arrival recording.
- Screenshots at 1440, 1024, 768, 390 and 320.
- Process-scroll animation recording, including reverse scrolling.
- Reduced-motion and no-JavaScript evidence.
- Comparison of old and new compositions.
- Validation report with actual test results.
- Final commit SHA and draft PR URL.

Visually inspect the rendered results. Do not consider the page finished merely because automated tests pass.

**Final acceptance standard:** The About page must look and feel like a premium creative-agency brand presentation, not a conventional agency biography template.

Make it one of the strongest, most distinctive pages on the DrawnOut website.

Do not merge automatically, deploy, or push to the separate Netlify preview repository.
