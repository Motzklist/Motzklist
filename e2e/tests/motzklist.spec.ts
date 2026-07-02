import { test, expect, Page } from '@playwright/test';

/**
 * End-to-end tests for the integrated Motzklist stack.
 *
 * Credentials and catalogue data come from the Database repo's seed.sql:
 *   - parent users: user1 / user2  (password "1234")
 *   - admin user:   admin          (password "1234")
 *   - schools:      Ben Gurion, ORT, Brener, Herzel, Begin
 *   - Ben Gurion 9th Grade has a real equipment list (notebook/pencil/textbook)
 */

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL ?? 'http://localhost:3001';

// Force the English locale so school/grade names come back in English and the
// UI strings below match.
async function useEnglish(page: Page) {
    await page.context().addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
    }]);
}

async function loginAs(page: Page, username: string, password = '1234') {
    await useEnglish(page);
    await page.goto(`${CLIENT_URL}/login`);
    await page.fill('input#username', username);
    await page.fill('input#password', password);

    const loginResponse = page.waitForResponse(
        res => res.url().includes('/api/login') && res.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');
    await loginResponse;

    // The header only shows "Sign out" once the session is established.
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
}

/**
 * Drives the full browse -> save -> checkout flow as the already-logged-in user
 * and leaves the page on /checkout with a populated cart. Shared by the
 * "reaches checkout" and "moves to purchase" tests so both exercise the same
 * real path to the pay button.
 */
async function selectListAndOpenCheckout(page: Page) {
    // Home loads the school list once authenticated.
    const schoolsResponse = page.waitForResponse(res => res.url().includes('/api/schools'));
    await page.goto(`${CLIENT_URL}/`);
    await schoolsResponse;

    // Pick a school -> triggers the grade fetch.
    const schoolInput = page.getByPlaceholder('Search for a school');
    await expect(schoolInput).toBeVisible();
    await schoolInput.click();
    const gradesResponse = page.waitForResponse(res => res.url().includes('/api/grades'));
    await page.getByRole('option', { name: 'Ben Gurion' }).click();
    await gradesResponse;

    // Pick a grade -> triggers the equipment fetch.
    const gradeInput = page.getByPlaceholder('Search for a grade');
    await expect(gradeInput).toBeVisible();
    await gradeInput.click();
    const equipmentResponse = page.waitForResponse(res => res.url().includes('/api/equipment'));
    await page.getByRole('option', { name: '9th Grade' }).click();
    await equipmentResponse;

    // Save the list -> persists the cart on the backend (POST /api/cart).
    const saveResponse = page.waitForResponse(
        res => res.url().includes('/api/cart') && res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /save list to cart/i }).click();
    await saveResponse;

    // The cart page reloads the cart from the backend on mount.
    const getCartResponse = page.waitForResponse(
        res => res.url().includes('/api/cart') && res.request().method() === 'GET'
    );
    await page.goto(`${CLIENT_URL}/cart`);
    await getCartResponse;

    // Proceed to checkout.
    const checkoutLink = page.getByRole('link', { name: /proceed to checkout/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    await expect(page).toHaveURL(/.*\/checkout/);
    await expect(page.getByRole('heading', { name: /review & pay/i })).toBeVisible();
}

test.describe('Client front-end', () => {

    test('1. logs in successfully with valid credentials', async ({ page }) => {
        await useEnglish(page);
        await page.goto(`${CLIENT_URL}/login`);
        await page.fill('input#username', 'user1');
        await page.fill('input#password', '1234');

        const loginResponse = page.waitForResponse(
            res => res.url().includes('/api/login') && res.request().method() === 'POST'
        );
        await page.click('button[type="submit"]');
        await loginResponse;

        await expect(page).toHaveURL(`${CLIENT_URL}/`);
    });

    test('2. logs in and out successfully', async ({ page }) => {
        await loginAs(page, 'user2');

        await page.getByRole('button', { name: /sign out/i }).click();

        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('3. selects a school + grade, saves the list, and reaches checkout', async ({ page }) => {
        await loginAs(page, 'user1');
        await selectListAndOpenCheckout(page);
    });

    test('4. confirms payment and moves to purchase (opens the checkout session)', async ({ page }) => {
        await loginAs(page, 'user1');
        await selectListAndOpenCheckout(page);

        // Clicking "Confirm & pay" asks the backend to open a checkout session
        // (POST /api/create-checkout-session) — "moving to purchase". We wait for
        // the RESPONSE, not merely the outgoing request: this call is cross-origin
        // with a JSON body, so it is CORS-preflighted, and a browser still reports
        // the outgoing request even when the preflight is later blocked — so
        // waiting on the request alone would pass even against a broken path/CORS.
        // A response only comes back when the /api path exists AND the CORS
        // preflight succeeds, which is exactly the regression this test guards.
        // We do not require a 2xx: the e2e stack has no Stripe credentials, so the
        // backend may 500 after accepting the session request — only the payment's
        // initiation is observable here, not its completion.
        const checkoutResponse = page.waitForResponse(
            res =>
                res.url().includes('/api/create-checkout-session') &&
                res.request().method() === 'POST',
            { timeout: 20_000 }
        );

        await page.getByRole('button', { name: /confirm & pay/i }).click();

        const response = await checkoutResponse;
        // A CORS-valid response came back (a blocked preflight yields no response
        // at all and fails the wait above) — the header proves CORS is working for
        // the checkout endpoint, the exact thing that was breaking in deployment.
        expect(response.headers()['access-control-allow-origin']).toBeTruthy();
        // The order total is sent as the amount to charge — proof the UI built a
        // real purchase payload, not just navigated.
        expect(response.request().postData() ?? '').toContain('amount');
    });

    test('5. views order history', async ({ page }) => {
        await loginAs(page, 'user1');

        const historyResponse = page.waitForResponse(res => res.url().includes('/api/history'));
        await page.goto(`${CLIENT_URL}/orders`);
        await historyResponse;

        await expect(page.getByRole('heading', { name: /your past orders/i })).toBeVisible();
    });

});

test.describe('Admin front-end', () => {

    test('6. serves the admin sign-in page', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/signin`);
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

});
