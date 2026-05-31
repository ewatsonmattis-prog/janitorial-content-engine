#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Generate From CSV
// Usage: npm run generate:csv
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig, config } from '../config/env';
import { ContentInput, ContentPillar } from '../config/types';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';

// Example CSV format:
// topic,pillar,coreInsight,targetAudience,cta

const EXAMPLE_CSV_PATH = path.join(__dirname, '../../src/data/example-topics.csv');

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(csvContent: string): ContentInput[] {
  const lines = csvContent.trim().split('\n');
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ''));

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });

    return {
      topic: row['topic'] ?? '',
      pillar: (row['pillar'] as ContentPillar) ?? 'Cleaning Business Growth',
      sourceType: 'CSV',
      coreInsight: row['coreinsight'] ?? row['core_insight'] ?? undefined,
      targetAudience: row['targetaudience'] ?? row['target_audience'] ?? undefined,
      cta: row['cta'] ?? undefined,
    } satisfies ContentInput;
  }).filter((input) => input.topic.length > 0);
}

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Generate From CSV');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const csvPath = args[0] ?? EXAMPLE_CSV_PATH;

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.log('\nCreate a CSV with these headers:');
    console.log('topic,pillar,coreInsight,targetAudience,cta');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const inputs = parseCsv(csvContent);

  console.log(`📋 Found ${inputs.length} topics in CSV\n`);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    console.log(`\n[${i + 1}/${inputs.length}] Processing: "${input.topic}"`);

    try {
      const pack = await generateContentPack(input);
      await exportContentPack(pack, {
        outputDir: config.output.dir,
        formats: ['markdown', 'json'],
      });
      console.log(`   ✅ Pack ${pack.id.slice(0, 8)} generated`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\n🎉 CSV batch processing complete!');
}

main();
