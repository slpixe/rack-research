'use client';

import { Suspense } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { FilterChips } from './FilterChips';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { useFilters } from '@/lib/hooks/useFilters';
import type { RackCase } from '@/lib/types';
import styles from './ProductsPage.module.css';

interface ProductsPageProps {
  products: RackCase[];
}

function ProductsPageContent({ products }: ProductsPageProps) {
  const {
    filtersState,
    searchQuery,
    filteredProducts,
    updateFilters,
    updateSearchQuery,
    clearAllFilters,
    hasActiveFilters,
  } = useFilters({ products });

  return (
    <div className={styles.container}>
      <FilterSidebar
        allProducts={products}
        filtersState={filtersState}
        onFiltersChange={updateFilters}
        searchQuery={searchQuery}
        onSearchQueryChange={updateSearchQuery}
        onClearAll={clearAllFilters}
      />
      <div className={styles.content}>
        <ProductGrid
          products={filteredProducts}
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );
}

export function ProductsPageClient(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent {...props} />
    </Suspense>
  );
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
  );
}
