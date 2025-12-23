/**
 * GPU Parser
 * 
 * Parses GPU support specifications
 */

export function parseGPULength(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}
