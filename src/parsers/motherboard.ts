/**
 * Motherboard Support Parser
 * 
 * Parses motherboard form factor strings into a normalized list.
 */

export type MotherboardFormFactor = 
  | 'Mini-ITX'
  | 'Mini-DTX'
  | 'FlexATX'
  | 'Micro-ATX'
  | 'ATX'
  | 'E-ATX'
  | 'SSI-CEB'
  | 'SSI-EEB'
  | 'EEB';

export function parseMotherboardSupport(value: string): MotherboardFormFactor[] {
  const result: MotherboardFormFactor[] = [];
  const lowered = value.toLowerCase();

  if (lowered.includes('mini-itx') || lowered.includes('mini itx')) result.push('Mini-ITX');
  if (lowered.includes('mini-dtx') || lowered.includes('mini dtx')) result.push('Mini-DTX');
  if (lowered.includes('flexatx') || lowered.includes('flex atx')) result.push('FlexATX');
  if (
    lowered.includes('micro-atx') ||
    lowered.includes('micro atx') ||
    lowered.includes('matx') ||
    lowered.includes('μatx')
  )
    result.push('Micro-ATX');
  if (
    /\batx\b/i.test(value) &&
    !lowered.includes('micro') &&
    !lowered.includes('μ') &&
    !lowered.includes('e-atx') &&
    !lowered.includes('eatx') &&
    !lowered.includes('extended-atx') &&
    !lowered.includes('extended atx') &&
    !lowered.includes('flex')
  ) {
    result.push('ATX');
  }
  if (
    lowered.includes('e-atx') ||
    lowered.includes('eatx') ||
    lowered.includes('extended-atx') ||
    lowered.includes('extended atx')
  )
    result.push('E-ATX');
  if (lowered.includes('ssi-ceb') || lowered.includes('ceb')) result.push('SSI-CEB');
  if (lowered.includes('ssi-eeb') || lowered.includes('ssi eeb') || lowered.includes('eeb'))
    result.push('SSI-EEB');

  return [...new Set(result)];
}
