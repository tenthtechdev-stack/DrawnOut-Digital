import process from 'node:process';
import { defineConfig } from '@playwright/test';

/** Existing current-page suites; historical concept/dev-only timing tests are separate. */
export default defineConfig({
  testDir: './tests',
  testMatch: [
    '**/browser/services.spec.ts',
    '**/browser/services-hero.spec.ts',
    '**/browser/services-overview.spec.ts',
    '**/browser/signature-accessibility.spec.ts',
    '**/production-browser/loader.spec.ts',
    '**/production-browser/signature-squares.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 12_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/motion-quality/preservation-tests.json' }],
  ],
  outputDir: 'test-results/motion-preservation',
  use: {
    baseURL: 'http://127.0.0.1:4453',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4453',
    url: 'http://127.0.0.1:4453',
    reuseExistingServer: false,
  },
});
