import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { canPublish, type PublicationState } from './project-schema';

/**
 * Astro's image import map includes every stored collection entry, even when a
 * later getCollection filter rejects it. Gate storage before image registration.
 */
export function projectLoader(): Loader {
  const source = glob({ pattern: '*.json', base: './src/content/projects' });
  return {
    name: 'publication-aware-projects',
    async load(context) {
      // Astro supplies a watcher only to its development content pipeline.
      // Builds and standalone sync/check commands default to the public set.
      const development = Boolean(context.watcher);
      // Remove prior development or revoked entries, including cached imports.
      context.store.clear();
      await source.load({
        ...context,
        store: {
          ...context.store,
          set(entry) {
            // glob has already validated data through projectSchema at this point.
            if (!development && !canPublish(entry.data as unknown as PublicationState))
              return false;
            return context.store.set(entry);
          },
        },
      });
    },
  };
}
