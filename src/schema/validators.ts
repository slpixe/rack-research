/**
 * Zod Validation Schemas
 *
 * Runtime validation schemas matching our TypeScript types.
 * These schemas validate product data during build and provide
 * a single source of truth for type definitions.
 */

import { z } from 'zod';

// ============================================================================
// ENUMS - Standardized values for filtering
// ============================================================================

export const RackUnitsSchema = z.enum([
  '1U',
  '1.5U',
  '2U',
  '3U',
  '4U',
  '5U',
  '6U',
  '7U',
  '8U',
  '9U',
  '10U',
  '11U',
  '12U',
  '13U',
]);

export const MotherboardFormFactorSchema = z.enum([
  'Mini-ITX',
  'Mini-DTX',
  'FlexATX',
  'Micro-ATX',
  'ATX',
  'E-ATX',
  'SSI-CEB',
  'SSI-EEB',
  'EEB',
]);

export const PSUTypeSchema = z.enum([
  'ATX',
  'SFX',
  'SFX-L',
  'TFX',
  'FlexATX',
  '1U',
  '2U Redundant',
  'Mini Redundant',
  'CRPS',
  'PS2',
]);

export const DriveSizeSchema = z.enum([
  '2.5"',
  '3.5"',
  '5.25"',
  'E1.S',
  'M.2',
  'Slim ODD',
]);

export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP']);

export const AvailabilitySchema = z.enum([
  'in-stock',
  'out-of-stock',
  'pre-order',
  'discontinued',
  'contact-for-quote',
  'unknown',
]);

export const DataSourceSchema = z.enum([
  'inter-tech.de',
  'sliger.com',
  'silverstonetek.com',
  'ipc.in-win.com',
  'yakkaroo.de',
  'unykach.com',
]);

// ============================================================================
// SUB-SCHEMAS
// ============================================================================

export const DimensionsSchema = z.object({
  width_mm: z.number().nullable(),
  height_mm: z.number().nullable(),
  depth_mm: z.number().nullable(),
  weight_kg: z.number().nullable(),
  volume_liters: z.number().nullable().optional(),
});

export const PriceSchema = z
  .object({
    amount: z.number().nullable(),
    currency: CurrencySchema,
    original_string: z.string().optional(),
  })
  .nullable();

export const DriveBaySchema = z.object({
  size: DriveSizeSchema,
  quantity: z.number().int().min(0),
  hot_swap: z.boolean(),
  internal: z.boolean(),
});

export const FanMountSchema = z.object({
  size_mm: z.number(),
  quantity: z.number().int().min(1),
  position: z.string(),
  included: z.boolean(),
  max_thickness_mm: z.number().nullable().optional(),
});

export const RadiatorSupportSchema = z.object({
  size_mm: z.number(),
  max_length_mm: z.number().nullable().optional(),
  position: z.string(),
});

export const ExpansionSlotSchema = z.object({
  type: z.enum(['full-height', 'low-profile', 'half-height']),
  quantity: z.number().int().min(1),
});

export const FrontIOSchema = z.object({
  usb_type_a_2_0: z.number().int().min(0),
  usb_type_a_3_0: z.number().int().min(0),
  usb_type_a_3_1: z.number().int().min(0),
  usb_type_c: z.number().int().min(0),
  audio_jack: z.boolean(),
  mic_jack: z.boolean(),
  power_button: z.boolean(),
  reset_button: z.boolean(),
  other: z.array(z.string()).optional(),
});

export const GPUSupportSchema = z.object({
  max_length_mm: z.number().nullable(),
  max_height_mm: z.number().nullable(),
  max_width_slots: z.number().nullable().optional(),
  notes: z.string().optional(),
});

export const CPUCoolerSupportSchema = z.object({
  max_height_mm: z.number().nullable(),
  notes: z.string().optional(),
});

export const PSUSupportSchema = z.object({
  types: z.array(PSUTypeSchema),
  max_length_mm: z.number().nullable(),
  notes: z.string().optional(),
});

export const StorageBackplaneSchema = z.object({
  type: z.enum(['SAS', 'SATA', 'NVMe', 'SFF-8087', 'SFF-8643', 'MCIO']),
  connectors: z.number(),
  max_speed_gbps: z.number().optional(),
});

