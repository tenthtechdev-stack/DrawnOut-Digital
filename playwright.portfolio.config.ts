import process from 'node:process';
import { defineConfig } from '@playwright/test';

const production = process.env.PORTFOLIO_PRODUCTION === '1';
const port = production ? 4363 : 4361;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['portfolio-motion.spec.ts', 'portfolio.spec.ts', 'storytelling.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile:
          process.env.PORTFOLIO_BROWSER_REPORT ?? 'artifacts/portfolio-motion/browser-tests.json',
      },
    ],
  ],
  outputDir: 'test-results/portfolio-motion',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: production
      ? `npm run preview -- --ignore-lock --port ${port}`
      : `npm run dev -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
