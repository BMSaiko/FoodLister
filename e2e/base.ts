import { test as base, expect } from '@playwright/test';

/**
 * `test` com o aviso «Há novidades» desligado: quando a BD tem releases, o modal
 * rouba foco e cliques a todos os specs. Só e2e/novidades.spec.ts usa o `test` cru.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route('**/rest/v1/release_notes*', (route) => route.fulfill({ status: 406, json: {} }));
    await use(context);
  },
});

export { expect };
