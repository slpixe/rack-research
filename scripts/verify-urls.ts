#!/usr/bin/env tsx
/**
 * URL Verification Script
 *
 * Verifies that generated URLs are accessible by making HTTP requests.
 * Reports success rates and lists broken URLs for investigation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UrlMapping {
  [key: string]: string;
}

interface VerificationResult {
  url: string;
  status: number | null;
  accessible: boolean;
  error?: string;
}

interface SourceResults {
  source: string;
  total: number;
  accessible: number;
  inaccessible: number;
  results: VerificationResult[];
}

/**
 * Check if a URL is accessible
 */
async function verifyUrl(url: string): Promise<VerificationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to avoid downloading full content
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URL-Verifier/1.0)',
      },
    });

    clearTimeout(timeoutId);

    const accessible = response.ok; // 200-299 status codes
    return {
      url,
      status: response.status,
      accessible,
    };
  } catch (error) {
    // If HEAD fails, try GET (some servers don't support HEAD)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Verifier/1.0)',
        },
      });

      clearTimeout(timeoutId);

      return {
        url,
        status: response.status,
        accessible: response.ok,
      };
    } catch (getError) {
      const errorMessage = getError instanceof Error ? getError.message : 'Unknown error';
      return {
        url,
        status: null,
        accessible: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Verify URLs for a single source with rate limiting
 */
async function verifySourceUrls(
  sourceName: string,
  mappings: UrlMapping,
  delayMs = 500
): Promise<SourceResults> {
  console.log(`\n🔍 Verifying ${sourceName}...`);

  const results: VerificationResult[] = [];
  const urls = Object.values(mappings);
  let accessible = 0;
  let inaccessible = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    // Add delay between requests to be respectful
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const result = await verifyUrl(url);
    results.push(result);

    if (result.accessible) {
      accessible++;
      console.log(`  ✓ [${result.status}] ${url}`);
    } else {
      inaccessible++;
      console.log(`  ✗ [${result.status || 'ERROR'}] ${url} ${result.error ? `(${result.error})` : ''}`);
    }
  }

  return {
    source: sourceName,
    total: urls.length,
    accessible,
    inaccessible,
    results,
  };
}

/**
 * Load URL mappings for all sources
 */
function loadAllMappings(resourcesDir: string): Record<string, UrlMapping> {
  const allMappings: Record<string, UrlMapping> = {};
  const sources = fs.readdirSync(resourcesDir);

  for (const source of sources) {
    const sourceDir = path.join(resourcesDir, source);
    if (!fs.statSync(sourceDir).isDirectory()) continue;

    const mappingFile = path.join(sourceDir, 'url-mappings.json');
    if (fs.existsSync(mappingFile)) {
      try {
        const content = fs.readFileSync(mappingFile, 'utf-8');
        allMappings[source] = JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  Failed to load mappings for ${source}: ${error}`);
      }
    }
  }

  return allMappings;
}

/**
 * Generate verification report
 */
function generateReport(allResults: SourceResults[]): void {
  console.log('\n📊 Verification Summary\n');
  console.log('═'.repeat(80));

  let totalUrls = 0;
  let totalAccessible = 0;
  let totalInaccessible = 0;

  for (const sourceResult of allResults) {
    totalUrls += sourceResult.total;
    totalAccessible += sourceResult.accessible;
    totalInaccessible += sourceResult.inaccessible;

    const percentage = ((sourceResult.accessible / sourceResult.total) * 100).toFixed(1);
    const status = sourceResult.accessible === sourceResult.total ? '✅' : '⚠️';

    console.log(
      `${status} ${sourceResult.source.padEnd(25)} ${sourceResult.accessible}/${sourceResult.total} (${percentage}%)`
    );
  }

  console.log('═'.repeat(80));

  const totalPercentage = ((totalAccessible / totalUrls) * 100).toFixed(1);
  console.log(`\n📈 Overall: ${totalAccessible}/${totalUrls} URLs accessible (${totalPercentage}%)`);

  // List broken URLs
  console.log('\n❌ Inaccessible URLs:\n');
  let brokenCount = 0;

  for (const sourceResult of allResults) {
    const broken = sourceResult.results.filter((r) => !r.accessible);
    if (broken.length > 0) {
      console.log(`\n${sourceResult.source}:`);
      for (const result of broken) {
        brokenCount++;
        console.log(`  - [${result.status || 'ERROR'}] ${result.url}`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      }
    }
  }

  if (brokenCount === 0) {
    console.log('  None! All URLs are accessible. 🎉');
  }

  console.log('\n═'.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  const resourcesDir = path.join(__dirname, '..', 'resources');

  console.log('🔗 URL Verification Tool');
  console.log('This will check if generated URLs are accessible.\n');
  console.log('⏱️  This may take several minutes due to rate limiting...');

  const allMappings = loadAllMappings(resourcesDir);
  const sources = Object.keys(allMappings);

  if (sources.length === 0) {
    console.log('❌ No URL mappings found!');
    process.exit(1);
  }

  console.log(`\n📋 Found ${sources.length} sources with URL mappings:`);
  for (const source of sources) {
    console.log(`   - ${source}: ${Object.keys(allMappings[source]).length} URLs`);
  }

  const allResults: SourceResults[] = [];

  for (const source of sources) {
    const results = await verifySourceUrls(source, allMappings[source]);
    allResults.push(results);
  }

  generateReport(allResults);

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'url-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
