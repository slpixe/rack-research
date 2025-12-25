'use client'

import { useProductFilters } from '@/lib/hooks/useProductFilters'
import styles from './FilterChips.module.css'

const filterLabels: Record<string, string> = {
  rack_units: 'Size',
  source: 'Source',
  brand: 'Brand',
}

export function FilterChips() {
  const { filters, updateFilters } = useProductFilters()

  const chips = Object.entries(filters).flatMap(([key, value]) => {
    if (!value) return []
    const values = value.split(',').filter(Boolean)
    return values.map((v: string) => ({ key, value: v, label: filterLabels[key] || key }))
  })

  if (chips.length === 0) return null

  const removeChip = (key: string, value: string) => {
    const currentValue = filters[key as keyof typeof filters]
    if (!currentValue) return

    const current = currentValue.split(',').filter(Boolean)
    const updated = current.filter(v => v !== value)
    updateFilters({ [key]: updated })
  }

  return (
    <div className={styles.chips}>
      {chips.map(({ key, value, label }) => (
        <span key={`${key}-${value}`} className={styles.chip}>
          <span className={styles.chipLabel}>{label}:</span> {value}
          <button
            className={styles.chipRemove}
            onClick={() => removeChip(key, value)}
            aria-label={`Remove ${value} filter`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
