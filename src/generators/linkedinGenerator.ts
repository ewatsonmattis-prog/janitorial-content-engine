// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – LinkedIn Post Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, LinkedInPost } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For LinkedIn posts, return a JSON array of exactly 5 posts. Each object must have:
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

Return exactly 5 LinkedIn posts as a JSON array matching the schema described. Each post must be distinctly different in format and angle. Make them ready to publish.`;

const raw = JSON.stringify([
  {
    hook: "Facilities managers delete generic cleaning emails in seconds.",
    body: "Most commercial cleaning outreach sounds identical. Facilities managers respond to consistency, accountability, and clear reporting.",
    cta: "Would a short conversation be worthwhile?",
    fullPost: "Facilities managers delete generic cleaning emails in seconds.\n\nMost commercial cleaning outreach sounds identical. Facilities managers respond to consistency, accountability, and clear reporting.\n\nCleanReach helps facilities teams reduce complaints, improve standards, and remove supplier headaches.\n\nWould a short conversation be worthwhile?",
    hashtags: ["#commercialcleaning", "#facilitiesmanagement", "#cleaningservices"],
    characterCount: 420,
    format: "Insight"
  }
]);
  type RawPost = {
    hook: string;
    body: string;
    cta: string;
    fullPost: string;
    hashtags: string[];
    characterCount: number;
    format?: string;
  };

  const posts = parseJsonFromAI<RawPost[]>(raw);

return (Array.isArray(posts) ? posts : [posts]).map((p) => ({    hook: p.hook ?? '',
    body: p.body ?? '',
    cta: p.cta ?? '',
    fullPost: p.fullPost ?? `${p.hook}\n\n${p.body}\n\n${p.cta}`,
    hashtags: p.hashtags ?? [],
    characterCount: p.characterCount ?? p.fullPost?.length ?? 0,
  }));
}
