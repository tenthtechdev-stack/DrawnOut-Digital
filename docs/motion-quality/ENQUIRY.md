# Bring us the pieces

The first review implementation lives on **Brand Identity & Design only**, at
`/services/brand-identity`. The other four service enquiry sections retain their
existing content and links. Creative approval is required before extending the
system to those routes.

## The composition

`src/components/services/EnquiryPuzzle.astro` renders the complete illustration
and a permanent Contact link. The composition uses open construction rules,
overlapping audience circles, a message notation, a directional arrow and a
paired diamond/square. These are conceptual design fragments, not fictional
client deliverables or actual submitted enquiry information.

The five labels move independently around the authentic DrawnOut emblem.
`src/assets/brand/drawnout-emblem-isolated.png` is a faithful alpha-preserving
crop of the supplied raster; it is not a newly drawn vector or a 3D model.
Its provenance is documented in `FAVICON.md` and `public/icons/source.json`.

The **7.8-second** active-time cycle is authored in
`src/scripts/enquiry-puzzle.ts`:

1. **Your idea:** independently offset, gently rotated fragments hold long
   enough to read. Nothing blocks the page or Contact link.
2. **DrawnOut:** an orange trace moves through the composition; fragments
   progressively translate and rotate into alignment. Construction rules draw
   as the emblem settles into its central pose.
3. **A direction:** the aligned composition holds. The last 1.35 seconds
   gradually withdraw the construction and restore the initial offsets,
   producing a smooth return without a cut or flash.

`src/styles/enquiry-puzzle.css` owns the responsive composition. The drawing
scales as one reserved SVG viewport, while the actual heading, supporting copy,
CTA and narrative captions remain semantic HTML. This is deliberately a graphic
thinking illustration, not literal jigsaw pieces or a simulated form.

## Behavior and fallbacks

- Complete final pose is the server-rendered default; no JavaScript, failed
  GSAP import, reduced motion or Save Data leaves a useful still illustration.
- Animation initializes lazily when at least 35% of the drawing is visible.
- The existing GSAP dependency drives a single scoped timeline. There is no
  custom animation-frame loop, scroll handler, pinning or focus manipulation.
- The timeline pauses offscreen, in a hidden document, while focus is inside
  the section, and on explicit user pause. Visibility/focus changes do not
  override a user's pause intent.
- Pause/play is exposed only after successful enhancement. The Contact link is
  outside all animated groups and is always available.
- A runtime preference change returns to the static final pose. Page lifecycle
  cleanup reverts animation styles and disconnects observers/listeners.

## Review evidence

Actual browser screenshots and full-cycle desktop/mobile recordings belong in
the milestone gallery. Runtime browser validation covers motion progression,
pause/resume, reduced motion, Save Data, no-JavaScript output, keyboard Contact
navigation and responsive sizes. Automated checks establish behavior; they do
not establish creative approval. Physical iOS/Safari and Android review remains
outstanding until performed on real devices.
