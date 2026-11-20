import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'sitewide-motion.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 12_000 },
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.REVIEW_REPORT ?? 'artifacts/sitewide-motion/browser-tests.json' },
    ],
  ],
  outputDir: 'test-results/sitewide-motion',
  use: {
    baseURL: 'http://127.0.0.1:4480',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4480',
    url: 'http://127.0.0.1:4480',
    reuseExistingServer: false,
  },
});
