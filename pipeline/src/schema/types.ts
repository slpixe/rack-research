/**
 * Universal Rack Case Schema
 *
 * This file defines the normalized/universal schema for all rack case products
 * across different sources (Inter-Tech, Sliger, SilverStone, In-Win, Yakkaroo, etc.)
 *
 * NOTE: Runtime validation is handled by Zod schemas in validators.ts.
 * These TypeScript types are kept in sync with the Zod schemas.
 * Future consideration: Use z.infer<> from validators.ts as single source of truth.
 */

// ============================================================================
// ENUMS - Standardized values for filtering
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
  | '13U';

export type MotherboardFormFactor =
  | 'Mini-ITX'
  | 'Mini-DTX'
  | 'FlexATX'
  | 'Micro-ATX'
  | 'ATX'
  | 'E-ATX'
  | 'SSI-CEB'
  | 'SSI-EEB'
  | 'EEB';

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
  | 'PS2';

export type DriveSize = '2.5"' | '3.5"' | '5.25"' | 'E1.S' | 'M.2' | 'Slim ODD';

export type CoolingType = 'Air' | 'AIO' | 'Custom Loop';

export type Currency = 'USD' | 'EUR' | 'GBP';

export type AvailabilityStatus =
  | 'in-stock'
  | 'out-of-stock'
  | 'pre-order'
  | 'discontinued'
  | 'contact-for-quote'
  | 'unknown';

export type DataSource =
  | 'inter-tech.de'
  | 'sliger.com'
  | 'silverstonetek.com'
  | 'ipc.in-win.com'
  | 'yakkaroo.de'
  | 'unykach.com';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface Dimensions {
  /** Width in mm */
  width_mm: number | null;
  /** Height in mm */
  height_mm: number | null;
  /** Depth in mm */
  depth_mm: number | null;
  /** Weight in kg */
  weight_kg: number | null;
  /** Volume in liters */
  volume_liters?: number | null;
}

export interface Price {
  amount: number | null;
  currency: Currency;
  /** Original price string for reference */
  original_string?: string;
}

export interface DriveBay {
  size: DriveSize;
  quantity: number;
  hot_swap: boolean;
  internal: boolean;
}

export interface FanMount {
  size_mm: number;
  quantity: number;
  /** Position: front, rear, top, bottom, side, internal */
  position: string;
  /** Whether fan is included or just mounting available */
  included: boolean;
  /** Max thickness in mm if specified */
  max_thickness_mm?: number | null;
}

export interface RadiatorSupport {
  /** Size in mm (120, 240, 280, 360, etc.) */
  size_mm: number;
  /** Max length in mm */
  max_length_mm?: number | null;
  position: string;
}

export interface ExpansionSlot {
  /** full-height, low-profile, half-height */
  type: 'full-height' | 'low-profile' | 'half-height';
  quantity: number;
}

export interface FrontIO {
  usb_type_a_2_0: number;
  usb_type_a_3_0: number;
  usb_type_a_3_1: number;
  usb_type_c: number;
  audio_jack: boolean;
  mic_jack: boolean;
  power_button: boolean;
  reset_button: boolean;
  /** Any additional/custom ports */
  other?: string[];
}

export interface GPUSupport {
  max_length_mm: number | null;
  max_height_mm: number | null;
  max_width_slots?: number | null;
  /** Additional notes about GPU support */
  notes?: string;
}

export interface CPUCoolerSupport {
  max_height_mm: number | null;
  /** Additional notes */
  notes?: string;
}

export interface PSUSupport {
  types: PSUType[];
  max_length_mm: number | null;
  /** Additional notes */
  notes?: string;
}

export interface StorageBackplane {
  type: 'SAS' | 'SATA' | 'NVMe' | 'SFF-8087' | 'SFF-8643' | 'MCIO';
  connectors: number;
  max_speed_gbps?: number;
}

