/**
 * Filter Registry
 *
 * This module provides runtime analysis of product data to:
 * 1. Auto-detect available filter options from the actual data
 * 2. Calculate min/max ranges for numeric filters
 * 3. Build filter state that works with both checkbox and range filters
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

// ============================================================================
// DETECTED OPTIONS TYPES
// ============================================================================

export interface CheckboxOptions {
  type: 'checkbox';
  options: Array<{
    value: string;
    count: number;
  }>;
}

export interface RangeOptions {
  type: 'range';
  min: number;
  max: number;
  /** Count of products with non-null values */
  availableCount: number;
  /** Count of products with null/undefined values */
  nullCount: number;
}

export interface BooleanOptions {
  type: 'boolean';
  trueCount: number;
  falseCount: number;
}

export type DetectedOptions = CheckboxOptions | RangeOptions | BooleanOptions;

export interface FilterRegistry {
  [filterId: string]: DetectedOptions;
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect available checkbox options from product data
 */
function detectCheckboxOptions(
  products: RackCase[],
  config: CheckboxFilterConfig
): CheckboxOptions {
  const valueCounts = new Map<string, number>();

  for (const product of products) {
    const value = getNestedValue(product, config.propertyPath);

    if (config.isArray && Array.isArray(value)) {
      for (const item of value) {
        if (item != null && item !== '') {
          const strValue = String(item);
          valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
        }
      }
    } else if (value != null && value !== '') {
      const strValue = String(value);
      valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
    }
  }

  let options = Array.from(valueCounts.entries()).map(([value, count]) => ({
    value,
    count,
  }));

  // Sort options based on config
  if (config.sortOptions === 'alphabetical') {
    options.sort((a, b) => a.value.localeCompare(b.value));
  } else if (config.sortOptions === 'count') {
    options.sort((a, b) => b.count - a.count);
  } else if (config.sortOptions === 'custom' && config.customOrder) {
    const orderIndex = new Map(config.customOrder.map((v, i) => [v, i]));
    options.sort((a, b) => {
      const aIdx = orderIndex.get(a.value) ?? Infinity;
      const bIdx = orderIndex.get(b.value) ?? Infinity;
      return aIdx - bIdx;
    });
  }

  return {
    type: 'checkbox',
    options,
  };
}

/**
 * Detect min/max range for numeric filters from product data
 */
function detectRangeOptions(
  products: RackCase[],
  config: RangeFilterConfig
): RangeOptions {
  let min = Infinity;
  let max = -Infinity;
  let availableCount = 0;
  let nullCount = 0;

  for (const product of products) {
    const value = getNestedValue(product, config.propertyPath);

    if (typeof value === 'number' && !isNaN(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      availableCount++;
    } else {
      nullCount++;
    }
  }

  // Handle case where no valid values found
  if (min === Infinity || max === -Infinity) {
    return {
      type: 'range',
      min: 0,
      max: 0,
      availableCount: 0,
      nullCount: products.length,
    };
  }

  // Round min down and max up to nice step boundaries
  const roundedMin = Math.floor(min / config.step) * config.step;
  const roundedMax = Math.ceil(max / config.step) * config.step;

  return {
    type: 'range',
    min: roundedMin,
    max: roundedMax,
    availableCount,
    nullCount,
  };
}

/**
 * Detect boolean filter counts from product data
 */
function detectBooleanOptions(
  products: RackCase[],
  config: BooleanFilterConfig
): BooleanOptions {
  let trueCount = 0;
  let falseCount = 0;

  for (const product of products) {
    const value = getNestedValue(product, config.propertyPath);

    // Special handling for has_radiator_support which checks array length
    if (config.propertyPath === 'radiator_support') {
      const hasSupport = Array.isArray(value) && value.length > 0;
      if (hasSupport) {
        trueCount++;
      } else {
        falseCount++;
      }
    } else if (value === true) {
      trueCount++;
    } else if (value === false) {
      falseCount++;
    } else {
      // Treat null/undefined as false for boolean filters
      falseCount++;
    }
  }

  return {
    type: 'boolean',
    trueCount,
    falseCount,
  };
}

/**
 * Detect options for a single filter config
 */
function detectFilterOptions(
  products: RackCase[],
  config: FilterConfig
): DetectedOptions | null {
  switch (config.type) {
    case 'checkbox':
      return detectCheckboxOptions(products, config);
    case 'range':
      return detectRangeOptions(products, config);
    case 'boolean':
      return detectBooleanOptions(products, config);
    case 'search':
      // Search filters don't have detected options
      return null;
    default:
      return null;
  }
}

// ============================================================================
// MAIN REGISTRY BUILDER
// ============================================================================

/**
 * Build a complete filter registry by analyzing all products
 * This should be called once when products are loaded
 */
export function buildFilterRegistry(products: RackCase[]): FilterRegistry {
  const registry: FilterRegistry = {};

  for (const config of FILTER_CONFIGS) {
    const options = detectFilterOptions(products, config);
    if (options) {
      registry[config.id] = options;
    }
  }

  return registry;
}

/**
 * Get detected options for a specific filter
 */
export function getFilterOptions(
  registry: FilterRegistry,
  filterId: string
): DetectedOptions | undefined {
  return registry[filterId];
}

/**
 * Check if a filter has any usable options
 */
export function filterHasOptions(
  registry: FilterRegistry,
  filterId: string
): boolean {
  const options = registry[filterId];
  if (!options) return false;

  switch (options.type) {
    case 'checkbox':
      return options.options.length > 0;
    case 'range':
      return options.availableCount > 0 && options.min !== options.max;
    case 'boolean':
      return options.trueCount > 0 || options.falseCount > 0;
    default:
      return false;
  }
}

// ============================================================================
// FILTER STATE TYPES
// ============================================================================

export interface CheckboxFilterState {
  type: 'checkbox';
  selected: string[];
}

export interface RangeFilterState {
  type: 'range';
  min: number | null;
  max: number | null;
  /** Whether to include products with null values */
  includeNull: boolean;
}

export interface BooleanFilterState {
  type: 'boolean';
  value: boolean | null; // null means "don't filter"
}

export type FilterState = CheckboxFilterState | RangeFilterState | BooleanFilterState;

export interface FiltersState {
  [filterId: string]: FilterState;
}

/**
 * Create initial filter state based on registry
 */
export function createInitialFiltersState(registry: FilterRegistry): FiltersState {
  const state: FiltersState = {};

  for (const [filterId, options] of Object.entries(registry)) {
    switch (options.type) {
      case 'checkbox':
        state[filterId] = {
          type: 'checkbox',
          selected: [],
        };
        break;
      case 'range':
        state[filterId] = {
          type: 'range',
          min: null,
          max: null,
          includeNull: true,
        };
        break;
      case 'boolean':
        state[filterId] = {
          type: 'boolean',
          value: null,
        };
        break;
    }
  }

  return state;
}
