/**
 * PSU Parser
 * 
 * Parses power supply unit specifications from various formats
 */

import type { PSUType } from '../schema/types.js';

export function parsePSUTypes(value: string): PSUType[] {
  const result: PSUType[] = [];
  const lowered = value.toLowerCase();

  if (lowered.includes('atx') && !lowered.includes('flex')) result.push('ATX');
  if (lowered.includes('sfx-l')) result.push('SFX-L');
  else if (lowered.includes('sfx')) result.push('SFX');
  if (lowered.includes('flexatx') || lowered.includes('flex atx')) result.push('FlexATX');
  if (lowered.includes('tfx')) result.push('TFX');
  if (lowered.includes('1u')) result.push('1U');
  if (lowered.includes('2u') && lowered.includes('redundant')) result.push('2U Redundant');
  if (lowered.includes('mini') && lowered.includes('redundant')) result.push('Mini Redundant');
  if (lowered.includes('crps')) result.push('CRPS');
  if (lowered.includes('ps2') || lowered.includes('ps/2')) result.push('PS2');

  return [...new Set(result)];
}
