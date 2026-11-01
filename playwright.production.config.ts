import { defineConfig } from '@playwright/test';

// This suite tests optimized assets and inline production styles, independently
// of the development server's compiler, HMR client and on-demand image transforms.
export default defineConfig({
  testDir: './tests/production-browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4323',
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4323',
    url: 'http://127.0.0.1:4323',
    // Always build the current source instead of accidentally reusing stale dist.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
