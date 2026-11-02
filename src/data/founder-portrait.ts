import type { ImageMetadata } from 'astro';

export interface ApprovedFounderPortrait {
  src: ImageMetadata;
  alt: string;
  source: string;
  publicationApproved: true;
}

// Add only the derived illustration after explicit founder approval. The
// original personal photograph must never enter the repository or build.
export const founderPortrait: ApprovedFounderPortrait | null = null;
