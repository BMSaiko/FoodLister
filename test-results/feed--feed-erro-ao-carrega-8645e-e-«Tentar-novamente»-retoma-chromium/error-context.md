# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feed.spec.ts >> /feed >> erro ao carregar mais: mostra aviso, não repete em ciclo e «Tentar novamente» retoma
- Location: e2e\feed.spec.ts:52:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('alert')
Expected substring: "API 500"
Error: strict mode violation: getByRole('alert') resolved to 2 elements:
    1) <div role="alert" class="mt-4 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-center text-sm text-[var(--error)]">…</div> aka getByText('Erro ao carregar atividade:')
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div> aka locator('[id="__next-route-announcer__"]')

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('alert')
    4 × locator resolved to <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div>
      - unexpected value ""

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "FoodLister, início" [ref=e5]:
          - /url: /
          - img "FoodLister" [ref=e6]
        - navigation "Principal" [ref=e7]:
          - link "Restaurantes" [ref=e8]:
            - /url: /restaurants
          - link "Mapa" [ref=e9]:
            - /url: /map
          - link "Listas" [ref=e10]:
            - /url: /lists
        - button "Pesquisar" [ref=e11]:
          - img [ref=e12]
          - generic [ref=e15]: Pesquisar
          - generic [ref=e16]: Ctrl K
        - generic [ref=e17]:
          - button "Language" [ref=e19]:
            - img [ref=e20]
            - generic [ref=e23]: PT
          - link "Entrar" [ref=e24]:
            - /url: /auth/signin
    - generic [ref=e25]:
      - generic [ref=e26]:
        - img [ref=e27]
        - generic [ref=e29]:
          - heading "Feed" [level=1] [ref=e30]
          - paragraph [ref=e31]: O que anda a acontecer à tua volta
      - generic [ref=e32]:
        - article [ref=e33]:
          - generic [ref=e34]:
            - img [ref=e36]
            - generic [ref=e38]:
              - paragraph [ref=e39]: Ator 0 fez um review em Restaurante Teste
              - time [ref=e40]: Agora mesmo
            - generic [ref=e41]:
              - img [ref=e42]
              - generic [ref=e44]: Review
          - 'link "Ator 0: abrir review" [ref=e46]':
            - /url: /restaurants
        - article [ref=e47]:
          - generic [ref=e48]:
            - link "Perfil de Ator 1" [ref=e49]:
              - /url: /users/FL1
              - img [ref=e50]
            - generic [ref=e52]:
              - paragraph [ref=e53]: Ator 1 criou a lista Brunch
              - time [ref=e54]: há 1h
            - generic [ref=e55]:
              - img [ref=e56]
              - generic [ref=e58]: Nova lista
          - 'link "Ator 1: abrir nova lista" [ref=e61]':
            - /url: /restaurants
        - article [ref=e62]:
          - generic [ref=e63]:
            - img [ref=e65]
            - generic [ref=e67]:
              - paragraph [ref=e68]: Ator 2 começou a seguir Ana
              - time [ref=e69]: há 2h
            - generic [ref=e70]:
              - img [ref=e71]
              - generic [ref=e73]: Novo seguidor
          - 'link "Ator 2: abrir novo seguidor" [ref=e74]':
            - /url: /users/x
        - article [ref=e75]:
          - generic [ref=e76]:
            - link "Perfil de Ator 3" [ref=e77]:
              - /url: /users/FL3
              - img [ref=e78]
            - generic [ref=e80]:
              - paragraph [ref=e81]: Ator 3 fez um review em Restaurante Teste
              - time [ref=e82]: há 3h
            - generic [ref=e83]:
              - img [ref=e84]
              - generic [ref=e86]: Review
          - 'link "Ator 3: abrir review" [ref=e88]':
            - /url: /restaurants
        - article [ref=e89]:
          - generic [ref=e90]:
            - img [ref=e92]
            - generic [ref=e94]:
              - paragraph [ref=e95]: Ator 4 criou a lista Brunch
              - time [ref=e96]: há 4h
            - generic [ref=e97]:
              - img [ref=e98]
              - generic [ref=e100]: Nova lista
          - 'link "Ator 4: abrir nova lista" [ref=e103]':
            - /url: /restaurants
        - article [ref=e104]:
          - generic [ref=e105]:
            - link "Perfil de Ator 5" [ref=e106]:
              - /url: /users/FL5
              - img [ref=e107]
            - generic [ref=e109]:
              - paragraph [ref=e110]: Ator 5 começou a seguir Ana
              - time [ref=e111]: há 5h
            - generic [ref=e112]:
              - img [ref=e113]
              - generic [ref=e115]: Novo seguidor
          - 'link "Ator 5: abrir novo seguidor" [ref=e116]':
            - /url: /users/x
        - article [ref=e117]:
          - generic [ref=e118]:
            - img [ref=e120]
            - generic [ref=e122]:
              - paragraph [ref=e123]: Ator 6 fez um review em Restaurante Teste
              - time [ref=e124]: há 6h
            - generic [ref=e125]:
              - img [ref=e126]
              - generic [ref=e128]: Review
          - 'link "Ator 6: abrir review" [ref=e130]':
            - /url: /restaurants
        - article [ref=e131]:
          - generic [ref=e132]:
            - link "Perfil de Ator 7" [ref=e133]:
              - /url: /users/FL7
              - img [ref=e134]
            - generic [ref=e136]:
              - paragraph [ref=e137]: Ator 7 criou a lista Brunch
              - time [ref=e138]: há 7h
            - generic [ref=e139]:
              - img [ref=e140]
              - generic [ref=e142]: Nova lista
          - 'link "Ator 7: abrir nova lista" [ref=e145]':
            - /url: /restaurants
        - article [ref=e146]:
          - generic [ref=e147]:
            - img [ref=e149]
            - generic [ref=e151]:
              - paragraph [ref=e152]: Ator 8 começou a seguir Ana
              - time [ref=e153]: há 8h
            - generic [ref=e154]:
              - img [ref=e155]
              - generic [ref=e157]: Novo seguidor
          - 'link "Ator 8: abrir novo seguidor" [ref=e158]':
            - /url: /users/x
        - article [ref=e159]:
          - generic [ref=e160]:
            - link "Perfil de Ator 9" [ref=e161]:
              - /url: /users/FL9
              - img [ref=e162]
            - generic [ref=e164]:
              - paragraph [ref=e165]: Ator 9 fez um review em Restaurante Teste
              - time [ref=e166]: há 9h
            - generic [ref=e167]:
              - img [ref=e168]
              - generic [ref=e170]: Review
          - 'link "Ator 9: abrir review" [ref=e172]':
            - /url: /restaurants
        - article [ref=e173]:
          - generic [ref=e174]:
            - img [ref=e176]
            - generic [ref=e178]:
              - paragraph [ref=e179]: Ator 10 criou a lista Brunch
              - time [ref=e180]: há 10h
            - generic [ref=e181]:
              - img [ref=e182]
              - generic [ref=e184]: Nova lista
          - 'link "Ator 10: abrir nova lista" [ref=e187]':
            - /url: /restaurants
        - article [ref=e188]:
          - generic [ref=e189]:
            - link "Perfil de Ator 11" [ref=e190]:
              - /url: /users/FL11
              - img [ref=e191]
            - generic [ref=e193]:
              - paragraph [ref=e194]: Ator 11 começou a seguir Ana
              - time [ref=e195]: há 11h
            - generic [ref=e196]:
              - img [ref=e197]
              - generic [ref=e199]: Novo seguidor
          - 'link "Ator 11: abrir novo seguidor" [ref=e200]':
            - /url: /users/x
        - article [ref=e201]:
          - generic [ref=e202]:
            - img [ref=e204]
            - generic [ref=e206]:
              - paragraph [ref=e207]: Ator 12 fez um review em Restaurante Teste
              - time [ref=e208]: há 12h
            - generic [ref=e209]:
              - img [ref=e210]
              - generic [ref=e212]: Review
          - 'link "Ator 12: abrir review" [ref=e214]':
            - /url: /restaurants
        - article [ref=e215]:
          - generic [ref=e216]:
            - link "Perfil de Ator 13" [ref=e217]:
              - /url: /users/FL13
              - img [ref=e218]
            - generic [ref=e220]:
              - paragraph [ref=e221]: Ator 13 criou a lista Brunch
              - time [ref=e222]: há 13h
            - generic [ref=e223]:
              - img [ref=e224]
              - generic [ref=e226]: Nova lista
          - 'link "Ator 13: abrir nova lista" [ref=e229]':
            - /url: /restaurants
        - article [ref=e230]:
          - generic [ref=e231]:
            - img [ref=e233]
            - generic [ref=e235]:
              - paragraph [ref=e236]: Ator 14 começou a seguir Ana
              - time [ref=e237]: há 14h
            - generic [ref=e238]:
              - img [ref=e239]
              - generic [ref=e241]: Novo seguidor
          - 'link "Ator 14: abrir novo seguidor" [ref=e242]':
            - /url: /users/x
      - alert [ref=e244]:
        - text: "Erro ao carregar atividade: API 500"
        - button "Tentar novamente" [ref=e245]
  - region "Notifications Alt+T"
  - button "Open Next.js Dev Tools" [ref=e251] [cursor=pointer]:
    - img [ref=e252]
  - alert [ref=e255]
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | 
  3  | // API mockada: não depende de sessão nem de dados; testa a UI do /feed (cartões + scroll infinito).
  4  | const IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  5  | 
  6  | function item(n: number, type: 'review' | 'list' | 'follow') {
  7  |   const text = type === 'review' ? 'fez um review em Restaurante Teste' : type === 'list' ? 'criou a lista Brunch' : 'começou a seguir Ana';
  8  |   return {
  9  |     id: `${type}-${n}`, type,
  10 |     actor: { name: `Ator ${n}`, avatar: null, user_id_code: n % 2 ? `FL${n}` : null },
  11 |     text, link: type === 'follow' ? '/users/x' : '/restaurants', createdAt: new Date(Date.now() - n * 3600_000).toISOString(),
  12 |     images: type === 'review' ? [IMG] : type === 'list' ? [IMG, IMG, IMG] : [],
  13 |   };
  14 | }
  15 | const types = ['review', 'list', 'follow'] as const;
  16 | const pageData = (p: number) => Array.from({ length: 15 }, (_, i) => item((p - 1) * 15 + i, types[i % 3]));
  17 | 
  18 | async function mockFeed(page: Page, opts: { failPage2Once?: boolean } = {}) {
  19 |   let failed = false;
  20 |   await page.route('**/api/feed?**', async (route) => {
  21 |     const p = Number(new URL(route.request().url()).searchParams.get('page'));
  22 |     if (opts.failPage2Once && p === 2 && !failed) { failed = true; return route.fulfill({ status: 500, body: '{}' }); }
  23 |     await new Promise((r) => setTimeout(r, 250));
  24 |     await route.fulfill({ json: { data: pageData(p), total: 45, page: p, limit: 15, hasMore: p < 3 } });
  25 |   });
  26 | }
  27 | 
  28 | test.describe('/feed', () => {
  29 |   test('scroll infinito carrega as 3 páginas sem botão e mostra o fim', async ({ page }) => {
  30 |     await mockFeed(page);
  31 |     await page.goto('/feed');
  32 |     const cards = page.locator('article');
  33 |     await expect(cards.first()).toBeVisible({ timeout: 30000 });
  34 |     await expect(page.getByRole('button', { name: /carregar mais/i })).toHaveCount(0);
  35 |     for (let i = 0; i < 6 && (await cards.count()) < 45; i++) {
  36 |       await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  37 |       await page.waitForTimeout(600);
  38 |     }
  39 |     await expect(cards).toHaveCount(45);
  40 |     await expect(page.getByText(/Chegaste ao fim/)).toBeVisible();
  41 |   });
  42 | 
  43 |   test('cartão tem link ao destino e avatar com link ao perfil (sem <a> aninhado)', async ({ page }) => {
  44 |     await mockFeed(page);
  45 |     await page.goto('/feed');
  46 |     await expect(page.locator('article').first()).toBeVisible({ timeout: 30000 });
  47 |     expect(await page.locator('a a').count()).toBe(0);
  48 |     await expect(page.locator('article a[href^="/users/FL"]').first()).toBeVisible();
  49 |     await expect(page.locator('article a[href="/restaurants"]').first()).toBeAttached();
  50 |   });
  51 | 
  52 |   test('erro ao carregar mais: mostra aviso, não repete em ciclo e «Tentar novamente» retoma', async ({ page }) => {
  53 |     await mockFeed(page, { failPage2Once: true });
  54 |     await page.goto('/feed');
  55 |     await expect(page.locator('article').first()).toBeVisible({ timeout: 30000 });
  56 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
> 57 |     await expect(page.getByRole('alert')).toContainText('API 500');
     |                                           ^ Error: expect(locator).toContainText(expected) failed
  58 |     await expect(page.locator('article')).toHaveCount(15);
  59 |     await page.getByRole('button', { name: /tentar novamente/i }).click();
  60 |     await expect(page.locator('article')).toHaveCount(30, { timeout: 15000 });
  61 |   });
  62 | 
  63 |   test('vazio e erro total', async ({ page }) => {
  64 |     await page.route('**/api/feed?**', (r) => r.fulfill({ json: { data: [], total: 0, page: 1, limit: 15, hasMore: false } }));
  65 |     await page.goto('/feed');
  66 |     await expect(page.getByText('Ainda sem atividade')).toBeVisible({ timeout: 30000 });
  67 |     await page.unroute('**/api/feed?**');
  68 |     await page.route('**/api/feed?**', (r) => r.fulfill({ status: 401, body: '{}' }));
  69 |     await page.goto('/feed');
  70 |     await expect(page.getByText('Não conseguimos carregar o feed')).toBeVisible({ timeout: 30000 });
  71 |   });
  72 | });
  73 | 
```