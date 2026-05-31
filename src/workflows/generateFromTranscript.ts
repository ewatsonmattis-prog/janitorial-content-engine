#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Generate From Transcript
// Usage: npm run generate:transcript
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig, config } from '../config/env';
import { ContentInput, ContentPillar } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';
import { pushContentToAirtable } from '../data/airtable';
import { saveContentPackToNotion } from '../data/notion';

const EXAMPLE_TRANSCRIPT = `
So the thing I see cleaning company owners getting wrong all the time with cold email
is that they're sending the same message to everyone. Like, they'll send the same email
to a facilities manager at a school as they do to an office manager at a tech company.
And the problem is those two people have completely different concerns.

The facilities manager at a school is worried about compliance, health and safety,
maybe DBS checks if staff are on site during school hours. The office manager at a tech company
wants reliability — they don't want to be chasing you, they just want it done.

So what works is segmenting before you write a single word. You pick one vertical,
you understand their specific pain, and you write specifically to that. When we do this
with our clients we see response rates of three to five percent, which in cold email
is actually really solid.

The other thing — and this is the one people miss — is the subject line. Most cleaning companies
write subject lines like "Commercial Cleaning Services for [Company]". That's terrible.
Nobody opens that. What works is something specific that sounds human. Like
"Cleaning at [City] offices" or even just asking a question like
"Quick question about your current cleaning setup". Curiosity opens. Sales pitches don't.
`;

interface TranscriptExtraction {
  topic: string;
  pillar: ContentPillar;
  coreInsight: string;
  targetAudience: string;
  cta: string;
  linkedInAngles: string[];
  blogTitleIdea: string;
  emailSubjectLine: string;
  coldEmailOpeningLines: string[];
}

async function extractFromTranscript(
  transcript: string
): Promise<ContentInput> {
  console.log('🔍 Analysing transcript...');

  const promptTemplate = loadPrompt('transcript-repurposing', {
    TRANSCRIPT: transcript,
    TOPIC: '',
    PILLAR: '',
    CORE_INSIGHT: '',
    TARGET_AUDIENCE: '',
    CTA: '',
  });

  const systemPrompt = `${CLEANREACH_SYSTEM_PROMPT}

Extract content from the transcript and return ONLY a JSON object with this exact schema:
{
  "topic": "string (clear, specific title)",
  "pillar": "one of: Winning Commercial Cleaning Contracts | Local SEO for Cleaning Companies | Google Business Profile Optimisation | Cold Email Lead Generation | Cleaning Business Growth | Sales Follow-Up and Conversion | Facilities Manager Buyer Psychology | Commercial Cleaning Website Conversion",
  "coreInsight": "string (2-3 sentences summarising the key insight)",
  "targetAudience": "string (specific segment)",
  "cta": "string (suggested CTA)",
  "linkedInAngles": ["string", "string", "string"],
  "blogTitleIdea": "string",
  "emailSubjectLine": "string",
  "coldEmailOpeningLines": ["string", "string"]
}

Return ONLY valid JSON.`;

  const raw = await aiComplete(systemPrompt, promptTemplate);
  const extracted = parseJsonFromAI<TranscriptExtraction>(raw);

  console.log(`\n📌 Extracted topic: "${extracted.topic}"`);
  console.log(`   Pillar: ${extracted.pillar}`);
  console.log(`   Core insight: ${extracted.coreInsight.slice(0, 80)}...`);

  return {
    topic: extracted.topic,
    pillar: extracted.pillar,
    sourceType: 'Transcript',
    transcript,
    coreInsight: extracted.coreInsight,
    targetAudience: extracted.targetAudience,
    cta: extracted.cta,
  };
}

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Generate From Transcript');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Get transcript from file path arg or use example
  const args = process.argv.slice(2);
  let transcript = EXAMPLE_TRANSCRIPT;

  if (args[0] && fs.existsSync(args[0])) {
    transcript = fs.readFileSync(path.resolve(args[0]), 'utf-8');
    console.log(`📄 Loaded transcript from: ${args[0]}`);
    console.log(`   Length: ${transcript.split(' ').length} words\n`);
  } else {
    console.log('📄 Using example transcript');
    console.log('   Tip: Pass a .txt file path: npm run generate:transcript -- ./my-transcript.txt\n');
  }

  try {
    // 1. Extract content brief from transcript
    const input = await extractFromTranscript(transcript);

    // 2. Generate full content pack
    const pack = await generateContentPack(input);

    // 3. Export
    console.log('📁 Exporting content...');
    const exportResult = await exportContentPack(pack, {
      outputDir: config.output.dir,
      formats: ['markdown', 'csv', 'json'],
    });

    console.log(`\n✅ Export complete: ${exportResult.exportedFiles.length} files`);
    exportResult.exportedFiles.forEach((f) => console.log(`   → ${f}`));

    // 4. Airtable sync
    if (config.airtable.apiKey && config.airtable.baseId) {
      try {
        const recordId = await pushContentToAirtable(pack);
        console.log(`✅ Airtable: ${recordId}`);
      } catch (err) {
        console.warn('⚠️  Airtable sync failed:', err instanceof Error ? err.message : err);
      }
    }

    // 5. Notion sync
    if (config.notion.apiKey && config.notion.databaseId) {
      try {
        const pageIds = await saveContentPackToNotion(pack);
        console.log(`✅ Notion: ${pageIds.length} pages created`);
      } catch (err) {
        console.warn('⚠️  Notion sync failed:', err instanceof Error ? err.message : err);
      }
    }

    console.log('\n🎉 Transcript repurposed into full content pack!');
    console.log(`   Pack ID: ${pack.id}`);
  } catch (err) {
    console.error('\n❌ Failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
