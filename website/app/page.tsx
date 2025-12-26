import { getAllProducts } from '@/lib/db'
import { ProductsPageClientV2 } from '@/components/ProductsPageClientV2'

export default function HomePage() {
  const products = getAllProducts()

  return <ProductsPageClientV2 products={products} />
}
