/**
 * Filter Configuration System
 *
 * This module provides a comprehensive, extensible filter configuration that:
 * 1. Auto-detects property types from the data
 * 2. Maps properties to appropriate filter UI types
 * 3. Supports both static configuration and dynamic data analysis
 *
 * Filter Types:
 * - checkbox: Multi-select from discrete values (brands, sources, rack units)
 * - range: Min/max slider for numeric values (dimensions, price)
 * - boolean: True/false toggle (has_hot_swap, psu_included)
 * - search: Text search within values
 */

// Types are imported dynamically when needed by consumers of this module

// ============================================================================
// FILTER TYPE DEFINITIONS
// ============================================================================

export type FilterType = 'checkbox' | 'range' | 'boolean' | 'search';

export interface BaseFilterConfig {
  /** Unique identifier for the filter */
  id: string;
  /** Human-readable label */
  label: string;
  /** Category for grouping filters in UI */
  category: FilterCategory;
  /** Type of filter UI to render */
  type: FilterType;
  /** Priority for display order (lower = higher priority) */
  priority: number;
  /** Whether this filter should be shown by default */
  defaultVisible: boolean;
  /** Description/tooltip text */
  description?: string;
}

export interface CheckboxFilterConfig extends BaseFilterConfig {
  type: 'checkbox';
  /** Path to the property in RackCase (supports nested paths like 'psu_support.types') */
  propertyPath: string;
  /** Whether the property is an array (for multi-value fields) */
  isArray: boolean;
  /** Optional predefined options (if not provided, auto-detected from data) */
  predefinedOptions?: string[];
  /** How to sort options in the UI */
  sortOptions?: 'alphabetical' | 'count' | 'custom';
  /** Custom sort order if sortOptions is 'custom' */
  customOrder?: string[];
}

export interface RangeFilterConfig extends BaseFilterConfig {
  type: 'range';
  /** Path to the property in RackCase */
  propertyPath: string;
  /** Unit for display (e.g., 'mm', 'kg', '$') */
  unit: string;
  /** Step value for the slider */
  step: number;
  /** Decimal places for display */
  decimals?: number;
  /** Whether to format as currency */
  isCurrency?: boolean;
  /** Currency code if isCurrency is true */
  currencyCode?: string;
}

export interface BooleanFilterConfig extends BaseFilterConfig {
  type: 'boolean';
  /** Path to the property in RackCase */
  propertyPath: string;
  /** Label for true state */
  trueLabel?: string;
  /** Label for false state */
  falseLabel?: string;
}

export interface SearchFilterConfig extends BaseFilterConfig {
  type: 'search';
  /** Paths to search within */
  searchPaths: string[];
  /** Placeholder text */
  placeholder?: string;
}

export type FilterConfig =
  | CheckboxFilterConfig
  | RangeFilterConfig
  | BooleanFilterConfig
  | SearchFilterConfig;

// ============================================================================
// FILTER CATEGORIES
// ============================================================================

export type FilterCategory =
  | 'basic'
  | 'dimensions'
  | 'storage'
  | 'compatibility'
  | 'cooling'
  | 'expansion'
  | 'io'
  | 'pricing';

export const FILTER_CATEGORY_LABELS: Record<FilterCategory, string> = {
  basic: 'Basic',
  dimensions: 'Dimensions',
  storage: 'Storage',
  compatibility: 'Compatibility',
  cooling: 'Cooling',
  expansion: 'Expansion & GPU',
  io: 'Front I/O',
  pricing: 'Price & Availability',
};

export const FILTER_CATEGORY_ORDER: FilterCategory[] = [
  'basic',
  'pricing',
  'dimensions',
  'compatibility',
  'storage',
  'expansion',
  'cooling',
  'io',
];

// ============================================================================
// FILTER CONFIGURATIONS
// ============================================================================

