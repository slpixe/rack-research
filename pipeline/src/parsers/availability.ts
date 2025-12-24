/**
 * Availability Parser
 * 
 * Parses product availability status
 */

import type { AvailabilityStatus } from '../schema/types.js';

export function parseAvailability(value: string): AvailabilityStatus {
  const lowered = value.toLowerCase();

  if (lowered.includes('in stock') || lowered.includes('available immediately')) return 'in-stock';
  if (lowered.includes('out of stock') || lowered.includes('sold out')) return 'out-of-stock';
  if (lowered.includes('pre-order') || lowered.includes('preorder')) return 'pre-order';
  if (lowered.includes('discontinued')) return 'discontinued';
  if (lowered.includes('contact') || lowered.includes('quote')) return 'contact-for-quote';

  return 'unknown';
}
