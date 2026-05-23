import { Page, expect } from '@playwright/test';

export const BASE = 'http://localhost:8081';
export const BACKEND = 'http://localhost:8007';
export const DNI = '43990892';
export const PASS = 'testpass';

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

export async function goToFiubaMap(page: Page) {
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(300);
  await page.getByLabel('Plan de Carrera').click();
  const iframe = page.frameLocator('iframe[title="FIUBA Map"]');
  await expect(iframe.locator('canvas').first()).toBeVisible({ timeout: 20000 });
  // Wait until FIUBA-Map has processed LUDO_SET_MATERIAS (at least 10 subjects approved)
  const fiubaFrame = page.frames().find(f => f.url().includes('fiuba-map'));
  if (fiubaFrame) {
    await fiubaFrame.waitForFunction(
      `window.__ludoNetwork &&
       window.__ludoNetwork.body.data.nodes.get({ filter: n => n.group === 'Aprobadas' }).length >= 10`,
      { timeout: 20000 },
    ).catch(() => {}); // if SIU has < 10 subjects, fall through to fixed wait
  }
  await page.waitForTimeout(500);
  return iframe;
}

export async function goToForms(page: Page) {
  // Académico is a submenu — click it to expand, then click Trámites
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(300);
  await page.getByLabel('Trámites').click();
  await expect(page.getByText('Historial')).toBeVisible({ timeout: 10000 });
}
