// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Type Definitions
// ─────────────────────────────────────────────────────────────

export type ContentStatus =
  | 'Generated'
  | 'Needs Edit'
  | 'Approved'
  | 'Scheduled'
  | 'Published';

export type ContentPillar =
  | 'Winning Commercial Cleaning Contracts'
  | 'Local SEO for Cleaning Companies'
  | 'Google Business Profile Optimisation'
  | 'Cold Email Lead Generation'
  | 'Cleaning Business Growth'
  | 'Sales Follow-Up and Conversion'
  | 'Facilities Manager Buyer Psychology'
  | 'Commercial Cleaning Website Conversion';

export type SourceType = 'Manual Topic' | 'Transcript' | 'CSV' | 'Airtable';

export type ContentChannel =
  | 'LinkedIn'
  | 'Blog'
  | 'Email'
  | 'Google Business Profile'
  | 'Video Script'
  | 'Cold Email';

// ─── Input ───────────────────────────────────────────────────

export interface ContentInput {
  topic: string;
  pillar: ContentPillar;
  sourceType: SourceType;
  transcript?: string;
  coreInsight?: string;
  targetAudience?: string;
  cta?: string;
  airtableRecordId?: string;
}

// ─── SEO ─────────────────────────────────────────────────────

export interface SeoData {
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  internalLinkSuggestions: string[];
  localSeoVariations: string[];
}

// ─── Generated Content ───────────────────────────────────────

export interface LinkedInPost {
  hook: string;
  body: string;
  cta: string;
  fullPost: string;
  hashtags: string[];
  characterCount: number;
}

export interface BlogArticle {
  title: string;
  seo: SeoData;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  fullMarkdown: string;
  wordCount: number;
}

export interface BlogSection {
  heading: string;
  content: string;
}

export interface EmailNewsletter {
  subjectLine: string;
  previewText: string;
  greeting: string;
  body: string;
  cta: string;
  ctaUrl: string;
  fullHtml: string;
  wordCount: number;
}

export interface GbpPost {
  body: string;
  cta: string;
  characterCount: number;
  keywords: string[];
}

export interface VideoScript {
  hook: string;
  problem: string;
  solution: string;
  proof: string;
  cta: string;
  fullScript: string;
  durationSeconds: number;
  platform: 'YouTube Shorts' | 'TikTok' | 'Instagram Reels' | 'LinkedIn Video';
}

export interface ColdEmailAngle {
  subjectLine: string;
  openingLine: string;
  painPoint: string;
  valueProposition: string;
  cta: string;
  fullEmail: string;
  targetSegment: string;
}

// ─── Full Content Pack ────────────────────────────────────────

export interface ContentPack {
  id: string;
  createdAt: string;
  input: ContentInput;
  linkedInPosts: LinkedInPost[];
  blogArticle: BlogArticle;
  emailNewsletter: EmailNewsletter;
  gbpPosts: GbpPost[];
  videoScripts: VideoScript[];
  coldEmailAngles: ColdEmailAngle[];
  ctas: string[];
  status: ContentStatus;
  airtableRecordId?: string;
  notionPageId?: string;
}

// ─── Content Calendar ─────────────────────────────────────────

export interface CalendarEntry {
  date: string;
  channel: ContentChannel;
  topic: string;
  pillar: ContentPillar;
  cta: string;
  status: ContentStatus;
  contentPackId?: string;
}

export interface ContentCalendar {
  generatedAt: string;
  startDate: string;
  endDate: string;
  entries: CalendarEntry[];
}

// ─── Airtable ─────────────────────────────────────────────────

export interface AirtableRecord {
  id?: string;
  fields: {
    Topic: string;
    Pillar: ContentPillar;
    'Source Type': SourceType;
    Transcript?: string;
    'Core Insight'?: string;
    'Target Audience'?: string;
    CTA?: string;
    Status: ContentStatus;
    'LinkedIn Posts'?: string;
    'Blog Article'?: string;
    'Email Newsletter'?: string;
    'GBP Posts'?: string;
    'Video Scripts'?: string;
    'Cold Email Angles'?: string;
    'SEO Keywords'?: string;
    'Publish Date'?: string;
  };
}

// ─── Notion ───────────────────────────────────────────────────

export interface NotionPageProperties {
  Title: string;
  'Content Type': string;
  Pillar: ContentPillar;
  Status: ContentStatus;
  CTA: string;
  'Publish Date'?: string;
  Channel: ContentChannel;
  'SEO Keyword'?: string;
  'Created Date': string;
}

// ─── Export ───────────────────────────────────────────────────

export interface ExportOptions {
  formats: ('markdown' | 'csv' | 'json')[];
  outputDir: string;
  includeCalendar: boolean;
}

export interface WeeklyExportResult {
  packId: string;
  exportedFiles: string[];
  exportedAt: string;
}

// ─── Webhook ──────────────────────────────────────────────────

export interface WebhookPayload {
  trigger:
    | 'new_airtable_row'
    | 'new_transcript'
    | 'export_weekly'
    | 'send_to_buffer';
  data: Record<string, unknown>;
  secret?: string;
}
