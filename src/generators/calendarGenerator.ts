// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Content Calendar Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, ContentCalendar, CalendarEntry, ContentPillar, ContentChannel, ContentStatus } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';
import { CONTENT_PILLARS } from '../config/brand';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For content calendars, return a JSON object with this schema:
{
  "generatedAt": "ISO date string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "string",
      "channel": "LinkedIn | Blog | Email | Google Business Profile | Video Script | Cold Email",
      "topic": "string (working title for the content)",
      "pillar": "one of the 8 CleanReach content pillars",
      "cta": "string",
      "status": "Generated"
    }
  ]
}

Return ONLY valid JSON. No markdown, no commentary.`;

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export async function generateContentCalendar(
  startDate?: string,
  topics?: string[]
): Promise<ContentCalendar> {
  const start = startDate ?? getStartOfWeek();
  const topicsList =
    topics?.join('\n- ') ??
    CONTENT_PILLARS.map((p) => `Topics related to: ${p}`).join('\n- ');

  const promptTemplate = loadPrompt('content-calendar', {
    START_DATE: start,
    TOPICS_LIST: topicsList,
    TOPIC: '',
    PILLAR: '',
    CORE_INSIGHT: '',
    TARGET_AUDIENCE: '',
    CTA: '',
  });

  const userPrompt = `${promptTemplate}

Generate a full 30-day content calendar starting from ${start}. Include at least:
- 90+ LinkedIn posts (3 per day is too many — aim for ~3 per week)
- 4 blog articles
- 4 email newsletters
- 8–10 GBP posts
- 4 video scripts
- Mix the 8 content pillars evenly across the month

Return the calendar as a JSON object. The entries array should have approximately 35–45 entries covering 30 days.`;

  const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);

  type RawCalendar = {
    generatedAt?: string;
    startDate: string;
    endDate: string;
    entries: Array<{
      date: string;
      dayOfWeek?: string;
      channel: string;
      topic: string;
      pillar: string;
      cta: string;
      status?: string;
    }>;
  };

  const calendar = parseJsonFromAI<RawCalendar>(raw);

  // Normalise entries
  const entries: CalendarEntry[] = calendar.entries.map((e) => ({
    date: e.date,
    channel: e.channel as ContentChannel,
    topic: e.topic,
    pillar: e.pillar as ContentPillar,
    cta: e.cta,
    status: 'Generated' as ContentStatus,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: calendar.startDate ?? start,
    endDate: calendar.endDate ?? '',
    entries,
  };
}
