# Yakkaroo.de Scraper

Automated scraper for yakkaroo.de rack mount server chassis products.

## Overview

This scraper uses a two-stage process:
1. **Download**: Fetch HTML pages for all products
2. **Parse**: Extract specifications and generate markdown

## Requirements

```bash
npm install cheerio
```

## Usage

### Full Scrape

```bash
# Stage 1: Download all HTML pages
node scrapers/yakkaroo/1-download-html.js

# Stage 2: Parse HTML and generate markdown
node scrapers/yakkaroo/2-parse-specs.js
```

### Output

- **HTML files**: `resources/yakkaroo.de/*.html`
- **Markdown files**: `resources/yakkaroo.de/*.md`

## Categories Scraped

- 1U (12 products)
- 1U+ (2 products)
- 2U (16 products)
- 3U (11 products)
- 4U (11 products)

**Total: 52 products**

## Data Extracted

Each markdown file contains:
- Product title
- Price (EUR)
- Availability status
- SKU
- **11+ specifications** including:
  - Model number
  - Form factor support
  - Drive bay configuration
  - Cooling specifications
  - PSU compatibility
  - Dimensions
  - And more

## Specifications Structure

The scraper extracts from the hidden "Specifications" tab on each product page:

```html
<table>
  <tr>
    <td>Model:</td>
    <td>IPC-C430B</td>
  </tr>
  <!-- ... more rows -->
</table>
```

## Customization

### Adding More Categories

Edit `1-download-html.js` and add URLs to the `categories` array:

```javascript
const categories = [
  { name: '1U', url: 'https://www.yakkaroo.de/1U-rack-mount-server-chassis' },
  { name: '5U', url: 'https://www.yakkaroo.de/5U-rack-mount-server-chassis' }, // Add new
];
```

### Extracting Additional Fields

Edit `2-parse-specs.js` and modify the `extractProductData` function:

```javascript
// Add new field extraction
const warranty = html.match(/warranty:?\s*(\d+\s+years?)/i);
if (warranty) {
  data.warranty = warranty[1];
}
```

### Changing Output Format

Modify the `generateMarkdown` function in `2-parse-specs.js`:

```javascript
function generateMarkdown(data) {
  // Customize markdown structure here
}
```

## Maintenance

When the site structure changes:

1. Download a sample HTML page
2. Inspect the HTML structure
3. Update selectors in `2-parse-specs.js`:
   ```javascript
   const title = $('h1.new-class-name').text();
   ```
4. Test on a few products
5. Run full scrape

## Performance

- Download: ~30 seconds for 52 products
- Parse: ~2 seconds for 52 products
- **Total: < 1 minute**

## Notes

- Includes 500ms delay between requests to be respectful to server
- HTML files preserved for debugging and re-parsing
- Can re-run parser without re-downloading HTML
