#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Generate 30-Day Calendar
// Usage: npm run calendar:30
// ─────────────────────────────────────────────────────────────

import { validateConfig, config } from '../config/env';
import { generateContentCalendar } from '../generators/calendarGenerator';
import { exportCalendarCsv, exportCalendarMarkdown } from '../exports/exportSystem';

async function main() {
  console.log('─────────────────────────────────────────');
  console.log('  CleanReach Content Engine');
  console.log('  Mode: 30-Day Content Calendar');
  console.log('─────────────────────────────────────────\n');

  try {
    validateConfig();
  } catch (err) {
    console.error('❌ Config error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const startDate = args[0]; // Optional: YYYY-MM-DD

  console.log(`📅 Generating 30-day calendar${startDate ? ` from ${startDate}` : ''}...\n`);

  try {
    const calendar = await generateContentCalendar(startDate);

    const csvPath = exportCalendarCsv(calendar, config.output.dir ?? './outputs');
    const mdPath = exportCalendarMarkdown(calendar, config.output.dir ?? './outputs');

    console.log(`\n✅ Calendar generated: ${calendar.entries.length} entries`);
    console.log(`   Period: ${calendar.startDate} → ${calendar.endDate}`);
    console.log(`\n📁 Exported:`);
    console.log(`   CSV: ${csvPath}`);
    console.log(`   Markdown: ${mdPath}`);

    // Summary breakdown
    const channels = calendar.entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.channel] = (acc[e.channel] ?? 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Channel breakdown:');
    Object.entries(channels)
      .sort(([, a], [, b]) => b - a)
      .forEach(([channel, count]) => console.log(`   ${channel}: ${count}`));
  } catch (err) {
    console.error('\n❌ Calendar generation failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
