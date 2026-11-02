import assert from 'node:assert/strict';
import test from 'node:test';
import { aboutPage } from '../src/data/about';

test('the About story preserves all seven supplied editorial chapters', () => {
  const chapters = [
    aboutPage.hero,
    aboutPage.origin,
    aboutPage.founders,
    aboutPage.philosophy,
    aboutPage.approach,
    aboutPage.audience,
    aboutPage.invitation,
  ];
  assert.equal(chapters.length, 7);
  assert.equal(new Set(chapters.map(({ heading }) => heading)).size, 7);
  assert.equal(aboutPage.hero.headlineSegments.join(' '), aboutPage.hero.heading);
  assert.deepEqual(aboutPage.origin.markers, [
    'ONE NIGHT',
    'A UNIVERSITY THESIS',
    'A CREATIVE STUDIO',
  ]);
  assert.match(aboutPage.hero.paragraphs.join(' '), /two twin sisters/);
  assert.match(aboutPage.hero.paragraphs.join(' '), /our university thesis/);
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

test('proposed philosophy and approach retain their owner review boundary and clear invitation', () => {
  assert.equal(aboutPage.philosophy.editorialApproval, 'owner-review-required');
  assert.equal(aboutPage.approach.editorialApproval, 'owner-review-required');
  assert.equal(aboutPage.philosophy.principles.length, 4);
  assert.deepEqual(
    aboutPage.approach.phases.map(({ concept }) => concept),
    ['Thought', 'Direction', 'Form', 'Connection'],
  );
  assert.deepEqual(aboutPage.invitation.cta, {
    label: "Tell us what you're thinking",
    href: '/contact',
  });
});
