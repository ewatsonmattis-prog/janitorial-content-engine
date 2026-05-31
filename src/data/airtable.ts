// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Airtable Integration
// ─────────────────────────────────────────────────────────────

import { config } from '../config/env';
import {
  ContentInput,
  ContentPack,
  AirtableRecord,
  ContentPillar,
  SourceType,
  ContentStatus,
} from '../config/types';

// Lazy-load Airtable to avoid errors if not configured
async function getBase() {
  const Airtable = (await import('airtable')).default;
  Airtable.configure({ apiKey: config.airtable.apiKey });
  return Airtable.base(config.airtable.baseId);
}

/**
 * Pulls all unprocessed topics from Airtable.
 * Returns records where Status is empty or "Generated".
 */
export async function pullTopicsFromAirtable(): Promise<
  { record: AirtableRecord; input: ContentInput }[]
> {
  if (!config.airtable.apiKey || !config.airtable.baseId) {
    throw new Error(
      'Airtable not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env'
    );
  }

  const base = await getBase();
  const results: { record: AirtableRecord; input: ContentInput }[] = [];

  await new Promise<void>((resolve, reject) => {
    base(config.airtable.tableName)
      .select({
        filterByFormula: "OR({Status} = '', {Status} = 'Pending')",
        maxRecords: 50,
      })
      .eachPage(
        (records, fetchNextPage) => {
          for (const record of records) {
            const fields = record.fields as AirtableRecord['fields'];
            const input: ContentInput = {
              topic: String(fields.Topic ?? ''),
              pillar: (fields.Pillar ?? 'Cleaning Business Growth') as ContentPillar,
              sourceType: (fields['Source Type'] ?? 'Airtable') as SourceType,
              transcript: fields.Transcript
                ? String(fields.Transcript)
                : undefined,
              coreInsight: fields['Core Insight']
                ? String(fields['Core Insight'])
                : undefined,
              targetAudience: fields['Target Audience']
                ? String(fields['Target Audience'])
                : undefined,
              cta: fields.CTA ? String(fields.CTA) : undefined,
              airtableRecordId: record.id,
            };

            results.push({
              record: { id: record.id, fields },
              input,
            });
          }
          fetchNextPage();
        },
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
  });

  console.log(`[Airtable] Pulled ${results.length} topics`);
  return results;
}

/**
 * Pushes generated content pack back into the Airtable record.
 */
export async function pushContentToAirtable(
  pack: ContentPack
): Promise<string> {
  if (!config.airtable.apiKey || !config.airtable.baseId) {
    throw new Error('Airtable not configured.');
  }

  const base = await getBase();
  const recordId = pack.airtableRecordId ?? pack.input.airtableRecordId;

  const fields: Partial<AirtableRecord['fields']> = {
    Status: 'Generated' as ContentStatus,
    'LinkedIn Posts': pack.linkedInPosts
      .map(
        (p, i) =>
          `--- POST ${i + 1} ---\n${p.fullPost}\n\nHashtags: ${p.hashtags.join(' ')}`
      )
      .join('\n\n'),
    'Blog Article': pack.blogArticle.fullMarkdown,
    'Email Newsletter': `Subject: ${pack.emailNewsletter.subjectLine}\nPreview: ${pack.emailNewsletter.previewText}\n\n${pack.emailNewsletter.body}`,
    'GBP Posts': pack.gbpPosts
      .map(
        (p, i) =>
          `--- POST ${i + 1} ---\n${p.body}\n\n${p.cta}\n\nChars: ${p.characterCount}`
      )
      .join('\n\n'),
    'Video Scripts': pack.videoScripts
      .map(
        (s, i) =>
          `--- SCRIPT ${i + 1}: ${s.platform} ---\n${s.fullScript}`
      )
      .join('\n\n'),
    'Cold Email Angles': pack.coldEmailAngles
      .map(
        (e, i) =>
          `--- ANGLE ${i + 1} ---\nSubject: ${e.subjectLine}\n${e.fullEmail}`
      )
      .join('\n\n'),
    'SEO Keywords': `Primary: ${pack.blogArticle.seo.primaryKeyword}\nSecondary: ${pack.blogArticle.seo.secondaryKeywords.join(', ')}\nMeta: ${pack.blogArticle.seo.metaTitle}`,
  };

  if (recordId) {
    // Update existing record
    await new Promise<void>((resolve, reject) => {
      base(config.airtable.tableName).update(
        recordId,
        fields,
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log(`[Airtable] Updated record ${recordId}`);
    return recordId;
  } else {
    // Create new record
    const created = await new Promise<string>((resolve, reject) => {
      base(config.airtable.tableName).create(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({
          Topic: pack.input.topic,
          Pillar: pack.input.pillar,
          'Source Type': pack.input.sourceType,
          ...fields,
        }) as any,
        (err: Error | null, record: { id: string } | undefined) => {
          if (err) reject(err);
          else resolve(record?.id ?? '');
        }
      );
    });
    console.log(`[Airtable] Created new record ${created}`);
    return created;
  }
}

/**
 * Updates the status of a content record in Airtable.
 */
export async function updateAirtableStatus(
  recordId: string,
  status: ContentStatus
): Promise<void> {
  const base = await getBase();

  await new Promise<void>((resolve, reject) => {
    base(config.airtable.tableName).update(
      recordId,
      { Status: status },
      (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  console.log(`[Airtable] Status updated to "${status}" for ${recordId}`);
}
