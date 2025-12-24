/**
 * ID Generator
 * 
 * Generates unique product IDs
 */

import type { DataSource } from '../schema/types.js';

export function generateProductId(source: DataSource, model: string): string {
  return `${source}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
