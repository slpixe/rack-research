# Scraping Approach Comparison

## Two Approaches Used

### 1. Playwright/MCP Browser + AI (inter-tech.de, ipc.in-win.com)
**Process:**
- Navigate to each product page using Playwright MCP browser
- AI reads the page snapshot and extracts information contextually
- AI generates markdown following the template
- Human verifies and corrects

**Pros:**
- ✅ Most flexible - handles any HTML structure
- ✅ AI understands context and semantics
- ✅ No code maintenance per site
- ✅ Can handle poorly structured HTML
- ✅ Better at understanding product descriptions
- ✅ Can make intelligent decisions about data mapping

**Cons:**
- ❌ Slower (one page at a time with AI processing)
- ❌ More expensive (high token usage)
- ❌ Less repeatable/automated
- ❌ Requires human oversight
- ❌ Harder to scale to hundreds of products
- ❌ Cannot easily re-run for updates

### 2. Scripted HTML Parsing with Cheerio (yakkaroo.de)
**Process:**
- Download all HTML pages with curl/Node.js
- Parse HTML with Cheerio (jQuery-like selectors)
- Extract data programmatically
- Generate markdown from extracted data
- Run script on all products

**Pros:**
- ✅ Fast - can process 50+ products in seconds
- ✅ Repeatable - same results every time
- ✅ Cheap - no AI token costs
- ✅ Easy to re-run for updates
- ✅ Scalable to hundreds/thousands of products
- ✅ Automated pipeline

**Cons:**
- ❌ Brittle - breaks if site HTML changes
- ❌ Requires understanding HTML structure
- ❌ Need custom code per site
- ❌ Harder to handle inconsistent data
- ❌ Requires Node.js dependencies

## Recommendation: Hybrid Approach

**Best strategy: Use both methods strategically**

### When to use Playwright + AI:
- **Initial exploration** of a new site
- Sites with **complex/dynamic** JavaScript rendering
- **Small catalogs** (< 20 products)
- Sites with **inconsistent structure**
- **One-time** scrapes
- When you need **contextual understanding**

### When to use Scripted Parsing:
- **Large catalogs** (50+ products)
- Sites with **consistent HTML structure**
- **Regular updates** needed
- **Well-structured** product pages
- When **speed matters**
- For **production pipelines**

### Ideal Workflow:
1. **Reconnaissance**: Use Playwright + AI to scrape 2-3 sample products
2. **Analysis**: Study the HTML structure and identify patterns
3. **Decision**: 
   - If consistent → Write Cheerio script
   - If inconsistent → Continue with AI
4. **Validation**: Compare scripted results with AI results
5. **Production**: Use the most appropriate method

## For This Project

**Recommended approach for each site:**

| Site | Products | Complexity | Recommended Method | Reason |
|------|----------|------------|-------------------|---------|
| inter-tech.de | ~80 | Medium | **Scripted** | Consistent structure, many products |
| ipc.in-win.com | ~20 | Medium | **Hybrid** | Moderate size, already done with AI |
| yakkaroo.de | 52 | Low | **Scripted** ✅ | Consistent structure (already done) |
| silverstonetek.com | ~15 | High | **AI** | Complex JS, small catalog |
| sliger.com | ~10 | High | **AI** | Custom layouts |
| unykach.com | ~30 | Medium | **Scripted** | Consistent structure |

## Implementation Strategy

### Folder Structure
```
rack-research/
├── scrapers/           # Custom scraper scripts
│   ├── yakkaroo/
│   │   ├── 1-download.js
│   │   ├── 2-parse.js
│   │   └── README.md
│   ├── inter-tech/
│   │   └── scraper.js
│   └── common/
│       ├── markdown-generator.js
│       └── utils.js
├── resources/          # Output data
│   ├── yakkaroo.de/
│   ├── inter-tech.de/
│   └── ...
├── templates/          # Markdown templates
├── .gitignore
└── package.json
```

### Dependencies
- **cheerio**: HTML parsing
- **playwright**: Browser automation (if needed)
- **axios** or **node-fetch**: HTTP requests

## Cost Comparison (Example: 50 products)

| Method | Time | Cost | Repeatability |
|--------|------|------|---------------|
| AI + Playwright | ~2 hours | $5-10 in tokens | Low |
| Scripted Parsing | ~5 minutes | $0 | High |

## Conclusion

**Use scripted parsing (Cheerio) as the default approach** when:
- Site has consistent structure ✅
- More than 20 products ✅
- Need to update regularly ✅

This gives you the best balance of speed, cost, and maintainability.
