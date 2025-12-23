import { describe, it, expect } from 'vitest';
import {
  RackCaseSchema,
  validateAndWarn,
  validateProduct,
  MotherboardFormFactorSchema,
  RackUnitsSchema,
  PSUTypeSchema,
  AvailabilitySchema,
  DataSourceSchema,
} from './validators.js';

describe('Zod Schemas', () => {
  describe('Enum Schemas', () => {
    it('validates RackUnitsSchema', () => {
      expect(RackUnitsSchema.parse('1U')).toBe('1U');
      expect(RackUnitsSchema.parse('4U')).toBe('4U');
      expect(() => RackUnitsSchema.parse('14U')).toThrow();
    });

    it('validates MotherboardFormFactorSchema', () => {
      expect(MotherboardFormFactorSchema.parse('Mini-ITX')).toBe('Mini-ITX');
      expect(MotherboardFormFactorSchema.parse('ATX')).toBe('ATX');
      expect(() => MotherboardFormFactorSchema.parse('Invalid')).toThrow();
    });

    it('validates PSUTypeSchema', () => {
      expect(PSUTypeSchema.parse('ATX')).toBe('ATX');
      expect(PSUTypeSchema.parse('SFX')).toBe('SFX');
      expect(() => PSUTypeSchema.parse('Invalid')).toThrow();
    });

    it('validates AvailabilitySchema', () => {
      expect(AvailabilitySchema.parse('in-stock')).toBe('in-stock');
      expect(AvailabilitySchema.parse('unknown')).toBe('unknown');
      expect(() => AvailabilitySchema.parse('invalid-status')).toThrow();
    });

    it('validates DataSourceSchema', () => {
      expect(DataSourceSchema.parse('inter-tech.de')).toBe('inter-tech.de');
      expect(DataSourceSchema.parse('sliger.com')).toBe('sliger.com');
      expect(() => DataSourceSchema.parse('invalid-source.com')).toThrow();
    });
  });

  describe('RackCaseSchema', () => {
    const validProduct = {
      id: 'test-product-1',
      model: 'TEST-1000',
      brand: 'TestBrand',
      name: 'Test Product',
      source: 'inter-tech.de',
      source_url: 'https://example.com/product',
      scraped_at: '2025-12-23',
      price: {
        amount: 299.99,
        currency: 'USD',
      },
      availability: 'in-stock',
      rack_units: '4U',
      dimensions: {
        width_mm: 482,
        height_mm: 177,
        depth_mm: 450,
        weight_kg: 8.5,
        volume_liters: null,
      },
      motherboard_support: ['ATX', 'Micro-ATX'],
      cpu_cooler: {
        max_height_mm: 150,
      },
      fan_mounts: [],
      radiator_support: [],
      drive_bays: [
        {
          size: '3.5"',
          quantity: 4,
          hot_swap: true,
          internal: true,
        },
      ],
      total_25_bays: 0,
      total_35_bays: 4,
      total_525_bays: 0,
      has_hot_swap: true,
      expansion_slots: [
        {
          type: 'full-height',
          quantity: 7,
        },
      ],
      total_pcie_slots: 7,
      has_full_height_slots: true,
      gpu_support: {
        max_length_mm: 350,
        max_height_mm: null,
      },
      psu_support: {
        types: ['ATX'],
        max_length_mm: 180,
      },
      psu_included: false,
      front_io: {
        usb_type_a_2_0: 2,
        usb_type_a_3_0: 2,
        usb_type_a_3_1: 0,
        usb_type_c: 1,
        audio_jack: true,
        mic_jack: true,
        power_button: true,
        reset_button: true,
      },
      features: ['Hot-swap bays', 'Dust filters'],
    };

    it('validates a complete valid product', () => {
      const result = RackCaseSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('rejects product with missing required fields', () => {
      const invalidProduct = { ...validProduct, id: undefined };
      const result = RackCaseSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('rejects product with invalid rack_units', () => {
      const invalidProduct = { ...validProduct, rack_units: '15U' };
      const result = RackCaseSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('rejects product with invalid motherboard form factor', () => {
      const invalidProduct = {
        ...validProduct,
        motherboard_support: ['InvalidFormFactor'],
      };
      const result = RackCaseSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('accepts product with null price', () => {
      const productWithNullPrice = { ...validProduct, price: null };
      const result = RackCaseSchema.safeParse(productWithNullPrice);
      expect(result.success).toBe(true);
    });

    it('accepts product with optional fields missing', () => {
      const minimalProduct: typeof validProduct = {
        ...validProduct,
      };
      const result = RackCaseSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
    });
  });

  describe('validateAndWarn', () => {
    const validProduct = {
      id: 'test-product-1',
      model: 'TEST-1000',
      brand: 'TestBrand',
      name: 'Test Product',
      source: 'inter-tech.de',
      source_url: 'https://example.com/product',
      scraped_at: '2025-12-23',
      price: {
        amount: 299.99,
        currency: 'USD',
      },
      availability: 'in-stock',
      rack_units: '4U',
      dimensions: {
        width_mm: 482,
        height_mm: 177,
        depth_mm: 450,
        weight_kg: 8.5,
        volume_liters: null,
      },
      motherboard_support: ['ATX'],
      cpu_cooler: {
        max_height_mm: 150,
      },
      fan_mounts: [],
      radiator_support: [],
      drive_bays: [],
      total_25_bays: 0,
      total_35_bays: 0,
      total_525_bays: 0,
      has_hot_swap: false,
      expansion_slots: [],
      total_pcie_slots: 0,
      has_full_height_slots: false,
      gpu_support: {
        max_length_mm: 350,
        max_height_mm: null,
      },
      psu_support: {
        types: ['ATX'],
        max_length_mm: 180,
      },
      psu_included: false,
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: 0,
        usb_type_a_3_1: 0,
        usb_type_c: 0,
        audio_jack: false,
        mic_jack: false,
        power_button: true,
        reset_button: false,
      },
      features: [],
    };

    it('returns valid result with no warnings for complete product', () => {
      const result = validateAndWarn(validProduct);
      expect(result.valid).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('returns warnings for missing optional fields', () => {
      const productWithMissingFields = {
        ...validProduct,
        source_url: '',
        price: null,
        dimensions: { ...validProduct.dimensions, depth_mm: null },
        motherboard_support: [],
      };
      const result = validateAndWarn(productWithMissingFields);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('Missing source_url');
      expect(result.warnings).toContain('Missing price');
      expect(result.warnings).toContain('Missing depth_mm');
      expect(result.warnings).toContain('No motherboard support listed');
    });

    it('returns errors for invalid product', () => {
      const invalidProduct = {
        ...validProduct,
        rack_units: 'INVALID',
      };
      const result = validateAndWarn(invalidProduct);
      expect(result.valid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateProduct', () => {
    const validProduct = {
      id: 'test-product-1',
      model: 'TEST-1000',
      brand: 'TestBrand',
      name: 'Test Product',
      source: 'inter-tech.de',
      source_url: 'https://example.com/product',
      scraped_at: '2025-12-23',
      price: null,
      availability: 'unknown',
      rack_units: '4U',
      dimensions: {
        width_mm: null,
        height_mm: null,
        depth_mm: null,
        weight_kg: null,
      },
      motherboard_support: [],
      cpu_cooler: {
        max_height_mm: null,
      },
      fan_mounts: [],
      radiator_support: [],
      drive_bays: [],
      total_25_bays: 0,
      total_35_bays: 0,
      total_525_bays: 0,
      has_hot_swap: false,
      expansion_slots: [],
      total_pcie_slots: 0,
      has_full_height_slots: false,
      gpu_support: {
        max_length_mm: null,
        max_height_mm: null,
      },
      psu_support: {
        types: ['ATX'],
        max_length_mm: null,
      },
      psu_included: false,
      front_io: {
        usb_type_a_2_0: 0,
        usb_type_a_3_0: 0,
        usb_type_a_3_1: 0,
        usb_type_c: 0,
        audio_jack: false,
        mic_jack: false,
        power_button: false,
        reset_button: false,
      },
      features: [],
    };

    it('returns validated product for valid input', () => {
      const result = validateProduct(validProduct, 'test.md');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-product-1');
    });

    it('returns null for invalid product', () => {
      const invalidProduct = { ...validProduct, rack_units: 'INVALID' };
      const result = validateProduct(invalidProduct, 'test.md');
      expect(result).toBeNull();
    });
  });
});
