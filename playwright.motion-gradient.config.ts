import process from 'node:process';
import { defineConfig } from '@playwright/test';

// These existing shader tests inspect a deliberately development-only snapshot.
// Keep that instrumentation out of the production build and test it in dev.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'signature-gradient.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 12_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/motion-quality/gradient-dev-tests.json' }],
  ],
  outputDir: 'test-results/motion-gradient',
  use: {
    baseURL: 'http://127.0.0.1:4461',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 4461',
    url: 'http://127.0.0.1:4461',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
