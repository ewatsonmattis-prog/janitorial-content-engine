# n8n Workflow Guide – CleanReach Content Engine

## Overview

The webhook server exposes HTTP endpoints that n8n can trigger to automate content generation. Set up these n8n workflows once, and the system runs itself weekly.

---

## Prerequisites

1. CleanReach Content Engine webhook server running (`npm run webhook:start`)
2. Server accessible from n8n (use ngrok for local dev, or deploy to a VPS/cloud)
3. n8n account or self-hosted instance

---

## Webhook Endpoints Reference

| Endpoint | Method | Trigger |
|----------|--------|---------|
| `POST /webhook/generate-topic` | Content generation from topic/Airtable row | |
| `POST /webhook/generate-transcript` | Content generation from transcript text | |
| `POST /webhook/update-status` | Update content approval status | |
| `POST /webhook/export-weekly` | Bundle weekly content for review | |
| `GET /health` | Health check | |

### Authentication

All POST endpoints require the header:
```
x-webhook-secret: your-webhook-secret-here
```

Set `WEBHOOK_SECRET` in `.env` to a strong random string.

---

## Workflow 1: New Airtable Row → Generate Content

**Trigger:** When a new row is added to Airtable with Status = "Pending"

```
[Airtable Trigger]
  ↓ On new record in "Content Topics" where Status = "Pending"
[HTTP Request]
  ↓ POST /webhook/generate-topic
  Body: {
    "topic": "{{ $json.fields.Topic }}",
    "pillar": "{{ $json.fields.Pillar }}",
    "coreInsight": "{{ $json.fields['Core Insight'] }}",
    "targetAudience": "{{ $json.fields['Target Audience'] }}",
    "cta": "{{ $json.fields.CTA }}",
    "airtableRecordId": "{{ $json.id }}"
  }
  Headers: { "x-webhook-secret": "your-secret" }
[Slack / Email Notification] (optional)
  ↓ Notify team: "Content pack ready for review: {{ $json.topic }}"
```

### n8n Node Configuration

**Airtable Trigger node:**
- Base: CleanReach Content Engine
- Table: Content Topics
- Trigger Field: Created At
- Additional Filter: `{Status} = 'Pending'`

**HTTP Request node:**
- Method: POST
- URL: `http://your-server:3001/webhook/generate-topic`
- Body Content Type: JSON
- Body: Map fields from Airtable trigger

---

## Workflow 2: Weekly Export + Notification

**Trigger:** Every Monday at 9am

```
[Schedule Trigger: Monday 9:00]
  ↓
[HTTP Request]
  ↓ POST /webhook/export-weekly
[Slack / Email]
  ↓ "Weekly content pack is ready for review. Check the outputs folder."
```

### n8n Node Configuration

**Schedule Trigger:**
- Trigger: Cron
- Expression: `0 9 * * 1` (every Monday at 9am)

---

## Workflow 3: Transcript → Content

**Trigger:** Manual or via Slack command

```
[Webhook Trigger or Manual]
  ↓
[HTTP Request]
  ↓ POST /webhook/generate-transcript
  Body: {
    "transcript": "Full transcript text here..."
  }
[Airtable: Update Record] (optional)
  ↓ Log new content pack to Airtable
```

---

## Workflow 4: Approved Content → Buffer

**Trigger:** Airtable row Status changes to "Approved"

```
[Airtable Trigger: Status = Approved]
  ↓
[Switch: Content Type]
  ├── LinkedIn → [Buffer: Create post for LinkedIn profile]
  ├── GBP → [Note: GBP posts require manual publishing]
  └── Email → [MailChimp / ConvertKit: Create draft campaign]
[Airtable: Update Status to "Scheduled"]
```

---

## Setting Up the Webhook Server for Production

### Option 1: Deploy to Railway / Render / Fly.io

```bash
# Build the project
npm run build

# Start the webhook server
node dist/workflows/webhookServer.js
```

Set environment variables in your hosting platform's dashboard.

### Option 2: Use ngrok for local development

```bash
# Terminal 1: Start webhook server
npm run webhook:start

# Terminal 2: Expose with ngrok
ngrok http 3001
# Copy the https URL → use in n8n
```

### Option 3: PM2 on a VPS

```bash
npm install -g pm2
npm run build
pm2 start dist/workflows/webhookServer.js --name cleanreach-webhook
pm2 startup
pm2 save
```

---

## Testing Webhooks from n8n

Use n8n's **HTTP Request** node to test each endpoint manually:

```json
// Test: Generate from topic
POST http://your-server:3001/webhook/generate-topic
Headers: { "x-webhook-secret": "your-secret", "Content-Type": "application/json" }
Body: {
  "topic": "How to win school cleaning contracts",
  "pillar": "Winning Commercial Cleaning Contracts"
}
```

Expected response:
```json
{
  "success": true,
  "packId": "uuid-here",
  "topic": "How to win school cleaning contracts",
  "contentSummary": {
    "linkedInPosts": 5,
    "blogWordCount": 1450,
    "emailSubjectLine": "The one thing school cleaning tenders require",
    "gbpPosts": 3,
    "videoScripts": 3,
    "coldEmailAngles": 3
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| 401 Unauthorized | Check `x-webhook-secret` header matches `WEBHOOK_SECRET` in `.env` |
| 500 Error | Check AI API key is valid and has credits |
| Airtable fields missing | Check exact field names match `AIRTABLE_SETUP.md` |
| Notion 404 | Ensure integration is connected to the database |
| Timeout | Generation can take 60–90 seconds — set n8n timeout to 120s |
