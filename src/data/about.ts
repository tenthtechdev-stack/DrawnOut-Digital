export interface AboutChapter {
  eyebrow: string;
  heading: string;
}

export interface FounderProfile {
  name: 'Mariah' | 'Mariam';
  role: string;
  experience: string;
  description: string;
}

export interface AboutPrinciple {
  number: string;
  heading: string;
  description: string;
}

export interface AboutPhase extends AboutPrinciple {
  concept: 'Thought' | 'Direction' | 'Form' | 'Connection';
}

export interface AboutPageContent {
  metadata: { title: string; description: string };
  concept: string;
  hero: AboutChapter & {
    headlineSegments: readonly string[];
    paragraphs: readonly string[];
    caption: string;
    supportingLabel: string;
  };
  origin: AboutChapter & { paragraphs: readonly string[]; markers: readonly string[] };
  founders: AboutChapter & { profiles: readonly FounderProfile[]; signoff: string };
  philosophy: AboutChapter & {
    intro: string;
    principles: readonly AboutPrinciple[];
    editorialApproval: 'owner-review-required';
  };
  approach: AboutChapter & {
    phases: readonly AboutPhase[];
    editorialApproval: 'owner-review-required';
  };
  audience: AboutChapter & { paragraphs: readonly string[] };
  invitation: AboutChapter & { supportingCopy: string; cta: { label: string; href: '/contact' } };
}

// The supplied About brief is the single source for these seven chapters.
// Philosophy and approach are proposed messaging for final owner approval.
// Profile order does not identify either person's position in the portrait.
export const aboutPage = {
  metadata: {
    title: 'About DrawnOut Digital | Two Twins, One Creative Studio',
    description:
      'Meet the twin sisters behind DrawnOut Digital. Discover how a university thesis grew into a creative studio shaped by design, branding and storytelling.',
  },
  concept: 'From one thought to something real.',
  hero: {
    eyebrow: 'ABOUT / THE STORY BEHIND DRAWNOUT',
    heading: 'Two twins. One idea. A whole lot of creativity.',
    headlineSegments: ['Two twins.', 'One idea.', 'A whole lot of creativity.'],
    paragraphs: [
      "DrawnOut Digital began on a random night, with a conversation between two twin sisters and an idea we couldn't leave alone.",
      'That idea became our university thesis. And somewhere between exploring what it could be and imagining what came next, it grew into something bigger: a shared dream of building a creative agency of our own.',
      'Today, we bring that same curiosity to the brands we help shape. We believe the best ideas deserve more than a good-looking finish. They deserve thought, character and a reason to be remembered.',
    ],
    caption: 'Two minds. One shared direction.',
    supportingLabel: 'Creating impact since 2022.',
  },
  origin: {
    eyebrow: '02 / HOW IT STARTED',
    heading: 'Some ideas stay with you.',
    paragraphs: [
      'Ours started as a thought between sisters. Then it became a thesis. Then it became the possibility of turning something we loved doing into something we could build together.',
      'DrawnOut is the result of that shared ambition. It brings our interests in design, branding and digital marketing into one creative space, where a clear idea can become a distinctive identity, a stronger message or a more meaningful experience.',
      'The story may have started with two of us, but the purpose is bigger than our own. We want to help other people give their ideas the same attention we gave ours.',
    ],
    markers: ['ONE NIGHT', 'A UNIVERSITY THESIS', 'A CREATIVE STUDIO'],
  },
  founders: {
    eyebrow: '03 / MEET THE TWINS',
    heading: 'Different strengths. A shared vision.',
    profiles: [
      {
        name: 'Mariah',
        role: 'Creative Director',
        experience: '7+ years in design',
        description:
          'Mariah brings the design perspective to DrawnOut, with an eye for how ideas take shape visually, from the first direction to the details that give a brand character.',
      },
      {
        name: 'Mariam',
        role: 'Branding Lead',
        experience: '4+ years in digital marketing and branding',
        description:
          'Mariam brings the branding and marketing perspective, connecting the way a business presents itself with the message it wants people to understand and remember.',
      },
    ],
    signoff: 'Two creative minds, working toward one idea: make the work mean something.',
  },
  philosophy: {
    eyebrow: '04 / WHAT WE BELIEVE',
    heading: 'Good design has something to say.',
    intro:
      "We love beautiful work. But beautiful isn't the whole point. We want the thinking behind it to be just as strong as the way it looks.",
    editorialApproval: 'owner-review-required',
    principles: [
      {
        number: '01',
        heading: 'Ideas before decoration.',
        description: "Start with what matters, not just what's trending.",
      },
      {
        number: '02',
        heading: 'Character over sameness.',
        description: 'Find the details that make a brand feel like itself.',
      },
      {
        number: '03',
        heading: 'One story, many touchpoints.',
        description: 'Let design, words and digital experiences feel connected.',
      },
      {
        number: '04',
        heading: 'Room for curiosity.',
        description:
          'Ask another question. Explore another possibility. Keep looking until the idea feels right.',
      },
    ],
  },
  approach: {
    eyebrow: '05 / HOW WE THINK',
    heading: 'From the first scribble to the final detail.',
    editorialApproval: 'owner-review-required',
    phases: [
      {
        number: '01',
        concept: 'Thought',
        heading: 'Listen.',
        description:
          'Every project starts with understanding the idea, the people behind it and what the work needs to achieve.',
      },
      {
        number: '02',
        concept: 'Direction',
        heading: 'Find the direction.',
        description:
          'We look for the thought that ties everything together, then build a creative direction around it.',
      },
      {
        number: '03',
        concept: 'Form',
        heading: 'Give it form.',
        description:
          'Through design, branding and storytelling, we shape the idea into something people can see, understand and connect with.',
      },
      {
        number: '04',
        concept: 'Connection',
        heading: 'Make it feel connected.',
        description:
          'The details matter. So does the bigger picture. We look for consistency across the places a brand appears.',
      },
    ],
  },
  audience: {
    eyebrow: '06 / THE KINDS OF IDEAS WE LOVE',
    heading: 'For the ideas worth drawing out.',
    paragraphs: [
      "For the idea still scribbled in a notebook. For the business ready to look and sound more like itself. For the brand that has something to say but hasn't found the right way to say it yet.",
      "You don't need to arrive with every answer. A good conversation is a place to begin.",
    ],
  },
  invitation: {
    eyebrow: '07 / YOUR TURN',
    heading: "Have an idea you can't stop thinking about?",
    supportingCopy: "We know that feeling. It's how DrawnOut began.",
    cta: { label: "Tell us what you're thinking", href: '/contact' },
  },
} as const satisfies AboutPageContent;
