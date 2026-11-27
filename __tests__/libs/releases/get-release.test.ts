import { getRelease } from '@/libs/releases/server';

const client = (result: { data: unknown; error: unknown }) => {
  const eq = jest.fn(() => ({ maybeSingle: () => Promise.resolve(result) }));
  const select = jest.fn(() => ({ eq }));
  return { c: { from: jest.fn(() => ({ select })) } as never, eq };
};

describe('getRelease', () => {
  it('devolve a nota mapeada', async () => {
    const { c, eq } = client({
      data: { version: '1.2.0', released_at: '2026-11-20', title: 'Versão 1.2.0', items: { novo: ['A'], melhorado: [], corrigido: [] } },
      error: null,
    });
    const note = await getRelease(c, '1.2.0');
    expect(eq).toHaveBeenCalledWith('version', '1.2.0');
    expect(note).toEqual({ version: '1.2.0', releasedAt: '2026-11-20', title: 'Versão 1.2.0', items: { novo: ['A'], melhorado: [], corrigido: [] } });
  });

  it('devolve null se não existir', async () => {
    expect(await getRelease(client({ data: null, error: null }).c, '9.9.9')).toBeNull();
  });

  it('propaga erro da BD', async () => {
    await expect(getRelease(client({ data: null, error: new Error('x') }).c, '1.0.0')).rejects.toThrow('x');
  });
});
