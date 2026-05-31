// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Content Pack Orchestrator
// Coordinates all generators to produce a full content pack
// ─────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { ContentInput, ContentPack } from '../config/types';
import { generateLinkedInPosts } from './linkedinGenerator';
import { generateBlogArticle } from './blogGenerator';
import { generateEmailNewsletter } from './emailGenerator';
import { generateGbpPosts } from './gbpGenerator';
import { generateVideoScripts } from './videoGenerator';
import { generateColdEmailAngles } from './coldEmailGenerator';
import { aiComplete } from '../utils/aiClient';
import { CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

/**
 * Generates 3 strong CTAs for the given topic/pillar.
 */
async function generateCtas(input: ContentInput): Promise<string[]> {
  const prompt = `Generate 3 distinct, specific CTAs for CleanReach content about "${input.topic}" (pillar: ${input.pillar}).

Each CTA must:
- Be under 15 words
- Be actionable and specific
- Drive cleaning company owners to take a concrete next step
- Avoid generic phrases like "learn more" or "contact us"

Return a JSON array of exactly 3 strings. No other output.`;

  const raw = await aiComplete(CLEANREACH_SYSTEM_PROMPT, prompt);
  try {
    const cleaned = raw.replace(/```(?:json)?/g, '').trim();
    return JSON.parse(cleaned) as string[];
  } catch {
    return [
      `Book a free contract acquisition strategy call at api.leadconnectorhq.com/widget/bookings/call-with-cleanreach`,
      `Download the CleanReach Commercial Contract Checklist`,
      `Get your free Google Business Profile audit from CleanReach`,
    ];
  }
}

/**
 * Orchestrates all generators to produce a complete content pack.
 * Runs generators in parallel where possible for speed.
 */
export async function generateContentPack(
  input: ContentInput
): Promise<ContentPack> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  console.log(`\n🚀 Generating content pack for: "${input.topic}"`);
  console.log(`   Pillar: ${input.pillar}`);
  console.log(`   ID: ${id}\n`);

  // Run all generators in parallel
  const [
    linkedInPosts,
    blogArticle,
    emailNewsletter,
    gbpPosts,
    videoScripts,
    coldEmailAngles,
    ctas,
  ] = await Promise.all([
    (async () => {
      console.log('  ✍️  Generating LinkedIn posts...');
      return generateLinkedInPosts(input);
    })(),
    (async () => {
      console.log('  📝 Generating blog article...');
      return generateBlogArticle(input);
    })(),
    (async () => {
      console.log('  📧 Generating email newsletter...');
      return generateEmailNewsletter(input);
    })(),
    (async () => {
      console.log('  📍 Generating GBP posts...');
      return generateGbpPosts(input);
    })(),
    (async () => {
      console.log('  🎥 Generating video scripts...');
      return generateVideoScripts(input);
    })(),
    (async () => {
      console.log('  📨 Generating cold email angles...');
      return generateColdEmailAngles(input);
    })(),
    (async () => {
      console.log('  💬 Generating CTAs...');
      return generateCtas(input);
    })(),
  ]);

  console.log('\n✅ Content pack generation complete!\n');

  return {
    id,
    createdAt,
    input,
    linkedInPosts,
    blogArticle,
    emailNewsletter,
    gbpPosts,
    videoScripts,
    coldEmailAngles,
    ctas,
    status: 'Generated',
  };
}
