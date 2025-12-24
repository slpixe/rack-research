import styles from './page.module.css'

export default function ComparePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compare Products</h1>
      <p className={styles.description}>
        Side-by-side comparison of rack cases
      </p>
      <div className={styles.placeholder}>
        <p>🚧 Coming Soon</p>
        <p>Select products to compare their specifications</p>
      </div>
    </div>
  )
}
