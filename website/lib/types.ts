/**
 * Type definitions for the website
 * 
 * Simplified version of the pipeline types for use in the Next.js website.
 * These match the structure in data/products.json.
 */

// ============================================================================
// ENUMS
// ============================================================================

export type RackUnits =
  | '1U'
  | '1.5U'
  | '2U'
  | '3U'
  | '4U'
  | '5U'
  | '6U'
  | '7U'
  | '8U'
  | '9U'
  | '10U'
  | '11U'
  | '12U'
  | '13U'

export type MotherboardFormFactor =
  | 'Mini-ITX'
  | 'Mini-DTX'
  | 'FlexATX'
  | 'Micro-ATX'
  | 'ATX'
  | 'E-ATX'
  | 'SSI-CEB'
  | 'SSI-EEB'
  | 'EEB'

export type PSUType =
  | 'ATX'
  | 'SFX'
  | 'SFX-L'
  | 'TFX'
  | 'FlexATX'
  | '1U'
  | '2U Redundant'
  | 'Mini Redundant'
  | 'CRPS'
  | 'PS2'

export type DriveSize = '2.5"' | '3.5"' | '5.25"' | 'E1.S' | 'M.2' | 'Slim ODD'

export type Currency = 'USD' | 'EUR' | 'GBP'

export type AvailabilityStatus =
  | 'in-stock'
  | 'out-of-stock'
  | 'pre-order'
  | 'discontinued'
  | 'contact-for-quote'
  | 'unknown'

export type DataSource =
  | 'inter-tech.de'
  | 'sliger.com'
  | 'silverstonetek.com'
  | 'ipc.in-win.com'
  | 'yakkaroo.de'
  | 'unykach.com'

// ============================================================================
// INTERFACES
// ============================================================================

export interface Dimensions {
  width_mm: number | null
  height_mm: number | null
  depth_mm: number | null
  weight_kg: number | null
  volume_liters?: number | null
}

export interface Price {
  amount: number | null
  currency: Currency
  original_string?: string
}

export interface DriveBay {
  size: DriveSize
  quantity: number
  hot_swap: boolean
  internal: boolean
}

export interface FanMount {
  size_mm: number
  quantity: number
  position: string
  included: boolean
  max_thickness_mm?: number | null
}

export interface RadiatorSupport {
  size_mm: number
  max_length_mm?: number | null
  position: string
}

export interface ExpansionSlot {
  type: 'full-height' | 'low-profile' | 'half-height'
  quantity: number
}

export interface FrontIO {
  usb_type_a_2_0: number
  usb_type_a_3_0: number
  usb_type_a_3_1: number
  usb_type_c: number
  audio_jack: boolean
  mic_jack: boolean
  power_button: boolean
  reset_button: boolean
  other?: string[]
}

export interface GPUSupport {
  max_length_mm: number | null
  max_height_mm: number | null
  max_width_slots?: number | null
  notes?: string
}

export interface CPUCoolerSupport {
  max_height_mm: number | null
  notes?: string
}

export interface PSUSupport {
  types: PSUType[]
  max_length_mm: number | null
  notes?: string
}

export interface StorageBackplane {
  type: 'SAS' | 'SATA' | 'NVMe' | 'SFF-8087' | 'SFF-8643' | 'MCIO'
  connectors: number
  max_speed_gbps?: number
}

// ============================================================================
// MAIN PRODUCT INTERFACE
// ============================================================================

export interface RackCase {
  id: string
  model: string
  brand: string
  name: string

  source: DataSource
  source_url: string
  scraped_at: string
  sku?: string

  price: Price | null
  availability: AvailabilityStatus

  rack_units: RackUnits
  dimensions: Dimensions
  material?: string
  color?: string

  motherboard_support: MotherboardFormFactor[]
  motherboard_max_dimensions?: string

  cpu_cooler: CPUCoolerSupport
  fan_mounts: FanMount[]
  radiator_support: RadiatorSupport[]
  dust_filters?: {
    front: boolean
    top: boolean
    bottom: boolean
    psu: boolean
  }

  drive_bays: DriveBay[]
  total_25_bays: number
  total_35_bays: number
  total_525_bays: number
  has_hot_swap: boolean
  storage_backplane?: StorageBackplane

  expansion_slots: ExpansionSlot[]
  total_pcie_slots: number
  has_full_height_slots: boolean

  gpu_support: GPUSupport
  psu_support: PSUSupport
  psu_included: boolean

  front_io: FrontIO
  features: string[]
  description?: string

  _raw?: Record<string, unknown>
}
