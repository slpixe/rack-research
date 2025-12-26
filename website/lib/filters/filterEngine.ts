/**
 * Filter Engine
 *
 * This module provides the core filtering logic:
 * 1. Applies filter state to products
 * 2. Calculates dynamic filter counts
 * 3. Supports all filter types (checkbox, range, boolean)
 */

import type { RackCase } from '@/lib/types';
import {
  FILTER_CONFIGS,
  getNestedValue,
  type FilterConfig,
  type CheckboxFilterConfig,
  type RangeFilterConfig,
  type BooleanFilterConfig,
} from './filterConfig';
import type {
  FiltersState,
  FilterState,
  CheckboxFilterState,
  RangeFilterState,
  BooleanFilterState,
  FilterRegistry,
} from './filterRegistry';

// ============================================================================
// SINGLE PRODUCT MATCHING
// ============================================================================

/**
 * Check if a product matches a checkbox filter
 */
function matchesCheckboxFilter(
  product: RackCase,
  config: CheckboxFilterConfig,
  state: CheckboxFilterState
): boolean {
  if (state.selected.length === 0) return true;

  const value = getNestedValue(product, config.propertyPath);

  if (config.isArray && Array.isArray(value)) {
    // For array properties, check if any selected value is in the array
    return state.selected.some(selected =>
      value.some(v => String(v) === selected)
    );
  } else {
    // For scalar properties, check if value matches any selected
    return state.selected.includes(String(value));
  }
}

/**
 * Check if a product matches a range filter
 */
function matchesRangeFilter(
  product: RackCase,
  config: RangeFilterConfig,
  state: RangeFilterState
): boolean {
  const value = getNestedValue(product, config.propertyPath);

  // Handle null/undefined values
  if (value == null || (typeof value === 'number' && isNaN(value))) {
    return state.includeNull;
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) {
    return state.includeNull;
  }

  // Apply min/max bounds
  if (state.min != null && numValue < state.min) return false;
  if (state.max != null && numValue > state.max) return false;

  return true;
}

/**
 * Check if a product matches a boolean filter
 */
function matchesBooleanFilter(
  product: RackCase,
  config: BooleanFilterConfig,
  state: BooleanFilterState
): boolean {
  if (state.value === null) return true;

  const value = getNestedValue(product, config.propertyPath);

  // Special handling for radiator_support (check array length)
  if (config.propertyPath === 'radiator_support') {
    const hasSupport = Array.isArray(value) && value.length > 0;
    return hasSupport === state.value;
  }

  return Boolean(value) === state.value;
}

/**
 * Check if a product matches a single filter
 */
function matchesFilter(
  product: RackCase,
  config: FilterConfig,
  state: FilterState
): boolean {
  switch (config.type) {
    case 'checkbox':
      return matchesCheckboxFilter(
        product,
        config,
        state as CheckboxFilterState
      );
    case 'range':
      return matchesRangeFilter(product, config, state as RangeFilterState);
    case 'boolean':
      return matchesBooleanFilter(
        product,
        config,
        state as BooleanFilterState
      );
    case 'search':
      // Search is handled separately
      return true;
    default:
      return true;
  }
}

// ============================================================================
// FILTER APPLICATION
// ============================================================================

/**
 * Apply all filters to a list of products
 */
