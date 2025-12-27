# Scrapers Directory

This directory contains all custom scraping implementations for different vendor websites.

## Structure

```
scrapers/
├── common/              # Shared utilities and helpers
│   └── utils.js         # Common functions for all scrapers
├── yakkaroo/            # Yakkaroo.de scraper
│   ├── 1-download-html.js
│   ├── 2-parse-specs.js
│   └── README.md
├── inter-tech/          # Inter-Tech.de scraper (future)
└── [vendor-name]/       # Other vendor scrapers
```

## Scraping Approaches

### Scripted Parsing (Recommended for large catalogs)
- **Used by**: yakkaroo.de
- **Process**: Download HTML → Parse with Cheerio → Generate markdown
- **Best for**: Consistent sites with 20+ products
- **Speed**: Very fast (< 1 minute for 50 products)
- **Cost**: $0

### Playwright + AI (Recommended for small/complex sites)
- **Used by**: inter-tech.de, ipc.in-win.com (initial scrapes)
- **Process**: Navigate with browser → AI extracts data → Generate markdown
- **Best for**: Complex sites, small catalogs (< 20 products)
- **Speed**: Slower (~2 hours for 50 products)
- **Cost**: $5-10 in tokens

See [scraping-approach-comparison.md](../../docs/scraping-approach-comparison.md) for detailed comparison.

## Common Utilities

All scrapers can use shared utilities from `common/utils.js`:

```javascript
const {
  generateStandardMarkdown,
  sleep,
  cleanText,
  urlToFilename,
  parsePrice,
  extractSpecsFromTable,
  handleScraperError,
  log
} = require('../common/utils');

// Example usage
const markdown = generateStandardMarkdown({
  title: 'Product Name',
  url: 'https://example.com/product',
  price: '€ 199,90',
  specifications: {
    'Form Factor': 'ATX',
    'Drive Bays': '4x 3.5"'
  },
  availability: 'In Stock'
});
```

## Creating a New Scraper

### 1. Choose Approach

**Decision Matrix:**
| Condition | Use Scripted | Use AI |
|-----------|--------------|--------|
| 50+ products | ✓ | |
| Consistent HTML | ✓ | |
| Need updates | ✓ | |
| Complex JS | | ✓ |
| < 20 products | | ✓ |
| One-time scrape | | ✓ |

### 2. Create Directory Structure

```bash
mkdir scrapers/[vendor-name]
cd scrapers/[vendor-name]
touch README.md
```

### 3. For Scripted Approach

Create two scripts:

**1-download-html.js** - Download pages
```javascript
const https = require('https');
const fs = require('fs');
const { sleep, urlToFilename } = require('../common/utils');

const productUrls = [
  'https://vendor.com/product1',
  'https://vendor.com/product2'
];

// Download HTML for each product
```

**2-parse-specs.js** - Parse and generate markdown
```javascript
const fs = require('fs');
const cheerio = require('cheerio');
const { generateStandardMarkdown, extractSpecsFromTable } = require('../common/utils');

// Parse HTML files and generate markdown
```

### 4. For AI Approach

Create instruction file:

**[vendor-name]-instructions.md**
```markdown
# Vendor Name Scraping Instructions

## Selectors
- Title: `h1.product-title`
- Price: `.price`
- Specs: `table.specifications`

## Process
1. Navigate to product page
2. Extract title, price, specs
3. Generate markdown using template
```

Then use Playwright MCP browser to manually navigate and extract.

## Best Practices

### 1. Be Respectful
- Add delays between requests (500ms-1000ms)
- Don't overwhelm servers
- Cache HTML locally

### 2. Error Handling
```javascript
const { handleScraperError } = require('../common/utils');

try {
  // scraping code
} catch (error) {
  handleScraperError(error, 'product extraction');
}
```

### 3. Logging
```javascript
const { log } = require('../common/utils');

log('Starting scrape...', 'info');
log('Product extracted', 'success');
log('Price not found', 'warning');
log('Failed to parse', 'error');
```

### 4. Testing
- Test on 2-3 products first
- Verify markdown output
- Check for missing data
- Run full scrape

### 5. Documentation
Include in README.md:
- How to run the scraper
- Dependencies
- Expected output
- Customization options
- Maintenance notes

## Dependencies

Install required packages:

```bash
npm install cheerio        # HTML parsing
npm install playwright     # Browser automation (if needed)
npm install axios         # HTTP requests (alternative to https)
```

## Output Structure

All scrapers should output to:
```
resources/[vendor-domain]/
├── product1.html          # Original HTML (optional)
├── product1.md            # Markdown with specs
├── product2.html
├── product2.md
└── ...
```

## Maintenance

When a site's HTML structure changes:

1. **Identify changes**: Compare old/new HTML
2. **Update selectors**: Modify parsing logic
3. **Test**: Run on sample products
4. **Document**: Update README with changes
5. **Re-run**: Generate new markdown files

## Examples

### Yakkaroo.de (Scripted)
- 52 products scraped
- 11+ specifications per product
- < 1 minute total time
- 100% automated

### Inter-Tech.de (AI)
- ~80 products
- Complex specification tables
- Manual verification needed
- High accuracy

## Support

For questions or issues:
1. Check vendor-specific README
2. Review [scraping-approach-comparison.md](../../docs/scraping-approach-comparison.md)
3. Inspect HTML structure manually
4. Test with curl or browser DevTools
