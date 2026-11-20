# Motion test changes and retained evidence

The original About, homepage loader, square choreography, publication and asset assertions are unchanged. Only obsolete project-level control assumptions migrate to the authorized single preference.

- Old per-project `data-motion-toggle` controls must now be absent, including wrappers and reserved space. The shared preference is unique and has accurate On/Off pressed state.
- The old paused=true button state maps to global motion On=false. Actual media time, static poster, decoded frames, source budgets and native link behavior remain asserted.
- The old case-local button's focus could settle its ancestor artwork. The new fixed global preference is outside that artwork; the migrated early-pointer check preserves a genuinely running arrival, stable pointer hit, one real click and source suspension, without claiming that unrelated global focus must finish the artwork.
- Ordinary hidden/offscreen pauses now retain their source and last frame instead of immediately clearing them. Tests verify actual paused time, unchanged source and warm recovery; a separate long-background check verifies eventual release. Filtering to a static presentation, explicit Off, reduced motion and Save Data still release immediately.
- Same-DOM repeated initialization is idempotent. A separate before-swap→same-DOM page-load case verifies recovery after actual controller teardown and a restored usable preference.

## New loop instrumentation correction

The first new 22-case run passed21/22; the subsequent23-case run passed22/23. Both failed a newly written assertion equating the video element's synchronous `readyState >= 2` with a frame already submitted to the compositor. The raw reports are preserved. One callback at a natural loop boundary reported mediaTime0, presentedFrames180 and readyState1, while the loop advanced210 decoded frames without any source/load restart. An isolated unchanged strict test passed; the state observation is timing-dependent.

The finite visual investigation captured14 real viewport PNGs across a native wrap. Every sampled approved SOL background patch matched its immutable poster withinRGB[1,0,2]. That particular probe sampledreadyState4 at the wrap; it is not presented as same-instant proof of the earlierreadyState1 callback. Its original human label mistakenly saidd9build; actual recorded commit5382c75 and ContactHTMLhash identify the build, and the original label is retained in the published provenance.

The new loop test therefore retains all raw readiness states and boundary values but tests the visual requirement directly: strictly advancing real presented-frame counters and14 actual compositor-image comparisons around a real native wrap, against the matching approved poster. The5RGB tolerance accounts for lossy video/WebP conversion; measured diagnostic error was at most2. Loop wrap, decoded-frame progression, source/load/emptied counts and cadence measurements remain asserted. Evidence is attached before assertions. No seek, fake readiness value, lowered readiness threshold or application-state rewrite is used.

This corrects a newly authored measurement proxy with stronger direct visual coverage. It does not rewrite the parent baseline or remove its failures. Chromium/SwiftShader observations are not physical-device GPU/FPS certification; callback cadence during screenshot capture includes capture overhead.
