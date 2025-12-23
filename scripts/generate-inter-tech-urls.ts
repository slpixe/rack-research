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

// Different productdetails IDs based on rack unit size
const productDetailsMap: Record<string, string> = {
  '1U': '152',
  '1.5U': '152',
  '2U': '151',
  '3U': '150',
  '4U': '149',
  '5U': '148', // Guess based on pattern
  '6U': '147', // Guess based on pattern
};

// Get all markdown files (excluding instructions and SUMMARY)
const mdFiles = fs
  .readdirSync(resourcesDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !f.includes('instructions') && !f.includes('SUMMARY'));

const urlMappings: Record<string, string> = {};

for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  
  // Extract rack unit size from filename (e.g., "1U", "2U", "3U", "4U")
  const rackUnitMatch = baseName.match(/^(\d+(?:\.\d+)?U)/i);
  const rackUnit = rackUnitMatch ? rackUnitMatch[1].toUpperCase() : '4U'; // Default to 4U
  const productDetailsId = productDetailsMap[rackUnit] || '152';
  
  // Convert model name for URL
  let modelName = baseName.toUpperCase();
  const afterRackUnit = baseName.slice(rackUnit.length); // Get everything after rack unit
  
  // Special cases for K-series products
  if (baseName.match(/-k-/i)) {
    if (rackUnit === '1U') {
      // 1U K-series: 1u-k-125l -> 1U_K-125L
      const parts = baseName.split('-');
      modelName = `${parts[0].toUpperCase()}_${parts.slice(1).join('-').toUpperCase()}`;
    } else if (rackUnit === '2U') {
      // 2U K-series: 2u-k-240l -> IPC_K-240L
      modelName = `IPC_${afterRackUnit.slice(1).toUpperCase()}`; // Skip the leading hyphen
    }
    // 3U and 4U K-series use standard format (no change needed)
  }
  // Handle products with spaces (indicated by 4-digit model number followed by additional segments)
  // Examples: 2U-2098-SK, 2U-2129-N, 3U-3098-S, 4U-4088-S, 4U-4452-TFT, 4U-4129L
  // Pattern: -DDDD-XXX where DDDD is 4 digits and XXX is additional letters/numbers
  else if (afterRackUnit.match(/^-\d{4}-.+/)) {
    // Models like 2U-2098-SK, 4U-4452-TFT need underscore after rack unit
    modelName = `${rackUnit}_${afterRackUnit.slice(1).toUpperCase()}`;
  }
  
  // Special case: 4U-4460-TFT doesn't have _EN suffix
  const suffix = baseName === '4u-4460-tft' ? '.html' : '_EN.html';
  
  urlMappings[baseName] = `https://www.inter-tech.de/productdetails-${productDetailsId}/${modelName}${suffix}`;
}

// Save the mappings
const outputPath = path.join(resourcesDir, 'url-mappings.json');
fs.writeFileSync(outputPath, JSON.stringify(urlMappings, null, 2), 'utf-8');

console.log(`✓ Generated ${Object.keys(urlMappings).length} URL mappings for inter-tech.de`);
console.log(`  Saved to: ${outputPath}`);
