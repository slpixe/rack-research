import { describe, it, expect } from 'vitest';
import { parseMotherboardSupport } from './motherboard';

describe('parseMotherboardSupport', () => {
  it('parses Mini-ITX', () => {
    expect(parseMotherboardSupport('Mini-ITX')).toEqual(['Mini-ITX']);
    expect(parseMotherboardSupport('Mini ITX')).toEqual(['Mini-ITX']);
    expect(parseMotherboardSupport('mini-itx')).toEqual(['Mini-ITX']);
  });

  it('parses Micro-ATX', () => {
    expect(parseMotherboardSupport('Micro-ATX')).toEqual(['Micro-ATX']);
    expect(parseMotherboardSupport('Micro ATX')).toEqual(['Micro-ATX']);
    expect(parseMotherboardSupport('mATX')).toEqual(['Micro-ATX']);
    expect(parseMotherboardSupport('μATX')).toEqual(['Micro-ATX']);
  });

  it('parses ATX without including Micro-ATX or E-ATX', () => {
    expect(parseMotherboardSupport('ATX')).toEqual(['ATX']);
    expect(parseMotherboardSupport('Standard ATX')).toEqual(['ATX']);
  });

  it('does not parse ATX from Micro-ATX', () => {
    const result = parseMotherboardSupport('Micro-ATX');
    expect(result).toEqual(['Micro-ATX']);
    expect(result).not.toContain('ATX');
  });

  it('does not parse ATX from E-ATX', () => {
    const result = parseMotherboardSupport('E-ATX');
    expect(result).toEqual(['E-ATX']);
    expect(result).not.toContain('ATX');
  });

  it('parses E-ATX', () => {
    expect(parseMotherboardSupport('E-ATX')).toEqual(['E-ATX']);
    expect(parseMotherboardSupport('EATX')).toEqual(['E-ATX']);
    expect(parseMotherboardSupport('Extended-ATX')).toEqual(['E-ATX']);
    expect(parseMotherboardSupport('Extended ATX')).toEqual(['E-ATX']);
  });

  it('parses SSI-EEB', () => {
    expect(parseMotherboardSupport('SSI-EEB')).toEqual(['SSI-EEB']);
    expect(parseMotherboardSupport('SSI EEB')).toEqual(['SSI-EEB']);
    expect(parseMotherboardSupport('EEB')).toEqual(['SSI-EEB']);
  });

  it('parses SSI-CEB', () => {
    expect(parseMotherboardSupport('SSI-CEB')).toEqual(['SSI-CEB']);
    expect(parseMotherboardSupport('CEB')).toEqual(['SSI-CEB']);
  });

  it('parses FlexATX', () => {
    expect(parseMotherboardSupport('FlexATX')).toEqual(['FlexATX']);
    expect(parseMotherboardSupport('Flex ATX')).toEqual(['FlexATX']);
  });

  it('parses Mini-DTX', () => {
    expect(parseMotherboardSupport('Mini-DTX')).toEqual(['Mini-DTX']);
    expect(parseMotherboardSupport('Mini DTX')).toEqual(['Mini-DTX']);
  });

  it('parses multiple form factors from comma-separated list', () => {
    const result = parseMotherboardSupport('Mini-ITX, Mini-DTX, FlexATX');
    expect(result).toContain('Mini-ITX');
    expect(result).toContain('Mini-DTX');
    expect(result).toContain('FlexATX');
    expect(result).toHaveLength(3);
  });

  it('removes duplicates', () => {
    const result = parseMotherboardSupport('ATX, ATX, Standard ATX');
    expect(result).toEqual(['ATX']);
  });

  it('returns empty array for unrecognized input', () => {
    expect(parseMotherboardSupport('Unknown Form Factor')).toEqual([]);
    expect(parseMotherboardSupport('N/A')).toEqual([]);
    expect(parseMotherboardSupport('')).toEqual([]);
  });

  it('handles case insensitivity', () => {
    expect(parseMotherboardSupport('mini-itx, e-atx')).toEqual([
      'Mini-ITX',
      'E-ATX',
    ]);
  });
});
