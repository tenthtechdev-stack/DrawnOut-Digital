# Reference audit: what is observed vs what we propose
**Review date:** 21 October 2026. Website appearance can change. Automated textual inspection does **not** establish precise animation source code or timing. Screenshots are additional first-hand evidence supplied by the user.

## 1. Brandlic — https://brandlic.studio/work/
Observed on public Work page: clean, editorial portfolio; introduction and filters (All Works, Branding, Identity, Illustration, Logo, Packaging, Print, Signage, Strategy); numbered cases with short rationale; 'Load more'; contact invitation; footer/navigation. User screenshot shows a generous two-column card with title at left and product visual at right, and striking lower corner treatment.

**Requested inspiration**: visual 'spreading' expansion effect at bottom, scroll transitions, type reveal, distinctive brand-studio craft.
**DrawnOut interpretation (proposed, not reverse-engineered)**: let one selected image or card expand via scale/clip/border-radius interpolation as it enters the final call-to-action stage; use staggered category transition and restrained split-type reveals. Avoid claiming to replicate Brandlic's actual code/timeline.
**Do not copy**: Brandlic projects, their exact layout ratios, fonts, curved mask shapes, brand voice, identity or code.

## 2. KOTA — https://kota.co.uk/
Observed public structure: navigation Work, Agency, Services with 3 disciplines, Blog, Culture, Contact; prominent project CTA; oversized positioning headline; service summaries; framework/process controls; work/projects; supporting results. User screenshot shows a soft, saturated magenta-violet-cyan gradient occupying the hero behind oversized dark editorial type; the reference view crops letters dramatically.

**Requested inspiration**: premium layered gradient hero, oversized typography, scroll-based directional/type reveals and cinematic pacing.
**DrawnOut interpretation**: brand-led dark/neutral shell, animated low-frequency amber-orange with subtle blush-violet reflected light; static fallback gradients; foreground heading always legible; never duplicate KOTA's exact gradient composition or global brand positioning.
**Do not copy**: headline cropping that destroys mobile legibility, KOTA's original text, font, artwork, or gradient pixel-for-pixel.

## 3. Ramotion — https://www.ramotion.com/
Observed public structure: Work, Services, Programs, About, Blog, Subscribe, Contact; links to Branding, Web design, UX design, Design system, Web app development; extensive client/work examples and clear internal linking.

**Requested inspiration**: accessible service grouping, simple sitemap, links to detailed work, low-friction navigation, strong supporting copy.
**DrawnOut interpretation**: keep five core pages plus project details; work and services consistently accessible on desktop and mobile; no mega-menu needed at v1 because DrawnOut has only five pillars. Progressive enhancement and filtering should not prevent navigation.
**Do not copy**: client's success stats, logos, industries, claims, long sprawling page or unnecessarily many nested categories.

## 4. Hand-held logo screenshot (`assets/reference-only/footer-hand-logo-reference.png`)
- Single 357 × 489 image shows a warm orange cinematic scene: visible fingertips/hand, a clear illuminated rectangular object, and a stylized geometric symbol set inside, with a bright backlight.
- **Important**: the symbol does not visually match the provided flat DrawnOut logo one-for-one (the supplied logo shows an orange D-like element with a charcoal inset). Treat this image as a direction reference only, pending exact emblem artwork.
- The image contains a platform overlay icon. Never ship that as production footer art.
- No independent foreground/background layers, alpha masks, frame sequence, video master or rights provenance is included.

## 5. Supplied logo (`assets/reference-only/drawnout-logo-provided.png`)
- Full composite wordmark/icon asset, 1920 × 1080, transparent PNG with substantial margins.
- Orange geometric monogram, dark charcoal inset and lettering. Over a dark background the lettering has insufficient contrast. Request optimized light/dark SVG versions and an icon-only master, and confirm the official spelling/capitalization.
- Do not simply invert the composite PNG; use authentic supplied versions or an explicitly approved derived version.

## 6. Original portfolio evidence
- Archive: `Our_Work_By_Company.zip` (previous session). 46 PNGs; 15 folders, including the studio identity and unsorted material; 13 named external-facing project groups.
- Current pack contains seven optimized stills as **development placeholders** and `portfolio-inventory.csv`, with earlier assessment in `PRIOR_RESEARCH_V04.md`.
- Portfolio images are primarily designed boards/montages, not raw isolated website photography or proof of launched work.

## Official implementation references
- Codex models / guidance: https://developers.openai.com/api/docs/models , https://developers.openai.com/api/docs/guides/code-generation , https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Astro content: https://docs.astro.build/en/guides/content-collections/
- Astro images: https://docs.astro.build/en/guides/images/
- Astro transitions: https://docs.astro.build/en/guides/view-transitions/
- Reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- Accessibility: https://www.w3.org/TR/WCAG22/
- Performance: https://web.dev/articles/vitals/
