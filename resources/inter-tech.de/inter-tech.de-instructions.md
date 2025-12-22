# Inter-Tech Scraping Instructions

## Domain: inter-tech.de

### Product Listing Page
- URLs:
  - 1U: `https://www.inter-tech.de/1u_en.html`
  - 2U: `https://www.inter-tech.de/2U_en.html`
  - 3U: `https://www.inter-tech.de/3U_en.html`
  - 4U: `https://www.inter-tech.de/4U_en.html`
  - Storage: `https://www.inter-tech.de/Storage_Case.html`
- Product Links: Extract links from the main content area that point to `productdetails-149/`.

### Individual Product Page
- **Title**: Found in `h1`.
- **Description**: Found in `.product-details-text` or similar container.
- **Specs Table**: Found in the `table` element.
  - Each row has a label and a value.
  - Some rows are headers (e.g., "MOTHERBOARD", "INSTALLATION DIMENSIONS").
- **Pricing**: Usually not available on the site.

### Extraction Logic (Playwright)
```javascript
const data = await page.evaluate(() => {
  const title = document.querySelector('h1')?.innerText.trim();
  const description = Array.from(document.querySelectorAll('.product-details-text p')).map(p => p.innerText.trim()).join('\n');
  
  const specRows = Array.from(document.querySelectorAll('table tr'));
  const specs = {};
  let currentCategory = '';
  
  specRows.forEach(row => {
    const header = row.querySelector('th');
    if (header) {
      currentCategory = header.innerText.trim();
    } else {
      const cells = row.querySelectorAll('td');
      if (cells.length === 2) {
        const label = cells[0].innerText.trim();
        const value = cells[1].innerText.trim();
        specs[label] = value;
      }
    }
  });
  
  return { title, description, specs };
});
```
