# Service pages — implementation handoff

The five service pillars now open distinct, substantive pages using one shared Afterglow layout. Each page preserves the supplied H1, title, meta description, opening, four sections, five FAQs and page-specific enquiry CTA. The warm paper, restrained orange, responsive typography, shared navigation and existing signature footer are reused.

[Review gallery](../../artifacts/services/README.md) · [Observed validation](SERVICE_PAGE_VALIDATION.md) · [Supplied editorial draft](SERVICE_PAGE_COPY_DRAFT.md)

## Routes and ownership

| Route                           | Page                    |
| ------------------------------- | ----------------------- |
| `/services/brand-identity`      | Brand Identity & Design |
| `/services/digital-design`      | Digital Design          |
| `/services/marketing-campaigns` | Marketing & Campaigns   |
| `/services/words-storytelling`  | Words & Storytelling    |
| `/services/creative-direction`  | Creative Direction      |

`src/data/services.ts` owns the typed long-form page content. The small `src/data/service-index.ts` supplies stable service IDs and routes to existing overview data without shipping the long-form copy into the Contact form's client code. `src/components/services/ServicePage.astro` owns the shared composition; `src/pages/services/[slug].astro` generates the five static routes. Homepage service cards, the capability strip and `/services` link directly to them. Each detail page links to the other four services and Contact.

FAQs use native `details`/`summary` elements with visible focus. They work with keyboard input and without JavaScript. No new dependency, form, analytics integration or animation system is added. The existing unconfigured Contact form remains disabled, with official email contact available.

## Editorial and publication boundary

The source remains an editorial draft for studio review. Scope examples remain conditional: development delivery, paid media, production responsibility, source files, ownership and handovers are defined through an agreed brief. No portfolio board is used as proof of a service engagement, writing authorship, launched website, formal creative-director role or measured campaign outcome. Related-project cards are intentionally deferred until relevance and attribution are confirmed.

Each page keeps the shared `noindex, nofollow` setting. JSON-LD contains only accurate `BreadcrumbList` and `Service` descriptions with relative preview URLs and the supplied studio name. It adds no production domain, pricing, offers, reviews, ratings or FAQ rich-result promise. Approved launch configuration, canonical URLs and indexing are later work.

This branch is stacked on `feature/recurring-loop-fluid-afterglow` ([PR #7](https://github.com/tenthtech/drawnout-digital/pull/7)), which depends on Contact ([PR #5](https://github.com/tenthtech/drawnout-digital/pull/5)). The service draft PR targets the recurring-loop branch so its diff contains the service milestone. Neither prerequisite nor this branch is merged or deployed by this task.

## Reproduce the evidence

```sh
npm run check
npm run lint
npm test
npm run build
npm run test:build
npm run test:publication
npx playwright test --config=playwright.services.config.ts
npm run preview -- --ignore-lock --port 4353
# In another terminal:
node scripts/capture-services.mjs
```

The isolated browser config serves the built `dist` on port 4351 and requires a successful build first. The capture script uses port 4353 by default; `SERVICE_CAPTURE_URL` can select another local production preview. Browser execution requires Chromium (`CHROMIUM_PATH`, default `/usr/bin/chromium`). Captures use real reduced-motion rendering at DPR 1, scroll to load native lazy footer images, decode images and return to the introduction. No content, animation timeline or screenshot pixels are replaced.

## Next review

Review the page hierarchy and screenshots, then approve or revise the supplied editorial copy and actual service scopes. Confirm delivery responsibilities, ownership/handover terms, writing capability, paid-media scope and any future related-project attribution before public launch. The existing Contact provider setup and privacy dependencies also remain. This is a draft structure/content review; merge and deployment require their own authorization.
