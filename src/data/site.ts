import { serviceIndex } from './service-index';

export const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// One source for navigation, overview copy and Contact service choices.
export const capabilities = Object.entries(serviceIndex).map(([id, { title, headline }]) => ({
  id,
  title,
  proposition: headline,
}));

export const site = {
  name: 'DrawnOut Digital',
  description:
    'An independent creative and digital studio. Design. Strategy. Storytelling. Digital.',
  heroDescription:
    'We turn raw ideas into distinctive brands, meaningful experiences, and creative work with something to say.',
  signoff: 'Think it through. Draw it out. Make it matter.',
} as const;
