# Projects / Work Stage 1 — Brandlic-inspired immersive scroll expansion, preserving six motion loops

Source: https://github.com/tenthtech/drawnout-digital/issues/17

# DrawnOut Digital — Work / Projects, Stage 1: immersive portfolio index

## Owner direction / historical design reference

The owner asks to begin the previously discussed **Projects / Work experience** after About premium redesign PR #16. This is **NOT a Services page milestone**.

Previously approved direction: Brandlic Studio's work presentation as **inspiration for large project imagery, a clear project-information/content relationship, curved/organic image corners, scroll-linked project expansion, and continuous cinematic editorial browsing**. In previous visual review the existing Work page was judged _still too card/grid-based_, with simple image-mask/border-radius zoom effects insufficient. We need a distinctly **DrawnOut** result, not a replica of Brandlic's layout, artwork or code.

Reference: https://brandlic.studio/work/ ; prior user-supplied screen recording is authoritative for timing/art-direction if still accessible to Codex. If not accessible, use this written behavior specification rather than guessing exact competitor easing.

## Git and scope boundaries

- Development repo: `tenthtech/drawnout-digital`.
- At issue creation, PR #16 `feature/about-premium-redesign` head `0e127071ee5337ab3fbb04487fc358e0aef1024e` is a draft **stacked on PR #14**, with #14 on #12 on #10. Preserve all prior branches.
- Create `feature/work-immersive-index` from **latest** `feature/about-premium-redesign` while #16 remains unmerged; create a draft stacked PR targeting that branch. If it has merged, use up-to-date `main`.
- **Stage 1 only:** redesign the project presentation/index on `/work`, and refine related homepage featured-work behavior where useful **without reordering approved projects** or undoing the existing rhythm. Do not redesign all eleven detailed case pages in this stage. Preserve About, Services, Contact, recurring homepage loader, gradient, founder illustration, footer and existing media assets.
- Do not merge, deploy, or push to separate `tenthtechdev-stack/DrawnOut-Digital` Netlify mirror automatically.
- Push meaningful checkpoint commits early due repeated Cloud usage interruptions.

## Current source assessment

- `src/pages/work.astro` has the established editorial intro.
- `src/components/work/WorkPortfolio.astro` contains accessible content-derived filter controls and the index.
- `src/components/work/WorkCard.astro` currently uses a 12-column asymmetrical card grid (`wide/split/portrait/offset`) and `data-expansion-frame` mostly changing masks/scales; the _overall composition_ remains a card.
- `src/scripts/motion.ts` owns a generic scroll-linked media expansion, `src/scripts/portfolio-rhythm.ts` selects which video cards play, and `src/scripts/portfolio-titles.ts` owns one-time title reveals. Review those before modifying.
- Eleven existing routes are approved for **visual display only**, `contentVerified:false`, `creditApproved:false`, `projectType:unknown`. Project facts are NOT yet established; keep existing publication and attribution gates.
- Six existing 5–6s video loops (12 landscape/portrait exports) already exist: SOL, Bunzo, Triarch, Churros, By Tech Group, U Wanna Smoothie. **Do not regenerate them or auto-play all six simultaneously.** The approved curated first rhythm begins Bunzo static → SOL animated → Triarch static → Churros animated, rather than naively forcing animated-first.

## Stage 1 deliverables

### 1. Preserve the Work editorial entry, elevate the index

The Work page should feel like a succession of large, original _project visual scenes_. Each featured project has a strong layout with:

- A dominant approved artwork image/video covering much of the viewport without cropping essential identity.
- A properly balanced project title, compact visually grounded category/metadata, and a natural `View project` affordance.
- A scroll-linked transition that expands the **whole image/frame/composition** into an immersive wider scene (optionally near-full-bleed for selected featured projects), with soft organic/editorial corner geometry and deliberate changes in surrounding whitespace.
- Smooth shrink/reversal on backscroll, matching native scroll progress, not a one-time hover zoom or 100vw scaling applied indiscriminately.
- Distinct treatment of **Bunzo**, **SOL Community Center (mandatory anchor)**, and **Triarch** as the pilot; test a contrasting fourth, **Churros**, to validate visual variety. Other 7 projects must still be accessible, prominent enough, and visually good: do not make them disappear behind experimental featured scenes.
- **Do not imitate Brandlic's filter tabs or duplicate its composition verbatim.** Keep DrawnOut's current functional category filters and native scroll.
- Avoid card-image-only scale and rounded border as the sole effect. Target connected type, moving frame geometry and project visual dominance.

