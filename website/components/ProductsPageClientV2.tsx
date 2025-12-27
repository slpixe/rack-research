'use client';

import { Suspense } from 'react';
import { FilterSidebarV2 } from './FilterSidebarV2';
import { FilterChipsV2 } from './FilterChipsV2';
import { SearchBarV2 } from './SearchBarV2';
import { ProductGridV2 } from './ProductGridV2';
import { useFilters } from '@/lib/hooks/useFilters';
import type { RackCase } from '@/lib/types';
import styles from './ProductsPage.module.css';

interface ProductsPageV2Props {
  products: RackCase[];
}

function ProductsPageContent({ products }: ProductsPageV2Props) {
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
      <FilterSidebarV2
        allProducts={products}
        filtersState={filtersState}
        onFiltersChange={updateFilters}
        searchQuery={searchQuery}
        onSearchQueryChange={updateSearchQuery}
        onClearAll={clearAllFilters}
      />
      <div className={styles.content}>
        <ProductGridV2
          products={filteredProducts}
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );
}

export function ProductsPageClientV2(props: ProductsPageV2Props) {
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
