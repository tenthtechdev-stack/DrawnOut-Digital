import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { canPublish } from './project-schema';

export interface CaseImage {
  src: ImageMetadata;
  alt: string;
  caption: string;
  /** Existing optimized asset stem, used for curation rather than public attribution. */
  key: string;
}

export type CaseTone = 'sol' | 'bunzo' | 'triarch' | 'capture' | 'by-tech';

export interface CasePresentation {
  heroLine: string;
  intro: string;
  visualHeading: string;
  visualCopy: string;
  conclusion: string;
  tone: CaseTone;
  mosaic: 'mosaic-4' | 'mosaic-3' | 'mosaic-2';
  lead: CaseImage;
  gallery: CaseImage[];
  /** A related site destination, never a claim about services performed. */
  service: { label: string; href: string };
}

type FramePlan = Omit<CaseImage, 'src'>;
type PresentationPlan = Omit<CasePresentation, 'lead' | 'gallery' | 'service'> & {
  frames: readonly FramePlan[];
};

/** Only the five authorized pilots opt into the new presentation at this gate. */
export const casePilotSlugs = [
  'sol-community-center',
  'bunzo',
  'triarch',
  'capture',
  'by-tech-group',
] as const;

/*
 * Visual-only review copy adapted from the owner's editorial package. No SEO,
 * client, service-delivery, date, credit, result or factual verification fields
 * enter this adapter. The canonical project records remain unchanged.
 */
