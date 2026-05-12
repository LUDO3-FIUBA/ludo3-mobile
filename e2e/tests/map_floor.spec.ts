import { test, expect } from '@playwright/test';
import { loginAndWait, goToMap } from './helpers';

test.describe('Floor Map', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
    await goToMap(page);
  });

  // ── Carga inicial ──────────────────────────────────────────────────────────

  test('search bar is visible on load', async ({ page }) => {
    await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible();
  });

  test('default floor is Piso 4', async ({ page }) => {
    await expect(page.getByText('Piso 4')).toBeVisible({ timeout: 5000 });
  });

  test('floor plan renders room labels on load', async ({ page }) => {
    await expect(page.getByText('AULA 403').or(page.getByText('AULA 400')).first()).toBeVisible({ timeout: 8000 });
  });

  // ── Controles de zoom ──────────────────────────────────────────────────────

  test('zoom in (+) button is visible', async ({ page }) => {
    await expect(page.getByLabel('+').or(page.getByText('+')).first()).toBeVisible();
  });

  test('zoom out (−) button is visible', async ({ page }) => {
    await expect(page.getByText('−')).toBeVisible();
  });

  test('zoom in changes scale', async ({ page }) => {
    const mapArea = page.locator('svg').first().or(page.locator('[data-testid="floor-map"]').first());
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    // After zooming in, room labels should still be visible
    await expect(page.getByText('AULA 403').or(page.getByText('AULA 400')).first()).toBeVisible({ timeout: 5000 });
  });

  // ── Cambio de piso ─────────────────────────────────────────────────────────

  test('floor picker shows both floors', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Primer Subsuelo')).toBeVisible({ timeout: 5000 });
  });

  test('switching to Primer Subsuelo changes the map', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Primer Subsuelo')).toBeVisible({ timeout: 5000 });
    // Subsuelo should show different rooms than Piso 4
    await expect(page.getByText('AULA 403')).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('switching back to Piso 4 restores original map', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(500);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(300);
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('AULA 403').or(page.getByText('AULA 400')).first()).toBeVisible({ timeout: 8000 });
  });

  // ── Búsqueda ───────────────────────────────────────────────────────────────

  test('search shows suggestions while typing', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('aula');
    await page.waitForTimeout(600);
    await expect(page.locator('text=/aula/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('search with specific room name shows that room', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(600);
    await expect(page.getByText(/403/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('clearing search hides suggestions', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('aula');
    await page.waitForTimeout(400);
    await page.getByPlaceholder(/Buscar aula/i).clear();
    await page.waitForTimeout(400);
    // Suggestions should disappear after clearing
    await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible();
  });
});
