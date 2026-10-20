# Phase 0 handoff

This milestone follows the first prompt in the [supplied start prompt](source-pack/docs/CODEX_START_PROMPT.md): repository and asset foundation, typed draft content, and two static responsive hero/work studies. It does not claim a finished website or final identity.

## Design alternatives

- **A — Afterglow:** an expansive warm atmospheric hero, oversized typography, and alternating editorial work rows. Work leads the page narrative.
- **B — Studio Edit:** a split hero pairing the supplied headline with a portfolio still, a compact five-pillar service strip, and paired project imagery. This tests the service-first sequence proposed in the pack.

Both preserve the supplied headline and primary CTA language, use actual supplied portfolio stills, and identify work as pending review. Type, colors, layout, and supporting presentation remain proposals. Competitor art is not used as website content.

Run `npm run dev` from the checkout to review `/concepts/a` and `/concepts/b`. These are development-only proofs. The production build creates a neutral, noindex foundation page; draft project routes and media are excluded. Local screenshots are saved under ignored `artifacts/` when the browser checks run.

## Architecture

| Area                                 | Current ownership                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `src/layouts/ReviewLayout.astro`     | Semantic page shell, title, noindex metadata, skip link and global styles.                                           |
| `src/components/DesignConcept.astro` | The two review compositions; static markup without a motion engine.                                                  |
| `Brand`, `Arrow`, `ReviewBar`        | Supplied logo presentation, decorative direction cue, and concept comparison navigation.                             |
| `MediaSlot.astro`                    | Optimized local poster, reserved aspect ratio, descriptive alt text and placeholder label. No invented video player. |
| `src/content.config.ts`              | Astro glob loader with image-aware project schema.                                                                   |
| `src/content/projects/*.json`        | Single canonical metadata source; seven private, unapproved drafts.                                                  |
| `src/lib/project-schema.ts`          | Shared schema, `canPublish`, and pure public selection/order.                                                        |
| `src/lib/projects.ts`                | `getPublicProjects` and explicitly development-only `getDraftPreviewProjects`.                                       |

Publication requires all of: `status: published`, `visibility: public`, `publicationApproved: true`, `creditApproved: true`, and known client/concept/internal provenance. This gate records human decisions; it does not obtain permissions. Future homepage, work, case, related-work, feed and sitemap consumers must share the public selector.

The project uses Astro, strict TypeScript and Tailwind, with a local Manrope font candidate, ESLint, Prettier, Node content tests and Playwright browser checks. GSAP is deferred until the approved motion phases; there is no need to ship it for static studies.

Later reusable components should separate the approved header/menu, project cards, service index, process steps, case template and signature footer. The current concept composition is a review artifact, not a mandate to keep all future pages in one component.

## Validation and limits

Run the commands in the root README. The relevant checks are `npm run check`, `npm run lint`, `npm test`, `npm run build`, `npm run test:build`, `npm run test:browser`, and `npm run format:check`.

Content tests cover safe defaults, independent approval conditions, slug safety, existing media, and public selection. The build-output check verifies that production contains only the neutral page and excludes draft media. Browser checks cover responsive layouts, functional anchors, images, concept comparison, keyboard access, and a readable no-JavaScript/reduced-motion path. Results must be reported from actual runs; this handoff does not claim launch performance, production accessibility certification, or real-device Safari/Android validation.

No real enquiry delivery, project case routes, public work filters, live video, scroll-linked motion, or final footer sequence is implemented in this phase. No remote service has been modified or website publicly deployed.

## Next review

Choose **A — Afterglow**, **B — Studio Edit**, or specific elements of each before Phase 1 establishes approved design tokens, responsive navigation and shared layouts. This review boundary comes from the supplied [phase roadmap](source-pack/docs/PHASES_AND_QA.md), which requests two alternatives and a concept decision before the design foundation.

The [asset audit](ASSET_AUDIT.md) records later production prerequisites; missing final footage and brand masters do not prevent reviewing these static studies. The original copy and research remain available under [source-pack/docs](source-pack/docs/MASTER_SPEC.md), with the original project instructions preserved in root `AGENTS.md`.
