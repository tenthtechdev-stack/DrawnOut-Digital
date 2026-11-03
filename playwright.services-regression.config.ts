import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: [
    'about.spec.ts',
    'services-hero-about.spec.ts',
    'services.spec.ts',
    'contact.spec.ts',
    'footer-social.spec.ts',
    'signature-footer.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  timeout: 70_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/services-hero/regression-browser-tests.json' }],
  ],
  outputDir: 'test-results/services-regression',
  use: {
    baseURL: 'http://127.0.0.1:4397',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4397',
    url: 'http://127.0.0.1:4397',
    reuseExistingServer: false,
  },
});
