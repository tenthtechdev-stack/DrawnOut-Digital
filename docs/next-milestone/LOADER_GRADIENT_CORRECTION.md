# DrawnOut Digital | Loader and Right-Side Fluid Gradient Correction

**Source:** client review and supplied \`20261028-1636-02.1144099.mp4\` (7.85 seconds). Source inspection: current draft PR #7 at \`4f537b841654d1d1a2962aac5f772eb1046b3db8\`.

## 1. Evidence and observed difference

The supplied KOTA video shows color concentrated at the right side of the hero, with a vertically traveling fluid band: deforming contours, swells, inward curls and moving boundaries. The left area remains comparatively neutral. The desired motion is NOT a full-page multicolor shader and NOT simple blurred circles crossing the entire viewport. Adapt the motion idea to DrawnOut's own orange/coral/amber palette, with subtle restrained lilac and fine stable noise texture.

Existing \`src/scripts/living-gradient.ts\` fills the entire canvas with domain-warped sinusoidal colors. Existing \`LivingGradient.astro\` fallback also covers the whole hero. Restrict the active color envelope to roughly the right 40–50%, with soft transition near center and mostly cream/paper left background. Animate vertically flowing fold boundaries over ~4–8 seconds. Use low-amplitude fine grained procedural texture in the colored band, not flashing noise across text.

## 2. The loader is present but the experience is not reliable to the client

PR #7 \`SignatureIntroBoot.astro\` excludes \`internalNavigation\` and skips on a navigation-origin budget when CSS is ready too late. It is possible that the currently deployed Netlify mirror is stale, and the live deployed SHA must be verified separately; no assumption that GitHub's development branch is automatically deployed to Netlify.

Required behavior:

- Eligible direct fresh homepage visits: full approved loader visible.
- Homepage reloads: full approved loader visible twice consecutively, including production cold/warm cache.
- Click Home/logo from Work/Contact: full approved loader visible (this user requirement supersedes the earlier decision to skip every internal navigation).
- Other internal routes: navigation immediate; no forced 4s delay unless separately approved.
- Back/forward history: preserve restoration and scroll; no stuck overlay.
- Reduced motion, save-data, user interaction: skip quickly; absolutely no blocked content, no indefinite blank overlay.
- The complete intro should not exceed five seconds after navigation. If a cold load cannot support a full animation, show a graceful short branded handoff instead of silently skipping and claiming the loader worked.
- Production browser tests must assert physical on-screen visibility and capture evidence, not simply data attributes.

## 3. Validation deliverables

Use a local production build and Netlify preview after manually syncing GitHub branches. Record direct homepage, two refreshes, Home click from Contact/Work, mobile at 390px and desktop at 1440px, both cold/warm load conditions; log overlay visible start/end and \`signatureIntroReason\`. Capture fluid gradients at 0/2/5/8 seconds, verify right-to-left gradient isolation, contrast, focus, reduced motion, Save Data, WebGL/CSS fallback, GPU/perf and offscreen pause. No automatic merge or deployment of draft PRs.

This focused fix has already been posted to PR #7 for Codex at https://github.com/tenthtech/drawnout-digital/pull/7#issuecomment-6474998758.
