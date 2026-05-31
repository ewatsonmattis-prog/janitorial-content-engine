#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Webhook Server (n8n compatible)
// Usage: npm run webhook:start
// Exposes HTTP endpoints for n8n workflows to trigger
// ─────────────────────────────────────────────────────────────

// Use require for express to avoid ESM/CJS interop issues with strict typing
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express') as typeof import('express');

import { Request, Response, NextFunction } from 'express';
import { validateConfig, config } from '../config/env';
import { ContentInput, ContentPillar, ContentStatus } from '../config/types';
import { generateContentPack } from '../generators/contentPackGenerator';
import { exportContentPack } from '../exports/exportSystem';
import { pushContentToAirtable } from '../data/airtable';
import { saveContentPackToNotion } from '../data/notion';

const app = express();
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────

function requireSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'] ?? req.query['secret'];
  if (secret !== config.webhook.secret) {
    res.status(401).json({ error: 'Unauthorised' });
    return;
  }
  next();
}

// ─── Health Check ─────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'cleanreach-content-engine',
    timestamp: new Date().toISOString(),
  });
});

// ─── Endpoint: Generate from topic ───────────────────────────
// n8n trigger: HTTP Request node → POST /webhook/generate-topic

app.post('/webhook/generate-topic', requireSecret, async (req: Request, res: Response) => {
  const { topic, pillar, coreInsight, targetAudience, cta, airtableRecordId } =
    req.body as Partial<ContentInput>;

  if (!topic) {
    res.status(400).json({ error: 'topic is required' });
    return;
  }

  console.log(`[Webhook] generate-topic: "${topic}"`);

  try {
    const input: ContentInput = {
      topic,
      pillar: (pillar as ContentPillar) ?? 'Cleaning Business Growth',
      sourceType: 'Airtable',
      coreInsight,
      targetAudience,
      cta,
      airtableRecordId,
    };

    const pack = await generateContentPack(input);
    await exportContentPack(pack, { outputDir: config.output.dir, formats: ['markdown', 'json'] });

    const results: Record<string, unknown> = {};

    if (config.airtable.apiKey) {
      try {
        results.airtableRecordId = await pushContentToAirtable(pack);
      } catch (err) {
        results.airtableError = err instanceof Error ? err.message : String(err);
      }
    }

    if (config.notion.apiKey) {
      try {
        results.notionPageIds = await saveContentPackToNotion(pack);
      } catch (err) {
        results.notionError = err instanceof Error ? err.message : String(err);
      }
    }

    res.json({
      success: true,
      packId: pack.id,
      topic: pack.input.topic,
      contentSummary: {
        linkedInPosts: pack.linkedInPosts.length,
        blogWordCount: pack.blogArticle.wordCount,
        emailSubjectLine: pack.emailNewsletter.subjectLine,
        gbpPosts: pack.gbpPosts.length,
        videoScripts: pack.videoScripts.length,
        coldEmailAngles: pack.coldEmailAngles.length,
      },
      integrations: results,
    });
  } catch (err) {
    console.error('[Webhook] generate-topic error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Endpoint: Generate from transcript ──────────────────────

app.post('/webhook/generate-transcript', requireSecret, async (req: Request, res: Response) => {
  const { transcript, topic, pillar } = req.body as {
    transcript: string;
    topic?: string;
    pillar?: string;
  };

  if (!transcript) {
    res.status(400).json({ error: 'transcript is required' });
    return;
  }

  console.log(`[Webhook] generate-transcript (${transcript.length} chars)`);

  try {
    const input: ContentInput = {
      topic: topic ?? 'Generated from transcript',
      pillar: (pillar as ContentPillar) ?? 'Cleaning Business Growth',
      sourceType: 'Transcript',
      transcript,
    };

    const pack = await generateContentPack(input);
    await exportContentPack(pack, { outputDir: config.output.dir, formats: ['markdown', 'json'] });

    res.json({ success: true, packId: pack.id, topic: pack.input.topic });
  } catch (err) {
    console.error('[Webhook] generate-transcript error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Endpoint: Update content status ─────────────────────────

app.post('/webhook/update-status', requireSecret, async (req: Request, res: Response) => {
  const { airtableRecordId, status } = req.body as {
    airtableRecordId: string;
    status: string;
  };

  if (!airtableRecordId || !status) {
    res.status(400).json({ error: 'airtableRecordId and status are required' });
    return;
  }

  try {
    const { updateAirtableStatus } = await import('../data/airtable');
    await updateAirtableStatus(airtableRecordId, status as ContentStatus);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Endpoint: Export weekly pack ────────────────────────────

app.post('/webhook/export-weekly', requireSecret, async (_req: Request, res: Response) => {
  console.log('[Webhook] export-weekly triggered');

  try {
    const { execSync } = await import('child_process');
    execSync('npx ts-node src/workflows/exportWeekly.ts', { cwd: process.cwd() });
    res.json({ success: true, message: 'Weekly export triggered' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Start ────────────────────────────────────────────────────

const PORT = config.webhook.port;

try {
  validateConfig();
} catch (err) {
  console.error('❌ Config error:', err instanceof Error ? err.message : err);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Webhook Server Running');
  console.log(`  Port: ${PORT}`);
  console.log('─────────────────────────────────────────');
  console.log('\nEndpoints:');
  console.log('  POST /webhook/generate-topic');
  console.log('  POST /webhook/generate-transcript');
  console.log('  POST /webhook/update-status');
  console.log('  POST /webhook/export-weekly');
  console.log('  GET  /health');
  console.log('\nAuthentication: x-webhook-secret header');
});
