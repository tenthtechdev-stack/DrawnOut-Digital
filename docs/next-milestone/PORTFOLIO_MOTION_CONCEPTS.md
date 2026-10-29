# DrawnOut Digital | Six Portfolio Motion Concepts

**Status:** Creative direction and preliminary source-artboard motion studies, 28 October 2026. These are not finished logo reveals: the provided PNGs are flattened presentation boards, not layered logo/packaging assets. The accompanying six 5.7-second silent MP4s demonstrate timing, crop behavior and visual variety using source imagery. For final web-ready pieces, rebuild high-value elements from verified editable assets where available and art-direct each loop individually.

## Creative principle

A moving portfolio, not six identical slideshows. Every selected featured project has an original 5–6-second silent loop on its project card, autoplaying only while visible, without hover. A real visual narrative should emerge: mark → application → close-up → return pose. The first and last frames must match for a seamless loop. Use poster fallbacks, optional video-only conditional rendering, and respect reduced motion and Save-Data.

## Project-specific stories

| Project | Motion idea | Visual elements / pace | Supplied source | Priority |
|---|---|---|---|---|
| **SOL Community Center** | **Symbol becomes a system** | Green-and-gold symbol draws by simple geometry, circles and negative space meet; a ring reveals a stationery/signage mockup, then a final green/gold ripple returns to the mark. Subtle, precise, community-focused. | \`02_SOL_Community_Center_01\`, \`_02\`, \`_04\`; signage, mark diagram, applications | Mandatory |
| **Bunzo** | **Packaging with punch** | Red blocks wipe in; logo locks into place; fast but legible packaging tilts, food/social application appears, and red forms reform the mark. Avoid inventing 3D packaging geometry if only 2D board available. | \`04_Bunzo_03\`, \`_04\`, \`_06\` | High |
| **Triarch** | **Architectural lines** | Fine black lines trace a monogram; rectangular grid extends and contracts; stationery slowly shifts in perspective; return to original clean black/white arrangement. Calmer than Bunzo. | \`14_Triarch_01\`, \`_02\` | High |
| **Churros Dessert Shop** | **Illustrated sweetness** | Playful arc/wipe introduces illustration, packaging details orbit across frame, warm background shifts; final circular reveal returns to first mark. Keep original illustrations unchanged. | \`07_Churros_Dessert_Shop_01\`, \`_02\`, \`_03\` | High |
| **By Tech Group** | **Identity in modules** | Purple/blue shapes divide into cards and panels; existing mark appears through progressive grid/circuit-like wipe; applications slide together, returning to initial geometric lockup. Avoid literal tech clichés. | \`03_By_Tech_Group_01\`, \`_02\`, \`_03\` | High |
| **U Wanna Smoothie** | **Liquid and flavor** | Color fills rise through organic masks; the illustrated identity and cups are revealed in rhythmic, elastic movement; loop resets through a liquid wipe. Never claim a physically simulated product unless genuinely modeled. | \`12_U_Wanna_Smoothie_01\`, \`_02\`, \`_03\` | High |

## Actual preliminary previews

Six silent MP4 studies are in \`mp4/\` of the companion archive. All six are 960×540, 24 fps, 5.708 seconds, encoded H.264. These **currently use pan/zoom transitions on flattened original portfolio boards**, not independently animated logos or mockups. They are visual timing proofs only; deliver the stronger project-specific concept in the final implementation.

## Website integration plan

- **Placement:** the six chosen project entries on homepage and Work index. Other project cards remain excellent poster images. Preserve accurate project titles and clicking to real case studies.
- **Behavior:** muted, playsInline, autoplay, loop; \`IntersectionObserver\` play only when at least 25–40% visible; pause as soon as offscreen, hidden tab or another resource-heavy element needs priority. Autoplay may be blocked, in which case retain the poster. No audio and no hover dependency.
- **Performance:** make per-project portrait and landscape crops; AV1/WebM where practical with MP4 fallback. Use still posters for nonvisible projects. Avoid loading all six full videos at initial page paint; lazy attach \`src\` on intersection. Aim for small files and optimize source design exports.
- **Accessibility:** \`prefers-reduced-motion\`, Save-Data and no-JS must show a meaningful static image; decorative videos aria-hidden and not duplicated as screen-reader text; visible controls and links remain usable.
- **Truthfulness:** no inferred client metrics, names, services, authorship, testimonials or campaign results. Supplied artwork approved for display only.
- **Validation:** record each loop with seamless first/last frame, check mobile/desktop crop, frame-accurate loops, memory/CPU and no layout shift, keyboard navigation, lazy start, offscreen pauses, and reduced-motion poster. Use the live site, not only generated files, for acceptance.

**Follow-up approval:** select these six proposed art directions, confirm editable assets where available, and replace preliminary studies with finished hand-art-directed logo/visual reveals. Do not claim the temporary portfolio-board transitions meet final animated logo reveal production quality.