export const DustFiltersSchema = z.object({
  front: z.boolean(),
  top: z.boolean(),
  bottom: z.boolean(),
  psu: z.boolean(),
});

// ============================================================================
// MAIN SCHEMA
// ============================================================================

export const RackCaseSchema = z.object({
  // === Identification ===
  id: z.string().min(1),
  model: z.string().min(1),
  brand: z.string().min(1),
  name: z.string().min(1),

  // === Source Metadata ===
  source: DataSourceSchema,
  source_url: z.string(), // Allow empty for now, warn later
  scraped_at: z.string(),
  sku: z.string().optional(),

  // === Pricing & Availability ===
  price: PriceSchema,
  availability: AvailabilitySchema,

  // === Physical Dimensions ===
  rack_units: RackUnitsSchema,
  dimensions: DimensionsSchema,
  material: z.string().optional(),
  color: z.string().optional(),

  // === Motherboard Compatibility ===
  motherboard_support: z.array(MotherboardFormFactorSchema),
  motherboard_max_dimensions: z.string().optional(),

  // === Cooling ===
  cpu_cooler: CPUCoolerSupportSchema,
  fan_mounts: z.array(FanMountSchema),
  radiator_support: z.array(RadiatorSupportSchema),
  dust_filters: DustFiltersSchema.optional(),

  // === Storage ===
  drive_bays: z.array(DriveBaySchema),
  total_25_bays: z.number().int().min(0),
  total_35_bays: z.number().int().min(0),
  total_525_bays: z.number().int().min(0),
  has_hot_swap: z.boolean(),
  storage_backplane: StorageBackplaneSchema.optional(),

  // === Expansion ===
  expansion_slots: z.array(ExpansionSlotSchema),
  total_pcie_slots: z.number().int().min(0),
  has_full_height_slots: z.boolean(),

  // === GPU ===
  gpu_support: GPUSupportSchema,

  // === Power Supply ===
  psu_support: PSUSupportSchema,
  psu_included: z.boolean(),

  // === Front Panel I/O ===
  front_io: FrontIOSchema,

  // === Features & Extras ===
  features: z.array(z.string()),
  description: z.string().optional(),

  // === Raw Data (for debugging/reference) ===
  _raw: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export const DatabaseSchema = z.object({
  generated_at: z.string(),
  total_products: z.number().int(),
  sources: z.array(z.string()),
  products: z.array(RackCaseSchema),
});

// ============================================================================
// EXPORT INFERRED TYPES
// ============================================================================

export type RackCaseValidated = z.infer<typeof RackCaseSchema>;
export type DatabaseValidated = z.infer<typeof DatabaseSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  data: RackCaseValidated | null;
  warnings: string[];
  errors: string[];
}

/**
 * Validates a product and provides detailed warnings and errors
 * @param product - The product data to validate
 * @returns Validation result with data, warnings, and errors
 */
export function validateAndWarn(product: unknown): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const result = RackCaseSchema.safeParse(product);

  if (!result.success) {
    if (result.error?.issues) {
      errors.push(
        ...result.error.issues.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        )
      );
    } else {
      errors.push('Unknown validation error');
    }
    return { valid: false, data: null, warnings, errors };
  }

  // Add warnings for missing recommended fields
  const data = result.data;
  if (!data.source_url) warnings.push('Missing source_url');
  if (!data.price) warnings.push('Missing price');
  if (!data.dimensions.depth_mm) warnings.push('Missing depth_mm');
  if (data.motherboard_support.length === 0)
    warnings.push('No motherboard support listed');

  return { valid: true, data, warnings, errors };
}

/**
 * Validates a product and returns the data or null
 * @param product - The product data to validate
 * @param filename - The filename for error reporting
 * @returns Validated product or null if invalid
 */
export function validateProduct(
  product: unknown,
  filename: string
): RackCaseValidated | null {
  const result = RackCaseSchema.safeParse(product);

  if (!result.success) {
    console.error(`❌ Validation failed for ${filename}:`);
    console.error(result.error.format());
    return null;
  }

  return result.data;
}
