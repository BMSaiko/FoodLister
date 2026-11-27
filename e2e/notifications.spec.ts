import { test, expect } from './base';

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe('Notificações (autenticado)', () => {
  test.skip(!email || !password, 'E2E_ADMIN_EMAIL/PASSWORD não definidos');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.locator('input[type="email"], input[name="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page.getByRole('button', { name: /login|entrar|sign in|submit/i }).first().click();
    await page.waitForURL((u) => !u.pathname.includes('/auth/'), { timeout: 30000 });
    await page.goto('/notifications');
  });

  test('mostra título, filtros por grupo e atalho para preferências', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Notificações' })).toBeVisible({ timeout: 30000 });
    for (const nome of ['Todas', 'Não lidas', 'Refeições', 'Social', 'Listas', 'Sistema']) {
      await expect(page.getByRole('button', { name: new RegExp(`^${nome}`) })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Preferências de notificações' }).first()).toHaveAttribute('href', '/users/settings/notifications');
  });

  test('filtro ativo fica pressionado e sem overflow horizontal', async ({ page }) => {
    const social = page.getByRole('button', { name: /^Social/ });
    await social.click();
    await expect(social).toHaveAttribute('aria-pressed', 'true');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test('menu «⋯» de cada item oferece apagar', async ({ page }) => {
    const menu = page.getByRole('button', { name: 'Ações da notificação' }).first();
    test.skip((await menu.count()) === 0, 'sem notificações na BD local');
    await menu.click();
    await expect(page.getByRole('menuitem', { name: 'Apagar notificação' })).toBeVisible();
  });
});
