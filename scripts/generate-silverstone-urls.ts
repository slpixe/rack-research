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
const baseUrl = 'https://www.silverstonetek.com/en/product/info/server-nas';

// Get all markdown files
const mdFiles = fs
  .readdirSync(resourcesDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !f.includes('instructions') && !f.includes('SUMMARY'));

const urlMappings: Record<string, string> = {};

for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  // SilverStone URLs use lowercase model name in server-nas category
  // Format: https://www.silverstonetek.com/en/product/info/server-nas/{model-lowercase}/
  const modelName = baseName.toLowerCase();
  urlMappings[baseName] = `${baseUrl}/${modelName}/`;
}

// Save the mappings
const outputPath = path.join(resourcesDir, 'url-mappings.json');
fs.writeFileSync(outputPath, JSON.stringify(urlMappings, null, 2), 'utf-8');

console.log(`✓ Generated ${Object.keys(urlMappings).length} URL mappings for silverstonetek.com`);
console.log(`  Saved to: ${outputPath}`);
