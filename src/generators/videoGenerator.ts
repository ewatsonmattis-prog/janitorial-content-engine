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

const raw = JSON.stringify([
  {
    platform: "LinkedIn Video",
    hook: "Why facilities managers keep changing cleaning contractors",
    problem: "Missed visits and poor communication create constant frustration.",
    solution: "CleanReach delivers reliable commercial cleaning with consistent reporting and accountability.",
    proof: "Our focus is long-term service consistency and proactive communication.",
    cta: "Book a cleaning review with CleanReach.",
    fullScript: "Facilities managers tell us the same thing. Their cleaning contractor starts well but standards slip. Missed visits, inconsistent communication and poor accountability create unnecessary pressure. CleanReach was built to solve this. We provide reliable commercial cleaning, clear reporting and responsive support so you can focus on running your facility instead of chasing contractors. If you would like a review of your current cleaning arrangements, get in touch with CleanReach today.",
    durationSeconds: 60,
    onScreenTextSuggestions: [
      "Reliable Commercial Cleaning",
      "Consistent Service",
      "Clear Reporting"
    ]
  }
]);

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

  const scripts = parseJsonFromAI<RawScript[]>(raw);

  const platformMap: Record<string, VideoScript['platform']> = {
    'linkedin video': 'LinkedIn Video',
    'youtube shorts / tiktok': 'YouTube Shorts',
    'youtube shorts': 'YouTube Shorts',
    tiktok: 'YouTube Shorts',
    'instagram reels': 'Instagram Reels',
  };

 return (Array.isArray(scripts) ? scripts : [scripts]).map((s) => ({
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
