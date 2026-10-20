export const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// Original DrawnOut draft copy; design approval does not establish service proof.
export const capabilities = [
  {
    id: 'brand-identity',
    title: 'Brand Identity & Design',
    proposition: 'Make your brand look like it knows who it is.',
  },
  {
    id: 'digital-design',
    title: 'Digital Design',
    proposition: 'Your brand should feel like itself everywhere.',
  },
  {
    id: 'marketing-campaigns',
    title: 'Marketing & Campaigns',
    proposition: 'Make every impression mean something.',
  },
  {
    id: 'words-storytelling',
    title: 'Words & Storytelling',
    proposition: 'Because what you say matters as much as how it looks.',
  },
  {
    id: 'creative-direction',
    title: 'Creative Direction',
    proposition: 'A bigger idea needs a bigger picture.',
  },
] as const;

export const site = {
  name: 'DrawnOut Digital',
  description:
    'An independent creative and digital studio. Design. Strategy. Storytelling. Digital.',
  heroDescription:
    'We turn raw ideas into distinctive brands, meaningful experiences, and creative work with something to say.',
  signoff: 'Think it through. Draw it out. Make it matter.',
} as const;
