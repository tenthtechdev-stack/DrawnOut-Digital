import { getCollection } from 'astro:content';
import { canPublish, selectPublicProjects, type ProjectSelectionOptions } from './project-schema';
import { sortWorkProjects } from './portfolio';

/** Every public consumer must use this selector, including future generated routes. */
export async function getPublicProjects(options: ProjectSelectionOptions = {}) {
  return selectPublicProjects(await getCollection('projects'), options);
}

/** Private design proofs only: drafts are never included in a production build. */
export async function getDraftPreviewProjects() {
  if (!import.meta.env.DEV) return [];

  return (await getCollection('projects'))
    .filter(({ data }) => !canPublish(data))
    .sort(
      (a, b) =>
        (a.data.featuredOrder ?? Number.POSITIVE_INFINITY) -
          (b.data.featuredOrder ?? Number.POSITIVE_INFINITY) ||
        a.data.slug.localeCompare(b.data.slug),
    );
}

/** Work index and public case navigation share this approval-filtered ordering. */
export async function getPublicWorkProjects() {
  return sortWorkProjects(await getPublicProjects());
}

/** Local review only; importing this selector never permits drafts in production. */
export async function getDraftWorkPreviewProjects() {
  return sortWorkProjects(await getDraftPreviewProjects());
}
