import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Motzklist integration e2e tests.
 *
 * The tests run against the full stack started by `docker compose up --build`:
 *   - client front-end  -> http://localhost:3000
 *   - admin front-end   -> http://localhost:3001
 *   - API gateway       -> http://localhost:8080
 *
 * Bring the stack up first (or rely on the CI workflow, which does it for you),
 * then run `npm run test:e2e`.
 */
export default defineConfig({
    testDir: './e2e/tests',
    // The default DB seed is shared mutable state (carts persist server-side),
    // so run a single worker to keep cart-mutating tests deterministic.
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        actionTimeout: 15_000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
