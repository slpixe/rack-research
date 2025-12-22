/**
 * Source-Specific Field Mappers
 * 
 * Each source has different field names and formats.
 * These mappers transform source-specific data to the universal schema.
 */

import type {
  RackCase,
  RackUnits,
  MotherboardFormFactor,
  PSUType,
  DriveBay,
  FanMount,
  Currency,
  AvailabilityStatus,
  DataSource,
} from './types.js';

// ============================================================================
// KEY MAPPING DEFINITIONS
// ============================================================================

/**
 * Maps source-specific keys to universal schema keys
 * Format: { sourceKey: universalKey }
 */
export interface KeyMapping {
  source: DataSource;
  mappings: Record<string, string>;
}

// Inter-Tech.de field mappings
export const interTechKeyMap: KeyMapping = {
  source: 'inter-tech.de',
  mappings: {
    // Dimensions
    'Form Factor': 'rack_units',
    'Dimensions (H x W x D)': 'dimensions',
    'Dimensions (H/W/D)': 'dimensions',
    
    // Motherboard
    'Motherboard Support': 'motherboard_support',
    'Motherboard': 'motherboard_support',
    
    // Storage
    'Drive Bays': 'drive_bays',
    'External Drive Bays': 'drive_bays_external',
    
    // Cooling
    'Cooling System': 'fan_mounts',
    'Fan Mounting Options': 'fan_mounts',
    'Max CPU Cooler Height': 'cpu_cooler_max_height',
    'CPU Cooler Height (max.)': 'cpu_cooler_max_height',
    
    // GPU
    'Max Graphic Card Length': 'gpu_max_length',
    'Graphics Card Length (max.)': 'gpu_max_length',
    
    // PSU
    'Power Supply Support': 'psu_support',
    'PSU Support': 'psu_support',
    
    // I/O
    'Front Connectors': 'front_io',
    
    // Expansion
    'Expansion Slots': 'expansion_slots',
    
    // Materials
    'Material': 'material',
    'Weight (Net)': 'weight_kg',
  },
};

// Sliger.com field mappings
export const sligerKeyMap: KeyMapping = {
  source: 'sliger.com',
  mappings: {
    // Dimensions
    'Rack Units': 'rack_units',
    'Width': 'width_mm',
    'Height': 'height_mm',
    'Depth': 'depth_mm',
    'Weight': 'weight_kg',
    
    // Motherboard
    'Motherboard Support': 'motherboard_support',
    'Motherboard Form Factors': 'motherboard_support',
    
    // Storage
    'Storage': 'drive_bays',
    
    // Cooling
    'Air Cooling': 'cpu_cooler_max_height',
    'Liquid Cooling': 'radiator_support',
    'Max Height': 'cpu_cooler_max_height',
    'Included Fans': 'fans_included',
    'Fan Mounts (Optional)': 'fan_mounts',
    
    // GPU
    'GPU Support': 'gpu_support',
    'Max Length': 'gpu_max_length',
    
    // PSU
    'Power Supply': 'psu_support',
    'PSU Support': 'psu_support',
    
    // I/O
    'Front I/O': 'front_io',
    
    // Price
    'Price': 'price',
  },
};

// SilverStone field mappings
export const silverStoneKeyMap: KeyMapping = {
  source: 'silverstonetek.com',
  mappings: {
    // Identification
    'Model No.': 'model',
    
    // Dimensions
    'Chassis form factor': 'rack_units',
    'Dimension': 'dimensions',
    'Net Weight': 'weight_kg',
    'Main metal thickness': 'material_thickness',
    
    // Motherboard
    'Motherboard': 'motherboard_support',
    
    // Storage
    'Drive Support': 'drive_bays',
    
    // Cooling
    'Cooling system': 'fan_mounts',
    'Limitation of CPU cooler': 'cpu_cooler_max_height',
    
    // GPU
    'Limitation of expansion card': 'gpu_max_length',
    
    // PSU
    'Power Supply': 'psu_support',
    
    // I/O
    'Front I/O Port': 'front_io',
    'Front buttons': 'front_buttons',
    'LED Indicators': 'led_indicators',
    
    // Expansion
    'Expansion Slot': 'expansion_slots',
    
    // Materials
    'Material': 'material',
  },
};

