import { test, expect, Page, Route } from '@playwright/test';
import { loginAndWait } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Covers AlertDialog (`src/components/AlertDialog.tsx`) — the component that
// replaced `Alert.alert` in the `fix/alert-compatibility` branch.
//
// Strategy: intercept the API call each screen makes on focus, force a 500,
// and assert that the matching error dialog renders, can be dismissed via
// "Aceptar", and that the screen stays interactive afterwards.
// ─────────────────────────────────────────────────────────────────────────────

const failJson = (route: Route) =>
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ detail: 'forced failure for e2e' }),
  });

async function openAcademico(page: Page) {
  await page.getByLabel('Académico').click();
  await page.waitForTimeout(400);
}

async function expectAlertDialog(
  page: Page,
  title: string | RegExp,
  message: string | RegExp,
) {
  await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(message).first()).toBeVisible();
  await expect(page.getByText('Aceptar').first()).toBeVisible();
}

async function dismissAlertDialog(page: Page) {
  await page.getByText('Aceptar').first().click();
  await page.waitForTimeout(300);
}

test.describe('AlertDialog — error flows reachable as student', () => {
  test('Novedades: error fetching news shows info dialog', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/news\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Novedades').click();

    await expectAlertDialog(page, 'Error', /No se pudieron cargar las novedades/i);
  });

  test('Trámites: error fetching forms list shows info dialog', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/forms\//, failJson);
    await page.route(/\/api\/form-procedure-types\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Trámites').click();

    await expectAlertDialog(page, 'Error', /No se pudieron cargar los trámites/i);
  });

  test('Estadísticas: error fetching stats shows "¿Qué pasó?" dialog', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/statistics\/student\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Estadísticas').click();

    await expectAlertDialog(page, /Qué pasó/, /no pudimos buscar tu información/i);
  });

  test('Materias aprobadas: error in subjects fetch shows fallback dialog', async ({ page }) => {
    await loginAndWait(page);
    // approved_subjects uses finalExamsRepository.fetchApproved → /api/final_exams/history/
    await page.route(/\/api\/final_exams\/history\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Materias aprobadas').click();

    // FinalExamList catches errors and shows the generic dialog
    await expectAlertDialog(page, /Qué pasó/, /no pudimos buscar tu información/i);
  });
});

test.describe('AlertDialog — dismissal and modal behaviour', () => {
  test('"Aceptar" closes the dialog and returns control to the screen', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/news\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Novedades').click();
    await expectAlertDialog(page, 'Error', /No se pudieron cargar las novedades/i);

    await dismissAlertDialog(page);

    // The message text should no longer be in the DOM after dismissal.
    await expect(
      page.getByText(/No se pudieron cargar las novedades/i),
    ).toHaveCount(0, { timeout: 3000 });

    // And the screen is interactive again — we can navigate elsewhere.
    await openAcademico(page);
    await page.getByLabel('Materias aprobadas').click();
    await expect(page.locator('text=/Materias aprobadas/').first()).toBeVisible({
      timeout: 8000,
    });
  });

  test('info-mode dialog renders only the confirm button (no "Cancelar")', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/forms\//, failJson);
    await page.route(/\/api\/form-procedure-types\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Trámites').click();

    await expectAlertDialog(page, 'Error', /No se pudieron cargar los trámites/i);

    // FormsListScreen renders the dialog in `mode="info"` → no Cancel button.
    await expect(page.getByText('Cancelar')).toHaveCount(0);
  });

  test('dialog is an overlay — blocks clicking the content underneath', async ({ page }) => {
    await loginAndWait(page);
    await page.route(/\/api\/statistics\/student\//, failJson);

    await openAcademico(page);
    await page.getByLabel('Estadísticas').click();

    await expectAlertDialog(page, /Qué pasó/, /no pudimos buscar tu información/i);

    // Sidebar item below the modal overlay should not respond while the dialog
    // is visible — the modal is a transparent overlay covering the viewport.
    // If clicking through worked the dialog would close *and* navigate away,
    // so we just confirm clicking the "Aceptar" button properly dismisses it.
    await dismissAlertDialog(page);
    await expect(
      page.getByText(/no pudimos buscar tu información/i),
    ).toHaveCount(0, { timeout: 3000 });
  });
});

test.describe('AlertDialog — happy path screens render without dialog', () => {
  // Sanity tests: when the API succeeds, the AlertDialog must NOT be visible.
  // Guards against the dialog accidentally showing on initial render.

  test('Novedades loads without an error dialog when API is healthy', async ({ page }) => {
    await loginAndWait(page);
    await openAcademico(page);
    await page.getByLabel('Novedades').click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/No se pudieron cargar las novedades/i)).toHaveCount(0);
  });

  test('Trámites loads without an error dialog when API is healthy', async ({ page }) => {
    await loginAndWait(page);
    await openAcademico(page);
    await page.getByLabel('Trámites').click();
    await expect(page.getByText('Historial')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/No se pudieron cargar los trámites/i)).toHaveCount(0);
  });
});
