'use client'

import { useProductFilters } from '@/lib/hooks/useProductFilters'
import { useMemo } from 'react'
import { calculateFilterCounts } from '@/lib/filterCounts'
import type { RackCase } from '@/lib/types'
import styles from './FilterSidebar.module.css'

interface FilterSidebarProps {
  rackUnits: string[]
  sources: string[]
  brands: string[]
  allProducts: RackCase[]
}

export function FilterSidebar({ rackUnits, sources, brands, allProducts }: FilterSidebarProps) {
  const { filters, updateFilters, clearAllFilters } = useProductFilters()

  const selectedRackUnits = filters.rack_units?.split(',').filter(Boolean) || []
  const selectedSources = filters.source?.split(',').filter(Boolean) || []
  const selectedBrands = filters.brand?.split(',').filter(Boolean) || []

  // Calculate filter counts based on current selections
  const filterCounts = useMemo(() => {
    return calculateFilterCounts(allProducts, {
      rack_units: selectedRackUnits,
      source: selectedSources,
      brand: selectedBrands,
    })
  }, [allProducts, selectedRackUnits, selectedSources, selectedBrands])

  const hasActiveFilters =
    selectedRackUnits.length > 0 || selectedSources.length > 0 || selectedBrands.length > 0

  const toggleFilter = (key: string, value: string) => {
    const selectedMap: Record<string, string[]> = {
      rack_units: selectedRackUnits,
      source: selectedSources,
      brand: selectedBrands,
    }
    const current = selectedMap[key] || []

    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]

    updateFilters({ [key]: updated })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Rack Units</h3>
        <ul className={styles.filterList}>
          {rackUnits.map(unit => {
            const count = filterCounts.rack_units[unit] || 0
            return (
              <li key={unit} className={styles.filterItem}>
                <label className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={selectedRackUnits.includes(unit)}
                    onChange={() => toggleFilter('rack_units', unit)}
                    disabled={count === 0 && !selectedRackUnits.includes(unit)}
                  />
                  <span className={styles.filterText}>
                    {unit}
                    <span className={styles.filterCount}>({count})</span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Source</h3>
        <ul className={styles.filterList}>
          {sources.map(source => {
            const count = filterCounts.source[source] || 0
            return (
              <li key={source} className={styles.filterItem}>
                <label className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={() => toggleFilter('source', source)}
                    disabled={count === 0 && !selectedSources.includes(source)}
                  />
                  <span className={styles.filterText}>
                    {source}
                    <span className={styles.filterCount}>({count})</span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Brand</h3>
        <ul className={styles.filterList}>
          {brands.map(brand => {
            const count = filterCounts.brand[brand] || 0
            return (
              <li key={brand} className={styles.filterItem}>
                <label className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleFilter('brand', brand)}
                    disabled={count === 0 && !selectedBrands.includes(brand)}
                  />
                  <span className={styles.filterText}>
                    {brand}
                    <span className={styles.filterCount}>({count})</span>
                  </span>
                </label>
              </li>
            )
          })}
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
