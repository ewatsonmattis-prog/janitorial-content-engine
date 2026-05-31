#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Airtable Sync
// Usage: npm run sync:airtable
// Pulls pending topics, generates content packs, pushes back
// ─────────────────────────────────────────────────────────────

import { validateConfig, config } from '../config/env';
import { pullTopicsFromAirtable, pushContentToAirtable, updateAirtableStatus } from '../data/airtable';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Airtable Sync');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (!config.airtable.apiKey || !config.airtable.baseId) {
    console.error('❌ Airtable not configured. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to .env');
    process.exit(1);
  }

  try {
    // 1. Pull pending topics
    console.log('📊 Pulling topics from Airtable...');
    const topics = await pullTopicsFromAirtable();

    if (topics.length === 0) {
      console.log('✅ No pending topics found. Nothing to process.');
      return;
    }

    console.log(`Found ${topics.length} topic(s) to process\n`);

    // 2. Process each topic
    for (const { input, record } of topics) {
      console.log(`\n▶ Processing: "${input.topic}"`);

      try {
        // Generate content
        const pack = await generateContentPack({
          ...input,
          airtableRecordId: record.id,
        });

        // Export locally
        await exportContentPack(pack, {
          outputDir: config.output.dir,
          formats: ['markdown', 'json'],
        });

        // Push back to Airtable
        await pushContentToAirtable(pack);

        console.log(`✅ Completed: ${pack.id.slice(0, 8)}`);
      } catch (err) {
        console.error(`❌ Failed for "${input.topic}": ${err instanceof Error ? err.message : err}`);

        // Mark as needs edit in Airtable
        if (record.id) {
          try {
            await updateAirtableStatus(record.id, 'Needs Edit');
          } catch {
            // Ignore status update failures
          }
        }
      }
    }

    console.log('\n🎉 Airtable sync complete!');
  } catch (err) {
    console.error('\n❌ Sync failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
