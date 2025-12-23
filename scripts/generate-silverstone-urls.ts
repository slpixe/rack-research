#!/usr/bin/env tsx
/**
 * Generate URL mapping for silverstonetek.com based on URL pattern
 * SilverStone uses pattern: https://silverstonetek.com/en/product/info/{model}/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesDir = path.join(__dirname, '..', 'resources', 'silverstonetek.com');
const baseUrl = 'https://silverstonetek.com/en/product/info';

// Get all markdown files
const mdFiles = fs
  .readdirSync(resourcesDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !f.includes('instructions') && !f.includes('SUMMARY'));

const urlMappings: Record<string, string> = {};

for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  // SilverStone URLs use the model name, sometimes with dashes replaced with underscores
  // But we'll use the filename as-is since that's what we matched
  urlMappings[baseName] = `${baseUrl}/${baseName}/`;
}

// Save the mappings
const outputPath = path.join(resourcesDir, 'url-mappings.json');
fs.writeFileSync(outputPath, JSON.stringify(urlMappings, null, 2), 'utf-8');

console.log(`✓ Generated ${Object.keys(urlMappings).length} URL mappings for silverstonetek.com`);
console.log(`  Saved to: ${outputPath}`);
