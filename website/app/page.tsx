import Link from 'next/link'
import { getAllProducts, getSources, getBrands } from '@/lib/db'
import styles from './page.module.css'

export default function HomePage() {
  const products = getAllProducts()
  const sources = getSources()
  const brands = getBrands()

  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>Rack Research</h1>
        <p className={styles.subtitle}>
          Compare {products.length} server rack cases from {sources.length} vendors
        </p>
        <Link href="/products" className={styles.ctaButton}>
          Browse All Cases
        </Link>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statValue}>{products.length}</div>
          <div className={styles.statLabel}>Products</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏭</div>
          <div className={styles.statValue}>{brands.length}</div>
          <div className={styles.statLabel}>Brands</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌐</div>
          <div className={styles.statValue}>{sources.length}</div>
          <div className={styles.statLabel}>Sources</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statValue}>Free</div>
          <div className={styles.statLabel}>Open Source</div>
        </div>
      </section>
    </div>
  )
}
