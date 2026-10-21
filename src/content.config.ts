import { defineCollection } from 'astro:content';
import { projectSchema } from './lib/project-schema';
import { projectLoader } from './lib/project-loader';

const projects = defineCollection({
  loader: projectLoader(),
  schema: ({ image }) => projectSchema(image()),
});

export const collections = { projects };
