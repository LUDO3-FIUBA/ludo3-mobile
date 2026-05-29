import { test, expect } from '@playwright/test';
import { BASE, BACKEND } from './helpers';

// ─── Test users (all created by setup-db.sh) ──────────────────────────────────
// Fede:   DNI 37247189 / soydeferro  — Mon/Wed 10-12, Tue/Thu 14-16
// José:   DNI 12345678 / testpass    — Mon/Wed 12-14
// Ana:    DNI 11000001 / testpass    — Mon/Thu 08-10
// Carlos: DNI 22000001 / testpass    — Tue/Thu 10-12
// María:  DNI 33000001 / testpass    — Mon 10-12

const USERS = {
  fede:   { dni: '37247189', pass: 'soydeferro',  padron: '94557'  },
  jose:   { dni: '12345678', pass: 'testpass',    padron: '99999'  },
  ana:    { dni: '11000001', pass: 'testpass',    padron: '11001'  },
  carlos: { dni: '22000001', pass: 'testpass',    padron: '22001'  },
  maria:  { dni: '33000001', pass: 'testpass',    padron: '33001'  },
};

// ─── Raw fetch helpers (no Playwright cookie management) ──────────────────────

async function apiLogin(dni: string, pass: string) {
  const r = await fetch(`${BACKEND}/auth/login/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dni, password: pass }),
  });
  return (await r.json()).access as string;
}

async function api(method: string, path: string, token: string, body?: object) {
  const r = await fetch(`${BACKEND}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return null;
  return r.json();
}

// Make two students accepted contacts of each other
async function ensureContact(t1: string, t2: string, padron2: string) {
  // Clean existing contacts for user1 with this padron
  const existing = await api('GET', '/api/contacts/', t1);
  for (const c of Array.isArray(existing) ? existing : []) {
    if (c.contact?.padron === padron2) {
      await api('DELETE', `/api/contacts/${c.id}/`, t1);
    }
  }
  // Repeat for user2
  const existing2 = await api('GET', '/api/contacts/', t2);
  for (const c of Array.isArray(existing2) ? existing2 : []) {
    if (c.status === 'A' || c.status === 'P') {
      await api('DELETE', `/api/contacts/${c.id}/`, t2);
    }
  }
  const contact = await api('POST', '/api/contacts/', t1, { padron: padron2 });
  await api('POST', `/api/contacts/${contact.id}/accept/`, t2);
  return contact.id;
}

async function cleanGroups(token: string) {
  const groups = await api('GET', '/api/study-groups/', token);
  for (const g of Array.isArray(groups) ? groups : []) {
    if (g.is_creator) {
      // delete all memberships then group isn't deletable via API — just leave it
    } else {
      await api('DELETE', `/api/study-groups/${g.id}/leave/`, token);
    }
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe('Grupos de estudio', () => {

  test('crear grupo y ver en lista', async () => {
    const t = await apiLogin(USERS.fede.dni, USERS.fede.pass);
    const group = await api('POST', '/api/study-groups/', t, { name: 'TP Redes' });
    expect(group.id).toBeTruthy();
    expect(group.name).toBe('TP Redes');

    const list = await api('GET', '/api/study-groups/', t);
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((g: any) => g.id === group.id)).toBe(true);
  });

  test('invitar contacto y que acepte', async () => {
    const tFede = await apiLogin(USERS.fede.dni, USERS.fede.pass);
    const tJose = await apiLogin(USERS.jose.dni, USERS.jose.pass);
    await ensureContact(tFede, tJose, USERS.jose.padron);

    const group = await api('POST', '/api/study-groups/', tFede, { name: 'Grupo Invite Test' });
    const inv = await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.jose.padron });
    expect(inv.status).toBe('P');

    const accepted = await api('POST', `/api/study-groups/${group.id}/accept/`, tJose);
    expect(accepted.status).toBe('A');

    // José can now see the group
    const joseGroups = await api('GET', '/api/study-groups/', tJose);
    expect(joseGroups.some((g: any) => g.id === group.id)).toBe(true);
  });

  test('no se puede invitar a alguien que no es contacto', async () => {
    const tFede  = await apiLogin(USERS.fede.dni,  USERS.fede.pass);
    const tMaria = await apiLogin(USERS.maria.dni, USERS.maria.pass);

    // Remove any existing Fede-María contact so they're definitely not contacts
    const fedeContacts = await api('GET', '/api/contacts/', tFede);
    for (const c of Array.isArray(fedeContacts) ? fedeContacts : []) {
      if (c.contact?.padron === USERS.maria.padron) {
        await api('DELETE', `/api/contacts/${c.id}/`, tFede);
      }
    }

    const group = await api('POST', '/api/study-groups/', tFede, { name: 'Grupo Privado' });
    const r = await fetch(`${BACKEND}/api/study-groups/${group.id}/invite/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tFede}` },
      body: JSON.stringify({ padron: USERS.maria.padron }),
    });
    expect(r.status).toBe(400);
  });

  test('horario del grupo con 2 miembros devuelve gaps correctos', async () => {
    const tFede = await apiLogin(USERS.fede.dni, USERS.fede.pass);
    const tJose = await apiLogin(USERS.jose.dni, USERS.jose.pass);
    await ensureContact(tFede, tJose, USERS.jose.padron);

    const group = await api('POST', '/api/study-groups/', tFede, { name: 'Grupo 2 miembros' });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.jose.padron });
    await api('POST', `/api/study-groups/${group.id}/accept/`, tJose);

    const sched = await api('GET', `/api/study-groups/${group.id}/schedule/`, tFede);
    expect(sched.members.length).toBe(2);
    expect(Array.isArray(sched.blocks)).toBe(true);
    expect(Array.isArray(sched.free_gaps)).toBe(true);
    // Both Fede (Mon/Wed 10-12, Tue/Thu 14-16) and José (Mon/Wed 12-14) have schedules
    expect(sched.blocks.length).toBeGreaterThan(0);
    expect(sched.free_gaps.length).toBeGreaterThan(0);
    // Mon: Fede 10-12 + José 12-14 → gap 08-10
    const monGaps = sched.free_gaps.filter((g: any) => g.day_of_week === 0);
    expect(monGaps.some((g: any) => g.start_time === '08:00' && g.end_time === '10:00')).toBe(true);
  });

  test('grupo con 5 personas: Fede, José, Ana, Carlos, María', async () => {
    const tFede   = await apiLogin(USERS.fede.dni,   USERS.fede.pass);
    const tJose   = await apiLogin(USERS.jose.dni,   USERS.jose.pass);
    const tAna    = await apiLogin(USERS.ana.dni,    USERS.ana.pass);
    const tCarlos = await apiLogin(USERS.carlos.dni, USERS.carlos.pass);
    const tMaria  = await apiLogin(USERS.maria.dni,  USERS.maria.pass);

    // Ensure everyone is a contact of Fede
    await ensureContact(tFede, tJose,   USERS.jose.padron);
    await ensureContact(tFede, tAna,    USERS.ana.padron);
    await ensureContact(tFede, tCarlos, USERS.carlos.padron);
    await ensureContact(tFede, tMaria,  USERS.maria.padron);

    // Fede creates group and invites everyone
    const group = await api('POST', '/api/study-groups/', tFede, { name: 'Grupo TP 5 personas' });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.jose.padron });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.ana.padron });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.carlos.padron });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.maria.padron });

    // Everyone accepts
    await api('POST', `/api/study-groups/${group.id}/accept/`, tJose);
    await api('POST', `/api/study-groups/${group.id}/accept/`, tAna);
    await api('POST', `/api/study-groups/${group.id}/accept/`, tCarlos);
    await api('POST', `/api/study-groups/${group.id}/accept/`, tMaria);

    const sched = await api('GET', `/api/study-groups/${group.id}/schedule/`, tFede);

    // 5 members
    expect(sched.members.length).toBe(5);

    // All members have blocks
    expect(sched.blocks.length).toBeGreaterThan(0);

    // Free gaps exist
    expect(sched.free_gaps.length).toBeGreaterThan(0);

    // Verify specific gaps given schedules:
    // Mon: Fede 10-12, José 12-14, Ana 08-10, María 10-12
    //   Combined Mon busy: 08-10 (Ana), 10-12 (Fede+María), 12-14 (José) → no gap 08-14
    //   Gap after: 14-22
    const monGaps = sched.free_gaps.filter((g: any) => g.day_of_week === 0);
    expect(monGaps.some((g: any) => g.start_time === '14:00' && g.end_time === '22:00')).toBe(true);

    // Tue: Fede 14-16, Carlos 10-12 → gaps 08-10, 12-14, 16-22
    const tueGaps = sched.free_gaps.filter((g: any) => g.day_of_week === 1);
    expect(tueGaps.some((g: any) => g.start_time === '12:00' && g.end_time === '14:00')).toBe(true);

    // Each block has required fields
    for (const b of sched.blocks) {
      expect(b).toHaveProperty('padron');
      expect(b).toHaveProperty('full_name');
      expect(b).toHaveProperty('subject_name');
      expect(b).toHaveProperty('day_of_week');
      expect(b).toHaveProperty('start_time');
      expect(b).toHaveProperty('end_time');
    }
  });

  test('UI: crear grupo y ver pantalla de grupos', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('DNI').fill(USERS.fede.dni);
    await page.getByPlaceholder('Contraseña').fill(USERS.fede.pass);
    await page.getByText('Ingresar').click();
    await page.waitForURL(/app/, { timeout: 10000 });

    await page.getByLabel('Académico').click();
    await page.waitForTimeout(300);
    await page.getByLabel('Grupos de estudio').click();
    await expect(page.getByLabel('crear-grupo')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Nuevo grupo/)).toBeVisible();
  });

  test('UI: ver grupo y navegar al horario del grupo', async ({ page }) => {
    // Create group with 2 members via API
    const tFede = await apiLogin(USERS.fede.dni, USERS.fede.pass);
    const tJose = await apiLogin(USERS.jose.dni, USERS.jose.pass);
    await ensureContact(tFede, tJose, USERS.jose.padron);
    const group = await api('POST', '/api/study-groups/', tFede, { name: 'Grupo Horario UI' });
    await api('POST', `/api/study-groups/${group.id}/invite/`, tFede, { padron: USERS.jose.padron });
    await api('POST', `/api/study-groups/${group.id}/accept/`, tJose);

    // Fede logs in via browser (clear session first)
    await page.context().clearCookies();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByPlaceholder('DNI').fill(USERS.fede.dni);
    await page.getByPlaceholder('Contraseña').fill(USERS.fede.pass);
    await page.getByText('Ingresar').click();
    await page.waitForURL(/app/, { timeout: 10000 });

    // Navigate to study groups
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(300);
    await page.getByLabel('Grupos de estudio').click();
    await expect(page.getByText('Grupo Horario UI').first()).toBeVisible({ timeout: 8000 });

    // Click the schedule button
    await page.getByLabel('ver-horario-grupo').first().click();
    await expect(page.getByLabel('group-schedule-screen')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Franjas libres para todos/i)).toBeVisible({ timeout: 5000 });
    // Two members with schedules — no empty state
    await expect(page.getByText(/Ningún miembro está cursando/)).not.toBeVisible();
    // At least one day section appears
    await expect(page.getByText(/Lunes|Martes|Miércoles|Jueves|Viernes/i).first()).toBeVisible({ timeout: 5000 });
  });
});
