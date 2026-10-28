import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  // Keep the short opening independent of a render-blocking stylesheet request.
  // The shared + homepage styles add about 14KB compressed to the HTML.
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
