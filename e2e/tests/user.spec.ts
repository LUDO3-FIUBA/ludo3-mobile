import { test, expect } from '@playwright/test';
import { loginAndWait } from './helpers';

async function openUsuario(page) {
  await page.getByLabel('Usuario').click();
  await page.waitForTimeout(400);
}

test.describe('User submenu flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
  });

  // ── Mi credencial ──────────────────────────────────────────────────────────

  test('credential screen shows QR code', async ({ page }) => {
    // Default landing is already Mi credencial
    await expect(page.getByText('Federico Esteban')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DNI: 37247189')).toBeVisible();
    await expect(page.getByText('Padrón: 94557')).toBeVisible();
  });

  test('credential screen has Actualizar QR button', async ({ page }) => {
    await expect(page.getByText('Actualizar QR')).toBeVisible({ timeout: 5000 });
  });

  test('credential screen has Abrir credencial pública button', async ({ page }) => {
    await expect(page.getByText('Abrir credencial pública')).toBeVisible({ timeout: 5000 });
  });

  test('credential screen shows expiry notice', async ({ page }) => {
    await expect(page.locator('text=/expira|QR/i').first()).toBeVisible({ timeout: 5000 });
  });

  // ── Mi Cuenta ──────────────────────────────────────────────────────────────

  test('Mi Cuenta screen loads with GitHub link form', async ({ page }) => {
    await openUsuario(page);
    await page.getByLabel(/Mi Cuenta/i).click();
    await page.waitForTimeout(500);
    // GitHub placeholder is unique to this screen
    await expect(page.getByPlaceholder(/github/i)).toBeVisible({ timeout: 8000 });
  });

  // ── Cambiar contraseña ─────────────────────────────────────────────────────

  test('Cambiar contraseña screen loads with 3 fields and submit button', async ({ page }) => {
    await openUsuario(page);
    await page.getByLabel(/Cambiar contrase/i).click();
    await page.waitForTimeout(500);
    // Use placeholders — unique to this screen, not repeated in sidebar
    await expect(page.getByPlaceholder(/actual/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('textbox', { name: 'Nueva contraseña', exact: true })).toBeVisible();
    await expect(page.getByText(/Actualizar/i).last()).toBeVisible();
  });

  // ── Enlaces útiles ─────────────────────────────────────────────────────────

  test('Enlaces útiles screen loads with links', async ({ page }) => {
    await openUsuario(page);
    await page.getByLabel(/Enlaces/i).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Bolsa de Trabajo')).toBeVisible({ timeout: 8000 });
  });

  test('Enlaces útiles shows all 5 FIUBA resources', async ({ page }) => {
    await openUsuario(page);
    await page.getByLabel(/Enlaces/i).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Bolsa de Trabajo')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('RPL')).toBeVisible();
    await expect(page.getByText('Campus Grado')).toBeVisible();
    await expect(page.getByText('SIU Guaraní')).toBeVisible();
    await expect(page.getByText('Página de Tesis')).toBeVisible();
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  test('Cerrar sesión returns to landing', async ({ page }) => {
    await openUsuario(page);
    await page.getByLabel('Cerrar sesión').click();
    await expect(page.getByPlaceholder('DNI')).toBeVisible({ timeout: 8000 });
  });
});
