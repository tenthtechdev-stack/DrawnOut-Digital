# Five-pilot artwork curation

The Stage 2 owner authorization permits five review pilots, not a rollout to the other six routes. This audit records the actual optimized artwork inspected for SOL Community Center, Bunzo, Triarch, Capture and By Tech Group. The existing project JSON records and original/optimized image files are unchanged.

## Runtime and approval boundary

`src/lib/case-presentation.ts` is the typed presentation adapter. It resolves image metadata only from the supplied project's existing `cover` and `gallery`. It imports no portfolio images directly. `canPublish` runs before a pilot is selected, so withdrawing visual-display approval cannot retain a pilot route or independently imported artwork. Missing curation images fall back to the existing case presentation rather than inventing a substitute.

The source editorial package remains preserved under `docs/portfolio-case-rebuild/`. Its visual-only proposals were shortened and checked against the actual images. The runtime adapter contains no SEO candidate fields, attribution, client names, services performed, dates, results or testimonial fields. Its service link is related site navigation, not a statement of commissioned work. The existing metadata gates remain authoritative.

## Curated counts

| Pilot                | Total unique image files | Main composition                   | Source limitation                                                                                             |
| -------------------- | -----------------------: | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| SOL Community Center |                        5 | Four-piece mosaic, plus one detail | Five derivatives describe three source boards; signage and apparel are details of the applications board.     |
| Bunzo                |                        5 | Four-piece mosaic, plus one detail | Six candidates reduce to five because the wide packaging crop repeats the top of the full applications board. |
| Triarch              |                        3 | Three-piece composition            | The full identity board repeats the card/letterform details and includes unrelated scope/price language.      |
| Capture              |                        3 | Three-piece composition            | Two source boards; the stationery detail is a closer view of the applications board.                          |
| By Tech Group        |                        2 | Two-piece composition              | Two source boards; a third artwork is not fabricated.                                                         |

These counts describe useful visual perspectives, not independent deliverables, commissioned services or five different original works. No file appears twice within a pilot's lead and gallery selection. A detail crop can provide a meaningful close view without being described as a separate project deliverable.

## SOL Community Center

- Lead: `sol-community-applications.webp`, the existing collage of signage, apparel and branded objects.
- Gallery: `sol-identity-system.webp`, `sol-notice-layouts.webp`, `sol-community-signage.webp`, `sol-apparel-detail.webp`.
- Source provenance in the canonical record identifies originals `02_SOL_Community_Center_01.png`, `_02.png` and `_04.png`. Signage and apparel are non-overlapping panels of `_04`, also visible in the lead collage.
- The identity board includes source rationale, palette and typography references. Public prose describes visible circular forms, color, lettering and mockups; it does not adopt that rationale as a verified creative process or agency contribution.
- The existing approved SOL motion loop may occupy the lead presentation. A portrait-ish grid slot is a layout choice; the application collage is natively landscape and must remain contained rather than being cropped into a fake portrait image.

## Bunzo

- Lead: `bunzo-cup-detail.webp`, a genuine portrait crop suited to the lead frame and the existing portrait motion export.
- Gallery: `bunzo-packaging-wide.webp`, `bunzo-identity.webp`, `bunzo-social-layouts.webp`, `bunzo-bag-detail.webp`.
- `bunzo-applications.webp` is deliberately omitted from the new pilot presentation: `bunzo-packaging-wide.webp` is exactly its principal top panel. Showing both as two major pieces would repeat the same packaging family.
- Provenance records originals `04_Bunzo_01.png`, `_03.png`, `_04.png` and `_05.png`. The cup and bag are different non-overlapping panels of `_04`, not two independently delivered projects.
- The original `_06` source with metrics is not introduced. The social-layout image is promotional artwork, not evidence of campaign reach or performance. Source product slogans are not adopted as claims about real ingredients or outcomes.

## Triarch

- Lead: `triarch-business-card.webp`.
- Gallery: `triarch-letterform-detail.webp`, `triarch-device-detail.webp`.
- `triarch-identity-board.webp` is deliberately omitted. Actual inspection shows the same card on its right and the same wordmark at upper left, plus an embedded statement about scope, price and packaging at lower left. It contributes no sufficiently distinct fourth view.
- The first two selected files are separate visual panels of `14_Triarch_01.png`. The device crop is from `14_Triarch_02.png`; its adjacent pricing panel remains excluded.
- Three real perspectives receive a three-piece composition. No image is duplicated or new mockup fabricated to satisfy a nominal four-tile count. Copy names visible typography, paper texture, architectural imagery and a yellow accent without adopting source scope or pricing statements.

## Capture

- Lead: `capture-applications.webp`.
- Gallery: `capture-identity.webp`, `capture-stationery-detail.webp`.
- The applications and stationery crop share original `05_Capture_02.png`; the identity board is original `_01.png`.
- Some existing approved raster artwork contains names, contact text and social-profile figures. They remain source artwork only. None is transcribed into the public editorial copy, alt descriptions, metadata, structured data or attributed credits. No claim is made about a real agency, person, audience size or live social account.
- The close stationery perspective is explicitly captioned as a closer view of the same presentation. There is no video for this project, and no substitute video is introduced.

## By Tech Group

- Lead: `by-tech-applications.webp`.
- Gallery: `by-tech-identity.webp`.
- These are the two existing approved source boards, `03_By_Tech_Group_03.png` and `_01.png`.
- Application-board names, roles, contact strings and screen text remain embedded source artwork and are not turned into factual claims. The app icons and phone scene are described as concepts/mockups, never a released app or implementation.
- The two-image composition remains intentional and substantial. The existing motion loop can feature the same artwork; it does not create additional photographic evidence or a third deliverable.

## Owner review and remaining limits

Final review must assess the contained artwork at desktop and mobile sizes, the scale of dense source boards, the distinction between a full board and a detail crop, and the five pilot compositions. Existing small raster derivatives limit detail at very large display sizes; no upscaled replacement or generated artwork is introduced here. The source contact text/figures within already-approved rasters are not independently verified facts. Physical-device testing and final pilot visual approval remain separate review steps.
