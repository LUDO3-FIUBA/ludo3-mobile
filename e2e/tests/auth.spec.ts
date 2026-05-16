import { test, expect } from '@playwright/test';
const BASE = 'http://localhost:8081';
const DNI = '37247189';
const PASS = 'soydeferro';

async function login(page: Page, dni: string, password: string) {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('DNI').fill(dni);
  await page.getByPlaceholder('Contraseña').fill(password);
  await page.getByText('Ingresar').click();
}

test.describe('Auth', () => {
  test('login with valid credentials enters the app', async ({ page }) => {
    await login(page, DNI, PASS);
    await page.waitForURL(/app/, { timeout: 10000 });
    // New UI lands on credential screen by default
    await expect(page.getByText(/credencial|Federico/i).first()).toBeVisible({ timeout: 5000 });
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