// In-Win field mappings
export const inWinKeyMap: KeyMapping = {
  source: 'ipc.in-win.com',
  mappings: {
    // Dimensions
    'Rack Units': 'rack_units',
    'Width': 'width_mm',
    'Height': 'height_mm',
    'Depth': 'depth_mm',
    'Operating Temperature': 'operating_temp',
    
    // Motherboard
    'Motherboard Form Factors': 'motherboard_support',
    
    // Storage
    'Drive Bays': 'drive_bays',
    'Storage Configuration': 'storage_config',
    
    // Cooling
    'Included Fans': 'fans_included',
    'Additional Cooling Features': 'cooling_notes',
    
    // PSU
    'PSU Support': 'psu_support',
    'Max Wattage': 'psu_max_wattage',
    
    // I/O
    'Front I/O': 'front_io',
    
    // Expansion
    'PCIe Slots': 'expansion_slots',
  },
};

// Yakkaroo field mappings (uses similar keys to Inter-Tech)
export const yakkarooKeyMap: KeyMapping = {
  source: 'yakkaroo.de',
  mappings: {
    // Dimensions
    'Length': 'depth_category',
    'Model': 'model',
    'Dimensions': 'dimensions',
    
    // Motherboard
    'Form factor': 'motherboard_support',
    
    // Storage
    'Drive bays': 'drive_bays',
    
    // Cooling
    'Cooling': 'fan_mounts',
    
    // PSU
    'Power supply': 'psu_support',
    
    // I/O
    'Connectors': 'front_io',
    
    // Other
    'Colour': 'color',
    'Box contents': 'included_accessories',
    'More info': 'features',
  },
};

// ============================================================================
// VALUE PARSERS
// ============================================================================

/**
 * Parse rack units from various formats
 * Examples: "1U", "1.5U", "4U", "Chassis form factor: 2U"
 */
export function parseRackUnits(value: string): RackUnits | null {
  const match = value.match(/(\d+\.?\d*)\s*U/i);
  if (match) {
    const num = match[1];
    if (num === '1') return '1U';
    if (num === '1.5') return '1.5U';
    if (num === '2') return '2U';
    if (num === '3') return '3U';
    if (num === '4') return '4U';
    if (num === '5') return '5U';
    if (num === '6') return '6U';
    // ... etc
  }
  return null;
}

/**
 * Parse motherboard support from various formats
 * Examples:
 * - "Mini ITX, mATX, FlexATX, μATX, ATX (max. 305 x 191mm)"
 * - "ATX (12" x 9.6"), Micro-ATX (9.6" x 9.6"), Mini-ITX (6.7" x 6.7")"
 * - "compatible with micro-ATX, standard-ATX and extended-ATX mainboards"
 */
export function parseMotherboardSupport(value: string): MotherboardFormFactor[] {
  const result: MotherboardFormFactor[] = [];
  const lowered = value.toLowerCase();
  
  // Mini-ITX variants
  if (lowered.includes('mini-itx') || lowered.includes('mini itx')) {
    result.push('Mini-ITX');
  }
  
  // Mini-DTX
  if (lowered.includes('mini-dtx') || lowered.includes('mini dtx')) {
    result.push('Mini-DTX');
  }
  
  // FlexATX
  if (lowered.includes('flexatx') || lowered.includes('flex atx')) {
    result.push('FlexATX');
  }
  
  // Micro-ATX variants
  if (lowered.includes('micro-atx') || lowered.includes('micro atx') || 
      lowered.includes('matx') || lowered.includes('μatx')) {
    result.push('Micro-ATX');
  }
  
  // Standard ATX (but not E-ATX or Micro-ATX)
  if ((lowered.includes('atx') && !lowered.includes('eatx') && !lowered.includes('e-atx')) ||
      lowered.includes('standard-atx') || lowered.includes('standard atx')) {
    if (!result.includes('ATX')) {
      // Avoid double-adding from "micro-atx" match
      const hasOnlyAtx = /\batx\b/i.test(value) && 
                         !lowered.includes('micro') && 
                         !lowered.includes('μ');
      if (hasOnlyAtx || lowered.includes('standard')) {
        result.push('ATX');
      }
    }
  }
  
  // E-ATX / Extended ATX
  if (lowered.includes('e-atx') || lowered.includes('eatx') || 
      lowered.includes('extended-atx') || lowered.includes('extended atx')) {
    result.push('E-ATX');
  }
  
  // SSI-CEB
  if (lowered.includes('ssi-ceb') || lowered.includes('ceb')) {
    result.push('SSI-CEB');
  }
  
  // SSI-EEB / EEB
  if (lowered.includes('ssi-eeb') || lowered.includes('ssi eeb')) {
    result.push('SSI-EEB');
  }
  if (lowered.includes('eeb') && !lowered.includes('ssi')) {
    result.push('EEB');
  }
  
  return [...new Set(result)]; // Remove duplicates
}

