/**
 * Storage Parser
 * 
 * Parses drive bay specifications from various formats
 */

import type { DriveBay } from '../schema/types.js';

export function parseDriveBays(value: string): DriveBay[] {
  const bays: DriveBay[] = [];
  const regex =
    /(\d+)\s*x?\s*(2\.5|3\.5|5\.25|E1\.S)["\u201D]?\s*(inch)?\s*(internal|external|hot[- ]?swap)?/gi;
  let match;

  while ((match = regex.exec(value)) !== null) {
    const quantity = parseInt(match[1], 10);
    const size = (match[2] + '"') as DriveBay['size'];
    const location = match[4]?.toLowerCase() || '';

    bays.push({
      size,
      quantity,
      hot_swap: location.includes('hot') || location.includes('swap'),
      internal: !location.includes('external'),
    });
  }

  return bays;
}
