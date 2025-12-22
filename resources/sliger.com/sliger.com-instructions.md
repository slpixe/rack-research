# Sliger.com Scraping Instructions

This document contains the technical details and selectors required to scrape product information from Sliger.com efficiently.

## Navigation & Discovery

- **Product Listing Page**: `https://sliger.com/products`
- **Loading Behavior**: The site is a Single Page Application (SPA). When navigating to the products page or individual product pages, you must wait for the content to render.
- **Discovery**: Products are categorized by form factor (2U, 3U, 4U, Storage). Use the main products grid to find individual product URLs.

## Individual Product Scraping Process

### 1. Base Pricing
- **Location**: The "configure" tab (default active tab).
- **Selector**: Look for the "Add To Cart" group.
- **Property**: The text content of the element containing the price (e.g., `239.00`).
- **Note**: Pricing is often found in a `div` or `span` near the "Add to Cart" button.

### 2. Technical Specifications
- **Action**: You **must** click the "specs" tab to render the technical data.
- **Selector**: `page.getByText('specs')` or `li` containing "specs".
- **Wait**: Ensure the table with class `product-specs` is visible after clicking.

### 3. Data Extraction (DOM Selectors)
- **Specs Table**: `table.product-specs`
- **Property Name**: `th` (Table Header)
- **Property Value**: `td` (Table Data)
- **Nested Notes**: Many values are inside `div.ml-4.note` or `ul/li` structures within the `td`.

### 4. Weight & Dimensions
- **Location**: Usually a second table under the "Weight & Dimensions" heading on the "specs" tab.
- **Structure**: Same as the Technical Specifications table.

## Output Requirements

### HTML Capture
- Save the full `outerHTML` of the page **after** the "specs" tab has been clicked and content is rendered.
- Path: `resources/sliger.com/[model].html`

### Markdown Format
- Generate a standardized Markdown file with the following tables:
    - Pricing (Base Price)
    - Dimensions (Outer, Internal, Weight)
    - Compatibility (Motherboard, PSU, GPU, PCIe)
    - Cooling (CPU Cooler, Fans)
    - Storage (Internal/External drive counts)
    - I/O (Front panel)
    - Rack Mounting (Rails)
- Path: `resources/sliger.com/[model].md`

## Known Selectors Summary
- **Specs Tab**: `text=specs`
- **Price**: `[ref=e142]` (Note: refs may change, prefer text-based or proximity to "Add to Cart")
- **Specs Table**: `table.product-specs`
- **Product Title**: `h1.product-title`
- **Product Description**: `div.product-description`
