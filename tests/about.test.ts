import assert from 'node:assert/strict';
import test from 'node:test';
import { aboutPage } from '../src/data/about';

test('the About redesign preserves the approved exact founder story and supplied impact statement', () => {
  assert.equal(aboutPage.hero.heading, 'Two twins. One idea. A whole lot of creativity.');
  assert.equal(aboutPage.hero.headlineSegments.join(' '), aboutPage.hero.heading);
  assert.deepEqual(aboutPage.hero.paragraphs, [
    "DrawnOut Digital began on a random night, with a conversation between two twin sisters and an idea we couldn't leave alone.",
    'That idea became our university thesis. And somewhere between exploring what it could be and imagining what came next, it grew into something bigger: a shared dream of building a creative agency of our own.',
    'Today, we bring that same curiosity to the brands we help shape. We believe the best ideas deserve more than a good-looking finish. They deserve thought, character and a reason to be remembered.',
  ]);
  assert.equal(aboutPage.hero.supportingLabel, 'Creating impact since 2022.');
});

test('founder names, roles and supplied experience remain distinct from portrait positions', () => {
  assert.deepEqual(
    aboutPage.founders.profiles.map(({ name, role, experience }) => ({ name, role, experience })),
    [
      { name: 'Mariah', role: 'Creative Director', experience: '7+ years in design' },
      {
        name: 'Mariam',
        role: 'Branding Lead',
        experience: '4+ years in digital marketing and branding',
      },
    ],
  );
  for (const founder of aboutPage.founders.profiles) {
    assert.ok(founder.description.startsWith(`${founder.name} brings`));
    assert.equal('portraitPosition' in founder, false);
  }
});

test('approved philosophy, process meaning and new invitation remain truthful and consistent', () => {
  assert.deepEqual(
    aboutPage.philosophy.principles.map(({ heading, description }) => ({ heading, description })),
    [
      {
        heading: 'Ideas before decoration.',
        description: "Start with what matters, not just what's trending.",
      },
      {
        heading: 'Character over sameness.',
        description: 'Find the details that make a brand feel like itself.',
      },
      {
        heading: 'One story, many touchpoints.',
        description: 'Let design, words and digital experiences feel connected.',
      },
      {
        heading: 'Room for curiosity.',
        description:
          'Ask another question. Explore another possibility. Keep looking until the idea feels right.',
      },
    ],
  );
  assert.equal(aboutPage.invitation.heading, "Have something in mind? Let's make it matter.");
  assert.equal(
    aboutPage.invitation.supportingCopy,
    'Every meaningful brand starts somewhere. Tell us where yours begins.',
  );
  assert.deepEqual(
    aboutPage.approach.phases.map(({ concept }) => concept),
    ['Thought', 'Direction', 'Form', 'Connection'],
  );
  assert.deepEqual(aboutPage.invitation.cta, {
    label: "Tell us what you're thinking",
    href: '/contact',
  });
});
