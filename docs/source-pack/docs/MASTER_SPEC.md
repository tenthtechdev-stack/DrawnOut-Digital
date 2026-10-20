# Master product specification — DrawnOut Digital
**Version 1.0 | 21 October 2026 | Implementation proposal; final design pending studio sign-off**

## Vision
Build an original, immersive agency website that looks like DrawnOut's creative practice, not an off-the-shelf marketing template. The site should make an immediate visual impact, substantiate five disciplines with real work, and make contact intuitive. Structure and accessibility are not secondary to motion.

## Positioning
- Business: independent creative-led full-service digital agency, presenting publicly as a creative and digital studio.
- Audience: startups, growing businesses, organizations, marketing/brand teams seeking a design and digital partner. Local Pakistan + international, without unverified geographical claims.
- Brand story: good design attracts attention, great thinking connects it to intent. Independent, conversational, curious, energetic, confident.
- Proof hierarchy: actual projects > specific demonstrated disciplines > process > credible team details. No invented statistics, clients, testimonials or awards.

## Goals (ranked)
1. Make strong first impressions through authentic DrawnOut work and carefully orchestrated design.
2. Offer frictionless navigation to services, work, case studies and contact.
3. Establish trust via documented case studies, project roles and a transparent studio process.
4. Generate qualified, measurable enquiries; primary CTA `Have Something in Mind?` (hero) and `Tell Us What You're Thinking` (contact) are user-supplied, not replaced by generic buttons.
5. Enable Codex/Git-driven project additions without layout redevelopment and support future CMS migration.
6. Run reasonably well on mobile/data-constrained connections and for reduced-motion users.

## Top-level experience
1. **Entry/hero:** big and readable headline `We make ideas impossible to ignore.` animated over branded fluid atmospheric gradient. Hero can include media poster / future showreel module but typography remains primary. Animated type entrance is intentional, not every letter looping forever.
2. **Studio statement:** condensed `NOT ANOTHER CREATIVE AGENCY` perspective, concise, no five successive manifestos.
3. **Selected work:** project cards with visual variety. Use a configurable grid with alternating editorial rows. Hover/focus interactions; navigation to full case pages. Some portfolio cards can use corner expansion/intersect effect inspired by reference while remaining original.
4. **Services:** short introductions to five pillars, each linked to comprehensive Services content, ideally paired with relevant work.
5. **Approach/process:** 4 stages condensed from supplied content; possible oversized statement + steps, no overlong text-only walls.
6. **Studio/about teaser:** distinctive voice, real team details only when authorized, link to About.
7. **Final call to action and signature footer:** user-requested scroll narrative with hand and raised glass/emblem frame growing into background. Contact remains a real functional link/form, with social links and legal details.

## Navigation structure
Desktop: DrawnOut logo left; Work / Services / About / Contact links right, plus an accent project enquiry action when space allows. Home via logo. Sticky header transitions modestly in contrast, not an intrusive 3D nav widget.
Mobile: a proper menu button with `aria-expanded`/`aria-controls`, focus management, Escape to close, scroll locking only while modal is open, sufficiently large targets. CTA remains accessible.
Subnav: Work filters are not new routes by default. Individual service pages are deferred unless long, useful content supports them. Avoid thin SEO pages and an unnecessary mega-menu.
Footer: Contact CTA, email (pending approval), Work, Services, About, social links (user-supplied), copyright with current year, privacy/legal when needed. Sticky stage must not block navigation or screen readers.

## Core pages
- `/`: original hero, concise messaging, selected work, services, philosophy, process teaser, CTA/footer.
- `/work`: grid of validated projects, category filters with counts derived from published content, configurable featured ordering, keyboard and tap support. Show state when no results; URLs/shareable filter optional pending need.
- `/work/[slug]`: shared case-study template with hero, project summary/role, brief, approach, image sequence, deliverables, real outcome only if verified, related projects, enquiry CTA; publication metadata.
- `/services`: five sections using original service names, no fake skills/certifications, links to relevant published cases. FAQs only when real.
- `/about`: 'Not Another Creative Agency', 'Pretty Isn't the Point', method, team if verified, ideal clients, contact CTA.
- `/contact`: concise copy, accessible enquiry form or direct email CTA depending on confirmed infrastructure; accessible validation, privacy link.
- `/404`: branded, useful work/home links and no motion dependence.

## Why visual references are complementary
- KOTA inspires **hero atmosphere**: gradients + large type + motion refinement.
- Brandlic inspires **portfolio and section expansion**: corners, framed media, editorial balance.
- Ramotion inspires **operational UX**: findability, clear sections, well-labeled work and services.
- DrawnOut must have its **own** icon, warm-toned color logic and distinctive scroll footer, avoiding reference-site identity cloning.

## Responsive design contracts
### Mobile (< 640px)
- Headline 2–5 readable lines; no intentional clipping that hides words.
- Portfolio single-column cards; tap and keyboard discoverability (not hover-only).
- Realistic video poster. No autoplay sound. Limit one major pinned sequence; footer motion simplified or static if not robust on actual mobile browsers.
- Footer CTA always visible outside/after sticky animation (can be reached without animation).
### Tablet (640–1023px)
- Flexible split sections where content supports them, avoid tiny captions.
- Footer stage only pinned after testing viewport/landscape behavior.
### Desktop (>=1024px)
- Hero and case studies can use editorial large type and asymmetrical grids.
- Scroll reveal vocabulary available, not applied indiscriminately.
- Full footer animation with poster-to-immersive background transition.

## Interaction states that must exist
Navigation: default, hover, focus, active; menus open/closed; cards default/hover/focus; filters active/inactive/empty; form pristine/loading/success/error; video paused/loading/ready/error; missing media fallback; reduced-motion version; scroll up/down/reload mid-section.

## Performance and quality budgets (targets, not current measurements)
- CWV target at 75th percentile: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- Avoid animating properties that induce continuous layout and paint; prefer transforms/opacity, make expansion via scale/clip judiciously.
- No invisible critical text while JS waits; font fallback and swaps; SVG/light raster for logo variants.
- Hero media poster prioritized only when visible/LCP; below-fold media lazy loaded. `srcset`/`sizes`, AVIF/WebP, responsive crops, descriptive alt.
- No unbounded infinite animation canvases. Suspend or reduce effects when off-screen.
- Reasonable JS budget: reserve heavy interactive code for motion islands; measure before optimizing.
- Accessibility target WCAG 2.2 AA; minimum keyboard and reduced-motion verification is mandatory.

## Non-goals for v1
- Custom admin dashboard, CRM, payment processor, client portal, complex multi-language structure, speculative blog/news, detailed service pages without actual content, invented testimonials, fabricated analytics or claims.

## Open approvals
1. Current canonical name capitalization and vector logo/light logo variant; whether reference 3D emblem matches brand.
2. Exact website domain/contact email and authorized social URLs.
3. Genuine five service scopes and substantiation (especially web development, digital ads, writing).
4. Client projects/credits/provenance and publication rights.
5. High-res separate hand, frame, emblem and/or animation master; supplied videos and posters.
6. Contact-form destination/hosting/anti-spam and analytics/privacy policy.
7. Typeface license and final color tokens.
