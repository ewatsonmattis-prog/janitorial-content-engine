// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Cold Email Angle Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, ColdEmailAngle } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For cold email angles, return one JSON object. Each object must have:
{
  "format": "Pain Point Open | Credibility Open | Direct Ask",
  "subjectLine": "string (under 40 characters)",
  "openingLine": "string",
  "painPoint": "string",
  "valueProposition": "string",
  "cta": "string",
  "fullEmail": "string (complete email under 100 words with personalisation tokens)",
  "targetSegment": "string"
}

Personalisation tokens to use: [First Name], [Company], [City], [Industry]

Return ONLY valid JSON. No markdown, no commentary.`;

export async function generateColdEmailAngles(
  input: ContentInput
): Promise<ColdEmailAngle[]> {
  const promptTemplate = loadPrompt('cold-email-angle', buildVariables(input));

const userPrompt = `${promptTemplate}

Return ONLY one valid JSON object.
Do not include markdown or explanations.

Each object must use this exact shape:
{
  "format": "",
  "subjectLine": "",
  "openingLine": "",
  "painPoint": "",
  "valueProposition": "",
  "cta": "",
  "fullEmail": "",
  "targetSegment": ""
}

Keep every field under 25 words.
Keep fullEmail under 80 words.
Return one complete JSON object only.`;

  const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);

  type RawAngle = {
    format?: string;
    subjectLine: string;
    openingLine: string;
    painPoint: string;
    valueProposition: string;
    cta: string;
    fullEmail: string;
    targetSegment: string;
  };

const parsed = parseJsonFromAI<RawAngle | RawAngle[]>(raw);
const angles = Array.isArray(parsed) ? parsed : [parsed];

return angles.map((a) => ({
  subjectLine: a.subjectLine ?? '',
  openingLine: a.openingLine ?? '',
  painPoint: a.painPoint ?? '',
  valueProposition: a.valueProposition ?? '',
  cta: a.cta ?? '',
  fullEmail: a.fullEmail ?? '',
  targetSegment: a.targetSegment ?? '',
}));
}
