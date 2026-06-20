/**
 * @jest-environment jsdom
 */

import { exportListAsJSON, exportListAsCSV, exportListAsPDF } from '@/utils/listExport';

// Mock URL and Blob for jsdom
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

// Mock document methods
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
});
Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

const mockList = { id: 'list-1', name: 'Test List', description: 'A test list' };
const mockRestaurants = [
  {
    id: 'r1',
    name: 'Restaurant A',
    location: 'Lisboa',
    rating: 4.5,
    price_per_person: 25,
    visited: true,
    cuisine_types: [{ name: 'Italiano' }, { name: 'Mediterrâneo' }],
    features: [{ name: 'Terraço' }],
    dietary_options: [{ name: 'Vegetariano' }],
  },
  {
    id: 'r2',
    name: 'Restaurant B',
    location: 'Porto',
    rating: 3.8,
    price_per_person: 12,
    visited: false,
    cuisine_types: [],
    features: [],
    dietary_options: [],
  },
];

describe('listExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportListAsJSON', () => {
    it('creates a JSON blob and triggers download', () => {
      exportListAsJSON(mockList, mockRestaurants);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('does not throw with empty restaurants', () => {
      expect(() => exportListAsJSON(mockList, [])).not.toThrow();
    });

    it('does not throw with minimal restaurant data', () => {
      const minimalRestaurants = [{ id: 'r1', name: 'Minimal' }];
      expect(() => exportListAsJSON(mockList, minimalRestaurants)).not.toThrow();
    });

    it('sanitizes filename with special characters', () => {
      const specialList = { id: '1', name: 'Minha Lista! @#$%' };
      expect(() => exportListAsJSON(specialList, [])).not.toThrow();
    });
  });

  describe('exportListAsCSV', () => {
    it('creates a CSV blob and triggers download', () => {
      exportListAsCSV(mockList, mockRestaurants);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('does not throw with empty restaurants', () => {
      expect(() => exportListAsCSV(mockList, [])).not.toThrow();
    });

    it('handles restaurants with quotes in name', () => {
      const restaurantsWithQuotes = [
        { id: 'r1', name: 'Rest "Best" Ever', location: 'Lisboa' },
      ];
      expect(() => exportListAsCSV(mockList, restaurantsWithQuotes)).not.toThrow();
    });

    it('handles missing optional fields', () => {
      const minimalRestaurants = [{ id: 'r1', name: 'Minimal' }];
      expect(() => exportListAsCSV(mockList, minimalRestaurants)).not.toThrow();
    });
  });

  describe('exportListAsPDF', () => {
    it('creates an HTML blob and triggers download', () => {
      exportListAsPDF(mockList, mockRestaurants);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('does not throw with empty restaurants', () => {
      expect(() => exportListAsPDF(mockList, [])).not.toThrow();
    });

    it('generates HTML with restaurant data', () => {
      exportListAsPDF(mockList, mockRestaurants);
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('handles special characters in list name', () => {
      const specialList = { id: '1', name: 'Lista & <especial>' };
      expect(() => exportListAsPDF(specialList, [])).not.toThrow();
    });
  });
});