const plans: Record<(typeof casePilotSlugs)[number], PresentationPlan> = {
  'sol-community-center': {
    heroLine: 'A mark that carries a sense of connection.',
    intro:
      'A circular emblem sits at the center of SOL Community Center’s green-and-gold presentation. Serif lettering, warm cream and repeating curved forms connect the notices and application mockups.',
    visualHeading: 'One visual language. Many touchpoints.',
    visualCopy:
      'The same circular mark appears at different scales, from exterior signage to apparel and printed pieces. Green, cream and gold bring a consistent visual rhythm to the announcement layouts.',
    conclusion: 'A circular mark. A connected visual world.',
    tone: 'sol',
    mosaic: 'mosaic-4',
    frames: [
      {
        key: 'sol-community-applications',
        alt: 'SOL Community Center signage, shirts, tote, cap, stationery and banner mockups in green and gold.',
        caption: 'The circular identity across physical application mockups.',
      },
      {
        key: 'sol-notice-layouts',
        alt: 'Four SOL Community Center announcement layouts using cream, forest green, yellow and large serif lettering.',
        caption: 'A shared graphic vocabulary across four announcements.',
      },
      {
        key: 'sol-identity-system',
        alt: 'SOL circular logo variations, forest-green and gold palette, serif typography and repeating pattern samples.',
        caption: 'Symbol, palette, typography and repeating forms.',
      },
      {
        key: 'sol-community-signage',
        alt: 'SOL Community Center gold-and-green emblem and lettering on an exterior-sign mockup.',
        caption: 'A closer view of the exterior-sign presentation.',
      },
      {
        key: 'sol-apparel-detail',
        alt: 'SOL Community Center emblem and lettering on white and forest-green shirts.',
        caption: 'The emblem at apparel scale.',
      },
    ],
  },
  bunzo: {
    heroLine: 'Big character. Packed into every bite.',
    intro:
      'Oversized black-and-white lettering, saturated red and flashes of yellow give the Bunzo artwork its energy. The same graphic character runs through takeaway packaging and food-led promotional layouts.',
    visualHeading: 'From the wordmark to the wrapper.',
    visualCopy:
      'Bags, boxes and cups carry chunky lettering and playful drawn details. Red and cream compositions bring the logo together with food photography, while the closer packaging views reveal changes in scale and material.',
    conclusion: 'Expressive type. Packaging with presence.',
    tone: 'bunzo',
    mosaic: 'mosaic-4',
    frames: [
      {
        key: 'bunzo-cup-detail',
        alt: 'Red Bunzo takeaway drink cup with large black-and-white lettering and a white lid.',
        caption: 'Graphic lettering on the takeaway-cup presentation.',
      },
      {
        key: 'bunzo-packaging-wide',
        alt: 'Bunzo red takeaway bag, burger box, drink cup, fries carton and patterned wrapper arranged together.',
        caption: 'The red packaging family in one composition.',
      },
      {
        key: 'bunzo-identity',
        alt: 'Bunzo black-and-white logo, yellow accent, burger photography and alternate letterform marks on a red board.',
        caption: 'The wordmark, alternate marks and food imagery.',
      },
      {
        key: 'bunzo-social-layouts',
        alt: 'Bunzo promotional artwork with red-and-cream layouts, burger photographs and bold typographic headlines.',
        caption: 'Food-led promotional compositions in the same palette.',
      },
      {
        key: 'bunzo-bag-detail',
        alt: 'Brown Bunzo carry bag with red graphics beside a red food box on a dark background.',
        caption: 'A closer view of the bag-and-box mockup.',
      },
    ],
  },
  triarch: {
    heroLine: 'Minimal color. Typographic presence.',
    intro:
      'Triarch’s statement wordmark sits against pale architectural imagery and textured gray surfaces. A narrow yellow line brings a small point of contrast to the business-card presentation.',
    visualHeading: 'The details do the talking.',
    visualCopy:
      'The card gives the lettering room to stand on its own. A separate letterform view and a device mockup explore the contrast between the dark wordmark, a white monogram and quieter surrounding materials.',
    conclusion: 'Type, texture and a restrained point of color.',
    tone: 'triarch',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'triarch-business-card',
        alt: 'White Triarch business card with a dark wordmark and thin yellow line on overlapping textured gray surfaces.',
        caption: 'The wordmark against tactile gray materials.',
      },
      {
        key: 'triarch-letterform-detail',
        alt: 'Dark Triarch wordmark and horizontal tagline over pale geometric architectural imagery.',
        caption: 'The lettering isolated from the larger presentation board.',
      },
      {
        key: 'triarch-device-detail',
        alt: 'White Triarch monogram sticker on a silver laptop beside a white mouse.',
        caption: 'A device-detail mockup with the monogram in white.',
      },
    ],
  },
  capture: {
    heroLine: 'A sharp visual focus. In red and black.',
    intro:
      'A circular, target-like symbol gives the Capture presentation its focal point. Red graphic fragments contrast with black and gray surfaces across the identity board and printed-object mockups.',
    visualHeading: 'A symbol that holds its shape.',
    visualCopy:
      'The logo board brings together alternate color treatments and fragments of the circular mark. Stationery, signs and screen presentations show that graphic language at different scales.',
    conclusion: 'A focused visual language, drawn around a circle.',
    tone: 'capture',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'capture-applications',
        alt: 'Capture red circular graphics on dark stationery, notebook, badge, signage and screen presentation mockups.',
        caption: 'A selection of physical and screen presentation mockups.',
      },
      {
        key: 'capture-identity',
        alt: 'Capture red-and-black target-like logo, alternate marks, palette swatches and circular graphic fragments.',
        caption: 'The circular symbol, palette and graphic fragments.',
      },
      {
        key: 'capture-stationery-detail',
        alt: 'Black Capture stationery folder beside a white printed sheet on a dark gray background.',
        caption: 'A closer view of the stationery presentation.',
      },
    ],
  },
  'by-tech-group': {
    heroLine: 'A connected mark. A vivid digital palette.',
    intro:
      'By Tech Group’s connected letterform symbol moves from blue to green against dark surfaces. The supplied artwork places the mark across stationery, branded objects and device mockups.',
    visualHeading: 'One mark. Different surfaces.',
    visualCopy:
      'Color and monochrome treatments sit alongside a blue-to-green monogram and icon concepts. The applications board repeats that visual language across a card, mug, bag, document and phone presentation.',
    conclusion: 'A connected symbol, held together by color.',
    tone: 'by-tech',
    mosaic: 'mosaic-2',
    frames: [
      {
        key: 'by-tech-applications',
        alt: 'By Tech Group blue-and-green symbol on dark stationery, a black mug, tote, lanyard and phone presentation.',
        caption: 'The same symbol across object and screen mockups.',
      },
      {
        key: 'by-tech-identity',
        alt: 'By Tech Group blue-to-green monogram on black, with monochrome logo treatments and icon mockups.',
        caption: 'Color, monochrome and icon treatments of the mark.',
      },
    ],
  },
};

/**
 * Resolve only assets already registered by this approved project collection.
 * No direct asset import can accidentally publish an image after withdrawal.
 * Missing curation assets fail open to the existing case-study presentation.
 */
export function getCasePresentation(
  project: CollectionEntry<'projects'>,
): CasePresentation | undefined {
  const { data } = project;
  if (!canPublish(data) || !Object.hasOwn(plans, data.slug)) return undefined;
  const plan = plans[data.slug as keyof typeof plans];
  const available = [data.cover, ...data.gallery.map((image) => image.src)];
  const used = new Set<string>();
  const images: CaseImage[] = [];
  for (const frame of plan.frames) {
    const src = available.find((image) => image.src.includes(`/${frame.key}.`));
    if (!src || used.has(src.src)) return undefined;
    used.add(src.src);
    images.push({ ...frame, src });
  }
  const [lead, ...gallery] = images;
  if (!lead || !gallery.length) return undefined;
  return {
    heroLine: plan.heroLine,
    intro: plan.intro,
    visualHeading: plan.visualHeading,
    visualCopy: plan.visualCopy,
    conclusion: plan.conclusion,
    tone: plan.tone,
    mosaic: plan.mosaic,
    lead,
    gallery,
    service: { label: 'Explore Brand Identity & Design', href: '/services/brand-identity' },
  };
}
