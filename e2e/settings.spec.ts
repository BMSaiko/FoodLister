import { test, expect } from '@playwright/test';

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe('Definições (autenticado)', () => {
  test.skip(!email || !password, 'E2E_ADMIN_EMAIL/PASSWORD não definidos');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.locator('input[type="email"], input[name="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page.getByRole('button', { name: /login|entrar|sign in|submit/i }).first().click();
    await page.waitForURL((u) => !u.pathname.includes('/auth/'), { timeout: 30000 });
    await page.goto('/users/settings');
  });

  test('carrega o formulário com os dados do utilizador', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Definições' })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('guardar mostra um só toast e não desmonta o formulário', async ({ page }) => {
    const bio = page.locator('textarea').first();
    await expect(bio).toBeVisible({ timeout: 30000 });
    const original = await bio.inputValue();
    try {
      await bio.fill('e2e definições');
      await page.getByRole('button', { name: /guardar/i }).first().click();
      await expect(page.locator('.Toastify__toast')).toHaveCount(1, { timeout: 15000 });
      await expect(page.locator('.Toastify__toast')).toContainText(/atualizado/i);
      await expect(bio).toBeVisible();
      await expect(bio).toHaveValue('e2e definições');
    } finally {
      await bio.fill(original);
      await page.getByRole('button', { name: /guardar/i }).first().click();
      await expect(page.locator('.Toastify__toast').first()).toBeVisible({ timeout: 15000 });
    }
  });
});
