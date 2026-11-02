import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublicProjects } from '../../../lib/projects';

/** Generate only media referenced by an approved public record. Withdrawal removes
 * these routes as well as cards/cases; source exports never live in public/. */
export const getStaticPaths: GetStaticPaths = async () => {
  const filenames = new Set(
    (await getPublicProjects()).flatMap(({ data }) =>
      data.motion ? [data.motion.landscape, data.motion.portrait] : [],
    ),
  );
  return [...filenames].map((file) => ({ params: { file }, props: { file } }));
};

export const GET: APIRoute = async ({ props }) => {
  const bytes = await readFile(path.resolve('design-assets/portfolio-motion', props.file));
  return new Response(new Uint8Array(bytes), {
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length) },
  });
};
