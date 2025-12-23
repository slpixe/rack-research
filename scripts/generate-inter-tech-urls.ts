#!/usr/bin/env tsx
/**
 * Generate URL mapping for inter-tech.de based on URL pattern
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesDir = path.join(__dirname, '..', 'resources', 'inter-tech.de');
const baseUrl = 'https://www.inter-tech.de/productdetails-152';

// Get all markdown files (excluding instructions and SUMMARY)
const mdFiles = fs
  .readdirSync(resourcesDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !f.includes('instructions') && !f.includes('SUMMARY'));

const urlMappings: Record<string, string> = {};

for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  // Inter-Tech uses format: productdetails-152/{MODEL}_EN.html
  // Model names are uppercase with periods as-is
  const modelName = baseName.toUpperCase();
  urlMappings[baseName] = `${baseUrl}/${modelName}_EN.html`;
}

// Save the mappings
const outputPath = path.join(resourcesDir, 'url-mappings.json');
fs.writeFileSync(outputPath, JSON.stringify(urlMappings, null, 2), 'utf-8');

console.log(`✓ Generated ${Object.keys(urlMappings).length} URL mappings for inter-tech.de`);
console.log(`  Saved to: ${outputPath}`);
