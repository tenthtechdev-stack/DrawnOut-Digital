# Stage A validation — loader and right-side Afterglow

The current implementation is ready for visual review in PR #7, based on Contact PR #5. It has not been merged or deployed.

## Actual final results

| Check                                  | Result                                                   |
| -------------------------------------- | -------------------------------------------------------- |
| Astro / TypeScript, ESLint, formatting | Passing; final logs accompany the completion checkpoint  |
| Unit tests                             | 32 passed                                                |
| Production build                       | 17 static pages                                          |
| Build-output tests                     | 4 passed                                                 |
| Publication workflow                   | 1 passed                                                 |
| Development browser coverage           | 188 current cases passed across interrupted/resumed runs |
| Strict production browser suite        | 7 passed in one run                                      |

The development count is verified coverage across saved runs, not a claim that one uninterrupted process passed. [Per-case results and log hashes](../../artifacts/loader-correction/test-results.json) map every current development test to its passing run. One header check was rerun successfully. An earlier environment run was stopped after shared Vite caches caused dependency 403/504 errors; the development cache is now isolated per worktree and its package allow-list follows the actual local node_modules directory.

Full-storyboard geometry, the four-breakpoint square/wave tests and exact clock-failure behavior now run against optimized production assets. Their assertions were preserved. Development compilation can legitimately consume the 700ms full-storyboard startup budget, so development tests also verify the deliberate brief handoff. Strict production checks require the full 4.2-second storyboard; an implementation that always takes the brief path fails those checks. The five-second limit was not relaxed.

## Production appearance and timing

The final strict production run verified ten full arrivals: cold-cache direct load, two refreshes and Home/logo links from both Contact and Work at 390px and 1440px. It observed real overlay visibility, progressive word/wave reveals, all six approved artworks and independent hand/plaque movement. Full completion ranged **4279.3–4518.0ms from navigation**, all within five seconds. The four square tests independently verified SOL signage prominence, source provenance, layout and timing at 320/390/768/1440px. A forced animation-clock failure released usable content.

[Headed production recordings and gallery](../../artifacts/loader-correction/README.md) include 41.12s desktop and 36.48s mobile journeys. The unchanged visual/runtime implementation is shown on a local production server, with more than eight continuous seconds of autonomous right-side fluid motion. Raw 0/2/5/8-second frames measure clean-left/right-color composition; right-region mean RGB change was 24.49 desktop and 22.66 mobile. A 1300ms delayed-document scenario showed the short branded handoff, and recorded Skip/reduced-motion checks also passed. [Capture manifest](../../artifacts/loader-correction/evidence.json).

## Remaining review limits

The separate Netlify deployment SHA and hosted behavior remain unverified: its host returned proxy CONNECT 403 and its separate repository returned 404 for this GitHub connection. A stale deployment is a possibility, not an established finding. [Access evidence](../../artifacts/loader-correction/hosted-access.json).

Chromium software WebGL coverage is not a physical-device GPU benchmark. Other browser engines, real devices and wider network conditions still need review. If HTML arrives with less than the minimum safe brief duration remaining before 4900ms, content appears immediately. No script can render before HTML arrives or execute timers while its main thread is blocked.

The hand/plaque remains a separated 2D motion prototype. Contact retains its honest unconfigured Formspree state; owner configuration, recipient/live delivery verification and privacy-policy approval remain launch dependencies. No public deployment, PR merge or separate preview-repository push was performed.
