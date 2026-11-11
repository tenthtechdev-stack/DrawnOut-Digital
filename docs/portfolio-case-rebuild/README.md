# Project case-study editorial package — review index

**Created:** 4 November 2026  
**Status:** Source-grounded draft for owner review and Codex implementation. **NOT production SEO activation, factual verification or credit approval.**

## Files

- [Project editorial candidates](project-editorial-candidates.json): 11 uniquely authored visual narratives and SEO candidate fields; 37 image/media placements mapped to existing optimized \`src/assets/portfolio/*.webp\`; evidence-accurate alt text, captions, project-specific hero titles and brief secondary text.
- [Implementation brief](IMPLEMENTATION_BRIEF.md): adaptive modular gallery, video integration, responsive layout, content model, SEO approvals, accessible behavior, media architecture, testing and Git integration policy.

## The 11 records covered

| Public route                   | Gallery assets in manifest | Existing video |
| ------------------------------ | -------------------------: | -------------- |
| \`/work/sol-community-center\` |                          5 | Yes            |
| \`/work/bunzo\`                |                          6 | Yes            |
| \`/work/triarch\`              |                          4 | Yes            |
| \`/work/churros\`              |                          4 | Yes            |
| \`/work/by-tech-group\`        |                          2 | Yes            |
| \`/work/capture\`              |                          3 | No             |
| \`/work/khalo\`                |                          3 | No             |
| \`/work/fk-technology\`        |                          3 | No             |
| \`/work/feed-n-seed\`          |                          2 | No             |
| \`/work/abacus-immigration\`   |                          2 | No             |
| \`/work/u-wanna-smoothie\`     |                          3 | Yes            |

_37 placements count existing image derivatives, not necessarily 37 independent original artworks. Some images are alternate crops from the same presentation board. The layout must detect and avoid obvious repetition._

## Draft example: SOL Community Center

**H1:** SOL Community Center  
**Leading statement:** A mark that carries a sense of connection.  
**Intro:** A circular, nature-inspired emblem sits at the center of SOL Community Center's green-and-gold visual presentation. The symbol, serif lettering and warm cream accents repeat across community notices and branded applications.  
**Second heading:** One visual language, many touchpoints.  
**Supporting text:** The identity is shown at different scales, from an exterior-sign mockup to apparel and printed pieces. The announcement layouts use the same color and graphic vocabulary while adapting to different messages.  
**Proposed SEO title:** SOL Community Center | Green & Gold Identity | DrawnOut  
**Proposed meta:** Explore SOL Community Center's green-and-gold visual identity, from its circular symbol and typography to signage, apparel and community announcements.  
**Art:** an applications collage, signage close-up, identity guide, notices and apparel detail; an already-produced SOL 5–6s silent motion study can form one featured slot.

## Factual boundaries and pending approvals

- All 11 current project records are approved for **visual display**, not for attributed client work, delivered services, named teams, timeline, outcomes or financial results.
- The existing public \`/work/[slug]\` route currently gates custom \`seoTitle\` / \`seoDescription\` on BOTH \`contentVerified\` and \`creditApproved\`. These remain \`false\`. **These new SEO suggestions cannot be silently placed in gated production fields or treated as live metadata.**
- Any new SEO-safe visual metadata field needs a distinct editorial approval mechanism, plus the normal display approval, without weakening current factual/attribution gates.
- Avoid false historical process language: imagery shows design presentations, not verifiable drafts→final delivery progression.
- Existing site uses preview-wide \`noindex\`. Do not change this before owner approves public launch.
- Contact details, embedded print pricing, social-platform performance metrics or source board numbers cannot be propagated into public factual narratives.
- Do not publish new case routes for the archived folders that lack structured approval (Barm Technology, DrawnOut Fashion & Textile, Unsorted Misc).

## Review sequence

1. Codex builds and records one _mosaic-4_ (SOL), one _mosaic-2_ (By Tech Group), one _mosaic-3_ (Capture) and one motion-heavy case (Bunzo) on a new implementation branch based on the latest active development stack.
2. Owner visually approves crop logic, mobile layout and motion.
3. Codex applies the reviewed component and manifest copy to all 11 existing public routes.
4. Run full publication, accessibility, video and responsive regressions.
5. Owner approves public-facing final wording and custom visual-only SEO fields. Separately verify any desired client credits/roles before publishing them.

**Nothing in these two documents changes current live website content, original artwork or approval flags.**
