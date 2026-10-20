# Publishing and review access recovery

The original workspace contains the Astro implementation, installed dependencies, configuration and lockfile, typed draft portfolio records, automated tests, both requested Phase 0 documents, and all four full-resolution concept PNGs. No required file was missing.

Initial Git inspection found an unborn `work` branch, no local commits, and the correct origin `https://github.com/tenthtech/drawnout-digital.git`. A read-only remote query returned no refs. The `artifacts/` ignore rule had excluded every screenshot from Git.

The delivery fix adds an explicit allowlist for `artifacts/README.md` and the four requested screenshots, plus a GitHub-renderable gallery. The PNG files are not altered or regenerated. Dependencies, build output, caches, environment files, and browser-run output remain ignored. No application source or creative direction changes are part of this recovery.

## Checkpoint contents

The requested Phase 0 source, examples, tests, original handoff/validation, supplied project assets, and four review screenshots are preserved. The workspace also already contained the Phase 1 foundation from the earlier authorized turn; it is retained rather than deleted or reverted to manufacture an earlier state. This checkpoint is therefore an honest recovery of the existing implementation, with the Phase 0 studies clearly identified for review.

The seven project entries remain draft/private and unapproved. Including their supplied review assets in this authorized repository checkpoint does not publish case-study routes or approve client claims. The production asset/route exclusion checks remain active. No public website deployment is performed.

## Screenshot integrity

| Screenshot           | Original dimensions | SHA-256                                                            |
| -------------------- | ------------------- | ------------------------------------------------------------------ |
| `concept-a-1440.png` | 1440 × 4700         | `715897cd9bfc4bd90969f8e3727b10d5ebc41ebced7d97ed41702f4f59936119` |
| `concept-a-390.png`  | 390 × 3636          | `204cdeab64c1992439c7b0ffef6d15ac3e7d50664712d158eb66abb16823861e` |
| `concept-b-1440.png` | 1440 × 3701         | `f562922a1f3fb216d2ac8836f3369cf4dcfccc804bf20e8dab2771e021812ed5` |
| `concept-b-390.png`  | 390 × 3974          | `ef984e5b9903897509c4f658f6656572772fb90804e26d6809b2d35e019acfaa` |

Each PNG was decoded and verified before staging. All four gallery image paths resolve relative to the gallery document. Post-push verification compares the remote commit and committed image bytes with these originals.

## Validation method

Run `npm run verify`, `npm run test:build`, `npm run format:check`, and the existing Playwright suite. Browser checks write screenshots relative to their process working directory. For recovery verification the suite runs from a temporary output directory with the repository's existing Playwright configuration, preserving the committed screenshots. No test assertions are disabled and no original design artifact is replaced.

The published branch/commit, current check results, and remote readback evidence are recorded after publishing in `PUBLISHING_VALIDATION.md`. Development remains paused for review.
