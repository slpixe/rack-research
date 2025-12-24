/**
 * JSON Database Writer
 * 
 * Writes the product database to a JSON file
 */

import fs from 'node:fs';
import path from 'node:path';
import type { RackCase, DataSource } from '../schema/types.js';

export interface ProductDatabase {
  generated_at: string;
  total_products: number;
  sources: DataSource[];
  products: RackCase[];
}

export function writeJsonDatabase(products: RackCase[], outputPath: string): void {
  const output: ProductDatabase = {
    generated_at: new Date().toISOString(),
    total_products: products.length,
    sources: [...new Set(products.map((p) => p.source))] as DataSource[],
    products,
  };

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${products.length} products to ${outputPath}`);
}
