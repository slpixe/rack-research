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
import type { RackCase, DataSource } from './schema/types.js';
import { parseMarkdownFile } from './parsers/markdown.js';
import { transformToUniversal } from './transformers/universal.js';
import { writeJsonDatabase } from './db/json-writer.js';
import { getSourceFromPath } from './utils/source-utils.js';
import { validateAndWarn } from './schema/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// URL MAPPING LOADER
// ============================================================================

interface UrlMappings {
  [source: string]: Record<string, string>;
}

function loadUrlMappings(resourcesDir: string): UrlMappings {
  const mappings: UrlMappings = {};
  const sources = fs.readdirSync(resourcesDir);

  for (const source of sources) {
    const sourceDir = path.join(resourcesDir, source);
    if (!fs.statSync(sourceDir).isDirectory()) continue;

    const mappingFile = path.join(sourceDir, 'url-mappings.json');
    if (fs.existsSync(mappingFile)) {
      try {
        const content = fs.readFileSync(mappingFile, 'utf-8');
        mappings[source] = JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  Failed to load mappings for ${source}: ${error}`);
      }
    }
  }

  return mappings;
}

function getSourceUrlFromMapping(
  source: DataSource,
  filePath: string,
  urlMappings: UrlMappings
): string {
  // Get the base filename without extension
  const baseName = path.basename(filePath, '.md');

  // Check if we have a mapping for this source
  if (urlMappings[source] && urlMappings[source][baseName]) {
    return urlMappings[source][baseName];
  }

  return '';
}

// ============================================================================
// DATABASE GENERATOR
// ============================================================================

interface ProductProcessingResult {
  valid: RackCase[];
  invalid: Array<{ file: string; errors: string[] }>;
  warnings: Array<{ file: string; warnings: string[] }>;
}

function generateDatabase(resourcesDir: string, urlMappings: UrlMappings): ProductProcessingResult {
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

        // Apply URL mapping if source_url is empty
        if (!product.source_url) {
          product.source_url = getSourceUrlFromMapping(dataSource, filePath, urlMappings);
        }

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

console.log('🔍 Loading URL mappings...');
const urlMappings = loadUrlMappings(resourcesDir);
const mappingCount = Object.values(urlMappings).reduce(
  (sum, mapping) => sum + Object.keys(mapping).length,
  0
);
console.log(`   Loaded ${mappingCount} URL mappings from ${Object.keys(urlMappings).length} sources\n`);

console.log('🔍 Parsing markdown files...\n');
const result = generateDatabase(resourcesDir, urlMappings);
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
  
  // Aggregate warning types
  const warningCounts: Record<string, number> = {};
  result.warnings.forEach(({ warnings }) => {
    warnings.forEach((warn) => {
      warningCounts[warn] = (warningCounts[warn] || 0) + 1;
    });
  });

  console.log('\n📋 Data Quality Summary:');
  Object.entries(warningCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([warning, count]) => {
      const percentage = ((count / result.valid.length) * 100).toFixed(1);
      console.warn(`   ${warning}: ${count} products (${percentage}%)`);
    });

  // Only show first few warnings to avoid clutter
  console.log('\n📝 Sample warnings:');
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

// URL Coverage Statistics
console.log('\n🔗 URL Coverage:');
const productsWithUrl = products.filter((p) => p.source_url).length;
const urlCoveragePercent = ((productsWithUrl / products.length) * 100).toFixed(1);
console.log(`   ${productsWithUrl} / ${products.length} products have source URLs (${urlCoveragePercent}%)`);

const urlsBySource = products.reduce(
  (acc, p) => {
    if (!acc[p.source]) {
      acc[p.source] = { total: 0, withUrl: 0 };
    }
    acc[p.source].total++;
    if (p.source_url) {
      acc[p.source].withUrl++;
    }
    return acc;
  },
  {} as Record<string, { total: number; withUrl: number }>
);

console.log('\n   Coverage by source:');
Object.entries(urlsBySource)
  .sort((a, b) => b[1].withUrl - a[1].withUrl)
  .forEach(([source, stats]) => {
    const percent = ((stats.withUrl / stats.total) * 100).toFixed(1);
    console.log(`   ${source}: ${stats.withUrl}/${stats.total} (${percent}%)`);
  });

writeJsonDatabase(products, outputPath);
