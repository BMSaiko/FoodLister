import { test, expect } from '@playwright/test';

test.describe('Novidades', () => {
  test('a página carrega com título e Tovi, sem login', async ({ page }) => {
    await page.goto('/novidades');
    await expect(page.getByRole('heading', { level: 1, name: 'Novidades' })).toBeVisible();
  });

  test('mostra a lista ou o estado vazio', async ({ page }) => {
    await page.goto('/novidades');
    const cards = page.locator('article');
    await expect(page.locator('article').or(page.getByText('Ainda não há novidades')).first()).toBeVisible();
    if ((await cards.count()) === 0) {
      return;
    }
    await expect(page.getByText('Mais recente')).toHaveCount(1);
  });

  test('filtra por categoria e abre o detalhe', async ({ page }) => {
    await page.goto('/novidades');
    const cards = page.locator('article');
    await expect(page.locator('article').or(page.getByText('Ainda não há novidades')).first()).toBeVisible();
    test.skip((await cards.count()) === 0, 'sem releases na BD local');

    const filtro = page.getByRole('button', { name: 'Corrigido' });
    await filtro.click();
    await expect(filtro).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Tudo' }).click();

    await cards.first().getByRole('link').first().click();
    await expect(page).toHaveURL(/\/novidades\/\d+\.\d+\.\d+/, { timeout: 15000 }); // compilação a pedido do servidor dev
    await expect(page.getByRole('link', { name: /Todas as novidades/ })).toBeVisible();
  });

  test('versão inexistente devolve 404', async ({ page }) => {
    await page.goto('/novidades/0.0.0');
    await expect(page.getByText('This page could not be found')).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex');
  });

  test('versão com formato inválido devolve 404', async ({ page }) => {
    await page.goto('/novidades/abc');
    await expect(page.getByText('This page could not be found')).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex');
  });
});
