import type { RackCase } from '@/lib/types'

export interface FilterCounts {
  rack_units: Record<string, number>
  source: Record<string, number>
  brand: Record<string, number>
}

export interface ActiveFilters {
  rack_units: string[]
  source: string[]
  brand: string[]
  q?: string
}

/**
 * Check if a product matches the search query
 */
function matchesSearchQuery(product: RackCase, query?: string): boolean {
  if (!query || query.trim() === '') return true
  
  const searchLower = query.toLowerCase()
  const searchableFields = [
    product.name,
    product.brand,
    product.source,
    product.rack_units,
    ...(product.motherboard_support || []),
  ].filter(Boolean)
  
  return searchableFields.some(field => 
    field?.toLowerCase().includes(searchLower)
  )
}

/**
 * Calculate the number of products that match each filter option,
 * taking into account currently active filters from other categories.
 * 
 * For example, if "2U" is selected:
 * - Brand counts show how many 2U products exist for each brand
 * - Source counts show how many 2U products exist for each source
 * - Rack units shows total count for each size (without applying rack_units filter)
 */
export function calculateFilterCounts(
  allProducts: RackCase[],
  activeFilters: ActiveFilters
): FilterCounts {
  const counts: FilterCounts = {
    rack_units: {},
    source: {},
    brand: {},
  }

  // For each filter category, apply filters from OTHER categories only
  // This shows "how many results will I get if I toggle this filter"
  
  // Calculate rack_units counts (apply source + brand + search filters only)
  const filteredForRackUnits = allProducts.filter(product => {
    const matchesSource = activeFilters.source.length === 0 || 
      activeFilters.source.includes(product.source)
    const matchesBrand = activeFilters.brand.length === 0 || 
      activeFilters.brand.includes(product.brand)
    const matchesSearch = matchesSearchQuery(product, activeFilters.q)
    return matchesSource && matchesBrand && matchesSearch
  })
  
  filteredForRackUnits.forEach(product => {
    counts.rack_units[product.rack_units] = (counts.rack_units[product.rack_units] || 0) + 1
  })

  // Calculate source counts (apply rack_units + brand + search filters only)
  const filteredForSource = allProducts.filter(product => {
    const matchesRackUnits = activeFilters.rack_units.length === 0 || 
      activeFilters.rack_units.includes(product.rack_units)
    const matchesBrand = activeFilters.brand.length === 0 || 
      activeFilters.brand.includes(product.brand)
    const matchesSearch = matchesSearchQuery(product, activeFilters.q)
    return matchesRackUnits && matchesBrand && matchesSearch
  })
  
  filteredForSource.forEach(product => {
    counts.source[product.source] = (counts.source[product.source] || 0) + 1
  })

  // Calculate brand counts (apply rack_units + source + search filters only)
  const filteredForBrand = allProducts.filter(product => {
    const matchesRackUnits = activeFilters.rack_units.length === 0 || 
      activeFilters.rack_units.includes(product.rack_units)
    const matchesSource = activeFilters.source.length === 0 || 
      activeFilters.source.includes(product.source)
    const matchesSearch = matchesSearchQuery(product, activeFilters.q)
    return matchesRackUnits && matchesSource && matchesSearch
  })
  
  filteredForBrand.forEach(product => {
    counts.brand[product.brand] = (counts.brand[product.brand] || 0) + 1
  })

  return counts
}

/**
 * Get the total number of products matching the active filters
 */
export function getFilteredProductCount(
  allProducts: RackCase[],
  activeFilters: ActiveFilters
): number {
  return allProducts.filter(product => {
    const matchesRackUnits = activeFilters.rack_units.length === 0 || 
      activeFilters.rack_units.includes(product.rack_units)
    const matchesSource = activeFilters.source.length === 0 || 
      activeFilters.source.includes(product.source)
    const matchesBrand = activeFilters.brand.length === 0 || 
      activeFilters.brand.includes(product.brand)
    const matchesSearch = matchesSearchQuery(product, activeFilters.q)
    return matchesRackUnits && matchesSource && matchesBrand && matchesSearch
  }).length
}
