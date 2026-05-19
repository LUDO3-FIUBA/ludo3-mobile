import { Page, expect } from '@playwright/test';
import { BASE, DNI, PASS } from './test-config';

export { BASE, DNI, PASS };

export async function login(page: Page, dni: string, password: string) {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('DNI').fill(dni);
  await page.getByPlaceholder('Contraseña').fill(password);
  await page.getByText('Ingresar').click();
}

export async function loginAndWait(page: Page) {
  await login(page, DNI, PASS);
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
