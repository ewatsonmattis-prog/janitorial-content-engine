// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Export System
// Exports content packs as Markdown, CSV, and JSON
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { ContentPack, ContentCalendar, ExportOptions, WeeklyExportResult } from '../config/types';
import { config } from '../config/env';

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitiseFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Markdown Exports ─────────────────────────────────────────

function exportLinkedInMarkdown(pack: ContentPack, dir: string): string {
  const slug = sanitiseFilename(pack.input.topic);
  const filename = `linkedin-${slug}-${pack.id.slice(0, 8)}.md`;
  const filePath = path.join(dir, filename);

  const content = [
    `# LinkedIn Posts: ${pack.input.topic}`,
    `**Pillar:** ${pack.input.pillar}`,
    `**Generated:** ${pack.createdAt}`,
    `**Pack ID:** ${pack.id}`,
    '',
    ...pack.linkedInPosts.map(
      (p, i) => `## Post ${i + 1}\n\n${p.fullPost}\n\n**Hashtags:** ${p.hashtags.join(' ')}\n**Characters:** ${p.characterCount}`
    ),
  ].join('\n\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

function exportBlogMarkdown(pack: ContentPack, dir: string): string {
  const slug = pack.blogArticle.seo.urlSlug || sanitiseFilename(pack.blogArticle.title);
  const filename = `blog-${slug}.md`;
  const filePath = path.join(dir, filename);

  const frontmatter = [
    '---',
    `title: "${pack.blogArticle.title}"`,
    `slug: ${slug}`,
    `primary_keyword: "${pack.blogArticle.seo.primaryKeyword}"`,
    `meta_title: "${pack.blogArticle.seo.metaTitle}"`,
    `meta_description: "${pack.blogArticle.seo.metaDescription}"`,
    `pillar: "${pack.input.pillar}"`,
    `word_count: ${pack.blogArticle.wordCount}`,
    `generated: ${pack.createdAt}`,
    `status: Generated`,
    '---',
  ].join('\n');

  fs.writeFileSync(filePath, `${frontmatter}\n\n${pack.blogArticle.fullMarkdown}`, 'utf-8');
  return filePath;
}

function exportEmailMarkdown(pack: ContentPack, dir: string): string {
  const slug = sanitiseFilename(pack.emailNewsletter.subjectLine);
  const filename = `email-${slug}-${pack.id.slice(0, 8)}.md`;
  const filePath = path.join(dir, filename);

  const content = [
    `# Email Newsletter: ${pack.emailNewsletter.subjectLine}`,
    '',
    `**Subject Line:** ${pack.emailNewsletter.subjectLine}`,
    `**Preview Text:** ${pack.emailNewsletter.previewText}`,
    `**Word Count:** ${pack.emailNewsletter.wordCount}`,
    '',
    '---',
    '',
    `${pack.emailNewsletter.greeting}`,
    '',
    pack.emailNewsletter.body,
    '',
    `**CTA:** ${pack.emailNewsletter.cta}`,
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

function exportGbpMarkdown(pack: ContentPack, dir: string): string {
  const slug = sanitiseFilename(pack.input.topic);
  const filename = `gbp-posts-${slug}-${pack.id.slice(0, 8)}.md`;
  const filePath = path.join(dir, filename);

  const content = [
    `# Google Business Profile Posts: ${pack.input.topic}`,
    '',
    ...pack.gbpPosts.map(
      (p, i) =>
        `## Post ${i + 1} (${p.characterCount} chars)\n\n${p.body}\n\n**CTA:** ${p.cta}\n**Keywords:** ${p.keywords.join(', ')}`
    ),
  ].join('\n\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

function exportVideoScriptsMarkdown(pack: ContentPack, dir: string): string {
  const slug = sanitiseFilename(pack.input.topic);
  const filename = `video-scripts-${slug}-${pack.id.slice(0, 8)}.md`;
  const filePath = path.join(dir, filename);

  const content = [
    `# Video Scripts: ${pack.input.topic}`,
    '',
    ...pack.videoScripts.map(
      (s, i) =>
        `## Script ${i + 1}: ${s.platform} (~${s.durationSeconds}s)\n\n**Hook:** ${s.hook}\n\n${s.fullScript}`
    ),
  ].join('\n\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

function exportColdEmailMarkdown(pack: ContentPack, dir: string): string {
  const slug = sanitiseFilename(pack.input.topic);
  const filename = `cold-email-angles-${slug}-${pack.id.slice(0, 8)}.md`;
  const filePath = path.join(dir, filename);

  const content = [
    `# Cold Email Angles: ${pack.input.topic}`,
    '',
    ...pack.coldEmailAngles.map(
      (e, i) =>
        `## Angle ${i + 1}: ${e.subjectLine}\n\n**Target Segment:** ${e.targetSegment}\n\n${e.fullEmail}`
    ),
  ].join('\n\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

// ─── CSV Export ───────────────────────────────────────────────

function exportPackCsv(pack: ContentPack, dir: string): string {
  const filename = `content-pack-${pack.id.slice(0, 8)}.csv`;
  const filePath = path.join(dir, filename);

  const rows: string[][] = [
    ['Type', 'Title/Subject', 'Content', 'CTA', 'Channel', 'Status'],
    ...pack.linkedInPosts.map((p, i) => [
      'LinkedIn Post',
      `Post ${i + 1}: ${p.hook.slice(0, 50)}`,
      p.fullPost.replace(/"/g, '""'),
      p.cta.replace(/"/g, '""'),
      'LinkedIn',
      'Generated',
    ]),
    [
      'Blog Article',
      pack.blogArticle.title,
      pack.blogArticle.fullMarkdown.slice(0, 500).replace(/"/g, '""') + '...',
      pack.input.cta ?? '',
      'Blog',
      'Generated',
    ],
    [
      'Email Newsletter',
      pack.emailNewsletter.subjectLine,
      pack.emailNewsletter.body.replace(/"/g, '""'),
      pack.emailNewsletter.cta.replace(/"/g, '""'),
      'Email',
      'Generated',
    ],
    ...pack.gbpPosts.map((p, i) => [
      'GBP Post',
      `Post ${i + 1}`,
      p.body.replace(/"/g, '""'),
      p.cta.replace(/"/g, '""'),
      'Google Business Profile',
      'Generated',
    ]),
    ...pack.videoScripts.map((s, i) => [
      'Video Script',
      `${s.platform} Script ${i + 1}`,
      s.fullScript.replace(/"/g, '""'),
      s.cta.replace(/"/g, '""'),
      'Video',
      'Generated',
    ]),
    ...pack.coldEmailAngles.map((e, i) => [
      'Cold Email Angle',
      e.subjectLine,
      e.fullEmail.replace(/"/g, '""'),
      e.cta.replace(/"/g, '""'),
      'Cold Email',
      'Generated',
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  fs.writeFileSync(filePath, csv, 'utf-8');
  return filePath;
}

// ─── Calendar Export ──────────────────────────────────────────

export function exportCalendarCsv(calendar: ContentCalendar, outputDir: string): string {
  ensureDir(outputDir);
  const filename = `content-calendar-${calendar.startDate}.csv`;
  const filePath = path.join(outputDir, filename);

  const headers = ['Date', 'Day', 'Channel', 'Topic', 'Pillar', 'CTA', 'Status'];
  const rows = calendar.entries.map((e) => [
    e.date,
    new Date(e.date).toLocaleDateString('en-GB', { weekday: 'long' }),
    e.channel,
    e.topic,
    e.pillar,
    e.cta,
    e.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  fs.writeFileSync(filePath, csv, 'utf-8');
  return filePath;
}

export function exportCalendarMarkdown(calendar: ContentCalendar, outputDir: string): string {
  ensureDir(outputDir);
  const filename = `content-calendar-${calendar.startDate}.md`;
  const filePath = path.join(outputDir, filename);

  const header = `# CleanReach 30-Day Content Calendar\n\n**Period:** ${calendar.startDate} → ${calendar.endDate}\n**Generated:** ${calendar.generatedAt}\n\n`;

  const tableHeader = '| Date | Channel | Topic | Pillar | CTA | Status |\n|------|---------|-------|--------|-----|--------|\n';
  const tableRows = calendar.entries
    .map(
      (e) =>
        `| ${e.date} | ${e.channel} | ${e.topic} | ${e.pillar.slice(0, 30)} | ${e.cta.slice(0, 40)} | ${e.status} |`
    )
    .join('\n');

  fs.writeFileSync(filePath, header + tableHeader + tableRows, 'utf-8');
  return filePath;
}

// ─── Main Export Function ─────────────────────────────────────

export async function exportContentPack(
  pack: ContentPack,
  options: Partial<ExportOptions> = {}
): Promise<WeeklyExportResult> {
  const outputDir = options.outputDir ?? config.output.dir ?? './outputs';
  const formats = options.formats ?? ['markdown', 'csv', 'json'];

  const subdirs = {
    linkedin: path.join(outputDir, 'linkedin'),
    blogs: path.join(outputDir, 'blogs'),
    emails: path.join(outputDir, 'emails'),
    gbp: path.join(outputDir, 'gbp-posts'),
    video: path.join(outputDir, 'video-scripts'),
    coldEmail: path.join(outputDir, 'cold-email-angles'),
  };

  Object.values(subdirs).forEach(ensureDir);
  ensureDir(outputDir);

  const exportedFiles: string[] = [];

  if (formats.includes('markdown')) {
    exportedFiles.push(exportLinkedInMarkdown(pack, subdirs.linkedin));
    exportedFiles.push(exportBlogMarkdown(pack, subdirs.blogs));
    exportedFiles.push(exportEmailMarkdown(pack, subdirs.emails));
    exportedFiles.push(exportGbpMarkdown(pack, subdirs.gbp));
    exportedFiles.push(exportVideoScriptsMarkdown(pack, subdirs.video));
    exportedFiles.push(exportColdEmailMarkdown(pack, subdirs.coldEmail));
    console.log('[Export] Markdown files created');
  }

  if (formats.includes('csv')) {
    exportedFiles.push(exportPackCsv(pack, outputDir));
    console.log('[Export] CSV file created');
  }

  if (formats.includes('json')) {
    const jsonFilename = `content-pack-${pack.id.slice(0, 8)}.json`;
    const jsonPath = path.join(outputDir, jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(pack, null, 2), 'utf-8');
    exportedFiles.push(jsonPath);
    console.log('[Export] JSON file created');
  }

  return {
    packId: pack.id,
    exportedFiles,
    exportedAt: new Date().toISOString(),
  };
}
