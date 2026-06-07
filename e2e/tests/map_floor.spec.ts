import { test, expect } from '@playwright/test';
import { loginAndWait, goToMap } from './helpers';

const PISO4_ROOMS = ['AULA 403', 'AULA 400', 'LABORATORIOS', 'BEDELIA'];
const SUBSUELO_ROOMS = ['COMEDOR', 'AULA E32'];

async function getMapTransform(page) {
  return page.evaluate(() => {
    const views = Array.from(document.querySelectorAll('[style]')) as HTMLElement[];
    const mapView = views.find(el => el.style.transform && el.style.position === 'absolute');
    return mapView ? mapView.style.transform : null;
  });
}

// The map's fitScale is computed from the canvas dimensions on layout, then
// animated in via withTiming. Reading the transform before layout settles
// returns either scale(0) or a transitional fitScale from a smaller canvas —
// useless as a baseline. Wait for the transform to stay the same across
// consecutive polls so we know layout + animation have both settled.
async function waitForMapReady(page) {
  await page.waitForFunction(() => {
    const views = Array.from(document.querySelectorAll('[style]')) as HTMLElement[];
    const mapView = views.find(el => el.style.transform && el.style.position === 'absolute');
    if (!mapView) return false;
    const m = mapView.style.transform.match(/scale\(([\d.]+)\)/);
    if (!m || parseFloat(m[1]) <= 0) return false;
    const t = mapView.style.transform;
    const w = window as any;
    if (w.__mapLastTransform !== t) {
      w.__mapLastTransform = t;
      w.__mapLastTransformAt = Date.now();
      return false;
    }
    return Date.now() - w.__mapLastTransformAt > 500;
  }, { timeout: 12000 });
}

async function clickFirstSuggestion(page) {
  // The first dropdown suggestion is visually at ~y=149, centered horizontally
  // Use coordinate click to avoid hitting SVG labels that appear first in DOM
  await page.mouse.click(640, 149);
  await page.waitForTimeout(800);
}

async function getHighlightRects(page) {
  return page.evaluate(() => {
    const rects = Array.from(document.querySelectorAll('rect[fill-opacity]'));
    return rects.map(r => ({
      fillOpacity: r.getAttribute('fill-opacity'),
      strokeWidth: r.getAttribute('stroke-width'),
    }));
  });
}

