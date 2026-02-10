import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src/tests/e2e',
    timeout: 60000,
    globalSetup: './src/tests/e2e/global-setup.js', // Run this before everything
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        storageState: './src/tests/e2e/storage-state.json', // Use saved state (Cookies/Age Gate)
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
