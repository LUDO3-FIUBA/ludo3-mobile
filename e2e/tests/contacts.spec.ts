import { test, expect, request as playwrightRequest } from '@playwright/test';
import { BASE, BACKEND, DNI, PASS } from './helpers';

const JOSE_DNI = '12345678';
const JOSE_PASS = 'testpass';
const JOSE_PADRON = '99999';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loginAs(page: any, dni: string, pass: string) {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('DNI').fill(dni);
  await page.getByPlaceholder('Contraseña').fill(pass);
  await page.getByText('Ingresar').click();
  await page.waitForURL(/app/, { timeout: 10000 });
  await page.waitForTimeout(300);
}

async function goToContacts(page: any) {
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(300);
  await page.getByLabel('Contactos').click();
  await expect(page.getByPlaceholder('Buscar por nombre o padrón...')).toBeVisible({ timeout: 8000 });
}

async function deleteAllContacts(dni: string, pass: string) {
  const ctx = await playwrightRequest.newContext();
  const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni, password: pass } });
  const { access } = await loginResp.json();
  const listResp = await ctx.get(`${BACKEND}/api/contacts/`, { headers: { Authorization: `Bearer ${access}` } });
  const contacts = await listResp.json();
  for (const c of Array.isArray(contacts) ? contacts : []) {
    await ctx.delete(`${BACKEND}/api/contacts/${c.id}/`, { headers: { Authorization: `Bearer ${access}` } });
  }
  await ctx.dispose();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe('Contacts — red de contactos', () => {
  test.beforeEach(async () => {
    await deleteAllContacts(DNI, PASS);
  });

  test('pantalla de contactos carga correctamente', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await expect(page.getByPlaceholder('Buscar por nombre o padrón...')).toBeVisible();
    await expect(page.getByText(/Todavía no tenés contactos/)).toBeVisible();
  });

  test('buscar alumno por padrón muestra resultados', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill(JOSE_PADRON);
    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`Padrón: ${JOSE_PADRON}`)).toBeVisible();
  });

  test('buscar por nombre muestra resultados', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill('José');
    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });
  });

  test('búsqueda de 1 caracter no busca', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill('J');
    await expect(page.getByText('José Pérez')).not.toBeVisible({ timeout: 2000 });
  });

  test('enviar solicitud de contacto crea registro pendiente', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill(JOSE_PADRON);
    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });

    // Click the add button (only button in the search result row)
    await page.getByLabel('agregar-contacto').first().click();

    await expect(page.getByText('Solicitud enviada')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Solicitudes pendientes/i)).toBeVisible();
  });

  test('solicitud enviada NO muestra botón aceptar', async ({ page }) => {
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill(JOSE_PADRON);
    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('agregar-contacto').first().click();

    await expect(page.getByText('Solicitud enviada')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('aceptar-contacto')).not.toBeVisible();
    await expect(page.getByLabel('eliminar-contacto')).toBeVisible();
  });

  test('receptor ve solicitud recibida y puede aceptar', async ({ page }) => {
    // Fede sends request via API
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    await ctx.dispose();

    // José logs in and accepts
    await loginAs(page, JOSE_DNI, JOSE_PASS);
    await goToContacts(page);
    await expect(page.getByText('Solicitud recibida')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('aceptar-contacto')).toBeVisible();
    await page.getByLabel('aceptar-contacto').click();
    await expect(page.getByText('Solicitud recibida')).not.toBeVisible({ timeout: 5000 });
  });

  test('eliminar contacto pendiente', async ({ page }) => {
    // Create contact first via API
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    await ctx.dispose();

    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await expect(page.getByText('Solicitud enviada')).toBeVisible({ timeout: 5000 });

    // Accept dialog automatically
    page.on('dialog', dialog => dialog.accept());
    await page.getByLabel('eliminar-contacto').click();
    await expect(page.getByText('Solicitud enviada')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Todavía no tenés contactos/)).toBeVisible();
  });

  test('flujo completo: fede envía → jose acepta → fede ve a jose como contacto', async ({ page }) => {
    // Step 1: Fede sends request
    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByPlaceholder('Buscar por nombre o padrón...').fill(JOSE_PADRON);
    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('agregar-contacto').first().click();
    await expect(page.getByText('Solicitud enviada')).toBeVisible({ timeout: 5000 });

    // Step 2: José accepts via API (simulates him logging in separately)
    const ctx = await playwrightRequest.newContext();
    const joseLogin = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: JOSE_DNI, password: JOSE_PASS } });
    const { access: joseToken } = await joseLogin.json();
    const contactsResp = await ctx.get(`${BACKEND}/api/contacts/`, {
      headers: { Authorization: `Bearer ${joseToken}` },
    });
    const contacts = await contactsResp.json();
    const pending = contacts.find((c: any) => c.status === 'P');
    await ctx.post(`${BACKEND}/api/contacts/${pending.id}/accept/`, {
      headers: { Authorization: `Bearer ${joseToken}` },
    });
    await ctx.dispose();

    // Step 3: Fede logs back in — clear cookies (session uses HTTP-only cookie) + localStorage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await loginAs(page, DNI, PASS);
    await goToContacts(page);

    await expect(page.getByText('José Pérez')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Solicitud enviada')).not.toBeVisible();
    await expect(page.getByText('Solicitud recibida')).not.toBeVisible();
    // Accepted contact shows the subjects button, not the pending badge
    await expect(page.getByLabel('ver-materias')).toBeVisible();
    await expect(page.getByLabel('eliminar-contacto')).toBeVisible();
  });
});
