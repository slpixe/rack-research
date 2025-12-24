# URL Extraction and Mapping

This directory contains scripts for extracting, generating, and verifying source URLs for product listings.

## Scripts

### `extract-urls.ts`

Extracts canonical URLs from HTML files that were previously scraped.

**Usage:**
```bash
npm run extract:urls
```

**How it works:**
1. Scans HTML files in each source directory (`resources/*/`)
2. Extracts URLs from meta tags:
   - `<link rel="canonical" href="...">`
   - `<meta property="og:url" content="...">`
   - `<meta itemprop="url" content="...">`
3. Creates `url-mappings.json` for each source

**Coverage:**
- yakkaroo.de: 52 URLs extracted
- ipc.in-win.com: 7 URLs extracted

### `verify-urls.ts`

Verifies that generated URLs are accessible by making HTTP requests.

**Usage:**
```bash
npm run verify:urls
```

**How it works:**
1. Loads all URL mappings from `resources/*/url-mappings.json`
2. Makes HTTP HEAD/GET requests to each URL
3. Reports success/failure for each URL
4. Generates a verification report with statistics
5. Saves detailed results to `url-verification-report.json`

**Features:**
- Rate limiting (500ms delay between requests)
- Timeout protection (10s per request)
- Fallback to GET if HEAD fails
- Detailed error reporting
- Summary statistics by source

**Example output:**
```
📊 Verification Summary

════════════════════════════════════════════════════════════════════════════════
✅ yakkaroo.de               52/52 (100.0%)
⚠️  sliger.com               40/43 (93.0%)
✅ inter-tech.de             73/73 (100.0%)
════════════════════════════════════════════════════════════════════════════════

📈 Overall: 165/168 URLs accessible (98.2%)
```

**Note:** This script requires internet access to external sites. In sandboxed CI/CD environments without internet access, verification must be run manually in a local development environment.

### `generate-inter-tech-urls.ts`

Generates URLs for inter-tech.de products based on URL pattern.

**URL Pattern:** `https://www.inter-tech.de/products/ipc/server-cases/{model}`

**Usage:**
```bash
npx tsx scripts/generate-inter-tech-urls.ts
```

**Output:** 73 URLs

### `generate-sliger-urls.ts`

Generates URLs for sliger.com products based on URL pattern.

**URL Pattern:** `https://sliger.com/products/{model-lowercase}`

**Usage:**
```bash
npx tsx scripts/generate-sliger-urls.ts
```

**Output:** 43 URLs

### `generate-silverstone-urls.ts`

Generates URLs for silverstonetek.com products based on URL pattern.

**URL Pattern:** `https://silverstonetek.com/en/product/info/{model}/`

**Usage:**
```bash
npx tsx scripts/generate-silverstone-urls.ts
```

**Output:** 37 URLs

## URL Mapping Files

Each source has a `url-mappings.json` file in its respective resource directory:

```
resources/
├── inter-tech.de/
│   └── url-mappings.json      (73 mappings)
├── yakkaroo.de/
│   └── url-mappings.json      (52 mappings)
├── ipc.in-win.com/
│   └── url-mappings.json      (8 mappings)
├── sliger.com/
│   └── url-mappings.json      (43 mappings)
├── silverstonetek.com/
│   └── url-mappings.json      (37 mappings)
└── unykach.com/
    └── url-mappings.json      (1 mapping)
```

### Format

```json
{
  "model-slug": "https://example.com/product/model-slug",
  "another-model": "https://example.com/product/another-model"
}
```

The key matches the markdown filename (without `.md` extension).

## How URL Mappings Work in build-db.ts

1. **Loading:** URL mappings are loaded at startup from all sources
2. **Application:** When a product's `source_url` is empty from markdown parsing:
   - The filename (without `.md`) is used as the lookup key
   - If found in the mapping, the URL is populated
3. **Priority:** Markdown-embedded URLs take precedence over mappings

## URL Coverage Statistics

Run `npm run build:db` to see coverage:

```
🔗 URL Coverage:
   219 / 219 products have source URLs (100.0%)

   Coverage by source:
   inter-tech.de: 73/73 (100.0%)
   yakkaroo.de: 51/51 (100.0%)
   sliger.com: 42/42 (100.0%)
   ipc.in-win.com: 23/23 (100.0%)
   silverstonetek.com: 20/20 (100.0%)
   unykach.com: 10/10 (100.0%)
```

## Adding URLs for New Sources

When adding a new source:

1. **If HTML files exist with meta tags:**
   - Run `npm run extract:urls`
   - URLs will be auto-extracted

2. **If URLs follow a pattern:**
   - Create a generator script (see existing examples)
   - Generate `url-mappings.json`

3. **Manual mapping:**
   - Create `resources/{source}/url-mappings.json`
   - Add entries manually

## Updating URLs

To refresh URLs after re-scraping:

```bash
# Re-extract from HTML files
npm run extract:urls

# Or regenerate for specific sources
npx tsx scripts/generate-inter-tech-urls.ts
npx tsx scripts/generate-sliger-urls.ts
npx tsx scripts/generate-silverstone-urls.ts

# Rebuild database
npm run build:db
```

## Verifying URL Correctness

After generating or updating URL mappings, verify they are accessible:

```bash
npm run verify:urls
```

This will check all URLs and generate a report showing which are accessible and which need investigation.

**Important Notes:**
- URL verification requires internet access to external websites
- In CI/CD or sandboxed environments without internet, run verification locally
- The script includes rate limiting to be respectful to servers
- Failed URLs may indicate:
  - Incorrect URL pattern or format
  - Product discontinued or moved
  - Website temporary downtime
  - Firewall/access restrictions

### Manual URL Verification

If automated verification is not available, you can manually verify URLs:

1. Check a sample of generated URLs in a browser
2. Look for patterns in failures (e.g., all from one source)
3. Compare generated URLs with URLs in HTML files or markdown sources
4. Verify URL patterns against vendor website structure

### Common URL Pattern Issues

- **Case sensitivity**: Some sites require lowercase (e.g., sliger.com)
- **Special characters**: Underscores vs dashes in model names
- **Path structure**: Extra subdirectories or missing segments
- **Trailing slashes**: Some sites require them, others don't

If you find incorrect URLs, update the generator scripts and regenerate the mappings.
