import type { RackCase } from '@/lib/types'

export function searchProducts(products: RackCase[], query: string): RackCase[] {
  if (!query.trim()) return products

  const searchTerm = query.toLowerCase()

  return products.filter(product => {
    // Search in name
    if (product.name.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in model
    if (product.model.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in brand
    if (product.brand.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in rack units (case-insensitive comparison for user input)
    if (product.rack_units.toUpperCase().includes(searchTerm.toUpperCase())) {
      return true
    }

    // Search in motherboard support
    if (product.motherboard_support.some(mb => mb.toLowerCase().includes(searchTerm))) {
      return true
    }

    // Search in features
    if (product.features?.some(feature => feature.toLowerCase().includes(searchTerm))) {
      return true
    }

    return false
  })
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, char => htmlEscapes[char])
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text)

  // First escape the text to prevent XSS
  const escapedText = escapeHtml(text)
  const escapedQuery = escapeHtml(query)

  const escapedRegexQuery = escapeRegExp(escapedQuery)
  const regex = new RegExp(`(${escapedRegexQuery})`, 'gi')
  return escapedText.replace(regex, '<mark>$1</mark>')
}
