#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Weekly Export
// Usage: npm run export:weekly
// Bundles all this week's content into a single export package
// ─────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig, config } from '../config/env';
import { ContentPack } from '../config/types';

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: Weekly Export');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const outputDir = config.output.dir ?? './outputs';
  const weekStart = getWeekStart();
  const weekLabel = weekStart.toISOString().split('T')[0];

  // Find all JSON packs generated this week
  const jsonFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith('content-pack-') && f.endsWith('.json'));

  const thisWeekPacks: ContentPack[] = [];

  for (const file of jsonFiles) {
    const filePath = path.join(outputDir, file);
    const stat = fs.statSync(filePath);

    if (stat.mtime >= weekStart) {
      try {
        const pack = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ContentPack;
        thisWeekPacks.push(pack);
      } catch {
        console.warn(`  ⚠️  Could not read ${file}`);
      }
    }
  }

  if (thisWeekPacks.length === 0) {
    console.log('ℹ️  No content packs found from this week.');
    console.log('   Run npm run generate:topic to create some.\n');
    return;
  }

  console.log(`📦 Found ${thisWeekPacks.length} content pack(s) from this week\n`);

  // Build weekly summary Markdown
  const weeklyDir = path.join(outputDir, `weekly-${weekLabel}`);
  fs.mkdirSync(weeklyDir, { recursive: true });

  let summaryMd = `# CleanReach Weekly Content Pack\n\n`;
  summaryMd += `**Week of:** ${weekLabel}\n`;
  summaryMd += `**Packs:** ${thisWeekPacks.length}\n`;
  summaryMd += `**Generated:** ${new Date().toISOString()}\n\n---\n\n`;

  for (const pack of thisWeekPacks) {
    summaryMd += `## ${pack.input.topic}\n\n`;
    summaryMd += `- **Pillar:** ${pack.input.pillar}\n`;
    summaryMd += `- **Pack ID:** ${pack.id}\n`;
    summaryMd += `- **Status:** ${pack.status}\n\n`;

    // Copy pack files to weekly dir
    const packDir = path.join(weeklyDir, pack.id.slice(0, 8));
    fs.mkdirSync(packDir, { recursive: true });

    // Write all content types
    fs.writeFileSync(
      path.join(packDir, 'linkedin-posts.md'),
      pack.linkedInPosts.map((p, i) => `## Post ${i + 1}\n\n${p.fullPost}\n\n${p.hashtags.join(' ')}`).join('\n\n---\n\n')
    );

    fs.writeFileSync(
      path.join(packDir, 'blog-article.md'),
      pack.blogArticle.fullMarkdown
    );

    fs.writeFileSync(
      path.join(packDir, 'email-newsletter.md'),
      `Subject: ${pack.emailNewsletter.subjectLine}\nPreview: ${pack.emailNewsletter.previewText}\n\n${pack.emailNewsletter.body}`
    );

    fs.writeFileSync(
      path.join(packDir, 'gbp-posts.md'),
      pack.gbpPosts.map((p, i) => `## Post ${i + 1}\n\n${p.body}\n\n${p.cta}`).join('\n\n---\n\n')
    );

    fs.writeFileSync(
      path.join(packDir, 'video-scripts.md'),
      pack.videoScripts.map((s, i) => `## ${s.platform}\n\n${s.fullScript}`).join('\n\n---\n\n')
    );

    fs.writeFileSync(
      path.join(packDir, 'cold-email-angles.md'),
      pack.coldEmailAngles.map((e, i) => `## ${e.subjectLine}\n\n${e.fullEmail}`).join('\n\n---\n\n')
    );

    fs.writeFileSync(
      path.join(packDir, 'full-pack.json'),
      JSON.stringify(pack, null, 2)
    );

    summaryMd += `### Content Summary\n\n`;
    summaryMd += `- LinkedIn posts: ${pack.linkedInPosts.length}\n`;
    summaryMd += `- Blog word count: ${pack.blogArticle.wordCount}\n`;
    summaryMd += `- Email subject: ${pack.emailNewsletter.subjectLine}\n`;
    summaryMd += `- GBP posts: ${pack.gbpPosts.length}\n`;
    summaryMd += `- Video scripts: ${pack.videoScripts.length}\n`;
    summaryMd += `- Cold email angles: ${pack.coldEmailAngles.length}\n\n`;
    summaryMd += `### CTAs\n\n${pack.ctas.map((c) => `- ${c}`).join('\n')}\n\n---\n\n`;
  }

  const summaryPath = path.join(weeklyDir, 'WEEKLY-SUMMARY.md');
  fs.writeFileSync(summaryPath, summaryMd);

  // Create CSV export of all content
  const csvRows: string[][] = [
    ['Pack ID', 'Topic', 'Pillar', 'Status', 'LinkedIn Posts', 'Blog Words', 'Email Subject', 'GBP Posts', 'Video Scripts', 'Cold Emails'],
  ];

  for (const pack of thisWeekPacks) {
    csvRows.push([
      pack.id.slice(0, 8),
      pack.input.topic,
      pack.input.pillar,
      pack.status,
      String(pack.linkedInPosts.length),
      String(pack.blogArticle.wordCount),
      pack.emailNewsletter.subjectLine,
      String(pack.gbpPosts.length),
      String(pack.videoScripts.length),
      String(pack.coldEmailAngles.length),
    ]);
  }

  const csv = csvRows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(path.join(weeklyDir, 'weekly-overview.csv'), csv);

  console.log(`\n✅ Weekly export complete!`);
  console.log(`   Directory: ${weeklyDir}`);
  console.log(`   Summary: ${summaryPath}`);
  console.log(`   Packs bundled: ${thisWeekPacks.length}`);
}

main();
