'use client'

import { useProductFilters } from '@/lib/hooks/useProductFilters'
import styles from './FilterSidebar.module.css'

interface FilterSidebarProps {
  rackUnits: string[]
  sources: string[]
  brands: string[]
}

export function FilterSidebar({ rackUnits, sources, brands }: FilterSidebarProps) {
  const { filters, updateFilters, clearAllFilters } = useProductFilters()

  const selectedRackUnits = filters.rack_units?.split(',').filter(Boolean) || []
  const selectedSources = filters.source?.split(',').filter(Boolean) || []
  const selectedBrands = filters.brand?.split(',').filter(Boolean) || []

  const hasActiveFilters =
    selectedRackUnits.length > 0 || selectedSources.length > 0 || selectedBrands.length > 0

  const toggleFilter = (key: string, value: string) => {
    const currentKey = key === 'rack_units' ? 'rack_units' : key === 'source' ? 'source' : 'brand'
    const current =
      key === 'rack_units'
        ? selectedRackUnits
        : key === 'source'
          ? selectedSources
          : selectedBrands

    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]

    updateFilters({ [currentKey]: updated })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Rack Units</h3>
        <ul className={styles.filterList}>
          {rackUnits.map(unit => (
            <li key={unit} className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={selectedRackUnits.includes(unit)}
                  onChange={() => toggleFilter('rack_units', unit)}
                />
                {unit}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Source</h3>
        <ul className={styles.filterList}>
          {sources.map(source => (
            <li key={source} className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleFilter('source', source)}
                />
                {source}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Brand</h3>
        <ul className={styles.filterList}>
          {brands.map(brand => (
            <li key={brand} className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleFilter('brand', brand)}
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {hasActiveFilters && (
        <button className={styles.clearButton} onClick={clearAllFilters}>
          Clear All Filters
        </button>
      )}
    </aside>
  )
}
