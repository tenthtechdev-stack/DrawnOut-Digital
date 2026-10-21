import { projectCategories, type ProjectCategory } from './project-schema';

export const projectCategoryLabels: Record<ProjectCategory, string> = {
  identity: 'Identity',
  packaging: 'Packaging',
  digital: 'Digital',
  print: 'Print',
};

export interface WorkProject {
  data: {
    slug: string;
    workOrder?: number;
    featuredOrder?: number;
    categories?: readonly ProjectCategory[];
  };
}

export interface ProjectCategoryFilter {
  id: 'all' | ProjectCategory;
  label: string;
  count: number;
}

export function isProjectCategory(value: string): value is ProjectCategory {
  return (projectCategories as readonly string[]).includes(value);
}

/** Work ordering is independent of the already approved homepage feature order. */
export function sortWorkProjects<T extends WorkProject>(projects: readonly T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      (a.data.workOrder ?? a.data.featuredOrder ?? Number.POSITIVE_INFINITY) -
        (b.data.workOrder ?? b.data.featuredOrder ?? Number.POSITIVE_INFINITY) ||
      a.data.slug.localeCompare(b.data.slug),
  );
}

/** Pass publication-filtered records in public consumers, never a raw collection. */
export function getCategoryFilters(projects: readonly WorkProject[]): ProjectCategoryFilter[] {
  const filters: ProjectCategoryFilter[] = [
    { id: 'all', label: 'All work', count: projects.length },
  ];
  for (const category of projectCategories) {
    const count = projects.filter((project) => project.data.categories?.includes(category)).length;
    if (count > 0) filters.push({ id: category, label: projectCategoryLabels[category], count });
  }
  return filters;
}

/** Unknown categories return no matches; they never silently broaden the selection. */
export function filterWorkProjects<T extends WorkProject>(
  projects: readonly T[],
  category: string = 'all',
): T[] {
  const ordered = sortWorkProjects(projects);
  if (category === 'all') return ordered;
  if (!isProjectCategory(category)) return [];
  return ordered.filter((project) => project.data.categories?.includes(category));
}

/** Neighbors stay within the exact eligible set supplied by the route selector. */
export function getProjectNeighbors<T extends WorkProject>(
  projects: readonly T[],
  slug: string,
): { previous: T | undefined; next: T | undefined } {
  const ordered = sortWorkProjects(projects);
  const index = ordered.findIndex((project) => project.data.slug === slug);
  if (index < 0 || ordered.length < 2) return { previous: undefined, next: undefined };
  return {
    previous: ordered[(index - 1 + ordered.length) % ordered.length],
    next: ordered[(index + 1) % ordered.length],
  };
}
