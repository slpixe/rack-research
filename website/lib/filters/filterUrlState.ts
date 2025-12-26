/**
 * Filter URL State Management
 *
 * Handles serialization/deserialization of filter state to/from URL query parameters.
 * This enables shareable filter configurations via URL.
 */

import { FILTER_CONFIGS } from './filterConfig';
import type {
  FiltersState,
  FilterState,
} from './filterRegistry';

// ============================================================================
// URL PARAMETER FORMATS
// ============================================================================

/**
 * Checkbox filters: ?rack_units=1U,2U,4U
 * Range filters: ?depth_mm=300-500 or ?depth_mm=300- (min only) or ?depth_mm=-500 (max only)
 * Boolean filters: ?has_hot_swap=true or ?has_hot_swap=false
 * Search: ?q=search+term
 */

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Serialize filter state to URL search params
 */
export function serializeFiltersToURL(
  filtersState: FiltersState,
  searchQuery?: string
): URLSearchParams {
  const params = new URLSearchParams();

  // Add search query
  if (searchQuery && searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  // Serialize each filter
  for (const [filterId, state] of Object.entries(filtersState)) {
    const serialized = serializeFilterState(state);
    if (serialized !== null) {
      params.set(filterId, serialized);
    }
  }

  return params;
}

/**
 * Serialize a single filter state to a string value
 */
function serializeFilterState(state: FilterState): string | null {
  switch (state.type) {
    case 'checkbox':
      return state.selected.length > 0 ? state.selected.join(',') : null;

    case 'range':
      if (state.min == null && state.max == null) return null;
      const minStr = state.min != null ? String(state.min) : '';
      const maxStr = state.max != null ? String(state.max) : '';
      return `${minStr}-${maxStr}`;

    case 'boolean':
      return state.value !== null ? String(state.value) : null;

    default:
      return null;
  }
}

// ============================================================================
// DESERIALIZATION
// ============================================================================

/**
 * Deserialize URL search params to filter state
 */
export function deserializeFiltersFromURL(
  searchParams: URLSearchParams,
  baseState: FiltersState
): { filtersState: FiltersState; searchQuery: string } {
  const filtersState: FiltersState = { ...baseState };
  let searchQuery = '';

  // Get search query
  const q = searchParams.get('q');
  if (q) {
    searchQuery = q;
  }

  // Deserialize each known filter
  for (const config of FILTER_CONFIGS) {
    const value = searchParams.get(config.id);
    if (!value) continue;

    const baseFilterState = baseState[config.id];
    if (!baseFilterState) continue;

    const deserialized = deserializeFilterState(value, baseFilterState);
    if (deserialized) {
      filtersState[config.id] = deserialized;
    }
  }

  return { filtersState, searchQuery };
}

/**
 * Deserialize a single filter state from a string value
 */
function deserializeFilterState(
  value: string,
  baseState: FilterState
): FilterState | null {
  switch (baseState.type) {
    case 'checkbox': {
      const selected = value
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
      return {
        type: 'checkbox',
        selected,
      };
    }

    case 'range': {
      const match = value.match(/^(-?\d*\.?\d*)?-(-?\d*\.?\d*)?$/);
      if (!match) return null;

      const [, minStr, maxStr] = match;
      const min = minStr ? parseFloat(minStr) : null;
      const max = maxStr ? parseFloat(maxStr) : null;

      if ((minStr && isNaN(min!)) || (maxStr && isNaN(max!))) return null;

      return {
        type: 'range',
        min,
        max,
        includeNull: baseState.includeNull,
      };
    }

    case 'boolean': {
      if (value === 'true') {
        return { type: 'boolean', value: true };
      } else if (value === 'false') {
        return { type: 'boolean', value: false };
      }
      return null;
    }

    default:
      return null;
  }
}

// ============================================================================
// URL MANIPULATION
// ============================================================================

/**
 * Update URL with current filter state without triggering navigation
 */
export function updateURLWithFilters(
  filtersState: FiltersState,
  searchQuery?: string,
  pathname?: string
): string {
  const params = serializeFiltersToURL(filtersState, searchQuery);
  const queryString = params.toString();
  const basePath = pathname || '/';

  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Get a URL-friendly filter summary for sharing
 */
export function getFilterSummary(
  filtersState: FiltersState,
  searchQuery?: string
): string {
  const parts: string[] = [];

  if (searchQuery) {
    parts.push(`Search: "${searchQuery}"`);
  }

  for (const [filterId, state] of Object.entries(filtersState)) {
    const config = FILTER_CONFIGS.find(f => f.id === filterId);
    if (!config) continue;

    switch (state.type) {
      case 'checkbox':
        if (state.selected.length > 0) {
          parts.push(`${config.label}: ${state.selected.join(', ')}`);
        }
        break;
      case 'range':
        if (state.min != null || state.max != null) {
          const rangeStr = state.min != null && state.max != null
            ? `${state.min}-${state.max}`
            : state.min != null
            ? `≥${state.min}`
            : `≤${state.max}`;
          parts.push(`${config.label}: ${rangeStr}`);
        }
        break;
      case 'boolean':
        if (state.value !== null) {
          parts.push(`${config.label}: ${state.value ? 'Yes' : 'No'}`);
        }
        break;
    }
  }

  return parts.join(' | ');
}
