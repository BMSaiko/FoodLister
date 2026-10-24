import { sanitizeUrl, shareRestaurant } from '@/utils/shareRestaurant';

describe('sanitizeUrl', () => {
  it('aceita http(s) válido', () => {
    expect(sanitizeUrl('https://foodlister.pt/restaurants/1')).toBe('https://foodlister.pt/restaurants/1');
  });

  it('rejeita vazio, protocolo inválido, IP privado e URL longo', () => {
    expect(sanitizeUrl('')).toBeNull();
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('http://127.0.0.1/x')).toBeNull();
    expect(sanitizeUrl('http://192.168.1.2/x')).toBeNull();
    expect(sanitizeUrl(`https://a.pt/${'x'.repeat(2100)}`)).toBeNull();
  });

  it('remove caracteres perigosos', () => {
    expect(sanitizeUrl('https://a.pt/<b>')).toBe('https://a.pt/b');
  });
});

describe('shareRestaurant', () => {
  const original = { share: (navigator as any).share, clipboard: (navigator as any).clipboard };
  afterEach(() => {
    Object.assign(navigator, original);
  });

  it('usa Web Share quando existe', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    const r = await shareRestaurant('Tasca', 'https://a.pt/1');
    expect(share).toHaveBeenCalledWith({ title: 'Tasca', text: 'Confira este restaurante: Tasca', url: 'https://a.pt/1' });
    expect(r).toEqual({ status: 'shared' });
  });

  it('cai para clipboard sem Web Share', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: undefined, clipboard: { writeText } });
    const r = await shareRestaurant('Tasca', 'https://a.pt/1');
    expect(writeText).toHaveBeenCalledWith('https://a.pt/1');
    expect(r).toEqual({ status: 'copied' });
  });

  it('devolve erro com URL vazio ou inválido', async () => {
    expect((await shareRestaurant('T', '')).status).toBe('error');
    expect((await shareRestaurant('T', 'ftp://a.pt')).status).toBe('error');
  });

  it('cancelamento (AbortError) é silencioso', async () => {
    const err = Object.assign(new Error('x'), { name: 'AbortError' });
    Object.assign(navigator, { share: jest.fn().mockRejectedValue(err) });
    expect(await shareRestaurant('T', 'https://a.pt/1')).toEqual({ status: 'cancelled' });
  });
});
