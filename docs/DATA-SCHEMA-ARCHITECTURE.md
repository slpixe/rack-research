# Data Schema & Mapping Architecture

## Overview

This document describes the architecture for normalizing rack case product data from multiple sources into a universal schema that can be filtered, sorted, and displayed in your application.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                    │
├─────────────────┬───────────────┬───────────────┬───────────────┬───────────┤
│  inter-tech.de  │  sliger.com   │silverstonetek │  ipc.in-win   │ yakkaroo  │
│                 │               │               │               │           │
│  German specs   │  US specs     │  US specs     │  Enterprise   │  Reseller │
│  EUR prices     │  USD prices   │  No prices    │  Contact      │  EUR      │
└────────┬────────┴───────┬───────┴───────┬───────┴───────┬───────┴─────┬─────┘
         │                │               │               │             │
         ▼                ▼               ▼               ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOURCE-SPECIFIC MAPPERS                              │
│                                                                              │
│  Each source has its own key mappings and value parsers:                    │
│                                                                              │
│  • interTechKeyMap   → Maps "Dimensions (H x W x D)" → dimensions           │
│  • sligerKeyMap      → Maps "Rack Units" → rack_units                       │
│  • silverStoneKeyMap → Maps "Chassis form factor" → rack_units              │
│  • inWinKeyMap       → Maps "Motherboard Form Factors" → motherboard        │
│  • yakkarooKeyMap    → Maps "Form factor" → motherboard_support             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VALUE PARSERS                                        │
│                                                                              │
│  • parseRackUnits()         "1U", "2U", "4U"                                │
│  • parseMotherboardSupport() "Mini ITX, ATX, E-ATX"                         │
│  • parseDimensions()        "430mm (W) x 88.5mm (H) x 580mm (D)"           │
│  • parseDriveBays()         "8x 2.5\" internal, 2x 3.5\" Hot-Swap"         │
│  • parsePrice()             "€ 159,90" or "$439.00"                         │
│  • parsePSUTypes()          "ATX PSU or CRPS Redundant"                     │
│  • parseFanMounts()         "3x 120mm front, 2x 80mm rear"                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       UNIVERSAL SCHEMA (RackCase)                            │
│                                                                              │
│  Normalized data structure with consistent types and values                  │
│  See: src/schema/types.ts                                                    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE / JSON STORE                                │
│                                                                              │
│  Options:                                                                    │
│  • JSON files (simple, git-trackable)                                       │
│  • SQLite (portable, powerful queries)                                       │
│  • PostgreSQL (if you need a real server)                                   │
│  • Supabase (hosted PostgreSQL + REST API)                                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR APPLICATION                                     │
│                                                                              │
│  Filtering, sorting, and displaying products                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Mapping Strategy

### Yes, Each Source Needs Its Own Mapper

Different sources use different terminology:

| Property | Inter-Tech | Sliger | SilverStone | In-Win | Yakkaroo |
|----------|------------|--------|-------------|--------|----------|
| **Rack height** | Form Factor | Rack Units | Chassis form factor | Rack Units | (in name) |
| **Case depth** | Dimensions (H x W x D) | Depth | Dimension | Depth | Dimensions |
| **Motherboard** | Motherboard Support | Motherboard Support | Motherboard | Motherboard Form Factors | Form factor |
| **GPU length** | Max Graphic Card Length | Max Length | Limitation of expansion card | - | - |
| **PSU** | Power Supply Support | Power Supply | Power Supply | PSU Support | Power supply |
| **CPU cooler** | Max CPU Cooler Height | Air Cooling / Max Height | Limitation of CPU cooler | - | - |

### Value Format Variations

Even when keys are similar, values differ:

```
Dimensions:
- Inter-Tech:   "44.5 x 482 x 428mm" (H x W x D)
- SilverStone:  "430mm (W) x 88.5mm (H) x 580mm (D)"
- Sliger:       "635mm" (separate fields)
- Yakkaroo:     "width: 483mm / depth: 450mm / height: 177mm"

Prices:
- Inter-Tech:   €159,90 (European format with comma)
- Sliger:       $439.00 (US format with period)
- SilverStone:  No price shown
- In-Win:       "Contact for quote"

Motherboards:
- Inter-Tech:   "Mini ITX, mATX, FlexATX, μATX, ATX (max. 305 x 191mm)"
- SilverStone:  "ATX (12\" x 9.6\"), Micro-ATX (9.6\" x 9.6\")"
- Sliger:       Uses checkboxes with multiple form factors
```

