import process from 'node:process';
import { defineConfig } from '@playwright/test';

// Run against the current production build; independent projects make targeted
// failures reviewable without rewriting historical milestone evidence.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 70_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.REVIEW_REPORT ?? 'artifacts/owner-corrections/browser-tests.json' },
    ],
  ],
  outputDir: 'test-results/owner-corrections',
  use: {
    baseURL: 'http://127.0.0.1:4401',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'about', testMatch: ['browser/about.spec.ts', 'browser/services-hero-about.spec.ts'] },
    {
      name: 'intro',
      testMatch: ['production-browser/*.spec.ts', 'browser/signature-intro.spec.ts'],
    },
    {
      name: 'preservation',
      testMatch: [
        'browser/services-hero.spec.ts',
        'browser/services.spec.ts',
        'browser/contact.spec.ts',
        'browser/footer-social.spec.ts',
        'browser/signature-footer.spec.ts',
        'browser/portfolio-motion.spec.ts',
      ],
    },
  ],
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4401',
    url: 'http://127.0.0.1:4401',
    reuseExistingServer: false,
  },
});
