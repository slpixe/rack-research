import { getAllProducts, getRackUnits, getSources, getBrands } from '@/lib/db'
import { ProductsPageClient } from '@/components/ProductsPageClient'

export default function HomePage() {
  const products = getAllProducts()
  const rackUnits = getRackUnits()
  const sources = getSources()
  const brands = getBrands()

  return (
    <ProductsPageClient
      products={products}
      rackUnits={rackUnits}
      sources={sources}
      brands={brands}
    />
  )
}
