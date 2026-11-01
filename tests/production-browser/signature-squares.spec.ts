import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const selections = [
  'bunzo',
  'triarch',
  'sol-community-center',
  'churros',
  'by-tech-group',
  'capture',
];
const approvedPosters = selections.map((slug) => {
  const project = JSON.parse(
    readFileSync(new URL(`../../src/content/projects/${slug}.json`, import.meta.url), 'utf8'),
  ) as {
    slug: string;
    status: string;
    visibility: string;
    publicationApproved: boolean;
    displayApproval: { state: string; source: string };
    cover: string;
    gallery: { src: string }[];
  };
  const poster =
    slug === 'sol-community-center'
      ? project.gallery.find((entry) => entry.src.endsWith('sol-community-signage.webp'))!.src
      : project.cover;
  return { project, basename: path.basename(poster, '.webp') };
});

for (const width of [320, 390, 768, 1440]) {
  test(`six approved project posters reveal with the wave and keep SOL prominent at ${width}px`, async ({
    page,
  }) => {
    for (const { project } of approvedPosters) {
      expect(project.status).toBe('published');
      expect(project.visibility).toBe('public');
      expect(project.publicationApproved).toBe(true);
      expect(project.displayApproval.state).toBe('approved');
      expect(project.displayApproval.source.trim()).not.toBe('');
    }
    await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-signature-intro', 'playing');
    const evidence = await page.evaluate(async () => {
      const overlay = document.querySelector<HTMLElement>('[data-signature-intro-overlay]')!;
      const group = overlay.querySelector<HTMLElement>('[data-intro-projects]')!;
      const path = overlay.querySelector<SVGPathElement>('[data-intro-wave]')!;
      const squares = [...overlay.querySelectorAll<HTMLElement>('[data-intro-square]')];
      const images = squares.map((square) => square.querySelector<HTMLImageElement>('img')!);
      const rect = (element: Element) => {
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        };
      };
      const imageState = (image: HTMLImageElement) => {
        const style = getComputedStyle(image);
        const inset = style.clipPath.match(/^inset\(([^)]+)\)$/)?.[1]?.split(/\s+/);
        const first = inset?.[0] ?? '0';
        return {
          opacity: Number(style.opacity),
          remaining: first.endsWith('%') ? parseFloat(first) / 100 : 0,
        };
      };
      // Derive arrivals from the real SVG curve and stable frame boxes, not
      // from the implementation's declared delay values or collection order.
      const totalLength = path.getTotalLength();
      const matrix = path.getScreenCTM()!;
      const frames = squares.map((square) => rect(square.parentElement!));
      const exit = overlay
        .getAnimations()
        .find((entry) => (entry as CSSAnimation).animationName.includes('intro-exit'));
      if (!exit || exit.startTime === null) throw new Error('Missing live intro clock');
      const artworkTimings = images.map((image) => {
        const animation = image
          .getAnimations()
          .find((entry) => (entry as CSSAnimation).animationName.includes('artwork-arrive'));
        if (!(animation?.effect instanceof KeyframeEffect) || animation.startTime === null)
          throw new Error('Missing live artwork reveal');
        const timing = animation.effect.getComputedTiming();
        const keyframes = animation.effect.getKeyframes();
        const offset = Number(animation.startTime) - Number(exit.startTime);
        return {
          clockOffset: offset,
          start: offset + Number(timing.delay),
          end: offset + Number(timing.endTime),
          fromOpacity: Number(keyframes[0]?.opacity),
          toOpacity: Number(keyframes.at(-1)?.opacity),
          finalClip: String(keyframes.at(-1)?.clipPath ?? ''),
        };
      });
      const sawOutline = squares.map(() => false);
      const revealStarts: (number | null)[] = squares.map(() => null);
      const lastUnrevealed = squares.map(() => 0);
      let lastIncomplete = 0;
      let previousSample: number | undefined;
      let maximumSampleGap = 0;
      let sawMixedReveal = false;
      const fullSnapshots: {
        clock: number;
        geometry: {
          frames: ReturnType<typeof rect>[];
          slotWidths: number[];
          groupWidth: number;
          wordmark: ReturnType<typeof rect>;
          skip: ReturnType<typeof rect>;
        };
      }[] = [];
      await new Promise<void>((resolve) => {
        function sample() {
          const clock = Number(exit!.currentTime ?? 0);
          if (previousSample !== undefined)
            maximumSampleGap = Math.max(maximumSampleGap, clock - previousSample);
          previousSample = clock;
          const states = images.map(imageState);
          states.forEach((state, index) => {
            if (Number(getComputedStyle(squares[index]!).opacity) > 0.25 && state.opacity < 0.01)
              sawOutline[index] = true;
            if (revealStarts[index] === null) {
              if (state.opacity > 0.02 && state.remaining < 0.98) revealStarts[index] = clock;
              else lastUnrevealed[index] = clock;
            }
          });
          if (
            states.some((state) => state.opacity > 0.2 && state.remaining < 0.9) &&
            states.some((state) => state.opacity < 0.01)
          )
            sawMixedReveal = true;
          const allComplete =
            states.length === 6 &&
            states.every((state) => state.opacity > 0.99 && state.remaining < 0.001);
          if (fullSnapshots.length === 0 && !allComplete) lastIncomplete = clock;
          if (
            fullSnapshots.length === 0 &&
            allComplete &&
            Number(getComputedStyle(group).opacity) > 0.9
          ) {
            fullSnapshots.push({
              clock,
              geometry: {
                frames: squares.map(rect),
                slotWidths: squares.map((square) => rect(square.parentElement!).width),
                groupWidth: rect(group).width,
                wordmark: rect(overlay.querySelector('[data-intro-name]')!),
                skip: rect(overlay.querySelector('[data-signature-skip]')!),
              },
            });
          }
          if (['completed', 'skipped'].includes(document.documentElement.dataset.signatureIntro!))
            resolve();
          else requestAnimationFrame(sample);
        }
        sample();
      });
      // Compute the curve intersections after observation. The thousands of SVG
      // queries must not block the first reveal on slower runners. Geometry and
      // the SVG transform were captured above before the sequence was observed.
      const arrivals = frames.map(() => Number.POSITIVE_INFINITY);
      for (let step = 0; step <= 4000; step += 1) {
        const fraction = step / 4000;
        const point = path.getPointAtLength(totalLength * fraction);
        const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        frames.forEach((frame, index) => {
          if (
            !Number.isFinite(arrivals[index]) &&
            screen.x >= frame.left &&
            screen.x <= frame.right &&
            screen.y >= frame.top &&
            screen.y <= frame.bottom
          )
            arrivals[index] = 500 + fraction * 1750;
        });
      }
      return {
        slugs: squares.map((square) => square.dataset.introProject),
        images: images.map((image) => ({
          source: decodeURIComponent(image.currentSrc),
          loaded: image.complete && image.naturalWidth > 0,
          width: image.naturalWidth,
          height: image.naturalHeight,
          fit: getComputedStyle(image).objectFit,
        })),
        arrivals,
        artworkTimings,
        sawOutline,
        revealStarts,
        lastUnrevealed,
        lastIncomplete,
        maximumSampleGap,
        sawMixedReveal,
        fullyVisibleAt: fullSnapshots[0]?.clock ?? null,
        geometry: fullSnapshots[0]?.geometry ?? null,
        ended: Number(document.documentElement.dataset.signatureIntroEnded),
        reason: document.documentElement.dataset.signatureIntroReason,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    await test.info().attach(`project-squares-${width}`, {
      body: JSON.stringify(evidence),
      contentType: 'application/json',
    });
    expect(evidence.slugs).toEqual(selections);
    expect(new Set(evidence.images.map((image) => image.source)).size).toBe(6);
    evidence.images.forEach((image, index) => {
      expect(image.loaded).toBe(true);
      expect(image.source).toContain(approvedPosters[index]!.basename);
    });
    expect(evidence.sawOutline).toEqual([true, true, true, true, true, true]);
    expect(evidence.sawMixedReveal).toBe(true);
    for (const [index, firstVisible] of evidence.revealStarts.entries()) {
      expect(firstVisible).not.toBeNull();
      expect(Number.isFinite(evidence.arrivals[index])).toBe(true);
      const timing = evidence.artworkTimings[index]!;
      // Compare the browser's attached effect with the independently measured
      // SVG crossing. Then bracket live visibility with the last negative and
      // first positive sample: observer scheduling is not the reveal start.
      expect(Math.abs(timing.clockOffset)).toBeLessThan(1);
      expect(timing.start).toBeGreaterThanOrEqual(evidence.arrivals[index]! - 25);
      expect(timing.start).toBeLessThan(evidence.arrivals[index]! + 25);
      expect(timing.fromOpacity).toBe(0);
      expect(timing.toOpacity).toBe(1);
      expect(timing.finalClip).toMatch(/^inset\(0(?:px|%)?(?:\s+0(?:px|%)?)*\)$/);
      expect(firstVisible!).toBeGreaterThanOrEqual(evidence.arrivals[index]! - 25);
      expect(evidence.lastUnrevealed[index]!).toBeLessThan(evidence.arrivals[index]! + 160);
      expect(evidence.lastUnrevealed[index]!).toBeLessThan(firstVisible!);
      if (index > 0) expect(firstVisible!).toBeGreaterThan(evidence.revealStarts[index - 1]!);
    }
    expect(evidence.fullyVisibleAt).not.toBeNull();
    expect(Math.max(...evidence.artworkTimings.map((timing) => timing.end))).toBeLessThanOrEqual(
      2250,
    );
    expect(evidence.lastIncomplete).toBeLessThanOrEqual(2250);
    expect(evidence.geometry).not.toBeNull();
    const geometry = evidence.geometry!;
    const sol = geometry.frames[2]!;
    const solImage = evidence.images[2]!;
    expect(solImage.fit).toBe('contain');
    expect(solImage.width / solImage.height).toBeGreaterThan(1.6);
    expect(solImage.width / solImage.height).toBeLessThan(1.7);
    const overlaps = (a: (typeof geometry.frames)[number], b: (typeof geometry.frames)[number]) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    for (const [index, frame] of geometry.frames.entries()) {
      expect(frame.left).toBeGreaterThanOrEqual(0);
      expect(frame.right).toBeLessThanOrEqual(width);
      expect(frame.top).toBeGreaterThan(50);
      expect(overlaps(frame, geometry.wordmark)).toBe(false);
      expect(overlaps(frame, geometry.skip)).toBe(false);
      expect(geometry.slotWidths[index]! / geometry.groupWidth).toBeGreaterThanOrEqual(0.15);
      for (const other of geometry.frames.slice(index + 1))
        expect(overlaps(frame, other)).toBe(false);
      if (index !== 2) {
        expect(sol.top).toBeLessThan(frame.top);
        expect(geometry.slotWidths[2]!).toBeGreaterThan(geometry.slotWidths[index]! * 1.08);
      }
    }
    expect(evidence.reason).toBe('complete');
    expect(evidence.ended).toBeLessThanOrEqual(5000);
    expect(evidence.overflow).toBe(false);
    await expect(page.locator('[data-signature-intro-overlay]')).toBeHidden();
    await expect(page.locator('main h1')).toHaveText('We make ideas impossible to ignore.');
  });
}
