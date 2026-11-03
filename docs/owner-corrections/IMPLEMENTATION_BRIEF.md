## Owner visual review — required corrections before approving PR #12

The owner **approves Services Stage 1's overall visual direction** and authorizes planning the Stage 2 scroll overview, but does **not** approve the existing About hero animation or homepage opening-square styling. Please treat these as creative acceptance changes, not optional polish.

### A. About hero: redesign within existing approved narrative

- Keep the dark charcoal background consistent with the `Good design has something to say.` philosophy chapter, warm off-white typography and controlled orange.
- Remove the visible `ABOUT / THE STORY BEHIND DRAWNOUT` eyebrow at the hero. Use the exact existing H1 `Two twins. One idea. A whole lot of creativity.` as the large primary text, with responsive sizes and elegant line wrapping.
- Keep the **three existing founder-story paragraphs verbatim**, laid out clearly at left on desktop and in meaningful mobile reading order. Do not shorten/rewrite without approval.
- Use the **approved twins illustration** on the right, with a richer branded atmosphere. Remove the flat cream circular disc (`.about-hero__circle`) and replace it with a localized, fluid amber/coral/orange gradient similar in _treatment_ to the approved homepage gradient. Keep left-side readability and avoid global wash, hard edges and heavy GPU usage.
- New animation order: (1) twin portrait arrives clearly and gracefully as the focal point, (2) branded **real 3D DrawnOut emblem** enters/develops behind the portrait, (3) right-localized fluid gradient blooms and travels, (4) headline and three paragraphs reveal/readably settle as the whole visual arrangement resolves with portrait/emblem at right. No obligatory blocking loader, abrupt translations or cartoonish bouncing. Avoid animating the same asset twice in overlapping timelines.
- **3D asset integrity:** `src/components/BrandEmblem.astro` currently crops the approved flat PNG. `design-assets/signature-study/signature-glass-study.blend` is a material study with NO editable 3D DrawnOut emblem (see `docs/SIGNATURE_ASSET_PROCESS.md`). Inventory any separately supplied, actual approved 3D logo source; if none exists, create a precise, original branded 3D representation from verified logo geometry, render optimized layered/video outputs and label provenance, or report the missing source and present a truthful asset approval checkpoint. Do NOT call the flat PNG, SVG image-wrapper or material-study plate a real 3D logo. Avoid altering the approved 2D footer hand/plaque behavior.
- No JS, reduced motion, Save Data, late bundle/asset failures and early interaction must immediately reveal full readable content. Verify on actual 320/390/768/1440 widths, mobile Safari constraints and rapid navigation.
- The owner supplied a dark philosophy screenshot and a separate revised About hero sketch as visual references in the conversation. Use their described composition; don't invent new portraits or substitute stock.

### B. Homepage global intro

- In `src/components/SignatureIntro.astro`, completely remove **the visible black `intro-wave` connecting path**. The six project squares should still appear with carefully choreographed sequential timing; the black line must not remain in another layer or fallback.
- Increase each square's visible area from the current ~15.5% (SOL ~17%) to a meaningfully larger responsive size while protecting all six artwork contents, especially **SOL signage**, on mobile/tablet/desktop. Recalculate positions to avoid overlaps, clipped cards and collisions with the lower-left DrawnOut wordmark and hand/plaque.
- Remove the current `3px solid #191817` dark borders. Use a refined, consistent moderate border-radius and soft natural depth where needed, without a substitute thick outline. Original artwork crops remain appropriate per project.
- Preserve hard 5-second maximum, repeat on eligible refresh/home navigation, early Skip, reduced-motion/save-data fallbacks, six approved artwork sources, large bottom-left wordmark and current 2D hand/plaque prototype.
- Update tests formerly requiring the connecting wave; verify actual intro frames, responsive art, collision and timing checks, not merely DOM attributes.

### Branch / review

Update **this existing PR #12 branch `feature/services-cinematic-hero`** (stacked on PR #10). Do not merge PR #10/#12 or push to separate Netlify mirror. Push implementation checkpoints early, capture desktop/mobile real recordings and clear final-state screenshots, plus actual regression facts. Services Stage 1 is approved in design direction but still requires a hosted motion review after these corrections. Stage 2 is an independent subsequent stacked PR, not part of this PR's fixes.
