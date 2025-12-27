# URL Verification Results

**Last Updated:** 2025-01-26  
**Overall Success Rate:** 94.3% (200/212 URLs)

## Summary by Source

| Source | Working | Total | Success Rate | Status |
|--------|---------|-------|--------------|--------|
| yakkaroo.de | 52 | 52 | 100.0% | ✅ All working |
| ipc.in-win.com | 8 | 8 | 100.0% | ✅ All working |
| sliger.com | 42 | 42 | 100.0% | ✅ All working |
| unykach.com | 1 | 1 | 100.0% | ✅ All working |
| silverstonetek.com | 36 | 36 | 100.0% | ✅ Fixed |
| inter-tech.de | 61 | 73 | 83.6% | ⚠️ 12 products not found |

## Detailed Findings

### silverstonetek.com - Fixed ✅

**Issue:** Wrong base URL
**Solution:** Changed to `https://www.silverstonetek.com/en/product/info/server-nas/{model}/`
**Result:** 100% success rate (36/36)

### inter-tech.de - Mostly Fixed ⚠️

**Issue:** Complex URL patterns with different formats
**Solution:** 
- Use rack-unit-based productdetails IDs (152/151/150/149 for 1U/2U/3U/4U)
- K-series products: `1U_K-125L`, `IPC_K-240L` (with underscores)
- Multi-segment models: `2U_2098-SK`, `4U_4452-TFT` (underscore after rack unit)
- Standard models: `1U-1404`, `2U-2406` (hyphen format)

**Result:** 83.6% success rate (61/73)

**Remaining 404s (12 products):**
- `1.5U_1528-1` - Special naming pattern
- `4F28-MINING-RACK` - Mining rack (likely discontinued)
- `4U-4129L` - May need underscore (needs investigation)
- `4U_4460-TFT` - Special case without _EN suffix (still 404)
- `4U-4708` - May be discontinued
- `4W2-MINING-RACK` - Mining rack (likely discontinued)
- `4W40-MINING-RACK` - Mining rack (likely discontinued)
- `5U-5512` - Large server (may be discontinued)
- `6U-6520` - Large server (may be discontinued)
- `6U-6606` - Large server (may be discontinued)
- `S21` - Older S-series model (likely discontinued)
- `S25` - Older S-series model (likely discontinued)

## URL Pattern Documentation

### inter-tech.de Patterns

Base format: `https://www.inter-tech.de/productdetails-{ID}/{MODEL}_EN.html`

**ProductDetails IDs by Rack Unit:**
- 1U products: `productdetails-152`
- 2U products: `productdetails-151`
- 3U products: `productdetails-150`
- 4U products: `productdetails-149`
- 5U products: `productdetails-148` (tentative)
- 6U products: `productdetails-147` (tentative)

**Model Name Formats:**
1. **Standard models** (hyphen format):
   - Pattern: `{RU}-{MODEL}` → `{RU}-{MODEL}_EN.html`
   - Examples: `1U-1404`, `2U-2406`, `3U-3416`, `4U-4408`

2. **K-series 1U** (underscore after U):
   - Pattern: `1u-k-{model}` → `1U_K-{MODEL}_EN.html`
   - Examples: `1U_K-125L`, `1U_K-126L`

3. **K-series 2U** (IPC prefix):
   - Pattern: `2u-k-{model}` → `IPC_K-{MODEL}_EN.html`
   - Example: `IPC_K-240L`

4. **K-series 3U/4U** (standard hyphen format):
   - Pattern: `{RU}-k-{model}` → `{RU}-K-{MODEL}_EN.html`
   - Examples: `3U-K-340L`, `4U-K-439L`

5. **Multi-segment models** (underscore after rack unit):
   - Pattern: `{RU}-{4DIGITS}-{SUFFIX}` → `{RU}_{4DIGITS}-{SUFFIX}_EN.html`
   - Examples: `2U_2098-SK`, `2U_2129-N`, `3U_3098-S`, `4U_4088-S`, `4U_4452-TFT`

6. **Special cases:**
   - Most models: Add `_EN.html` suffix
   - Exception: `4U-4460-TFT` uses `.html` (no _EN)

### silverstonetek.com Pattern

Format: `https://www.silverstonetek.com/en/product/info/server-nas/{model}/`
- Model name is lowercase with hyphens
- Example: `rm21-304` → `/server-nas/rm21-304/`

## Next Steps

1. Investigate remaining 12 inter-tech.de 404s
2. Check if products are in archive/discontinued section
3. Consider marking discontinued products in data schema
4. Update documentation with final URL patterns
