# Publishing recovery — verified results

Repository: [tenthtech/drawnout-digital](https://github.com/tenthtech/drawnout-digital)

Branch: `main`.

The initial recovered implementation checkpoint was pushed successfully as `67e1d3919c1f173cffef8fffec31ea027bc6cf58`. The remote was empty immediately before this initial commit. A documentation-only follow-up adds these post-push results; no source or screenshot changes are part of that follow-up.

## Post-push checks

| Check                             | Actual result                                                                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                  | Passed: Astro TypeScript validation, ESLint, unit/content/contrast tests, and production build.                                                                                    |
| TypeScript / Astro check          | 39 files; zero errors, warnings, or hints.                                                                                                                                         |
| `npm test` through verify         | 13 passed, zero failed/skipped.                                                                                                                                                    |
| Production build                  | Passed; six existing foundation routes.                                                                                                                                            |
| `npm run test:build`              | 2 passed, zero failed/skipped; draft portfolio routes and media excluded from production.                                                                                          |
| `npm run format:check`            | Passed.                                                                                                                                                                            |
| Existing Playwright browser suite | 30 passed, zero failed/skipped, in 18.6 seconds.                                                                                                                                   |
| Gallery relative image paths      | All four resolve to valid, full-resolution PNGs.                                                                                                                                   |
| GitHub readback                   | Initial remote commit matched local HEAD; all 91 committed files matched the initial tree. All four screenshot blobs decoded successfully and matched the original SHA-256 values. |

Total: **45 automated tests passed**, plus build, TypeScript, lint, and formatting. No check was skipped or disabled. The original source-pack documents retain their intentional Markdown hard-break whitespace and CSV line endings; they were not rewritten for Git whitespace diagnostics.

## Preserving the review images

The existing browser tests save screenshots relative to their process working directory. They were run from `/tmp/drawnout-publish-checks` with the original configuration, redirecting new output away from the original images:

```sh
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-publish-checks/test-results
```

The gallery's four screenshot hashes are recorded in [the recovery notes](PUBLISHING_RECOVERY.md). The original images were not regenerated, resized, or replaced.

## Delivery status

- The implementation, tests, configuration, lockfile, permitted review assets, and original Phase 0 documents are committed on `main`.
- [The gallery](../artifacts/README.md) embeds all four PNGs using relative Markdown paths for direct GitHub browser review.
- Dependencies, build outputs, caches, environment secrets, and credentials are excluded.
- The existing Phase 1 foundation was preserved because it was already in the workspace. No new design work, creative-direction change, or website deployment was performed during this recovery.
- Publishing succeeded using the existing repository connection. No GitHub authentication or Git permission blocker remains from the observed operations.

Development is paused for review. GitHub's normal repository access rules apply to the gallery and image links.
