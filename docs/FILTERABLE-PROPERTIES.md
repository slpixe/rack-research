# Comprehensive Filterable Properties Reference

This document lists ALL properties that can be used for filtering and sorting rack case products across your application.

## Quick Reference: Most Useful Filters

| Filter | Type | Example Values | Use Case |
|--------|------|----------------|----------|
| `rack_units` | Multi-select | 1U, 2U, 3U, 4U | Rack space constraints |
| `depth_mm` | Range | 300-700mm | Rack depth compatibility |
| `price.amount` | Range | $100-$500 | Budget filtering |
| `total_35_bays` | Range | 0-24+ | Storage capacity needs |
| `gpu_max_length` | Range | 150-400mm | GPU compatibility |
| `motherboard_support` | Multi-select | ATX, E-ATX, Mini-ITX | Build requirements |
| `has_hot_swap` | Boolean | true/false | Enterprise needs |

---

## 1. Identification & Source

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `id` | string | Unique identifier (source-model) | ❌ | ❌ |
| `model` | string | Product model number | ✅ search | ✅ |
| `brand` | string | Manufacturer (Inter-Tech, Sliger, etc.) | ✅ multi-select | ✅ |
| `name` | string | Full product name | ✅ search | ✅ |
| `source` | enum | Data source website | ✅ multi-select | ✅ |
| `source_url` | string | Original product URL | ❌ | ❌ |
| `scraped_at` | date | When data was collected | ✅ range | ✅ |
| `sku` | string | Vendor SKU | ✅ search | ❌ |

### Source Values
- `inter-tech.de`
- `sliger.com`
- `silverstonetek.com`
- `ipc.in-win.com`
- `yakkaroo.de`
- `unykach.com`

### Brand Values
- `Inter-Tech`
- `Sliger`
- `SilverStone`
- `In-Win`
- `UNYKAch`
- `Various` (resellers like Yakkaroo)

---

## 2. Pricing & Availability

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `price.amount` | number | Price value | ✅ range | ✅ |
| `price.currency` | enum | USD, EUR, GBP | ✅ single-select | ❌ |
| `availability` | enum | Stock status | ✅ multi-select | ✅ |

### Availability Values
- `in-stock` - Available immediately
- `out-of-stock` - Currently unavailable
- `pre-order` - Available for pre-order
- `discontinued` - No longer produced
- `contact-for-quote` - Enterprise pricing
- `unknown` - Status not specified

---

## 3. Physical Dimensions

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `rack_units` | enum | 1U, 1.5U, 2U, 3U, 4U, etc. | ✅ multi-select | ✅ |
| `dimensions.width_mm` | number | Width in millimeters | ✅ range | ✅ |
| `dimensions.height_mm` | number | Height in millimeters | ✅ range | ✅ |
| `dimensions.depth_mm` | number | Depth in millimeters | ✅ range | ✅ |
| `dimensions.weight_kg` | number | Weight in kilograms | ✅ range | ✅ |
| `material` | string | Construction material | ✅ search | ❌ |
| `color` | string | Color/finish | ✅ search | ❌ |

### Rack Unit Values
- `1U` (44.45mm height)
- `1.5U` (~66mm height)
- `2U` (88.9mm height)
- `3U` (133.35mm height)
- `4U` (177.8mm height)
- `5U` (222.25mm height)
- `6U` (266.7mm height)
- Higher units (7U-13U)

### Typical Dimension Ranges
| Dimension | Min | Max | Notes |
|-----------|-----|-----|-------|
| Width | 430mm | 483mm | 19" racks require ~450-483mm |
| Depth | 250mm | 700mm+ | Critical for rack compatibility |
| Height | 44mm (1U) | 577mm (13U) | Based on rack units |

---

## 4. Motherboard Compatibility

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `motherboard_support` | array | Supported form factors | ✅ multi-select (any) | ❌ |
| `motherboard_max_dimensions` | string | Maximum board size | ✅ search | ❌ |

