'use client'

import Link from 'next/link'
import { useProductFilters } from '@/lib/hooks/useProductFilters'
import type { RackCase } from '@/lib/types'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  products: RackCase[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { filters } = useProductFilters()

  const selectedRackUnits = filters.rack_units?.split(',').filter(Boolean) || []
  const selectedSources = filters.source?.split(',').filter(Boolean) || []
  const selectedBrands = filters.brand?.split(',').filter(Boolean) || []

  // Apply filters client-side
  let filtered = products

  if (selectedRackUnits.length > 0) {
    filtered = filtered.filter(p => selectedRackUnits.includes(p.rack_units))
  }

  if (selectedSources.length > 0) {
    filtered = filtered.filter(p => selectedSources.includes(p.source))
  }

  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p => selectedBrands.includes(p.brand))
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Products <span className={styles.count}>({filtered.length})</span>
        </h1>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No products found matching your filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.cardLink}
            >
              <article className={styles.card}>
                <div className={styles.cardBrand}>{product.brand}</div>
                <h2 className={styles.cardName}>{product.name}</h2>
                <div className={styles.cardMeta}>
                  <span className={styles.cardTag}>{product.rack_units}</span>
                  {product.has_hot_swap && (
                    <span className={styles.cardTag}>Hot-swap</span>
                  )}
                  {product.motherboard_support.length > 0 && (
                    <span className={styles.cardTag}>
                      {product.motherboard_support[product.motherboard_support.length - 1]}
                    </span>
                  )}
                </div>
                <div className={styles.cardSpecs}>
                  {product.dimensions.depth_mm && (
                    <div className={styles.cardSpec}>
                      Depth: {product.dimensions.depth_mm}mm
                    </div>
                  )}
                  <div className={styles.cardSpec}>
                    Storage: {product.total_35_bays}× 3.5&quot; / {product.total_25_bays}× 2.5&quot;
                  </div>
                </div>
                {product.price?.amount && (
                  <div className={styles.cardPrice}>
                    {product.price.currency === 'EUR' ? '€' : '$'}
                    {product.price.amount.toFixed(2)}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
