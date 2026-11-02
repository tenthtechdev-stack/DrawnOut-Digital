Continue the DrawnOut Digital website development.

Repository:
tenthtech/drawnout-digital

Current context:

- PR #10 is open and contains the About page and portfolio rhythm work.
- Commit reviewed by owner: b9fc396cc002c07af0ad60a3b99e932022dcd0b7
- A new Services experience has been approved conceptually, but not yet implemented.
- We need to preserve all approved work and refine it, not restart it.

Important:
Do not overwrite or discard the approved About page, portfolio rhythm, homepage, Contact page, footer, or existing service content. Build on top of them.

Because PR #10 is still open, branch from feature/about-brand-story-experience unless it has already been merged when you start. If it has merged, branch from the latest main.

Create a new branch:
feature/services-cinematic-hero

If PR #10 is still open, open a draft stacked PR targeting feature/about-brand-story-experience.
If PR #10 has already merged, target main.

Do not merge automatically.
Do not deploy automatically.
Do not push to the separate Netlify repository.

==================================================
PART 1: ABOUT PAGE POLISH AND MOTION CORRECTIONS
==================================================

Before building the new Services experience, make the following approved refinements to the About page.

A. ABOUT HERO BACKGROUND CHANGE

Change the About hero background and opening animation background to use the same dark visual direction as the "Good design has something to say." section.

Use:

- dark charcoal / near-black background
- warm off-white text
- orange accent details
- strong contrast
- premium editorial feel

The About hero should now feel more dramatic, more intentional, and more visually prominent.

B. ABOUT HERO OPENING ANIMATION CHANGE

Revise the About opening animation sequence.

Current behavior is not the final approved direction.

New approved direction:

1. At the start of the About page, the founders illustration appears centered in the page.
2. A large DrawnOut logo should appear behind the illustration in the middle composition.
3. The composition should include:
   - the twin founders illustration
   - a large DrawnOut logo in the background
   - a circular supporting form behind or around the logo/illustration composition if it helps the composition
4. This centered illustration/logo composition should hold briefly, then move smoothly toward the right side.
5. As it moves to the right, the left-side editorial text should appear smoothly.
6. The final settled state should place:
   - illustration/logo composition on the right
   - text content on the left
7. The motion must feel elegant, intentional, and smooth, not abrupt.

Use the owner sketch as directional guidance:

- centered illustration and logo first
- then the illustration/logo/circle composition transitions toward the right
- then left-side copy settles in

Do not turn this into a second blocking loader.
Do not add a separate full-page loading gate.
This must remain a nonblocking About hero arrival.

C. VISUAL COMPOSITION OF THE ABOUT HERO

Refine the hero illustration colors and supporting circle/logo treatment so the composition feels more prominent.

The centered composition should feel art directed, not flat or weak.
The large DrawnOut logo behind the founders should be visible enough to matter, but not so strong that it makes the hero unreadable.

Balance:

- premium
- dramatic
- story-led
- elegant
- smooth

Do not create a noisy or over-layered composition.

D. ABOUT PAGE SCROLL-SYNC FIX

The section:
"From the first scribble to the final detail."

is not currently syncing well with scroll.

Fix this section so its motion is tightly synchronized to scroll.

Requirements:

- animation progress should be clearly tied to scroll progress
- no laggy delayed feeling
- no awkward desynchronization
- no overshoot
- no jump when scrolling quickly
- reversible correctly on upward scroll
- stable on resize
- stable on mobile and desktop
- no broken pinning behavior
- no interference with natural page scrolling

If any GSAP ScrollTrigger settings need adjusting, do so carefully.
Prefer accurate scroll-linked timing over ornamental effects.

==================================================
PART 2: SERVICES EXPERIENCE — STAGE 1
==================================================

After the About refinements above are implemented and preserved, begin the first production milestone for the new Services experience.

Goal:
Build only the first reviewable prototype of the main Services page hero.

Do not yet rebuild the rest of the Services overview sections in full.
Do not yet rebuild all five individual service pages.
Do not yet build the full "puzzle / bring us the pieces" contact animation.
Those come later after the Services hero is approved.

This stage is only for the cinematic hero at /services.

A. CORE SERVICES HERO CONCEPT

This is not a blocking loader.
It is a living hero that animates while the visitor is at the top of the Services page.
The visitor must be able to scroll immediately.

Approved sequence:

