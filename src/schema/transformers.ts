/**
 * Source-Specific Transformers
 * 
 * Each source gets its own transformer that converts raw markdown/JSON data
 * into the universal RackCase schema.
 */

import type { RackCase, DataSource, Currency, DriveBay } from './types.js';
import {
  parseRackUnits,
  parseMotherboardSupport,
  parseDimensions,
  parseDriveBays,
  parsePrice,
  parseCPUCoolerHeight,
  parseGPULength,
  parsePSUTypes,
  parseFanMounts,
  parseAvailability,
} from './mappers.js';

// ============================================================================
// BASE TRANSFORMER
// ============================================================================

export abstract class BaseTransformer {
  abstract source: DataSource;
  abstract defaultCurrency: Currency;
  
  /**
   * Transform raw data to universal schema
   */
  abstract transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase;
  
  /**
   * Generate unique ID
   */
  protected generateId(model: string): string {
    const normalized = model.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${this.source}-${normalized}`;
  }
  
  /**
   * Calculate totals from drive bays
   */
  protected calculateDriveTotals(bays: DriveBay[]) {
    return {
      total_25_bays: bays.filter((b: DriveBay) => b.size === '2.5"').reduce((sum: number, b: DriveBay) => sum + b.quantity, 0),
      total_35_bays: bays.filter((b: DriveBay) => b.size === '3.5"').reduce((sum: number, b: DriveBay) => sum + b.quantity, 0),
      total_525_bays: bays.filter((b: DriveBay) => b.size === '5.25"').reduce((sum: number, b: DriveBay) => sum + b.quantity, 0),
      has_hot_swap: bays.some((b: DriveBay) => b.hot_swap),
    };
  }
}

// ============================================================================
// INTER-TECH TRANSFORMER
// ============================================================================

export class InterTechTransformer extends BaseTransformer {
  source: DataSource = 'inter-tech.de';
  defaultCurrency: Currency = 'EUR';
  
  transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase {
    const driveBays = parseDriveBays(rawData['Drive Bays'] || '');
    const driveTotals = this.calculateDriveTotals(driveBays);
    const dimensions = parseDimensions(
      rawData['Dimensions (H x W x D)'] || rawData['Dimensions (H/W/D)'] || ''
    );
    
    return {
      id: this.generateId(metadata.model),
      model: metadata.model,
      brand: 'Inter-Tech',
      name: metadata.name,
      source: this.source,
      source_url: metadata.sourceUrl,
      scraped_at: metadata.scrapedAt,
      
      price: rawData['Price'] ? parsePrice(rawData['Price'], this.defaultCurrency) : null,
      availability: parseAvailability(rawData['Availability'] || 'unknown'),
      
      rack_units: parseRackUnits(rawData['Form Factor'] || '') || '4U',
      dimensions: {
        width_mm: dimensions.width_mm,
        height_mm: dimensions.height_mm,
        depth_mm: dimensions.depth_mm,
        weight_kg: rawData['Weight (Net)'] ? parseFloat(rawData['Weight (Net)'].replace(/[^\d.]/g, '')) : null,
        volume_liters: null,
      },
      material: rawData['Material'],
      
      motherboard_support: parseMotherboardSupport(rawData['Motherboard Support'] || rawData['Motherboard'] || ''),
      motherboard_max_dimensions: rawData['Motherboard Support']?.match(/max\.\s*([\d\s.x×]+\s*mm)/i)?.[1],
      
      cpu_cooler: {
        max_height_mm: parseCPUCoolerHeight(rawData['Max CPU Cooler Height'] || rawData['CPU Cooler Height (max.)'] || ''),
      },
      fan_mounts: parseFanMounts(rawData['Cooling System'] || rawData['Fan Mounting Options'] || ''),
      radiator_support: [],
      
      drive_bays: driveBays,
      ...driveTotals,
      
      expansion_slots: [],
      total_pcie_slots: 0,
      has_full_height_slots: false,
      
      gpu_support: {
        max_length_mm: parseGPULength(rawData['Max Graphic Card Length'] || rawData['Graphics Card Length (max.)'] || ''),
        max_height_mm: null,
      },
      
      psu_support: {
        types: parsePSUTypes(rawData['Power Supply Support'] || rawData['PSU Support'] || ''),
        max_length_mm: null,
      },
      psu_included: false,
      
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: (rawData['Front Connectors'] || '').toLowerCase().includes('usb 3.0') ? 2 : 0,
        usb_type_a_3_1: 0,
        usb_type_c: 0,
        audio_jack: false,
        mic_jack: false,
        power_button: true,
        reset_button: true,
      },
      
      features: [],
      description: rawData['Description'],
      _raw: rawData,
    };
  }
}

// ============================================================================
// SLIGER TRANSFORMER
// ============================================================================

export class SligerTransformer extends BaseTransformer {
  source: DataSource = 'sliger.com';
  defaultCurrency: Currency = 'USD';
  
  transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase {
    const driveBays = parseDriveBays(rawData['Storage'] || '');
    const driveTotals = this.calculateDriveTotals(driveBays);
    
    return {
      id: this.generateId(metadata.model),
      model: metadata.model,
      brand: 'Sliger',
      name: metadata.name,
      source: this.source,
      source_url: metadata.sourceUrl,
      scraped_at: metadata.scrapedAt,
      
      price: rawData['Price'] ? parsePrice(rawData['Price'], this.defaultCurrency) : null,
      availability: parseAvailability(rawData['Availability'] || 'in-stock'),
      
      rack_units: parseRackUnits(rawData['Rack Units'] || rawData['Form Factor'] || '') || '4U',
      dimensions: {
        width_mm: rawData['Width'] ? parseFloat(rawData['Width'].replace(/[^\d.]/g, '')) : null,
        height_mm: rawData['Height'] ? parseFloat(rawData['Height'].replace(/[^\d.]/g, '')) : null,
        depth_mm: rawData['Depth'] ? parseFloat(rawData['Depth'].replace(/[^\d.]/g, '')) : null,
        weight_kg: rawData['Weight'] ? parseFloat(rawData['Weight'].replace(/[^\d.]/g, '')) : null,
        volume_liters: null,
      },
      
      motherboard_support: parseMotherboardSupport(rawData['Motherboard Support'] || ''),
      
      cpu_cooler: {
        max_height_mm: parseCPUCoolerHeight(rawData['Air Cooling'] || rawData['Max Height'] || ''),
      },
      fan_mounts: parseFanMounts(rawData['Included Fans'] || ''),
      radiator_support: [], // Parse from 'Liquid Cooling' field
      
      drive_bays: driveBays,
      ...driveTotals,
      
      expansion_slots: [],
      total_pcie_slots: parseInt(rawData['PCIe Slots'] || '0', 10) || 0,
      has_full_height_slots: (rawData['GPU Support'] || '').toLowerCase().includes('full height'),
      
      gpu_support: {
        max_length_mm: parseGPULength(rawData['Max Length'] || ''),
        max_height_mm: rawData['Max Height'] ? parseFloat(rawData['Max Height'].replace(/[^\d.]/g, '')) : null,
      },
      
      psu_support: {
        types: parsePSUTypes(rawData['Power Supply'] || ''),
        max_length_mm: null,
      },
      psu_included: false,
      
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: (rawData['Front I/O'] || '').match(/USB 3\.0/gi)?.length || 0,
        usb_type_a_3_1: 0,
        usb_type_c: (rawData['Front I/O'] || '').toLowerCase().includes('type c') ? 1 : 0,
        audio_jack: false,
        mic_jack: false,
        power_button: true,
        reset_button: false,
      },
      
      features: [],
      description: rawData['Overview'],
      _raw: rawData,
    };
  }
}

// ============================================================================
// SILVERSTONE TRANSFORMER
// ============================================================================

export class SilverStoneTransformer extends BaseTransformer {
  source: DataSource = 'silverstonetek.com';
  defaultCurrency: Currency = 'USD';
  
  transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase {
    const driveBays = parseDriveBays(rawData['Drive Support'] || '');
    const driveTotals = this.calculateDriveTotals(driveBays);
    const dimensions = parseDimensions(rawData['Dimension'] || '');
    
    return {
      id: this.generateId(metadata.model),
      model: rawData['Model No.'] || metadata.model,
      brand: 'SilverStone',
      name: metadata.name,
      source: this.source,
      source_url: metadata.sourceUrl,
      scraped_at: metadata.scrapedAt,
      
      price: null, // SilverStone pages don't typically show price
      availability: 'unknown',
      
      rack_units: parseRackUnits(rawData['Chassis form factor'] || '') || '4U',
      dimensions: {
        width_mm: dimensions.width_mm,
        height_mm: dimensions.height_mm,
        depth_mm: dimensions.depth_mm,
        weight_kg: rawData['Net Weight'] ? parseFloat(rawData['Net Weight'].replace(/[^\d.]/g, '')) : null,
        volume_liters: null,
      },
      material: rawData['Material'],
      
      motherboard_support: parseMotherboardSupport(rawData['Motherboard'] || ''),
      
      cpu_cooler: {
        max_height_mm: parseCPUCoolerHeight(rawData['Limitation of CPU cooler'] || ''),
      },
      fan_mounts: parseFanMounts(rawData['Cooling system'] || ''),
      radiator_support: [],
      
      drive_bays: driveBays,
      ...driveTotals,
      
      expansion_slots: [],
      total_pcie_slots: parseInt((rawData['Expansion Slot'] || '').match(/\d+/)?.[0] || '0', 10),
      has_full_height_slots: !(rawData['Expansion Slot'] || '').toLowerCase().includes('low profile'),
      
      gpu_support: {
        max_length_mm: parseGPULength(rawData['Limitation of expansion card'] || ''),
        max_height_mm: null,
      },
      
      psu_support: {
        types: parsePSUTypes(rawData['Power Supply'] || ''),
        max_length_mm: null,
      },
      psu_included: false,
      
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: 0,
        usb_type_a_3_1: (rawData['Front I/O Port'] || '').match(/USB 3\.1/gi)?.length || 0,
        usb_type_c: (rawData['Front I/O Port'] || '').toLowerCase().includes('type-c') ? 1 : 0,
        audio_jack: false,
        mic_jack: false,
        power_button: (rawData['Front buttons'] || '').toLowerCase().includes('power'),
        reset_button: (rawData['Front buttons'] || '').toLowerCase().includes('reset'),
      },
      
      features: [],
      _raw: rawData,
    };
  }
}

// ============================================================================
// IN-WIN TRANSFORMER
// ============================================================================

export class InWinTransformer extends BaseTransformer {
  source: DataSource = 'ipc.in-win.com';
  defaultCurrency: Currency = 'USD';
  
  transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase {
    const driveBays = parseDriveBays(rawData['Drive Bays'] || '');
    const driveTotals = this.calculateDriveTotals(driveBays);
    
    return {
      id: this.generateId(metadata.model),
      model: metadata.model,
      brand: 'In-Win',
      name: metadata.name,
      source: this.source,
      source_url: metadata.sourceUrl,
      scraped_at: metadata.scrapedAt,
      
      price: rawData['Price'] ? parsePrice(rawData['Price'], this.defaultCurrency) : null,
      availability: parseAvailability(rawData['Availability'] || 'contact-for-quote'),
      
      rack_units: parseRackUnits(rawData['Rack Units'] || '') || '4U',
      dimensions: {
        width_mm: rawData['Width'] ? parseFloat(rawData['Width'].replace(/[^\d.]/g, '')) : null,
        height_mm: rawData['Height'] ? parseFloat(rawData['Height'].replace(/[^\d.]/g, '')) : null,
        depth_mm: rawData['Depth'] ? parseFloat(rawData['Depth'].replace(/[^\d.]/g, '')) : null,
        weight_kg: null,
        volume_liters: null,
      },
      
      motherboard_support: parseMotherboardSupport(rawData['Motherboard Form Factors'] || ''),
      
      cpu_cooler: {
        max_height_mm: null,
      },
      fan_mounts: parseFanMounts(rawData['Included Fans'] || ''),
      radiator_support: [],
      
      drive_bays: driveBays,
      ...driveTotals,
      
      expansion_slots: [],
      total_pcie_slots: parseInt((rawData['PCIe Slots'] || '').match(/\d+/)?.[0] || '0', 10),
      has_full_height_slots: (rawData['PCIe Slots'] || '').toLowerCase().includes('full'),
      
      gpu_support: {
        max_length_mm: null,
        max_height_mm: null,
      },
      
      psu_support: {
        types: parsePSUTypes(rawData['PSU Support'] || ''),
        max_length_mm: null,
      },
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
      description: rawData['Overview'],
      _raw: rawData,
    };
  }
}

// ============================================================================
// YAKKAROO TRANSFORMER
// ============================================================================

export class YakkarooTransformer extends BaseTransformer {
  source: DataSource = 'yakkaroo.de';
  defaultCurrency: Currency = 'EUR';
  
  transform(rawData: Record<string, string>, metadata: {
    sourceUrl: string;
    scrapedAt: string;
    model: string;
    name: string;
  }): RackCase {
    const driveBays = parseDriveBays(rawData['Drive bays'] || '');
    const driveTotals = this.calculateDriveTotals(driveBays);
    const dimensions = parseDimensions(rawData['Dimensions'] || '');
    
    return {
      id: this.generateId(metadata.model),
      model: rawData['Model'] || metadata.model,
      brand: 'Various', // Yakkaroo is a reseller
      name: metadata.name,
      source: this.source,
      source_url: metadata.sourceUrl,
      scraped_at: metadata.scrapedAt,
      sku: rawData['SKU'],
      
      price: rawData['Price'] ? parsePrice(rawData['Price'], this.defaultCurrency) : null,
      availability: parseAvailability(rawData['Status'] || rawData['Availability'] || 'unknown'),
      
      rack_units: parseRackUnits(rawData['Form factor'] || metadata.name) || '4U',
      dimensions: {
        width_mm: dimensions.width_mm,
        height_mm: dimensions.height_mm,
        depth_mm: dimensions.depth_mm,
        weight_kg: null,
        volume_liters: null,
      },
      color: rawData['Colour'],
      
      motherboard_support: parseMotherboardSupport(rawData['Form factor'] || ''),
      
      cpu_cooler: {
        max_height_mm: null,
      },
      fan_mounts: parseFanMounts(rawData['Cooling'] || ''),
      radiator_support: [],
      
      drive_bays: driveBays,
      ...driveTotals,
      
      expansion_slots: [],
      total_pcie_slots: 0,
      has_full_height_slots: false,
      
      gpu_support: {
        max_length_mm: null,
        max_height_mm: null,
      },
      
      psu_support: {
        types: parsePSUTypes(rawData['Power supply'] || ''),
        max_length_mm: null,
      },
      psu_included: (rawData['Power supply'] || '').toLowerCase().includes('included'),
      
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: (rawData['Connectors'] || '').toLowerCase().includes('usb 3.0') ? 2 : 0,
        usb_type_a_3_1: 0,
        usb_type_c: 0,
        audio_jack: false,
        mic_jack: false,
        power_button: true,
        reset_button: (rawData['More info'] || '').toLowerCase().includes('reset'),
      },
      
      features: (rawData['More info'] || '').split(/[-•]\s*/).filter(Boolean),
      _raw: rawData,
    };
  }
}

// ============================================================================
// TRANSFORMER REGISTRY
// ============================================================================

export const transformers: Record<DataSource, BaseTransformer> = {
  'inter-tech.de': new InterTechTransformer(),
  'sliger.com': new SligerTransformer(),
  'silverstonetek.com': new SilverStoneTransformer(),
  'ipc.in-win.com': new InWinTransformer(),
  'yakkaroo.de': new YakkarooTransformer(),
  'unykach.com': new InterTechTransformer(), // Use InterTech as base, customize as needed
};

export function getTransformer(source: DataSource): BaseTransformer {
  return transformers[source];
}
