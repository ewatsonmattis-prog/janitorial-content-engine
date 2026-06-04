// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Video Script Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, VideoScript } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For video scripts, return a JSON array of exactly 3 scripts. Each object must have:
{
  "platform": "LinkedIn Video | YouTube Shorts / TikTok | Instagram Reels",
  "hook": "string (under 15 words)",
  "problem": "string",
  "solution": "string",
  "proof": "string",
  "cta": "string",
  "fullScript": "string (full spoken script with rough timing notes in brackets)",
  "durationSeconds": number,
  "onScreenTextSuggestions": ["string"]
}

Return ONLY valid JSON. No markdown, no commentary.`;

export async function generateVideoScripts(
  input: ContentInput
): Promise<VideoScript[]> {
  const promptTemplate = loadPrompt('video-script', buildVariables(input));

  const userPrompt = `${promptTemplate}

Return exactly 3 video scripts as a JSON array — one per platform. Scripts should be fully written out, ready to record. Include rough timing cues in brackets. Keep total spoken time between 45–90 seconds per script.`;

  const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);
  
  type RawScript = {
    platform: VideoScript['platform'];
    hook: string;
    problem: string;
    solution: string;
    proof: string;
    cta: string;
    fullScript: string;
    durationSeconds: number;
    onScreenTextSuggestions?: string[];
  };

  const parsed = parseJsonFromAI<RawScript | RawScript[]>(raw);
  const scripts = Array.isArray(parsed) ? parsed : [parsed];
  const platformMap: Record<string, VideoScript['platform']> = {
    'linkedin video': 'LinkedIn Video',
    'youtube shorts / tiktok': 'YouTube Shorts',
    'youtube shorts': 'YouTube Shorts',
    tiktok: 'YouTube Shorts',
    'instagram reels': 'Instagram Reels',
  };

 return scripts.map((s) => ({
    hook: s.hook ?? '',
    problem: s.problem ?? '',
    solution: s.solution ?? '',
    proof: s.proof ?? '',
    cta: s.cta ?? '',
    fullScript: s.fullScript ?? '',
    durationSeconds: s.durationSeconds ?? 60,
    platform:
      platformMap[s.platform?.toLowerCase() ?? ''] ?? 'LinkedIn Video',
  }));
}
