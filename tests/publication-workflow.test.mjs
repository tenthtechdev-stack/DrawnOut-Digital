import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

async function outputFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? outputFiles(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat();
}

test('a record alone creates an approved case, gates unverified facts, and removes revoked work', async () => {
  // A disposable copy exercises actual Astro routing/assets without changing real approvals.
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'drawnout-publication-'));
  try {
    for (const item of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
      await cp(path.join(root, item), path.join(temporary, item), { recursive: true });
    }
    await symlink(
      path.join(root, 'node_modules'),
      path.join(temporary, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    const content = path.join(temporary, 'src/content/projects');
    const realRecords = await Promise.all(
      (await readdir(content))
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => JSON.parse(await readFile(path.join(content, name), 'utf8'))),
    );
    const cover = realRecords.find((record) => record.slug === 'bunzo');
    assert.ok(cover, 'The fixture reuses a supplied local poster, never stock or generated art.');
    const fixture = {
      title: 'Publication workflow fixture',
      slug: 'publication-workflow-fixture',
      summary: 'Synthetic record for isolated automated validation only.',
      overview: 'A test-only content record proving reusable page generation.',
      status: 'published',
      visibility: 'public',
      projectType: 'concept',
      publicationApproved: true,
      creditApproved: true,
      contentVerified: false,
      categories: ['packaging'],
      workOrder: 1,
      presentation: 'wide',
      cover: cover.cover,
      coverAlt: 'Supplied packaging artwork reused only in an isolated automated fixture.',
      assetSource: 'Automated fixture only; no real portfolio publication approval.',
      gallery: cover.gallery.slice(0, 1).map((media) => ({
        ...media,
        alt: 'Supplied packaging detail used only by the isolated test fixture.',
        caption: 'Automated fixture media.',
      })),
      challenge: 'SYNTHETIC_CHALLENGE_VERIFICATION',
      concept: 'SYNTHETIC_CONCEPT_VERIFICATION',
      approach: 'SYNTHETIC_APPROACH_VERIFICATION',
      role: 'SYNTHETIC_ROLE_VERIFICATION',
      services: ['SYNTHETIC_SERVICE_VERIFICATION'],
      deliverables: ['SYNTHETIC_DELIVERABLE_VERIFICATION'],
      credits: ['SYNTHETIC_CREDIT_VERIFICATION'],
      results: [
        {
          label: 'SYNTHETIC_RESULT_VERIFICATION',
          value: 'Test fixture value',
          evidenceSource: 'Synthetic evidence used only by this isolated test.',
        },
      ],
    };
    const recordFile = path.join(content, `${fixture.slug}.json`);
    const build = () =>
      execFileSync(
        process.execPath,
        [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', temporary],
        {
          cwd: temporary,
          env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
          stdio: 'pipe',
          timeout: 120_000,
        },
      );
    await writeFile(recordFile, JSON.stringify(fixture, null, 2));
    const firstBuildLog = build().toString();
    const caseFile = path.join(temporary, 'dist/work', fixture.slug, 'index.html');
    let html = await readFile(caseFile, 'utf8').catch((error) => {
      throw new Error(`Approved fixture route was not generated.\n${firstBuildLog}`, {
        cause: error,
      });
    });
    assert.match(html, /Publication workflow fixture/);
    assert.match(html, /data-case-gallery/);
    assert.doesNotMatch(html, /SYNTHETIC_[A-Z_]+_VERIFICATION/);
    const work = await readFile(path.join(temporary, 'dist/work/index.html'), 'utf8');
    assert.match(work, /href="\/work\/publication-workflow-fixture"/);
    assert.match(work, /Packaging/);
    for (const record of realRecords) {
      assert.ok(!work.includes(record.title), `${record.slug} must remain private.`);
      assert.ok(
        !html.includes(record.title),
        `${record.slug} cannot leak through case navigation.`,
      );
    }
    let files = await outputFiles(path.join(temporary, 'dist'));
    assert.equal(files.filter((name) => name.endsWith('.html')).length, 7);
    assert.ok(
      files.some((name) => name.endsWith('.webp')),
      'Approved poster must be emitted.',
    );
    assert.ok(files.every((name) => !name.includes('_preview')));

    fixture.contentVerified = true;
    await writeFile(recordFile, JSON.stringify(fixture, null, 2));
    build();
    html = await readFile(caseFile, 'utf8');
    for (const marker of [
      'CHALLENGE',
      'CONCEPT',
      'APPROACH',
      'ROLE',
      'SERVICE',
      'DELIVERABLE',
      'CREDIT',
      'RESULT',
    ]) {
      assert.ok(
        html.includes(`SYNTHETIC_${marker}_VERIFICATION`),
        `${marker} must render when verified.`,
      );
    }

    fixture.status = 'draft';
    await writeFile(recordFile, JSON.stringify(fixture, null, 2));
    build();
    files = await outputFiles(path.join(temporary, 'dist'));
    assert.equal(files.filter((name) => name.endsWith('.html')).length, 6);
    assert.deepEqual(
      files.filter((name) => name.includes(fixture.slug) || name.endsWith('.webp')),
      [],
      'Revoking approval must remove the case route and all fixture artwork from output.',
    );
    const cleanWork = await readFile(path.join(temporary, 'dist/work/index.html'), 'utf8');
    assert.ok(!cleanWork.includes(fixture.title));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
