import {
  formatDate,
  categorizePriceLevel,
  getRatingClass,
  formatPrice,
  formatDescription,
  getDescriptionPreview,
} from '@/utils/formatters';

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-03-15T00:00:00Z');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('returns "Data inválida" for empty string', () => {
    expect(formatDate('')).toBe('Data inválida');
  });

  it('returns "Data inválida" for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Data inválida');
  });

  it('returns "Data inválida" for whitespace-only string', () => {
    expect(formatDate('   ')).toBe('Data inválida');
  });
});

describe('categorizePriceLevel', () => {
  it('returns Económico for price <= 10', () => {
    expect(categorizePriceLevel(5)).toEqual({ label: 'Econômico', level: 1 });
    expect(categorizePriceLevel(10)).toEqual({ label: 'Econômico', level: 1 });
  });

  it('returns Moderado for price <= 20', () => {
    expect(categorizePriceLevel(15)).toEqual({ label: 'Moderado', level: 2 });
    expect(categorizePriceLevel(20)).toEqual({ label: 'Moderado', level: 2 });
  });

  it('returns Elevado for price <= 50', () => {
    expect(categorizePriceLevel(30)).toEqual({ label: 'Elevado', level: 3 });
    expect(categorizePriceLevel(50)).toEqual({ label: 'Elevado', level: 3 });
  });

  it('returns Luxo for price > 50', () => {
    expect(categorizePriceLevel(100)).toEqual({ label: 'Luxo', level: 4 });
  });
});

describe('getRatingClass', () => {
  it('returns green class for rating >= 4.5', () => {
    expect(getRatingClass(4.5)).toBe('bg-green-100 text-green-700');
    expect(getRatingClass(5)).toBe('bg-green-100 text-green-700');
  });

  it('returns amber class for rating >= 3.5', () => {
    expect(getRatingClass(3.5)).toBe('bg-amber-100 text-amber-700');
    expect(getRatingClass(4)).toBe('bg-amber-100 text-amber-700');
  });

  it('returns yellow class for rating >= 2.5', () => {
    expect(getRatingClass(2.5)).toBe('bg-yellow-100 text-yellow-700');
    expect(getRatingClass(3)).toBe('bg-yellow-100 text-yellow-700');
  });

  it('returns red class for rating < 2.5', () => {
    expect(getRatingClass(1)).toBe('bg-red-100 text-red-700');
    expect(getRatingClass(2)).toBe('bg-red-100 text-red-700');
  });
});

describe('formatPrice', () => {
  it('formats price with euro symbol', () => {
    expect(formatPrice(10)).toBe('€10.00');
    expect(formatPrice(25.5)).toBe('€25.50');
    expect(formatPrice(0)).toBe('€0.00');
  });
});

describe('formatDescription', () => {
  it('splits description by newlines', () => {
    const result = formatDescription('Line 1\nLine 2\nLine 3');
    expect(result).toEqual(['Line 1', 'Line 2', 'Line 3']);
  });

  it('handles CRLF line endings', () => {
    const result = formatDescription('Line 1\r\nLine 2');
    expect(result).toEqual(['Line 1', 'Line 2']);
  });

  it('returns null for empty string', () => {
    expect(formatDescription('')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(formatDescription(undefined)).toBeNull();
  });

  it('trims paragraphs', () => {
    const result = formatDescription('  Line 1  \n  Line 2  ');
    expect(result).toEqual(['Line 1', 'Line 2']);
  });

  it('filters empty paragraphs', () => {
    const result = formatDescription('Line 1\n\nLine 2');
    expect(result).toEqual(['Line 1', 'Line 2']);
  });
});

describe('getDescriptionPreview', () => {
  it('returns first paragraph', () => {
    expect(getDescriptionPreview('First paragraph\nSecond paragraph')).toBe('First paragraph');
  });

  it('truncates long text to 20 words', () => {
    const longText = 'word '.repeat(25).trim();
    const result = getDescriptionPreview(longText);
    expect(result).toContain('...');
  });

  it('returns empty string for undefined', () => {
    expect(getDescriptionPreview(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getDescriptionPreview('')).toBe('');
  });

  it('normalizes whitespace', () => {
    expect(getDescriptionPreview('word1    word2')).toBe('word1 word2');
  });
});