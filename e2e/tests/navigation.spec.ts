import { test, expect } from '@playwright/test';
import { loginAndWait, goToHome, goToMap, expandSidebar } from './helpers';

test.describe('Navigation — icon rail sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  test('app loads and shows credential screen by default', async ({ page }) => {
    await expect(page.getByText('Federico Esteban')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DNI: 37247189')).toBeVisible();
    await expect(page.getByText('Padrón: 94557')).toBeVisible();
  });

  test('expanding sidebar shows menu labels', async ({ page }) => {
    await expandSidebar(page);
    await expect(page.getByText('Inicio').or(page.getByText('Mapa')).first()).toBeVisible({ timeout: 5000 });
  });

  test('home screen shows key sections', async ({ page }) => {
    await goToHome(page);
    await expect(page.locator('text=/Eventos pr/').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Materias en curso/').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Materias aprobadas/').first()).toBeVisible({ timeout: 5000 });
  });

  test('home screen shows real subject data from DB', async ({ page }) => {
    await goToHome(page);
    await expect(page.getByText('66.20')).toBeVisible({ timeout: 8000 });
  });

  test('map icon navigates to floor map', async ({ page }) => {
    await goToMap(page);
    await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible();
  });

  test('academic icon expands submenu with Trámites', async ({ page }) => {
    await page.locator('body').click({ position: { x: 38, y: 258 } });
    await page.waitForTimeout(400);
    await expect(page.getByText('Trámites')).toBeVisible({ timeout: 5000 });
  });
});
