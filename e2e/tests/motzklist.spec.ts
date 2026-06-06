import { test, expect, Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string = 'hashed_pass_123') {
    await page.context().addCookies([{
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/'
    }]);

    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', username);
    await page.fill('input[id="password"]', password);
    
    const loginResponse = page.waitForResponse(res => res.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    await loginResponse;

    const logoutBtn = page.locator('button', { hasText: /(Sign out|Logout)/i });
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
}

test.describe('Motzklist End to End Tests', () => {

    test('1. User can log in successfully with valid credentials', async ({ page }) => {
        await page.context().addCookies([{
            name: 'NEXT_LOCALE',
            value: 'en',
            domain: 'localhost',
            path: '/'
        }]);
        
        await page.goto('http://localhost:3000/login');
        await page.fill('input[id="username"]', 'roi');
        await page.fill('input[id="password"]', 'hashed_pass_123');
        
        const loginResponse = page.waitForResponse(res => res.url().includes('/api/login'));
        await page.click('button[type="submit"]');
        await loginResponse;
        
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('2. Login and Logout successfully', async ({ page }) => {
        await loginAs(page, 'avner', 'hashed_pass_456');
        
        const logoutBtn = page.locator('button', { hasText: /(Sign out|Logout)/i });
        await logoutBtn.click();
        
        const loginBtn = page.locator('button[type="submit"]');
        await expect(loginBtn).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('3. Select school, grade, max items, and proceed to purchase', async ({ page }) => {
        await loginAs(page, 'avner', 'hashed_pass_456');

        const schoolsResponse = page.waitForResponse(res => res.url().includes('/api/schools'));
        await page.goto('http://localhost:3000/');
        await schoolsResponse;

        const schoolInput = page.getByPlaceholder(/Search for a school/i);
        await expect(schoolInput).toBeVisible();
        await schoolInput.click();
        
        const gradesResponse = page.waitForResponse(res => res.url().includes('/api/grades'));
        await page.getByText('Ort Kiryat Motzkin').click();
        await gradesResponse;

        const gradeInput = page.getByPlaceholder(/Search for a grade/i);
        await expect(gradeInput).toBeVisible();
        await gradeInput.click();
        
        const equipmentResponse = page.waitForResponse(res => res.url().includes('/api/equipment'));
        await page.getByText('Grade 11 - Literature').click();
        await equipmentResponse;

        const cartResponse = page.waitForResponse(res => res.url().includes('/api/cart') && res.request().method() === 'POST');
        await page.locator('button', { hasText: /Save/i }).click();
        await cartResponse;

        const getCartResponse = page.waitForResponse(res => res.url().includes('/api/cart') && res.request().method() === 'GET');
        await page.goto('http://localhost:3000/cart');
        await getCartResponse;

        const checkoutLink = page.locator('a', { hasText: /Proceed to checkout/i });
        await expect(checkoutLink).toBeVisible();
        await checkoutLink.click();

        await expect(page).toHaveURL(/.*\/checkout/);
    });


    test('4. View orders history', async ({ page }) => {
        await loginAs(page, 'roi', 'hashed_pass_123');
        
        await page.goto('http://localhost:3000/orders');
        
        const mainHeading = page.locator('h1, h2').first();
        await expect(mainHeading).toBeVisible();
    });

});