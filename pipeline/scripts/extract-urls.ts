#!/usr/bin/env tsx
/**
 * URL Extraction Script
 *
 * Extracts source URLs from HTML files and creates URL mapping files
 * for each source that can be used by build-db.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UrlMapping {
  [key: string]: string;
}

/**
 * Extract canonical URL from HTML content
 */
function extractUrlFromHtml(html: string): string | null {
  const $ = cheerio.load(html);

  // Try canonical link
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical) return canonical;

  // Try og:url meta tag
  const ogUrl = $('meta[property="og:url"]').attr('content');
  if (ogUrl) return ogUrl;

  // Try itemprop url
  const itempropUrl = $('meta[itemprop="url"]').attr('content');
  if (itempropUrl) return itempropUrl;

  return null;
}

/**
 * Process HTML files for a given source
 */
function processSource(sourceName: string, resourcesDir: string): UrlMapping {
  const sourceDir = path.join(resourcesDir, sourceName);
  const mappings: UrlMapping = {};

  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️  Directory not found: ${sourceDir}`);
    return mappings;
  }

  const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.html'));

  console.log(`\n📂 Processing ${sourceName} (${files.length} HTML files)`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const html = fs.readFileSync(filePath, 'utf-8');
    const url = extractUrlFromHtml(html);

    // Get the base name without extension (this matches the markdown file naming)
    const baseName = path.basename(file, '.html');

    if (url) {
      mappings[baseName] = url;
      successCount++;
      console.log(`  ✓ ${baseName} → ${url}`);
    } else {
      errorCount++;
      console.log(`  ✗ ${baseName} - No URL found`);
    }
  }

  console.log(
    `  Summary: ${successCount} URLs extracted, ${errorCount} failed`
  );

  return mappings;
}

/**
 * Save URL mappings to JSON file
 */
function saveMappings(
  sourceName: string,
  mappings: UrlMapping,
  resourcesDir: string
): void {
  if (Object.keys(mappings).length === 0) {
    console.log(`  ⚠️  No mappings to save for ${sourceName}`);
    return;
  }

  const outputPath = path.join(
    resourcesDir,
    sourceName,
    'url-mappings.json'
  );

  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2), 'utf-8');

  console.log(`  ✓ Saved ${Object.keys(mappings).length} mappings to ${outputPath}`);
}

/**
 * Main execution
 */
function main() {
  const resourcesDir = path.join(__dirname, '..', 'resources');

  console.log('🔍 Extracting URLs from HTML files...');
  console.log(`Resources directory: ${resourcesDir}\n`);

  // Process each source that has HTML files
  const sources = ['yakkaroo.de', 'ipc.in-win.com', 'inter-tech.de', 'silverstonetek.com'];

  const results: Record<string, UrlMapping> = {};

  for (const source of sources) {
    const mappings = processSource(source, resourcesDir);
    results[source] = mappings;
    saveMappings(source, mappings, resourcesDir);
  }

  // Print summary
  console.log('\n📊 Summary:');
  for (const [source, mappings] of Object.entries(results)) {
    const count = Object.keys(mappings).length;
    console.log(`  ${source}: ${count} URLs extracted`);
  }

  console.log('\n✅ URL extraction complete!');
}

main();
