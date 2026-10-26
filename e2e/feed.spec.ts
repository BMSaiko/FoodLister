import { test, expect, Page } from '@playwright/test';

// API mockada: não depende de sessão nem de dados; testa a UI do /feed (cartões + scroll infinito).
const IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function item(n: number, type: 'review' | 'list' | 'follow') {
  const text = type === 'review' ? 'fez um review em Restaurante Teste' : type === 'list' ? 'criou a lista Brunch' : 'começou a seguir Ana';
  return {
    id: `${type}-${n}`, type,
    actor: { name: `Ator ${n}`, avatar: null, user_id_code: n % 2 ? `FL${n}` : null },
    text, link: type === 'follow' ? '/users/x' : '/restaurants', createdAt: new Date(Date.now() - n * 3600_000).toISOString(),
    images: type === 'review' ? [IMG] : type === 'list' ? [IMG, IMG, IMG] : [],
  };
}
const types = ['review', 'list', 'follow'] as const;
const pageData = (p: number) => Array.from({ length: 15 }, (_, i) => item((p - 1) * 15 + i, types[i % 3]));

async function mockFeed(page: Page, opts: { failPage2Once?: boolean } = {}) {
  let failed = false;
  await page.route('**/api/feed?**', async (route) => {
    const p = Number(new URL(route.request().url()).searchParams.get('page'));
    if (opts.failPage2Once && p === 2 && !failed) { failed = true; return route.fulfill({ status: 500, body: '{}' }); }
    await new Promise((r) => setTimeout(r, 250));
    await route.fulfill({ json: { data: pageData(p), total: 45, page: p, limit: 15, hasMore: p < 3 } });
  });
}

test.describe('/feed', () => {
  test('scroll infinito carrega as 3 páginas sem botão e mostra o fim', async ({ page }) => {
    await mockFeed(page);
    await page.goto('/feed');
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /carregar mais/i })).toHaveCount(0);
    for (let i = 0; i < 6 && (await cards.count()) < 45; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(600);
    }
    await expect(cards).toHaveCount(45);
    await expect(page.getByText(/Chegaste ao fim/)).toBeVisible();
  });

  test('cartão tem link ao destino e avatar com link ao perfil (sem <a> aninhado)', async ({ page }) => {
    await mockFeed(page);
    await page.goto('/feed');
    await expect(page.locator('article').first()).toBeVisible({ timeout: 30000 });
    expect(await page.locator('a a').count()).toBe(0);
    await expect(page.locator('article a[href^="/users/FL"]').first()).toBeVisible();
    await expect(page.locator('article a[href="/restaurants"]').first()).toBeAttached();
  });

  test('erro ao carregar mais: mostra aviso, não repete em ciclo e «Tentar novamente» retoma', async ({ page }) => {
    await mockFeed(page, { failPage2Once: true });
    await page.goto('/feed');
    await expect(page.locator('article').first()).toBeVisible({ timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('alert')).toContainText('API 500');
    await expect(page.locator('article')).toHaveCount(15);
    await page.getByRole('button', { name: /tentar novamente/i }).click();
    await expect(page.locator('article')).toHaveCount(30, { timeout: 15000 });
  });

  test('vazio e erro total', async ({ page }) => {
    await page.route('**/api/feed?**', (r) => r.fulfill({ json: { data: [], total: 0, page: 1, limit: 15, hasMore: false } }));
    await page.goto('/feed');
    await expect(page.getByText('Ainda sem atividade')).toBeVisible({ timeout: 30000 });
    await page.unroute('**/api/feed?**');
    await page.route('**/api/feed?**', (r) => r.fulfill({ status: 401, body: '{}' }));
    await page.goto('/feed');
    await expect(page.getByText('Não conseguimos carregar o feed')).toBeVisible({ timeout: 30000 });
  });
});
