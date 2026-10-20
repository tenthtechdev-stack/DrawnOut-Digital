# Phase 0 validation

Observed in the current cloud machine using Node 24.19.0, npm 11.9.0, Astro 7.4.1, and system Chromium. These results validate the local foundation, not a published deployment or a newly restored task.

| Check                                  | Observed result                                                                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --cache /workspace/.cache/npm` | Passed; clean lockfile installation, 405 packages.                                                                                                                                                                            |
| `npm run verify`                       | Passed: Astro check (19 files, zero errors/warnings/hints), ESLint, 7 content tests, production build.                                                                                                                        |
| `npm run test:build`                   | Passed, 1 test. Only neutral index HTML emitted; no concept/case routes or draft project images.                                                                                                                              |
| `npm run test:browser`                 | Passed, 15 tests, no skipped tests. Both concepts at 360/390/768/1024/1440/1920px; loaded images, no horizontal overflow, working anchors and comparison links, keyboard skip link, no-JavaScript/reduced-motion readability. |
| `npm run format:check`                 | Passed for matched implementation files. Original source-pack documents and supplied AGENTS.md are preserved rather than reformatted.                                                                                         |
| Development startup request            | Passed: local HTTP request returned the supplied hero headline and design study label.                                                                                                                                        |

Browser screenshots were visually inspected after capture. Each concept has a full-page desktop/mobile capture and a hero capture in `artifacts/` at 1440 and 390px. The final capture waits for all project posters to load; the reference competitors' artwork is not used in the concepts.

Issues corrected during validation: cloud npm cache/home configuration, Astro telemetry home writes, compatible lint versions and Node types, foreground development-server behavior, development toolbar interference with browser checks, and draft images initially retained in the production asset graph. A development-only dynamic import now keeps those images out of production; the output test protects this behavior.

No required automated check remains failed. Human choice between the two directions is outstanding. Real-device Safari/Android, assistive technology, launch performance measurements, contact delivery, final media, and scroll-footer motion are later-phase checks and have not been claimed as passed.

The cloud environment draft has saved `install_script` and `start_skill`. Saving did not publish the environment; review and save the changes in environment settings, then publish the environment to activate them for future tasks. Publication and fresh-task restoration have not been verified.
