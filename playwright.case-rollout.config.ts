import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'case-premium.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 100_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.REVIEW_REPORT ?? 'artifacts/case-rollout/browser-tests.json' },
    ],
  ],
  outputDir: 'test-results/case-rollout',
  use: {
    baseURL: 'http://127.0.0.1:4441',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4441',
    url: 'http://127.0.0.1:4441',
    reuseExistingServer: false,
  },
});
