import Link from 'next/link'
import { getAllProducts, getRackUnits, getSources, getBrands } from '@/lib/db'
import styles from './page.module.css'

// For static export, we show all products without server-side filtering
// TODO: Implement client-side filtering with URL state
export default function ProductsPage() {
  const allProducts = getAllProducts()
  const filtered = allProducts

  const rackUnits = getRackUnits()
  const sources = getSources()
  const brands = getBrands()

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Rack Units</h3>
          <ul className={styles.filterList}>
            {rackUnits.map(unit => (
              <li key={unit} className={styles.filterItem}>
                <label className={styles.filterLabel}>
                  <input type="checkbox" value={unit} />
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
                  <input type="checkbox" value={source} />
                  {source}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Brand</h3>
          <ul className={styles.filterList}>
            {brands.slice(0, 10).map(brand => (
              <li key={brand} className={styles.filterItem}>
                <label className={styles.filterLabel}>
                  <input type="checkbox" value={brand} />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className={styles.content}>
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
      </div>
    </div>
  )
}
