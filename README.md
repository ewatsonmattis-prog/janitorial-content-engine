# CleanReach Content Engine

Automated inbound content engine for CleanReach — a growth agency for commercial cleaning companies.

Takes one weekly topic or transcript and generates a full content pack: LinkedIn posts, blog articles, email newsletters, Google Business Profile posts, video scripts, and cold email angles.

---

## What It Does

Input one topic → get a complete, publish-ready content pack:

| Output | Count |
|--------|-------|
| LinkedIn posts | 5 (different formats) |
| Blog article | 1 (SEO-optimised, 1,200–1,800 words) |
| Email newsletter | 1 (with HTML version) |
| GBP posts | 3 (under 1,500 chars each) |
| Video scripts | 3 (LinkedIn, YouTube Shorts, Instagram Reels) |
| Cold email angles | 3 (Pain Point, Credibility, Direct Ask) |
| CTAs | 3 (variations) |
| 30-day calendar | Optional |

---

## Quick Start

### 1. Install

```bash
git clone <your-repo>
cd cleanreach-content-engine
npm install
cp .env.example .env
```

### 2. Configure

Edit `.env` and add at minimum:

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Generate your first content pack

```bash
npm run generate:topic
```

Or with a custom topic:

```bash
npm run generate:topic -- "How commercial cleaning companies can win facilities manager contracts"
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `npm run generate:topic` | Generate content pack from a topic |
| `npm run generate:transcript` | Generate from a transcript file |
| `npm run generate:csv` | Batch generate from a CSV of topics |
| `npm run calendar:30` | Generate a 30-day content calendar |
| `npm run export:weekly` | Bundle this week's content for review |
| `npm run sync:airtable` | Pull topics from Airtable, push content back |
| `npm run sync:notion` | Sync latest content pack to Notion |
| `npm run webhook:start` | Start the n8n-compatible webhook server |

---

## Project Structure

```
cleanreach-content-engine/
├── src/
│   ├── config/
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── env.ts            # Environment config & validation
│   │   └── brand.ts          # Brand constants, voice rules, pillars
│   ├── data/
│   │   ├── airtable.ts       # Airtable read/write integration
│   │   ├── notion.ts         # Notion page creation
│   │   └── example-topics.csv
│   ├── prompts/
│   │   ├── linkedin-post.prompt.md
│   │   ├── blog-article.prompt.md
│   │   ├── email-newsletter.prompt.md
│   │   ├── google-business-post.prompt.md
│   │   ├── video-script.prompt.md
│   │   ├── cold-email-angle.prompt.md
│   │   ├── content-calendar.prompt.md
│   │   └── transcript-repurposing.prompt.md
│   ├── generators/
│   │   ├── contentPackGenerator.ts  # Main orchestrator
│   │   ├── linkedinGenerator.ts
│   │   ├── blogGenerator.ts
│   │   ├── emailGenerator.ts
│   │   ├── gbpGenerator.ts
│   │   ├── videoGenerator.ts
│   │   ├── coldEmailGenerator.ts
│   │   └── calendarGenerator.ts
│   ├── workflows/
│   │   ├── generateFromTopic.ts
│   │   ├── generateFromTranscript.ts
│   │   ├── generateFromCsv.ts
│   │   ├── generateCalendar.ts
│   │   ├── exportWeekly.ts
│   │   ├── syncAirtable.ts
│   │   ├── syncNotion.ts
│   │   └── webhookServer.ts
│   ├── exports/
│   │   └── exportSystem.ts
│   └── utils/
│       ├── aiClient.ts        # Anthropic/OpenAI abstraction
│       └── promptLoader.ts    # Prompt file loading + variable injection
├── outputs/                   # Generated content (auto-created)
│   ├── linkedin/
│   ├── blogs/
│   ├── emails/
│   ├── gbp-posts/
│   ├── video-scripts/
│   └── cold-email-angles/
├── docs/
│   ├── AIRTABLE_SETUP.md
│   ├── NOTION_SETUP.md
│   ├── N8N_WORKFLOW.md
│   └── CONTENT_ENGINE_SOP.md
├── .env.example
├── package.json
└── tsconfig.json
```

---

## AI Provider Configuration

### Anthropic (Claude) — Recommended

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Uses `claude-sonnet-4-20250514` by default.

### OpenAI (GPT-4o)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

---

## Integrations

| Integration | Required | Purpose |
|------------|----------|---------|
| Anthropic / OpenAI | ✅ Yes | Content generation |
| Airtable | Optional | Topic queue + content storage |
| Notion | Optional | Content organisation |
| n8n | Optional | Automation triggers |
| Buffer | Optional (future) | Scheduling |

---

## Content Pillars

1. Winning Commercial Cleaning Contracts
2. Local SEO for Cleaning Companies
3. Google Business Profile Optimisation
4. Cold Email Lead Generation
5. Cleaning Business Growth
6. Sales Follow-Up and Conversion
7. Facilities Manager Buyer Psychology
8. Commercial Cleaning Website Conversion

---

## Approval Workflow

Content moves through these statuses:

```
Generated → Needs Edit → Approved → Scheduled → Published
```

Update status in Airtable manually, or via the webhook endpoint:

```bash
POST /webhook/update-status
{ "airtableRecordId": "recXXX", "status": "Approved" }
```

---

## Output Formats

- **Markdown** — one file per content type, ready for CMS import
- **JSON** — full pack data for downstream processing
- **CSV** — overview spreadsheet for review

---

## Generating the First Content Pack

```bash
# 1. Copy env file
cp .env.example .env

# 2. Add your Anthropic API key to .env

# 3. Install deps
npm install

# 4. Generate
npm run generate:topic -- "How to win school cleaning contracts through targeted cold email"

# 5. Check outputs/
ls outputs/
```

---

## Further Documentation

- [Airtable Setup](./docs/AIRTABLE_SETUP.md)
- [Notion Setup](./docs/NOTION_SETUP.md)
- [n8n Workflow](./docs/N8N_WORKFLOW.md)
- [Weekly SOP](./docs/CONTENT_ENGINE_SOP.md)