export function applyFilters(
  products: RackCase[],
  filtersState: FiltersState,
  searchQuery?: string
): RackCase[] {
  return products.filter(product => {
    // Apply search filter first
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const searchableFields = [
        product.name,
        product.brand,
        product.model,
        product.source,
        product.rack_units,
        ...(product.motherboard_support || []),
        ...(product.features || []),
      ].filter(Boolean);

      const matchesSearch = searchableFields.some(
        field => field?.toLowerCase().includes(searchLower)
      );

      if (!matchesSearch) return false;
    }

    // Apply each filter
    for (const [filterId, state] of Object.entries(filtersState)) {
      const config = FILTER_CONFIGS.find(f => f.id === filterId);
      if (!config) continue;

      if (!matchesFilter(product, config, state)) {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// DYNAMIC FILTER COUNTS
// ============================================================================

export interface FilterCounts {
  [filterId: string]: {
    [optionValue: string]: number;
  };
}

/**
 * Calculate filter counts, considering other active filters
 * This enables the "cross-filter" behavior where selecting a filter
 * updates counts for other filter options
 */
export function calculateFilterCounts(
  products: RackCase[],
  filtersState: FiltersState,
  registry: FilterRegistry,
  searchQuery?: string
): FilterCounts {
  const counts: FilterCounts = {};

  for (const config of FILTER_CONFIGS) {
    if (config.type !== 'checkbox') continue;

    const checkboxConfig = config as CheckboxFilterConfig;
    counts[config.id] = {};

    // Create a modified filter state that excludes the current filter
    const stateWithoutThis = { ...filtersState };
    delete stateWithoutThis[config.id];

    // Get products matching all OTHER filters
    const matchingProducts = applyFilters(products, stateWithoutThis, searchQuery);

    // Count occurrences of each option value
    for (const product of matchingProducts) {
      const value = getNestedValue(product, checkboxConfig.propertyPath);

      if (checkboxConfig.isArray && Array.isArray(value)) {
        for (const item of value) {
          if (item != null && item !== '') {
            const strValue = String(item);
            counts[config.id][strValue] = (counts[config.id][strValue] || 0) + 1;
          }
        }
      } else if (value != null && value !== '') {
        const strValue = String(value);
        counts[config.id][strValue] = (counts[config.id][strValue] || 0) + 1;
      }
    }
  }

  return counts;
}

/**
 * Calculate updated range bounds based on filtered products
 * Useful for showing "available range" when other filters are active
 */
export function calculateRangeBounds(
  products: RackCase[],
  filterId: string,
  filtersState: FiltersState,
  searchQuery?: string
): { min: number; max: number; count: number } | null {
  const config = FILTER_CONFIGS.find(f => f.id === filterId);
  if (!config || config.type !== 'range') return null;

  const rangeConfig = config as RangeFilterConfig;

  // Create filter state without this range filter
  const stateWithoutThis = { ...filtersState };
  delete stateWithoutThis[filterId];

  // Get products matching all OTHER filters
  const matchingProducts = applyFilters(products, stateWithoutThis, searchQuery);

  let min = Infinity;
  let max = -Infinity;
  let count = 0;

  for (const product of matchingProducts) {
    const value = getNestedValue(product, rangeConfig.propertyPath);

    if (typeof value === 'number' && !isNaN(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      count++;
    }
  }

  if (count === 0 || min === Infinity || max === -Infinity) {
    return null;
  }

  return {
    min: Math.floor(min / rangeConfig.step) * rangeConfig.step,
    max: Math.ceil(max / rangeConfig.step) * rangeConfig.step,
    count,
  };
}

// ============================================================================
// FILTER STATE UTILITIES
// ============================================================================

/**
 * Check if any filters are actively filtering (not at default state)
 */
export function hasActiveFilters(filtersState: FiltersState): boolean {
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
}

/**
 * Get list of active filters for display (e.g., filter chips)
 */
export interface ActiveFilter {
  filterId: string;
  filterLabel: string;
  values: string[];
}

export function getActiveFilters(filtersState: FiltersState): ActiveFilter[] {
  const activeFilters: ActiveFilter[] = [];

  for (const [filterId, state] of Object.entries(filtersState)) {
    const config = FILTER_CONFIGS.find(f => f.id === filterId);
    if (!config) continue;

    switch (state.type) {
      case 'checkbox':
        if (state.selected.length > 0) {
          activeFilters.push({
            filterId,
            filterLabel: config.label,
            values: state.selected,
          });
        }
        break;
      case 'range':
        if (state.min != null || state.max != null) {
          const rangeConfig = config as RangeFilterConfig;
          const parts: string[] = [];
          if (state.min != null) {
            parts.push(`≥ ${state.min}${rangeConfig.unit}`);
          }
          if (state.max != null) {
            parts.push(`≤ ${state.max}${rangeConfig.unit}`);
          }
          activeFilters.push({
            filterId,
            filterLabel: config.label,
            values: parts,
          });
        }
        break;
      case 'boolean':
        if (state.value !== null) {
          const boolConfig = config as BooleanFilterConfig;
          activeFilters.push({
            filterId,
            filterLabel: config.label,
            values: [state.value ? (boolConfig.trueLabel || 'Yes') : (boolConfig.falseLabel || 'No')],
          });
        }
        break;
    }
  }

  return activeFilters;
}

/**
 * Clear a specific filter back to its default state
 */
export function clearFilter(
  filtersState: FiltersState,
  filterId: string
): FiltersState {
  const currentState = filtersState[filterId];
  if (!currentState) return filtersState;

  const newState = { ...filtersState };

  switch (currentState.type) {
    case 'checkbox':
      newState[filterId] = { ...currentState, selected: [] };
      break;
    case 'range':
      newState[filterId] = { ...currentState, min: null, max: null };
      break;
    case 'boolean':
      newState[filterId] = { ...currentState, value: null };
      break;
  }

  return newState;
}

/**
 * Clear all filters back to default state
 */
export function clearAllFilters(filtersState: FiltersState): FiltersState {
  const newState: FiltersState = {};

  for (const [filterId, state] of Object.entries(filtersState)) {
    switch (state.type) {
      case 'checkbox':
        newState[filterId] = { type: 'checkbox', selected: [] };
        break;
      case 'range':
        newState[filterId] = { type: 'range', min: null, max: null, includeNull: true };
        break;
      case 'boolean':
        newState[filterId] = { type: 'boolean', value: null };
        break;
    }
  }

  return newState;
}
