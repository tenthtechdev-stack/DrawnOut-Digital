# Stage A validation — loader and right-side gradient

This report records actual completed checks and outstanding work. PR #7 remains a draft for visual review, based on the unmerged Contact PR #5.

## Completed automated checks

- Astro/TypeScript: 96 files, 0 errors, 0 warnings, 0 hints.
- ESLint: passed after correcting three capture-script browser-global declarations.
- Unit suite: 32 passed.
- Production build: passed, 17 static pages.
- Build-output suite: 4 passed.
- Portfolio publication workflow: 1 passed.
- Focused gradient checks at390/1440: 2 passed, sampling actual WebGL output at0/2/5/8seconds and verifying offscreen pause.
- Full final Playwright suite: running; no all-green claim until its saved result is recorded.
- Final repository formatting check: pending.

## Headed production proof

Both desktop1440 and mobile390 journeys passed all recording assertions: direct cold browser-cache load, two manual refreshes, Home/logo from Contact and Work, immediate ordinary internal navigation, physically visible overlay over a nontrivial interval, six loaded/revealed artworks and automatic completion within five seconds. The unchanged full choreography lasts4.2seconds; observed full-intro completion ranged4289.7–4862.3ms from navigation.

The scripts sample actual computed visibility, viewport-sized overlay bounds, revealed image opacity and loaded image pixels. Recordings are timestamped native browser videos, not simulated scene renders. The desktop and mobile recordings are41.12s and36.48s respectively.

Each includes more than8continuous seconds of stationary-pointer gradient movement. Raw shader frames at0/2/5/8seconds independently measure clean-left/right-color composition. The right region's mean RGB change between first/last frames was24.49desktop and22.66mobile. The browser also records rendered frame progression. Fine-pointer movement is shown on desktop.

A1300ms document-response delay deliberately exercised the brief branded handoff: automatic completion3135.9ms desktop and2537.2ms mobile. Early Skip and reduced-motion immediate access also passed in recorded production sessions. The complete manifest includes timings, reasons, visible samples, frames, segment timestamps and file information.

[Open gallery and recordings](../../artifacts/loader-correction/README.md) · [Raw measurements](../../artifacts/loader-correction/evidence.json)

## Limitations

The separate Netlify deployment SHA could not be retrieved: the host returned proxy CONNECT403, and its separate GitHub repository returned404 for this connection. A stale deployment is unverified; source defects and this access limitation are separate findings. See[access evidence](../../artifacts/loader-correction/hosted-access.json).

Software WebGL is not a physical GPU benchmark. Hardware devices, other browser engines and more network conditions need review. A document arriving with less than the minimum safe brief duration remaining before4900ms shows content immediately; no script can display an animation before HTML arrives or execute timers during a blocked main thread. A failed image releases content; late but still-loading artwork receives the brief handoff instead of empty project frames.

The hand/plaque remains a2Dprototype. Owner Formspree setup, recipient verification/live delivery and privacy approval remain unchanged launch dependencies. No merge, deployment or separate preview-repository push was performed.
