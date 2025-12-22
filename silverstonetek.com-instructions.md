# Silverstone Scraping Instructions

## Domain: silverstonetek.com

### Product Listing Page
- URL: `https://www.silverstonetek.com/en/product/computer-chassis/`
- Filter: Click "Server / NAS (36)" to narrow down to server cases.
- Loading: The page uses infinite scroll. Scroll to the bottom multiple times until all products are loaded.
- Product Links: Extract links matching `/en/product/info/computer-chassis/`.

### Individual Product Page
- **Title**: Found in `.prointro-info .title .main-txt`.
- **Subtitle**: Found in `.prointro-info .title .sub-txt`.
- **Specs Tab**: Must click the element containing "Product Specifications" to reveal the specs table.
  - Selector: `page.locator('div').filter({ hasText: /^Product Specifications$/ })`
- **Specs Data**:
  - The specs are in `.spec-on-list .item`.
  - Each spec item has a `.title` (label) and `.cont` (value).
  - Example structure:
    ```html
    <div class="item">
      <div class="title">Model No.</div>
      <div class="cont">SST-RM32</div>
    </div>
    ```
- **Pricing**: Usually not available on the site.

### Extraction Logic (Playwright)
```javascript
// Click specs tab
await page.locator('div').filter({ hasText: /^Product Specifications$/ }).click();

// Extract specs
const data = await page.evaluate(() => {
  const title = document.querySelector('.prointro-info .title .main-txt')?.innerText.trim();
  const subtitle = document.querySelector('.prointro-info .title .sub-txt')?.innerText.trim();
  const specItems = Array.from(document.querySelectorAll('.spec-on-list .item'));
  const specs = specItems.map(item => {
    const label = item.querySelector('.title')?.innerText.trim();
    const value = item.querySelector('.cont')?.innerText.trim();
    return { label, value };
  }).filter(s => s.label && s.value);
  
  return { title, subtitle, specs };
});
```

### Notes
- Some products might have different layouts if they are older, but most "Server / NAS" cases follow this modern layout.
- The "Product Description" and "Product Specifications" are often in a sticky or tabbed interface.
