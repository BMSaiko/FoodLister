import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import UserRestaurantsSection from '@/components/ui/profile/sections/restaurants/UserRestaurantsSection';

const get = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [], total: 0 }) }));
jest.mock('@/hooks/auth/useApiClient', () => ({ useApiClient: () => ({ get }) }));
jest.mock('@/hooks/utilities/useShare', () => ({ useShare: () => ({ share: jest.fn() }) }));
jest.mock('@/utils/scrollLock', () => ({ useScrollLock: jest.fn() }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/ui/icons/Icon', () => ({ __esModule: true, default: () => <i /> }));
jest.mock('@/components/ui/profile/sections/restaurants/RestaurantCard', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('@/components/ui/profile/sections/restaurants/RestaurantSkeletonLoader', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('@/components/ui/profile/sections/shared', () => ({ SkeletonLoader: () => <div />, EmptyState: () => <div /> }));

const base = { userId: 'u1', initialRestaurants: [], initialTotal: 0, isOwnProfile: true };

describe('UserRestaurantsSection tab=restaurants', () => {
  beforeEach(() => {
    get.mockClear();
    window.history.pushState({}, '', '/users/u1?tab=restaurants');
  });

  it('não chama loadAll enquanto loadingStates.restaurants está a true', async () => {
    const { rerender } = render(<UserRestaurantsSection {...base} isLoading={false} loadingStates={{ profile: false, reviews: false, lists: false, restaurants: true }} />);
    await act(async () => { await Promise.resolve(); });
    expect(get).not.toHaveBeenCalled();
    rerender(<UserRestaurantsSection {...base} isLoading={false} loadingStates={{ profile: false, reviews: false, lists: false, restaurants: false }} />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
  });

  it('não repete o loadAll quando o hook termina sem dados', async () => {
    const { rerender } = render(<UserRestaurantsSection {...base} isLoading={false} />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    rerender(<UserRestaurantsSection {...base} isLoading={false} loadingStates={{ profile: false, reviews: false, lists: false, restaurants: false }} />);
    await act(async () => { await Promise.resolve(); });
    expect(get).toHaveBeenCalledTimes(1);
  });
});
