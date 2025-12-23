#!/usr/bin/env tsx
/**
 * Markdown Parser & Database Generator
 *
 * Parses all markdown files from resources/ and generates a unified JSON database.
 *
 * Usage: npm run build:db
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RackCase } from './schema/types.js';
import { parseMarkdownFile } from './parsers/markdown.js';
import { transformToUniversal } from './transformers/universal.js';
import { writeJsonDatabase } from './db/json-writer.js';
import { getSourceFromPath } from './utils/source-utils.js';
import { validateAndWarn } from './schema/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// DATABASE GENERATOR
// ============================================================================

interface ProductProcessingResult {
  valid: RackCase[];
  invalid: Array<{ file: string; errors: string[] }>;
  warnings: Array<{ file: string; warnings: string[] }>;
}

function generateDatabase(resourcesDir: string): ProductProcessingResult {
  const valid: RackCase[] = [];
  const invalid: Array<{ file: string; errors: string[] }> = [];
  const warnings: Array<{ file: string; warnings: string[] }> = [];
  const sources = fs.readdirSync(resourcesDir);

  for (const source of sources) {
    const sourceDir = path.join(resourcesDir, source);
    if (!fs.statSync(sourceDir).isDirectory()) continue;

    const files = fs.readdirSync(sourceDir).filter((f: string) => f.endsWith('.md'));

    for (const file of files) {
      // Skip instruction/summary files
      if (file.includes('instructions') || file.includes('SUMMARY')) continue;

      const filePath = path.join(sourceDir, file);

      try {
        const dataSource = getSourceFromPath(filePath);
        const parsed = parseMarkdownFile(filePath);
        const product = transformToUniversal(parsed, dataSource, filePath);

        // Validate the product
        const validationResult = validateAndWarn(product);

        if (validationResult.valid && validationResult.data) {
          valid.push(validationResult.data);
          console.log(`✓ ${validationResult.data.name}`);

          // Track warnings if any
          if (validationResult.warnings.length > 0) {
            warnings.push({
              file,
              warnings: validationResult.warnings,
            });
          }
        } else {
          invalid.push({
            file,
            errors: validationResult.errors,
          });
          console.error(`✗ Validation failed for ${file}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error processing ${filePath}:`, message);
        invalid.push({
          file,
          errors: [message],
        });
      }
    }
  }

  return { valid, invalid, warnings };
}

// ============================================================================
// MAIN
// ============================================================================

const resourcesDir = path.join(__dirname, '..', 'resources');
const outputPath = path.join(__dirname, '..', 'data', 'products.json');

console.log('🔍 Parsing markdown files...\n');
const result = generateDatabase(resourcesDir);
const products = result.valid;

// Display validation summary
console.log(`\n✅ Valid products: ${result.valid.length}`);
if (result.invalid.length > 0) {
  console.log(`❌ Invalid products: ${result.invalid.length}`);
  result.invalid.forEach(({ file, errors }) => {
    console.error(`   ${file}:`);
    errors.forEach((err) => console.error(`      - ${err}`));
  });
}

if (result.warnings.length > 0) {
  console.log(`\n⚠️  Products with warnings: ${result.warnings.length}`);
  // Only show first few warnings to avoid clutter
  const warningsToShow = result.warnings.slice(0, 5);
  warningsToShow.forEach(({ file, warnings }) => {
    console.warn(`   ${file}:`);
    warnings.forEach((warn) => console.warn(`      - ${warn}`));
  });
  if (result.warnings.length > 5) {
    console.warn(`   ... and ${result.warnings.length - 5} more`);
  }
}

console.log('\n📊 Summary by source:');
const bySource = products.reduce(
  (acc, p) => {
    acc[p.source] = (acc[p.source] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

Object.entries(bySource)
  .sort((a, b) => b[1] - a[1])
  .forEach(([src, count]) => {
    console.log(`   ${src}: ${count} products`);
  });

console.log('\n📊 Summary by rack units:');
const byRackUnits = products.reduce(
  (acc, p) => {
    acc[p.rack_units] = (acc[p.rack_units] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

Object.entries(byRackUnits)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([units, count]) => {
    console.log(`   ${units}: ${count} products`);
  });

writeJsonDatabase(products, outputPath);
