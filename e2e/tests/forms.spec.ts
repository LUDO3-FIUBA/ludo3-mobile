import { test, expect } from '@playwright/test';
import { loginAndWait, goToForms } from './helpers';

test.describe('Trámites / Forms screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
    await goToForms(page);
  });

  test('forms list screen loads with Historial button', async ({ page }) => {
    await expect(page.getByText('Historial')).toBeVisible();
  });

  test('clicking Historial opens submission history modal', async ({ page }) => {
    await page.getByText('Historial').click();
    await expect(page.getByText(/Historial de envíos|envíos/i).first()).toBeVisible({ timeout: 5000 });
  });
});