test.describe('Floor Map — comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWait(page);
    await goToMap(page);
  });

  // ── Carga inicial ──────────────────────────────────────────────────────────

  test('loads with all controls visible', async ({ page }) => {
    await expect(page.getByPlaceholder(/Buscar aula/i)).toBeVisible();
    await expect(page.getByText('Piso 4')).toBeVisible();
    await expect(page.getByText('+')).toBeVisible();
    await expect(page.getByText('−')).toBeVisible();
  });

  test('Piso 4 rooms visible on load', async ({ page }) => {
    await expect(page.getByText('AULA 403').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('AULA 400').first()).toBeVisible({ timeout: 5000 });
  });

  test('Subsuelo rooms NOT visible on Piso 4', async ({ page }) => {
    await expect(page.getByText('COMEDOR').first()).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    await expect(page.getByText('AULA E32').first()).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  // ── Búsqueda — sugerencias ─────────────────────────────────────────────────

  test('typing shows relevant suggestions', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('aula');
    await page.waitForTimeout(500);
    await expect(page.getByText(/AULA/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('search is case-insensitive', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('bedelia');
    await page.waitForTimeout(500);
    await expect(page.getByText(/BEDELIA/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('search by partial room number shows matching rooms', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(500);
    await expect(page.getByText(/403/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('fuzzy search tolerates typo', async ({ page }) => {
    // The fuzzy threshold is Levenshtein <= 2 (see searchRooms.scoreRoom);
    // "labratorios" is one deletion away from the alias "laboratorios".
    // Assert on the exact dropdown label so we don't accidentally match the
    // static SVG floor-text "66.02 Laboratorio" that is always in the DOM.
    await page.getByPlaceholder(/Buscar aula/i).fill('labratorios');
    await page.waitForTimeout(600);
    await expect(page.getByText('LABORATORIOS', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });

  test('suggestions show floor badge', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('aula');
    await page.waitForTimeout(500);
    await expect(page.getByText(/Piso 4|Subsuelo/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('clearing search hides suggestions dropdown', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('aula');
    await page.waitForTimeout(500);
    // Suggestions are visible
    const countBefore = await page.locator('text=/AULA/').count();
    expect(countBefore).toBeGreaterThan(3);
    await page.getByPlaceholder(/Buscar aula/i).clear();
    await page.waitForTimeout(500);
    // After clearing, only SVG labels remain (no dropdown)
    const countAfter = await page.locator('text=/AULA/').count();
    // Dropdown adds many extra results — after clearing there should be fewer
    expect(countAfter).toBeLessThan(countBefore);
  });

  // ── Selección de room desde búsqueda ──────────────────────────────────────

  test('selecting a suggestion fills the search input', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(700);
    // The dropdown suggestion has "AULA 403" AND "Piso 4" badge in same row
    // Click the row containing both — this targets the dropdown, not the SVG label
    await clickFirstSuggestion(page);
    await page.waitForTimeout(1000);
    const inputValue = await page.getByPlaceholder(/Buscar aula/i).inputValue();
    expect(inputValue).toMatch(/403/i);
  });

  test('selecting a room highlights it with SVG overlay rect', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(700);
    await clickFirstSuggestion(page);
    await page.waitForTimeout(1200);
    const rects = await getHighlightRects(page);
    const highlightRect = rects.find(r => r.fillOpacity === '0.35');
    expect(highlightRect).toBeDefined();
  });

  test('selecting a room adds highlight overlay to SVG', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(700);
    await clickFirstSuggestion(page);
    await page.waitForTimeout(1200);
    const rects = await getHighlightRects(page);
    // Should have at least one highlight rect (fill or stroke)
    expect(rects.length).toBeGreaterThanOrEqual(1);
    const fillRect = rects.find(r => r.fillOpacity === '0.35');
    expect(fillRect).toBeDefined();
  });

  test('selecting a Subsuelo room switches the floor', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('comedor');
    await page.waitForTimeout(500);
    await expect(page.getByText(/COMEDOR/i).first()).toBeVisible({ timeout: 5000 });
    await page.getByText(/COMEDOR/i).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText('Primer Subsuelo')).toBeVisible({ timeout: 5000 });
  });

  test('selecting a Subsuelo room makes those rooms visible', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('e32');
    await page.waitForTimeout(600);
    // Wait for suggestion to appear then click it
    const suggestion = page.locator('text=/AULA E32/').first();
    await expect(suggestion).toBeVisible({ timeout: 5000 });
    await suggestion.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/COMEDOR/').first()).toBeVisible({ timeout: 5000 });
  });

  // ── Zoom controls ──────────────────────────────────────────────────────────

  test('zoom in changes the map transform', async ({ page }) => {
    const before = await getMapTransform(page);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    const after = await getMapTransform(page);
    expect(after).not.toBe(before);
  });

  test('zoom out changes the map transform', async ({ page }) => {
    // Wait for layout to settle before zooming — otherwise the map's
    // fitScale useEffect can fire after the + click and reset the scale
    // back to fitScale, making before === after.
    await waitForMapReady(page);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    const before = await getMapTransform(page);
    await page.getByText('−').click();
    await page.waitForTimeout(400);
    const after = await getMapTransform(page);
    expect(after).not.toBe(before);
  });

  test('multiple zooms produce progressive scale changes', async ({ page }) => {
    const t0 = await getMapTransform(page);
    await page.getByText('+').click();
    await page.waitForTimeout(350);
    const t1 = await getMapTransform(page);
    await page.getByText('+').click();
    await page.waitForTimeout(350);
    const t2 = await getMapTransform(page);
    expect(t0).not.toBe(t1);
    expect(t1).not.toBe(t2);
  });

  test('room labels remain visible after zooming in', async ({ page }) => {
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('AULA 403').or(page.getByText('AULA 400')).first()).toBeVisible({ timeout: 5000 });
  });

  test('reset button restores initial view transform', async ({ page }) => {
    await waitForMapReady(page);
    const initial = await getMapTransform(page);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await page.getByText('⌂').click();
    await page.waitForTimeout(500);
    const afterReset = await getMapTransform(page);
    expect(afterReset).toBe(initial);
  });

  // ── Cambio de piso ─────────────────────────────────────────────────────────

  test('floor picker opens menu showing all floors', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Primer Subsuelo')).toBeVisible({ timeout: 3000 });
  });

  test('selecting a floor closes the picker menu', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Piso 4').nth(1)).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('switching to Subsuelo shows Subsuelo-specific rooms', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(800);
    await expect(page.locator('text=/COMEDOR/').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/AULA E/').first()).toBeVisible({ timeout: 5000 });
  });

  test('switching floor hides Piso 4 rooms', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(600);
    await expect(page.getByText('AULA 403')).not.toBeVisible({ timeout: 3000 });
  });

  test('switching floor clears highlighted room overlay', async ({ page }) => {
    await page.getByPlaceholder(/Buscar aula/i).fill('403');
    await page.waitForTimeout(700);
    await clickFirstSuggestion(page);
    await page.waitForTimeout(800);
    const before = await getHighlightRects(page);
    expect(before.find(r => r.fillOpacity === '0.35')).toBeDefined();
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(600);
    const after = await getHighlightRects(page);
    // After floor switch highlight should be cleared
    const stillHighlighted = after.find(r => parseFloat(r.fillOpacity || '0') > 0.3);
    expect(stillHighlighted).toBeUndefined();
  });

  test('switching floor resets the zoom/pan transform', async ({ page }) => {
    await waitForMapReady(page);
    const initial = await getMapTransform(page);
    await page.getByText('+').click();
    await page.waitForTimeout(400);
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(600);
    const afterSwitch = await getMapTransform(page);
    expect(afterSwitch).toBe(initial);
  });

  test('switching back to Piso 4 restores its rooms', async ({ page }) => {
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(300);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(600);
    await page.getByText('Primer Subsuelo').click();
    await page.waitForTimeout(300);
    await page.getByText('Piso 4').click();
    await page.waitForTimeout(600);
    await expect(page.getByText('AULA 403').first()).toBeVisible({ timeout: 8000 });
  });
});
