#!/usr/bin/env tsx
/**
 * Generate URL mapping for sliger.com based on URL pattern
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesDir = path.join(__dirname, '..', 'resources', 'sliger.com');
const baseUrl = 'https://sliger.com/products';

// Get all markdown files
const mdFiles = fs
  .readdirSync(resourcesDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !f.includes('instructions') && !f.includes('SUMMARY'));

const urlMappings: Record<string, string> = {};

for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  // Convert to lowercase for the URL (sliger.com uses lowercase product URLs)
  const urlSlug = baseName.toLowerCase();
  urlMappings[baseName] = `${baseUrl}/${urlSlug}`;
}

// Save the mappings
const outputPath = path.join(resourcesDir, 'url-mappings.json');
fs.writeFileSync(outputPath, JSON.stringify(urlMappings, null, 2), 'utf-8');

console.log(`✓ Generated ${Object.keys(urlMappings).length} URL mappings for sliger.com`);
console.log(`  Saved to: ${outputPath}`);
