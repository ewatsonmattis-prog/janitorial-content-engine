#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Generate From Topic
// Usage: npm run generate:topic
// ─────────────────────────────────────────────────────────────

import { validateConfig, config } from '../config/env';
import { ContentInput, ContentPillar } from '../config/types';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';
import { pushContentToAirtable } from '../data/airtable';
import { saveContentPackToNotion } from '../data/notion';
import { CONTENT_PILLARS } from '../config/brand';
import { createContact } from '../utils/ghlClient';

// ─── Example / Default Input ─────────────────────────────────
// Replace this or pass via CLI args / environment variables

const EXAMPLE_INPUT: ContentInput = {
  topic: 'How commercial cleaning companies can win facilities manager contracts through cold email',
  pillar: 'Cold Email Lead Generation',
  sourceType: 'Manual Topic',
  coreInsight:
    'Facilities managers shortlist cleaning contractors based on responsiveness and specificity — generic outreach gets ignored. A 3-email sequence that references their industry, building size, and cleaning frequency converts at 3–5x the rate of a generic pitch.',
  targetAudience: 'Facilities managers in offices, healthcare, and education',
  cta: 'Book a free cold email strategy call at api.leadconnectorhq.com/widget/bookings/call-with-cleanreach',
};

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Generate From Topic');
  console.log('─────────────────────────────────────────\n');

  // Validate environment
  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Get input from CLI args or use default
  const args = process.argv.slice(2);
  let input = EXAMPLE_INPUT;

  if (args[0]) {
    input = {
      ...EXAMPLE_INPUT,
      topic: args[0],
      pillar: (args[1] as ContentPillar) ?? EXAMPLE_INPUT.pillar,
    };
    console.log(`📌 Topic from CLI: "${input.topic}"\n`);
  } else {
    console.log(`📌 Using example topic: "${input.topic}"\n`);
    console.log(
      'Tip: Pass a topic as argument: npm run generate:topic -- "Your topic here"\n'
    );
  }

  try {
    // 1. Generate content pack
    const pack = await generateContentPack(input);

    // 2. Export to files
    console.log('📁 Exporting content...');
    const exportResult = await exportContentPack(pack, {
      outputDir: config.output.dir,
      formats: ['markdown', 'csv', 'json'],
    });

    console.log(`\n✅ Export complete: ${exportResult.exportedFiles.length} files`);
    exportResult.exportedFiles.forEach((f) => console.log(`   → ${f}`));

    // 3. Sync to Airtable (if configured)
    if (config.airtable.apiKey && config.airtable.baseId) {
      try {
        console.log('\n📊 Syncing to Airtable...');
        const recordId = await pushContentToAirtable(pack);
        console.log(`✅ Airtable record: ${recordId}`);
      } catch (err) {
        console.warn('⚠️  Airtable sync failed:', err instanceof Error ? err.message : err);
      }
    }

    // 4. Sync to Notion (if configured)
    if (config.notion.apiKey && config.notion.databaseId) {
      try {
        console.log('\n📓 Syncing to Notion...');
        const pageIds = await saveContentPackToNotion(pack);
        console.log(`✅ Notion pages created: ${pageIds.length}`);
      } catch (err) {
        console.warn('⚠️  Notion sync failed:', err instanceof Error ? err.message : err);
      }
    }
if (config.ghl.apiKey && config.ghl.locationId) {
  console.log('\n✅ GoHighLevel connection ready.');
}
    console.log('\n🎉 Content pack ready for review!');
    console.log(`   Pack ID: ${pack.id}`);
    console.log(`   Topic: ${pack.input.topic}`);
    console.log(`   LinkedIn posts: ${pack.linkedInPosts.length}`);
    console.log(`   Blog words: ${pack.blogArticle.wordCount}`);
    console.log(`   GBP posts: ${pack.gbpPosts.length}`);
    console.log(`   Video scripts: ${pack.videoScripts.length}`);
    console.log(`   Cold email angles: ${pack.coldEmailAngles.length}`);
  } catch (err) {
    console.error('\n❌ Generation failed:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
