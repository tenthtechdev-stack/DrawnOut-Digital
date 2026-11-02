import { defineConfig } from '@playwright/test';

// Exercise the integrated services, portfolio and Contact against one fresh
// production build, without depending on any previous worktree's dev server.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['services.spec.ts', 'portfolio-motion.spec.ts', 'contact.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  outputDir: 'test-results/service-main-integration',
  use: {
    baseURL: 'http://127.0.0.1:4371',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4371',
    url: 'http://127.0.0.1:4371',
    reuseExistingServer: false,
  },
});
