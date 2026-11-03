## Decision and dependencies

**Owner approved** the overall visual direction of Services Stage 1 in PR #12 (commit `3e59c251230a4bcddb8eb548ad9c853daa116e37`). Begin Stage 2: replace the simple rows **below** the existing cinematic hero on `/services` with five substantial editorial, art-directed visual chapters. The owner's correction requests for the About hero and homepage introduction are recorded separately in [PR #12 review](https://github.com/tenthtech/drawnout-digital/pull/12#issuecomment-6605751248); do not put those fixes in this Stage 2 branch. Keep the Services Stage 1 animation untouched unless correcting a direct integration bug.

## Git strategy

- `main` includes approved foundation/service pages. PR #10 is open; PR #12 is a draft stacked on PR #10.
- Create `feature/services-overview-chapters` based on the latest `feature/services-cinematic-hero` branch **after** it incorporates the requested owner corrections, or explicitly record its SHA as the working base and resolve the later PR #12 amendments by fast-forward/rebase before merging.
- Open a **draft stacked PR** targeting `feature/services-cinematic-hero` while PR #12 remains unmerged. If #12 is merged, base on current main. Do not merge automatically or push to the separate Netlify repo.

## Intent

The current `src/pages/services.astro` has an excellent cinematic Services hero followed by a minimal `.service-foundation` list of five services. The owner wants a **KOTA-like spacious editorial treatment without filters**: natural continuous scrolling reveals each of five services in a distinct image-led chapter, preserving the Afterglow design, generous breathing space, brand voice and service-specific clickthrough.

Do not copy KOTA code, graphics, layout verbatim or create a tab/filter selector. Use original DrawnOut identity and production-ready visual art.

## Five chapters, canonical service data

Source service names, propositions and links from `src/data/service-index.ts` / `src/data/site.ts` and keep slugs consistent:

1. Brand Identity & Design — "Make your brand look like it knows who it is." → `/services/brand-identity`
2. Digital Design — "Your brand should feel like itself everywhere." → `/services/digital-design`
3. Marketing & Campaigns — "Make every impression mean something." → `/services/marketing-campaigns`
4. Words & Storytelling — "Because what you say matters as much as how it looks." → `/services/words-storytelling`
5. Creative Direction — "A bigger idea needs a bigger picture." → `/services/creative-direction`

## Layout and visuals

- Give each service its **own full editorial scene** on desktop, roughly 70–90vh when content permits; natural responsive height on tablet/mobile; avoid tall empty panels just to enforce a quota.
- Across five chapters, art-direct distinct compositions, not five copy-pasted boxes: alternate text/art placement; use one or two curated modular image tiles as appropriate, KOTA-inspired visual density, clean dividers and large typography. Show service number, title, existing proposition, explanatory micro-copy only if sourced and verified, and an obvious link (entire meaningful card/CTA if appropriate) to its dedicated route.
- All artwork should _depict the service itself_: brand mark construction/sketches, wireframe→interface, campaign system, editorial typography/messaging, visual moodboard/art-direction convergence. Compose actual custom SVG/layered/3D-style graphics with coherent production quality; no generic Lucide/stock placeholder icons as final featured artwork.
- Authentic portfolio assets can be reused as visual presentation examples only subject to existing display-approval gate and truthful attribution; do **not** invent client work, process sketches or case-study results. When drawing fictitious creative-process sketches, clearly treat them as illustrative demonstrations, not historical artifacts.
- Use existing color system (paper/charcoal/orange/amber) and selective complementary tones. Visual rhythm should be playful but curated; do not reproduce the same graphic in every chapter.
- A gentle scroll-linked or viewport-entry motion can reveal imagery/labels, but it must not delay scrolling, hijack wheel events, pin entire sections excessively, break backscroll, or hide text when JS fails. Prefer native scrolling, responsive transforms and sensible reduced-motion.
- Keep the new cinematic hero, normal header/nav/footer, existing five detail routes/FAQs, Contact and portfolio intact. The animated puzzle inquiry and individual detail-page mosaics are **later milestones**, not Stage 2.

## Review and acceptance

- Capture real desktop 1440 and mobile 390 recordings of native scrolling through all five chapters; record return/reverse and click to each detail route.
- Screenshot each full service scene at 1440 and 390, plus tablet 768 and small 320 layout, and reduced-motion/no-JS.
- Show that headings/links work without JS, keyboard focus is visible, page has one H1, no horizontal overflow and all service chapters/CTA links remain navigable. The five existing service pages must remain accessible and preserve original content and FAQ.
- Run build, type checks, lint, format, unit, publication and focused Playwright plus preservation tests. Document genuine results; no claims of physical-device or Safari performance without tests.
- Push checkpoints early; open draft PR and provide branch, SHA, gallery, real videos, validation report, any limitation. Do not begin the individual service detail redesign until owner approves Stage 2 compositions.
