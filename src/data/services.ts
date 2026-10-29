import { serviceIndex, type ServiceSlug } from './service-index.ts';

/** Supplied editorial draft, 28 October 2026. Scope approval is still required.
 * Source: docs/next-milestone/SERVICE_PAGE_COPY_DRAFT.md.
 * Do not infer project delivery, attribution, results or paid-media capability.
 */
export interface ServicePage {
  slug: ServiceSlug;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  headline: string;
  opening: string;
  sections: readonly { heading: string; body: string }[];
  cta: { lead: string; label: string };
  faqs: readonly { question: string; answer: string }[];
  editorialStatus: 'draft' | 'approved';
}

const serviceContent = [
  {
    slug: 'brand-identity',
    seoTitle: 'Brand Identity & Design | DrawnOut Digital',
    description:
      'Build a distinctive visual identity with thoughtful logos, typography, colour and brand applications. Explore brand identity and design with DrawnOut Digital.',
    eyebrow: 'Services / Brand Identity & Design',
    opening:
      'A memorable identity does more than put a logo on something. It gives an idea a recognizable shape and a business a consistent way to show up. We bring the thinking and the visuals together so the result feels like one brand, wherever people encounter it.',
    sections: [
      {
        heading: 'A good identity starts before the artwork',
        body: "What's the idea at the centre? Who needs to notice it? What should they remember? Those questions help us establish a creative direction before exploring marks, colour, type and applications. The aim isn't to make everything louder. It's to find the details that make the brand unmistakably itself.",
      },
      {
        heading: 'More than a logo file',
        body: 'A logo may start the conversation, but the identity lives in how its pieces work together. We consider the core mark alongside typography, colour, supporting graphics, image treatment and examples of use. A flexible visual language gives everyday decisions a common point of reference, whether the next touchpoint is a business card, a social post or a storefront sign.',
      },
      {
        heading: 'Built to be used',
        body: "The best-looking brand system isn't useful if nobody knows how to apply it. Depending on the brief, the work can include primary and alternate marks, logo spacing and variations, colour specifications, type guidance, branded stationery, social templates, packaging or signage concepts, and a practical identity guide. The agreed deliverables should fit how the brand actually operates.",
      },
      {
        heading: 'When this service makes sense',
        body: "You're launching something new, your current visual identity no longer reflects the business, or your growing collection of designs no longer feels connected. Sometimes that means a complete identity. Sometimes it means tightening the system around a good idea already in place.",
      },
    ],
    cta: {
      lead: 'A good identity starts with a better question.',
      label: "Tell us what you're thinking.",
    },
    faqs: [
      {
        question: 'Do I need a full rebrand or just a logo refresh?',
        answer:
          'Not every brand needs to start again. We can look at what already works, where the identity feels inconsistent and which touchpoints need attention before recommending the right level of work.',
      },
      {
        question: 'What is usually included in a brand identity project?',
        answer:
          'A typical scope can cover creative exploration, core logo variations, typography, colour, supporting graphic elements and sample applications. Detailed brand guidelines and production artwork can be included when agreed in the brief.',
      },
      {
        question: 'Will I receive files I can use across print and digital?',
        answer:
          'The intended formats and applications should be defined at the start so the final handover matches your needs. Editable source files, production files and ownership or usage terms must be listed in the agreed deliverables.',
      },
      {
        question: 'Can you work with an identity we already have?',
        answer:
          'Yes, a project can focus on refining or extending an existing visual language rather than replacing it. The starting point is a review of your current assets and where they need to work better.',
      },
      {
        question: 'How long does brand identity design take?',
        answer:
          'Timing depends on the number of concepts, applications, feedback rounds and decision-makers. We outline milestones and review points once the scope is clear, rather than promise a one-size-fits-all schedule.',
      },
    ],
    editorialStatus: 'draft',
  },
  {
    slug: 'digital-design',
    seoTitle: 'Digital Design & UI/UX Design | DrawnOut Digital',
    description:
      'Thoughtful digital design for websites, interfaces and brand experiences. DrawnOut Digital connects visual identity, user needs and practical interaction design.',
    eyebrow: 'Services / Digital Design',
    opening:
      'A website or digital product is often where someone meets your brand for the first time. It needs to make sense as well as make an impression. We connect clear structure, purposeful interaction and the character of your identity to make digital experiences feel considered from first glance to final click.',
    sections: [
      {
        heading: 'Start with the person using it',
        body: 'Before designing screens, we consider what visitors are trying to find, what they need to understand and what action should come next. Useful navigation, thoughtful page hierarchy and sensible content patterns create room for a distinctive design without asking people to work harder than they should.',
      },
      {
        heading: 'A visual identity that moves naturally into digital',
        body: 'Good digital design is not simply a brand board pasted onto a browser. It needs responsive typography, consistent components, appropriate contrast, useful states and a rhythm that holds together across screens. Motion can help explain a transition or direct attention, but content and controls must still work when animation is reduced or unavailable.',
      },
      {
        heading: 'From initial ideas to usable design files',
        body: "Depending on the project, we can shape sitemaps, user journeys, wireframes, visual concepts, responsive page layouts, component libraries and handoff notes. If development is required, we scope the build separately and establish whether it is delivered directly, in collaboration or by the client's technical team. A design mockup is not presented as a live production website.",
      },
      {
        heading: 'When this service makes sense',
        body: 'You need a new website direction, a more coherent interface, a digital expression of an updated brand, or a clearer experience for customers who currently get lost. We help make the next iteration intentional rather than simply different.',
      },
    ],
    cta: {
      lead: 'Have a digital experience in mind?',
      label: "Let's give it a clear direction.",
    },
    faqs: [
      {
        question: 'Do you design websites as well as other digital interfaces?',
        answer:
          'Digital design can include responsive website pages, landing pages, product interfaces and digital brand touchpoints. The specific deliverables depend on the brief.',
      },
      {
        question: 'Is development included?',
        answer:
          'Not automatically. We first clarify whether you need strategy and design, a developer-ready handoff, or an end-to-end build with an agreed technical delivery partner or team.',
      },
      {
        question: 'Can you redesign an existing website without changing the entire brand?',
        answer:
          'Yes. A focused redesign can improve structure, usability and visual consistency while retaining recognizable brand elements.',
      },
      {
        question: 'Will the design work on mobile?',
        answer:
          'Responsive behavior should be considered from the start. We define layouts, typography, navigation and key interaction states for the agreed screen sizes rather than treating mobile as a scaled-down desktop.',
      },
      {
        question: 'How do you approach accessibility?',
        answer:
          'Clear hierarchy, legible typography, contrast, keyboard access and reduced-motion behavior belong in the design conversation. Formal compliance testing and remediation should be scoped and verified for the actual implementation.',
      },
    ],
    editorialStatus: 'draft',
  },
  {
    slug: 'marketing-campaigns',
    seoTitle: 'Marketing Campaigns & Creative Design | DrawnOut Digital',
    description:
      'Campaign concepts, social creative and connected marketing design that give your message a clear direction. Explore creative campaigns with DrawnOut Digital.',
    eyebrow: 'Services / Marketing & Campaigns',
    opening:
      'Attention is easy to ask for. Earning it takes a better idea. We approach campaigns as connected stories, where the message, look and format work together, whether someone sees the first frame of a social post or the final piece of a larger launch.',
    sections: [
      {
        heading: 'Find the idea worth repeating',
        body: 'An effective campaign needs more than a collection of good-looking graphics. What are we asking people to notice? What is the one thought worth carrying across channels? We start with the audience, the message and the context, then develop a creative territory that gives each piece a role.',
      },
      {
        heading: 'One idea, many touchpoints',
        body: 'A campaign often needs to travel from a headline to a visual, from a product image to an announcement, and from a single post to a family of assets. A connected system keeps the idea recognizable while allowing each placement to feel native to its channel.',
      },
      {
        heading: 'Designed for the moment and the medium',
        body: 'Work may include campaign concepts, art direction, key visuals, social post systems, carousel design, launch assets, digital banners, promotional layouts and supporting copy concepts. Channel strategy, publishing, paid media buying, performance optimization and reporting are separate scopes unless specifically agreed and verified. Creative presentation boards do not, by themselves, prove that a campaign launched or achieved particular results.',
      },
      {
        heading: 'When this service makes sense',
        body: "You're introducing a new product, building anticipation for an event, refreshing a recurring content series or trying to make fragmented marketing feel like one purposeful idea. We can help organize the creative direction before the assets multiply.",
      },
    ],
    cta: {
      lead: 'Something worth announcing?',
      label: "Let's make it memorable.",
    },
    faqs: [
      {
        question: 'Do you create campaigns for social media?',
        answer:
          'Social-first creative can include key concepts, graphic systems, carousels and adaptable designs. We define platforms, formats and deliverables for each campaign.',
      },
      {
        question: 'Do you manage paid advertising?',
        answer:
          'Paid media management, budget allocation and performance optimization must be explicitly confirmed as part of the project scope. Creative production alone does not imply media buying.',
      },
      {
        question: 'Can one campaign work across several channels?',
        answer:
          'Yes. A central idea can be adapted to social, digital display, printed material and other agreed placements while respecting the needs of each format.',
      },
      {
        question: 'Can you work from an existing brand identity?',
        answer:
          'Yes. Campaign creative should reinforce the brand rather than introduce a competing visual language unless there is a clear strategic reason.',
      },
      {
        question: 'What do you need to begin a campaign?',
        answer:
          'A useful starting point is the objective, audience, message, key dates, channels, available assets and decision-makers. If some of those are unresolved, they become the first questions we work through.',
      },
    ],
    editorialStatus: 'draft',
  },
  {
    slug: 'words-storytelling',
    seoTitle: 'Brand Copywriting & Storytelling | DrawnOut Digital',
    description:
      'Shape a clearer brand voice, website story and campaign message. DrawnOut Digital brings words and visual thinking together for connected brand communication.',
    eyebrow: 'Services / Words & Storytelling',
    opening:
      "People may notice the design first, but words help them understand what they're seeing. The right message makes a brand easier to recognize, easier to remember and easier to talk about. We bring clarity, character and intention to the language that carries an idea forward.",
    sections: [
      {
        heading: 'Say what you mean',
        body: "A strong brand voice isn't a collection of clever phrases. It is a way of speaking that fits the brand and makes sense to the people listening. We look for the essential idea, the language that expresses it and the tone that remains consistent across different situations.",
      },
      {
        heading: 'Give the story a shape',
        body: 'A visitor landing on your website, a customer reading a product description and someone encountering a campaign each need different information. Good storytelling respects that context. We organize messages, headlines and supporting details so the important thought arrives at the right time.',
      },
      {
        heading: 'Words that work with the design',
        body: 'Depending on the brief, the work can include messaging direction, tone-of-voice principles, homepage and service copy, headlines, campaign lines, product or packaging copy, social captions and editorial refinement. Naming, long-form content, technical writing or regulated claims require an agreed scope and appropriate factual review.',
      },
      {
        heading: 'When this service makes sense',
        body: "Your brand has a strong visual presence but an unclear explanation; your website copy sounds unlike the business; or different teams have started speaking in different voices. Sometimes the solution is a new story. Sometimes it's editing what's already there until the message becomes obvious.",
      },
    ],
    cta: {
      lead: "Have a message that isn't quite landing?",
      label: 'Tell us the idea behind it.',
    },
    faqs: [
      {
        question: "What's the difference between brand voice and copywriting?",
        answer:
          'Brand voice describes how the brand speaks consistently. Copywriting applies that voice to specific situations, such as a website page, campaign headline or product description.',
      },
      {
        question: 'Can you refine copy we already have?',
        answer:
          'Yes. An editorial pass can improve clarity, tone, hierarchy and consistency while preserving verified facts and the original meaning.',
      },
      {
        question: 'Do you write website content?',
        answer:
          'Website copy can be scoped from page-level messaging and headlines through to complete content drafts. Research, legal or technical verification should be agreed separately where needed.',
      },
      {
        question: 'Will you match our existing tone of voice?',
        answer:
          'We can work within established voice guidelines or help articulate a clearer direction first. Either way, the goal is language that sounds recognizably like the brand.',
      },
      {
        question: 'How do you make sure the writing is accurate?',
        answer:
          "Business facts, claims, product details and regulated statements should be supplied or reviewed by the client. We don't invent results, customer promises or evidence to make copy sound stronger.",
      },
    ],
    editorialStatus: 'draft',
  },
  {
    slug: 'creative-direction',
    seoTitle: 'Creative Direction & Art Direction | DrawnOut Digital',
    description:
      'Bring clearer thinking and visual consistency to your brand, campaign or digital project. Explore creative direction with DrawnOut Digital.',
    eyebrow: 'Services / Creative Direction',
    opening:
      'Strong creative work depends on how the pieces fit, not just how each piece looks. Creative direction helps connect the brief, the message, the visual language and the decisions made along the way. It gives an idea a point of view and keeps that point of view intact as the work grows.',
    sections: [
      {
        heading: 'Find the through-line',
        body: 'Projects often involve many formats, contributors and decisions. We begin by understanding the purpose, the people involved and what the final experience should communicate. From there, we can establish a creative territory, visual references and a set of principles that make decisions easier to explain and easier to keep consistent.',
      },
      {
        heading: 'Keep the pieces in conversation',
        body: 'An identity, a campaign and a website should feel related, even when they serve different needs. Creative direction looks at the whole experience: tone, imagery, typography, composition, rhythm, and the moments where one touchpoint hands off to another.',
      },
      {
        heading: 'A clear direction people can work with',
        body: "Scope might include concept development, visual research, moodboards, art-direction exploration, campaign or launch systems, creative review, design feedback and coordination with a client's existing team. Production ownership, third-party management, photography, video, development and final approvals must be defined rather than assumed.",
      },
      {
        heading: 'When this service makes sense',
        body: 'You have a strong concept but many moving parts, several teams producing creative assets, a launch that needs one coherent visual language, or a brand growing faster than its design decisions. Creative direction can help protect the bigger idea without slowing every detail down.',
      },
    ],
    cta: {
      lead: 'A lot of pieces to bring together?',
      label: "Let's find the through-line.",
    },
    faqs: [
      {
        question: 'What does a creative director do on a project?',
        answer:
          'The role provides a consistent creative viewpoint, helps shape concepts, reviews the visual language and aligns decisions across the agreed scope. The responsibilities and approval authority should be established at the outset.',
      },
      {
        question: 'Is creative direction the same as graphic design?',
        answer:
          'Graphic design produces specific visual outputs. Creative direction connects and guides the wider visual and communication decisions. Many projects need both, but they are not identical services.',
      },
      {
        question: 'Can you work with our in-house designer or marketing team?',
        answer:
          'Creative direction can be scoped to support an existing team, with agreed responsibilities, reviews and deliverables rather than replacing their work.',
      },
      {
        question: 'Can you direct a campaign without producing every asset?',
        answer:
          'Yes, when the brief clearly separates concept and art direction from production. We would define the creative outputs and the handoff process.',
      },
      {
        question: 'When should creative direction begin?',
        answer:
          'Ideally before the visual system fragments. Bringing it in early helps establish the concept, but focused direction can also help bring consistency to work already underway.',
      },
    ],
    editorialStatus: 'draft',
  },
] as const satisfies readonly Omit<ServicePage, 'title' | 'headline'>[];

export const servicePages: readonly ServicePage[] = serviceContent.map((entry) => ({
  ...entry,
  ...serviceIndex[entry.slug],
}));

export const servicePath = (slug: string) => `/services/${slug}`;
