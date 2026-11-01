# Loading milestone — checkpoint validation

Date: 2026-10-28. Scope: issue #6. Branch: `feature/recurring-loop-fluid-afterglow`; base: `feature/contact-page` (PR #5 dependency).

The owner requested an immediate checkpoint push, without further testing, debugging or recapturing. This report records already completed checks. It does not claim that the final full validation suite passed.

## Completed checks on the latest implementation

| Check                             | Actual result                                                      |
| --------------------------------- | ------------------------------------------------------------------ |
| `npm run check`                   | Passed: 95 files, 0 errors, 0 warnings, 0 hints                    |
| `npm run lint`                    | Passed                                                             |
| `npm test`                        | 32 passed, 0 failed                                                |
| `npm run build`                   | Passed; 17 static pages                                            |
| `npm run test:build`              | 4 passed, 0 failed                                                 |
| `npm run test:publication`        | 1 passed, 0 failed                                                 |
| Latest focused Playwright run     | 6 passed, 0 failed; 39.5 seconds                                   |
| Final full Playwright run         | Not rerun after the last corrections; expected discovery count 188 |
| Final repository formatting check | Not completed after the last changes and checkpoint documentation  |

The focused run covered zero-position scroll notifications versus actual scrolling; a fresh mobile load and two consecutive refreshes; preserving a scrolled mobile refresh position; desktop automatic completion; six progressive artwork reveals and SOL prominence; and the real 320px fluid shader at 0/2/5 seconds, including offscreen pause.

Measured current focused results:

- Mobile 390px initial load / refresh 1 / refresh 2 completed at **4438.1 / 4284.0 / 4288.1 ms** from navigation, each under five seconds.
- Desktop 1440px opening completed at **4443.1 ms**, with recorded layout shift sum **0**.
- The 320px gradient advanced from **0 to 59 to 149 frames** at approximately **0 / 2004 / 5002 ms** after readiness with a stationary pointer. This demonstrates continuing post-intro motion in the tested software WebGL environment.

See [the extracted test names, statuses and measurements](../artifacts/loading-milestone/checkpoint-validation.json).

## Previous complete browser run and intermittent measurements

The last complete run, before the final timing-measurement and mobile corrections, recorded **184 passed and 2 failed** out of 186 tests (391.1 seconds). The failures were:

1. Desktop intro: the sampled observer missed the brief fully revealed wordmark hold (`sawFullName` was false).
2. Desktop squares: the first observed image sample arrived about 8 ms beyond the old sampling tolerance (1575 ms observed versus a 1566.9375 ms upper threshold).

The tests now inspect actual attached animation-effect timings and preserve real sampled visual assertions instead of treating the first sampled frame as an exact animation start. The five-second hard limit was not relaxed. Both affected tests passed in the latest six-test focused run. Their reliability across another complete suite remains unverified; this checkpoint must not be treated as a clean full browser pass.

The source also contains the mobile refresh fix: scoped scroll anchoring suppression during the intro and ignoring zero-coordinate scroll notifications. Real nonzero scrolling still skips immediately, and restored scrolled positions remain respected.

## Existing review evidence

[Open the checkpoint gallery](../artifacts/loading-milestone/README.md).

The saved evidence contains **47 PNGs**, one **47.08-second desktop MP4**, its GIF preview and a measured capture manifest. It covers 320/390/768/1440px hero views, desktop/mobile opening keyframes, footer arrival/hold/expansion/reversal and footer links.

The desktop recording measured initial load and two refresh completions at **4484.5 / 4365.4 / 4351.1 ms**. Those measurements belong to the earlier capture build. The capture set predates the latest mobile refresh/zero-scroll and intro background-animation pause fixes. The final mobile video is missing, and neither final recording has been regenerated. Static footer component images may include the sticky header; the capture script correction is saved but unexecuted.

## Remaining acceptance work and limitations

- Run the complete final browser suite and final formatting check, and resolve any failures before requesting final acceptance.
- Produce final desktop and mobile recordings and refresh the screenshots against the committed final implementation.
- Review the gallery visually; verify physical mobile devices, browser variants and hardware GPU behavior. Current WebGL evidence uses Chromium software rendering.
- The signature hand/plaque remains a separated-image motion prototype. A genuinely rigged photorealistic 3D hand, contact/occlusion geometry and production render pipeline are not delivered by this milestone.
- Contact and official social links are preserved from PR #5. Formspree has no configured endpoint; live email delivery has not been verified. Owner account configuration, recipient verification and final privacy-policy approval remain launch dependencies.
- Reference-site access to KOTA and Tenth Tech previously returned network-policy CONNECT 403 in this environment. Footer hrefs are implemented; external-site availability is not claimed as live-verified.

No deployment or merge is authorized by this checkpoint. No push to the separate Netlify preview repository is part of delivery.
