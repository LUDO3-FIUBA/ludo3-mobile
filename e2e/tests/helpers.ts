import { Page, expect } from '@playwright/test';

export const BASE = 'http://localhost:8081';
export const DNI = '37247189';
export const PASS = 'soydeferro';

export async function loginAndWait(page: Page) {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('DNI').fill(DNI);
  await page.getByPlaceholder('Contraseña').fill(PASS);
  await page.getByText('Ingresar').click();
  await page.waitForURL(/app/, { timeout: 10000 });
  await page.waitForTimeout(300);
}

export async function expandSidebar(page: Page) {
  await page.getByLabel('Expandir menú').click();
  await page.waitForTimeout(300);
}

export async function goToMap(page: Page) {
  await page.getByLabel('Mapa').click();
  await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible({ timeout: 10000 });
}

export async function goToHome(page: Page) {
  await page.getByLabel('Inicio').click();
  await expect(page.locator('text=/Eventos pr/').first()).toBeVisible({ timeout: 10000 });
}

export async function goToForms(page: Page) {
  // Académico is a submenu — click it to expand, then click Trámites
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(300);
  await page.getByLabel('Trámites').click();
  await expect(page.getByText('Historial')).toBeVisible({ timeout: 10000 });
}
