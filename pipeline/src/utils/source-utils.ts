/**
 * Source Utilities
 * 
 * Helper functions for working with data sources
 */

import path from 'node:path';
import type { DataSource, Currency } from '../schema/types.js';

export function getSourceFromPath(filePath: string): DataSource {
  if (filePath.includes('inter-tech.de')) return 'inter-tech.de';
  if (filePath.includes('sliger.com')) return 'sliger.com';
  if (filePath.includes('silverstonetek.com')) return 'silverstonetek.com';
  if (filePath.includes('ipc.in-win.com')) return 'ipc.in-win.com';
  if (filePath.includes('yakkaroo.de')) return 'yakkaroo.de';
  if (filePath.includes('unykach.com')) return 'unykach.com';
  return 'inter-tech.de'; // Default fallback
}

export function getBrandFromSource(source: DataSource): string {
  const brands: Record<DataSource, string> = {
    'inter-tech.de': 'Inter-Tech',
    'sliger.com': 'Sliger',
    'silverstonetek.com': 'SilverStone',
    'ipc.in-win.com': 'In-Win',
    'yakkaroo.de': 'Various',
    'unykach.com': 'UNYKAch',
  };
  return brands[source] || 'Unknown';
}

export function getCurrencyFromSource(source: DataSource): Currency {
  const currencies: Record<DataSource, Currency> = {
    'inter-tech.de': 'EUR',
    'sliger.com': 'USD',
    'silverstonetek.com': 'USD',
    'ipc.in-win.com': 'USD',
    'yakkaroo.de': 'EUR',
    'unykach.com': 'EUR',
  };
  return currencies[source] || 'USD';
}

export function getModelFromFilename(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^(\d+)u-/i, (_: string, num: string) => `${num}U-`).toUpperCase();
}
