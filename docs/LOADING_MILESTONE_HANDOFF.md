# Recurring DrawnOut Loop, fluid Afterglow and footer links

Implementation brief: [issue #6](https://github.com/tenthtech/drawnout-digital/issues/6). This milestone preserves the approved six-project opening, SOL branding mockup, bottom-left wordmark, separate hand/plaque prototype, portfolio content and Contact implementation.

Branch: `feature/recurring-loop-fluid-afterglow`, based on Contact commit `c755f3ea836012a942277438a96f4828d85c1200`. PR #4 is merged into `main`. PR #5 remains the prerequisite for this stacked review; its Contact form configuration and canonical contact details are unchanged.

[Visual evidence](../artifacts/loading-milestone/README.md) · [Validation](LOADING_MILESTONE_VALIDATION.md)

## Loading behavior

| Navigation                                                                                                           | Behavior                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Direct top-of-page load or manual refresh of `/`, `/work`, published case studies, `/services`, `/about`, `/contact` | Full approved 4.2-second sequence on every eligible load, including consecutive refreshes in the same session |
| Same-tab internal link                                                                                               | Immediate normal navigation; no full loader                                                                   |
| Browser back/forward or bfcache restore                                                                              | No loader or forced scroll reset                                                                              |
| Hash/deep link or restored nonzero scroll                                                                            | Content immediately available                                                                                 |
| Reduced motion, data saver, hidden document, unavailable storage                                                     | Content immediately available                                                                                 |
| JavaScript absent, CSS missing, asset/animation failure, late initialization                                         | Native content remains usable; loader fails open                                                              |
| Development preview routes, concepts and 404 recovery                                                                | No branded loader                                                                                             |

The old session-wide `drawnout-loop-seen` flag is no longer consulted. A same-tab internal link records only a short-lived, destination-specific navigation intent in session storage. The destination consumes it once; refresh ignores it. Modified clicks, new-tab links, downloads, external links, prevented actions and same-document hashes do not create a suppression token. This adds no tracking or visitor identity.

The navigation clock releases the overlay by 4.9 seconds, leaving a margin below the five-second maximum. The full approved choreography takes 4.2 seconds; therefore it can only start while at least 4.2 seconds remain (within 700ms of navigation). This replaces the old arbitrary 600ms cutoff with an explicit remaining-duration budget. A pending loader stays hidden until its own stylesheet is ready. Slow initialization gives way to content instead of accelerating the sequence or displaying a late, truncated overlay. Blocking the browser's main thread can delay JavaScript timers; no script can guarantee timer execution during such a block.

While an eligible loader is pending or playing, browser scroll anchoring is disabled to prevent a mobile top-of-page refresh from jumping to a content anchor. It is restored automatically when the gate ends; scroll restoration itself is never disabled or reset.

Pointer, scroll, touch, appropriate keyboard input and the Skip control release the page immediately. Home alone receives the existing hero handoff; other routes never run homepage-only handoff code. In development, **Replay loader** / `?showIntro=1` bypasses internal-navigation suppression only. Accessibility preferences, history and deep-link safeguards still apply. The link and override are absent from production builds.

## Living gradient

The native WebGL shader uses two evolving domain warps and overlapping amber, coral, cream and restrained lilac contours. A smoothed, localized cursor distortion gently bends the autonomous field on fine-pointer devices; touch layouts remain autonomous. Feathered local text glows protect typography without washing out the entire background. The existing headline, layout, CTAs and type scale remain intact.

Rendering stays a single analytic pass without textures, simulation buffers or new packages. Resolution is capped at 720px wide, 800px high and device pixel ratio 1; the animation loop caps drawing at 30fps. Rendering pauses offscreen, in hidden documents and while the loader covers the hero; both the CSS fallback layers and WebGL yield to the opening. WebGL initialization waits until the loader/hero entrance has finished. Context failure falls back to animated CSS; reduced motion and data saver receive a static composition. Resources and observers are released on page lifecycle changes.

The six poster images and two hand/plaque layers retain eager loading for reliable early reveals. Existing optimized assets total roughly 85KiB at mobile DPR1 or 207KiB at desktop/high-DPR selection on an uncached load, even when an intro is suppressed. URLs are shared across routes and with footer artwork, allowing browser caching. No new portfolio media were introduced.

## Shared footer

Facebook, Instagram and LinkedIn use small inline SVGs, canonical `contact.social` URLs, descriptive link names and 44px focus/touch targets. The bottom legal row contains the exact wording **Designed and Developed by Tenth Tech**, with Tenth Tech linked to `https://www.thetenthtech.com/`. Existing email, navigation, enquiry CTA, signature artwork and reversible scroll timeline are preserved.

## Remaining production requirements

- The hand/plaque is the approved separated **2D motion prototype**, not a rigged photorealistic 3D hand. This milestone does not produce new 3D assets.
- Cloud Chromium uses software WebGL for deterministic rendering coverage. Real mobile/desktop GPU performance and hosted delivery still require device review.
- The owner has not configured Formspree. Contact retains its honest unconfigured state and working email alternative. Recipient verification, real inbox/Reply-To testing and an approved privacy policy remain launch dependencies documented in [Contact handoff](CONTACT_HANDOFF.md).
- KOTA reference pages and the Tenth Tech website could not be retrieved through this environment's outbound proxy (HTTP CONNECT 403). The implementation uses original shader code and the issue's art direction; link destinations are checked in-browser without claiming remote account availability.

No automatic merge, public deployment or push to the separate Netlify preview repository is part of this delivery.
