# Notion Setup Guide – CleanReach Content Engine

## Overview

The engine saves generated content to Notion, organised by content type and pillar. Each content pack creates 6 Notion pages (one per content type) in a shared database.

---

## Step 1: Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New Integration**
3. Name it: **CleanReach Content Engine**
4. Select your workspace
5. Set capabilities: Read content, Update content, Insert content
6. Copy the **Internal Integration Secret** → add as `NOTION_API_KEY` in `.env`

---

## Step 2: Create the Content Database

1. Open your Notion workspace
2. Create a new full-page database
3. Name it: **CleanReach Content Library**
4. Add the following properties:

---

## Step 3: Database Properties

| Property Name | Type | Notes |
|--------------|------|-------|
| `Title` | Title | Auto-created — keep as is |
| `Content Type` | Select | See options below |
| `Pillar` | Select | See options below |
| `Status` | Select | See options below |
| `CTA` | Text | The content's call to action |
| `Publish Date` | Date | Scheduled publish date |
| `Channel` | Select | Publishing channel |
| `SEO Keyword` | Text | Primary SEO keyword (for blog posts) |
| `Created Date` | Date | Auto-set by the engine |

---

## Step 4: Configure Select Options

### Content Type Options
- Blog Article
- Email Newsletter
- LinkedIn Posts
- GBP Posts
- Video Scripts
- Cold Email Angles

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
- Generated
- Needs Edit
- Approved
- Scheduled
- Published

### Channel Options
- LinkedIn
- Blog
- Email
- Google Business Profile
- Video Script
- Cold Email

---

## Step 5: Share with Your Integration

1. Open the database you created
2. Click **...** (top right) → **Add connections**
3. Search for **CleanReach Content Engine**
4. Click Connect

---

## Step 6: Get the Database ID

1. Open the database in your browser
2. Copy the URL: `https://notion.so/workspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...`
3. The 32-character string after the last `/` and before `?v=` is the database ID
4. Add it to `.env` as `NOTION_DATABASE_ID`

---

## Step 7: Update .env

```env
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXX
NOTION_DATABASE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 8: Test the Connection

```bash
# Generate a pack first if you haven't
npm run generate:topic

# Then sync to Notion
npm run sync:notion
```

---

## Recommended Notion Views

Set up these views in your database for a better editorial workflow:

### 1. By Content Type
- Group by: Content Type
- Useful for reviewing all LinkedIn posts together

### 2. By Status (Editorial Board)
- View type: Board
- Group by: Status
- Drag cards from "Generated" → "Approved" as you review

### 3. By Pillar
- Filter: This week's publish dates
- Group by: Pillar
- Useful for ensuring content pillar balance

### 4. Publish Calendar
- View type: Calendar
- Date property: Publish Date
- Useful for visualising the content schedule

---

## Tips

- Use Notion comments to leave editorial notes on each page
- Add a `Reviewer` person property to assign content for approval
- Set up Notion reminders on Publish Date to trigger publishing
- Export any page as Markdown for CMS import
