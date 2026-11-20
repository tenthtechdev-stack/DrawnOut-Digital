# Site-wide motion polish — Issue #23

Parent: draft PR #22, `feature/contact-signature-experience`, verified `b1c7db29a186c7413cad0bc5cdb59d62d5200f66`. Branch: `feature/sitewide-motion-polish`. This milestone is for review, not deployment or merging.

## Controls and accessibility

The per-project `PortfolioMotionToggle.astro` component is deleted. Its imports, markup, event handlers and 52px layout reservations are removed from Home, Work and premium cases. A single shared portfolio-motion preference replaces them. The compact control appears at the viewport edge while portfolio artwork is meaningfully visible; elsewhere it occupies a footer utility row. It does not cover Contact's inputs. Its pressed state means motion is enabled, and its text states On/Off. Device reduced-motion and Save Data requests enforce Off automatically, with an accessible explanation.

The choice is public, non-sensitive local browser preference data under `drawnout:portfolio-motion`. Storage exceptions retain a usable in-memory choice. Cross-tab updates, native history restoration and page navigation refresh the effective preference. A tiny head bootstrap applies an existing stored Off before portfolio scripts can request media. No server account, tracking or private credential is introduced. Playback also waits for the working control to acknowledge readiness. Restoring an already connected control after a same-DOM Astro lifecycle sequence reasserts that acknowledgement, while actual teardown still releases media. If only that enhancement fails, the independent media controller retains static artwork instead of starting an unpausable loop. A real CSP isolation test first reproduced uncontrolled playback before this gate; the strengthened steady-state test is retained.

This addresses WCAG 2.2.2's ability to pause automatically repeating project motion without repeating a control beneath every artwork. It is specifically a **portfolio** preference: separate Services, puzzle and other suitable experience controls remain, because their distinct narrative controls have not been replaced by a coherent universal controller. Static/no-JavaScript artwork remains readable without requiring a control that cannot function.

## Playback and visual continuity

Source lifecycle changes, hysteresis, decoder leases and decoded-frame checks are documented with actual measurements in the final validation report. Curated Work rhythm, SOL priority, muted inline looping media and the one-mobile/two-desktop budget remain. Posters remain real approved artwork; no new video, stock imagery or asset replacement is introduced.

Shared scroll expansion previously transformed the poster but not its sibling video. Both now receive the identical scale/drift, including focus settlement and responsive cleanup. The approved clipping geometry, scroll mapping, scrub and timeline durations remain.

About's original parser-time 550ms fail-open gate raced a heavyweight external module and a second image decode. The real entrance now starts beside its markup using native animations; a tiny independent external module (`public/scripts/about-arrival.js`) acknowledges script availability, and the heavy module owns subsequent editorial scroll scenes only. Existing blocked/delayed script fallbacks and their deadlines remain. The acknowledgement is deliberately referenced as an external module so Astro cannot inline it and accidentally bypass the external-bundle failure contract. The unchanged blocked/delayed tests caught this optimization during validation; their assertions remain unchanged. This is a source-level startup fix, not a test timeout increase or a fabricated animation-state attribute.

## Reviewed without speculative redesign

Work already uses a changed-only native-scroll RAF and stable geometry reads; no idle ticker was added. Case arrivals avoid interactive parent transforms. Services keeps timeline position during resize and pauses for focus/visibility. The Brand Identity puzzle keeps its separate controls and supplied geometry. Contact remains a finite 4.8-second, focus-first study. The gradient remains capped and suspended offscreen/hidden/during intro. The footer remains reversible and explicitly a raster prototype. No production-quality 3D claim is introduced.

## Baseline and release boundary

The parent full run remains 233/244, with 11 failures. Before implementation, one unchanged-parent reproduction of those exact 11 passed six and failed five; raw commands/errors and source hashes are retained in `artifacts/sitewide-motion/baseline-reproduction.json`. These bounded results do not replace the parent full run. Final failures must be compared by exact assertion, not merely matching titles.

All 11 cases, six approved motion compositions, original media bytes, content/attribution/publication gates, Contact provider behavior and preview-wide noindex are preserved. Formspree remains unconfigured. No merge, deployment, Netlify mirror push or live form activation is authorized.