/**
 * Parse dimensions from various formats
 * Examples:
 * - "44.5 x 482 x 428mm" (H x W x D)
 * - "430mm (W) x 88.5mm (H) x 580mm (D)"
 * - "635mm x 431.8mm x 176.78mm (25" x 17" x 6.96")"
 * - "width: 483mm / depth: 450mm / height: 177mm"
 */
export function parseDimensions(value: string): { width_mm: number | null; height_mm: number | null; depth_mm: number | null } {
  const result = { width_mm: null as number | null, height_mm: null as number | null, depth_mm: null as number | null };
  
  // Format: "width: 483mm / depth: 450mm / height: 177mm"
  const labeledMatch = value.match(/width:\s*([\d.]+)\s*mm.*depth:\s*([\d.]+)\s*mm.*height:\s*([\d.]+)\s*mm/i);
  if (labeledMatch) {
    result.width_mm = parseFloat(labeledMatch[1]);
    result.depth_mm = parseFloat(labeledMatch[2]);
    result.height_mm = parseFloat(labeledMatch[3]);
    return result;
  }
  
  // Format: "430mm (W) x 88.5mm (H) x 580mm (D)"
  const wxhxdMatch = value.match(/([\d.]+)\s*mm\s*\(W\)\s*x\s*([\d.]+)\s*mm\s*\(H\)\s*x\s*([\d.]+)\s*mm\s*\(D\)/i);
  if (wxhxdMatch) {
    result.width_mm = parseFloat(wxhxdMatch[1]);
    result.height_mm = parseFloat(wxhxdMatch[2]);
    result.depth_mm = parseFloat(wxhxdMatch[3]);
    return result;
  }
  
  // Format: "H x W x D: 44.5 x 482 x 428mm" (Inter-Tech style)
  const hxwxdMatch = value.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*mm/i);
  if (hxwxdMatch) {
    // Assume H x W x D order if not labeled
    result.height_mm = parseFloat(hxwxdMatch[1]);
    result.width_mm = parseFloat(hxwxdMatch[2]);
    result.depth_mm = parseFloat(hxwxdMatch[3]);
    return result;
  }
  
  return result;
}

/**
 * Parse drive bays from various formats
 * Examples:
 * - "Up to 8x 2.5\" internal, 2x 3.5\" internal"
 * - "External: 5.25\" x 2<br>Internal: 3.5\" x 5, 2.5\" x 1"
 * - "10x 3.5\" Trayless Hot-Swap SATA/SAS HDD Bays"
 */
