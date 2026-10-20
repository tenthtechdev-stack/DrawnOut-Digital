import { getCollection } from 'astro:content';
import { selectPublicProjects, type ProjectSelectionOptions } from './project-schema';

/** Every public consumer must use this selector, including future generated routes. */
export async function getPublicProjects(options: ProjectSelectionOptions = {}) {
  return selectPublicProjects(await getCollection('projects'), options);
}

/** Private design proofs only: drafts are never included in a production build. */
export async function getDraftPreviewProjects() {
  if (!import.meta.env.DEV) return [];

  return (await getCollection('projects')).sort(
    (a, b) =>
      (a.data.featuredOrder ?? Number.POSITIVE_INFINITY) -
        (b.data.featuredOrder ?? Number.POSITIVE_INFINITY) ||
      a.data.slug.localeCompare(b.data.slug),
  );
}
