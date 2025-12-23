/**
 * CPU Cooler Parser
 * 
 * Parses CPU cooler height specifications
 */

export function parseCPUCoolerHeight(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}
