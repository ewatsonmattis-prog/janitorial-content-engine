// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Google Business Profile Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, GbpPost } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For Google Business Profile posts, return one JSON object. Each object must have:
{
  "type": "Service Highlight | Social Proof | Local Authority",
  "body": "string (under 1500 characters)",
  "cta": "string",
  "characterCount": number,
  "keywords": ["string"]
}

Return ONLY valid JSON. No markdown, no commentary.`;

export async function generateGbpPosts(
  input: ContentInput
): Promise<GbpPost[]> {
  const promptTemplate = loadPrompt(
    'google-business-post',
    buildVariables(input)
  );

  const userPrompt = `${promptTemplate}

Return ONE valid JSON object only. Each must be under 1,500 characters and ready to publish. Use [CITY] as a placeholder for location. Include commercial cleaning keywords naturally.`;

  const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);
  type RawGbp = {
    type?: string;
    body: string;
    cta: string;
    characterCount: number;
    keywords: string[];
  };

const parsed = parseJsonFromAI<RawGbp | RawGbp[]>(raw);
const posts = Array.isArray(parsed) ? parsed : [parsed];

return posts.map((p) => ({
  body: p.body ?? '',
  cta: p.cta ?? '',
  characterCount: p.characterCount ?? (p.body?.length ?? 0),
  keywords: p.keywords ?? [],
}));
}
