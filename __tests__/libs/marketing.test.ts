// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

import { getMarketingAnalytics } from '@/libs/marketing';

describe('getMarketingAnalytics', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns analytics data on success', async () => {
    const payload = {
      campaigns: { total: 2, byStatus: { draft: 1, active: 1 } },
      posts: { total: 5, byStatus: { published: 3 }, published: 3 },
      engagement: { total: { likes: 10, shares: 4, comments: 2 }, byPlatform: {} },
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: payload }) });
    const result = await getMarketingAnalytics();
    expect(result).toEqual(payload);
  });

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as any);
    const result = await getMarketingAnalytics();
    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    const result = await getMarketingAnalytics();
    expect(result).toBeNull();
  });
});
