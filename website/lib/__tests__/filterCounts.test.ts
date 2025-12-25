import { describe, it, expect } from 'vitest'
import { calculateFilterCounts, getFilteredProductCount } from '../filterCounts'
import type { RackCase } from '@/lib/types'

// Create test products
const mockProducts: RackCase[] = [
  {
    id: '1',
    model: 'Model A',
    brand: 'BrandX',
    name: 'Product A',
    source: 'inter-tech.de',
    source_url: 'https://example.com/1',
    scraped_at: '2025-01-01',
    price: null,
    availability: 'in-stock',
    rack_units: '1U',
    dimensions: { width_mm: 100, height_mm: 44, depth_mm: 400, weight_kg: 5 },
    motherboard_support: ['Mini-ITX'],
    cpu_cooler: { max_height_mm: 50 },
    fan_mounts: [],
    radiator_support: [],
    drive_bays: [],
    total_25_bays: 0,
    total_35_bays: 0,
    total_525_bays: 0,
    has_hot_swap: false,
    expansion_slots: [],
    total_pcie_slots: 0,
    has_full_height_slots: false,
    gpu_support: { max_length_mm: null, max_height_mm: null },
    psu_support: { types: [], max_length_mm: null },
    psu_included: false,
    front_io: {
      usb_type_a_2_0: 0,
      usb_type_a_3_0: 0,
      usb_type_a_3_1: 0,
      usb_type_c: 0,
      audio_jack: false,
      mic_jack: false,
      power_button: true,
      reset_button: false,
    },
    features: [],
  },
  {
    id: '2',
    model: 'Model B',
    brand: 'BrandX',
    name: 'Product B',
    source: 'sliger.com',
    source_url: 'https://example.com/2',
    scraped_at: '2025-01-01',
    price: null,
    availability: 'in-stock',
    rack_units: '2U',
    dimensions: { width_mm: 100, height_mm: 88, depth_mm: 400, weight_kg: 8 },
    motherboard_support: ['ATX'],
    cpu_cooler: { max_height_mm: 150 },
    fan_mounts: [],
    radiator_support: [],
    drive_bays: [],
    total_25_bays: 2,
    total_35_bays: 0,
    total_525_bays: 0,
    has_hot_swap: false,
    expansion_slots: [],
    total_pcie_slots: 0,
    has_full_height_slots: false,
    gpu_support: { max_length_mm: null, max_height_mm: null },
    psu_support: { types: [], max_length_mm: null },
    psu_included: false,
    front_io: {
      usb_type_a_2_0: 0,
      usb_type_a_3_0: 0,
      usb_type_a_3_1: 0,
      usb_type_c: 0,
      audio_jack: false,
      mic_jack: false,
      power_button: true,
      reset_button: false,
    },
    features: [],
  },
  {
    id: '3',
    model: 'Model C',
    brand: 'BrandY',
    name: 'Product C',
    source: 'inter-tech.de',
    source_url: 'https://example.com/3',
    scraped_at: '2025-01-01',
    price: null,
    availability: 'in-stock',
    rack_units: '2U',
    dimensions: { width_mm: 100, height_mm: 88, depth_mm: 500, weight_kg: 10 },
    motherboard_support: ['E-ATX'],
    cpu_cooler: { max_height_mm: 180 },
    fan_mounts: [],
    radiator_support: [],
    drive_bays: [],
    total_25_bays: 4,
    total_35_bays: 2,
    total_525_bays: 0,
    has_hot_swap: true,
    expansion_slots: [],
    total_pcie_slots: 0,
    has_full_height_slots: false,
    gpu_support: { max_length_mm: null, max_height_mm: null },
    psu_support: { types: [], max_length_mm: null },
    psu_included: false,
    front_io: {
      usb_type_a_2_0: 0,
      usb_type_a_3_0: 0,
      usb_type_a_3_1: 0,
      usb_type_c: 0,
      audio_jack: false,
      mic_jack: false,
      power_button: true,
      reset_button: false,
    },
    features: [],
  },
]