export function parseDriveBays(value: string): DriveBay[] {
  const bays: DriveBay[] = [];
  
  // Match patterns like "8x 2.5"", "2x 3.5"", "6 x 2.5""
  const regex = /(\d+)\s*x?\s*(2\.5|3\.5|5\.25|E1\.S)["\u201D]?\s*(inch)?\s*(internal|external|hot[- ]?swap)?/gi;
  let match;
  
  while ((match = regex.exec(value)) !== null) {
    const quantity = parseInt(match[1], 10);
    const size = match[2] + '"';
    const location = match[4]?.toLowerCase() || '';
    
    bays.push({
      size: size as DriveBay['size'],
      quantity,
      hot_swap: location.includes('hot') || location.includes('swap'),
      internal: !location.includes('external'),
    });
  }
  
  return bays;
}

/**
 * Parse price from various formats
 * Examples:
 * - "$439.00"
 * - "€ 159,90"
 * - "199.00"
 */
export function parsePrice(value: string, defaultCurrency: Currency = 'USD'): { amount: number | null; currency: Currency } {
  // Determine currency
  let currency: Currency = defaultCurrency;
  if (value.includes('€') || value.includes('EUR')) currency = 'EUR';
  if (value.includes('$') || value.includes('USD')) currency = 'USD';
  if (value.includes('£') || value.includes('GBP')) currency = 'GBP';
  
  // Extract number (handle both 159,90 and 159.90 formats)
  const numMatch = value.match(/([\d,]+\.?\d*)/);
  if (numMatch) {
    let numStr = numMatch[1];
    // Convert European format (159,90) to standard (159.90)
    if (numStr.includes(',') && !numStr.includes('.')) {
      numStr = numStr.replace(',', '.');
    } else {
      numStr = numStr.replace(',', '');
    }
    return { amount: parseFloat(numStr), currency };
  }
  
  return { amount: null, currency };
}

/**
 * Parse CPU cooler height from various formats
 * Examples:
 * - "32mm"
 * - "65mm"
 * - "Height w/ expansion card retainer: 130mm"
 */
export function parseCPUCoolerHeight(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse GPU length from various formats
 */
export function parseGPULength(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse PSU support types from various formats
 * Examples:
 * - "ATX PSU (max length 268mm) or CRPS Redundant PSU"
 * - "1U Server PSU or FlexATX PSU"
 * - "Standard PS2 (ATX), supports up to 180mm long"
 */
export function parsePSUTypes(value: string): PSUType[] {
  const result: PSUType[] = [];
  const lowered = value.toLowerCase();
  
  if (lowered.includes('atx') && !lowered.includes('flex')) result.push('ATX');
  if (lowered.includes('sfx-l')) result.push('SFX-L');
  else if (lowered.includes('sfx')) result.push('SFX');
  if (lowered.includes('flexatx') || lowered.includes('flex atx')) result.push('FlexATX');
  if (lowered.includes('tfx')) result.push('TFX');
  if (lowered.includes('1u')) result.push('1U');
  if (lowered.includes('2u') && lowered.includes('redundant')) result.push('2U Redundant');
  if (lowered.includes('mini') && lowered.includes('redundant')) result.push('Mini Redundant');
  if (lowered.includes('crps')) result.push('CRPS');
  if (lowered.includes('ps2') || lowered.includes('ps/2')) result.push('PS2');
  
  return [...new Set(result)];
}

/**
 * Parse fan mounts from various formats
 */
export function parseFanMounts(value: string): FanMount[] {
  const fans: FanMount[] = [];
  
  // Match patterns like "2x 40mm", "3x 120mm", "80mm x 3"
  const regex = /(\d+)\s*x\s*(\d+)\s*mm|(\d+)\s*mm\s*x\s*(\d+)/gi;
  let match;
  
  while ((match = regex.exec(value)) !== null) {
    const quantity = parseInt(match[1] || match[4], 10);
    const size = parseInt(match[2] || match[3], 10);
    
    // Determine position from context
    let position = 'unknown';
    const context = value.toLowerCase();
    if (context.includes('front')) position = 'front';
    else if (context.includes('rear') || context.includes('back')) position = 'rear';
    else if (context.includes('top')) position = 'top';
    else if (context.includes('inside') || context.includes('internal')) position = 'internal';
    
    fans.push({
      size_mm: size,
      quantity,
      position,
      included: context.includes('included') || context.includes('incl'),
    });
  }
  
  return fans;
}

// ============================================================================
// AVAILABILITY PARSER
// ============================================================================

export function parseAvailability(value: string): AvailabilityStatus {
  const lowered = value.toLowerCase();
  
  if (lowered.includes('in stock') || lowered.includes('available immediately') || 
      lowered.includes('in-stock') || lowered.includes('available')) {
    return 'in-stock';
  }
  if (lowered.includes('out of stock') || lowered.includes('out-of-stock') ||
      lowered.includes('sold out')) {
    return 'out-of-stock';
  }
  if (lowered.includes('pre-order') || lowered.includes('preorder')) {
    return 'pre-order';
  }
  if (lowered.includes('discontinued') || lowered.includes('end of life')) {
    return 'discontinued';
  }
  if (lowered.includes('contact') || lowered.includes('quote')) {
    return 'contact-for-quote';
  }
  
  return 'unknown';
}
