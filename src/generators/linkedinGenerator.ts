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

return posts.map((p) => {
  const hook = p.hook ?? '';
  const body = p.body ?? '';
  const cta = p.cta ?? '';
  const fullPost = p.fullPost ?? `${hook}\n\n${body}\n\n${cta}`.trim();

  return {
    hook,
    body,
    cta,
    fullPost,
    hashtags: p.hashtags ?? [],
    characterCount: p.characterCount ?? fullPost.length,
  };
});
}
