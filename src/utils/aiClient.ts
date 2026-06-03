// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – AI Client
// Supports Anthropic (Claude) and OpenAI as providers
// ─────────────────────────────────────────────────────────────

import { config } from '../config/env';

interface AIResponse {
  content: string;
  tokensUsed?: number;
}

/**
 * Calls Claude (Anthropic) with the given system + user prompt.
 */
async function callAnthropic(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // Dynamic import to avoid errors if SDK not installed
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: config.ai.anthropicApiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
system: systemPrompt,
messages: [{ role: 'user', content: userPrompt }],
});
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Anthropic response');
  }

  return {
    content: textBlock.text,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/**
 * Calls GPT-4o (OpenAI) with the given system + user prompt.
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: config.ai.openaiApiKey });

  const response = await client.chat.completions.create({
    model: config.ai.openaiModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return {
    content,
    tokensUsed:
      (response.usage?.prompt_tokens ?? 0) +
      (response.usage?.completion_tokens ?? 0),
  };
}

/**
 * Main AI completion function — routes to the configured provider.
 */
export async function aiComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const provider = config.ai.provider;

  try {
    let result: AIResponse;

    if (provider === 'anthropic') {
      result = await callAnthropic(systemPrompt, userPrompt);
    } else {
      result = await callOpenAI(systemPrompt, userPrompt);
    }

    if (result.tokensUsed) {
      console.debug(`[AI] Tokens used: ${result.tokensUsed}`);
    }

    return result.content;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`AI completion failed (provider: ${provider}): ${msg}`);
  }
}

/**
 * Parses JSON from AI output — strips markdown code fences if present.
 */
export function parseJsonFromAI<T>(raw: string): T {
  let cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/```\s*$/im, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    console.error('Failed JSON from AI:', cleaned);
    throw new Error(
      `Failed to parse AI JSON output.\nRaw first 500 chars:\n${cleaned.slice(0, 500)}`
    );
  }
}
