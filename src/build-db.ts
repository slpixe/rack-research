#!/usr/bin/env tsx
/**
 * Markdown Parser & Database Generator
 *
 * Parses all markdown files from resources/ and generates a unified JSON database.
 *
 * Usage: npm run build:db
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  RackCase,
  DataSource,
  Currency,
  AvailabilityStatus,
  MotherboardFormFactor,
  PSUType,
  DriveBay,
} from './schema/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES
// ============================================================================

interface ParsedMarkdown {
  title: string;
  sourceUrl: string;
  scrapedAt: string;
  overview?: string;
  sku?: string;
  availability?: string;
  specifications: Record<string, string>;
  pricing: Record<string, string>;
}

interface Dimensions {
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
}

interface Price {
  amount: number | null;
  currency: Currency;
}

// ============================================================================
// VALUE PARSERS
// ============================================================================

function parseRackUnits(value: string): string | null {
  const match = value.match(/(\d+\.?\d*)\s*U/i);
  if (match) {
    return `${match[1]}U`;
  }
  return null;
}

function parseMotherboardSupport(value: string): MotherboardFormFactor[] {
  const result: MotherboardFormFactor[] = [];
  const lowered = value.toLowerCase();

  if (lowered.includes('mini-itx') || lowered.includes('mini itx')) result.push('Mini-ITX');
  if (lowered.includes('mini-dtx') || lowered.includes('mini dtx')) result.push('Mini-DTX');
  if (lowered.includes('flexatx') || lowered.includes('flex atx')) result.push('FlexATX');
  if (
    lowered.includes('micro-atx') ||
    lowered.includes('micro atx') ||
    lowered.includes('matx') ||
    lowered.includes('μatx')
  )
    result.push('Micro-ATX');
  if (
    /\batx\b/i.test(value) &&
    !lowered.includes('micro') &&
    !lowered.includes('μ') &&
    !lowered.includes('e-atx') &&
    !lowered.includes('eatx') &&
    !lowered.includes('flex')
  ) {
    result.push('ATX');
  }
  if (
    lowered.includes('e-atx') ||
    lowered.includes('eatx') ||
    lowered.includes('extended-atx') ||
    lowered.includes('extended atx')
  )
    result.push('E-ATX');
  if (lowered.includes('ssi-ceb') || lowered.includes('ceb')) result.push('SSI-CEB');
  if (lowered.includes('ssi-eeb') || lowered.includes('ssi eeb') || lowered.includes('eeb'))
    result.push('SSI-EEB');

  return [...new Set(result)];
}

function parseDimensions(value: string): Dimensions {
  const result: Dimensions = { width_mm: null, height_mm: null, depth_mm: null };

  // Format: "width: 483mm / depth: 450mm / height: 177mm"
  const labeledMatch = value.match(
    /width:\s*([\d.]+)\s*mm.*depth:\s*([\d.]+)\s*mm.*height:\s*([\d.]+)\s*mm/i
  );
  if (labeledMatch) {
    result.width_mm = parseFloat(labeledMatch[1]);
    result.depth_mm = parseFloat(labeledMatch[2]);
    result.height_mm = parseFloat(labeledMatch[3]);
    return result;
  }

  // Format: "430mm (W) x 88.5mm (H) x 580mm (D)"
  const wxhxdMatch = value.match(
    /([\d.]+)\s*mm\s*\(W\)\s*x\s*([\d.]+)\s*mm\s*\(H\)\s*x\s*([\d.]+)\s*mm\s*\(D\)/i
  );
  if (wxhxdMatch) {
    result.width_mm = parseFloat(wxhxdMatch[1]);
    result.height_mm = parseFloat(wxhxdMatch[2]);
    result.depth_mm = parseFloat(wxhxdMatch[3]);
    return result;
  }

  // Format: "H x W x D: 44.5 x 482 x 428mm" (Inter-Tech style)
  const hxwxdMatch = value.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*mm/i);
  if (hxwxdMatch) {
    result.height_mm = parseFloat(hxwxdMatch[1]);
    result.width_mm = parseFloat(hxwxdMatch[2]);
    result.depth_mm = parseFloat(hxwxdMatch[3]);
    return result;
  }

  return result;
}

function parseDriveBays(value: string): DriveBay[] {
  const bays: DriveBay[] = [];
  const regex =
    /(\d+)\s*x?\s*(2\.5|3\.5|5\.25|E1\.S)["\u201D]?\s*(inch)?\s*(internal|external|hot[- ]?swap)?/gi;
  let match;

  while ((match = regex.exec(value)) !== null) {
    const quantity = parseInt(match[1], 10);
    const size = (match[2] + '"') as DriveBay['size'];
    const location = match[4]?.toLowerCase() || '';

    bays.push({
      size,
      quantity,
      hot_swap: location.includes('hot') || location.includes('swap'),
      internal: !location.includes('external'),
    });
  }

  return bays;
}

function parsePrice(value: string, defaultCurrency: Currency = 'USD'): Price {
  let currency: Currency = defaultCurrency;
  if (value.includes('€') || value.includes('EUR')) currency = 'EUR';
  if (value.includes('$') || value.includes('USD')) currency = 'USD';
  if (value.includes('£') || value.includes('GBP')) currency = 'GBP';

  const numMatch = value.match(/([\d,]+\.?\d*)/);
  if (numMatch) {
    let numStr = numMatch[1];
    if (numStr.includes(',') && !numStr.includes('.')) {
      numStr = numStr.replace(',', '.');
    } else {
      numStr = numStr.replace(',', '');
    }
    return { amount: parseFloat(numStr), currency };
  }

  return { amount: null, currency };
}

function parseMillimeters(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}

function parsePSUTypes(value: string): PSUType[] {
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

function parseAvailability(value: string): AvailabilityStatus {
  const lowered = value.toLowerCase();

  if (lowered.includes('in stock') || lowered.includes('available immediately')) return 'in-stock';
  if (lowered.includes('out of stock') || lowered.includes('sold out')) return 'out-of-stock';
  if (lowered.includes('pre-order') || lowered.includes('preorder')) return 'pre-order';
  if (lowered.includes('discontinued')) return 'discontinued';
  if (lowered.includes('contact') || lowered.includes('quote')) return 'contact-for-quote';

  return 'unknown';
}

// ============================================================================
// MARKDOWN PARSER
// ============================================================================

function parseMarkdownFile(filePath: string): ParsedMarkdown {
  const content = fs.readFileSync(filePath, 'utf-8');

  const result: ParsedMarkdown = {
    title: '',
    sourceUrl: '',
    scrapedAt: '',
    specifications: {},
    pricing: {},
  };

  // Extract title (first H1)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) result.title = titleMatch[1].trim();

  // Extract source URL
  const sourceMatch = content.match(/Source:\s*\[([^\]]+)\]\(([^)]+)\)/);
  if (sourceMatch) result.sourceUrl = sourceMatch[2];

  // Extract scraped date
  const scrapedMatch = content.match(/Scraped:\s*(\d{4}-\d{2}-\d{2})/);
  if (scrapedMatch) result.scrapedAt = scrapedMatch[1];

  // Extract overview
  const overviewMatch = content.match(/## Overview\s*\n\n(.+?)(?=\n\n##|\n\n\|)/s);
  if (overviewMatch) result.overview = overviewMatch[1].trim();

  // Extract SKU
  const skuMatch = content.match(/SKU:\s*(\S+)/);
  if (skuMatch) result.sku = skuMatch[1];

  // Extract availability
  const availMatch = content.match(/Status:\s*\*\*(.+?)\*\*/);
  if (availMatch) result.availability = availMatch[1];

  // Parse tables
  const tableRegex = /\|(.+?)\|(.+?)\|/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const key = match[1].trim().replace(/\*\*/g, '');
    const value = match[2].trim().replace(/\*\*/g, '');

    if (
      key === ':---' ||
      key === '---' ||
      key.includes('---') ||
      key === 'Attribute' ||
      key === 'Feature' ||
      key === 'Specification' ||
      key === 'Item' ||
      key === 'Type' ||
      key === 'Position'
    )
      continue;

    if (key === 'Case' || key === 'Shipping') {
      result.pricing[key] = value;
    } else {
      result.specifications[key] = value;
    }
  }

  // Parse bullet-point style data
  const bulletRegex = /^-\s+\*\*(.+?):\*\*\s*(.+)$/gm;
  while ((match = bulletRegex.exec(content)) !== null) {
    result.specifications[match[1].trim()] = match[2].trim();
  }

  return result;
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

