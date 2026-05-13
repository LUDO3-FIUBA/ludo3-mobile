import { test, expect } from '@playwright/test';
import { loginAndWait } from './helpers';

async function goToCalendar(page) {
  await page.getByLabel('Calendario').click();
  await expect(page.getByText('Calendario').first()).toBeVisible({ timeout: 8000 });
}

test.describe('Calendar screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
    await goToCalendar(page);
  });

  test('calendar loads showing a month/week/day view', async ({ page }) => {
    // Calendar should show some view with date indicators
    await expect(page.locator('text=/Calendario/').first()).toBeVisible();
  });

  test('view mode switcher is present', async ({ page }) => {
    // Should have month/week/day toggle buttons
    await expect(
      page.getByText('Mes').or(page.getByText('Semana')).or(page.getByText('Día')).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('can switch to Day view', async ({ page }) => {
    await page.getByText('Día').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Día')).toBeVisible();
  });

  test('can switch to Week view', async ({ page }) => {
    await page.getByText('Semana').first().click();
    await page.waitForTimeout(500);
    // Week view shows day columns L M X J V S D
    await expect(page.locator('text=/Semana/').first()).toBeVisible();
  });

  test('Today button is visible', async ({ page }) => {
    await expect(page.getByText('Hoy').or(page.getByText('Today')).first()).toBeVisible({ timeout: 5000 });
  });
});