### Motherboard Form Factor Values
| Form Factor | Dimensions | Typical Use Case |
|-------------|------------|------------------|
| `Mini-ITX` | 170 × 170mm | Compact builds |
| `Mini-DTX` | 170 × 203mm | Compact with extra slot |
| `FlexATX` | 229 × 191mm | Small form factor |
| `Micro-ATX` | 244 × 244mm | Mid-size builds |
| `ATX` | 305 × 244mm | Standard builds |
| `E-ATX` | 305 × 330mm | High-end builds |
| `SSI-CEB` | 305 × 267mm | Server/workstation |
| `SSI-EEB` | 305 × 330mm | Enterprise server |
| `EEB` | 305 × 330mm | Enterprise server |

---

## 5. Cooling Support

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `cpu_cooler.max_height_mm` | number | Max cooler height | ✅ range | ✅ |
| `fan_mounts` | array | Available fan positions | ❌ | ❌ |
| `radiator_support` | array | AIO/radiator compatibility | ✅ boolean (has any) | ❌ |

### CPU Cooler Height Ranges
| Range | Cooler Type |
|-------|-------------|
| 25-40mm | Low-profile (1U cases) |
| 40-70mm | Low-profile (2U cases) |
| 70-130mm | Mid-height (3U-4U) |
| 130-180mm | Full tower height |

---

## 6. Storage

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `drive_bays` | array | Detailed bay information | ❌ | ❌ |
| `total_25_bays` | number | Total 2.5" drive bays | ✅ range | ✅ |
| `total_35_bays` | number | Total 3.5" drive bays | ✅ range | ✅ |
| `total_525_bays` | number | Total 5.25" drive bays | ✅ range | ✅ |
| `has_hot_swap` | boolean | Hot-swap capability | ✅ boolean | ✅ |
| `storage_backplane` | object | Backplane details | ✅ multi-select (type) | ❌ |

### Storage Capacity Guidelines
| Use Case | 3.5" Bays | 2.5" Bays |
|----------|-----------|-----------|
| Basic server | 2-4 | 2-4 |
| NAS/Storage | 8-24+ | 4-8 |
| High-density | 24-48+ | 12-24+ |

### Backplane Types
- `SAS` - Enterprise SAS drives
- `SATA` - Consumer SATA drives
- `NVMe` - NVMe SSDs
- `SFF-8087` - Mini-SAS connector
- `SFF-8643` - Mini-SAS HD connector
- `MCIO` - PCIe Gen5 connector

---

## 7. Expansion & GPU

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `expansion_slots` | array | Slot details | ❌ | ❌ |
| `total_pcie_slots` | number | Total PCIe slots | ✅ range | ✅ |
| `has_full_height_slots` | boolean | Full-height cards supported | ✅ boolean | ✅ |
| `gpu_support.max_length_mm` | number | Max GPU length | ✅ range | ✅ |
| `gpu_support.max_height_mm` | number | Max GPU height/width | ✅ range | ✅ |

### GPU Length Guidelines
| GPU Class | Length Range |
|-----------|--------------|
| Low-profile | 150-200mm |
| Mid-range | 200-280mm |
| High-end | 280-330mm |
| Flagship | 330-400mm+ |

### Expansion Slot Types
- `full-height` - Standard desktop cards
- `low-profile` - Half-height cards
- `half-height` - Very compact cards

---

## 8. Power Supply

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `psu_support.types` | array | Supported PSU types | ✅ multi-select (any) | ❌ |
| `psu_support.max_length_mm` | number | Max PSU length | ✅ range | ✅ |
| `psu_included` | boolean | PSU included with case | ✅ boolean | ✅ |

