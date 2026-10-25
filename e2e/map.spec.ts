import { test, expect, type Page } from '@playwright/test';

function makeRestaurants(n: number, withoutCoords = 0) {
  return Array.from({ length: n }, (_, i) => ({
    id: `r-${i}`,
    name: `Restaurante ${i}`,
    location: `Rua ${i}, Lisboa`,
    latitude: i < withoutCoords ? null : 38.6 + (i % 50) * 0.01,
    longitude: i < withoutCoords ? null : -9.4 + Math.floor(i / 50 % 50) * 0.01,
    rating: (i % 5) + 1,
    review_count: i % 7,
    cuisine_types: [],
    features: [],
    dietary_options: [],
    images: [],
  }));
}

async function mockApi(page: Page, restaurants: unknown[], status = 200) {
  await page.route('**/api/restaurants?*', (route) =>
    status === 200
      ? route.fulfill({ json: { restaurants } })
      : route.fulfill({ status, body: 'erro' })
  );
}

test.describe('Mapa /map', () => {
  test('mostra lista com contagem e chip de restaurantes sem localização', async ({ page }) => {
    await mockApi(page, makeRestaurants(40, 3));
    await page.goto('/map');
    await expect(page.getByLabel('Pesquisar restaurante')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]').first()).toContainText(/37/);
    await page.getByRole('button', { name: /3 sem localiza/i }).click();
    await expect(page.getByRole('link', { name: /ver lista completa/i })).toHaveAttribute('href', '/restaurants/no-coords');
  });

  test('"/" foca a pesquisa e a pesquisa filtra a lista', async ({ page }) => {
    await mockApi(page, makeRestaurants(40));
    await page.goto('/map');
    await page.locator('button[data-item]').first().waitFor();
    await page.keyboard.press('/');
    const search = page.getByLabel('Pesquisar restaurante');
    await expect(search).toBeFocused();
    await search.fill('Restaurante 7');
    await expect(page.locator('button[data-item]')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(search).not.toBeFocused();
  });

  test('setas navegam a lista', async ({ page }) => {
    await mockApi(page, makeRestaurants(10));
    await page.goto('/map');
    const items = page.locator('button[data-item]');
    await items.first().waitFor();
    await items.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(items.first()).toBeFocused();
  });

  test('erro da API mostra «Tentar novamente»', async ({ page }) => {
    await mockApi(page, [], 500);
    await page.goto('/map');
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar novamente' }).first()).toBeVisible();
  });

  test('carga: 2000 pins renderizam e a pesquisa responde em tempo útil', async ({ page }) => {
    await mockApi(page, makeRestaurants(2000));
    const t0 = Date.now();
    await page.goto('/map');
    await page.locator('.leaflet-container').waitFor();
    await page.locator('button[data-item]').first().waitFor();
    const loadMs = Date.now() - t0;
    const search = page.getByLabel('Pesquisar restaurante');
    const t1 = Date.now();
    await search.fill('Restaurante 1999');
    await expect(page.locator('button[data-item]')).toHaveCount(1);
    const searchMs = Date.now() - t1;
    console.log(`[carga 2000] carregamento=${loadMs}ms pesquisa=${searchMs}ms`);
    expect(loadMs).toBeLessThan(15000);
    expect(searchMs).toBeLessThan(3000);
  });
});
