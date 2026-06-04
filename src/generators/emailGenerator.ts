// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Email Newsletter Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, EmailNewsletter } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For email newsletters, return a JSON object with this exact schema:
{
  "subjectLine": "string (under 50 chars)",
  "previewText": "string (under 85 chars)",
  "greeting": "string",
  "body": "string (plain text, 300–400 words)",
  "cta": "string",
  "ctaUrl": "string",
  "fullHtml": "string (simple HTML email with inline styles)",
  "wordCount": number
}

The fullHtml must be a simple, mobile-friendly HTML email. Use inline styles. No images. Clean and professional.

Return ONLY valid JSON. No markdown wrapper, no commentary.`;

function buildHtmlEmail(
  subjectLine: string,
  body: string,
  cta: string,
  ctaUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; background: #ffffff;">
  <div style="border-bottom: 2px solid #2563eb; margin-bottom: 24px; padding-bottom: 16px;">
    <strong style="font-size: 18px; color: #2563eb;">CleanReach</strong>
    <span style="font-size: 13px; color: #666; margin-left: 8px;">Growth System for Commercial Cleaning Companies</span>
  </div>
  <div style="font-size: 15px; line-height: 1.7;">
    ${body.split('\n\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  </div>
  <div style="margin-top: 32px; padding: 20px; background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 4px;">
    <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 15px;">${cta}</p>
    <a href="${ctaUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Book Your Free Strategy Call →</a>
  </div>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">The CleanReach Team | <a href="https://api.leadconnectorhq.com/widget/bookings/call-with-cleanreach" style="color: #2563eb;">cleanreach.co.uk</a></p>
    <p style="margin: 4px 0 0 0;">Helping commercial cleaning companies win more contracts.</p>
  </div>
</body>
</html>`;
}

export async function generateEmailNewsletter(
  input: ContentInput
): Promise<EmailNewsletter> {
  const promptTemplate = loadPrompt('email-newsletter', buildVariables(input));

const userPrompt = `${promptTemplate}

Return ONLY valid JSON with this exact shape:
{
  "subjectLine": "",
  "previewText": "",
  "greeting": "",
  "body": "",
  "cta": "",
  "ctaUrl": "",
  "wordCount": 0
}

Do not include fullHtml.
Do not include markdown.
Do not include commentary.
Keep body to 300–400 words.`;

const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);

type RawEmail = {
  subjectLine: string;
  previewText: string;
  greeting: string;
  body: string;
  cta: string;
  ctaUrl: string;
  wordCount: number;
  fullHtml?: string;
};
console.log('EMAIL RAW RESPONSE:');
console.log(raw);
const parsed = parseJsonFromAI<RawEmail | RawEmail[]>(raw);
const email = Array.isArray(parsed) ? parsed[0] : parsed;
  // If AI didn't return valid HTML, generate it
  if (!email.fullHtml || email.fullHtml.length < 100) {
    email.fullHtml = buildHtmlEmail(
      email.subjectLine,
      `${email.greeting}\n\n${email.body}`,
      email.cta,
      email.ctaUrl || 'https://api.leadconnectorhq.com/widget/bookings/call-with-cleanreach'
    );
  }

  if (!email.wordCount) {
    email.wordCount = email.body.split(/\s+/).length;
  }

  return email as EmailNewsletter;
}
