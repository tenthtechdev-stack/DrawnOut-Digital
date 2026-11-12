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

export type CaseTone =
  | 'sol'
  | 'bunzo'
  | 'triarch'
  | 'capture'
  | 'by-tech'
  | 'churros'
  | 'khalo'
  | 'fk-technology'
  | 'feed-n-seed'
  | 'abacus-immigration'
  | 'u-wanna-smoothie';

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

/** Historical first review group; its approved curation stays unchanged. */
export const casePilotSlugs = [
  'sol-community-center',
  'bunzo',
  'triarch',
  'capture',
  'by-tech-group',
] as const;

/** The owner approved the pilots before authorizing the remaining six cases. */
export const casePresentationSlugs = [
  ...casePilotSlugs,
  'churros',
  'khalo',
  'fk-technology',
  'feed-n-seed',
  'abacus-immigration',
  'u-wanna-smoothie',
] as const;

/*
 * Visual-only review copy adapted from the owner's editorial package. No SEO,
 * client, service-delivery, date, credit, result or factual verification fields
 * enter this adapter. The canonical project records remain unchanged.
 */
const plans: Record<(typeof casePresentationSlugs)[number], PresentationPlan> = {
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
  churros: {
    heroLine: 'A dessert identity full of warmth and character.',
    intro:
      'Illustrated churros, ornamental lettering and warm red, cream and golden tones shape the Churros Dessert Shop presentation. Its signature badge and decorative motifs connect retail and packaging visuals.',
    visualHeading: 'An illustration-led brand world.',
    visualCopy:
      'Takeaway bags, cups, signs and posters carry the same illustrated language. Stripes, floral forms and a sun-like motif add a different rhythm to the identity board.',
    conclusion: 'An illustrated badge. A warm, decorative world.',
    tone: 'churros',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'churros-applications',
        alt: 'Churros Dessert Shop collage featuring takeaway packaging, retail posters, signage, apparel and illustrated brand graphics.',
        caption: 'Packaging, retail and object mockups in one presentation.',
      },
      {
        key: 'churros-identity',
        alt: 'Churros Dessert Shop ornate illustrated badge beside churros in a cup against cream and red graphics.',
        caption: 'The illustrated badge and warm red-and-cream palette.',
      },
      {
        key: 'churros-patterns',
        alt: 'Churros Dessert Shop badge variations, striped patterns, decorative motifs and warm color references.',
        caption: 'Motifs, stripes and alternate badge treatments.',
      },
    ],
  },
  khalo: {
    heroLine: 'An appetite for personality.',
    intro:
      'Khalo’s bold orange lettering is accompanied by a friendly illustrated character and food-themed patterns. Cream backgrounds give the orange marks room to stand out across the takeaway packaging.',
    visualHeading: 'Character carried through every format.',
    visualCopy:
      'A paper bag, drink cup and fries container share the illustrated mark. Signage, apparel, wrapping paper and a phone mockup bring the same graphic personality to different surfaces.',
    conclusion: 'Expressive lettering. A character-filled takeaway world.',
    tone: 'khalo',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'khalo-packaging',
        alt: 'Khalo orange-and-cream takeaway packaging with an illustrated paper bag, drink cup and fries container below burger imagery.',
        caption: 'The orange mark across takeaway packaging mockups.',
      },
      {
        key: 'khalo-identity',
        alt: 'Khalo orange illustrated wordmark and a cartoon character eating a burger against patterned cream artwork.',
        caption: 'The illustrated wordmark, character and food doodles.',
      },
      {
        key: 'khalo-applications',
        alt: 'Khalo application board showing signage, apparel, wrapping paper and a phone mockup in orange and cream.',
        caption: 'One graphic language across object and screen mockups.',
      },
    ],
  },
  'fk-technology': {
    heroLine: 'One vivid mark against a dark canvas.',
    intro:
      'FK Technology’s presentation is anchored by an orange monogram on charcoal and black surfaces. White lettering and a limited palette give the mark prominence across stationery, packaging and device mockups.',
    visualHeading: 'A strong mark, multiple surfaces.',
    visualCopy:
      'The orange symbol appears on a textured business card, a box and dark fabric. Phone and laptop screen concepts carry that same focal point into another part of the presentation.',
    conclusion: 'Dark surfaces. A vivid orange focal point.',
    tone: 'fk-technology',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'fk-applications',
        alt: 'FK Technology orange logo on dark phone and laptop screen mockups, a black card, packaging box and fabric.',
        caption: 'The monogram across object and screen mockups.',
      },
      {
        key: 'fk-identity',
        alt: 'FK Technology orange monogram with white lettering and orange, black, gray and white palette swatches.',
        caption: 'The mark, lettering and core palette.',
      },
      {
        key: 'fk-card-detail',
        alt: 'Orange FK Technology monogram on a black textured business-card mockup.',
        caption: 'A closer crop of the card from the applications board.',
      },
    ],
  },
  'feed-n-seed': {
    heroLine: 'A visual identity rooted in nature.',
    intro:
      'Crop imagery surrounds Feed N Seed’s circular green-and-orange emblem. The same curved symbol connects product-container and stationery mockups, with golden wheat imagery extending the agricultural theme.',
    visualHeading: 'From the seal to the surface.',
    visualCopy:
      'The stationery board brings together letterhead, cards and five color treatments of the circular mark. Container lids, labels and a small card show the emblem at different scales against white and golden backgrounds.',
    conclusion: 'Crop-inspired forms. Green, orange and gold.',
    tone: 'feed-n-seed',
    mosaic: 'mosaic-2',
    frames: [
      {
        key: 'feed-n-seed-product',
        alt: 'Feed N Seed circular green-and-orange mark on white product-container lids and labels with a golden wheat-field backdrop.',
        caption: 'The crop-inspired emblem in a container presentation.',
      },
      {
        key: 'feed-n-seed-stationery',
        alt: 'Feed N Seed letterhead and card mockups above five green, orange and white treatments of the circular emblem.',
        caption: 'Printed-material mockups and alternate color treatments.',
      },
    ],
  },
  'abacus-immigration': {
    heroLine: 'A travel-inspired identity in blue and white.',
    intro:
      'Abacus Immigration’s visual presentation pairs a blue-and-white palette with a plane-inspired symbol. Luggage, signage and printed-object mockups repeat that travel-focused motif.',
    visualHeading: 'A shared direction across the artwork.',
    visualCopy:
      'Blue fields, serif headlines and small line icons organize the social layouts. The same mark appears across a luggage tag, aircraft-tail mockup, passport cover, cup and tote, with changes in scale and material.',
    conclusion: 'A travel motif, held together by blue and white.',
    tone: 'abacus-immigration',
    mosaic: 'mosaic-2',
    frames: [
      {
        key: 'abacus-applications',
        alt: 'Abacus Immigration blue-and-white collage with luggage tag, aircraft tail, sign, passport cover, cup and tote-bag mockups.',
        caption: 'The plane-inspired symbol across travel and object mockups.',
      },
      {
        key: 'abacus-social-layouts',
        alt: 'Abacus Immigration blue-and-white social artwork with serif headings, travel icons and a social-post mockup.',
        caption: 'Typographic social layouts in the same palette.',
      },
    ],
  },
  'u-wanna-smoothie': {
    heroLine: 'Bright color, playful shapes and a fruity twist.',
    intro:
      'U Wanna Smoothie’s identity presentation combines fruit-inspired shapes, bright pink and lime green with a circular cup-and-fruit symbol. The same lively palette extends into drink imagery and folded-menu layouts.',
    visualHeading: 'A bright system with room to play.',
    visualCopy:
      'The color board pairs citrus, leaf and cup shapes with a berry-drink image and soft flowing fields. Pink-and-green menu concepts give those graphic elements a different scale and arrangement.',
    conclusion: 'Fruit-inspired shapes. Color with presence.',
    tone: 'u-wanna-smoothie',
    mosaic: 'mosaic-3',
    frames: [
      {
        key: 'smoothie-identity',
        alt: 'U Wanna Smoothie pink-and-green presentation with a circular fruit-and-cup symbol beside a hand holding a green drink in a clear cup.',
        caption: 'The fruit-and-cup symbol alongside a drink presentation.',
      },
      {
        key: 'smoothie-color',
        alt: 'U Wanna Smoothie color swatches, citrus and leaf graphics, pink fields and a purple berry-drink image.',
        caption: 'Color, fruit forms and graphic details.',
      },
      {
        key: 'smoothie-menu',
        alt: 'U Wanna Smoothie folded-menu concepts in pink and green surrounded by kiwi and berry imagery.',
        caption: 'The same graphic vocabulary in folded-menu concepts.',
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
