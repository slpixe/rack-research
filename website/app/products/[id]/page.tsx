import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllProducts, getProductById } from '@/lib/db'
import styles from './page.module.css'

// Generate static pages for all products
export async function generateStaticParams() {
  const products = getAllProducts()
  return products.map(p => ({ id: p.id }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div>
      <nav className={styles.breadcrumb}>
        <Link href="/products" className={styles.breadcrumbLink}>
          Products
        </Link>
        {' / '}
        {product.name}
      </nav>

      <header className={styles.header}>
        <p className={styles.brand}>{product.brand}</p>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.subtitle}>{product.rack_units} Rack Mount Case</p>
        <div className={styles.tags}>
          <span className={styles.tag}>{product.rack_units}</span>
          <span className={styles.tag}>{product.source}</span>
          {product.has_hot_swap && <span className={styles.tag}>Hot-swap</span>}
          {product.motherboard_support.map(mb => (
            <span key={mb} className={styles.tag}>{mb}</span>
          ))}
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dimensions</h2>
          <ul className={styles.specList}>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Width</span>
              <span className={styles.specValue}>
                {product.dimensions.width_mm ? `${product.dimensions.width_mm}mm` : '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Height</span>
              <span className={styles.specValue}>
                {product.dimensions.height_mm ? `${product.dimensions.height_mm}mm` : '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Depth</span>
              <span className={styles.specValue}>
                {product.dimensions.depth_mm ? `${product.dimensions.depth_mm}mm` : '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Weight</span>
              <span className={styles.specValue}>
                {product.dimensions.weight_kg ? `${product.dimensions.weight_kg}kg` : '—'}
              </span>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Storage</h2>
          <ul className={styles.specList}>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>3.5&quot; Bays</span>
              <span className={styles.specValue}>{product.total_35_bays}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>2.5&quot; Bays</span>
              <span className={styles.specValue}>{product.total_25_bays}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>5.25&quot; Bays</span>
              <span className={styles.specValue}>{product.total_525_bays}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Hot-swap</span>
              <span className={styles.specValue}>{product.has_hot_swap ? 'Yes' : 'No'}</span>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cooling</h2>
          <ul className={styles.specList}>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>CPU Cooler Height</span>
              <span className={styles.specValue}>
                {product.cpu_cooler.max_height_mm ? `${product.cpu_cooler.max_height_mm}mm` : '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Fan Mounts</span>
              <span className={styles.specValue}>{product.fan_mounts.length}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Radiator Support</span>
              <span className={styles.specValue}>
                {product.radiator_support.length > 0 ? 'Yes' : 'No'}
              </span>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Expansion</h2>
          <ul className={styles.specList}>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>PCIe Slots</span>
              <span className={styles.specValue}>{product.total_pcie_slots}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Full-height Slots</span>
              <span className={styles.specValue}>{product.has_full_height_slots ? 'Yes' : 'No'}</span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>GPU Max Length</span>
              <span className={styles.specValue}>
                {product.gpu_support.max_length_mm ? `${product.gpu_support.max_length_mm}mm` : '—'}
              </span>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Power Supply</h2>
          <ul className={styles.specList}>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>PSU Types</span>
              <span className={styles.specValue}>
                {product.psu_support.types.join(', ') || '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>Max PSU Length</span>
              <span className={styles.specValue}>
                {product.psu_support.max_length_mm ? `${product.psu_support.max_length_mm}mm` : '—'}
              </span>
            </li>
            <li className={styles.specItem}>
              <span className={styles.specLabel}>PSU Included</span>
              <span className={styles.specValue}>{product.psu_included ? 'Yes' : 'No'}</span>
            </li>
          </ul>
        </section>

        {product.features.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Features</h2>
            <ul className={styles.featureList}>
              {product.features.map((feature, i) => (
                <li key={i} className={styles.featureItem}>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {product.source_url && (
        <div className={styles.actions}>
          <a
            href={product.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            View on {product.source} →
          </a>
        </div>
      )}
    </div>
  )
}
