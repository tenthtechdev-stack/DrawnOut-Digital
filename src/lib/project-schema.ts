import { z } from 'astro/zod';

/** Describes visible artwork formats; these tags never verify commissioned services. */
export const projectCategories = ['identity', 'packaging', 'digital', 'print'] as const;
export type ProjectCategory = (typeof projectCategories)[number];

/** One schema shared by Astro's image resolver and the standalone content tests. */
export function projectSchema<T extends z.ZodType>(imageSchema: T) {
  const captionedImage = z.object({
    src: imageSchema,
    alt: z.string().trim().min(1),
    caption: z.string().trim().min(1).optional(),
    layout: z.enum(['full', 'inset', 'pair']).default('full'),
  });

  return z.object({
    title: z.string().trim().min(1),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase, hyphen-separated URL slug.'),
    summary: z.string().trim().min(1),
    status: z.enum(['draft', 'review', 'published']).default('draft'),
    visibility: z.enum(['private', 'public']).default('private'),
    projectType: z.enum(['client', 'concept', 'internal', 'unknown']).default('unknown'),
    publicationApproved: z.boolean().default(false),
    creditApproved: z.boolean().default(false),
    clientName: z.string().trim().min(1).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    industry: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1).optional(),
    services: z.array(z.string().trim().min(1)).default([]),
    categories: z
      .array(z.enum(projectCategories))
      .refine((categories) => new Set(categories).size === categories.length, {
        message: 'Artwork categories must be unique.',
      })
      .default([]),
    workOrder: z.number().int().nonnegative().optional(),
    presentation: z.enum(['wide', 'split', 'portrait', 'offset']).default('wide'),
    contentVerified: z.boolean().default(false),
    overview: z.string().trim().min(1).optional(),
    featured: z.boolean().default(false),
    featuredOrder: z.number().int().nonnegative().optional(),
    cover: imageSchema,
    coverAlt: z.string().trim().min(1),
    gallery: z.array(captionedImage).default([]),
    assetSource: z.string().trim().min(1),
    video: z
      .object({
        poster: imageSchema,
        mp4: z.string().trim().min(1).optional(),
        webm: z.string().trim().min(1).optional(),
        captions: z.string().trim().min(1).optional(),
      })
      .optional(),
    challenge: z.string().trim().min(1).optional(),
    concept: z.string().trim().min(1).optional(),
    approach: z.string().trim().min(1).optional(),
    deliverables: z.array(z.string().trim().min(1)).optional(),
    results: z
      .array(
        z.object({
          label: z.string().trim().min(1),
          value: z.string().trim().min(1),
          evidenceSource: z.string().trim().min(1),
        }),
      )
      .optional(),
    credits: z.array(z.string().trim().min(1)).optional(),
    seoTitle: z.string().trim().min(1).optional(),
    seoDescription: z.string().trim().min(1).optional(),
  });
}

export interface PublicationState {
  status: 'draft' | 'review' | 'published';
  visibility: 'private' | 'public';
  projectType: 'client' | 'concept' | 'internal' | 'unknown';
  publicationApproved: boolean;
  creditApproved: boolean;
}

/** Approval flags represent human review; they never establish rights by themselves. */
export function canPublish(project: PublicationState): boolean {
  return (
    project.status === 'published' &&
    project.visibility === 'public' &&
    project.publicationApproved === true &&
    project.creditApproved === true &&
    (project.projectType === 'client' ||
      project.projectType === 'concept' ||
      project.projectType === 'internal')
  );
}

interface SelectableProject {
  id: string;
  data: PublicationState & { featured: boolean; featuredOrder?: number; slug: string };
}

export interface ProjectSelectionOptions {
  featuredOnly?: boolean;
}

/** Reuse for homepage, work, case routes, related work, feeds and sitemaps. */
export function selectPublicProjects<T extends SelectableProject>(
  projects: readonly T[],
  { featuredOnly = false }: ProjectSelectionOptions = {},
): T[] {
  return projects
    .filter(({ data }) => canPublish(data) && (!featuredOnly || data.featured))
    .sort(
      (a, b) =>
        (a.data.featuredOrder ?? Number.POSITIVE_INFINITY) -
          (b.data.featuredOrder ?? Number.POSITIVE_INFINITY) ||
        a.data.slug.localeCompare(b.data.slug),
    );
}