### PSU Type Values
| Type | Description | Typical Wattage |
|------|-------------|-----------------|
| `ATX` | Standard desktop | 200-1600W |
| `SFX` | Small form factor | 300-850W |
| `SFX-L` | Extended SFX | 500-1000W |
| `TFX` | Thin form factor | 180-350W |
| `FlexATX` | Flex ATX | 150-500W |
| `1U` | 1U server | 200-500W |
| `2U Redundant` | Dual redundant | 400-1600W |
| `Mini Redundant` | Compact redundant | 300-800W |
| `CRPS` | Common redundant | 750-2400W |
| `PS2` | Standard server | 200-700W |

---

## 9. Front I/O

| Property | Type | Description | Filterable | Sortable |
|----------|------|-------------|------------|----------|
| `front_io.usb_type_a_2_0` | number | USB 2.0 Type-A ports | ✅ range | ✅ |
| `front_io.usb_type_a_3_0` | number | USB 3.0 Type-A ports | ✅ range | ✅ |
| `front_io.usb_type_a_3_1` | number | USB 3.1 Type-A ports | ✅ range | ✅ |
| `front_io.usb_type_c` | number | USB Type-C ports | ✅ range | ✅ |
| `front_io.audio_jack` | boolean | 3.5mm audio | ✅ boolean | ❌ |
| `front_io.power_button` | boolean | Front power button | ✅ boolean | ❌ |
| `front_io.reset_button` | boolean | Front reset button | ✅ boolean | ❌ |

---

## 10. Filter Combinations (Common Use Cases)

### Home Lab / NAS Build
```javascript
{
  rack_units: ['2U', '3U', '4U'],
  total_35_bays_min: 4,
  has_hot_swap: true,
  price_max: 300,
  motherboard_support: ['ATX', 'Micro-ATX']
}
```

### GPU Workstation
```javascript
{
  rack_units: ['3U', '4U'],
  gpu_max_length_min: 300,
  has_full_height_slots: true,
  total_pcie_slots_min: 2,
  cpu_cooler_height_min: 100
}
```

### Compact 1U Server
```javascript
{
  rack_units: ['1U'],
  depth_mm_max: 400,
  motherboard_support: ['Mini-ITX', 'Micro-ATX'],
  psu_types: ['1U', 'FlexATX']
}
```

### Enterprise Storage
```javascript
{
  rack_units: ['2U', '3U', '4U'],
  total_35_bays_min: 12,
  has_hot_swap: true,
  psu_types: ['2U Redundant', 'CRPS']
}
```

### Budget Build
```javascript
{
  price_max: 150,
  availability: ['in-stock'],
  motherboard_support: ['ATX', 'Micro-ATX']
}
```

---

## 11. API Filter Query Examples

### REST API Query Parameters
```
GET /api/products?
  rack_units=2U,4U&
  price_min=100&
  price_max=500&
  total_35_bays_min=4&
  has_hot_swap=true&
  motherboard_support=ATX,E-ATX&
  sort=price&
  order=asc
```

### JavaScript Filter Object
```javascript
const filters = {
  rack_units: ['2U', '4U'],
  price: { min: 100, max: 500 },
  total_35_bays: { min: 4 },
  has_hot_swap: true,
  motherboard_support: ['ATX', 'E-ATX'],
  sort: 'price',
  order: 'asc'
};
```

---

## 12. Data Quality Notes

### Properties with Best Coverage
1. `rack_units` - ~95% populated
2. `motherboard_support` - ~85% populated
3. `dimensions.depth_mm` - ~80% populated
4. `total_35_bays` / `total_25_bays` - ~75% populated

### Properties Often Missing
1. `price` - Many enterprise products contact-for-quote
2. `gpu_support.max_length_mm` - Not always specified
3. `cpu_cooler.max_height_mm` - Often missing from specs
4. `dimensions.weight_kg` - Inconsistently provided

### Recommended Default Handling
- Show "N/A" or "Not specified" for missing values
- Allow filtering to include/exclude products with missing data
- Consider showing products with missing data at the end when sorting
