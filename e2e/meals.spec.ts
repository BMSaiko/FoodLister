import { test, expect } from './base';

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.describe('Refeições', () => {
  test.skip(!EMAIL || !PASSWORD, 'definir E2E_EMAIL e E2E_PASSWORD (conta de dev com refeições)');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(EMAIL!);
    await page.locator('#password').fill(PASSWORD!);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth/signin'), { timeout: 30000 });
  });

  test('agenda agrupada, filtro e link para o detalhe', async ({ page }, info) => {
    await page.goto('/meals');
    await expect(page.getByRole('heading', { level: 1, name: 'Refeições' })).toBeVisible({ timeout: 30000 });
    const rows = page.locator('a[href^="/meals/"]');
    await expect(rows.first()).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { level: 2, name: 'Passadas' })).toBeVisible();
    await page.screenshot({ path: `docs/mockups/refeicoes/proofs/impl-${info.project.name}.png`, fullPage: true });

    const todas = await rows.count();
    const participo = page.getByRole('button', { name: 'Participo' });
    await participo.click();
    await expect(participo).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Nenhuma refeição nesta vista.').or(rows.first())).toBeVisible();
    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await expect(rows).toHaveCount(todas);

    await rows.first().click();
    await expect(page).toHaveURL(/\/meals\/[0-9a-f-]{36}/, { timeout: 30000 });
  });

  test('estado de erro com «Tentar de novo»', async ({ page }) => {
    let falhar = true;
    await page.route('**/api/meals/scheduled*', (r) =>
      falhar ? r.fulfill({ status: 500, json: { error: 'x' } }) : r.continue(),
    );
    await page.goto('/meals');
    const retry = page.getByRole('button', { name: 'Tentar de novo' });
    await expect(page.getByText('Não foi possível carregar as refeições')).toBeVisible({ timeout: 30000 });
    await expect(retry).toBeVisible();
    falhar = false;
    await retry.click();
    await expect(page.locator('a[href^="/meals/"]').first()).toBeVisible({ timeout: 30000 });
  });
});
