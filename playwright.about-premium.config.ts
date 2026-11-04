import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['about.spec.ts', 'services-hero-about.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 70_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.REVIEW_REPORT ?? 'artifacts/about-premium/browser-tests.json' },
    ],
  ],
  outputDir: 'test-results/about-premium',
  use: {
    baseURL: 'http://127.0.0.1:4410',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4410',
    url: 'http://127.0.0.1:4410',
    reuseExistingServer: false,
  },
});
