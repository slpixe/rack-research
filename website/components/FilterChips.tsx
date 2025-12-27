'use client';

import { FILTER_CONFIGS, type RangeFilterConfig, type BooleanFilterConfig } from '@/lib/filters/filterConfig';
import type { FiltersState } from '@/lib/filters';
import styles from './FilterChips.module.css';

interface FilterChipsProps {
  filtersState: FiltersState;
  onFiltersChange: (newState: FiltersState) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface Chip {
  filterId: string;
  label: string;
  value: string;
  displayValue: string;
}

export function FilterChips({
  filtersState,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: FilterChipsProps) {
  const chips: Chip[] = [];

  // Add search chip
  if (searchQuery.trim()) {
    chips.push({
      filterId: 'q',
      label: 'Search',
      value: searchQuery,
      displayValue: `"${searchQuery}"`,
    });
  }

  // Build chips from filter state
  for (const [filterId, state] of Object.entries(filtersState)) {
    const config = FILTER_CONFIGS.find(f => f.id === filterId);
    if (!config) continue;

    switch (state.type) {
      case 'checkbox':
        for (const value of state.selected) {
          chips.push({
            filterId,
            label: config.label,
            value,
            displayValue: value,
          });
        }
        break;

      case 'range':
        if (state.min != null || state.max != null) {
          const rangeConfig = config as RangeFilterConfig;
          let displayValue: string;
          if (state.min != null && state.max != null) {
            displayValue = `${state.min}${rangeConfig.unit} – ${state.max}${rangeConfig.unit}`;
          } else if (state.min != null) {
            displayValue = `≥ ${state.min}${rangeConfig.unit}`;
          } else {
            displayValue = `≤ ${state.max}${rangeConfig.unit}`;
          }
          chips.push({
            filterId,
            label: config.label,
            value: 'range',
            displayValue,
          });
        }
        break;

      case 'boolean':
        if (state.value !== null) {
          const boolConfig = config as BooleanFilterConfig;
          chips.push({
            filterId,
            label: config.label,
            value: String(state.value),
            displayValue: state.value ? (boolConfig.trueLabel || 'Yes') : (boolConfig.falseLabel || 'No'),
          });
        }
        break;
    }
  }

  if (chips.length === 0) return null;

  const removeChip = (chip: Chip) => {
    // Handle search removal
    if (chip.filterId === 'q') {
      onSearchChange('');
      return;
    }

    const state = filtersState[chip.filterId];
    if (!state) return;

    switch (state.type) {
      case 'checkbox':
        onFiltersChange({
          ...filtersState,
          [chip.filterId]: {
            ...state,
            selected: state.selected.filter(v => v !== chip.value),
          },
        });
        break;

      case 'range':
        onFiltersChange({
          ...filtersState,
          [chip.filterId]: {
            ...state,
            min: null,
            max: null,
          },
        });
        break;

      case 'boolean':
        onFiltersChange({
          ...filtersState,
          [chip.filterId]: {
            ...state,
            value: null,
          },
        });
        break;
    }
  };

  return (
    <div className={styles.chips}>
      {chips.map(chip => (
        <span key={`${chip.filterId}-${chip.value}`} className={styles.chip}>
          <span className={styles.chipLabel}>{chip.label}:</span> {chip.displayValue}
          <button
            className={styles.chipRemove}
            onClick={() => removeChip(chip)}
            aria-label={`Remove ${chip.displayValue} filter`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
