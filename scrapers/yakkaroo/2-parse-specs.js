const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const outputDir = './resources/yakkaroo.de';

function parseSpecificationsFromHTML(html) {
  const $ = cheerio.load(html);
  const specs = {};
  
  // Find the specifications table
  // It's in a tabpanel with specifications content
  const specRows = $('table tr');
  
  specRows.each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length === 2) {
      const key = $(cells[0]).text().trim().replace(':', '');
      const value = $(cells[1]).text().trim();
      if (key && value) {
        specs[key] = value;
      }
    }
  });
  
  return specs;
}

function extractProductData(html, url) {
  const $ = cheerio.load(html);
  
  // Extract title
  const title = $('h1.product-title, h1[itemprop="name"]').first().text().trim();
  
  // Extract price
  let price = null;
  const priceElem = $('.price').first();
  if (priceElem.length) {
    price = priceElem.text().trim();
  }
  
  // Extract availability
  let availability = 'Unknown';
  if (html.includes('Available immediately')) {
    availability = 'Available immediately';
  } else if (html.includes('Currently out of stock')) {
    availability = 'Currently out of stock';
  } else if (html.includes('Low stock level')) {
    availability = 'Low stock';
  }
  
  // Extract SKU
  let sku = null;
  $('strong').each((i, elem) => {
    if ($(elem).text().includes('SKU:')) {
      const parent = $(elem).parent();
      sku = parent.text().replace('SKU:', '').trim();
    }
  });
  
  // Extract description (the short product info text)
  let description = null;
  const descElem = $('.product-info-text, .artikelbeschreibung_kurz').first();
  if (descElem.length) {
    description = descElem.text().trim();
  }
  
  // Extract specifications
  const specifications = parseSpecificationsFromHTML(html);
  
  return {
    url,
    title,
    price,
    availability,
    sku,
    description,
    specifications
  };
}

function generateMarkdown(data) {
  const today = '2025-12-22';
  
  let md = `# ${data.title}\n\n`;
  md += `> Source: [${data.url}](${data.url})  \n`;
  md += `> Scraped: ${today}\n\n`;
  
  if (data.description) {
    md += `## Overview\n\n${data.description}\n\n`;
  }
  
  md += `## Pricing\n\n`;
  md += `| Item | Price | Currency |\n`;
  md += `|------|-------|----------|\n`;
  md += `| Case | ${data.price || 'Contact for quote'} | EUR |\n`;
  md += `| Shipping | See website | EUR |\n\n`;
  
  if (Object.keys(data.specifications).length > 0) {
    md += `## Specifications\n\n`;
    md += `| Attribute | Details |\n`;
    md += `|-----------|---------|\n`;
    
    // Format specifications nicely
    for (const [key, value] of Object.entries(data.specifications)) {
      // Replace newlines in value with <br> for better formatting
      const formattedValue = value.replace(/\n/g, '<br>');
      md += `| **${key}** | ${formattedValue} |\n`;
    }
    md += `\n`;
  }
  
  md += `## Availability\n\n`;
  md += `**Status:** ${data.availability}\n\n`;
  
  if (data.sku) {
    md += `**SKU:** ${data.sku}\n\n`;
  }
  
  return md;
}

function processAllHTMLFiles() {
  console.log('Processing HTML files to extract specifications...\n');
  
  const files = fs.readdirSync(outputDir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const htmlFile of htmlFiles) {
    const basename = htmlFile.replace('.html', '');
    const htmlPath = path.join(outputDir, htmlFile);
    const url = `https://www.yakkaroo.de/${basename}`;
    
    try {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const data = extractProductData(html, url);
      
      if (Object.keys(data.specifications).length === 0) {
        console.log(`  ⚠ ${basename}: No specifications found`);
        errorCount++;
        continue;
      }
      
      const markdown = generateMarkdown(data);
      
      const mdPath = path.join(outputDir, `${basename}.md`);
      fs.writeFileSync(mdPath, markdown);
      
      console.log(`  ✓ ${basename}: ${Object.keys(data.specifications).length} specs extracted`);
      successCount++;
      
    } catch (error) {
      console.error(`  ✗ ${basename}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n=== Processing Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Check if cheerio is available
try {
  require.resolve('cheerio');
  processAllHTMLFiles();
} catch (e) {
  console.error('cheerio module not found. Installing...');
  console.log('Please run: npm install cheerio');
  console.log('Then run this script again.');
}
