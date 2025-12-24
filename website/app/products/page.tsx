import Link from 'next/link'
import { getAllProducts, getRackUnits, getSources, getBrands } from '@/lib/db'
import styles from './page.module.css'

interface SearchParams {
  rack_units?: string
  source?: string
  brand?: string
  depth_min?: string
  depth_max?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const allProducts = getAllProducts()

  // Apply filters
  let filtered = allProducts

  if (params.rack_units) {
    const units = params.rack_units.split(',')
    filtered = filtered.filter(p => units.includes(p.rack_units))
  }

  if (params.source) {
    filtered = filtered.filter(p => p.source === params.source)
  }

  if (params.brand) {
    filtered = filtered.filter(p => p.brand === params.brand)
  }

  if (params.depth_min) {
    const min = parseInt(params.depth_min)
    filtered = filtered.filter(p => p.dimensions.depth_mm && p.dimensions.depth_mm >= min)
  }

  if (params.depth_max) {
    const max = parseInt(params.depth_max)
    filtered = filtered.filter(p => p.dimensions.depth_mm && p.dimensions.depth_mm <= max)
  }

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
