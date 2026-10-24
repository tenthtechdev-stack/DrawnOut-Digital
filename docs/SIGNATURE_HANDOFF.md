# DrawnOut Loop — signature experience handoff

The signature milestone adds the first-visit opening, living Afterglow gradient,
selected editorial scroll treatments, linked public portfolio and shared closing
composition. The website implementation is available for review. **The final
photorealistic hand-and-emblem animation remains incomplete:** the opening and
footer animate the supplied hand/emblem composite intact.

This handoff follows the [signature brief](SIGNATURE_EXPERIENCE_BRIEF.md), which
supersedes conflicting earlier motion proposals. Work is on
`feature/drawnout-signature-experience`, based on approved `main` at
`0ef900b72132f4ab1069da6b824cb1facfe2c95e`. The original storyboard attached to the task was inspected: six outlined
project squares rise and fall along the connecting wave before the hand/logo
composition. Its choreography and the authoritative brief guide this implementation.

## Implementation

- **Opening:** staggered outlined squares reveal approved artwork along an SVG
  wave; timed square reactions and individual DrawnOut letters lead into the
  shared reference composition. A parser-time controller owns the session rule,
  immediate input/skip exit and failure deadline, independently of animation
  module or GPU loading. The configured completion is 4.2 seconds after start,
  with a 4.8-second navigation deadline; observed durations belong in validation.
  Direct case routes, returning visits, reduced motion, data saving and hash
  navigation bypass the opening. The normal homepage remains semantic HTML.
- **Living gradient:** a small, single-pass WebGL shader blends evolving orange,
  amber and lilac fields with a restrained desktop pointer response. Graphics
  initialization waits until the entrance releases the page. Rendering is capped
  at 30 fps, DPR 1 and a 720 × 800 canvas, and pauses offscreen or in a hidden tab.
  CSS supplies the animated fallback; reduced motion/data saving use a static
  field. Actual renderer and cloud performance observations accompany the captures in the validation report.
- **Editorial motion:** selected manifesto headings use reversible, native-scroll
  SplitText/ScrollTrigger treatment. Supporting titles use bounded entrance
  reveals. Portfolio and case images have separate motion layers, with a major
  immersive expansion and reverse scrub. Responsive re-splitting, filter/image/
  font refresh and lifecycle cleanup preserve links and stable document geometry.
- **Portfolio:** all eleven existing approved artwork records have real
  `/work/<slug>` pages, Work filters and previous/next navigation. Homepage cards
  link to those public routes. Explicit visual display approval is separate from
  factual and credit review: the supplied records retain unknown commissioning,
  unverified content, unapproved attribution and empty service claims. Future
  drafts and withdrawn records are gated before Astro registers their images.
- **Mobile header:** a native disclosure provides the initial and no-JavaScript
  menu in the same reserved footprint as the enhanced dialog control. Enhancement
  no longer removes an in-flow navigation row. Measured startup geometry and attributed layout shifts are reported separately in validation.
- **Footer:** the intact portrait composite rises, a decorative outline descends,
  the composition holds and expands under a scrim. One reversible ScrollTrigger
  timeline controls these layers. Contact and navigation stay live HTML above the
  decoration; the static composed footer is the fallback.

## Asset quality and remaining production work

Both supplied SVGs remain unchanged. They are identical raster wrappers with an
opacity mask, not independent hand and emblem geometry. The shared
`SignatureArtwork.astro` uses a faithful transparent WebP derivative, preserves
portrait proportions and is identified as `reference-composite-prototype`.
The descending outline is a decorative frame; it does not demonstrate separate
emblem descent or a changing finger grip.

The [packed Blender scene](../design-assets/signature-study/signature-glass-study.blend)
and [render](../artifacts/signature/signature-glass-study.png) are real editable
material-study deliverables. The scene contains a supplied-reference image plane,
new geometric acrylic plate, pedestal, camera and lights. Inspection shows visible
transmission grain and the flat reference card. It has **no hand mesh, hand rig,
editable emblem or rendered animation sequence**, and its render is not used as
website imagery. Passing functional tests cannot establish final photorealism.

Production still needs an approved realistic hand with documented rights, rig and
skin/nail materials; an accurate editable emblem; approved frame/glass geometry;
grasp/contact/occlusion animation; and desktop/mobile cameras with enough background
for expansion. An approved rendered master sequence can supply the animation if
its rights and responsive views are clear. See the [asset process](SIGNATURE_ASSET_PROCESS.md)
for reproduction commands, provenance, exact required inputs and proposed
transfer/decode budgets. Those sequence budgets are targets, not delivered assets.

## Source map

| Area                          | Main files                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Intro and shared artwork      | `src/components/SignatureIntroBoot.astro`, `SignatureIntro.astro`, `SignatureArtwork.astro`; `src/scripts/signature-intro.ts` |
| Gradient and editorial motion | `src/components/LivingGradient.astro`; `src/scripts/living-gradient.ts`, `motion.ts`; selected homepage/case components       |
| Footer and navigation         | `src/components/SiteFooter.astro`, `SiteHeader.astro`; `src/scripts/signature-footer.ts`, `navigation.ts`                     |
| Publication                   | `src/lib/project-schema.ts`, `projects.ts`; project records; Work/case templates and public links                             |
| Asset sources and capture     | `scripts/signature/`; `design-assets/signature-study/`; `scripts/capture-signature.mjs`                                       |
| Verification                  | `tests/browser/signature-*.spec.ts`; updated content, portfolio, build-output and publication-workflow tests                  |

The [portfolio audit](SIGNATURE_PORTFOLIO_AUDIT.md) explains all fifteen original
source folders. No additional client projects were invented from miscellaneous,
internal or unstructured folders. The [portfolio workflow](PORTFOLIO_WORKFLOW.md)
documents adding, editing, ordering and withdrawing records.

## Verification and delivery status

The [visual gallery](../artifacts/signature/README.md) provides desktop/mobile
screen recordings, opening GIFs, responsive stills and local production-build
screenshots. The [validation report](SIGNATURE_VALIDATION.md) records the actual
commands, final counts, intro timings, mobile-header geometry, publication smoke
checks and software-WebGL performance limits. Machine-readable evidence accompanies
the gallery.

Implemented and visually inspected: the outlined-square/wave/lettering opening,
automatic homepage handoff, live gradient, public Work/case pages, framed-to-immersive
image expansion, reversible editorial/footer choreography, and responsive
navigation. The supplied reference and actual Blender render were compared.
The independent photorealistic hand/emblem master remains blocked on the production
inputs described above. Physical-device GPU smoothness and Safari/iOS/Firefox behavior have
not been visually verified in this cloud Chromium environment.

Review should decide the choreography and responsive composition, plus the asset
direction needed to finish the realistic hand/emblem master. The authorized
delivery is a branch and PR for review; merge and public deployment require
separate approval. Agency showreel and content-production planning remain deferred.
