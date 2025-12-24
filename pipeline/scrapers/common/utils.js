/**
 * Common utilities for all scrapers
 */

/**
 * Generate standard markdown format for product pages
 * @param {Object} data - Product data
 * @param {string} data.title - Product title
 * @param {string} data.url - Product URL
 * @param {string} [data.description] - Product description
 * @param {string} [data.price] - Price string
 * @param {string} [data.currency] - Currency code (default: EUR)
 * @param {Object} [data.specifications] - Key-value pairs of specifications
 * @param {string} [data.availability] - Availability status
 * @param {string} [data.sku] - SKU number
 * @param {string} [data.date] - Scrape date (default: today)
 * @returns {string} Markdown formatted string
 */
function generateStandardMarkdown(data) {
  const {
    title,
    url,
    description,
    price,
    currency = 'EUR',
    specifications = {},
    availability,
    sku,
    date = new Date().toISOString().split('T')[0]
  } = data;

  let md = `# ${title}\n\n`;
  md += `> Source: [${url}](${url})  \n`;
  md += `> Scraped: ${date}\n\n`;

  // Overview section
  if (description) {
    md += `## Overview\n\n${description}\n\n`;
  }

  // Pricing section
  md += `## Pricing\n\n`;
  md += `| Item | Price | Currency |\n`;
  md += `|------|-------|----------|\n`;
  md += `| Case | ${price || 'Contact for quote'} | ${currency} |\n`;
  md += `| Shipping | See website | ${currency} |\n\n`;

  // Specifications section
  if (Object.keys(specifications).length > 0) {
    md += `## Specifications\n\n`;
    md += `| Attribute | Details |\n`;
    md += `|-----------|---------|\n`;

    for (const [key, value] of Object.entries(specifications)) {
      // Handle multi-line values
      const formattedValue = String(value).replace(/\n/g, '<br>');
      md += `| **${key}** | ${formattedValue} |\n`;
    }
    md += `\n`;
  }

  // Availability section
  if (availability) {
    md += `## Availability\n\n`;
    md += `**Status:** ${availability}\n\n`;
  }

  // SKU
  if (sku) {
    md += `**SKU:** ${sku}\n\n`;
  }

  return md;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean and normalize text
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\n+/g, '\n') // Normalize newlines
    .trim();
}

/**
 * Convert URL to safe filename
 * @param {string} url - URL to convert
 * @returns {string} Safe filename
 */
function urlToFilename(url) {
  const parts = url.split('/');
  const slug = parts[parts.length - 1] || parts[parts.length - 2];
  return slug
    .replace(/[^a-z0-9-_]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Parse price string to extract numeric value and currency
 * @param {string} priceString - Price string (e.g., "€ 178,90" or "$199.99")
 * @returns {Object} { value: number, currency: string, original: string }
 */
function parsePrice(priceString) {
  if (!priceString) return null;

  const cleaned = priceString.trim();
  
  // Extract currency symbol
  const currencyMatch = cleaned.match(/[$€£¥₹]/);
  const currency = currencyMatch ? currencyMatch[0] : '';

  // Extract numeric value
  const numericMatch = cleaned.match(/[\d,.']+/);
  if (!numericMatch) return null;

  const numericStr = numericMatch[0]
    .replace(/[,.']/g, (match, offset, string) => {
      // Keep last separator as decimal point
      const isLastSeparator = string.lastIndexOf(match) === offset;
      return isLastSeparator ? '.' : '';
    });

  const value = parseFloat(numericStr);

  return {
    value: isNaN(value) ? null : value,
    currency: currency || 'EUR',
    original: cleaned
  };
}

/**
 * Extract specifications from a table element (Cheerio)
 * @param {CheerioElement} $table - Cheerio table element
 * @param {Function} $ - Cheerio instance
 * @returns {Object} Specifications key-value pairs
 */
function extractSpecsFromTable($table, $) {
  const specs = {};
  
  $table.find('tr').each((i, row) => {
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

/**
 * Standard error handler for scraping operations
 * @param {Error} error - Error object
 * @param {string} context - Context description
 */
function handleScraperError(error, context) {
  console.error(`\n❌ Error in ${context}:`);
  console.error(`   Message: ${error.message}`);
  if (error.stack) {
    console.error(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
  }
}

/**
 * Log progress with consistent formatting
 * @param {string} message - Message to log
 * @param {string} [level='info'] - Log level: 'info', 'success', 'warning', 'error'
 */
function log(message, level = 'info') {
  const symbols = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  };
  
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m'    // Red
  };
  
  const reset = '\x1b[0m';
  const symbol = symbols[level] || symbols.info;
  const color = colors[level] || colors.info;
  
  console.log(`${color}${symbol}${reset} ${message}`);
}

module.exports = {
  generateStandardMarkdown,
  sleep,
  cleanText,
  urlToFilename,
  parsePrice,
  extractSpecsFromTable,
  handleScraperError,
  log
};
