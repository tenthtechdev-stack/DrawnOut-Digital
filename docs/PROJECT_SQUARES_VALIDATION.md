# Opening project squares — validation and handoff

Verified on 26 October 2026 on `feature/drawnout-signature-experience`. Implements the [final project-square feedback on PR #4](https://github.com/tenthtech/drawnout-digital/pull/4#issuecomment-6404192013), preserving the approved direction and checkpoint `5a381847084b2b2cf8e5c1161b7d56f0903c01d9`. Code checkpoint: `971c3a1`. No merge, hosted CI run or public deployment is claimed.

[Updated opening gallery and recordings](../artifacts/signature-squares/README.md) · [Browser measurements](../artifacts/signature-squares/browser-verification.json) · [Previous complete website evidence](../artifacts/signature-opening/README.md)

## Focused implementation

`SignatureIntro.astro` now resolves an explicit six-project selection through the existing public-project gate: **Bunzo, Triarch, SOL Community Center, Churros, By Tech Group and Capture**. All six slots show distinct genuine images. A withdrawn or unavailable selection leaves its outlined slot empty rather than exposing a draft. Original portfolio records, artwork, factual verification and credits remain unchanged.

Standard frames increase from 13% to **15.5%** of the composition width; SOL uses **17%** at the apex. The second frame shifts slightly up/left and the composition receives a responsive height budget, preserving separation from the unchanged large lower-left wordmark and Skip control at 320, 390, 768 and 1440px. The existing SVG path and square-reaction timings are retained.

SOL deliberately uses the metadata-listed `sol-community-signage.webp`, the existing 650×397 crop from `design-assets/portfolio-originals/02_SOL_Community_Center/02_SOL_Community_Center_04.png`. Its green/yellow symbol and actual signage typography are retained using `object-fit: contain`, rather than clipping the brand name into a square. No source image was regenerated.

Each image's 280ms reveal starts when the existing wave first enters its enlarged frame: **620, 879, 1095, 1407, 1656 and 1898ms** on the shared CSS clock. Initial square appearances remain visibly outlined. All images finish before the unchanged project-group fade at 2250ms. The wordmark/wave timing, hand/plaque entrance, living gradient, footer, responsive navigation and automatic homepage gate are untouched.

Astro emits responsive 160/340px WebP derivatives. In the actual production captures, all six selected poster resources total **31,026 bytes at 390px** and **97,150 bytes at 1440px** (device pixel ratio 1). These are poster-only transfer sizes, not total page weight or a universal device budget. No dependencies or new content claims were added.

## Final automated results

| Check                                 | Actual result                                           |
| ------------------------------------- | ------------------------------------------------------- |
| `npm run check`                       | PASS — 84 files; zero errors, warnings or hints         |
| `npm run lint`                        | PASS                                                    |
| `npm test`                            | PASS — 27 tests                                         |
| `npm run build`                       | PASS — 17 routes, including 11 public case studies      |
| `npm run test:build`                  | PASS — 4 checks                                         |
| `npm run test:publication`            | PASS — 1 integration test with 4 isolated builds        |
| Complete Playwright suite, one worker | PASS — 139 tests; 0 failures, 0 skips, 0 flaky; 204.45s |
| `npm run format:check`                | PASS                                                    |
| `git diff --check`                    | PASS                                                    |

**171 distinct automated tests passed.** The four new responsive cases independently compute the wave/frame intersections from the actual SVG curve and rendered frame boxes, then measure the live image reveals. They require six unique approved source images, visible outline-first and mixed-reveal states, ordered arrival-linked reveals, prominent SOL with its uncropped intrinsic ratio, clear frame/wordmark/Skip separation, no viewport overflow and automatic completion below five seconds. They do not merely compare implementation delay constants.

| Width  | All six images fully revealed on the CSS clock | Automatic end from navigation |
| ------ | ---------------------------------------------- | ----------------------------- |
| 320px  | 2173.8ms                                       | 4250.0ms                      |
| 390px  | 2181.2ms                                       | 4272.5ms                      |
| 768px  | 2175.0ms                                       | 4264.4ms                      |
| 1440px | 2178.9ms                                       | 4242.2ms                      |

The full existing regression suite also checks changing gradient pixels after the intro, autonomous and cursor movement, rendering suspension, project routes/filtering, truthful public content, native scroll-linked text/image progress and reverse, shared footer assembly/expansion/reverse, keyboard controls, reduced motion, no JavaScript, delayed/failed initialization, and mobile startup stability. Nine axe scans are included. These automated checks supplement visual review and are not a claim of universal accessibility or physical-device performance.

## Actual production evidence

Sixteen full-resolution keyframes cover outlined squares, the mid-wave reveal and all six artworks at **320, 390, 768 and 1440px**, plus the preserved held pose and automatic homepage at desktop/mobile. All-artwork stills capture the brief live state just before the wordmark's final wipe completes; the videos show the finished wordmark.

| Recording                                                                 | Encoded duration | Bytes   | Automatic end from navigation |
| ------------------------------------------------------------------------- | ---------------- | ------- | ----------------------------- |
| [desktop-opening.mp4](../artifacts/signature-squares/desktop-opening.mp4) | 8.800000s        | 637,900 | 4286.7ms                      |
| [mobile-opening.mp4](../artifacts/signature-squares/mobile-opening.mp4)   | 8.880000s        | 275,561 | 4251.5ms                      |

Recordings preserve actual Playwright browser-video timestamps and transcode the complete footage to H.264 with fast-start metadata. No application timeline is sought, paused or extended. Both recordings verify the gradient is still active after handoff. All 16 PNGs, two MP4s and two GIF previews fully decode; dimensions and hashes appear in [media verification](../artifacts/signature-squares/media-verification.json). The [capture manifest](../artifacts/signature-squares/square-evidence.json) records actual clocks, selected URLs, layer positions and gradient state. Software WebGL capture is not a real-device GPU benchmark.

Historical galleries are retained unchanged. Legacy screenshots produced as side effects of the existing regression tests were archived outside the repository, then their committed historical bytes restored; only this new gallery is delivered for the square refinement.

## Preserved prototype boundary

The client has approved the current opening direction, subject to this final square review. The independent hand/plaque remains the existing **separated 2D prototype**, not completed photorealistic 3D. It has fixed source-pixel finger placement, baked lighting and plaque surfaces hidden by the original hand. No anatomical mesh/rig, articulated grasp or real-time contact lighting was created in this narrow refinement. [Exact remaining production asset requirements](SIGNATURE_ASSET_PROCESS.md) still apply.

No unrelated animation, homepage, portfolio facts or Contact design was changed in this correction. PR #4 remains open; no automatic merge or deployment.
