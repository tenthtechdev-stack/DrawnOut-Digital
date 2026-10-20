# Phase 1 — Afterglow foundation

The user approved Concept A as the working direction and authorized only Phase 1. The implementation preserves the orange-led atmospheric hero, bold typography, original DrawnOut copy, and editorial portfolio rhythm. It is ready for visual review, not launch.

## Design decisions

- Retained the locally served Manrope variable font and warm paper/ink foundation. Display, section, body, caption, spacing, gutter, radius, focus, and transition tokens now share one source in `src/styles/global.css`. Bright orange supplies atmosphere; darker orange supplies readable text.
- Incorporated B's concise five-pillar capability index immediately after the hero. Each item links to the matching Services foundation anchor. Kept A's large lead project and introduced one paired row underneath; the split hero from B was not adopted.
- Shared desktop navigation uses the approved Work / Services / About / Contact architecture. Mobile navigation progressively enhances to a native dialog with explicit keyboard containment, Escape/backdrop/close handling, restored focus, and desktop-resize cleanup. Without JavaScript, the links remain visible.
- Kept the authentic raster logo on light paper without changing its proportions or colors. The dark footer uses live text for the studio name; an approved light logo master is still needed for later final branding.
- The footer is a static, usable CTA/navigation foundation. Its decorative frame is original CSS geometry, not a recreation of the low-resolution hand screenshot or a completed branded animation.

## Component ownership

| Files                                                                                                | Purpose                                                                                |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/styles/global.css`, `src/data/site.ts`                                                          | Shared working tokens and canonical navigation/capability/source-copy constants.       |
| `src/layouts/SiteLayout.astro`                                                                       | Shared semantic document, metadata, skip link, header, footer, and local review label. |
| `SiteHeader.astro`, `src/scripts/navigation.ts`                                                      | Progressive navigation and its scoped client behavior.                                 |
| `Hero.astro`, `Button.astro`, `CapabilityStrip.astro`, `SectionIntro.astro`                          | Reusable foundation primitives.                                                        |
| `WorkFoundation.astro`, `PreviewWork.astro`, `ProjectCard.astro`, `MediaSlot.astro`                  | Development-only draft preview, lead/paired layouts, responsive poster sizes.          |
| `SiteFooter.astro`, `RouteIntro.astro`                                                               | Static footer and minimal route introductions.                                         |
| `src/pages/index.astro`, `work.astro`, `services.astro`, `about.astro`, `contact.astro`, `404.astro` | Homepage foundation and navigation route shells.                                       |
| `tests/browser/foundation.spec.ts`, `tests/contrast.test.ts`, `tests/build-output.test.mjs`          | Interaction, responsive, contrast, route, and draft-exclusion checks.                  |

The existing typed project collection, draft defaults, provenance requirements, approval selector, and original source documents remain intact. No custom admin or additional runtime framework was added.

## Motion seams, without cinematic motion

Hero phrases have semantic `data-type-line` groups; critical text starts visible. The atmospheric layer is independent of text. Project image dimensions reserve space, and card wrappers are separate from media. The footer's artwork and live content are independent layers. These are places for later scoped motion, not active scroll timelines. Native vertical scrolling, direct contact navigation, and reduced-motion readability remain available. No GSAP, pinning, wheel handling, hand/emblem timeline, or scroll hijacking was introduced.

## Content and route boundary

Production builds Home, Work, Services, About, Contact, and 404 with shared metadata and noindex. These are foundation routes, not completed service/about/contact pages. The enquiry channel is explicitly pending; no fabricated address or nonfunctional form is presented. A canonical domain and social/organization details are omitted until confirmed.

Only development previews include the three supplied project stills. All seven collection entries remain draft/private/unapproved. Production excludes draft case routes and project images. No project card links to an unapproved case. All future published project consumers must use `getPublicProjects()`.

## Review evidence and boundary

Screenshots are under `artifacts/phase-1/` at 390, 768, and 1440px: full page, hero, header, capability presentation, work layout, and footer; a separate 390px capture shows the open menu. Section captures temporarily hide the sticky header so it does not obscure the cropped evidence. Whole-page and header captures retain actual navigation.

Final observed commands/results are recorded in `PHASE_1_VALIDATION.md`. Current-machine Chromium checks do not establish real-device Safari/Android behavior, assistive-technology conformance, production performance, publication, or fresh-task restoration.

Review Phase 1's design system, navigation, capability index, portfolio pairing, and footer foundation. **Stop here until Phase 1 is approved and Phase 2 is explicitly authorized.** Later production prerequisites remain documented in `ASSET_AUDIT.md`.
