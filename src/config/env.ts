// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Environment Config
// ─────────────────────────────────────────────────────────────

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  ai: {
    provider: optional('AI_PROVIDER', 'anthropic') as 'anthropic' | 'openai',
    anthropicApiKey: optional('ANTHROPIC_API_KEY'),
    openaiApiKey: optional('OPENAI_API_KEY'),
    openaiModel: optional('OPENAI_MODEL', 'gpt-4o'),
  },
  airtable: {
    apiKey: optional('AIRTABLE_API_KEY'),
    baseId: optional('AIRTABLE_BASE_ID'),
    tableName: optional('AIRTABLE_TABLE_NAME', 'Content Topics'),
  },
  notion: {
    apiKey: optional('NOTION_API_KEY'),
    databaseId: optional('NOTION_DATABASE_ID'),
  },
  webhook: {
    port: parseInt(optional('WEBHOOK_PORT', '3001'), 10),
    secret: optional('WEBHOOK_SECRET', 'changeme'),
  },
  output: {
    dir: optional('OUTPUT_DIR', './outputs'),
    format: optional('EXPORT_FORMAT', 'all'),
  },
  buffer: {
    accessToken: optional('BUFFER_ACCESS_TOKEN'),
    profileIds: optional('BUFFER_PROFILE_IDS', '').split(',').filter(Boolean),
  },
};

/**
 * Validates that the minimum required variables are present
 * for the chosen AI provider.
 */
export function validateConfig(): void {
  if (config.ai.provider === 'anthropic' && !config.ai.anthropicApiKey) {
    throw new Error(
      'AI_PROVIDER is set to "anthropic" but ANTHROPIC_API_KEY is missing.'
    );
  }
  if (config.ai.provider === 'openai' && !config.ai.openaiApiKey) {
    throw new Error(
      'AI_PROVIDER is set to "openai" but OPENAI_API_KEY is missing.'
    );
  }
}
