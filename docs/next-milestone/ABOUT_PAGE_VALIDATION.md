# About page — observed validation

Validated on 2 November 2026 from the production build on `feature/about-brand-story-experience`. Application source was frozen during the About browser run and captures. The capture manifest records the source checkpoint; later evidence and documentation commits do not change the application rendering.

[Visual gallery](../../artifacts/about/README.md) · [Browser report](../../artifacts/about/browser-tests.json) · [Capture facts and hashes](../../artifacts/about/capture-evidence.json) · [Handoff](ABOUT_PAGE_HANDOFF.md)

## Results

| Command or check                                          | Observed result                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run check`                                           | PASS — 129 files, zero errors                                                              |
| `npm run lint` and `npm run format:check`                 | PASS in the combined implementation validation                                             |
| `npm test`                                                | PASS — 42 unit tests in the combined run, including About content safeguards               |
| `npm run build`                                           | PASS — 22 static routes                                                                    |
| `npm run test:build`                                      | PASS — 6 existing production/publication checks                                            |
| `node --import tsx tests/about-build.test.mjs`            | PASS — 2 About production-output and asset checks                                          |
| `npm run test:publication`                                | PASS — isolated publish/withdrawal integration                                             |
| `node --test tests/portfolio-motion-exports.test.mjs`     | PASS — 6 export checks; all twelve existing MP4s preserved                                 |
| `npx playwright test --config=playwright.about.config.ts` | PASS — 17/17, 60.96 seconds, zero retries, skips or flaky results                          |
| `node scripts/capture-about.mjs`                          | PASS — 25 page screenshots and 4 real-time MP4s; native portrait presentation adds one PNG |

The production preview used a fresh server on port 4383 with server reuse disabled. The capture environment lacked Playwright's cached ffmpeg executable; an isolated temporary cache pointed to the installed `/usr/bin/ffmpeg`. No package, application source or animation timing changed for capture. The final capture pass records zero page errors and zero failed requests.

## Content, accessibility and navigation

Four browser cases cover 320px, 390px, 768px and 1440px. Each checks all seven chapters and supplied copy, one H1, founder names and exact roles/experience, the 2022 statement, metadata, preview `noindex, nofollow`, absent unconfirmed canonical URL, truthful `AboutPage`/`Organization` schema, decorative accessibility hiding, full-image `meet` geometry, reading order, keyboard focus, a usable Contact CTA and horizontal overflow. All four axe scans using WCAG A/AA tags, including colour contrast, returned zero violations. Automated scans do not establish complete accessibility conformance.

The route case observes direct, refresh and internal About arrivals without a global overlay. About → Work releases navigation immediately; About → Home still presents the full existing global loop for at least 4.19 seconds. Separate cases exercise early keyboard and scroll input, reduced motion, Save Data, simulated hidden visibility, an initialization failure, a live reduced-motion change, and native no-JavaScript mobile navigation through the invitation to Contact. No form submission is made.

## Actual motion evidence

The 390px and 1440px motion cases collect real animation-frame styles for the orange line, headline transforms and raster masks, plus unmodified browser screenshot crops of the portrait. They require progressive pixels, a completed entrance within 4.2 seconds, removal of the mask and a stable finished image. The observed running-to-settled intervals were 3.515s mobile and 3.512s desktop. Combined intermediate portrait comparisons changed 35.25% and 32.55% of pixels respectively; both settled comparisons changed zero pixels. This tests the rendered image as well as diagnostic attributes.

Two further cases scroll origin and process forward and backward, checking normalized progression and actual SVG dash offsets. Founder names and principle headings retain their once-revealed state after leaving and returning. About creates no pin spacers and does not replace native scrolling.

The native recordings preserve real playback speed: desktop/mobile hero clips are 5.76s/6.08s; origin → process → invitation/footer clips are 18.60s/17.96s. Each scroll clip includes forward and reverse progression. MP4 metadata confirms silent H.264, original viewport dimensions and 25fps. The gallery includes complete reduced-motion pages at all four requested widths, no-JavaScript desktop/mobile pages, and the actual cream hero portrait crop. A separate 1445×1088 standalone browser presentation renders the approved derived PNG on the same Afterglow paper colour; it is labelled separately from page evidence.

## Review boundary

The approved illustration is raster artwork under broad SVG reveal masks. It is not an editable portrait made from independently drawable vector strokes. The original personal photograph and rejected candidates remain outside the repository and captures. The private comparison and owner illustration approval occurred in the conversation; this report does not reproduce or independently verify that private reference. Portrait positions are not assigned to founder names.

Philosophy and approach copy remain proposed messaging for final studio approval. Chromium 154 with software WebGL was exercised here; real iOS/Android devices, Safari, Firefox and field performance are not established by this focused validation. The shared footer remains its existing 2D prototype, and Contact still depends on owner provider configuration and real email testing. No merge, public deployment or separate Netlify repository push was performed by this validation work.
