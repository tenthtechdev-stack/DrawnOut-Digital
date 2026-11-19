import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['contact.spec.ts', 'contact-signature.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 12_000 },
  reporter: [['list'], ['json', { outputFile: 'artifacts/contact-signature/browser-tests.json' }]],
  outputDir: 'test-results/contact-signature',
  use: {
    baseURL: 'http://127.0.0.1:4470',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4470',
    url: 'http://127.0.0.1:4470',
    reuseExistingServer: false,
  },
});
