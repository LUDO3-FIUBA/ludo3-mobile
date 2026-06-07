import { test, expect } from '@playwright/test';
import { loginAndWait } from './helpers';

async function openAcademico(page) {
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(400);
}

test.describe('Academic screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  // ── Materias aprobadas ─────────────────────────────────────────────────────

  test('Materias aprobadas shows full list with subject codes', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias aprobadas').click();
    await expect(page.getByText('Materias aprobadas').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('61.03').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('63.01').first()).toBeVisible({ timeout: 8000 });
  });

  test('Materias aprobadas shows grade and date for each subject', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias aprobadas').click();
    await expect(page.locator('text=/Nota: [0-9]/').first()).toBeVisible({ timeout: 8000 });
  });

  test('Materias aprobadas shows teacher name', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias aprobadas').click();
    await expect(page.getByText('Jorge Collinet').or(page.getByText('Iribarren')).first()).toBeVisible({ timeout: 8000 });
  });

  // ── Materias pendientes ────────────────────────────────────────────────────

  test('Materias pendientes screen loads', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias pendientes').click();
    await expect(page.locator('text=/Materias pendientes/').first()).toBeVisible({ timeout: 8000 });
  });

  test('Materias pendientes shows subject codes or empty state', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias pendientes').click();
    await page.waitForTimeout(2000);
    // Either shows subjects or an empty state message
    const hasSubjects = await page.locator('text=/\\d{2}\\.\\d{2}/').count();
    const hasEmpty = await page.locator('text=/no tenés|pendiente/i').count();
    expect(hasSubjects + hasEmpty).toBeGreaterThan(0);
  });

  // ── Materias en curso ──────────────────────────────────────────────────────

  test('Materias en curso screen loads', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Materias en curso').click();
    await expect(page.locator('text=/Materias en curso/').first()).toBeVisible({ timeout: 8000 });
  });

  // ── Estadísticas ───────────────────────────────────────────────────────────

  test('Estadísticas screen loads', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Estadísticas').click();
    await expect(page.locator('text=/Estadísticas/').first()).toBeVisible({ timeout: 8000 });
  });

  test('Estadísticas shows academic progress data', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Estadísticas').click();
    await page.waitForTimeout(2000);
    // Stats screen should show some numbers or charts
    await expect(page.locator('text=/promedio|crédito|materia/i').first()).toBeVisible({ timeout: 8000 });
  });

  // ── Trámites ───────────────────────────────────────────────────────────────

  test('Trámites screen loads with Historial button', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Trámites').click();
    await expect(page.getByText('Historial')).toBeVisible({ timeout: 8000 });
  });

  test('Trámites Historial shows submission history modal', async ({ page }) => {
    await openAcademico(page);
    await page.getByLabel('Trámites').click();
    await page.getByText('Historial').click();
    await expect(page.locator('text=/Historial de envíos|envíos/i').first()).toBeVisible({ timeout: 5000 });
  });
});
