import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/hooks/data/useSettings';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockProfile = {
  id: 'user-1',
  userIdCode: 'USR-001',
  name: 'Test User',
  profileImage: 'https://example.com/avatar.jpg',
  location: 'Lisbon',
  bio: 'Test bio',
  website: 'https://example.com',
  phoneNumber: '+351912345678',
  publicProfile: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  stats: {
      totalReviews: 10,
    totalLists: 3,
    totalRestaurantsAdded: 2,
    joinedDate: '2024-01-01',
  },
  recentReviews: [],
  recentLists: [],
  isOwnProfile: true,
};

console.error = jest.fn();

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with null profile and not loading', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('refreshProfile loads profile data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles refresh profile error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.error).toBe('Not found');
    expect(result.current.loading).toBe(false);
  });

  it('handles refresh profile network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('saveProfile updates profile successfully', async () => {
    const updatedProfile = { ...mockProfile, name: 'Updated Name' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ profile: updatedProfile }),
    });

    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ name: 'Updated Name' });
    });

    expect(saveResult).toBe(true);
    expect(result.current.profile).toEqual(updatedProfile);
  });

  it('saveProfile rejects empty name', async () => {
    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ name: '' });
    });

    expect(saveResult).toBe(false);
    expect(result.current.error).toBe('Display name is required');
  });

  it('saveProfile rejects invalid website URL', async () => {
    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ website: 'not-a-url' });
    });

    expect(saveResult).toBe(false);
    expect(result.current.error).toBe('Invalid website URL format');
  });

  it('saveProfile accepts valid website URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ profile: mockProfile }),
    });

    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ website: 'https://valid.com' });
    });

    expect(saveResult).toBe(true);
  });

  it('saveProfile handles API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ name: 'New Name' });
    });

    expect(saveResult).toBe(false);
    expect(result.current.error).toBe('Server error');
  });

  it('saveProfile handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSettings());

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveProfile({ name: 'New Name' });
    });

    expect(saveResult).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('refreshProfile calls fetchProfile internally', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('transforms formData correctly for API', async () => {
    let requestBody: any;
    mockFetch.mockImplementationOnce((url: string, opts: any) => {
      requestBody = JSON.parse(opts.body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profile: mockProfile }),
      });
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.saveProfile({
        name: 'New Name',
        profileImage: 'https://example.com/img.jpg',
        location: 'Porto',
        bio: 'New bio',
        website: 'https://test.com',
        phoneNumber: '+351987654321',
        publicProfile: false,
      });
    });

    expect(requestBody.display_name).toBe('New Name');
    expect(requestBody.location).toBe('Porto');
    expect(requestBody.bio).toBe('New bio');
    expect(requestBody.public_profile).toBe(false);
  });
});