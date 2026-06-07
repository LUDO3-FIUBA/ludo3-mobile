import { test, expect } from '@playwright/test';
import { loginAndWait, expandSidebar } from './helpers';

test.describe('Menu — icon rail sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  // ── Estructura del sidebar ─────────────────────────────────────────────────

  test('sidebar starts collapsed showing only icons', async ({ page }) => {
    // Menu item text labels should NOT be visible in collapsed state.
    // Scope inside the labeled menu rows to avoid matching the page <h1> heading.
    await expect(page.getByLabel('Inicio').getByText('Inicio')).not.toBeVisible();
    await expect(page.getByLabel('Mapa').getByText('Mapa')).not.toBeVisible();
  });

  test('expand button has correct accessibility label', async ({ page }) => {
    await expect(page.getByLabel('Expandir menú')).toBeVisible();
  });

  test('expanding shows all top-level items', async ({ page }) => {
    await expandSidebar(page);
    await expect(page.getByLabel('Inicio').getByText('Inicio')).toBeVisible();
    await expect(page.getByLabel('Calendario').getByText('Calendario')).toBeVisible();
    await expect(page.getByLabel('Académico').getByText('Académico')).toBeVisible();
    await expect(page.getByLabel('Mapa').getByText('Mapa')).toBeVisible();
    await expect(page.getByLabel('Usuario').getByText('Usuario')).toBeVisible();
  });

  test('collapse button appears after expanding', async ({ page }) => {
    await expandSidebar(page);
    await expect(page.getByLabel('Colapsar menú')).toBeVisible();
  });

  test('collapsing hides text labels again', async ({ page }) => {
    await expandSidebar(page);
    await page.getByLabel('Colapsar menú').click();
    await page.waitForTimeout(400);
    await expect(page.getByLabel('Inicio').getByText('Inicio')).not.toBeVisible();
  });

  // ── Navegación directa ─────────────────────────────────────────────────────

  test('Inicio icon navigates to home', async ({ page }) => {
    await page.getByLabel('Inicio').click();
    await expect(page.locator('text=/Eventos pr/').first()).toBeVisible({ timeout: 8000 });
  });

  test('Calendario icon navigates to calendar', async ({ page }) => {
    await page.getByLabel('Calendario').click();
    await expect(page.getByText('Calendario').first()).toBeVisible({ timeout: 8000 });
  });

  test('Mapa icon navigates to floor map', async ({ page }) => {
    await page.getByLabel('Mapa').click();
    await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible({ timeout: 8000 });
  });

  // ── Submenu Académico ──────────────────────────────────────────────────────

  test('Académico icon expands submenu when sidebar is collapsed', async ({ page }) => {
    // Clicking a submenu icon while collapsed should expand sidebar + open submenu.
    // Scope to the labeled submenu rows to avoid colliding with home section titles.
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(400);
    await expect(page.getByLabel('Materias en curso').getByText('Materias en curso')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Materias pendientes').getByText('Materias pendientes')).toBeVisible();
    await expect(page.getByLabel('Materias aprobadas').getByText('Materias aprobadas')).toBeVisible();
    await expect(page.getByLabel('Trámites').getByText('Trámites')).toBeVisible();
  });

  test('Académico submenu closes on second click', async ({ page }) => {
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Trámites')).toBeVisible({ timeout: 3000 });
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Trámites')).not.toBeVisible();
  });

  test('Materias aprobadas in submenu navigates correctly', async ({ page }) => {
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(400);
    await page.getByLabel('Materias aprobadas').click();
    await expect(page.getByText('Materias aprobadas').first()).toBeVisible({ timeout: 8000 });
  });

  // ── Submenu Usuario ────────────────────────────────────────────────────────

  test('Usuario submenu shows Mi credencial and Cerrar sesión', async ({ page }) => {
    await page.getByLabel('Usuario').click();
    await page.waitForTimeout(400);
    await expect(page.getByLabel('Mi credencial')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Cerrar sesión')).toBeVisible();
  });

  test('Cerrar sesión returns to landing', async ({ page }) => {
    await page.getByLabel('Usuario').click();
    await page.waitForTimeout(400);
    await page.getByLabel('Cerrar sesión').click();
    await expect(page.getByPlaceholder('DNI')).toBeVisible({ timeout: 8000 });
  });
});
