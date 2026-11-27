import { compareReleasesDesc, listReleases } from '@/libs/releases/server';

const row = (version: string, released_at: string) => ({
  version,
  released_at,
  title: `Versão ${version}`,
  items: { novo: [], melhorado: [], corrigido: [] },
});

const client = (data: unknown[]) => {
  const range = jest.fn(() => Promise.resolve({ data, error: null }));
  const order = jest.fn(() => ({ order, range }));
  const select = jest.fn(() => ({ order }));
  return { c: { from: jest.fn(() => ({ select })) } as never, order };
};

describe('ordem das releases', () => {
  it('mesmo dia: 0.2.1 antes de 0.2.0', async () => {
    const { c } = client([row('0.2.0', '2026-11-27'), row('0.2.1', '2026-11-27')]);
    const page = await listReleases(c, 1, 10);
    expect(page.releases.map((r) => r.version)).toEqual(['0.2.1', '0.2.0']);
  });

  it('semver numérico: 0.10.0 antes de 0.9.0', async () => {
    const { c } = client([row('0.9.0', '2026-11-27'), row('0.10.0', '2026-11-27')]);
    const page = await listReleases(c, 1, 10);
    expect(page.releases.map((r) => r.version)).toEqual(['0.10.0', '0.9.0']);
  });

  it('data mais recente ganha à versão', async () => {
    const { c } = client([row('0.3.0', '2026-11-20'), row('0.2.0', '2026-11-27')]);
    const page = await listReleases(c, 1, 10);
    expect(page.releases.map((r) => r.version)).toEqual(['0.2.0', '0.3.0']);
  });

  it('desempata na query por versão', async () => {
    const { c, order } = client([]);
    await listReleases(c, 1, 10);
    expect(order).toHaveBeenCalledWith('version', { ascending: false });
  });

  it('compareReleasesDesc ordena por data e depois semver', () => {
    const list = [row('0.2.0', '2026-11-27'), row('0.2.1', '2026-11-27'), row('0.1.0', '2026-11-20')];
    list.sort(compareReleasesDesc);
    expect(list.map((r) => r.version)).toEqual(['0.2.1', '0.2.0', '0.1.0']);
  });
});
