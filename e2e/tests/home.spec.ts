import { test, expect } from '@playwright/test';
import { loginAndWait, goToHome } from './helpers';

test.describe('Home screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
    await goToHome(page);
  });

  test('shows Eventos próximos section', async ({ page }) => {
    await expect(page.locator('text=/Eventos pr/').first()).toBeVisible({ timeout: 8000 });
  });

  test('shows Materias en curso section', async ({ page }) => {
    await expect(page.locator('text=/Materias en curso/').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows Materias aprobadas section', async ({ page }) => {
    await expect(page.locator('text=/Materias aprobadas/').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows Ver más links for each section', async ({ page }) => {
    const verMas = page.getByText('Ver más');
    const count = await verMas.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Ver más from Materias aprobadas navigates to full list', async ({ page }) => {
    const links = page.getByText('Ver más');
    // Third "Ver más" is for Materias aprobadas
    await links.nth(2).click();
    await expect(page.locator('text=/Materias aprobadas/').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('66.20').or(page.getByText('66.70')).first()).toBeVisible({ timeout: 8000 });
  });

  test('shows approved subject data from DB', async ({ page }) => {
    await expect(page.getByText('66.20')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Organización de Computadoras')).toBeVisible({ timeout: 5000 });
  });
});
