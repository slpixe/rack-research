import productsData from '@data/products.json'
import type { RackCase } from '@/lib/types'

interface ProductsDatabase {
  generated_at: string
  total_products: number
  sources: string[]
  products: RackCase[]
}

const db = productsData as ProductsDatabase

export function getAllProducts(): RackCase[] {
  return db.products
}

export function getProductById(id: string): RackCase | undefined {
  return db.products.find(p => p.id === id)
}

export function getProductsBySource(source: string): RackCase[] {
  return db.products.filter(p => p.source === source)
}

export function getSources(): string[] {
  return db.sources
}

export function getBrands(): string[] {
  return [...new Set(db.products.map(p => p.brand))]
}

export function getRackUnits(): string[] {
  return [...new Set(db.products.map(p => p.rack_units))].sort()
}

export function getTotalProducts(): number {
  return db.total_products
}