export const FILTER_CONFIGS: FilterConfig[] = [
  // === BASIC FILTERS ===
  {
    id: 'rack_units',
    label: 'Rack Units',
    category: 'basic',
    type: 'checkbox',
    priority: 1,
    defaultVisible: true,
    propertyPath: 'rack_units',
    isArray: false,
    sortOptions: 'custom',
    customOrder: ['1U', '1.5U', '2U', '3U', '4U', '5U', '6U', '7U', '8U', '9U', '10U', '11U', '12U', '13U'],
    description: 'Standard rack unit heights',
  },
  {
    id: 'brand',
    label: 'Brand',
    category: 'basic',
    type: 'checkbox',
    priority: 2,
    defaultVisible: true,
    propertyPath: 'brand',
    isArray: false,
    sortOptions: 'alphabetical',
  },
  {
    id: 'source',
    label: 'Source',
    category: 'basic',
    type: 'checkbox',
    priority: 3,
    defaultVisible: true,
    propertyPath: 'source',
    isArray: false,
    sortOptions: 'alphabetical',
    description: 'Data source website',
  },

  // === PRICING FILTERS ===
  {
    id: 'price',
    label: 'Price',
    category: 'pricing',
    type: 'range',
    priority: 10,
    defaultVisible: true,
    propertyPath: 'price.amount',
    unit: '',
    step: 10,
    decimals: 0,
    isCurrency: true,
    currencyCode: 'EUR', // Most products are in EUR
    description: 'Filter by price range',
  },
  {
    id: 'availability',
    label: 'Availability',
    category: 'pricing',
    type: 'checkbox',
    priority: 11,
    defaultVisible: true,
    propertyPath: 'availability',
    isArray: false,
    predefinedOptions: ['in-stock', 'out-of-stock', 'pre-order', 'discontinued', 'contact-for-quote', 'unknown'],
  },

  // === DIMENSION FILTERS ===
  {
    id: 'depth_mm',
    label: 'Depth',
    category: 'dimensions',
    type: 'range',
    priority: 20,
    defaultVisible: true,
    propertyPath: 'dimensions.depth_mm',
    unit: 'mm',
    step: 10,
    decimals: 0,
    description: 'Case depth in millimeters',
  },
  {
    id: 'width_mm',
    label: 'Width',
    category: 'dimensions',
    type: 'range',
    priority: 21,
    defaultVisible: false,
    propertyPath: 'dimensions.width_mm',
    unit: 'mm',
    step: 5,
    decimals: 0,
    description: 'Case width in millimeters',
  },
  {
    id: 'height_mm',
    label: 'Height',
    category: 'dimensions',
    type: 'range',
    priority: 22,
    defaultVisible: false,
    propertyPath: 'dimensions.height_mm',
    unit: 'mm',
    step: 5,
    decimals: 0,
    description: 'Case height in millimeters',
  },
  {
    id: 'weight_kg',
    label: 'Weight',
    category: 'dimensions',
    type: 'range',
    priority: 23,
    defaultVisible: false,
    propertyPath: 'dimensions.weight_kg',
    unit: 'kg',
    step: 0.5,
    decimals: 1,
    description: 'Case weight in kilograms',
  },

  // === COMPATIBILITY FILTERS ===
  {
    id: 'motherboard_support',
    label: 'Motherboard',
    category: 'compatibility',
    type: 'checkbox',
    priority: 30,
    defaultVisible: true,
    propertyPath: 'motherboard_support',
    isArray: true,
    sortOptions: 'custom',
    customOrder: ['Mini-ITX', 'Mini-DTX', 'FlexATX', 'Micro-ATX', 'ATX', 'E-ATX', 'SSI-CEB', 'SSI-EEB', 'EEB'],
    description: 'Supported motherboard form factors',
  },
  {
    id: 'psu_types',
    label: 'PSU Type',
    category: 'compatibility',
    type: 'checkbox',
    priority: 31,
    defaultVisible: true,
    propertyPath: 'psu_support.types',
    isArray: true,
    sortOptions: 'custom',
    customOrder: ['ATX', 'SFX', 'SFX-L', 'TFX', 'FlexATX', '1U', '2U Redundant', 'Mini Redundant', 'CRPS', 'PS2'],
    description: 'Supported power supply types',
  },
  {
    id: 'psu_included',
    label: 'PSU Included',
    category: 'compatibility',
    type: 'boolean',
    priority: 32,
    defaultVisible: true,
    propertyPath: 'psu_included',
    trueLabel: 'Yes',
    falseLabel: 'No',
  },
  {
    id: 'psu_max_length',
    label: 'PSU Max Length',
    category: 'compatibility',
    type: 'range',
    priority: 33,
    defaultVisible: false,
    propertyPath: 'psu_support.max_length_mm',
    unit: 'mm',
    step: 10,
    decimals: 0,
  },

  // === STORAGE FILTERS ===
  {
    id: 'total_35_bays',
    label: '3.5" Drive Bays',
    category: 'storage',
    type: 'range',
    priority: 40,
    defaultVisible: true,
    propertyPath: 'total_35_bays',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Number of 3.5" drive bays',
  },
  {
    id: 'total_25_bays',
    label: '2.5" Drive Bays',
    category: 'storage',
    type: 'range',
    priority: 41,
    defaultVisible: true,
    propertyPath: 'total_25_bays',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Number of 2.5" drive bays',
  },
  {
    id: 'total_525_bays',
    label: '5.25" Drive Bays',
    category: 'storage',
    type: 'range',
    priority: 42,
    defaultVisible: false,
    propertyPath: 'total_525_bays',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Number of 5.25" optical drive bays',
  },
  {
    id: 'has_hot_swap',
    label: 'Hot Swap',
    category: 'storage',
    type: 'boolean',
    priority: 43,
    defaultVisible: true,
    propertyPath: 'has_hot_swap',
    trueLabel: 'Hot-swap capable',
    falseLabel: 'No hot-swap',
    description: 'Cases with hot-swappable drive bays',
  },

  // === EXPANSION FILTERS ===
  {
    id: 'total_pcie_slots',
    label: 'PCIe Slots',
    category: 'expansion',
    type: 'range',
    priority: 50,
    defaultVisible: true,
    propertyPath: 'total_pcie_slots',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Total number of PCIe expansion slots',
  },
  {
    id: 'has_full_height_slots',
    label: 'Full-Height Slots',
    category: 'expansion',
    type: 'boolean',
    priority: 51,
    defaultVisible: true,
    propertyPath: 'has_full_height_slots',
    trueLabel: 'Full-height supported',
    falseLabel: 'Low-profile only',
    description: 'Supports full-height expansion cards',
  },
  {
    id: 'gpu_max_length',
    label: 'GPU Max Length',
    category: 'expansion',
    type: 'range',
    priority: 52,
    defaultVisible: true,
    propertyPath: 'gpu_support.max_length_mm',
    unit: 'mm',
    step: 10,
    decimals: 0,
    description: 'Maximum supported GPU length',
  },
  {
    id: 'gpu_max_height',
    label: 'GPU Max Height',
    category: 'expansion',
    type: 'range',
    priority: 53,
    defaultVisible: false,
    propertyPath: 'gpu_support.max_height_mm',
    unit: 'mm',
    step: 5,
    decimals: 0,
  },

  // === COOLING FILTERS ===
  {
    id: 'cpu_cooler_height',
    label: 'CPU Cooler Height',
    category: 'cooling',
    type: 'range',
    priority: 60,
    defaultVisible: true,
    propertyPath: 'cpu_cooler.max_height_mm',
    unit: 'mm',
    step: 5,
    decimals: 0,
    description: 'Maximum CPU cooler height clearance',
  },
  {
    id: 'has_radiator_support',
    label: 'Radiator Support',
    category: 'cooling',
    type: 'boolean',
    priority: 61,
    defaultVisible: true,
    propertyPath: 'radiator_support',
    trueLabel: 'Has radiator mounts',
    falseLabel: 'No radiator support',
    description: 'Cases with AIO/radiator mounting options',
  },

  // === I/O FILTERS ===
  {
    id: 'usb_type_c',
    label: 'USB-C Ports',
    category: 'io',
    type: 'range',
    priority: 70,
    defaultVisible: false,
    propertyPath: 'front_io.usb_type_c',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Number of front USB-C ports',
  },
  {
    id: 'usb_3_ports',
    label: 'USB 3.x Ports',
    category: 'io',
    type: 'range',
    priority: 71,
    defaultVisible: false,
    propertyPath: 'front_io.usb_type_a_3_0',
    unit: '',
    step: 1,
    decimals: 0,
    description: 'Number of front USB 3.0/3.1 Type-A ports',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a nested property value from an object using a dot-separated path
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Get filter config by ID
 */
export function getFilterConfig(id: string): FilterConfig | undefined {
  return FILTER_CONFIGS.find(f => f.id === id);
}

/**
 * Get all filters in a category
 */
export function getFiltersByCategory(category: FilterCategory): FilterConfig[] {
  return FILTER_CONFIGS.filter(f => f.category === category).sort((a, b) => a.priority - b.priority);
}

/**
 * Get all visible filters by default
 */
export function getDefaultVisibleFilters(): FilterConfig[] {
  return FILTER_CONFIGS.filter(f => f.defaultVisible).sort((a, b) => a.priority - b.priority);
}

/**
 * Group filters by category
 */
export function getFiltersGroupedByCategory(): Map<FilterCategory, FilterConfig[]> {
  const grouped = new Map<FilterCategory, FilterConfig[]>();

  for (const category of FILTER_CATEGORY_ORDER) {
    const filters = getFiltersByCategory(category);
    if (filters.length > 0) {
      grouped.set(category, filters);
    }
  }

  return grouped;
}
