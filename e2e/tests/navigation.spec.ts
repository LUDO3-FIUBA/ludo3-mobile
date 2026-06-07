import { test, expect } from '@playwright/test';
import { loginAndWait, goToHome, goToMap, expandSidebar } from './helpers';
import { DNI, PADRON, FULL_NAME } from './test-config';

test.describe('Navigation — icon rail sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  test('credential screen shows user identity after navigating from Usuario submenu', async ({ page }) => {
    await page.getByLabel('Usuario').click();
    await page.waitForTimeout(400);
    await page.getByLabel('Mi credencial').click();
    // The sidebar header also renders the user name, so scope the
    // FULL_NAME match to the credential card (identified by its "DNI:" row).
    await expect(page.getByText(`DNI: ${DNI}`)).toBeVisible({ timeout: 5000 });
    const card = page.locator('div').filter({ hasText: `DNI: ${DNI}` }).filter({ hasText: FULL_NAME }).last();
    await expect(card.getByText(FULL_NAME).last()).toBeVisible();
    await expect(page.getByText(`Padrón: ${PADRON}`)).toBeVisible();
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
    // Home renders the first 3 approved finals — 66.02 is always among them.
    await expect(page.getByText('66.02').first()).toBeVisible({ timeout: 8000 });
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
