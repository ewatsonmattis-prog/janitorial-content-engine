#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Notion Sync
// Usage: npm run sync:notion
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig, config } from '../config/env';
import { ContentPack } from '../config/types';
import { saveContentPackToNotion } from '../data/notion';

async function loadLatestPack(outputDir: string): Promise<ContentPack | null> {
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith('content-pack-') && f.endsWith('.json'))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) return null;

  const latest = path.join(outputDir, files[0].name);
  const content = fs.readFileSync(latest, 'utf-8');
  return JSON.parse(content) as ContentPack;
}

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Notion Sync');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (!config.notion.apiKey || !config.notion.databaseId) {
    console.error('❌ Notion not configured. Add NOTION_API_KEY and NOTION_DATABASE_ID to .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let pack: ContentPack | null = null;

  if (args[0] && fs.existsSync(args[0])) {
    // Load specific pack JSON
    pack = JSON.parse(fs.readFileSync(args[0], 'utf-8')) as ContentPack;
    console.log(`📄 Loaded pack from: ${args[0]}`);
  } else {
    // Load latest pack from outputs directory
    const outputDir = config.output.dir ?? './outputs';
    pack = await loadLatestPack(outputDir);

    if (!pack) {
      console.error('❌ No content packs found. Run npm run generate:topic first.');
      process.exit(1);
    }

    console.log(`📄 Loaded latest pack: ${pack.id}`);
  }

  console.log(`   Topic: ${pack.input.topic}\n`);

  try {
    const pageIds = await saveContentPackToNotion(pack);
    console.log(`\n✅ Notion sync complete: ${pageIds.length} pages created`);
    pageIds.forEach((id) => console.log(`   → ${id}`));
  } catch (err) {
    console.error('\n❌ Notion sync failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
