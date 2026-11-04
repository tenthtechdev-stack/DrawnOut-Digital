# Services overview artwork and handoff

Five original SVG illustrations are authored in
`src/components/services/overview-art/`. They are decorative service
demonstrations, labelled “Illustrative study” in every chapter. They are not
portfolio case studies, client deliverables, historical studio process or a
replacement for the approved DrawnOut emblem.

| Chapter                 | Original composition                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand Identity & Design | A constructed circular form on a ruled artboard, paired with an orange type specimen and colour swatches. The circular exercise is an invented illustrative form, not a traced DrawnOut mark. |
| Digital Design          | A wireframe behind a finished desktop composition and a separate phone layout, demonstrating a shared visual language.                                                                        |
| Marketing & Campaigns   | A large campaign poster, coordinated social formats and a banner sharing one graphic motif.                                                                                                   |
| Words & Storytelling    | An editorial spread with typography, proof marks and a resolved messaging card, including the existing studio signoff.                                                                        |
| Creative Direction      | A curated arrangement of colour, texture, typography and form, resolving into a single composition.                                                                                           |

All artwork uses custom SVG paths, shapes, typography, gradients and restrained
shadows. No competitor graphics, stock icons, external image service or new
runtime dependency is used. The artwork is complete in the static HTML and does
not depend on JavaScript to appear. Reserved view boxes prevent asset layout
shift. Decorative SVGs are hidden from screen readers; real headings, copy and
links provide the service information.

Titles, propositions and slugs come from the existing `capabilities` data,
which uses the canonical service index. Each chapter has one descriptive link.
The approved cinematic hero and its assets/runtime are byte-for-byte unchanged
by Stage 2. All five service detail pages and their FAQs remain unchanged.

The layout alternates text/artwork on desktop, with a dark final chapter and
natural single-column reading order on mobile. No filters, tabs, scroll locking
or section pinning are introduced. A small observer enables a single decorative
entry movement; reverse scrolling retains the settled artwork. Keyboard focus,
reduced motion and Save Data settle all illustrations immediately. Missing
JavaScript or IntersectionObserver leaves complete static chapters.

Review the five chapter compositions before beginning the individual service
detail mosaics or the puzzle enquiry sequence. Those stages are not included.
