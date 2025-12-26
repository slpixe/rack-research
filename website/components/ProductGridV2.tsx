'use client';

import Link from 'next/link';
import { highlightMatches } from '@/lib/search';
import type { RackCase } from '@/lib/types';
import styles from './ProductGrid.module.css';

interface ProductGridV2Props {
  products: RackCase[];
  searchQuery?: string;
  hasActiveFilters: boolean;
}

export function ProductGridV2({
  products,
  searchQuery = '',
  hasActiveFilters,
}: ProductGridV2Props) {
  const renderHighlightedText = (text: string) => {
    if (!searchQuery) return text;
    return <span dangerouslySetInnerHTML={{ __html: highlightMatches(text, searchQuery) }} />;
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Products <span className={styles.count}>({products.length})</span>
        </h1>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            No products found
            {searchQuery ? ` for "${searchQuery}"` : hasActiveFilters ? ' matching your filters' : ''}.
          </p>
          {hasActiveFilters && (
            <p className={styles.emptyHint}>Try adjusting your filters or search terms.</p>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.cardLink}
            >
              <article className={styles.card}>
                <div className={styles.cardBrand}>{renderHighlightedText(product.brand)}</div>
                <h2 className={styles.cardName}>{renderHighlightedText(product.name)}</h2>
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
                  {product.psu_support?.types?.[0] && (
                    <span className={styles.cardTag}>
                      {product.psu_support.types[0]} PSU
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
                  {product.gpu_support?.max_length_mm && (
                    <div className={styles.cardSpec}>
                      GPU: up to {product.gpu_support.max_length_mm}mm
                    </div>
                  )}
                </div>
                {product.price?.amount && (
                  <div className={styles.cardPrice}>
                    {product.price.currency === 'EUR' ? '€' : product.price.currency === 'GBP' ? '£' : '$'}
                    {product.price.amount.toFixed(2)}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