## Comprehensive Filterable Properties

### Primary Filters (Most Used)

| Filter | Type | Description |
|--------|------|-------------|
| **price** | Range (min/max) | Price in user's preferred currency |
| **rack_units** | Multi-select | 1U, 1.5U, 2U, 3U, 4U, etc. |
| **depth_mm** | Range | Case depth - critical for rack fit |
| **motherboard_support** | Multi-select | Mini-ITX, ATX, E-ATX, etc. |

### Storage Filters

| Filter | Type | Description |
|--------|------|-------------|
| **total_35_bays** | Range | Number of 3.5" drive bays |
| **total_25_bays** | Range | Number of 2.5" drive bays |
| **total_525_bays** | Range | Number of 5.25" bays |
| **has_hot_swap** | Boolean | Hot-swap drive support |

### GPU & Expansion Filters

| Filter | Type | Description |
|--------|------|-------------|
| **gpu_max_length** | Range | Maximum GPU length in mm |
| **gpu_max_height** | Range | Maximum GPU height/width slots |
| **total_pcie_slots** | Range | Number of PCIe slots |
| **has_full_height_slots** | Boolean | Full-height vs low-profile |

### Cooling Filters

| Filter | Type | Description |
|--------|------|-------------|
| **cpu_cooler_height** | Range | Max CPU cooler height in mm |
| **has_radiator_support** | Boolean | AIO/water cooling support |
| **radiator_size_max** | Range | Maximum radiator size (120, 240, 360) |

### PSU Filters

| Filter | Type | Description |
|--------|------|-------------|
| **psu_types** | Multi-select | ATX, SFX, Redundant, CRPS, etc. |
| **psu_max_length** | Range | Maximum PSU length in mm |
| **psu_included** | Boolean | Whether PSU comes with case |

### Physical Filters

| Filter | Type | Description |
|--------|------|-------------|
| **width_mm** | Range | Usually 430-483mm for 19" racks |
| **height_mm** | Range | Varies by rack units |
| **weight_kg** | Range | Important for shipping/handling |

### Source & Availability Filters

| Filter | Type | Description |
|--------|------|-------------|
| **source** | Multi-select | Filter by vendor |
| **brand** | Multi-select | Filter by manufacturer |
| **availability** | Multi-select | In stock, pre-order, etc. |
| **currency** | Single-select | Show prices in USD/EUR/GBP |

## File Structure

```
src/
├── schema/
│   ├── types.ts           # Universal TypeScript interfaces
│   ├── mappers.ts         # Key mappings & value parsers
│   └── transformers.ts    # Source-specific transformers
├── data/
│   └── products.json      # Normalized product database
└── utils/
    ├── parser.ts          # Markdown file parser
    └── database.ts        # Database operations
```

## Usage Example

```typescript
import { getTransformer } from './schema/transformers';
import type { RackCase } from './schema/types';

// Parse a markdown file from Inter-Tech
const rawData = parseMarkdownFile('resources/inter-tech.de/4u-4420.md');
const transformer = getTransformer('inter-tech.de');

const normalizedCase: RackCase = transformer.transform(rawData, {
  sourceUrl: 'https://inter-tech.de/...',
  scrapedAt: '2025-12-22',
  model: '4U-4420',
  name: 'Inter-Tech 4U-4420',
});

// Now you can filter/sort using consistent keys
const filteredCases = allCases.filter(c => 
  c.rack_units === '4U' &&
  c.gpu_support.max_length_mm >= 300 &&
  c.has_hot_swap === true
);
```

## Database Recommendations

### Option 1: JSON Files (Simplest)
- ✅ Git-trackable
- ✅ No setup required
- ✅ Easy to edit manually
- ❌ Limited query capability
- ❌ Must load entire file

### Option 2: SQLite (Best Balance)
- ✅ Powerful SQL queries
- ✅ Single file, portable
- ✅ Works offline
- ✅ Fast filtering/sorting
- ❌ Requires setup

### Option 3: Supabase/PostgreSQL (For Web App)
- ✅ Real-time updates
- ✅ REST API built-in
- ✅ User authentication
- ❌ Requires hosting
- ❌ More complex setup

## Next Steps

1. **Run the transformers** on all existing markdown files
2. **Generate products.json** with all normalized data
3. **Build filter UI** using the FilterableFields interface
4. **Add new sources** by creating new KeyMapping and Transformer classes
