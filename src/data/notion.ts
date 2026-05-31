// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Notion Integration
// ─────────────────────────────────────────────────────────────

import { config } from '../config/env';
import { ContentPack, ContentPillar } from '../config/types';

async function getClient() {
  const { Client } = await import('@notionhq/client');
  return new Client({ auth: config.notion.apiKey });
}

interface NotionPageResult {
  pageId: string;
  url: string;
}

/**
 * Creates a Notion page for each piece of content in the pack.
 * Organises by content type with appropriate properties.
 */
export async function saveContentPackToNotion(
  pack: ContentPack
): Promise<string[]> {
  if (!config.notion.apiKey || !config.notion.databaseId) {
    throw new Error(
      'Notion not configured. Set NOTION_API_KEY and NOTION_DATABASE_ID in .env'
    );
  }

  const notion = await getClient();
  const createdPageIds: string[] = [];

  const pages: Array<{
    title: string;
    contentType: string;
    channel: string;
    content: string;
    seoKeyword?: string;
  }> = [
    // Blog
    {
      title: pack.blogArticle.title,
      contentType: 'Blog Article',
      channel: 'Blog',
      content: pack.blogArticle.fullMarkdown,
      seoKeyword: pack.blogArticle.seo.primaryKeyword,
    },
    // Email
    {
      title: `Newsletter: ${pack.emailNewsletter.subjectLine}`,
      contentType: 'Email Newsletter',
      channel: 'Email',
      content: `Subject: ${pack.emailNewsletter.subjectLine}\nPreview: ${pack.emailNewsletter.previewText}\n\n${pack.emailNewsletter.body}`,
    },
    // LinkedIn posts (grouped)
    {
      title: `LinkedIn Posts: ${pack.input.topic}`,
      contentType: 'LinkedIn Posts',
      channel: 'LinkedIn',
      content: pack.linkedInPosts
        .map((p, i) => `## Post ${i + 1} (${p.characterCount} chars)\n\n${p.fullPost}\n\n${p.hashtags.join(' ')}`)
        .join('\n\n---\n\n'),
    },
    // GBP posts (grouped)
    {
      title: `GBP Posts: ${pack.input.topic}`,
      contentType: 'GBP Posts',
      channel: 'Google Business Profile',
      content: pack.gbpPosts
        .map((p, i) => `## Post ${i + 1}\n\n${p.body}\n\n**CTA:** ${p.cta}\n**Chars:** ${p.characterCount}`)
        .join('\n\n---\n\n'),
    },
    // Video scripts (grouped)
    {
      title: `Video Scripts: ${pack.input.topic}`,
      contentType: 'Video Scripts',
      channel: 'Video Script',
      content: pack.videoScripts
        .map((s, i) => `## Script ${i + 1}: ${s.platform}\n\n**Hook:** ${s.hook}\n\n${s.fullScript}`)
        .join('\n\n---\n\n'),
    },
    // Cold email angles (grouped)
    {
      title: `Cold Email Angles: ${pack.input.topic}`,
      contentType: 'Cold Email Angles',
      channel: 'Cold Email',
      content: pack.coldEmailAngles
        .map((e, i) => `## Angle ${i + 1}: ${e.subjectLine}\n\n**Target:** ${e.targetSegment}\n\n${e.fullEmail}`)
        .join('\n\n---\n\n'),
    },
  ];

  for (const page of pages) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: config.notion.databaseId },
        properties: {
          Title: {
            title: [{ type: 'text', text: { content: page.title } }],
          },
          'Content Type': {
            select: { name: page.contentType },
          },
          Pillar: {
            select: { name: pack.input.pillar as ContentPillar },
          },
          Status: {
            select: { name: 'Generated' },
          },
          CTA: {
            rich_text: [
              {
                type: 'text',
                text: { content: pack.input.cta ?? pack.ctas[0] ?? '' },
              },
            ],
          },
          Channel: {
            select: { name: page.channel },
          },
          ...(page.seoKeyword && {
            'SEO Keyword': {
              rich_text: [
                { type: 'text', text: { content: page.seoKeyword } },
              ],
            },
          }),
          'Created Date': {
            date: { start: pack.createdAt },
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: page.content.slice(0, 2000), // Notion has block limits
                  },
                },
              ],
            },
          },
        ],
      });

      createdPageIds.push(response.id);
      console.log(`[Notion] Created page: ${page.title}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Notion] Failed to create "${page.title}": ${msg}`);
    }
  }

  return createdPageIds;
}

/**
 * Updates the status of a Notion page.
 */
export async function updateNotionStatus(
  pageId: string,
  status: string
): Promise<void> {
  const notion = await getClient();

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: status } },
    },
  });

  console.log(`[Notion] Updated status to "${status}" for page ${pageId}`);
}
