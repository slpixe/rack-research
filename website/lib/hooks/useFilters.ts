'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { RackCase } from '@/lib/types';
import {
  buildFilterRegistry,
  createInitialFiltersState,
  type FiltersState,
} from '@/lib/filters/filterRegistry';
import {
  deserializeFiltersFromURL,
  serializeFiltersToURL,
} from '@/lib/filters/filterUrlState';
import {
  applyFilters,
  clearAllFilters as clearAll,
} from '@/lib/filters/filterEngine';

interface UseFiltersOptions {
  /** All products to filter */
  products: RackCase[];
}

interface UseFiltersResult {
  /** Current filter state */
  filtersState: FiltersState;
  /** Current search query */
  searchQuery: string;
  /** Filtered products */
  filteredProducts: RackCase[];
  /** Update filters */
  updateFilters: (newState: FiltersState) => void;
  /** Update search query */
  updateSearchQuery: (query: string) => void;
  /** Clear all filters and search */
  clearAllFilters: () => void;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

export function useFilters({ products }: UseFiltersOptions): UseFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build registry and initial state from products
  const initialState = useMemo(() => {
    const reg = buildFilterRegistry(products);
    return createInitialFiltersState(reg);
  }, [products]);

  // Deserialize current filter state from URL
  const { filtersState, searchQuery } = useMemo(() => {
    return deserializeFiltersFromURL(searchParams, initialState);
  }, [searchParams, initialState]);

  // Apply filters to get filtered products
  const filteredProducts = useMemo(() => {
    return applyFilters(products, filtersState, searchQuery);
  }, [products, filtersState, searchQuery]);

  // Update URL with new filter state
  const updateURL = useCallback(
    (newState: FiltersState, newQuery?: string) => {
      const params = serializeFiltersToURL(newState, newQuery ?? searchQuery);
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchQuery]
  );

  // Update filters
  const updateFilters = useCallback(
    (newState: FiltersState) => {
      updateURL(newState);
    },
    [updateURL]
  );

  // Update search query
  const updateSearchQuery = useCallback(
    (query: string) => {
      updateURL(filtersState, query);
    },
    [updateURL, filtersState]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedState = clearAll(filtersState);
    const params = serializeFiltersToURL(clearedState, '');
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [router, pathname, filtersState]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (searchQuery.trim()) return true;
    for (const state of Object.values(filtersState)) {
      switch (state.type) {
        case 'checkbox':
          if (state.selected.length > 0) return true;
          break;
        case 'range':
          if (state.min != null || state.max != null) return true;
          break;
        case 'boolean':
          if (state.value !== null) return true;
          break;
      }
    }
    return false;
  }, [filtersState, searchQuery]);

  return {
    filtersState,
    searchQuery,
    filteredProducts,
    updateFilters,
    updateSearchQuery,
    clearAllFilters,
    hasActiveFilters,
  };
}