describe('Filter Counts', () => {
  describe('calculateFilterCounts', () => {
    it('returns correct counts with no filters applied', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
      })

      expect(counts.rack_units['1U']).toBe(1)
      expect(counts.rack_units['2U']).toBe(2)
      expect(counts.source['inter-tech.de']).toBe(2)
      expect(counts.source['sliger.com']).toBe(1)
      expect(counts.brand['BrandX']).toBe(2)
      expect(counts.brand['BrandY']).toBe(1)
    })

    it('returns correct counts when rack_units filter is applied', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: ['2U'],
        source: [],
        brand: [],
      })

      // Rack units should still show all (not filtered by itself)
      expect(counts.rack_units['1U']).toBe(1)
      expect(counts.rack_units['2U']).toBe(2)

      // Other filters should show counts within 2U selection
      expect(counts.source['inter-tech.de']).toBe(1) // Only Product C
      expect(counts.source['sliger.com']).toBe(1) // Only Product B
      expect(counts.brand['BrandX']).toBe(1) // Only Product B
      expect(counts.brand['BrandY']).toBe(1) // Only Product C
    })

    it('returns correct counts when source filter is applied', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: [],
        source: ['inter-tech.de'],
        brand: [],
      })

      // Source should show all (not filtered by itself)
      expect(counts.source['inter-tech.de']).toBe(2)
      expect(counts.source['sliger.com']).toBe(1)

      // Other filters should show counts within inter-tech selection
      expect(counts.rack_units['1U']).toBe(1) // Product A
      expect(counts.rack_units['2U']).toBe(1) // Product C
      expect(counts.brand['BrandX']).toBe(1) // Product A
      expect(counts.brand['BrandY']).toBe(1) // Product C
    })

    it('returns correct counts when multiple filters are applied', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: ['2U'],
        source: ['inter-tech.de'],
        brand: [],
      })

      // Rack units filtered by source only (Product A and C)
      expect(counts.rack_units['1U']).toBe(1) // Product A
      expect(counts.rack_units['2U']).toBe(1) // Product C

      // Source filtered by rack_units only (Product B and C)
      expect(counts.source['inter-tech.de']).toBe(1) // Product C
      expect(counts.source['sliger.com']).toBe(1) // Product B

      // Brand filtered by rack_units AND source (only Product C)
      expect(counts.brand['BrandX'] || 0).toBe(0) // None match 2U + inter-tech
      expect(counts.brand['BrandY']).toBe(1) // Product C
    })

    it('handles filters with no matching products', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: ['4U'], // Non-existent
        source: [],
        brand: [],
      })

      expect(counts.rack_units['1U']).toBe(1)
      expect(counts.rack_units['2U']).toBe(2)
      expect(counts.source['inter-tech.de'] || 0).toBe(0)
      expect(counts.source['sliger.com'] || 0).toBe(0)
      expect(counts.brand['BrandX'] || 0).toBe(0)
      expect(counts.brand['BrandY'] || 0).toBe(0)
    })
  })

  describe('getFilteredProductCount', () => {
    it('returns total count with no filters', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
      })

      expect(count).toBe(3)
    })

    it('returns correct count with rack_units filter', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: ['2U'],
        source: [],
        brand: [],
      })

      expect(count).toBe(2) // Products B and C
    })

    it('returns correct count with multiple filters', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: ['2U'],
        source: ['inter-tech.de'],
        brand: [],
      })

      expect(count).toBe(1) // Only Product C
    })

    it('returns 0 when no products match', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: ['4U'],
        source: [],
        brand: [],
      })

      expect(count).toBe(0)
    })
  })

  describe('with search query', () => {
    it('filters by search query across all categories', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
        q: 'BrandX',
      })

      // Should only show products from BrandX (Products A and B)
      expect(counts.rack_units['1U']).toBe(1) // Product A
      expect(counts.rack_units['2U']).toBe(1) // Product B
      expect(counts.rack_units['3U']).toBeUndefined()
    })

    it('combines search with other filters', () => {
      const counts = calculateFilterCounts(mockProducts, {
        rack_units: ['2U'],
        source: [],
        brand: [],
        q: 'BrandX',
      })

      // With 2U selected and searching for BrandX, should only affect other categories
      expect(counts.source['sliger.com']).toBe(1) // Product B matches both 2U and BrandX
      expect(counts.source['inter-tech.de']).toBeUndefined() // Product C is 2U but not BrandX
    })

    it('returns correct product count with search', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
        q: 'Product A',
      })

      expect(count).toBe(1) // Only Product A
    })

    it('search is case-insensitive', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
        q: 'brandy',
      })

      expect(count).toBe(1) // Product D (BrandY)
    })

    it('searches across multiple fields', () => {
      const count = getFilteredProductCount(mockProducts, {
        rack_units: [],
        source: [],
        brand: [],
        q: 'sliger',
      })

      expect(count).toBe(1) // Product B (source: sliger.com)
    })
  })
})
