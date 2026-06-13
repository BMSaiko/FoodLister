import type {
  Restaurant, List, User, Review, ApiResponse,
  PaginatedResponse, AuthUser, ValidationResult,
  RestaurantFilters, VisitData
} from '@/libs/types';

describe('Type definitions', () => {
  it('Restaurant with required fields', () => {
    const r: Restaurant = { id: '1', name: 'Test', visited: false, created_at: '2026-01-01', updated_at: '2026-01-01' };
    expect(r.id).toBe('1');
    expect(r.visited).toBe(false);
  });

  it('Restaurant with optional fields', () => {
    const r: Restaurant = { id: '1', name: 'Test', rating: 4.5, location: 'Lisbon', visited: true, created_at: '2026-01-01', updated_at: '2026-01-01' };
    expect(r.rating).toBe(4.5);
    expect(r.location).toBe('Lisbon');
  });

  it('List interface', () => {
    const l: List = { id: '1', name: 'My List', created_at: '2026-01-01', updated_at: '2026-01-01' };
    expect(l.id).toBe('1');
    expect(l.is_public).toBeUndefined();
  });

  it('User interface', () => {
    const u: User = { id: '1', name: 'Test User' };
    expect(u.id).toBe('1');
  });

  it('Review interface', () => {
    const rv: Review = { id: '1', restaurant_id: 'r1', user_id: 'u1', rating: 5, created_at: '2026-01-01', updated_at: '2026-01-01', user: { id: 'u1', name: 'U' } };
    expect(rv.rating).toBe(5);
  });

  it('ApiResponse success', () => {
    const ok: ApiResponse<string> = { data: 'success' };
    expect(ok.data).toBe('success');
  });

  it('ApiResponse error', () => {
    const err: ApiResponse<never> = { error: 'fail' };
    expect(err.error).toBe('fail');
  });

  it('PaginatedResponse', () => {
    const p: PaginatedResponse<string> = { data: ['a', 'b'], total: 2, page: 1, limit: 10 };
    expect(p.data).toHaveLength(2);
  });

  it('AuthUser', () => {
    const u: AuthUser = { id: '1', user_metadata: {} };
    expect(u.id).toBe('1');
  });

  it('ValidationResult', () => {
    const v: ValidationResult = { isValid: true, errors: {} };
    expect(v.isValid).toBe(true);
  });

  it('RestaurantFilters', () => {
    const f: RestaurantFilters = { search: 'pizza', visited: true };
    expect(f.search).toBe('pizza');
  });

  it('VisitData', () => {
    const v: VisitData = { visited: true, visit_count: 3, last_visit: '2026-01-01' };
    expect(v.visit_count).toBe(3);
  });
});

