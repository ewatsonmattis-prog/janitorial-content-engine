# Airtable Setup Guide – CleanReach Content Engine

## Overview

The content engine uses Airtable as both a topic input queue and content storage system. When a new row is added to the table, n8n or the sync command will pick it up, generate a content pack, and write the results back.

---

## Step 1: Create a New Base

1. Go to [airtable.com](https://airtable.com) and create a new base
2. Name it: **CleanReach Content Engine**
3. Create a new table: **Content Topics**

---

## Step 2: Add These Fields

Create each field exactly as specified (field names are case-sensitive):

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| `Topic` | Single line text | The content topic or title |
| `Pillar` | Single select | See options below |
| `Source Type` | Single select | Manual Topic / Transcript / CSV / Airtable |
| `Transcript` | Long text | Paste raw transcript here if applicable |
| `Core Insight` | Long text | 2–3 sentence summary of the key insight |
| `Target Audience` | Single line text | e.g. "Facilities managers in offices" |
| `CTA` | Single line text | e.g. "Book a free strategy call" |
| `Status` | Single select | See options below |
| `LinkedIn Posts` | Long text | AI-generated output |
| `Blog Article` | Long text | AI-generated output |
| `Email Newsletter` | Long text | AI-generated output |
| `GBP Posts` | Long text | AI-generated output |
| `Video Scripts` | Long text | AI-generated output |
| `Cold Email Angles` | Long text | AI-generated output |
| `SEO Keywords` | Long text | AI-generated SEO data |
| `Publish Date` | Date | Target publish date |

---

## Step 3: Configure Single Select Options

### Pillar Options
- Winning Commercial Cleaning Contracts
- Local SEO for Cleaning Companies
- Google Business Profile Optimisation
- Cold Email Lead Generation
- Cleaning Business Growth
- Sales Follow-Up and Conversion
- Facilities Manager Buyer Psychology
- Commercial Cleaning Website Conversion

### Status Options
- Pending ← Add this as the default for new rows
- Generated
- Needs Edit
- Approved
- Scheduled
- Published

### Source Type Options
- Manual Topic
- Transcript
- CSV
- Airtable

---

## Step 4: Get Your API Credentials

### API Key
1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Create a personal access token with scopes:
   - `data.records:read`
   - `data.records:write`
3. Copy the token → add as `AIRTABLE_API_KEY` in `.env`

### Base ID
1. Open your base in Airtable
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy the `appXXXXXXXXXXXXXX` part → add as `AIRTABLE_BASE_ID` in `.env`

---

## Step 5: Update .env

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Content Topics
```

---

## Step 6: Test the Connection

```bash
npm run sync:airtable
```

If connected, it will pull any rows with Status = "Pending", generate content, and write it back.

---

## Weekly Workflow with Airtable

1. **Monday**: Add new topic rows to Airtable, set Status = "Pending"
2. **Monday**: Run `npm run sync:airtable` (or trigger via n8n)
3. **Tuesday**: Review generated content in Airtable long text fields
4. **Tuesday**: Update Status to "Approved" or "Needs Edit"
5. **Wednesday–Friday**: Publish approved content to each channel

---

## Tips

- Use Airtable views to filter by Status — create views for "Needs Review", "Approved", "Scheduled"
- Add a `Notes` field for editorial comments
- Set up an Airtable automation to notify you when Status changes to "Generated"
- The `Publish Date` field integrates with the content calendar for scheduling
