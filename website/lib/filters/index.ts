/**
 * Filters Module
 *
 * Comprehensive filtering system for rack case products.
 *
 * Features:
 * - Auto-detection of filter options from data
 * - Support for checkbox, range, and boolean filters
 * - Dynamic filter counts with cross-filter awareness
 * - URL state serialization for shareable filter configurations
 */

// Filter configuration
export {
  type FilterType,
  type FilterCategory,
  type FilterConfig,
  type CheckboxFilterConfig,
  type RangeFilterConfig,
  type BooleanFilterConfig,
  type SearchFilterConfig,
  FILTER_CONFIGS,
  FILTER_CATEGORY_LABELS,
  FILTER_CATEGORY_ORDER,
  getFilterConfig,
  getFiltersByCategory,
  getDefaultVisibleFilters,
  getFiltersGroupedByCategory,
  getNestedValue,
} from './filterConfig';

// Filter registry (auto-detection)
export {
  type DetectedOptions,
  type CheckboxOptions,
  type RangeOptions,
  type BooleanOptions,
  type FilterRegistry,
  type FilterState,
  type FiltersState,
  type CheckboxFilterState,
  type RangeFilterState,
  type BooleanFilterState,
  buildFilterRegistry,
  getFilterOptions,
  filterHasOptions,
  createInitialFiltersState,
} from './filterRegistry';

// Filter engine (application)
export {
  type FilterCounts,
  type ActiveFilter,
  applyFilters,
  calculateFilterCounts,
  calculateRangeBounds,
  hasActiveFilters,
  getActiveFilters,
  clearFilter,
  clearAllFilters,
} from './filterEngine';

// URL state management
export {
  serializeFiltersToURL,
  deserializeFiltersFromURL,
  updateURLWithFilters,
} from './filterUrlState';
