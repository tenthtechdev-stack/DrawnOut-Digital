# Asset pipeline, video placeholders & portfolio publishing policy

## 1. Source materials and rights
The supplied portfolio archive is 46 PNG images / 15 folders. They are evidence of design presentations, not publication approval or proof of specific client deliverables. **Before publishing** each project, require actual commissioning/concept status, proper names, attribution, DrawnOut role, permitted imagery, permission to show, and any documented outcomes.

## 2. Temporary assets included
Seven optimized WebP renders in `assets/portfolio-placeholders/`: `bunzo.webp`, `sol-community-center.webp`, `triarch.webp`, `churros.webp`, `feed-n-seed.webp`, `by-tech-group.webp`, `abacus-immigration.webp`.
Source: the original uploaded DrawnOut portfolio PNGs; these are resized/encoded development derivatives. Do not assert any metric in flattened compositions as an actual brand performance result.

## 3. Video placeholder strategy (explicit user instruction)
DrawnOut will deliver actual videos later. Until then the site should include real, deliberately designed media containers using the **provided portfolio imagery**. They must preserve aspect ratio, show a high-quality poster, and avoid broken players or arbitrary stock footage. No generic off-brand stock videos.

Component concept: `MediaSlot.astro` with props:
```
type MediaSlotProps = {
  id: string;
  poster: ImageMetadata | string;
  video?: { webm?: string; mp4?: string; captions?: string };
  mediaKind: 'hero-showreel'|'case-media'|'footer-final';
  aspectRatio: '16/9'|'4/3'|'1/1'|'9/16';
  alt: string;
  availability: 'placeholder'|'approved';
  motion?: 'ambient'|'scroll-driven'|'none';
};
```
**Placeholder behavior:** show optimized `<picture>` or Astro `<Image>` as background with subtle slow 1.02→1.05 zoom (desktop only, user permits motion), a restrained corner tag `Visual preview` or no play icon. If a CTA leads to a video that does not exist, don't show it. Once real footage exists, replace media *source* while preserving layout, controls and fallback poster. Video default muted, playsInline, loop only for decorative ambient content, `preload=none|metadata` offscreen and `poster` always set. If meaningful speech/dialogue exists, captions/transcript required.

## 4. Initial placement map
- Home hero showreel placeholder: a wide framed area using `bunzo.webp` or a curated image cycle where changing backgrounds is not essential; do not place a massive autoplay board over the headline.
- Home featured sequence: Bunzo, SOL, Triarch, Churros, By Tech and Abacus, pending sign-offs. Feature only `published` projects.
- Services art moments: `sol-community-center.webp`, `feed-n-seed.webp`, `by-tech-group.webp` can stand in for future approved reels, labeled as visual prototypes.
- Work/project pages: optimize board thumbnails and request isolated artwork for real case-study galleries.
- Footer: separate `footer_final` media slot. Do **not** mistake Bunzo or an unrelated client board for the hand/logo final art. Use a bespoke brand placeholder and final approved assets when received.

## 5. Image engineering
- Local project stills live in `src/assets/projects/` for build-time optimization or reference imports. Keep original raws outside public build if unnecessary; optimize thumbnails into WebP/AVIF with adaptive sizes.
- Every `Image` has width, height, aspect ratio and alt. Use Astro optimized responsive images for content; CSS `object-fit`/`object-position` decisions per project.
- Protect logotypes in artwork: don't crop actual client marks in embarrassing ways, don't put opacity filters over copyrighted graphic board text, and always manually review mobile crops.
- Include all images in a clear manifest or content schema; filenames should be stable.
- Distinguish decorative abstract background (alt="") from informative case images (meaningful alt descriptions).

## 6. Content schema suggestion (implement using Astro collections current version)
```ts
// Model design; adapt exact `defineCollection`, glob loader and `image()`
// API to the installed Astro version.
export type ProjectRecord = {
  title: string;
  slug: string;
  summary: string;
  status: 'draft' | 'review' | 'published';
  visibility: 'public' | 'private';
  projectType: 'client' | 'concept' | 'internal' | 'unknown';
  publicationApproved: boolean;
  creditApproved: boolean;
  clientName?: string;
  year?: number;
  industry?: string;
  services: string[];
  featured: boolean;
  featuredOrder?: number;
  cover: string;
  gallery: Array<{src: string; alt: string; caption?: string}>;
  video?: {poster: string; mp4?: string; webm?: string};
  challenge?: string;
  concept?: string;
  approach?: string;
  deliverables?: string[];
  results?: Array<{label: string; value: string; evidenceSource: string}>;
  credits?: string[];
  seoTitle?: string;
  seoDescription?: string;
};
```
`canPublish(project)` must require `status === 'published' && visibility === 'public' && publicationApproved`; otherwise the project must not generate a public route or appear in sitemaps, feeds or related-work cards. This is a *publication gate*; it does not substitute for the team obtaining actual permissions. Do not use placeholder status as an excuse to ship unapproved work.

## 7. Example of safe new-project workflow using Codex
1. Add source files to the media staging directory.
2. Provide project title, short brief, role, categories, media order, permission status and description to Codex.
3. Codex creates a validated draft content entry, checks image links, alt text and warnings.
4. Preview locally or on a private preview deployment; studio reviewer verifies creative presentation and credits.
5. Only after manual approval, set `publicationApproved:true` and `status:published` then merge.
6. Automatic Work index, category filters, homepage selection and `/work/[slug]` page update from the same record.

## 8. Future CMS
The first release uses Codex/Git. A browser-side admin is **not** required. A future Decap-style Git editor can preserve file-based workflow, or a hosted structured CMS (e.g. Sanity) can be integrated. The typed schema and separation of content from layout are deliberate future migration seams.
