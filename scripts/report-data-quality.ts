#!/usr/bin/env tsx
/**
 * Data Quality Report
 * 
 * Analyzes products.json and reports on field completeness
 * 
 * Usage: npm run report:quality
 */

import fs from 'node:fs';

interface QualityReport {
  totalProducts: number;
  bySource: Record<string, SourceReport>;
  fieldCompleteness: Record<string, FieldStats>;
  lowQualityProducts: LowQualityProduct[];
}

interface SourceReport {
  count: number;
  avgCompleteness: number;
  missingFields: Record<string, number>;
}

interface FieldStats {
  filled: number;
  empty: number;
  percentage: number;
}

interface LowQualityProduct {
  id: string;
  model: string;
  source: string;
  completeness: number;
  missingFields: string[];
}

function analyzeProducts(): QualityReport {
  let db;
  try {
    const fileContent = fs.readFileSync('data/products.json', 'utf-8');
    db = JSON.parse(fileContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('Error: data/products.json not found. Please run data generation first.');
      process.exit(1);
    }
    console.error('Error: Failed to parse data/products.json. The file may be corrupted.');
    process.exit(1);
  }
  
  const products = db.products;
  
  if (!products || !Array.isArray(products)) {
    console.error('Error: Invalid products.json format. Expected products array.');
    process.exit(1);
  }
  
  // Fields to check
  const fieldsToCheck = [
    { path: 'source_url' },
    { path: 'price.amount' },
    { path: 'dimensions.width_mm' },
    { path: 'dimensions.height_mm' },
    { path: 'dimensions.depth_mm' },
    { path: 'dimensions.weight_kg' },
    { path: 'motherboard_support', isArray: true },
    { path: 'cpu_cooler.max_height_mm' },
    { path: 'gpu_support.max_length_mm' },
    { path: 'psu_support.types', isArray: true },
    { path: 'total_25_bays', minValue: 0 },
    { path: 'total_35_bays', minValue: 0 },
    { path: 'drive_bays', isArray: true },
    { path: 'fan_mounts', isArray: true },
  ];
  
  const fieldCompleteness: Record<string, FieldStats> = {};
  const bySource: Record<string, SourceReport> = {};
  const lowQualityProducts: LowQualityProduct[] = [];
  
  // Initialize field stats
  for (const field of fieldsToCheck) {
    fieldCompleteness[field.path] = { filled: 0, empty: 0, percentage: 0 };
  }
  
  // Analyze each product
  for (const product of products) {
    const source = product.source;
    if (!bySource[source]) {
      bySource[source] = { count: 0, avgCompleteness: 0, missingFields: {}, totalCompleteness: 0 };
    }
    bySource[source].count++;
    
    let filledCount = 0;
    const missingFields: string[] = [];
    
    for (const field of fieldsToCheck) {
      const value = getNestedValue(product, field.path);
      const isFilled = isFieldFilled(value, field);
      
      if (isFilled) {
        fieldCompleteness[field.path].filled++;
        filledCount++;
      } else {
        fieldCompleteness[field.path].empty++;
        missingFields.push(field.path);
        bySource[source].missingFields[field.path] = 
          (bySource[source].missingFields[field.path] || 0) + 1;
      }
    }
    
    const completeness = (filledCount / fieldsToCheck.length) * 100;
    
    // Add to source total completeness for average calculation
    bySource[source].totalCompleteness += completeness;
    
    if (completeness < 50) {
      lowQualityProducts.push({
        id: product.id,
        model: product.model,
        source: product.source,
        completeness: Math.round(completeness),
        missingFields,
      });
    }
  }
  
  // Calculate percentages
  for (const field of fieldsToCheck) {
    const stats = fieldCompleteness[field.path];
    stats.percentage = Math.round((stats.filled / products.length) * 100);
  }
  
  // Calculate avg completeness per source
  for (const source of Object.keys(bySource)) {
    const report = bySource[source];
    report.avgCompleteness = report.count > 0 
      ? Math.round(report.totalCompleteness / report.count) 
      : 0;
    // Clean up temporary property
    delete (report as any).totalCompleteness;
  }
  
  return {
    totalProducts: products.length,
    bySource,
    fieldCompleteness,
    lowQualityProducts: lowQualityProducts.sort((a, b) => a.completeness - b.completeness),
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function isFieldFilled(value: any, field: { isArray?: boolean; minValue?: number }): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (field.isArray && Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number' && field.minValue !== undefined) return value >= field.minValue;
  return true;
}

function formatReport(report: QualityReport): string {
  let output = '';
  
  output += '╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                   DATA QUALITY REPORT                         ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n\n';
  
  output += `Total Products: ${report.totalProducts}\n\n`;
  
  output += '┌─────────────────────────────────────────────────────────────┐\n';
  output += '│                    FIELD COMPLETENESS                       │\n';
  output += '├─────────────────────────────────────────────────────────────┤\n';
  
  const sorted = Object.entries(report.fieldCompleteness)
    .sort((a, b) => b[1].percentage - a[1].percentage);
  
  for (const [field, stats] of sorted) {
    const bar = '█'.repeat(Math.floor(stats.percentage / 5)) + 
                '░'.repeat(20 - Math.floor(stats.percentage / 5));
    output += `│ ${field.padEnd(30)} ${bar} ${stats.percentage.toString().padStart(3)}% │\n`;
  }
  
  output += '└─────────────────────────────────────────────────────────────┘\n\n';
  
  output += '┌─────────────────────────────────────────────────────────────┐\n';
  output += '│                    BY SOURCE                                │\n';
  output += '├─────────────────────────────────────────────────────────────┤\n';
  
  for (const [source, stats] of Object.entries(report.bySource)) {
    output += `│ ${source.padEnd(25)} ${stats.count.toString().padStart(5)} products        │\n`;
  }
  
  output += '└─────────────────────────────────────────────────────────────┘\n\n';
  
  if (report.lowQualityProducts.length > 0) {
    output += '⚠️  LOW QUALITY PRODUCTS (< 50% complete):\n';
    for (const product of report.lowQualityProducts.slice(0, 10)) {
      output += `   - ${product.id} (${product.completeness}%)\n`;
    }
    if (report.lowQualityProducts.length > 10) {
      output += `   ... and ${report.lowQualityProducts.length - 10} more\n`;
    }
  }
  
  return output;
}

// Run report
const report = analyzeProducts();
console.log(formatReport(report));
