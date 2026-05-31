// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Prompt Loader
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { ContentInput } from '../config/types';

const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

/**
 * Loads a .prompt.md file by name and injects the content input variables.
 */
export function loadPrompt(
  promptName: string,
  variables: Record<string, string> = {}
): string {
  const filePath = path.join(PROMPTS_DIR, `${promptName}.prompt.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace all {{VARIABLE}} placeholders
  for (const [key, value] of Object.entries(variables)) {
    content = content.replaceAll(`{{${key}}}`, value || 'Not specified');
  }

  return content;
}

/**
 * Builds the standard variable map from a ContentInput object.
 */
export function buildVariables(
  input: ContentInput,
  extra: Record<string, string> = {}
): Record<string, string> {
  return {
    TOPIC: input.topic,
    PILLAR: input.pillar,
    CORE_INSIGHT: input.coreInsight ?? '',
    TARGET_AUDIENCE: input.targetAudience ?? 'commercial cleaning company owners',
    CTA: input.cta ?? 'Book a free strategy call at api.leadconnectorhq.com/widget/bookings/call-with-cleanreach',
    TRANSCRIPT: input.transcript ?? '',
    ...extra,
  };
}

/**
 * The shared system prompt used for all CleanReach content generation.
 */
export const CLEANREACH_SYSTEM_PROMPT = `You are an expert content strategist and copywriter for CleanReach, a specialist growth agency that helps commercial cleaning companies win more recurring commercial contracts.

Your content serves one audience: cleaning company owners who want commercial contracts from offices, schools, healthcare facilities, property managers, and warehouses.

Rules:
1. Always focus on commercial cleaning (never domestic/residential)
2. Be direct and practical — no fluff, no hype
3. Lead with a pain point or desired outcome
4. End every piece of content with a specific, actionable CTA
5. Never use: "take your business to the next level", "unlock your potential", "game-changer", "revolutionary", "full-service agency"
6. Always use: language around winning contracts, predictable pipelines, cold outreach, and local visibility
7. Return output in the exact format requested — JSON where asked, Markdown where asked
8. Do not add commentary before or after the requested output`;
