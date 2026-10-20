# Design system and art direction

## North star
The interface should feel like a **creative editorial publication in motion**: strong typographic scale, custom layout rhythm, energetic but controlled color, excellent project crops, precise transitions, and quiet utility. Portfolio work remains the star. Originality over visual noise.

## Working palette (NOT final approved brand colours)
- `--ink: #171717` / `--charcoal: #282625` — main type/dark surfaces
- `--paper: #F7F5F1` — warm off-white backgrounds
- `--orange: #F05A28` — brand-proximate accent **estimated** from logo, not sampled approved swatch
- `--amber: #FF9A43` — ambient highlight
- `--cream: #FFF8EE` — light tone
- `--neutral: #FFFFFF`
- hero atmospheric extras (sparingly, never as core logo color): muted rose, lavender and near-blue to give depth. Do not reproduce KOTA's precise gradient arrangement.
All final colors must be validated for text contrast against actual backgrounds. Deliver an explicitly light wordmark on dark header backgrounds from approved assets.

## Typography
Use a high-quality grotesk/sans with bold expressive headline styles and clear reading font. **Font names are not locked.** Verify allowed licensing and availability before shipping. Define type tokens using `clamp()`: hero ~ `clamp(3.1rem, 8.4vw, 10rem)` on desktop, smaller mobile rules; H2 ~ `clamp(2.4rem, 5vw, 6.5rem)`; body ~ `clamp(1rem, 1.15vw, 1.25rem)`. Measure readable line-lengths and line breaks at each breakpoint. Do not clip words outside safe-area on mobile.
Recommended editorial choices: occasional condensed captions, uppercase mono-sized section numbers, oversized open letterforms, but no gratuitous distorted type.

## Grid and spacing
- Max page grid roughly 1440px with fluid side gutters `clamp(20px, 4.2vw, 88px)`.
- 12-column desktop principles and 4-column mobile; allow asymmetrical spans for projects.
- Section rhythm distinct: some quiet whitespace, some bold full-bleed color/media stages.
- Avoid monotonous repeated cards/rounded boxes. Mix editorial rows with purposeful art-led section breaks.
- Corner radius vocabulary: 0–4px for utilities, 12–24px for cards, up to 40–96px for selected expansion scenes. Treat dramatic rounding as one notable motif, not a universal token.

## Gradient hero (KOTA-inspired, DrawnOut-owned)
- The hero should use 3–4 low-frequency radial-color fields against a brand-safe base. Example technical concept: orange/amber front light, cream left/top diffusion, muted magenta-violet side reflection, dark negative space for logo contrast where appropriate.
- Gentle scale, translation or CSS-variable drift; an intentionally **subtle** cycle, not a continuous intense rotating rainbow.
- Hero text remains readable at every frame with a controlled dark/bright type treatment; avoid text blending modes that produce unpredictable contrast.
- Prefer CSS gradients initially; use WebGL only if design review demonstrates a real visual requirement not achievable with composited layers.
- Desktop hero min-height around 90–110svh, with foreground headline, compact descriptor and two semantic CTAs.
- New footage later can occupy an independent hero/showreel slot; do not let video block title delivery or LCP.

## Scroll-motion vocabulary
**Use only these main patterns at v1:**
1. **Type reveal**: whole-line or phrase reveal (not aggressively splitting every body sentence). Start 16–36px below in overflow-hidden wrapper, opacity 0→1, duration 0.55–0.85s, stagger 0.07–0.12s, ease tuned after preview.
2. **Section reveal**: enter viewport, translateY(24px) and opacity 0→1, 0.6–0.9s. Must not rely on animation for critical content visibility.
3. **Image drift**: mild internal translate/scale for depth, bounded, no accidental cropping of client marks.
4. **Card spread**: selected media reveal grows by changing container clip/radius or composited scale; avoid shifting surrounding grid content.
5. **Pinned narrative**: only for the hand/logo → full-bleed footer signature. One major sequence on a page.
6. **Hover cues**: image zoom 1→1.035, small directional arrow slide, subtle label reveal; all keyboard focus equivalents.
Do not implement motion on every element merely because the references animate frequently; prioritize headline, featured cards, section changes and footer.

## Suggested page art direction
- Home: atmospheric hero → restrained short manifesto → large alternating portfolio imagery → structured service index → studio/process → cinematic finale.
- Work: editorial index with categories, off-white baseline, full-bleed imagery alternating with quiet left-column metadata; show types and industries genuinely represented.
- Case study: opening hero image or poster, clear metadata, stunning media gallery with a consistent readable story; avoid subjective animation while the user is reading project details.
- Services: utility first; five sections with meaningful descriptions and related portfolio evidence.
- About: large manifesto fragments balanced with factual studio details.
- Contact: fast, warm and frictionless.

## Originality and legal concerns
Using inspiration is permitted as a research technique but avoid copying proprietary assets, competitor brand marks, distinctive frame layouts pixel-for-pixel, motion choreography exactly, source code or copy. Client assets remain client assets. Footer screenshots are for direction only.
