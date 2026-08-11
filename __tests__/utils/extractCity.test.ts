import { extractPlaceParts } from '@/utils/googleMapsExtractor';

describe('extractPlaceParts', () => {
  it('parses city/district/country from a full address', () => {
    expect(extractPlaceParts('Rua X, Bairro, Lisboa, Portugal')).toEqual({
      city: 'Lisboa', district: 'Bairro', country: 'Portugal',
    });
  });
  it('parses city + country without district', () => {
    expect(extractPlaceParts('Lisboa, Portugal')).toEqual({
      city: 'Lisboa', district: undefined, country: 'Portugal',
    });
  });
  it('skips postcode before country', () => {
    expect(extractPlaceParts('Porto, 4000-000, Portugal')).toEqual({
      city: 'Porto', district: undefined, country: 'Portugal',
    });
  });
  it('recognises bare city (no country)', () => {
    expect(extractPlaceParts('Lisboa')).toEqual({
      city: 'Lisboa', district: undefined, country: undefined,
    });
  });
  it('parses non-PT address', () => {
    expect(extractPlaceParts('São Paulo, SP, Brasil')).toEqual({
      city: 'São Paulo', district: undefined, country: 'Brasil',
    });
  });
  it('returns empty for coords-only and null/empty', () => {
    expect(extractPlaceParts('1.23, 2.34')).toEqual({});
    expect(extractPlaceParts(null)).toEqual({});
    expect(extractPlaceParts('')).toEqual({});
  });
});
