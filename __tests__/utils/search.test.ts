import { buildSearchParams, buildSearchUrl, highlightText } from '@/utils/search';

describe('buildSearchParams', () => {
  it('builds params with query', () => {
    const params = buildSearchParams({ query: 'pizza' });
    expect(params.get('q')).toBe('pizza');
  });

  it('builds params with cuisine types', () => {
    const params = buildSearchParams({ cuisineTypes: ['italian', 'chinese'] });
    expect(params.get('cuisine_types')).toBe('italian,chinese');
  });

  it('builds params with dietary options', () => {
    const params = buildSearchParams({ dietaryOptions: ['vegan', 'gluten-free'] });
    expect(params.get('dietary_options')).toBe('vegan,gluten-free');
  });

  it('builds params with features', () => {
    const params = buildSearchParams({ features: ['wifi', 'outdoor'] });
    expect(params.get('features')).toBe('wifi,outdoor');
  });

  it('builds params with rating range', () => {
    const params = buildSearchParams({ minRating: 3, maxRating: 5 });
    expect(params.get('min_rating')).toBe('3');
    expect(params.get('max_rating')).toBe('5');
  });

  it('builds params with location', () => {
    const params = buildSearchParams({ location: 'Lisbon' });
    expect(params.get('location')).toBe('Lisbon');
  });

  it('builds params with sort options', () => {
    const params = buildSearchParams({ sortBy: 'rating', sortOrder: 'desc' });
    expect(params.get('sort_by')).toBe('rating');
    expect(params.get('sort_order')).toBe('desc');
  });

  it('builds params with pagination', () => {
    const params = buildSearchParams({ page: 2, limit: 10 });
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('10');
  });

  it('returns empty params for empty options', () => {
    const params = buildSearchParams({});
    expect(params.toString()).toBe('');
  });

  it('ignores empty arrays', () => {
    const params = buildSearchParams({ cuisineTypes: [], dietaryOptions: [] });
    expect(params.get('cuisine_types')).toBeNull();
    expect(params.get('dietary_options')).toBeNull();
  });
});

describe('buildSearchUrl', () => {
  it('builds URL with query', () => {
    const url = buildSearchUrl({ query: 'pizza' });
    expect(url).toBe('/api/restaurants?q=pizza');
  });

  it('builds URL with multiple params', () => {
    const url = buildSearchUrl({ query: 'pizza', minRating: 4 });
    expect(url).toContain('q=pizza');
    expect(url).toContain('min_rating=4');
  });
});

describe('highlightText', () => {
  it('highlights matching text', () => {
    const result = highlightText('Pizza Margherita', 'pizza');
    expect(result).toBe('<mark>Pizza</mark> Margherita');
  });

  it('is case insensitive', () => {
    const result = highlightText('Pizza Margherita', 'PIZZA');
    expect(result).toBe('<mark>Pizza</mark> Margherita');
  });

  it('returns original text when query is empty', () => {
    expect(highlightText('Pizza', '')).toBe('Pizza');
  });

  it('returns original text when text is empty', () => {
    expect(highlightText('', 'pizza')).toBe('');
  });

  it('escapes regex special characters', () => {
    const result = highlightText('Pizza (special)', '(special)');
    expect(result).toBe('Pizza <mark>(special)</mark>');
  });
});
