/** Shared titles and original headlines; deliberately small for Contact service choices. */
export const serviceIndex = {
  'brand-identity': {
    title: 'Brand Identity & Design',
    headline: 'Make your brand look like it knows who it is.',
  },
  'digital-design': {
    title: 'Digital Design',
    headline: 'Your brand should feel like itself everywhere.',
  },
  'marketing-campaigns': {
    title: 'Marketing & Campaigns',
    headline: 'Make every impression mean something.',
  },
  'words-storytelling': {
    title: 'Words & Storytelling',
    headline: 'Because what you say matters as much as how it looks.',
  },
  'creative-direction': {
    title: 'Creative Direction',
    headline: 'A bigger idea needs a bigger picture.',
  },
} as const;

export type ServiceSlug = keyof typeof serviceIndex;
