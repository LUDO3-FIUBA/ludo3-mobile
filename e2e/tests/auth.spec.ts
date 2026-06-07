import { test, expect } from '@playwright/test';
import { BASE, DNI, PASS, login } from './helpers';
import { FIRST_NAME } from './test-config';

test.describe('Auth', () => {
  test('login with valid credentials enters the app', async ({ page }) => {
    await login(page, DNI, PASS);
    await page.waitForURL(/app/, { timeout: 10000 });
    // New UI lands on credential screen by default
    await expect(page.getByText(new RegExp(`credencial|${FIRST_NAME}`, 'i')).first()).toBeVisible({ timeout: 5000 });
  });

  test('landing page accessible without login', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('DNI')).toBeVisible();
    await expect(page.getByText('Ingresar')).toBeVisible();
  });

  test('login with wrong credentials stays on landing', async ({ page }) => {
    await login(page, '00000000', 'wrongpass');
    await page.waitForTimeout(3000);
    await expect(page.getByPlaceholder('DNI')).toBeVisible({ timeout: 5000 });
  });
});
