/**
 * Rack Units Parser
 * 
 * Parses rack unit specifications from various formats
 */

export function parseRackUnits(value: string): string | null {
  const match = value.match(/(\d+\.?\d*)\s*U/i);
  if (match) {
    return `${match[1]}U`;
  }
  return null;
}