// ============================================================================
// MAIN PRODUCT INTERFACE
// ============================================================================

export interface RackCase {
  // === Identification ===
  /** Unique ID (generated: source-model) */
  id: string;
  /** Original model name/number */
  model: string;
  /** Manufacturer/Brand */
  brand: string;
  /** Product name/title */
  name: string;

  // === Source Metadata ===
  source: DataSource;
  source_url: string;
  scraped_at: string;
  /** Original SKU if available */
  sku?: string;

  // === Pricing & Availability ===
  price: Price | null;
  availability: AvailabilityStatus;

  // === Physical Dimensions ===
  rack_units: RackUnits;
  dimensions: Dimensions;
  /** Material (e.g., "1.0-1.2mm Steel", "SGCC", "Aluminum") */
  material?: string;
  /** Color/finish */
  color?: string;

  // === Motherboard Compatibility ===
  motherboard_support: MotherboardFormFactor[];
  /** Max motherboard dimensions if specified (e.g., "305mm x 345mm") */
  motherboard_max_dimensions?: string;

  // === Cooling ===
  cpu_cooler: CPUCoolerSupport;
  fan_mounts: FanMount[];
  radiator_support: RadiatorSupport[];
  /** Whether dust filters are included */
  dust_filters?: {
    front: boolean;
    top: boolean;
    bottom: boolean;
    psu: boolean;
  };

  // === Storage ===
  drive_bays: DriveBay[];
  /** Total 2.5" drive capacity */
  total_25_bays: number;
  /** Total 3.5" drive capacity */
  total_35_bays: number;
  /** Total 5.25" drive capacity */
  total_525_bays: number;
  /** Hot-swap support */
  has_hot_swap: boolean;
  storage_backplane?: StorageBackplane;

  // === Expansion ===
  expansion_slots: ExpansionSlot[];
  /** Total PCIe slots */
  total_pcie_slots: number;
  /** Whether has full-height slots */
  has_full_height_slots: boolean;

  // === GPU ===
  gpu_support: GPUSupport;

  // === Power Supply ===
  psu_support: PSUSupport;
  /** Whether PSU is included */
  psu_included: boolean;

  // === Front Panel I/O ===
  front_io: FrontIO;

  // === Features & Extras ===
  features: string[];
  /** Full description/overview */
  description?: string;

  // === Raw Data (for debugging/reference) ===
  _raw?: Record<string, unknown>;
}

// ============================================================================
// FILTER DEFINITIONS - Keys that can be filtered/sorted
// ============================================================================

export interface FilterableFields {
  // Numeric ranges
  price_min: number;
  price_max: number;
  depth_mm_min: number;
  depth_mm_max: number;
  width_mm_min: number;
  width_mm_max: number;
  height_mm_min: number;
  height_mm_max: number;
  weight_kg_min: number;
  weight_kg_max: number;
  cpu_cooler_height_min: number;
  cpu_cooler_height_max: number;
  gpu_length_min: number;
  gpu_length_max: number;
  psu_length_min: number;
  psu_length_max: number;
  total_25_bays_min: number;
  total_35_bays_min: number;
  total_525_bays_min: number;
  total_pcie_slots_min: number;

  // Enum selections
  rack_units: RackUnits[];
  motherboard_support: MotherboardFormFactor[];
  psu_types: PSUType[];
  sources: DataSource[];
  availability: AvailabilityStatus[];

  // Boolean filters
  has_hot_swap: boolean | null;
  has_full_height_slots: boolean | null;
  has_radiator_support: boolean | null;
  psu_included: boolean | null;
}

export type SortableFields =
  | 'price'
  | 'depth_mm'
  | 'width_mm'
  | 'height_mm'
  | 'weight_kg'
  | 'cpu_cooler_height'
  | 'gpu_length'
  | 'total_25_bays'
  | 'total_35_bays'
  | 'total_pcie_slots'
  | 'name'
  | 'brand'
  | 'rack_units';
