import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  // About's rendered timing acceptance uses optimized production output through
  // playwright.about.config.ts; development intentionally permits static arrival.
  testIgnore: ['about.spec.ts', 'services-hero-about.spec.ts', 'services-hero.spec.ts'],
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium' },
  },
  webServer: {
    command: 'npm run dev -- --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
});
