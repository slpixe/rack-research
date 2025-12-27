import { getAllProducts } from '@/lib/db'
import { ProductsPageClient } from '@/components/ProductsPageClient'

export default function HomePage() {
  const products = getAllProducts()

  return <ProductsPageClient products={products} />
}
