import { test, expect } from '@playwright/test';

test.describe('Motzklist End to End Tests', () => {

  test('1. User can log in successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[id="username"]', 'roi');
    await page.fill('input[id="password"]', 'hashed_pass_123');
    
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'login-error.png' });
    
    await expect(page).toHaveURL('http://localhost:3000/');
  });

});