1. The large DrawnOut emblem/logo starts on the right side.
2. It moves horizontally toward the left side.
3. In the center, each of the five services appears one by one.
4. Each service should remain featured for about 2 seconds.
5. Each service needs a distinct custom visual scene, with relevant iconography / illustration / design language.
6. After the five services complete, the DrawnOut wordmark should appear in large typography alongside the logo movement.
7. The logo should move back toward the right side.
8. The sequence should loop cleanly and seamlessly.

This must feel like one well-directed animated brand sequence, not a series of disconnected effects.

Target complete cycle:
approximately 13 to 15 seconds

B. FIVE SERVICES TO FEATURE

Use these exact services:

1. Brand Identity & Design
   "Make your brand look like it knows who it is."

2. Digital Design
   "Your brand should feel like itself everywhere."

3. Marketing & Campaigns
   "Make every impression mean something."

4. Words & Storytelling
   "Because what you say matters as much as how it looks."

5. Creative Direction
   "A bigger idea needs a bigger picture."

C. VISUAL DIRECTION FOR EACH SERVICE SCENE

Each featured service needs its own custom mini scene.

Do not use generic placeholder icons only.
Do not use repetitive identical card animations.
Do not use low-effort bouncing graphics.

Service 1: Brand Identity & Design
Create a visual sequence showing a brand idea moving from sketch / construction / visual exploration into a recognizable identity.

Service 2: Digital Design
Show interface blocks, wireframes, layouts, and screen structures refining into a polished digital experience.

Service 3: Marketing & Campaigns
Show a campaign idea translating into coordinated outputs such as social, posters, ads, or campaign panels.

Service 4: Words & Storytelling
Show scattered words, fragments, or typographic components organizing into a structured message.

Service 5: Creative Direction
Show multiple materials, colors, compositions, and visual elements being brought into one art-directed whole.

Keep all five scenes visually consistent with the DrawnOut website and Afterglow styling.

D. SERVICES HERO REQUIREMENTS

The hero must:

- allow immediate scroll
- support keyboard navigation
- support direct service links
- include an accessible pause/play control because the content auto-animates
- pause when offscreen or when document is hidden
- avoid changing the active service while a user is focused on an interactive element
- have a refined reduced-motion fallback
- have a no-JS fallback showing all five service links
- work on mobile, tablet, and desktop without overflow or broken composition

Do not force the user to watch the animation.
Do not auto-scroll the page.
Do not stack a second intro on top of the site's existing loader system.

E. KEEP THE EXISTING SERVICES CONTENT BELOW

For this stage, keep the current Services page content below the hero as a functional temporary continuation.
Do not redesign the five overview chapters yet.
Do not redesign the full service detail templates yet.

The goal is to validate the hero first.

==================================================
PART 3: GENERAL QUALITY STANDARDS
==================================================

Preserve:

- homepage loader behavior
- homepage fluid gradient
- About page story content
- portfolio rhythm
- Contact page
- existing footer and footer credit
- existing FAQs and service copy already approved
- existing SEO/publication safeguards

Do not:

- enlarge a low-resolution navigation logo crop for the Services hero
- add generic placeholder scenes and claim the milestone is complete
- break mobile layouts
- create heavy jank or unnecessary GPU load
- fake a successful outcome without real recordings and testing

Prefer:

- SVG / CSS / GSAP / existing project tooling
- smooth transforms
- readable final states
- native scrolling
- reversible scroll-linked motion where appropriate
- clear responsive behavior

==================================================
PART 4: DELIVERY REQUIREMENTS
==================================================

Push meaningful checkpoints early.

Required delivery for review:

1. About page refinements:

- updated hero screenshots
- desktop recording of the new About hero arrival
- mobile recording of the new About hero arrival
- recording showing improved "From the first scribble to the final detail." scroll-sync behavior

2. Services hero:

- 1440px recording of at least 20 seconds showing:
  - start state
  - all 5 service scenes
  - DrawnOut wordmark reveal
  - return to loop
- 390px recording of at least 20 seconds showing the same
- screenshots of each service scene
- screenshot of initial logo position
- screenshot of final wordmark / return transition
- reduced-motion state
- no-JS fallback state

3. Validation:

- build
- TypeScript
- lint
- formatting
- unit tests
- focused browser checks for hero behavior, motion controls, reduced motion, and navigation

Open a draft review PR and report:

- branch name
- PR URL
- commit SHA
- actual timings
- what remains for later stages

Do not merge automatically.
Do not deploy automatically.
