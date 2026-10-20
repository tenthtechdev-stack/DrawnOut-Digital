# Codex development roadmap, approval gates and quality assurance

## Working method
Build in incremental reviewable phases, with actual preview screenshots and functioning interactions. Phase output is not complete when the assistant says it is: completion requires evidence from the local build and a human check of desktop/mobile visual fidelity. Every phase must preserve prior approvals.

### Phase 0 — Repository and asset foundation (first task)
**Tasks:** verify installed tools and actual accessible files; initialize Astro, TypeScript strict and Tailwind; set up clean layout/paths; copy only appropriately sized portfolio placeholders; implement the typed project schema; create sample draft records (no unapproved published case routes); favicon placeholder if approved. Git rules, ESLint/formatter, basic test/dev/build commands, README.
**Deliverable:** compiling site skeleton and proposed component breakdown; two 2D static layout alternatives for hero/work (design proof only). Ask user which concept to pursue.
**Gate:** all sources documented, `npm run build` observed pass, no public claims or new pages inadvertently published.

### Phase 1 — Design foundation and navigation
**Tasks:** implement tokens, typography candidates (proper licenses), accessible header/mobile menu, common layout, buttons, responsive grid, footer fallback, global SEO defaults and routes. Use provided logo with temporary light-contrast treatment only if reversible and clearly labeled; request actual light wordmark.
**Gate:** 360/390/768/1024/1440 responsive previews, keyboard navigation, no overflow, high-contrast header states.

### Phase 2 — Homepage storytelling (static first)
**Tasks:** hero markup, CSS gradient prototype, editorial intro, service pillars, portfolio previews, approach, CTA; apply all actual user-supplied copy without overfilling the homepage. MediaSlot poster components; prototype layout variants.
**Gate:** creative review comparing with attached screenshots, primary CTA visible, no generic stock imagery, all media posters reserve dimensions, performance budget assessed.

### Phase 3 — Work and case-study system
**Tasks:** Work index, filters, shared case pages, related cards, multiple media blocks, schema validation, project draft/publish gate. Use sample content only with explicit draft labels until permissions supplied.
**Gate:** no unapproved project becomes public; demo 'add a project with Codex' from draft to private preview and demonstrate reuse of template without code duplication.

### Phase 4 — Motion system
**Tasks:** intro type reveals, section reveal, portfolio card reveal/expansion, ambient gradient drift, graceful reduced-motion path. One motion package and documented variants. No full footer until motion foundation is stable.
**Gate:** keyboard navigation and browser back/forward remain functional, no content invisible when JS off, reduced motion works, smooth at target devices.

### Phase 5 — Signature footer motion proof
**Tasks:** first build deterministic prototype with individually moving hand placeholder, frame and emblem; implement responsive scroll-master timeline; composite expands to background; live contact CTA overlays final image. Use a static stand-in when final assets not available; do not misrepresent it as photorealistic finish. Provide timeline debug mode in development only.
**Gate:** user approves sequence with forward and backward scroll video; mobile variant works; no pin gap/flicker; no fake final artwork. Wait for approved final hand/emblem/frame assets before production-grade finishing.

### Phase 6 — Real media, copy and forms
**Tasks:** replace placeholders with approved videos/assets when supplied; incorporate verified case narratives and final agency assets; wire contact form to authorized destination; validation, anti-spam/privacy/analytics subject to approvals.
**Gate:** all content publication checklist items completed; caption handling where required; form tested without exposing credentials.

### Phase 7 — Launch hardening and deployment
**Tasks:** performance audit with throttling; SEO/social previews/sitemap/canonical; accessibility audit; multiple browser/device regression checks; fix breakpoints and typography; final design review; confirm custom domain/hosting. Only deploy publicly after explicit consent.
**Gate:** release checklist complete, staging and rollback plan, tracked outstanding issues, stakeholder approval.

## Verification matrix
| Feature | Desktop | Mobile | Reduced motion | Keyboard/screen reader | Network/API failure |
|---|---|---|---|---|---|
| Header/nav | active and sticky states | menu & escape | no adverse dependency | tab/focus/labels | works offline once loaded |
| Gradient hero | readable motion | safe type wrapping | static gradient | real H1+links | poster or CSS only |
| Work cards | hover/reveal | tap/scroll | visible images | focus card link | fallback image |
| Filters | correct tagged counts | scrollable controls | normal | buttons & pressed state | no JS fallback if feasible |
| MediaSlot | poster/video switch | poster-safe | no autoplay motion | button accessible if video | poster & text |
| Footer scroll | forward/backward sync | simplified sequence | static CTA/background | no focus trap; direct link | no blank footer |
| Forms | validation + success | manageable keyboard | unchanged | labels, summary errors | helpful retry/error |

## Quantitative baseline goals (real audits required)
- CWV at 75th percentile when available: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- WCAG 2.2 AA target (test focus visibility, contrast, semantics, form labels, `prefers-reduced-motion`, content order).
- All pages have meaningful HTML titles, meta descriptions, H1, landmarks, internal links; `robots`, sitemap when published.
- No horizontal overflow at 320/360/390/768/1024/1440 widths; handle 200% zoom.
- 0 broken public URLs / missing image paths; no unapproved/copyright-questionable project pages.
- Manual Safari iOS and Android Chrome scroll review for pinning and viewport units; desktop Chrome/Firefox/Safari as available. If exact browsers cannot be tested, record limitation.
- Measure bundle and page asset sizes; choose performance thresholds after representative poster/video samples exist, not through arbitrary guesses.

## Design visual-review instructions
Compare: opening 1.5 viewport heights, first project reveal, services transitions, and first/middle/final footer states at desktop and mobile. Keep consistent screenshots after each phase, with list of corrected issues. For footer specifically compare progress 0%, 25%, 45%, 60%, 80%, 100% and reverse from 100% to 0%; test after orientation change and reload near the footer.

## Release blockers (must not be bypassed)
- No actual approved light/dark master logo and emblem confirmation.
- No portfolio permission/client-concept labeling for stories that will publish.
- No confirmed contact form destination/privacy handling.
- No real usable final 3D hand/logo resources if requirement is photorealistic branded footer; visually representative prototype alone is not production-ready.
- Serious accessibility/performance issues or broken navigation.

## If a requirement fails
Gracefully reduce visual complexity rather than breaking the user experience. A beautiful static footer with an excellent contact CTA is preferable to glitchy pinning. Report issues and explicit trade-offs for user approval rather than silently dropping the requested effect.
