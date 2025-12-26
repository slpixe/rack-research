import { describe, it, expect } from 'vitest';
import { serializeFiltersToURL, deserializeFiltersFromURL } from '../filters/filterUrlState';
import { createInitialFiltersState, type FiltersState } from '../filters/filterRegistry';

describe('filterUrlState', () => {
  const baseState: FiltersState = {
    price: {
      type: 'range',
      min: null,
      max: null,
      includeNull: true,
    },
    rack_units: {
      type: 'checkbox',
      selected: [],
    },
  };

  describe('serializeFiltersToURL', () => {
    it('should serialize range filter with includeNull=false', () => {
      const state: FiltersState = {
        ...baseState,
        price: {
          type: 'range',
          min: null,
          max: null,
          includeNull: false,
        },
      };

      const params = serializeFiltersToURL(state);
      expect(params.get('price')).toBe('-_nn');
    });

    it('should serialize range filter with min/max and includeNull=false', () => {
      const state: FiltersState = {
        ...baseState,
        price: {
          type: 'range',
          min: 100,
          max: 200,
          includeNull: false,
        },
      };

      const params = serializeFiltersToURL(state);
      expect(params.get('price')).toBe('100-200_nn');
    });

    it('should serialize range filter with min/max and includeNull=true', () => {
      const state: FiltersState = {
        ...baseState,
        price: {
          type: 'range',
          min: 100,
          max: 200,
          includeNull: true,
        },
      };

      const params = serializeFiltersToURL(state);
      expect(params.get('price')).toBe('100-200');
    });
  });

  describe('deserializeFiltersFromURL', () => {
    it('should deserialize range filter with includeNull=false', () => {
      const params = new URLSearchParams();
      params.set('price', '-_nn');

      const { filtersState } = deserializeFiltersFromURL(params, baseState);
      const priceState = filtersState.price;

      if (priceState.type !== 'range') throw new Error('Expected range filter');
      expect(priceState.min).toBeNull();
      expect(priceState.max).toBeNull();
      expect(priceState.includeNull).toBe(false);
    });

    it('should deserialize range filter with min/max and includeNull=false', () => {
      const params = new URLSearchParams();
      params.set('price', '100-200_nn');

      const { filtersState } = deserializeFiltersFromURL(params, baseState);
      const priceState = filtersState.price;

      if (priceState.type !== 'range') throw new Error('Expected range filter');
      expect(priceState.min).toBe(100);
      expect(priceState.max).toBe(200);
      expect(priceState.includeNull).toBe(false);
    });

    it('should deserialize range filter with min/max and includeNull=true', () => {
      const params = new URLSearchParams();
      params.set('price', '100-200');

      const { filtersState } = deserializeFiltersFromURL(params, baseState);
      const priceState = filtersState.price;

      if (priceState.type !== 'range') throw new Error('Expected range filter');
      expect(priceState.min).toBe(100);
      expect(priceState.max).toBe(200);
      expect(priceState.includeNull).toBe(true);
    });
  });
});
