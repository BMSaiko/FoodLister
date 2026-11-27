import { test, expect } from './base';

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.describe('Detalhe da refeição', () => {
  test.skip(!EMAIL || !PASSWORD, 'definir E2E_EMAIL e E2E_PASSWORD (conta de dev com refeições)');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(EMAIL!);
    await page.locator('#password').fill(PASSWORD!);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth/signin'), { timeout: 30000 });
  });

  async function abrirPrimeira(page: import('@playwright/test').Page) {
    await page.goto('/meals');
    const rows = page.locator('a[href^="/meals/"]');
    await expect(rows.first()).toBeVisible({ timeout: 30000 });
    await rows.first().click();
    await expect(page).toHaveURL(/\/meals\/[0-9a-f-]{36}/, { timeout: 30000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 });
  }

  test('ficha com dados, ações de calendário e RSVP', async ({ page }, info) => {
    await abrirPrimeira(page);
    await expect(page.getByText('Data', { exact: true })).toBeVisible();
    await expect(page.getByText('Duração', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Organizador' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download \.ics/ })).toBeVisible();
    await page.screenshot({ path: `docs/mockups/refeicoes/proofs/impl-detalhe-${info.project.name}.png`, fullPage: true });
  });

  test('eliminar abre confirmação e cancela sem apagar', async ({ page }) => {
    await abrirPrimeira(page);
    const eliminar = page.getByRole('button', { name: 'Eliminar refeição' });
    if (!(await eliminar.isVisible())) test.skip(true, 'refeição aberta não é do utilizador');
    await eliminar.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Eliminar refeição?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).toBeHidden();
  });

  test('refeição inexistente mostra «não encontrada»', async ({ page }) => {
    await page.goto('/meals/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText('Refeição não encontrada')).toBeVisible({ timeout: 30000 });
  });
});
