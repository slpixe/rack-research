# TODO & Project Roadmap

> Last updated: 2025-12-22

## Table of Contents
- [1. Source URLs & Multi-Vendor Support](#1-source-urls--multi-vendor-support)
- [2. Handling Missing/Null Data](#2-handling-missingnull-data)
- [3. Validation & Testing Pipeline](#3-validation--testing-pipeline)
- [4. Refactor build-db.ts](#4-refactor-build-dbts)
- [5. Type-Safe Database Layer](#5-type-safe-database-layer)
- [6. Project Structure](#6-project-structure)
- [7. SQLite Migration Strategy](#7-sqlite-migration-strategy)

---

## 1. Source URLs & Multi-Vendor Support

### Current Issue
- `source_url` is empty (`""`) for most/all products in `products.json`
- We have the scraped HTML/MD files but aren't preserving the original URLs

### Goals
- [ ] Populate `source_url` from scraped data or filename conventions
- [ ] Support multiple purchase sources per product (same case sold on multiple sites)

### Proposed Schema Change
```typescript
// Current
source_url: string;

// Proposed: Support multiple vendors/retailers
purchase_links: {
  source: string;        // 'inter-tech.de' | 'amazon.de' | 'newegg.com' | etc.
  url: string;
  price?: Price;
  availability?: AvailabilityStatus;
  last_checked?: string; // ISO date
}[];

// Keep original source for the scraped spec data
spec_source: {
  domain: DataSource;
  url: string;
  scraped_at: string;
};
```

### Action Items
- [ ] Update scrapers to capture and store product URLs
- [ ] Store URL in markdown frontmatter or filename mapping
- [ ] Consider a `url-mappings.json` file per source domain
- [ ] Add retailer types: `'manufacturer' | 'retailer' | 'reseller'`
- [ ] Future: Scrape prices from multiple retailers for same product

### Notes
- Yakkaroo is a reseller - they link to manufacturer pages sometimes
- Inter-Tech is the manufacturer - their URL is canonical
- Could cross-reference products by model number across sources

---

## 2. Handling Missing/Null Data

### Current State
Many properties have `null` values due to:
1. Source page doesn't list that spec
2. Parser failed to extract the value
3. Different sources have different spec coverage

### Properties Commonly Missing

| Property | Why Missing | UI Strategy |
|----------|-------------|-------------|
| `price` | Some sources don't show prices | Show "Contact for price" or hide |
| `dimensions.*` | Parsing failures or not listed | Show "Not specified" |
| `cpu_cooler.max_height_mm` | Many sources don't list this | Show "Unknown" with tooltip |
| `gpu_support.max_length_mm` | Often unlisted for rack cases | Show "Check manufacturer specs" |
| `source_url` | Not captured by scrapers | Hide "View source" link |
| `weight_kg` | Sometimes missing | Show "—" |

### Recommended UI Approach
```typescript
// Create display helpers
function displayValue(value: number | null, unit: string): string {
  if (value === null) return '—';
  return `${value}${unit}`;
}

function displayPrice(price: Price | null): string {
  if (!price || price.amount === null) return 'Contact for price';
  return `${price.currency} ${price.amount.toFixed(2)}`;
}
```

### Action Items
- [ ] Audit which fields are most commonly null
- [ ] Create a data quality report script
- [ ] Define display strategies per field type
- [ ] Add `_data_completeness` score to each product (0-100%)
- [ ] Consider filters: "Only show products with GPU specs" etc.

### Data Quality Script Idea
```bash
npm run report:data-quality
# Output:
# - 85% of products have dimensions
# - 45% have price
# - 30% have GPU max length
# - etc.
```

---

## 3. Validation & Testing Pipeline

### Goals
- Ensure parsers work correctly now and after website changes
- Catch regressions early
- Have reproducible test fixtures

### Proposed Structure
```
tests/
├── fixtures/                    # Saved HTML snapshots
│   ├── inter-tech.de/
│   │   ├── 4u-4420.html        # Real page snapshot
│   │   └── 4u-4420.expected.json
│   ├── yakkaroo.de/
│   │   ├── supermicro-cse-846.html
│   │   └── supermicro-cse-846.expected.json
│   └── ...
├── parsers/
│   ├── inter-tech.test.ts
│   ├── yakkaroo.test.ts
│   └── dimensions.test.ts      # Unit tests for value parsers
└── integration/
    └── build-db.test.ts
```

### Test Types Needed

#### 1. Unit Tests (Value Parsers)
```typescript
describe('parseDimensions', () => {
  it('parses Inter-Tech format: "44.5 x 482 x 428mm"', () => {
    expect(parseDimensions('44.5 x 482 x 428mm')).toEqual({
      height_mm: 44.5,
      width_mm: 482,
      depth_mm: 428
    });
  });

  it('parses Yakkaroo format: "width: 483mm / depth: 450mm"', () => {
    // ...
  });
});
```

#### 2. Integration Tests (Full Parser)
```typescript
describe('Inter-Tech Parser', () => {
  it('parses 4U-4420 correctly', () => {
    const html = readFixture('inter-tech.de/4u-4420.html');
    const result = parseInterTechProduct(html);
    expect(result).toMatchSnapshot(); // or toEqual(expected)
  });
});
```

#### 3. Smoke Tests (Live Sites - Optional)
```typescript
// Run occasionally to detect website changes
describe('Live Site Smoke Tests', () => {
  it('Inter-Tech product page structure unchanged', async () => {
    const html = await fetch('https://inter-tech.de/...');
    expect(html).toContain('data-product-specs'); // Key selector
  });
});
```

### Action Items
- [ ] Set up Vitest or Jest
- [ ] Create 2-3 fixture files per source
- [ ] Write unit tests for all value parsers
- [ ] Write integration tests for each source parser
- [ ] Add `npm run test` script
- [ ] Consider GitHub Actions for CI

### Testing Framework Choice
**Vitest** recommended because:
- Native TypeScript support
- Fast (uses Vite)
- Compatible with Jest API
- Good for ESM projects

---

## 4. Refactor build-db.ts

### Current State
- `build-db.ts` is 621 lines
- Handles: parsing, transforming, validating, writing
- Hard to test individual functions

### Proposed Split

```
src/
├── build-db.ts                 # Main entry point (orchestration only)
├── parsers/
│   ├── markdown.ts             # parseMarkdownFile()
│   ├── dimensions.ts           # parseDimensions(), parseWeight()
│   ├── motherboard.ts          # parseMotherboardSupport()
│   ├── storage.ts              # parseDriveBays()
│   ├── psu.ts                  # parsePSUTypes(), parsePSUSupport()
│   ├── price.ts                # parsePrice()
│   └── index.ts                # Re-export all
├── transformers/
│   ├── inter-tech.ts           # Inter-Tech specific logic
│   ├── yakkaroo.ts
│   ├── silverstone.ts
│   └── index.ts                # getTransformer(source)
├── schema/
│   ├── types.ts                # Keep as-is
│   ├── mappers.ts              # Key mappings per source
│   └── validators.ts           # Zod schemas for validation
├── db/
│   ├── json-writer.ts          # Write to JSON
│   ├── sqlite-writer.ts        # Write to SQLite (future)
│   └── index.ts
└── utils/
    ├── id-generator.ts         # generateProductId()
    ├── normalizers.ts          # String normalization
    └── logger.ts               # Consistent logging
```

### Action Items
- [ ] Extract value parsers to `src/parsers/`
- [ ] Extract source transformers to `src/transformers/`
- [ ] Create `src/db/` for database writers
- [ ] Keep `build-db.ts` as thin orchestrator
- [ ] Ensure each module is independently testable

---

## 5. Type-Safe Database Layer

### Requirements
- Type safety from database to UI
- No runtime type mismatches
- Good DX with autocomplete
- Works with both JSON and SQLite

### Options Evaluated

| Solution | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **tRPC** | Full type safety, great DX | Requires server, more setup | ✅ Good for API routes |
| **Drizzle ORM** | Type-safe SQL, great migrations | Learning curve | ✅ Best for SQLite |
| **Prisma** | Popular, good DX | Heavy, slower cold starts | ⚠️ Overkill for this |
| **Kysely** | Type-safe query builder | Manual schema sync | ✅ Lightweight option |
| **Raw JSON + Zod** | Simple, no deps | No query optimization | ✅ Good for MVP |

### Recommended Stack

```
┌─────────────────────────────────────────────┐
│                 Next.js App                  │
│  ┌─────────────────────────────────────┐    │
│  │           tRPC Router               │    │
│  │  (type-safe API procedures)         │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
│  ┌──────────────▼──────────────────────┐    │
│  │         Drizzle ORM                 │    │
│  │  (type-safe queries + migrations)   │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
│  ┌──────────────▼──────────────────────┐    │
│  │      SQLite (better-sqlite3)        │    │
│  │    or JSON (for simple queries)     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Simpler Alternative (Start Here)
```typescript
// src/db/client.ts
import { z } from 'zod';
import { RackCaseSchema } from '../schema/validators';
import productsJson from '../../data/products.json';

// Validate at load time
const products = z.array(RackCaseSchema).parse(productsJson.products);

export function getAllProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find(p => p.id === id);
}

export function filterProducts(filters: FilterableFields) {
  return products.filter(p => {
    // Type-safe filtering
  });
}
```

### Action Items
- [ ] Add Zod schemas for runtime validation
- [ ] Create typed query functions
- [ ] Evaluate tRPC for API layer
- [ ] Evaluate Drizzle for SQLite (see section 7)

---

## 6. Project Structure

### Decision: Non-Monorepo (Single Package)

Keeping it simple - one `package.json` at root with everything.

### Proposed Structure
```
rack-research/
├── package.json                 # Single package.json
├── tsconfig.json
├── next.config.js               # Next.js config
├── vitest.config.ts             # Test config
│
├── data/                        # Generated data
│   ├── products.json            # JSON export
│   ├── products.db              # SQLite (future)
│   └── meta.json                # Filter facets, stats
│
├── src/                         # Shared data layer
│   ├── schema/
│   ├── parsers/
│   ├── transformers/
│   ├── db/
│   └── build-db.ts
│
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Homepage
│   ├── products/
│   │   ├── page.tsx             # Product listing
│   │   └── [id]/
│   │       └── page.tsx         # Product detail
│   ├── compare/
│   │   └── page.tsx             # Comparison tool
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts     # tRPC handler
│
├── components/                  # React components
│   ├── ui/                      # Base components (shadcn)
│   ├── ProductCard.tsx
│   ├── FilterSidebar.tsx
│   ├── ComparisonTable.tsx
│   └── SpecsTable.tsx
│
├── lib/                         # App utilities
│   ├── trpc.ts                  # tRPC client
│   └── utils.ts
│
├── scrapers/                    # Keep separate
│   ├── yakkaroo/
│   └── common/
│
├── resources/                   # Raw scraped data
│   └── {domain}/
│
├── tests/                       # Test files
│   ├── fixtures/
│   └── parsers/
│
├── docs/                        # Documentation
└── public/                      # Static assets
```

### Notes
- `src/` contains data layer code (parsers, schema, db)
- `app/` is Next.js pages (App Router)
- `components/` is React components
- Clear separation but no monorepo complexity

---

## 7. SQLite Migration Strategy

### Concerns
- Want it to be as easy to manage as JSON/spreadsheet
- Need good migrations for schema changes
- Type safety between TypeScript and SQLite

### Recommended: Drizzle ORM

**Why Drizzle?**
- Schema defined in TypeScript (single source of truth)
- Generates migrations automatically
- Type-safe queries
- Works great with `better-sqlite3`
- Lightweight (no heavy runtime)
- Can introspect existing DB or push schema

### Example Setup

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  model: text('model').notNull(),
  brand: text('brand').notNull(),
  name: text('name').notNull(),
  source: text('source').notNull(),
  source_url: text('source_url'),
  scraped_at: text('scraped_at'),
  
  // Dimensions (flattened for SQLite)
  width_mm: real('width_mm'),
  height_mm: real('height_mm'),
  depth_mm: real('depth_mm'),
  weight_kg: real('weight_kg'),
  
  rack_units: text('rack_units'),
  
  // JSON columns for complex nested data
  motherboard_support: text('motherboard_support', { mode: 'json' }).$type<string[]>(),
  drive_bays: text('drive_bays', { mode: 'json' }).$type<DriveBay[]>(),
  fan_mounts: text('fan_mounts', { mode: 'json' }).$type<FanMount[]>(),
  psu_support: text('psu_support', { mode: 'json' }).$type<PSUSupport>(),
  front_io: text('front_io', { mode: 'json' }).$type<FrontIO>(),
  features: text('features', { mode: 'json' }).$type<string[]>(),
  
  // Computed/derived fields for filtering
  total_25_bays: integer('total_25_bays'),
  total_35_bays: integer('total_35_bays'),
  has_hot_swap: integer('has_hot_swap', { mode: 'boolean' }),
});
```

### Migration Workflow

```bash
# Generate migration after schema change
npx drizzle-kit generate:sqlite

# Apply migrations
npx drizzle-kit push:sqlite

# Or in code:
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
migrate(db, { migrationsFolder: './drizzle' });
```

### Drizzle Config
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: './data/products.db',
  },
} satisfies Config;
```

### Alternative: Keep JSON + Add Indexes

If SQLite feels like overkill, consider:
1. Keep `products.json` as source of truth
2. Generate `meta.json` with pre-computed indexes:

```json
{
  "by_rack_units": {
    "1U": ["id1", "id2", ...],
    "2U": ["id3", "id4", ...],
  },
  "by_brand": {
    "Inter-Tech": ["id1", "id3", ...],
  },
  "facets": {
    "rack_units": ["1U", "1.5U", "2U", "3U", "4U"],
    "brands": ["Inter-Tech", "SilverStone", ...],
    "motherboards": ["Mini-ITX", "ATX", ...],
  }
}
```

This gives fast filtering without SQLite.

### Action Items
- [ ] Evaluate Drizzle with a proof-of-concept
- [ ] Create `src/db/schema.ts` with Drizzle schema
- [ ] Test migration workflow
- [ ] Benchmark: JSON filtering vs SQLite queries
- [ ] Decision: JSON-only vs SQLite based on benchmarks

### Resources
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle + SQLite Guide](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle Kit (migrations)](https://orm.drizzle.team/kit-docs/overview)

---

## Priority Order

1. **High Priority (Do First)**
   - [ ] Set up Vitest and write basic parser tests
   - [ ] Split `build-db.ts` into modules
   - [ ] Add Zod validation schemas
   - [ ] Fix/populate source URLs

2. **Medium Priority (Before Website)**
   - [ ] Create data quality report
   - [ ] Evaluate Drizzle ORM
   - [ ] Define UI display strategies for null values

3. **Lower Priority (During/After Website)**
   - [ ] Set up tRPC
   - [ ] Implement SQLite if needed
   - [ ] Multi-vendor price tracking

---

## Quick Wins

- [ ] Add `npm run lint` (ESLint)
- [ ] Add `npm run format` (Prettier)  
- [ ] Add `.nvmrc` for Node version
- [ ] Add GitHub Actions for CI (lint + test)
