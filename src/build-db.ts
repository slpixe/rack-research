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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// DATABASE GENERATOR
// ============================================================================

function generateDatabase(resourcesDir: string): RackCase[] {
  const products: RackCase[] = [];
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

        products.push(product);
        console.log(`✓ ${product.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error processing ${filePath}:`, message);
      }
    }
  }

  return products;
}

// ============================================================================
// MAIN
// ============================================================================

const resourcesDir = path.join(__dirname, '..', 'resources');
const outputPath = path.join(__dirname, '..', 'data', 'products.json');

console.log('🔍 Parsing markdown files...\n');
const products = generateDatabase(resourcesDir);

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
