import type { ImageMetadata } from 'astro';
import foundersSketch from '../assets/about/founders-sketch-approved.png';

export interface ApprovedFounderPortrait {
  src: ImageMetadata;
  alt: string;
  source: string;
  publicationApproved: true;
}

// Only the owner-approved derived sketch is public. The original personal
// photograph and rejected review candidates remain outside the repository.
export const founderPortrait: ApprovedFounderPortrait = {
  src: foundersSketch,
  alt: 'Expressive charcoal and orange sketch of DrawnOut’s twin founders together, with long flowing hair, natural expressions and loosely drawn embroidered clothing.',
  source:
    'Derived from the privately supplied original founder photograph. The owner approved the expressive sketch for the About hero and repository publication on 2 November 2026. Portrait positions are not mapped to names. Raster illustration; reveal masks are not independent drawing paths.',
  publicationApproved: true,
};
