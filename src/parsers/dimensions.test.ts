import { describe, it, expect } from 'vitest';
import { parseDimensions } from './dimensions';

describe('parseDimensions', () => {
  it('parses Inter-Tech format: "44.5 x 482 x 428mm" (H x W x D)', () => {
    const result = parseDimensions('44.5 x 482 x 428mm');
    expect(result).toEqual({
      height_mm: 44.5,
      width_mm: 482,
      depth_mm: 428,
    });
  });

  it('parses Yakkaroo labeled format', () => {
    const result = parseDimensions('width: 483mm / depth: 450mm / height: 177mm');
    expect(result).toEqual({
      width_mm: 483,
      depth_mm: 450,
      height_mm: 177,
    });
  });

  it('parses format with (W) (H) (D) labels', () => {
    const result = parseDimensions('430mm (W) x 88.5mm (H) x 580mm (D)');
    expect(result).toEqual({
      width_mm: 430,
      height_mm: 88.5,
      depth_mm: 580,
    });
  });

  it('returns nulls for unparseable input', () => {
    const result = parseDimensions('N/A');
    expect(result).toEqual({
      width_mm: null,
      height_mm: null,
      depth_mm: null,
    });
  });

  it('returns nulls for empty string', () => {
    const result = parseDimensions('');
    expect(result).toEqual({
      width_mm: null,
      height_mm: null,
      depth_mm: null,
    });
  });

  it('handles decimal values correctly', () => {
    const result = parseDimensions('44.5 x 482.3 x 428.9mm');
    expect(result).toEqual({
      height_mm: 44.5,
      width_mm: 482.3,
      depth_mm: 428.9,
    });
  });
});
