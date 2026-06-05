#!/usr/bin/env ts-node

import { validateConfig, config } from '../config/env';
import { ContentInput, ContentPillar } from '../config/types';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';
import { pushContentToAirtable } from '../data/airtable';
import { saveContentPackToNotion } from '../data/notion';
import { publishContentPackToGhlWebhook } from '../integrations/gohighlevel/contentWebhookPublisher';

const EXAMPLE_INPUT: ContentInput = {
  topic: 'Why commercial cleaning companies struggle to turn outreach into signed contracts',
  pillar: 'Cold Email Lead Generation',
  sourceType: 'Manual Topic',
  coreInsight:
    'Cleaning company owners do not need more generic leads. They need a system that builds trust, follows up consistently, and turns interest into booked sales conversations.',
  targetAudience:
    'Commercial cleaning company owners, managing directors, and growth-focused cleaning businesses',
  cta: 'Book a CleanReach growth strategy call',
};

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Generate From Topic');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

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
  }

  try {
    const pack = await generateContentPack(input);

    console.log('📁 Exporting content...');
    const exportResult = await exportContentPack(pack, {
      outputDir: config.output.dir,
      formats: ['markdown', 'csv', 'json'],
    });

    console.log(`\n✅ Export complete: ${exportResult.exportedFiles.length} files`);
    exportResult.exportedFiles.forEach((f) => console.log(`   → ${f}`));

    if (config.airtable.apiKey && config.airtable.baseId) {
      try {
        console.log('\n📊 Syncing to Airtable...');
        const recordId = await pushContentToAirtable(pack);
        console.log(`✅ Airtable record: ${recordId}`);
      } catch (err) {
        console.warn('⚠️ Airtable sync failed:', err instanceof Error ? err.message : err);
      }
    }

    if (config.notion.apiKey && config.notion.databaseId) {
      try {
        console.log('\n📓 Syncing to Notion...');
        const pageIds = await saveContentPackToNotion(pack);
        console.log(`✅ Notion pages created: ${pageIds.length}`);
      } catch (err) {
        console.warn('⚠️ Notion sync failed:', err instanceof Error ? err.message : err);
      }
    }

    if (config.ghl.contentWebhookUrl) {
      try {
        console.log('\n📨 Sending content pack to GoHighLevel webhook...');
        await publishContentPackToGhlWebhook(pack);
      } catch (err) {
        console.warn(
          '⚠️ GoHighLevel webhook publish failed:',
          err instanceof Error ? err.message : err
        );
      }
    }

    console.log('\n🎉 Content pack ready for review!');
    console.log(`Pack ID: ${pack.id}`);
    console.log(`Topic: ${pack.input.topic}`);
    console.log(`LinkedIn posts: ${pack.linkedInPosts.length}`);
    console.log(`Blog words: ${pack.blogArticle.wordCount}`);
    console.log(`GBP posts: ${pack.gbpPosts.length}`);
    console.log(`Video scripts: ${pack.videoScripts.length}`);
    console.log(`Cold email angles: ${pack.coldEmailAngles.length}`);
  } catch (err) {
    console.error('\n❌ Generation failed:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
