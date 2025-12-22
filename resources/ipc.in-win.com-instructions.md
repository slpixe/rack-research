# ipc.in-win.com Scraping Instructions

This document contains the technical details and selectors required to scrape product information from ipc.in-win.com rackmount chassis pages efficiently.

## Navigation & Discovery

- **Product Category Page**: `https://ipc.in-win.com/rackmount-chassis`
- **Loading Behavior**: The site may use dynamic content loading. Wait for product grid to fully render.
- **Discovery**: Products are organized by form factor (1U, 2U, 4U, 6.5U) with filters for:
  - Product Line (Storage Server, Compact Server)
  - Form Factor (1U, 2U, 3U, 4U, 6.5U)
  - Drive Bays
  - Chassis Depth
  - Slide Rail
  - Power Supply
- **Pagination**: Results are paginated with navigation controls (e.g., "1 2 3 > >|")
- **Product URLs**: Follow the pattern `https://ipc.in-win.com/rackmount-chassis-{model-name}`

## Individual Product Scraping Process

### 1. Product Information
- **Product Title**: Located in `h1` or similar header element
- **Product Description**: Look for product overview text in main content area
- **Model Number**: Usually part of the title or in a dedicated specifications field

### 2. Technical Specifications
- **Location**: Specifications are typically in a table format
- **Table Structure**: 
  - Standard HTML `<table>` element
  - Two-column format: Feature/Specification | Details/Value
  - May use `<thead>` with `<th>` for headers
  - `<tbody>` with `<tr>` rows containing `<td>` cells

### 3. Data Extraction (DOM Selectors)

#### Primary Selectors:
- **Specs Table**: `table` (look for specs/specifications table)
- **Specs Section**: `.product-specifications` or similar container
- **Table Rows**: `table tbody tr`
- **Feature Name**: First `td` in row
- **Feature Value**: Second `td` in row

#### Alternative Selectors:
- **All Tables**: `document.querySelectorAll('table')`
- **Specification Rows**: `.specs-table tbody tr` or `table.product-specs tr`

### 4. Common Specifications to Extract

Based on InWin rackmount chassis products, look for:

- **Industry Standard**: EIA-RS310D compliance
- **M/B Form Factor**: ATX, Micro-ATX, Mini-ITX dimensions
- **Drive Bay**: External and internal drive counts (2.5", 3.5", 5.25", hot-swap)
- **Power Supply**: Type (Flex, ATX) and wattage
- **Indicators**: LED status lights (Power, HDD, LAN)
- **Front Control Panel**: USB ports, power/reset switches
- **Cooling Fans**: Size, quantity, location, PWM support
- **Expansion Slot**: PCIe slots, riser card support
- **Material**: Chassis material and thickness (e.g., SGCC, 1.0mm)
- **Rail Kit**: Slide rail support and specifications
- **Dimensions**: D x W x H in mm (chassis and package)
- **Weight**: Net and gross weight in kg
- **Container Information**: Shipping container capacity (20', 40', 40'HQ)

### 5. Images
- Product images are typically available on the page
- Look for `img` tags in product gallery or main product area
- Save image URLs for reference

## Output Requirements

### HTML Capture
- Save the full HTML of the product page after all content has loaded
- Path: `resources/ipc.in-win.com/{model}.html`
- Naming convention: Use lowercase model name with hyphens (e.g., `iw-ra102.html`)

### Markdown Format
- Generate a standardized Markdown file using the case-template.md
- Include all available specifications organized by category:
  - Pricing (if available)
  - Dimensions (Outer, Internal, Weight)
  - Compatibility (Motherboard, PSU, GPU, PCIe)
  - Cooling (CPU Cooler, Fans)
  - Storage (Drive bays and hot-swap capability)
  - I/O (Front panel)
  - Rack Mounting (Rails)
  - Additional specs specific to InWin products
- Path: `resources/ipc.in-win.com/{model}.md`

## Known Product List

### 1U Rackmount Chassis (10 products)

- [ ] **IW-RL100** - 1U Liquid-Cooled Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rl100
  
- [x] **IW-RA100** - 1U Compact Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-ra100
  
- [x] **IW-RA102** - 1U Compact Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-ra102
  
- [x] **IW-RF100** - 1U Short Depth Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rf100
  
- [x] **IW-RF100S** - 1U Short Depth Mini-ITX Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rf100s
  
- [ ] **IW-RS104-07** - 1U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs104-07
  
- [ ] **IW-RS108-07** - 1U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs108-07
  
- [ ] **IW-RS110-07** - 1U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs110-07
  
- [ ] **IW-RS112-08** - 1U PCIe Gen5 NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs112-08
  
- [ ] **IW-RS116-E1** - 1U PCIe Gen5 NVMe E1.S Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs116-e1

### 2U Rackmount Chassis (5 products)

- [ ] **IW-RL200** - 2U Liquid-Cooled Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rl200
  
- [ ] **IW-R200N** - 2U Open-Bay Middle Depth Server Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r200n
  
- [ ] **IW-R200-01N** - 2U Open-Bay Long Depth Server Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r200-01n
  
- [ ] **IW-R200-02N** - 2U Open-Bay Short Depth Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r200-02n
  
- [ ] **IW-RS208-07** - 2U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs208-07

### 4U Rackmount Chassis (7 products)

- [ ] **IW-RL400** - 4U Liquid-Cooled Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rl400
  
- [ ] **IW-R400N** - 4U Open-Bay Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r400n
  
- [ ] **IW-R400-01N** - 4U Open-Bay Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r400-01n
  
- [ ] **IW-R400-03N** - 4U Open-Bay Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-r400-03n
  
- [ ] **IW-RN424-04** - 4U Dual Node Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rn424-04
  
- [ ] **IW-RS424-07** - 4U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs424-07
  
- [ ] **IW-RS436-07** - 4U NVMe Hybrid Rackmount Chassis
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rs436-07

### Other Form Factors

- [ ] **IW-RG650A** - 6.5U Rackmount Chassis (Dual Chamber GPU Server)
  - URL: https://ipc.in-win.com/rackmount-chassis-iw-rg650a

## Extraction Script Example (JavaScript/Playwright)

```javascript
// Navigate to product page
await page.goto(productUrl);

// Wait for content to load
await page.waitForSelector('table');

// Extract specifications
const specs = await page.evaluate(() => {
  const data = {
    title: document.querySelector('h1')?.innerText.trim(),
    specs: {}
  };
  
  // Extract from all tables
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const key = cells[0].innerText.trim();
        const value = cells[1].innerText.trim();
        if (key && value) {
          data.specs[key] = value;
        }
      }
    });
  });
  
  return data;
});

// Save HTML
const html = await page.content();
await fs.writeFile(`resources/ipc.in-win.com/${modelName}.html`, html);

// Generate Markdown
// Use specs object to populate case-template.md
```

## Notes

- The site may be blocked by some automated tools - manual extraction or alternative methods may be required
- Product availability and specifications may change over time
- Some products may have additional specification sheets or downloadable PDFs
- Pricing information is typically not available on the product pages (contact for quote)
- Check for any dynamic content that requires JavaScript to render
