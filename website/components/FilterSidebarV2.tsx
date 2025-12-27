'use client';

import { useMemo, useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { SearchBarV2 } from './SearchBarV2';
import { FilterChipsV2 } from './FilterChipsV2';
import type { RackCase } from '@/lib/types';
import {
  FILTER_CONFIGS,
  FILTER_CATEGORY_LABELS,
  FILTER_CATEGORY_ORDER,
  type FilterConfig,
  type CheckboxFilterConfig,
  type RangeFilterConfig,
  type BooleanFilterConfig,
  type FilterCategory,
} from '@/lib/filters/filterConfig';
import {
  buildFilterRegistry,
  type CheckboxOptions,
  type RangeOptions,
  type BooleanOptions,
} from '@/lib/filters/filterRegistry';
import { calculateFilterCounts } from '@/lib/filters/filterEngine';
import type { FiltersState } from '@/lib/filters';
import styles from './FilterSidebarV2.module.css';

interface FilterSidebarV2Props {
  allProducts: RackCase[];
  filtersState: FiltersState;
  onFiltersChange: (newState: FiltersState) => void;
  searchQuery?: string;
  onSearchQueryChange: (query: string) => void;
  onClearAll: () => void;
}

export function FilterSidebarV2({
  allProducts,
  filtersState,
  onFiltersChange,
  searchQuery,
  onSearchQueryChange,
  onClearAll,
}: FilterSidebarV2Props) {
  // Build filter registry from data (memoized)
  const registry = useMemo(() => buildFilterRegistry(allProducts), [allProducts]);

  // Calculate dynamic filter counts
  const filterCounts = useMemo(
    () => calculateFilterCounts(allProducts, filtersState, registry, searchQuery),
    [allProducts, filtersState, registry, searchQuery]
  );

  // Track expanded/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Set<FilterCategory>>(
    new Set(['basic', 'pricing', 'dimensions', 'compatibility', 'storage'])
  );

  // Track which "More filters" sections are expanded
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleCategory = (category: FilterCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group filters by category
  const filtersByCategory = useMemo(() => {
    const grouped = new Map<FilterCategory, FilterConfig[]>();
    for (const category of FILTER_CATEGORY_ORDER) {
      const filters = FILTER_CONFIGS.filter(f => f.category === category).sort(
        (a, b) => a.priority - b.priority
      );
      if (filters.length > 0) {
        grouped.set(category, filters);
      }
    }
    return grouped;
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
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
  }, [filtersState]);

  // Render a checkbox filter
  const renderCheckboxFilter = (config: CheckboxFilterConfig) => {
    const options = registry[config.id] as CheckboxOptions | undefined;
    if (!options || options.options.length === 0) return null;

    const state = filtersState[config.id];
    if (!state || state.type !== 'checkbox') return null;

    const counts = filterCounts[config.id] || {};

    const toggleOption = (value: string) => {
      const newSelected = state.selected.includes(value)
        ? state.selected.filter(v => v !== value)
        : [...state.selected, value];

      onFiltersChange({
        ...filtersState,
        [config.id]: { ...state, selected: newSelected },
      });
    };

    return (
      <div key={config.id} className={styles.filterGroup}>
        <h4 className={styles.filterLabel}>{config.label}</h4>
        <ul className={styles.optionList}>
          {options.options.map(({ value }) => {
            const count = counts[value] || 0;
            const isSelected = state.selected.includes(value);
            const isDisabled = count === 0 && !isSelected;

            return (
              <li key={value} className={styles.optionItem}>
                <label className={`${styles.optionLabel} ${isDisabled ? styles.disabled : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(value)}
                    disabled={isDisabled}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionText}>
                    {value}
                    <span className={styles.optionCount}>({count})</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Render a range filter
  const renderRangeFilter = (config: RangeFilterConfig) => {
    const options = registry[config.id] as RangeOptions | undefined;
    if (!options || options.availableCount === 0) return null;

    const state = filtersState[config.id];
    if (!state || state.type !== 'range') return null;

    return (
      <div key={config.id} className={styles.filterGroup}>
        <RangeSlider
          label={config.label}
          min={options.min}
          max={options.max}
          value={[state.min, state.max]}
          step={config.step}
          unit={config.unit}
          decimals={config.decimals}
          isCurrency={config.isCurrency}
          currencySymbol={config.isCurrency ? '€' : undefined}
          availableCount={options.availableCount}
          nullCount={options.nullCount}
          includeNull={state.includeNull}
          onChange={([newMin, newMax]) => {
            onFiltersChange({
              ...filtersState,
              [config.id]: { ...state, min: newMin, max: newMax },
            });
          }}
          onIncludeNullChange={include => {
            onFiltersChange({
              ...filtersState,
              [config.id]: { ...state, includeNull: include },
            });
          }}
        />
      </div>
    );
  };

  // Render a boolean filter
  const renderBooleanFilter = (config: BooleanFilterConfig) => {
    const options = registry[config.id] as BooleanOptions | undefined;
    if (!options) return null;

    const state = filtersState[config.id];
    if (!state || state.type !== 'boolean') return null;

    return (
      <div key={config.id} className={styles.filterGroup}>
        <h4 className={styles.filterLabel}>{config.label}</h4>
        <div className={styles.booleanOptions}>
          <label className={styles.booleanOption}>
            <input
              type="radio"
              name={config.id}
              checked={state.value === null}
              onChange={() =>
                onFiltersChange({
                  ...filtersState,
                  [config.id]: { ...state, value: null },
                })
              }
            />
            <span>Any</span>
          </label>
          <label className={styles.booleanOption}>
            <input
              type="radio"
              name={config.id}
              checked={state.value === true}
              onChange={() =>
                onFiltersChange({
                  ...filtersState,
                  [config.id]: { ...state, value: true },
                })
              }
            />
            <span>
              {config.trueLabel || 'Yes'}
              <span className={styles.optionCount}>({options.trueCount})</span>
            </span>
          </label>
          <label className={styles.booleanOption}>
            <input
              type="radio"
              name={config.id}
              checked={state.value === false}
              onChange={() =>
                onFiltersChange({
                  ...filtersState,
                  [config.id]: { ...state, value: false },
                })
              }
            />
            <span>
              {config.falseLabel || 'No'}
              <span className={styles.optionCount}>({options.falseCount})</span>
            </span>
          </label>
        </div>
      </div>
    );
  };

  // Render a filter based on its type
  const renderFilter = (config: FilterConfig) => {
    switch (config.type) {
      case 'checkbox':
        return renderCheckboxFilter(config as CheckboxFilterConfig);
      case 'range':
        return renderRangeFilter(config as RangeFilterConfig);
      case 'boolean':
        return renderBooleanFilter(config as BooleanFilterConfig);
      default:
        return null;
    }
  };

  // Render a category section
  const renderCategory = (category: FilterCategory, filters: FilterConfig[]) => {
    const isExpanded = expandedCategories.has(category);
    const defaultFilters = filters.filter(f => f.defaultVisible);
    const advancedFilters = filters.filter(f => !f.defaultVisible);

    // Check if any filters in this category have data
    const hasVisibleFilters = filters.some(f => {
      const options = registry[f.id];
      if (!options) return false;
      switch (options.type) {
        case 'checkbox':
          return options.options.length > 0;
        case 'range':
          return options.availableCount > 0;
        case 'boolean':
          return true;
        default:
          return false;
      }
    });

    if (!hasVisibleFilters) return null;

    return (
      <div key={category} className={styles.categorySection}>
        <button
          className={styles.categoryHeader}
          onClick={() => toggleCategory(category)}
          aria-expanded={isExpanded}
        >
          <span className={styles.categoryTitle}>{FILTER_CATEGORY_LABELS[category]}</span>
          <span className={`${styles.categoryIcon} ${isExpanded ? styles.expanded : ''}`}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className={styles.categoryContent}>
            {defaultFilters.map(filter => renderFilter(filter))}

            {advancedFilters.length > 0 && (
              <>
                {showAdvanced && advancedFilters.map(filter => renderFilter(filter))}
                <button
                  className={styles.showMoreButton}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Show less' : `Show ${advancedFilters.length} more`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        {hasActiveFilters && (
          <button className={styles.clearAllButton} onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.searchSection}>
        <SearchBarV2
          value={searchQuery || ''}
          onChange={onSearchQueryChange}
        />
        <FilterChipsV2
          filtersState={filtersState}
          onFiltersChange={onFiltersChange}
          searchQuery={searchQuery || ''}
          onSearchChange={onSearchQueryChange}
        />
      </div>

      <div className={styles.categories}>
        {FILTER_CATEGORY_ORDER.map(category => {
          const filters = filtersByCategory.get(category);
          if (!filters) return null;
          return renderCategory(category, filters);
        })}
      </div>
    </aside>
  );
}
