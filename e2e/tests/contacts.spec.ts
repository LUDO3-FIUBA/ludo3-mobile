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

async function deleteAllNotifications(dni: string, pass: string) {
  const ctx = await playwrightRequest.newContext();
  const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni, password: pass } });
  const { access } = await loginResp.json();
  const listResp = await ctx.get(`${BACKEND}/api/notifications/my_notifications/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  const notifs = await listResp.json();
  for (const n of Array.isArray(notifs) ? notifs : []) {
    await ctx.delete(`${BACKEND}/api/notifications/${n.id}/delete_for_me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
  }
  await ctx.dispose();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe('Contacts — red de contactos', () => {
  test.beforeEach(async () => {
    await Promise.all([
      deleteAllContacts(DNI, PASS),
      deleteAllContacts(JOSE_DNI, JOSE_PASS),
      deleteAllNotifications(JOSE_DNI, JOSE_PASS),
    ]);
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

  test('notificación en campana cuando llega una solicitud de contacto', async ({ page }) => {
    // Fede sends request via API (José is the recipient)
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    await ctx.dispose();

    // José logs in and checks the notification bell
    await loginAs(page, JOSE_DNI, JOSE_PASS);
    // Click the bell to open notifications dropdown
    await page.getByLabel('Mostrar notificaciones').click();
    await expect(page.getByText('Nueva solicitud de contacto')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/te envió una solicitud de contacto/)).toBeVisible();
  });

  test('clickear la notificación de solicitud navega a Contactos', async ({ page }) => {
    // Fede sends request via API
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    await ctx.dispose();

    // José logs in, opens notification, clicks it
    await loginAs(page, JOSE_DNI, JOSE_PASS);
    await page.getByLabel('Mostrar notificaciones').click();
    await expect(page.getByText('Nueva solicitud de contacto')).toBeVisible({ timeout: 5000 });
    await page.getByText('Nueva solicitud de contacto').click();

    // Should navigate to Contacts screen
    await expect(page.getByPlaceholder('Buscar por nombre o padrón...')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Solicitud recibida')).toBeVisible({ timeout: 5000 });
  });

  // ─── Schedule comparison ──────────────────────────────────────────────────

  test('botón comparar horarios aparece en contacto aceptado', async ({ page }) => {
    // Create accepted contact via API
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    const createResp = await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    const contact = await createResp.json();
    const joseLogin = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: JOSE_DNI, password: JOSE_PASS } });
    const { access: joseToken } = await joseLogin.json();
    await ctx.post(`${BACKEND}/api/contacts/${contact.id}/accept/`, {
      headers: { Authorization: `Bearer ${joseToken}` },
    });
    await ctx.dispose();

    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await expect(page.getByLabel('ver-horarios')).toBeVisible({ timeout: 5000 });
  });

  test('comparar horarios navega a la pantalla de comparación', async ({ page }) => {
    // Create accepted contact via API
    const ctx = await playwrightRequest.newContext();
    const loginResp = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: DNI, password: PASS } });
    const { access } = await loginResp.json();
    const createResp = await ctx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${access}` },
    });
    const contact = await createResp.json();
    const joseLogin = await ctx.post(`${BACKEND}/auth/login/`, { data: { dni: JOSE_DNI, password: JOSE_PASS } });
    const { access: joseToken } = await joseLogin.json();
    await ctx.post(`${BACKEND}/api/contacts/${contact.id}/accept/`, {
      headers: { Authorization: `Bearer ${joseToken}` },
    });
    await ctx.dispose();

    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await loginAs(page, DNI, PASS);
    await goToContacts(page);
    await page.getByLabel('ver-horarios').click();
    await page.waitForTimeout(3000);
    console.log('JS ERRORS:', JSON.stringify(consoleErrors));
    // Should land on schedule comparison screen
    await expect(page.getByLabel('schedule-comparison-screen')).toBeVisible({ timeout: 5000 });
  });

  test('endpoint schedule-comparison devuelve mine y theirs', async () => {
    // Use raw fetch (no Playwright cookie management) to avoid session bleed between tests
    const apiFetch = async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      return res;
    };

    // Use hardcoded Fede credentials to avoid import aliasing issues from siu_integration.spec.ts
    const FEDE_DNI = '37247189';
    const FEDE_PASS = 'soydeferro';
    const loginRes = await apiFetch(`${BACKEND}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify({ dni: FEDE_DNI, password: FEDE_PASS }),
    });
    const { access } = await loginRes.json();

    // Clean up existing contacts for Fede first
    const existingRes = await apiFetch(`${BACKEND}/api/contacts/`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    });
    const existing = await existingRes.json();
    for (const c of Array.isArray(existing) ? existing : []) {
      await apiFetch(`${BACKEND}/api/contacts/${c.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
      });
    }

    const createRes = await apiFetch(`${BACKEND}/api/contacts/`, {
      method: 'POST',
      body: JSON.stringify({ padron: JOSE_PADRON }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    });
    const contact = await createRes.json();

    const joseLoginRes = await apiFetch(`${BACKEND}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify({ dni: JOSE_DNI, password: JOSE_PASS }),
    });
    const { access: joseToken } = await joseLoginRes.json();
    await apiFetch(`${BACKEND}/api/contacts/${contact.id}/accept/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${joseToken}` },
    });

    const resp = await apiFetch(`${BACKEND}/api/contacts/${contact.id}/schedule-comparison/`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    });
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty('mine');
    expect(data).toHaveProperty('theirs');
    expect(Array.isArray(data.mine)).toBe(true);
    expect(Array.isArray(data.theirs)).toBe(true);

    // Fede (DNI=37247189) has active inscriptions WITH schedules loaded by setup-db.sh
    // mine (Fede's own blocks) must be non-empty — the request is from Fede's token
    expect(data.mine.length).toBeGreaterThan(0);
    // José also has schedules (Lunes y Miércoles 12-14 created by setup-db.sh)
    expect(data.theirs.length).toBeGreaterThan(0);
    // Each block must have the required fields
    for (const block of [...data.mine, ...data.theirs]) {
      expect(block).toHaveProperty('subject_name');
      expect(block).toHaveProperty('day_of_week');
      expect(block).toHaveProperty('start_time');
      expect(block).toHaveProperty('end_time');
      expect(typeof block.day_of_week).toBe('number');
    }
  });

  test('pantalla de comparación muestra bloques cuando hay horarios', async ({ page }) => {
    // Hardcode Fede's credentials — DNI import may be aliased to Luca in some test contexts
    const FEDE_DNI = '37247189';
    const FEDE_PASS = 'soydeferro';

    // Create Fede→José accepted contact via separate contexts (no cookie bleed)
    const fedeCtx = await playwrightRequest.newContext({ storageState: { cookies: [], origins: [] } });
    const joseCtx2 = await playwrightRequest.newContext({ storageState: { cookies: [], origins: [] } });

    const fedeLogin = await fedeCtx.post(`${BACKEND}/auth/login/`, { data: { dni: FEDE_DNI, password: FEDE_PASS } });
    const { access: fedeToken } = await fedeLogin.json();

    // Clean up existing Fede contacts first
    const existingContacts = await (await fedeCtx.get(`${BACKEND}/api/contacts/`, { headers: { Authorization: `Bearer ${fedeToken}` } })).json();
    for (const c of Array.isArray(existingContacts) ? existingContacts : []) {
      await fedeCtx.delete(`${BACKEND}/api/contacts/${c.id}/`, { headers: { Authorization: `Bearer ${fedeToken}` } });
    }

    const createResp = await fedeCtx.post(`${BACKEND}/api/contacts/`, {
      data: { padron: JOSE_PADRON },
      headers: { Authorization: `Bearer ${fedeToken}` },
    });
    const contact = await createResp.json();
    await fedeCtx.dispose();

    const joseLogin2 = await joseCtx2.post(`${BACKEND}/auth/login/`, { data: { dni: JOSE_DNI, password: JOSE_PASS } });
    const { access: joseToken2 } = await joseLogin2.json();
    await joseCtx2.post(`${BACKEND}/api/contacts/${contact.id}/accept/`, {
      headers: { Authorization: `Bearer ${joseToken2}` },
    });
    await joseCtx2.dispose();

    // José navigates to compare schedules with Fede
    await loginAs(page, JOSE_DNI, JOSE_PASS);
    await goToContacts(page);
    await page.getByLabel('ver-horarios').click();
    await expect(page.getByLabel('schedule-comparison-screen')).toBeVisible({ timeout: 5000 });

    // Fede has schedules — should show day sections, not the empty state
    await expect(page.getByText(/Ninguno de los dos está cursando/)).not.toBeVisible({ timeout: 3000 });
    // At least one day label should appear
    await expect(page.getByText(/Lunes|Martes|Miércoles|Jueves|Viernes/i).first()).toBeVisible({ timeout: 5000 });
    // Free gaps section should appear since both have schedules
    await expect(page.getByText(/Franjas libres en común/i)).toBeVisible({ timeout: 5000 });
  });

  // ─── Schedule comparison: 5 student scenarios ──────────────────────────────
  // All via raw fetch to avoid Playwright cookie/session bleed

  async function getScheduleGaps(user1Dni: string, user1Pass: string, user2Padron: string) {
    const r1 = await fetch(`${BACKEND}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: user1Dni, password: user1Pass }),
    });
    const { access: t1 } = await r1.json();

    // Clean existing contacts for user1
    const existing = await (await fetch(`${BACKEND}/api/contacts/`, { headers: { Authorization: `Bearer ${t1}` } })).json();
    for (const c of Array.isArray(existing) ? existing : []) {
      await fetch(`${BACKEND}/api/contacts/${c.id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${t1}` } });
    }

    const c = await (await fetch(`${BACKEND}/api/contacts/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t1}` },
      body: JSON.stringify({ padron: user2Padron }),
    })).json();

    const r2 = await fetch(`${BACKEND}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: user1Dni === '37247189' ? '12345678' : user1Dni, password: 'testpass' }),
    });
    // Accept as user2
    const loginU2Resp = await fetch(`${BACKEND}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ padron: user2Padron, dni: '', password: 'testpass' }),
    });

    // Find user2's token by padron lookup
    const user2Resp = await fetch(`${BACKEND}/api/students/search/?q=${user2Padron}`, {
      headers: { Authorization: `Bearer ${t1}` },
    });
    const students = await user2Resp.json();
    const user2 = students.find((s: any) => s.padron === user2Padron);

    // We need to know user2's DNI to login — use a helper
    return { contactId: c.id, token: t1, contactObj: c };
  }

  // Simpler helper: login + clean + create contact + accept + get gaps
  async function compareSchedules(
    myDni: string, myPass: string,
    theirDni: string, theirPass: string,
    theirPadron: string,
  ) {
    const meResp = await fetch(`${BACKEND}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: myDni, password: myPass }),
    });
    const { access: meToken } = await meResp.json();

    // Clean my contacts first
    const myContacts = await (await fetch(`${BACKEND}/api/contacts/`, { headers: { Authorization: `Bearer ${meToken}` } })).json();
    for (const c of Array.isArray(myContacts) ? myContacts : []) {
      await fetch(`${BACKEND}/api/contacts/${c.id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${meToken}` } });
    }

    const createResp = await fetch(`${BACKEND}/api/contacts/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${meToken}` },
      body: JSON.stringify({ padron: theirPadron }),
    });
    const contact = await createResp.json();

    const themResp = await fetch(`${BACKEND}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: theirDni, password: theirPass }),
    });
    const { access: themToken } = await themResp.json();
    await fetch(`${BACKEND}/api/contacts/${contact.id}/accept/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${themToken}` },
    });

    const compResp = await fetch(`${BACKEND}/api/contacts/${contact.id}/schedule-comparison/`, {
      headers: { Authorization: `Bearer ${meToken}` },
    });
    return await compResp.json();
  }

  test('gaps: Fede(Lun/Mié 10-12, Mar/Jue 14-16) vs José(Lun/Mié 12-14) — lunes tiene gap 08-10 y 14-22', async () => {
    const data = await compareSchedules('37247189', 'soydeferro', '12345678', 'testpass', '99999');
    expect(data.mine.length).toBeGreaterThan(0);
    expect(data.theirs.length).toBeGreaterThan(0);
    expect(data.free_gaps.length).toBeGreaterThan(0);
    const monGaps = data.free_gaps.filter((g: any) => g.day_of_week === 0);
    expect(monGaps.length).toBeGreaterThanOrEqual(1);
    // Lunes: Fede 10-12, José 12-14 → gap 08-10 and 14-22
    expect(monGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '10:00')).toBe(true);
    expect(monGaps.some((g: any) => g.start_time === '14:00' && g.end_time === '22:00')).toBe(true);
  });

  test('gaps: Fede vs Ana(Lun/Jue 08-10) — lunes no hay solapamiento, gap entre cursos', async () => {
    const data = await compareSchedules('37247189', 'soydeferro', '11000001', 'testpass', '11001');
    // Lunes: Ana 08-10, Fede 10-12 → no overlap, gap after Fede ends: 12-22
    const monGaps = data.free_gaps.filter((g: any) => g.day_of_week === 0);
    expect(monGaps.some((g: any) => g.start_time === '12:00')).toBe(true);
    // Martes: Fede 14-16, Ana nothing → full day minus Fede, gap 08-14 and 16-22
    const tueGaps = data.free_gaps.filter((g: any) => g.day_of_week === 1);
    expect(tueGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '14:00')).toBe(true);
    expect(tueGaps.some((g: any) => g.start_time === '16:00' && g.end_time === '22:00')).toBe(true);
  });

  test('gaps: Fede vs Carlos(Mar/Jue 10-12) — martes: Carlos 10-12 + Fede 14-16 → gap 08-10, 12-14, 16-22', async () => {
    const data = await compareSchedules('37247189', 'soydeferro', '22000001', 'testpass', '22001');
    const tueGaps = data.free_gaps.filter((g: any) => g.day_of_week === 1);
    expect(tueGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '10:00')).toBe(true);
    expect(tueGaps.some((g: any) => g.start_time === '12:00' && g.end_time === '14:00')).toBe(true);
    expect(tueGaps.some((g: any) => g.start_time === '16:00' && g.end_time === '22:00')).toBe(true);
  });

  test('gaps: Fede vs María(Lun 10-12) — solapamiento total lunes → no hay gap 10-12, sí 08-10 y 12-22', async () => {
    const data = await compareSchedules('37247189', 'soydeferro', '33000001', 'testpass', '33001');
    const monGaps = data.free_gaps.filter((g: any) => g.day_of_week === 0);
    // Both busy 10-12 → gap 08-10 and 12-22
    expect(monGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '10:00')).toBe(true);
    expect(monGaps.some((g: any) => g.start_time === '12:00' && g.end_time === '22:00')).toBe(true);
    // No gap that starts exactly at 10:00 (that slot is busy for both)
    expect(monGaps.some((g: any) => g.start_time === '10:00')).toBe(false);
  });

  test('gaps: José vs Carlos(Mar/Jue 10-12) — días distintos, todos los días con alguien son gaps parciales', async () => {
    const data = await compareSchedules('12345678', 'testpass', '22000001', 'testpass', '22001');
    // José: Mon/Wed 12-14. Carlos: Tue/Thu 10-12. No common busy days.
    // Each day only one person has class → full gaps except that block
    const tueGaps = data.free_gaps.filter((g: any) => g.day_of_week === 1);
    // Martes: only Carlos 10-12 → gaps 08-10 and 12-22
    expect(tueGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '10:00')).toBe(true);
    expect(tueGaps.some((g: any) => g.start_time === '12:00' && g.end_time === '22:00')).toBe(true);
  });
});
