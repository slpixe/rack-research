# yakkaroo.de Scraping Instructions

## Overview

yakkaroo.de is a German server chassis retailer specializing in 19-inch rack-mount cases.

**Website:** https://www.yakkaroo.de/

**Date Scraped:** December 22, 2025

**Total Products Scraped:** 52

## Categories Scraped

The following rack unit categories were scraped:

1. **1U (1 unit)** - https://www.yakkaroo.de/1U-rack-mount-server-chassis
2. **1U+ (1 unit plus)** - https://www.yakkaroo.de/1U-plus-rack-mount-server-chassis
3. **2U (2 units)** - https://www.yakkaroo.de/2U-rack-mount-server-chassis
4. **3U (3 units)** - https://www.yakkaroo.de/3U-rack-mount-server-chassis
5. **4U (4 units)** - https://www.yakkaroo.de/4U-rack-mount-server-chassis

## Scraping Method

### Tools Used

- Node.js script (`scrape-yakkaroo.js`) for downloading HTML pages (initial scrape)
- Node.js script (`parse-yakkaroo-html.js`) for extracting specifications from HTML
- Cheerio library for HTML parsing

### Process

1. **Category Discovery**: Navigated to the main rack-mount server chassis page to identify all size categories
2. **Product Link Extraction**: For each category, extracted all product URLs from the listing page
3. **HTML Download**: Downloaded complete HTML for each product page (includes all tabs/content)
4. **Specification Extraction**: Used Cheerio to parse HTML and extract:
   - Product title from h1.product-title
   - Price from .price element
   - Availability status from page text
   - SKU from product info
   - Detailed specifications from the specifications table
   - Product description
5. **Markdown Generation**: Created structured markdown files following the project's template format with:
   - Overview section
   - Pricing table
   - Complete specifications table
   - Availability information

### Files Created

For each product, two files were created:
- `.html` - Complete HTML source
- `.md` - Structured markdown with extracted information

## Product Naming Convention

Files are named based on the URL slug, for example:
- URL: `https://www.yakkaroo.de/19-inch-4u-server-chassis-ipc-c430b-gpu-30cm-short`
- Files: `19-inch-4u-server-chassis-ipc-c430b-gpu-30cm-short.html` and `.md`

## Key Product Information Extracted

- **Product Name**: Full descriptive name (e.g., "19-inch ATX rack-mount 4U server case - IPC-C430B-GPU - 30cm depth")
- **URL**: Direct link to product page
- **Price**: Listed in Euros (€)
- **Availability**: 
  - Available immediately
  - Out of stock
  - Low stock
- **Specifications**: When available in product description

## Notable Features

- Products are primarily from manufacturers like IPC, Chenbro, Supermicro, and Silverstone
- Depth measurements are prominently featured (e.g., 25cm, 30cm, 38cm, 40cm, 45cm, 65cm)
- Form factors include: mini ITX, micro ATX, ATX, and E-ATX
- Special purpose cases include mining chassis and storage cases

## Re-scraping Instructions

To update the data:

1. Ensure you have Node.js and required packages:
   ```bash
   npm install cheerio
   ```

2. Run the initial HTML scraper (if needed):
   ```bash
   node scrape-yakkaroo.js
   ```

3. Parse the HTML files to extract specifications and generate markdown:
   ```bash
   node parse-yakkaroo-html.js
   ```

4. Clean up non-product pages if needed:
   ```bash
   cd resources/yakkaroo.de
   rm -f 19-inch-racks.* 19-inch-racks-accessories.* FAQ-*
   ```

## Technical Details

### Specification Extraction

The specifications are extracted from the HTML specifications table that appears when clicking the "Specifications" tab on each product page. The table contains rows with two columns:
- First column: Specification name (e.g., "Model", "Form factor", "Drive bays")
- Second column: Specification value

Common specifications found:
- **Model**: Product model number
- **Length**: Depth category (very short, short, medium, long)
- **Form factor**: Supported motherboard sizes
- **Drive bays**: External and internal drive configurations
- **Connectors**: Front panel I/O ports
- **Cooling**: Fan specifications and CPU cooler clearance
- **Power supply**: PSU compatibility
- **Dimensions**: Physical measurements (W x H x D)
- **Colour**: Case color
- **Box contents**: What's included
- **More info**: Additional features and notes

## Notes

- The website is in English (EN version used)
- Prices include German VAT
- Small delay (500ms) added between requests to be respectful to the server
- Some products were out of stock at time of scraping
