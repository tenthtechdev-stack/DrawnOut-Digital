import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'case-premium.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 75_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.REVIEW_REPORT ?? 'artifacts/case-premium/browser-tests.json' },
    ],
  ],
  outputDir: 'test-results/case-premium',
  use: {
    baseURL: 'http://127.0.0.1:4431',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4431',
    url: 'http://127.0.0.1:4431',
    reuseExistingServer: false,
  },
});
