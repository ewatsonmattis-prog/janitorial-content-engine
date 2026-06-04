// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – LinkedIn Post Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, LinkedInPost } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For LinkedIn posts, return one JSON object. It must have:
{
  "hook": "string",
  "body": "string",
  "cta": "string",
  "fullPost": "string (hook + body + cta combined with line breaks)",
  "hashtags": ["string"],
  "characterCount": number,
  "format": "Observation | List | Story | Contrarian | HowTo"
}

Return ONLY valid JSON. No markdown, no commentary.`;

export async function generateLinkedInPosts(
  input: ContentInput
): Promise<LinkedInPost[]> {
  const promptTemplate = loadPrompt('linkedin-post', buildVariables(input));

const userPrompt = `${promptTemplate}

Return ONE valid JSON object only.
Keep body under 120 words.
No markdown. No commentary.`;
const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);
  type RawPost = {
  hook: string;
  body: string;
  cta: string;
  fullPost: string;
  hashtags: string[];
  characterCount: number;
  format?: string;
};
const parsed = parseJsonFromAI<RawPost | RawPost[]>(raw);
const posts = Array.isArray(parsed) ? parsed : [parsed];  
const safePosts = posts;
return safePosts.map((p) => ({
    hook: p.hook ?? '',
    body: p.body ?? '',
    cta: p.cta ?? '',
    fullPost: p.fullPost ?? `${p.hook}\n\n${p.body}\n\n${p.cta}`,
    hashtags: p.hashtags ?? [],
    characterCount: p.characterCount ?? p.fullPost?.length ?? 0,
  }));
}
