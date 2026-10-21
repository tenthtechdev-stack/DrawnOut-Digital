# Phase 2 validation — Afterglow homepage storytelling

Validated on 21 October 2026 in the managed Linux workspace with Node **24.19.0**, npm **11.9.0**, and the installed Chromium browser. The implementation extends asset commit `fe15b550542e32ef224e506dcd2c5ff13eb3ba10` on `phase2/afterglow-storytelling`; no Phase 3 work, merge, or public deployment is included.

## Observed results

| Check                                   | Actual result                                                     |
| --------------------------------------- | ----------------------------------------------------------------- |
| `npm run verify`                        | Passed: Astro check, ESLint, unit tests, production build         |
| Astro / strict TypeScript               | 47 files; 0 errors, 0 warnings, 0 hints                           |
| ESLint                                  | Passed, no diagnostics                                            |
| Unit / content / contrast / asset tests | 15 passed; 0 failed or skipped                                    |
| Production build                        | Passed; 6 static foundation routes                                |
| `npm run test:build`                    | 3 passed; 0 failed or skipped                                     |
| Complete Playwright browser suite       | 37 passed; 0 failed or skipped; 31.7 seconds                      |
| `npm run format:check`                  | Passed, all matched files use Prettier style                      |
| `git diff --check`                      | Passed                                                            |
| Linux production-preview smoke          | HTTP 200; new process section present; draft project names absent |

The three automated suites total **55 passing tests**. Formatting also passed after the review documentation was assembled. Build output, dependencies, caches, logs, and environment files are excluded from the commit.

## Browser invocation and evidence

The suite ran from a temporary directory so earlier screenshot files could not be overwritten by tests retained from Phase 0/1:

```sh
mkdir -p /tmp/drawnout-phase2-final
cd /tmp/drawnout-phase2-final
node /workspace/drawnout-digital/node_modules/@playwright/test/cli.js test \
  --config /workspace/drawnout-digital/playwright.config.ts \
  --output /tmp/drawnout-phase2-final/test-results
```

Only the 28 fresh Phase 2 PNGs were copied into `artifacts/phase-2/`. All earlier Phase 0/1 PNGs retain their original hashes. The gallery embeds every Phase 2 image with relative links and preserves the full capture resolution.

| Viewport       | Full-page capture       | Other evidence                                                                                       |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| 390px          | 390 × 8577 PNG          | Hero/header, portfolio, studio, services, approach, process, client fit, footer, expanded navigation |
| 768px          | 768 × 7155 PNG          | Hero/header and the seven story/footer sections                                                      |
| 1440px         | 1440 × 8889 PNG         | Hero/header and the seven story/footer sections                                                      |
| 320px / 1920px | Automated layout checks | Visible heading text stays inside viewport; no horizontal document overflow                          |

The five-width story tests verify all five canonical project names, five responsive stills, five capabilities, and four process steps. They check loaded image dimensions, source sets, correct mobile/desktop picture selection for Bunzo and Churros, varied image proportions, no misleading video controls, no case-study links, and no browser page errors. Retained tests cover the concept archive, navigation, route foundations, focus/menu behavior, and broader responsive sizes.

Manual inspection covered the final desktop composition, tablet services layout, mobile portfolio framing, and earlier section captures for typography, spacing, hierarchy, and clipping. These checks establish Chromium behavior in this environment; they do not establish hardware Safari/Android performance, comprehensive WCAG conformance, or production Core Web Vitals.

## Original assets and publication boundary

- The 15 original folders contain exactly 46 PNGs. Automated Git-blob comparisons prove every original remains identical to the authorized asset commit.
- Eleven original-derived WebPs total **1,480,526 bytes**. Tests verify their signatures, provenance, local paths, and smaller size relative to the source PNG. Responsive candidates never upscale the source.
- All seven content entries remain private drafts with unknown commissioning status and false publication/credit approvals.
- Production emits only Home, Work, Services, About, Contact, and 404. The original-copy homepage sections remain visible without development portfolio content.
- Production-output tests inspect generated pages, filenames, HTML, CSS, JavaScript, and JSON. No draft artwork, original-source path, unapproved project names, concept routes, or draft case routes are emitted.
- The application has not been publicly deployed. The GitHub review gallery is the explicitly authorized evidence package.

## Cross-platform scripts and limits

`cross-env@10.1.0` replaces Unix-only environment assignment for `dev`, `check`, `build`, and `preview`, preserving existing flags. Linux environment propagation and child exit-code preservation passed. All four entry points were exercised; the final check/build, browser development server, and production-preview smoke also ran successfully.

Windows/PowerShell is not installed here, so no native Windows run is claimed. No real videos were supplied; current stills render without play controls. The optional approved-video interface is prepared, while actual footage, captions, playback quality, and device testing remain future validation.

## GitHub delivery

`git push -u origin phase2/afterglow-storytelling` **succeeded** and created the remote branch. Implementation commit: `fb87586b9c440f2cb33e427137feea0cf9ace1a0`. A fresh bare clone from GitHub returned that exact SHA. The gallery and all 28 PNGs retrieved from that clone match the workspace byte for byte and decode as valid PNGs. All 46 original PNGs were also verified from the fresh clone. Every relative gallery link resolves to a committed file.

Remote `main` remains at `fe15b550542e32ef224e506dcd2c5ff13eb3ba10`; no force-push, merge, or public application deployment occurred. The final delivery SHA may include an additional documentation-only commit recording these observed results.

### Earlier API failure — resolved

Git transport worked during initial publication, but GitHub API access was blocked because `api.github.com` was absent from the environment's allowed hosts. A configured GitHub token binding was present; no token value was read. The initial read-only API command failed with:

```text
gh api repos/tenthtech/drawnout-digital --jq '{default_branch,private,permissions}'
Get "https://api.github.com/repos/tenthtech/drawnout-digital": Forbidden
```

After the branch was published, the actual PR creation command also failed:

```text
gh pr create --draft --repo tenthtech/drawnout-digital --base main --head phase2/afterglow-storytelling --title "Build Afterglow Phase 2 homepage storytelling" --body-file /tmp/drawnout-phase2-pr-body.md
Post "https://api.github.com/graphql": Forbidden
```

That failed attempt did not create a pull request. The user subsequently authorized the `api.github.com` hostname addition; it was saved without replacing existing network presets. After the configuration change, `gh api repos/tenthtech/drawnout-digital` succeeded with the existing connection. No replacement credential was required.

### Final PR verification

[Draft pull request #1 — Build Afterglow Phase 2 homepage storytelling](https://github.com/tenthtech/drawnout-digital/pull/1) is **OPEN** and **draft**, targets `main`, and uses `phase2/afterglow-storytelling`. It already existed when the successful retry listed the branch's pull requests; no duplicate was created. Its verified implementation head was `50267934c4ba436e3a136d3786575dcb419515fd` before this documentation-only delivery update.

The PR description links the correct branch's gallery, handoff, asset audit, and validation report, and preserves the Phase 2 approval boundary. GitHub reports no configured PR status checks (`statusCheckRollup: []`); the 55 passing automated tests above are the observed local validation results, not hosted CI results. Application source and screenshots are unchanged by this delivery update. The final branch SHA and push are verified after committing the resolved-access notes.

Direct GitHub API verification also passed at that head: all 37 relative gallery links resolve to committed files, and all 28 PNG blobs were retrieved successfully (12,611,718 bytes). Every image matches the local committed Git hash and workspace bytes, decodes as PNG, and has the expected dimensions. This confirms image retrieval independently of the earlier fresh-clone check.

**Phase 2 stops for visual approval. No merge, deployment, or Phase 3 work is authorized.**
