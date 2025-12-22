const https = require('https');
const fs = require('fs');
const path = require('path');

const categories = [
  { name: '1U', url: 'https://www.yakkaroo.de/1U-rack-mount-server-chassis' },
  { name: '1U-plus', url: 'https://www.yakkaroo.de/1U-plus-rack-mount-server-chassis' },
  { name: '2U', url: 'https://www.yakkaroo.de/2U-rack-mount-server-chassis' },
  { name: '3U', url: 'https://www.yakkaroo.de/3U-rack-mount-server-chassis' },
  { name: '4U', url: 'https://www.yakkaroo.de/4U-rack-mount-server-chassis' }
];

const outputDir = './resources/yakkaroo.de';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractProductLinks(html) {
  const links = [];
  const regex = /href="(https:\/\/www\.yakkaroo\.de\/[^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    // Filter for product pages (excluding category and system pages)
    if (url.includes('19-inch') && !url.includes('#') && 
        !url.includes('/19-inch-rack-mount-server-chassis') &&
        !url.includes('U-rack-mount-server-chassis')) {
      if (!links.includes(url)) {
        links.push(url);
      }
    }
  }
  
  return links;
}

function urlToFilename(url) {
  const parts = url.split('/');
  const slug = parts[parts.length - 1];
  return slug || 'index';
}

function htmlToMarkdown(html, url) {
  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' - yakkaroo Serversysteme', '') : 'Product';
  
  // Extract price
  const priceMatch = html.match(/€\s*([\d,]+)\s*\*/);
  const price = priceMatch ? `€${priceMatch[1]}` : 'Price not available';
  
  // Build markdown
  let markdown = `# ${title}\n\n`;
  markdown += `**Source:** [${url}](${url})\n\n`;
  markdown += `**Price:** ${price}\n\n`;
  markdown += `---\n\n`;
  markdown += `*Page scraped on ${new Date().toISOString().split('T')[0]}*\n`;
  
  return markdown;
}

async function scrapeCategory(category) {
  console.log(`\nScraping category: ${category.name}`);
  console.log(`URL: ${category.url}`);
  
  // Fetch category page
  const categoryHtml = await fetchPage(category.url);
  
  // Extract product links
  const productLinks = extractProductLinks(categoryHtml);
  console.log(`Found ${productLinks.length} product links`);
  
  // Fetch each product page
  for (const productUrl of productLinks) {
    const filename = urlToFilename(productUrl);
    console.log(`  - Fetching: ${filename}`);
    
    try {
      const productHtml = await fetchPage(productUrl);
      
      // Save HTML
      const htmlPath = path.join(outputDir, `${filename}.html`);
      fs.writeFileSync(htmlPath, productHtml);
      
      // Convert to markdown
      const markdown = htmlToMarkdown(productHtml, productUrl);
      const mdPath = path.join(outputDir, `${filename}.md`);
      fs.writeFileSync(mdPath, markdown);
      
      // Add small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ERROR fetching ${productUrl}:`, error.message);
    }
  }
}

async function main() {
  console.log('Starting yakkaroo.de scraper...\n');
  
  for (const category of categories) {
    await scrapeCategory(category);
  }
  
  console.log('\nScraping complete!');
}

main().catch(console.error);