### 2. Motion, editorial rhythm and navigation

- Keep the previously approved alternation of **static and animated** projects visible during normal scroll; dynamic filters must preserve eligibility and provide a readable layout even if order yields more static gaps.
- Retain six video asset options, lazy mounting, IO play/pause, Save Data/reduced motion static posters, mobile decoder budgets and pause visibility. Avoid unloading/reloading video just because a frame grows.
- Keep existing subtle, one-time animated project titles/metadata. Integrate title movement into the overall scroll composition where appropriate, but DO NOT repeatedly bounce, reveal or conceal semantic text; focus reveals immediately.
- Each scene retains a genuine accessible `/work/<slug>` link; optional pointer cursor movement must never hijack clicking or keyboard focus.
- The expansion is scrubbed by **native scroll**, reversible both directions, not scrolling a fake viewport or hijacking wheel input.
- Image/card aspect ratio preservation, responsive crop art direction, reserved dimensions and zero unexpected horizontal overflow.
- Resist creating a huge pinned narrative with six stacked canvases. Keep actual page length reasonable and fluid.

### 3. Scope of case pages in Stage 1

Existing `src/components/case/CaseStudy.astro` and `CaseGallery.astro` remain functional. Only fix clear integration problems caused by Work-index transitions. Individual in-depth redesign and verified project narratives are a separate Stage 2.

## Stage 2 / later work (do not implement yet)

Once Stage 1 is visually approved:

- A content-driven premium case-study template with immersive opening art, optional case-motion, storytelling images and varied gallery compositions, related/next cases, and a measured CTA.
- Start with **SOL**, Bunzo and Triarch as visual pilot pages, expand to remaining published projects without identical repetition.
- Sections that require verification (actual brief, objectives, approach, services, team/credit, deliverables, year, outcome and quantified results) must remain absent until client provides evidence and approves attribution. Do not invent facts or mark `contentVerified`/`creditApproved` true merely to populate the design.
- If actual project details are unavailable, write only visually descriptive text accurately grounded in the supplied artwork.
- Ensure 3–8 meaningful image perspectives per substantial case where approved assets support it; don't fake imagery or identical repeats solely to meet a count.

## Visual approval requirements

1. Real desktop 1440×900 and mobile 390×844 recordings: natural scrolling through Bunzo → SOL → Triarch → Churros, including **reverse scroll** to show actual expansion/contraction. At least one full forward/reverse sequence.
2. Static screenshots at 0%, 50%, 100% expansion for SOL and contrasting Bunzo at 1440 and mobile; retain content/title in the frame, not detached before/after images.
3. Filter interaction with expansion and videos: categories, URL/history, browser back/forward, keyboard/touch focus, no-JS and reduced motion/Save Data.
4. Confirm real case route linking and previous/next navigation; no attribution/facts published accidentally.
5. No new client data, invented performance metrics, unrelated redesign or 3D model claims. Existing hand/plaque still raster prototype; new About 3D issue separate.
6. Run `npm run check`, `npm run lint`, `npm test`, `npm run build`, `npm run test:build`, `npm run test:publication`, `npm run format:check`, and focused Playwright; report _actual_ results, original failures and corrections honestly.
7. Push checkpoints early and open draft PR with code, evidence gallery, original artwork rights boundary and known device/performance limitations. Do not claim physical Safari/hardware testing without performing it.

### Acceptance principle

The user should be able to see **the art and project information expanding as a coherent editorial composition**, not just see a small card's picture zoom. The new Work page must feel designed and continuously interesting without becoming constantly moving or hard to navigate.
