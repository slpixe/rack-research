'use client'

import { Suspense } from 'react'
import { FilterSidebar } from './FilterSidebar'
import { FilterChips } from './FilterChips'
import { ProductGrid } from './ProductGrid'
import type { RackCase } from '@/lib/types'
import styles from './ProductsPage.module.css'

interface ProductsPageClientProps {
  products: RackCase[]
  rackUnits: string[]
  sources: string[]
  brands: string[]
}

function ProductsPageContent({
  products,
  rackUnits,
  sources,
  brands,
}: ProductsPageClientProps) {
  return (
    <div className={styles.container}>
      <FilterSidebar rackUnits={rackUnits} sources={sources} brands={brands} />
      <div className={styles.content}>
        <FilterChips />
        <ProductGrid products={products} />
      </div>
    </div>
  )
}

export function ProductsPageClient(props: ProductsPageClientProps) {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent {...props} />
    </Suspense>
  )
}

function ProductsPageFallback() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebarFallback}>
        <div className={styles.sidebarSection}>
          <div className={styles.loadingBar} style={{ width: '60%' }} />
          <div className={styles.loadingBar} style={{ width: '80%' }} />
          <div className={styles.loadingBar} style={{ width: '70%' }} />
        </div>
      </aside>
      <div className={styles.content}>
        <div className={styles.loadingBar} style={{ width: '200px', height: '2rem' }} />
        <div className={styles.gridFallback}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.cardFallback}>
              <div className={styles.loadingBar} style={{ width: '40%' }} />
              <div className={styles.loadingBar} style={{ width: '90%', height: '1.25rem' }} />
              <div className={styles.loadingBar} style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
