# Content Engine Weekly SOP – CleanReach

## Purpose

This SOP describes the weekly process for using the CleanReach Content Engine to turn one topic into a full week's worth of content. Follow it every Monday morning.

**Time required:** ~30 minutes per week (the engine does the heavy lifting)

---

## Weekly Overview

| Day | Task | Time |
|-----|------|------|
| Monday | Add topic, run generation | 10 min |
| Tuesday | Review and approve content | 20 min |
| Wednesday | Publish blog + email | 10 min |
| Thursday | Schedule LinkedIn posts | 10 min |
| Friday | Publish GBP posts | 5 min |

---

## Monday: Topic Input and Generation

### Step 1: Choose the week's topic

Pick one topic from the content pillar rotation. Aim to rotate through all 8 pillars across 8 weeks.

Pillar rotation schedule:
- Week 1: Winning Commercial Cleaning Contracts
- Week 2: Cold Email Lead Generation
- Week 3: Local SEO for Cleaning Companies
- Week 4: Google Business Profile Optimisation
- Week 5: Facilities Manager Buyer Psychology
- Week 6: Cleaning Business Growth
- Week 7: Sales Follow-Up and Conversion
- Week 8: Commercial Cleaning Website Conversion

**Good topic formats:**
- "How to [achieve outcome] for [target audience]"
- "Why [common mistake] is costing cleaning companies contracts"
- "The [specific tactic] that works for winning [type] contracts"
- "What facilities managers really look for in a cleaning contractor"

### Step 2: Add to Airtable (if using Airtable workflow)

1. Open the Content Topics base
2. Add a new row
3. Fill in:
   - `Topic`: Your chosen topic
   - `Pillar`: The matching content pillar
   - `Core Insight`: 2–3 sentences on the key insight (optional but improves output)
   - `Target Audience`: Who this is specifically for
   - `CTA`: The action you want readers to take
   - `Status`: Pending

### Step 3: Run the generator

**If using CLI:**
```bash
npm run generate:topic -- "Your topic here"
```

**If using Airtable workflow:**
```bash
npm run sync:airtable
```

**If using n8n:** The Airtable trigger fires automatically.

**If repurposing a transcript:**
```bash
# Save transcript as .txt file first
npm run generate:transcript -- ./this-weeks-recording.txt
```

Generation takes 60–90 seconds.

### Step 4: Check outputs

```bash
ls outputs/
```

You'll see new files in:
- `outputs/linkedin/` — 5 LinkedIn posts
- `outputs/blogs/` — 1 blog article with SEO data
- `outputs/emails/` — 1 email newsletter
- `outputs/gbp-posts/` — 3 GBP posts
- `outputs/video-scripts/` — 3 video scripts
- `outputs/cold-email-angles/` — 3 cold email angles

---

## Tuesday: Review and Approval

### Blog Article Review Checklist

- [ ] Title includes primary keyword
- [ ] Introduction leads with a pain point
- [ ] No banned phrases used
- [ ] Practical and specific (not generic)
- [ ] CTA block at the end
- [ ] SEO meta title under 60 characters
- [ ] Meta description under 160 characters

### LinkedIn Posts Review Checklist

- [ ] Hook stops the scroll in 1–2 sentences
- [ ] Each post has a distinct angle/format
- [ ] No generic marketing language
- [ ] CTA is specific
- [ ] Character count under 3,000

### Email Newsletter Review Checklist

- [ ] Subject line is direct and under 50 characters
- [ ] Opens with a problem, not "hope this email finds you well"
- [ ] One clear idea, well explained
- [ ] Single CTA at the end
- [ ] Under 400 words

### GBP Post Review Checklist

- [ ] Under 1,500 characters
- [ ] Replace [CITY] with your actual city/area
- [ ] Commercial cleaning keywords included naturally
- [ ] CTA is specific

### Approve Content

Update status in Airtable: **Generated → Approved**

Or manually move content to your publishing tool.

---

## Wednesday: Blog + Email Publishing

### Blog
1. Copy `outputs/blogs/blog-[slug].md`
2. Import to your CMS (WordPress, Webflow, etc.)
3. Add the meta title and description from the frontmatter
4. Add the URL slug
5. Add internal links
6. Publish

### Email Newsletter
1. Copy the subject line and body from `outputs/emails/`
2. Create a new campaign in your email tool (MailChimp, ConvertKit, etc.)
3. Paste the HTML version for formatting, or plain text for simplicity
4. Schedule for Wednesday morning (8–10am send time works well for B2B)

---

## Thursday: LinkedIn Scheduling

1. Open `outputs/linkedin/linkedin-[topic].md`
2. Copy each post into Buffer, Hootsuite, or LinkedIn's native scheduler
3. Schedule across the week:
   - Post 1: Thursday (this week)
   - Post 2: Following Monday
   - Post 3: Following Wednesday
   - Post 4: Following Friday
   - Post 5: Hold for the week after

---

## Friday: GBP Posts

1. Log into Google Business Profile
2. Click Posts → Add Update
3. Copy each post from `outputs/gbp-posts/`
4. Replace [CITY] with your actual service area
5. Add a photo if possible (increases engagement)
6. Publish

Tip: Schedule one post per week, not three at once.

---

## Monthly: 30-Day Calendar

At the end of each month, generate next month's calendar:

```bash
npm run calendar:30 -- 2025-08-01
```

This gives you:
- A full month of planned content
- All 8 pillars covered
- A mix of all channels

---

## Weekly Export Bundle

Every Friday, run the export to bundle the week's content:

```bash
npm run export:weekly
```

This creates `outputs/weekly-[date]/` with all content organised for archiving.

---

## Troubleshooting

**Content sounds too generic:**
- Add a specific `Core Insight` to your Airtable row or input
- The more specific your input, the more specific the output

**Blog article is too short:**
- The AI targets 1,200–1,800 words; if it's shorter, re-run with `npm run generate:topic`
- Add more context in `Core Insight`

**LinkedIn posts feel similar:**
- This can happen if the topic is narrow — add a `Target Audience` to diversify angles
- Each post uses a different format (observation, list, story, contrarian, how-to)

**AI generation fails:**
- Check your API key has credits
- Check internet connection
- Try switching `AI_PROVIDER` between `anthropic` and `openai`

---

## Content Quality Standards

Before publishing anything from the engine, verify:

1. **Commercial focus** — Is it about commercial cleaning, not domestic?
2. **Direct tone** — Is it direct and practical, not vague?
3. **Pain point first** — Does it lead with a real pain or outcome?
4. **Specific CTA** — Is the CTA specific and actionable?
5. **No banned phrases** — Check for "take your business to the next level" etc.
6. **Accurate** — Does the content reflect how CleanReach actually works?

The AI provides a strong first draft. Your job is to ensure accuracy and add any real examples or data points from your own experience.
