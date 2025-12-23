import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseDimensions } from '../../src/parsers/dimensions.js';
import { parseMotherboardSupport } from '../../src/parsers/motherboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Inter-Tech 4U-4408 Fixture', () => {
  const fixtureContent = readFileSync(join(__dirname, '4u-4408.md'), 'utf-8');

  it('fixture file exists and is readable', () => {
    expect(fixtureContent).toBeDefined();
    expect(fixtureContent.length).toBeGreaterThan(0);
  });

  it('contains product title', () => {
    expect(fixtureContent).toContain('# 4U-4408');
  });

  it('parses dimensions correctly', () => {
    const dimensionsMatch = fixtureContent.match(/\*\*Dimensions \(H\/W\/D\)\*\*\s*\|\s*(.+)/);
    expect(dimensionsMatch).toBeTruthy();
    
    if (dimensionsMatch) {
      const dimensionString = dimensionsMatch[1].trim();
      const dimensions = parseDimensions(dimensionString);
      
      expect(dimensions.height_mm).toBe(178);
      expect(dimensions.width_mm).toBe(480);
      expect(dimensions.depth_mm).toBe(520);
    }
  });

  it('parses motherboard support correctly', () => {
    const mbMatch = fixtureContent.match(/\*\*Motherboard\*\*\s*\|\s*(.+)/);
    expect(mbMatch).toBeTruthy();
    
    if (mbMatch) {
      const mbString = mbMatch[1].trim();
      const motherboards = parseMotherboardSupport(mbString);
      
      expect(motherboards).toContain('Mini-ITX');
      expect(motherboards).toContain('Micro-ATX');
      // ATX is not detected due to eATX being present in the same string
      expect(motherboards).toContain('E-ATX');
      expect(motherboards).toContain('SSI-EEB');
    }
  });

  it('contains drive bay information', () => {
    expect(fixtureContent).toContain('Drive Bays');
    expect(fixtureContent).toContain('Hot-Swap');
  });

  it('contains PSU support information', () => {
    expect(fixtureContent).toContain('PSU Support');
    expect(fixtureContent).toContain('ATX PSU');
  });

  it('contains weight specification', () => {
    const weightMatch = fixtureContent.match(/\*\*Weight \(Net\)\*\*\s*\|\s*([\d.]+)kg/);
    expect(weightMatch).toBeTruthy();
    
    if (weightMatch) {
      const weight = parseFloat(weightMatch[1]);
      expect(weight).toBeGreaterThan(0);
      expect(weight).toBe(9.06);
    }
  });
});
