import { generateContent } from '@/libs/ai';

describe('generateContent retry/error handling (T10.19)', () => {
  const savedFetch = global.fetch;

  beforeEach(() => {
    process.env.OPENAI_API_KEY='***';
  });

  afterEach(() => {
    global.fetch = savedFetch;
    delete process.env.OPENAI_API_KEY;
  });

  function mockResponse(status: number, body: any) {
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    };
  }

  it('retries on 5xx and succeeds on a later attempt', async () => {
    const calls = [
      mockResponse(503, { error: 'unavailable' }),
      mockResponse(200, { choices: [{ message: { content: '  hello  ' } }], usage: { total_tokens: 7 } }),
    ];
    let i = 0;
    (global as any).fetch = jest.fn(async () => calls[i++]);
    const result = await generateContent({ prompt: 'x' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('hello');
    expect(result.tokensUsed).toBe(7);
  });

  it('does NOT retry on 4xx (deterministic)', async () => {
    (global as any).fetch = jest.fn(async () => mockResponse(400, { error: 'bad request' }));
    await expect(generateContent({ prompt: 'x' })).rejects.toThrow(/OpenAI API error: 400/);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting retries on persistent 5xx', async () => {
    (global as any).fetch = jest.fn(async () => mockResponse(500, { error: 'boom' }));
    await expect(generateContent({ prompt: 'x' })).rejects.toThrow(/OpenAI API error: 500/);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
