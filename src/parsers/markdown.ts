/**
 * Markdown Parser
 * 
 * Parses markdown files containing product specifications
 */

import fs from 'node:fs';

export interface ParsedMarkdown {
  title: string;
  sourceUrl: string;
  scrapedAt: string;
  overview?: string;
  sku?: string;
  availability?: string;
  specifications: Record<string, string>;
  pricing: Record<string, string>;
}

export function parseMarkdownFile(filePath: string): ParsedMarkdown {
  const content = fs.readFileSync(filePath, 'utf-8');

  const result: ParsedMarkdown = {
    title: '',
    sourceUrl: '',
    scrapedAt: '',
    specifications: {},
    pricing: {},
  };

  // Extract title (first H1)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) result.title = titleMatch[1].trim();

  // Extract source URL
  const sourceMatch = content.match(/Source:\s*\[([^\]]+)\]\(([^)]+)\)/);
  if (sourceMatch) result.sourceUrl = sourceMatch[2];

  // Extract scraped date
  const scrapedMatch = content.match(/Scraped:\s*(\d{4}-\d{2}-\d{2})/);
  if (scrapedMatch) result.scrapedAt = scrapedMatch[1];

  // Extract overview
  const overviewMatch = content.match(/## Overview\s*\n\n(.+?)(?=\n\n##|\n\n\|)/s);
  if (overviewMatch) result.overview = overviewMatch[1].trim();

  // Extract SKU
  const skuMatch = content.match(/SKU:\s*(\S+)/);
  if (skuMatch) result.sku = skuMatch[1];

  // Extract availability
  const availMatch = content.match(/Status:\s*\*\*(.+?)\*\*/);
  if (availMatch) result.availability = availMatch[1];

  // Parse tables
  const tableRegex = /\|(.+?)\|(.+?)\|/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const key = match[1].trim().replace(/\*\*/g, '');
    const value = match[2].trim().replace(/\*\*/g, '');

    if (
      key === ':---' ||
      key === '---' ||
      key.includes('---') ||
      key === 'Attribute' ||
      key === 'Feature' ||
      key === 'Specification' ||
      key === 'Item' ||
      key === 'Type' ||
      key === 'Position'
    )
      continue;

    if (key === 'Case' || key === 'Shipping') {
      result.pricing[key] = value;
    } else {
      result.specifications[key] = value;
    }
  }

  // Parse bullet-point style data
  const bulletRegex = /^-\s+\*\*(.+?):\*\*\s*(.+)$/gm;
  while ((match = bulletRegex.exec(content)) !== null) {
    result.specifications[match[1].trim()] = match[2].trim();
  }

  return result;
}
