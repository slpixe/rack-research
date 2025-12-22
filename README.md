# Rack Research

A research project for documenting server rack mount chassis, their specifications, and availability across multiple vendors.

## Project Structure

```
rack-research/
├── README.md
├── package.json
├── .gitignore
├── docs/                         # Documentation
│   ├── initial-question.md      # Original research question
│   ├── scraping-approach-comparison.md
│   ├── project-reorganization.md
│   └── yakkaroo-completion-report.md
├── scrapers/                     # Custom scraping implementations
│   ├── common/                   # Shared utilities
│   │   └── utils.js
│   ├── yakkaroo/                 # Yakkaroo.de scraper
│   │   ├── 1-download-html.js
│   │   ├── 2-parse-specs.js
│   │   └── README.md
│   └── README.md                 # Scraper documentation
├── resources/                    # Scraped data organized by domain
│   ├── yakkaroo.de/             # 52 products with full specs
│   ├── inter-tech.de/           # ~80 products
│   ├── ipc.in-win.com/          # ~20 products
│   ├── silverstonetek.com/
│   └── {domain}/
│       ├── {product}.html       # Raw HTML (optional)
│       └── {product}.md         # Extracted specifications
└── templates/
    └── case-template.md         # Markdown template for products
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

### Build Database

```bash
# Generate unified JSON database from markdown files
npm run build:db
```

### Run Scrapers

```bash
# Yakkaroo.de (52 products)
npm run scrape:yakkaroo

# Or run stages separately
npm run scrape:yakkaroo:download  # Download HTML
npm run scrape:yakkaroo:parse     # Parse and generate markdown
```

## Scrapers

### Available Scrapers

| Vendor | Products | Method | Status |
|--------|----------|--------|--------|
| yakkaroo.de | 52 | Scripted (Cheerio) | ✅ Complete |
| inter-tech.de | ~80 | AI + Playwright | ✅ Complete |
| ipc.in-win.com | ~20 | AI + Playwright | ✅ Complete |
| silverstonetek.com | ~15 | Manual | 🔄 In Progress |
| sliger.com | ~10 | Manual | 📋 Planned |
| unykach.com | ~30 | Scripted | 📋 Planned |

### Scraping Approaches

See [docs/scraping-approach-comparison.md](docs/scraping-approach-comparison.md) for detailed comparison.

**Scripted Parsing (Cheerio):**
- ⚡ Fast (< 1 minute for 50 products)
- 💰 Free (no API costs)
- 🔄 Repeatable and automated
- 📦 Best for: Large catalogs with consistent structure

**AI + Playwright:**
- 🤖 Flexible (handles any structure)
- 🧠 Context-aware extraction
- 💵 Costs tokens (~$5-10 per 50 products)
- 📦 Best for: Complex sites or small catalogs

For details on creating new scrapers, see [scrapers/README.md](scrapers/README.md).

## Resources Folder

The `resources/` folder contains scraped data organized by vendor domain.

### Example: yakkaroo.de

```
resources/yakkaroo.de/
├── 19-inch-4u-server-chassis-ipc-c430b-gpu-30cm-short.html
├── 19-inch-4u-server-chassis-ipc-c430b-gpu-30cm-short.md
├── 19-inch-2u-server-chassis-ipc-c238-38cm-short.html
├── 19-inch-2u-server-chassis-ipc-c238-38cm-short.md
└── ... (52 products total)
```

Each markdown file contains:
- Product title and URL
- Pricing information
- **11+ detailed specifications**
- Availability status
- SKU number

## Data Fields

Each product is documented with the following specifications (when available):

| Field | Description | Example |
|-------|-------------|---------|
| **Price** | Cost with currency | £150 GBP, $200 USD |
| **Shipping** | Shipping costs/options | £15 UK, Free EU |
| **Dimensions** | Width × Height × Depth | 450mm × 177mm × 500mm |
| **Rack Units** | Height in U | 4U |
| **Form Factors** | Supported motherboards | ATX, Micro-ATX, Mini-ITX |
| **CPU Cooler** | Max cooler height | 155mm |
| **PSU Support** | Power supply type | ATX, SFX, Redundant |
| **GPU Clearance** | Max length/height | 350mm length, 150mm height |
| **Fans** | Included/supported fans | 2× 120mm front, 1× 80mm rear |
| **Dust Filters** | Filter availability | Yes - front intake |
| **Storage** | Drive bays | 8× 3.5", 2× 2.5" |
| **Front I/O** | Front panel ports | 2× USB 3.0, 1× USB-C |
| **Rack Rails** | Included rails | Yes / Optional / No |
| **Warranty** | Warranty period | 2 years |

## Statistics

| Vendor | Products | Rack Units | Status |
|--------|----------|------------|--------|
| yakkaroo.de | 52 | 1U, 1U+, 2U, 3U, 4U | ✅ Complete with specs |
| inter-tech.de | ~80 | 1U, 2U, 3U, 4U | ✅ Complete |
| ipc.in-win.com | ~20 | 1U, 2U, 4U, 6.5U | ✅ Complete |
| silverstonetek.com | ~15 | Various | 🔄 In Progress |

**Total Products Documented: ~167**

## Testing

The project uses [Vitest](https://vitest.dev/) for testing. Tests are co-located with source code for easy maintenance:

```
src/
├── parsers/
│   ├── dimensions.ts
│   ├── dimensions.test.ts          # Tests next to implementation
│   ├── motherboard.ts
│   └── motherboard.test.ts
resources/
├── inter-tech.de/
│   ├── 4u-4408.md
│   └── 4u-4408.test.ts             # Tests next to fixtures
└── yakkaroo.de/
    ├── 19-inch-2U-server-chassis-IPC-2U-20248-48cm.md
    └── 19-inch-2U-server-chassis-IPC-2U-20248-48cm.test.ts
```

### Running Tests

```bash
npm test              # Watch mode for development
npm run test:run      # Run once (CI mode)
npm run test:ui       # Interactive UI
```

### Test Coverage

- **Parser Tests**: Unit tests for value parsers (dimensions, motherboard support, etc.)
- **Fixture Tests**: Integration tests that verify parsing of real fixture files

All tests run in under 1 second, ensuring fast feedback during development.

## Development

### Adding a New Vendor

1. **Choose scraping approach** (see comparison doc)
2. **Create scraper directory**:
   ```bash
   mkdir scrapers/{vendor-name}
   ```
3. **Implement scraper** following [scrapers/README.md](scrapers/README.md)
4. **Add npm script** to package.json
5. **Document** in vendor's README.md

### File Organization

- **HTML files**: Keep for reference and re-parsing (gitignored by default)
- **Markdown files**: Committed to git
- **Scrapers**: Reusable, documented scripts
- **Common utilities**: Shared code in `scrapers/common/`

### Dependencies

```json
{
  "cheerio": "^1.1.2",     // HTML parsing
  "playwright": "optional"  // Browser automation (if needed)
}
```

## Tools & Methods

**Automated Scraping:**
- Node.js with Cheerio for HTML parsing
- Playwright MCP for browser automation
- Custom utilities for markdown generation

**AI-Assisted:**
- GPT-4 for complex data extraction
- Context-aware specification mapping
- Intelligent field normalization

## Contributing

When adding new product data:

1. Follow the template structure
2. Include all available specifications
3. Preserve original HTML for reference
4. Use consistent formatting in markdown
5. Document the scraping process

## License

This is a research project. Product information and specifications belong to their respective manufacturers.
