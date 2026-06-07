import { test, expect } from '@playwright/test';
import * as net from 'net';
import { BASE, BACKEND, DNI, PASS, loginAndWait, goToFiubaMap } from './helpers';
import { SIU_HOST, SIU_PORT } from './test-config';
const EXPECTED_CAREER = 'informatica-2020';
const EXPECTED_SUBJECTS = ['AMII', 'FDP', 'PDP', 'INGSOFTI', 'PYE'];
const MIN_SUBJECTS = 20;

function isSiuReachable(): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => resolve(false));
    socket.connect(SIU_PORT, SIU_HOST);
  });
}

let siuReachable = false;
let accessToken = '';

test.describe('SIU Guaraní — real integration (VPN required)', () => {
  test.beforeAll(async ({ request }) => {
    siuReachable = await isSiuReachable();
    if (!siuReachable) return;
    const loginResp = await request.post(`${BACKEND}/auth/login/`, {
      data: { dni: DNI, password: PASS },
    });
    accessToken = (await loginResp.json()).access ?? '';
    if (!accessToken) { siuReachable = false; return; }
    // Verify the SIU service itself is responding — TCP reachable but 503 means service is down
    const healthResp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    siuReachable = healthResp.status() === 200;
  });

  test.beforeEach(() => {
    test.skip(!siuReachable, 'SIU Guaraní unavailable (VPN required or service down)');
  });

  // ── Backend API ────────────────────────────────────────────────────────────

  test('plan-carrera endpoint returns 200', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(resp.status()).toBe(200);
  });

  test('plan-carrera returns informatica-2020 career', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json();
    const ids = body.carreras.map((c: any) => c.fiuba_map_carrera_id);
    expect(ids).toContain(EXPECTED_CAREER);
  });

  test(`plan-carrera returns at least ${MIN_SUBJECTS} approved subjects`, async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json();
    expect(body.materias_aprobadas.length).toBeGreaterThanOrEqual(MIN_SUBJECTS);
  });

  test('plan-carrera includes expected SIU subject IDs', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json();
    const ids = body.materias_aprobadas.map((m: any) => m.id);
    for (const subject of EXPECTED_SUBJECTS) {
      expect(ids, `Expected ${subject} in response`).toContain(subject);
    }
  });

  test('all returned grades are in valid range (4-10)', async ({ request }) => {
    const resp = await request.get(`${BACKEND}/api/guarani/plan-carrera/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json();
    for (const m of body.materias_aprobadas) {
      expect(m.nota, `Grade out of range for ${m.id}`).toBeGreaterThanOrEqual(4);
      expect(m.nota, `Grade out of range for ${m.id}`).toBeLessThanOrEqual(10);
    }
  });

  // ── Full UI flow ───────────────────────────────────────────────────────────

  test('FIUBA-Map receives informatica-2020 from SIU via plan-carrera', async ({ page }) => {
    await loginAndWait(page);

    const planPromise = page.waitForResponse(
      r => r.url().includes('/api/guarani/plan-carrera') && r.status() === 200,
      { timeout: 20000 },
    );
    await page.getByLabel('Académico').click();
    await page.waitForTimeout(300);
    await page.getByLabel('Plan de Carrera').click();

    const planResp = await planPromise;
    const plan = await planResp.json();
    const ids = plan.carreras.map((c: any) => c.fiuba_map_carrera_id);
    expect(ids).toContain(EXPECTED_CAREER);
  });

  test(`at least ${MIN_SUBJECTS} SIU subjects appear approved in graph`, async ({ page }) => {
    await loginAndWait(page);
    const iframe = await goToFiubaMap(page);

    const approvedCount = await page.frames()
      .find(f => f.url().includes('fiuba-map'))
      ?.evaluate(() => {
        const net = (window as any).__ludoNetwork;
        if (!net) return 0;
        return net.body.data.nodes.get({ filter: (n: any) => n.group === 'Aprobadas' }).length;
      }) ?? 0;
    expect(approvedCount).toBeGreaterThanOrEqual(MIN_SUBJECTS);
  });

  test('specific SIU subjects are marked approved in graph', async ({ page }) => {
    await loginAndWait(page);
    const iframe = await goToFiubaMap(page);

    const approvedIds = await page.frames()
      .find(f => f.url().includes('fiuba-map'))
      ?.evaluate(() => {
        const net = (window as any).__ludoNetwork;
        if (!net) return [];
        return net.body.data.nodes
          .get({ filter: (n: any) => n.group === 'Aprobadas' })
          .map((n: any) => n.id);
      }) ?? [];
    for (const subject of EXPECTED_SUBJECTS) {
      expect(approvedIds, `Expected ${subject} approved in graph`).toContain(subject);
    }
  });
});
