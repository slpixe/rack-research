/**
 * Price Parser
 * 
 * Parses price information from various formats
 */

import type { Currency } from '../schema/types.js';

export interface ParsedPrice {
  amount: number | null;
  currency: Currency;
}

export function parsePrice(value: string, defaultCurrency: Currency = 'USD'): ParsedPrice {
  let currency: Currency = defaultCurrency;
  if (value.includes('€') || value.includes('EUR')) currency = 'EUR';
  if (value.includes('$') || value.includes('USD')) currency = 'USD';
  if (value.includes('£') || value.includes('GBP')) currency = 'GBP';

  const numMatch = value.match(/([\d,]+\.?\d*)/);
  if (numMatch) {
    let numStr = numMatch[1];
    if (numStr.includes(',') && !numStr.includes('.')) {
      numStr = numStr.replace(',', '.');
    } else {
      numStr = numStr.replace(',', '');
    }
    return { amount: parseFloat(numStr), currency };
  }

  return { amount: null, currency };
}
