# Site-wide motion polish — final validation

The implementation and review evidence are complete. **24/24 new motion checks, 29/29 unchanged About checks and 42/42 Contact checks pass. The full existing browser scope is not green: 241/244 pass, 3 fail.** Every failure remains recorded; no baseline About, loader or square assertion was weakened. No merge, deployment, live form activation or Netlify mirror push occurred.

Branch: `feature/sitewide-motion-polish`. Draft [PR #24](https://github.com/tenthtech/drawnout-digital/pull/24) targets open Contact [PR #22](https://github.com/tenthtech/drawnout-digital/pull/22), immutable parent `b1c7db29a186c7413cad0bc5cdb59d62d5200f66`. Application code checkpoint: `d8cd4451582fb7936a20edc028575f429f65e6e0`; final captures and fresh About/Contact checks use review checkpoint `1569b260dce67216444a4f0fe96cfe95ebb2905e`, whose application bytes are identical. Later commits publish evidence and reports.

## Actual core results

| Check                                         | Observed result                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `npm run build`                               | PASS; 22 static pages, 274 optimized images, 12 approved video endpoints        |
| `npm run check`                               | PASS; 232 files, 0 errors/warnings/hints                                        |
| `npm run lint`                                | PASS                                                                            |
| `npm test`                                    | 58/58 PASS                                                                      |
| `npm run test:build`                          | 6/6 PASS                                                                        |
| `npm run test:publication`                    | 1/1 PASS                                                                        |
| Media export and current preservation command | 21/21 PASS: 18 media checks and 3 current guards                                |
| Unchanged historical scope audits             | 3/6 PASS, 3 FAIL; explanation below                                             |
| Repository formatting/whitespace              | [Final command results](../../artifacts/sitewide-motion/format-validation.json) |

[Actual commands, complete output and exits](../../artifacts/sitewide-motion/core-validation.json). The current guard checks 434 unrelated source/assets/content/configuration/test files against PR #22. All11 public cases, six motion compositions, original images, factual attribution/publication restrictions, Contact logic/data, favicon, service copy/FAQs, other experience controls and preview noindex remain preserved. No package or SSR change was introduced.

The historical PR #20/21 and Contact milestone audits intentionally allow only those earlier changes. They now reject the newly owner-authorized motion/UI/About source and new modules. Their three failures remain unmodified, with exit 1 and exact errors; they are not asset drift. The new Issue #23 guard explicitly enumerates this milestone's source boundary while freezing everything else. All18 actual media decoding/provenance checks pass. Do not describe all historical test commands as green.

## Focused browser results and reuse provenance

[Focused machine results](../../artifacts/sitewide-motion/final-browser-validation.json): 24 new site-wide checks, 29 unchanged About checks and 42 Contact checks pass, with no skipped/flaky results. Coverage includes320/390/768/1024/1440/1920px, keyboard/Axe, storage failure, preference persistence/history, reduced motion/Save Data, source budgets, rapid forward/reverse scrolling/filter changes, orientation/DPR, decoded frames, warm pause/recovery, long-background release, script failure, native links, no JavaScript, same-DOM initialization/teardown recovery, original form validation/acknowledgement/failure/duplicate behavior and focus-first Contact motion.

The24 passing motion cases retain their original `b2d8c4248b44ba19907525945331ee25a65d3b07` execution. A [complete emitted-file byte comparison](../../artifacts/sitewide-motion/external-ack-compiled-comparison.json), also verified before the fresh focused run, proves every existing non-About HTML/JS/CSS input and the24-test/config source remain identical. Only About HTML and its dedicated external acknowledgement asset changed. About and Contact ran freshly on`1569b26`. The machine report explicitly states `allStepsSameSourceCommit=false` and records this reuse; it does not invent a rerun. All tested runtime inputs match the captured final build.

The Contact form stays unconfigured. Provider-state tests are intercepted fixtures, not live delivery verification. The original4.8-second First Thought stays finite and settles on input focus.

## Full existing browser scope: 241/244

The full existing scope uses one worker/GPU and no concurrent builds or source/test changes. Its29 unchanged About cases are reused from the same frozen final build; the remaining215 execute once. No automatic retries replace failures. [Full commands, errors, totals, source hashes and restoration proof](../../artifacts/sitewide-motion/regression-summary.json) · [Classification](../../artifacts/sitewide-motion/regression-classification.json).

| Config/scope                                      |    Pass |  Fail | Raw result                                                                        |
| ------------------------------------------------- | ------: | ----: | --------------------------------------------------------------------------------- |
| Portfolio motion completion                       |      31 |     0 | [Report](../../artifacts/sitewide-motion/regression-motion-completion-tests.json) |
| All eleven case-study rollout                     |      42 |     0 | [Report](../../artifacts/sitewide-motion/regression-case-rollout-tests.json)      |
| Work/media/Contact/social/footer regression       |      74 |     0 | [Report](../../artifacts/sitewide-motion/regression-case-regression-tests.json)   |
| Services/accessibility/strict loader preservation |      56 |     3 | [Report](../../artifacts/sitewide-motion/regression-preservation-tests.json)      |
| Living gradient development checks                |       9 |     0 | [Report](../../artifacts/sitewide-motion/regression-gradient-dev-tests.json)      |
| Unchanged About checks, reused                    |      29 |     0 | [Report](../../artifacts/sitewide-motion/final-about-tests.json)                  |
| **Total**                                         | **241** | **3** | 0 skipped/flaky                                                                   |

The parent PR #22 full run was233/244, 11 failures. Before implementation, one bounded reproduction of exactly those 11 unchanged parent tests passed6 and failed5; it did not replace the full parent result. [Baseline reproduction](../../artifacts/sitewide-motion/baseline-reproduction.json). Nine previously failing titles now pass, including all eight About failures and the early SOL pointer check. Matching a title alone is not treated as matching an assertion.

### Three retained failures

1. **390px loader — existing metadata contract mismatch.** `tests/production-browser/loader.spec.ts: 150` expects HTML `data-signature-intro-reason="internal-navigation"` on Contact. Contact deliberately opts out of the global loader and does not emit that attribute. This matches the historical and bounded parent assertion. URL navigation and the hidden/absent overlay checks pass before it fails; actual Contact and Home-return recordings remain functional. [Failure image](../../artifacts/sitewide-motion/failure-preservation-01-0.png) / [context](../../artifacts/sitewide-motion/failure-preservation-01-1.md).
2. **1440px loader — different strict sampled-duration assertion.** `loader.spec.ts: 103` records2395.30ms against required >3000ms. The parent title previously failed line102's running-frame count, and the bounded parent reproduction reached the metadata expectation. This current error is not described as the identical parent failure. [Failure image](../../artifacts/sitewide-motion/failure-preservation-02-0.png) / [context](../../artifacts/sitewide-motion/failure-preservation-02-1.md).
3. **1440px project squares — newly observed timing/sampling failure.** `signature-squares.spec.ts: 230` first observes the first two reveals at the same1041.5ms timestamp after a583.3ms sampling gap. The recorded authored starts are600/840ms, all six artworks become visible by 2124.8ms, total ends4516.6ms and there is no overflow. This title did not fail the historical parent run and is not labelled an established baseline failure. [Decoded observations](../../artifacts/sitewide-motion/regression-square-1440-observations.json) / [failure image](../../artifacts/sitewide-motion/failure-preservation-03-1.png) / [context](../../artifacts/sitewide-motion/failure-preservation-03-2.md).

### Bounded square comparison

One exact-title comparison ran unchanged parent and current tests/configs, without altering the main241/244 result. Ten selected intro source, CSS, SVG and test/config inputs are byte-identical. Both comparisons failed **earlier line207**, which checks observing an empty tile, with frame gaps1067ms and 1167ms. Parent completed at 4643ms and current at 4514ms, both with mixed reveals/no overflow. This shows sampling fragility on both, but **does not reproduce the exact final line230 assertion on the parent**. The newly observed failure remains unresolved and the three main failures remain disclosed. [Separate commands, identities, raw reports and evidence](../../artifacts/sitewide-motion/new-square-parent-comparison.json).

### Infrastructure event

After runtime resume, an inherited HTTP proxy returned403 for unused preview ports. Five startup attempts executed zero tests. They are archived separately as infrastructure errors, not counted as website test failures. Task-local `NO_PROXY`/`no_proxy` adds loopback names while preserving existing entries; network policy and application code are unchanged. Direct preview access was verified against the exact frozen Contact HTML SHA256 `29394dd445ee6f6835baf8fcc84ee07db744672f045668b56873596100f7bdd2` before the actual215 checks. [Diagnosis and preserved zero-test outputs](../../artifacts/sitewide-motion/startup-proxy-diagnosis.json). Legacy portfolio audit outputs were backed up, archived and restored byte-for-byte; source/test/media/config hashes stay unchanged. [Report formatting provenance](../../artifacts/sitewide-motion/report-format-provenance.json) records original and formatted report-byte hashes and verifies that every parsed raw result/diagnostic remains unchanged. The bounded comparison's original-byte measurements describe its recorded comparison time, before final formatting.

## Real visual and performance evidence

[Complete GitHub gallery](../../artifacts/sitewide-motion/README.md) · [Performance findings](PERFORMANCE.md) · [Capture verification](../../artifacts/sitewide-motion/evidence-summary.json).

There are90 captured PNGs plus 28 loop-proof PNGs, and 12 fully decoded MP4s. Additional regression failure images are separate. Captures retain original resolution, actual browser clocks, native scrolling/reversal/navigation and real Off/On clicks; no retouching, compositing, timeline seeks or rewritten animation attributes. Source hashes, dimensions and file hashes are retained. Actual desktop/mobile About movies show portrait first, then plaque, atmosphere and copy, settled by the3950ms sample. Parent mobile fell open during that one capture; desktop completed normally, so the before baseline is not described as always broken.

Real video loops and source counts advance without repeated source/load restarts. The24-test native-loop proof observes one 7.5s wrap, 199 presented callback samples, 209 browser total frames, 14 real compositor patches matching the immutable approved poster within2RGB levels (tolerance5), and zero source/load/play/emptied changes. Eight dropped frames and callback median49.9ms/p9566.7ms include software rendering and screenshot overhead; these are not physical-device FPS measurements or a controlled before/after speedup claim. The manager keeps at most one mobile/two desktop source leases and pauses offscreen/hidden/intro activity.

[Implementation decisions](IMPLEMENTATION.md) and [test mapping/retained intermediate failures](TEST_MAPPING.md) explain removed controls, actual frame presentation, the partial-script readiness fix, external About acknowledgement and synchronized actual callback-time epoch. Intermediate type, readiness-proxy, bundle-fallback and clock failures remain recorded. No baseline assertion was lowered or deleted to manufacture a green result.

## Remaining limits and owner actions

- **Native hidden-tab suspension is not verified.** Actual tab activation in both headless and headed Ozone left both pages visible. The recordings and manifest state this; deterministic hidden-state pause/hold/release/recovery tests pass. Mobile evidence is Chromium touch/viewport emulation; physical Safari/iOS/Android and hardware FPS remain unverified.
- The existing hand/emblem footer is still a **raster prototype**. This milestone creates no rigged photorealistic 3D asset.
- **No live email delivery is claimed.** Formspree is unconfigured. Owner endpoint/account/recipient verification, spam/domain settings, approved privacy policy and real inbox/Reply-To verification remain separate launch work. [Existing activation checklist](../contact-signature/FORMSPREE_ACTIVATION.md).
- Stop for owner visual review. Do not merge, deploy, update the Netlify mirror or activate live submissions automatically.

The optional `apt-get download xvfb` was not executed because automatic approval review hit a usage limit. This was a review failure, not a finding that the action was unsafe. Existing safe test/evidence work continued without installing packages; native hidden-tab proof remains a stated limitation.