function getSourceFromPath(filePath: string): DataSource {
  if (filePath.includes('inter-tech.de')) return 'inter-tech.de';
  if (filePath.includes('sliger.com')) return 'sliger.com';
  if (filePath.includes('silverstonetek.com')) return 'silverstonetek.com';
  if (filePath.includes('ipc.in-win.com')) return 'ipc.in-win.com';
  if (filePath.includes('yakkaroo.de')) return 'yakkaroo.de';
  if (filePath.includes('unykach.com')) return 'unykach.com';
  return 'inter-tech.de'; // Default fallback
}

function getBrandFromSource(source: DataSource): string {
  const brands: Record<DataSource, string> = {
    'inter-tech.de': 'Inter-Tech',
    'sliger.com': 'Sliger',
    'silverstonetek.com': 'SilverStone',
    'ipc.in-win.com': 'In-Win',
    'yakkaroo.de': 'Various',
    'unykach.com': 'UNYKAch',
  };
  return brands[source] || 'Unknown';
}

function getCurrencyFromSource(source: DataSource): Currency {
  const currencies: Record<DataSource, Currency> = {
    'inter-tech.de': 'EUR',
    'sliger.com': 'USD',
    'silverstonetek.com': 'USD',
    'ipc.in-win.com': 'USD',
    'yakkaroo.de': 'EUR',
    'unykach.com': 'EUR',
  };
  return currencies[source] || 'USD';
}

