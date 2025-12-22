/**
 * Universal Transformer
 * 
 * Transforms parsed markdown data into the universal RackCase schema
 */

import type { RackCase, DataSource } from '../schema/types.js';
import type { ParsedMarkdown } from '../parsers/markdown.js';
import {
  parseRackUnits,
  parseMotherboardSupport,
  parseDimensions,
  parseDriveBays,
  parsePSUTypes,
  parsePrice,
  parseMillimeters,
  parseWeight,
  parseAvailability,
  parseGPULength,
  parseCPUCoolerHeight,
} from '../parsers/index.js';
import { getBrandFromSource, getCurrencyFromSource, getModelFromFilename } from '../utils/source-utils.js';
import { generateProductId } from '../utils/id-generator.js';

export function transformToUniversal(
  parsed: ParsedMarkdown,
  source: DataSource,
  filePath: string
): RackCase {
  const specs = parsed.specifications;
  const currency = getCurrencyFromSource(source);

  // Determine rack units from various sources
  const rackUnitsRaw =
    specs['Form Factor'] || specs['Rack Units'] || specs['Chassis form factor'] || parsed.title || '';
  const rackUnits = (parseRackUnits(rackUnitsRaw) || '4U') as RackCase['rack_units'];

  // Parse dimensions from various formats
  const dimensionsRaw =
    specs['Dimensions (H x W x D)'] ||
    specs['Dimensions (H/W/D)'] ||
    specs['Dimension'] ||
    specs['Dimensions'] ||
    '';
  const dimensions = parseDimensions(dimensionsRaw);

  // Also check individual dimension fields
  if (!dimensions.width_mm && specs['Width']) {
    dimensions.width_mm = parseMillimeters(specs['Width']);
  }
  if (!dimensions.height_mm && specs['Height']) {
    dimensions.height_mm = parseMillimeters(specs['Height']);
  }
  if (!dimensions.depth_mm && specs['Depth']) {
    dimensions.depth_mm = parseMillimeters(specs['Depth']);
  }

  // Parse motherboard support
  const mbRaw =
    specs['Motherboard Support'] ||
    specs['Motherboard'] ||
    specs['Motherboard Form Factors'] ||
    specs['Form factor'] ||
    '';
  const motherboardSupport = parseMotherboardSupport(mbRaw);

  // Parse drive bays
  const driveBaysRaw =
    specs['Drive Bays'] || specs['Drive Support'] || specs['Drive bays'] || specs['Storage'] || '';
  const driveBays = parseDriveBays(driveBaysRaw);

  // Calculate totals
  const total_25_bays = driveBays
    .filter((b) => b.size === '2.5"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const total_35_bays = driveBays
    .filter((b) => b.size === '3.5"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const total_525_bays = driveBays
    .filter((b) => b.size === '5.25"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const has_hot_swap = driveBays.some((b) => b.hot_swap);

  // Parse GPU support
  const gpuRaw =
    specs['Max Graphic Card Length'] ||
    specs['Graphics Card Length (max.)'] ||
    specs['Max Length'] ||
    specs['Limitation of expansion card'] ||
    '';
  const gpu_max_length = parseGPULength(gpuRaw);

  // Parse CPU cooler height
  const cpuRaw =
    specs['Max CPU Cooler Height'] ||
    specs['CPU Cooler Height (max.)'] ||
    specs['Limitation of CPU cooler'] ||
    specs['Air Cooling'] ||
    '';
  const cpu_cooler_height = parseCPUCoolerHeight(cpuRaw);

  // Parse PSU support
  const psuRaw =
    specs['Power Supply Support'] ||
    specs['PSU Support'] ||
    specs['Power Supply'] ||
    specs['Power supply'] ||
    '';
  const psuTypes = parsePSUTypes(psuRaw);

  // Parse price
  const priceRaw = parsed.pricing?.Case || specs['Price'] || '';
  const price = priceRaw ? parsePrice(priceRaw, currency) : null;

  // Parse expansion slots
  const slotsRaw = specs['Expansion Slot'] || specs['Expansion Slots'] || '';
  const slotsMatch = slotsRaw.match(/(\d+)/);
  const total_pcie_slots = slotsMatch ? parseInt(slotsMatch[1], 10) : 0;
  const has_full_height_slots = !slotsRaw.toLowerCase().includes('low profile');

  // Parse weight
  const weightRaw = specs['Net Weight'] || specs['Weight (Net)'] || specs['Weight'] || '';
  const weight_kg = parseWeight(weightRaw);

  const model = specs['Model No.'] || specs['Model'] || getModelFromFilename(filePath);

  return {
    // Identification
    id: generateProductId(source, model),
    model,
    brand: getBrandFromSource(source),
    name: parsed.title,

    // Source metadata
    source,
    source_url: parsed.sourceUrl,
    scraped_at: parsed.scrapedAt || new Date().toISOString().split('T')[0],
    sku: parsed.sku,

    // Pricing & availability
    price,
    availability: parseAvailability(parsed.availability || 'unknown'),

    // Physical dimensions
    rack_units: rackUnits,
    dimensions: {
      ...dimensions,
      weight_kg,
      volume_liters: null,
    },
    material: specs['Material'] || undefined,
    color: specs['Colour'] || specs['Color'] || undefined,

    // Motherboard
    motherboard_support: motherboardSupport,

    // Cooling
    cpu_cooler: {
      max_height_mm: cpu_cooler_height,
    },
    fan_mounts: [],
    radiator_support: [],

    // Storage
    drive_bays: driveBays,
    total_25_bays,
    total_35_bays,
    total_525_bays,
    has_hot_swap,

    // Expansion
    expansion_slots: [],
    total_pcie_slots,
    has_full_height_slots,

    // GPU
    gpu_support: {
      max_length_mm: gpu_max_length,
      max_height_mm: null,
    },

    // PSU
    psu_support: {
      types: psuTypes,
      max_length_mm: null,
    },
    psu_included: false,

    // Front I/O
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

    // Features
    features: [],
    description: parsed.overview,
  };
}
