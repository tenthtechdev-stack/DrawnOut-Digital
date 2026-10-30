import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { canPublish } from '../src/lib/project-schema.ts';
import { serviceIndex } from '../src/data/service-index.ts';
import sharp from 'sharp';

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

test('visual approval publishes a record without verifying facts or credits; withdrawal removes its route and unique media', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'drawnout-publication-'));
  try {
    for (const item of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
      await cp(path.join(root, item), path.join(temporary, item), { recursive: true });
    }
    await symlink(path.join(root, 'node_modules'), path.join(temporary, 'node_modules'), 'dir');
    const content = path.join(temporary, 'src/content/projects');
    const realRecords = await Promise.all(
      (await readdir(content))
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => JSON.parse(await readFile(path.join(content, name), 'utf8'))),
    );
    const publicRecords = realRecords.filter(canPublish);
    const cover = realRecords.find((record) => record.slug === 'bunzo');
    assert.ok(cover);
    // Unique synthetic pixels prevent the image optimizer deduplicating these
    // fixtures against already-public artwork, which would hide withdrawal bugs.
    for (const [stem, color] of [
      ['publication-fixture-only', '#7854aa'],
      ['future-draft-only', '#319a84'],
    ]) {
      await sharp({ create: { width: 43, height: 31, channels: 3, background: color } })
        .webp()
        .toFile(path.join(temporary, `src/assets/portfolio/${stem}.webp`));
    }
    const fixture = {
      title: 'Publication workflow fixture',
      slug: 'publication-workflow-fixture',
      summary: 'Synthetic record for isolated automated validation only.',
      overview: 'A test-only content record proving reusable page generation.',
      status: 'published',
      visibility: 'public',
      projectType: 'unknown',
      publicationApproved: true,
      displayApproval: {
        state: 'approved',
        source: 'Synthetic test permission; not real project approval.',
      },
      creditApproved: false,
      contentVerified: false,
      featured: true,
      featuredOrder: 0,
      categories: ['packaging'],
      workOrder: 0,
      presentation: 'wide',
      cover: '../../assets/portfolio/publication-fixture-only.webp',
      coverAlt: 'Supplied packaging artwork reused only in an isolated automated fixture.',
      assetSource: 'Automated fixture only; no real portfolio publication approval.',
      gallery: cover.gallery.slice(0, 1).map((media) => ({
        ...media,
        alt: 'Supplied packaging detail used only by the isolated test fixture.',
        caption: 'Automated fixture media.',
      })),
      clientName: 'SYNTHETIC_ORGANIZATION_VERIFICATION',
      challenge: 'SYNTHETIC_CHALLENGE_VERIFICATION',
      concept: 'SYNTHETIC_CONCEPT_VERIFICATION',
      approach: 'SYNTHETIC_APPROACH_VERIFICATION',
      role: 'SYNTHETIC_ROLE_VERIFICATION',
      services: ['SYNTHETIC_SERVICE_VERIFICATION'],
      deliverables: ['SYNTHETIC_DELIVERABLE_VERIFICATION'],
      credits: ['SYNTHETIC_CREDIT_VERIFICATION'],
      seoTitle: 'SYNTHETIC_METADATA_TITLE_VERIFICATION',
      seoDescription: 'SYNTHETIC_METADATA_DESCRIPTION_VERIFICATION',
      results: [
        {
          label: 'SYNTHETIC_RESULT_VERIFICATION',
          value: 'Test fixture value',
          evidenceSource: 'Synthetic evidence used only by this isolated test.',
        },
      ],
    };
    const futureDraft = {
      ...fixture,
      title: 'FUTURE_PRIVATE_ARTWORK_SENTINEL',
      slug: 'future-private-artwork-sentinel',
      displayApproval: { state: 'pending' },
      cover: '../../assets/portfolio/future-draft-only.webp',
      gallery: [],
    };
    await writeFile(path.join(content, `${futureDraft.slug}.json`), JSON.stringify(futureDraft));
    const recordFile = path.join(content, `${fixture.slug}.json`);
    const build = async () => {
      await writeFile(recordFile, JSON.stringify(fixture, null, 2));
      const log = execFileSync(
        process.execPath,
        [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', temporary],
        {
          cwd: temporary,
          env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
          stdio: 'pipe',
          timeout: 120_000,
        },
      ).toString();
      const files = await outputFiles(path.join(temporary, 'dist'));
      assert.ok(
        files.every(
          (name) =>
            !name.includes('_preview') &&
            !name.includes('future-draft-only') &&
            !name.includes(futureDraft.slug),
        ),
      );
      for (const file of files.filter((name) => /\.(html|json|js)$/.test(name))) {
        const text = await readFile(file, 'utf8');
        assert.ok(
          !text.includes(futureDraft.title) &&
            !text.includes(futureDraft.slug) &&
            !text.includes('future-draft-only'),
          `${file} leaked a future draft.`,
        );
      }
      return { files, log };
    };
    const caseFile = path.join(temporary, 'dist/work', fixture.slug, 'index.html');
    const first = await build();
    let html = await readFile(caseFile, 'utf8').catch((error) => {
      throw new Error(`Visual-only case missing.\n${first.log}`, { cause: error });
    });
    assert.match(html, /Publication workflow fixture/);
    assert.match(html, /data-case-gallery/);
    assert.doesNotMatch(html, /SYNTHETIC_[A-Z_]+_VERIFICATION/);
    assert.doesNotMatch(html, /Private draft|Pending studio review|Visual preview/);
    const work = await readFile(path.join(temporary, 'dist/work/index.html'), 'utf8');
    const home = await readFile(path.join(temporary, 'dist/index.html'), 'utf8');
    assert.match(work, /href="\/work\/publication-workflow-fixture"/);
    assert.match(home, /href="\/work\/publication-workflow-fixture"/);
    for (const record of publicRecords) assert.ok(work.includes(`/work/${record.slug}`));
    assert.equal(
      first.files.filter((name) => name.endsWith('.html')).length,
      7 + Object.keys(serviceIndex).length + publicRecords.length,
    );
    assert.ok(first.files.some((name) => /publication-fixture-only.*\.webp$/.test(name)));

    fixture.contentVerified = true;
    await build();
    html = await readFile(caseFile, 'utf8');
    for (const marker of ['CHALLENGE', 'CONCEPT', 'APPROACH', 'SERVICE', 'DELIVERABLE', 'RESULT']) {
      assert.ok(
        html.includes(`SYNTHETIC_${marker}_VERIFICATION`),
        `${marker} must render when verified.`,
      );
    }
    for (const marker of [
      'ROLE',
      'ORGANIZATION',
      'CREDIT',
      'METADATA_TITLE',
      'METADATA_DESCRIPTION',
    ]) {
      assert.ok(
        !html.includes(`SYNTHETIC_${marker}_VERIFICATION`),
        `${marker} needs separate attribution approval.`,
      );
    }

    fixture.creditApproved = true;
    await build();
    html = await readFile(caseFile, 'utf8');
    for (const marker of [
      'ROLE',
      'ORGANIZATION',
      'CREDIT',
      'METADATA_TITLE',
      'METADATA_DESCRIPTION',
    ])
      assert.ok(html.includes(`SYNTHETIC_${marker}_VERIFICATION`));

    // Withdraw display permission alone: status/public flags cannot override it.
    fixture.displayApproval.state = 'withdrawn';
    const revoked = await build();
    assert.equal(
      revoked.files.filter((name) => name.endsWith('.html')).length,
      6 + Object.keys(serviceIndex).length + publicRecords.length,
    );
    assert.ok(
      revoked.files.every(
        (name) => !name.includes(fixture.slug) && !name.includes('publication-fixture-only'),
      ),
    );
    for (const file of revoked.files.filter((name) => /\.(html|json|js)$/.test(name))) {
      const payload = await readFile(file, 'utf8');
      assert.ok(
        !payload.includes(fixture.title) &&
          !payload.includes(fixture.slug) &&
          !payload.includes('publication-fixture-only'),
      );
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