function getModelFromFilename(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^(\d+)u-/i, (_: string, num: string) => `${num}U-`).toUpperCase();
}

function transformToUniversal(
  parsed: ParsedMarkdown,
  source: DataSource,
  filePath: string
): RackCase {
  const specs = parsed.specifications;
  const currency = getCurrencyFromSource(source);

  // Determine rack units from various sources
  const rackUnitsRaw =
    specs['Form Factor'] ||
    specs['Rack Units'] ||
    specs['Chassis form factor'] ||
    parsed.title ||
    '';
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
    .filter(b => b.size === '2.5"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const total_35_bays = driveBays
    .filter(b => b.size === '3.5"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const total_525_bays = driveBays
    .filter(b => b.size === '5.25"')
    .reduce((sum, b) => sum + b.quantity, 0);
  const has_hot_swap = driveBays.some(b => b.hot_swap);

  // Parse GPU support
  const gpuRaw =
    specs['Max Graphic Card Length'] ||
    specs['Graphics Card Length (max.)'] ||
    specs['Max Length'] ||
    specs['Limitation of expansion card'] ||
    '';
  const gpu_max_length = parseMillimeters(gpuRaw);

  // Parse CPU cooler height
  const cpuRaw =
    specs['Max CPU Cooler Height'] ||
    specs['CPU Cooler Height (max.)'] ||
    specs['Limitation of CPU cooler'] ||
    specs['Air Cooling'] ||
    '';
  const cpu_cooler_height = parseMillimeters(cpuRaw);

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
  const weightMatch = weightRaw.match(/([\d.]+)\s*kg/);
  const weight_kg = weightMatch ? parseFloat(weightMatch[1]) : null;

  const model = specs['Model No.'] || specs['Model'] || getModelFromFilename(filePath);

  return {
    // Identification
    id: `${source}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
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

// ============================================================================
// DATABASE GENERATOR
// ============================================================================

interface ProductDatabase {
  generated_at: string;
  total_products: number;
  sources: DataSource[];
  products: RackCase[];
}

function generateDatabase(resourcesDir: string): RackCase[] {
  const products: RackCase[] = [];
  const sources = fs.readdirSync(resourcesDir);

  for (const source of sources) {
    const sourceDir = path.join(resourcesDir, source);
    if (!fs.statSync(sourceDir).isDirectory()) continue;

    const files = fs.readdirSync(sourceDir).filter((f: string) => f.endsWith('.md'));

    for (const file of files) {
      // Skip instruction/summary files
      if (file.includes('instructions') || file.includes('SUMMARY')) continue;

      const filePath = path.join(sourceDir, file);

      try {
        const dataSource = getSourceFromPath(filePath);
        const parsed = parseMarkdownFile(filePath);
        const product = transformToUniversal(parsed, dataSource, filePath);

        products.push(product);
        console.log(`✓ ${product.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error processing ${filePath}:`, message);
      }
    }
  }

  return products;
}

function saveDatabase(products: RackCase[], outputPath: string): void {
  const output: ProductDatabase = {
    generated_at: new Date().toISOString(),
    total_products: products.length,
    sources: [...new Set(products.map(p => p.source))] as DataSource[],
    products,
  };

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${products.length} products to ${outputPath}`);
}

// ============================================================================
// MAIN
// ============================================================================

const resourcesDir = path.join(__dirname, '..', 'resources');
const outputPath = path.join(__dirname, '..', 'data', 'products.json');

console.log('🔍 Parsing markdown files...\n');
const products = generateDatabase(resourcesDir);

console.log('\n📊 Summary by source:');
const bySource = products.reduce(
  (acc, p) => {
    acc[p.source] = (acc[p.source] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

Object.entries(bySource)
  .sort((a, b) => b[1] - a[1])
  .forEach(([src, count]) => {
    console.log(`   ${src}: ${count} products`);
  });

console.log('\n📊 Summary by rack units:');
const byRackUnits = products.reduce(
  (acc, p) => {
    acc[p.rack_units] = (acc[p.rack_units] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

Object.entries(byRackUnits)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([units, count]) => {
    console.log(`   ${units}: ${count} products`);
  });

saveDatabase(products, outputPath);
