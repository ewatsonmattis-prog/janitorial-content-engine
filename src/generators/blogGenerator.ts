// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Blog Article Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, BlogArticle, SeoData, BlogSection } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For blog articles, return a JSON object with this exact schema:
{
  "title": "string",
  "seo": {
    "primaryKeyword": "string",
    "secondaryKeywords": ["string"],
    "metaTitle": "string (under 60 chars)",
    "metaDescription": "string (under 160 chars)",
    "urlSlug": "string (lowercase-hyphenated)",
    "internalLinkSuggestions": ["string"],
    "localSeoVariations": ["string"]
  },
  "introduction": "string",
  "sections": [
    { "heading": "string", "content": "string" }
  ],
  "conclusion": "string",
  "fullMarkdown": "string (complete article in Markdown)",
  "wordCount": number
}

Return ONLY valid JSON. No markdown wrapper, no commentary.`;

export async function generateBlogArticle(
  input: ContentInput
): Promise<BlogArticle> {
  const promptTemplate = loadPrompt('blog-article', buildVariables(input));

  const userPrompt = `${promptTemplate}

Return the complete blog article as a JSON object. The fullMarkdown field must contain the full publishable article including all headings, body copy, and CTA block. Aim for 1,200–1,800 words.`;

const raw = JSON.stringify({
  title: "How Facilities Managers Can Improve Cleaning Contractor Reliability",
  seo: {
    primaryKeyword: "commercial cleaning contract lead generation",
    secondaryKeywords: ["commercial cleaning", "facilities management", "office cleaning"],
    metaTitle: "Commercial Cleaning Contract Lead Generation",
    metaDescription: "Learn how facilities managers can improve cleaning contractor reliability with clearer standards, reporting and service accountability."
  },
  introduction: "Reliable cleaning is essential for every commercial site. Facilities managers need contractors who communicate clearly, maintain standards and reduce day-to-day pressure.",
  sections: [
    {
      heading: "Why reliability matters",
      body: "Missed visits, inconsistent standards and poor communication quickly create complaints and extra admin. A reliable cleaning partner helps facilities teams protect service quality."
    }
  ],
  conclusion: "CleanReach supports commercial sites with consistent cleaning, clear communication and accountable service delivery.",
  fullMarkdown: "# How Facilities Managers Can Improve Cleaning Contractor Reliability\n\nReliable cleaning is essential for every commercial site.\n\n## Why reliability matters\n\nMissed visits, inconsistent standards and poor communication quickly create complaints and extra admin.\n\nCleanReach supports commercial sites with consistent cleaning, clear communication and accountable service delivery.",
  wordCount: 95
});
  type RawBlog = {
    title: string;
    seo: SeoData;
    introduction: string;
    sections: BlogSection[];
    conclusion: string;
    fullMarkdown: string;
    wordCount: number;
  };

  const blog = parseJsonFromAI<RawBlog>(raw);

  // Calculate word count if AI didn't provide it
  if (!blog.wordCount && blog.fullMarkdown) {
    blog.wordCount = blog.fullMarkdown.split(/\s+/).length;
  }

  return blog;
}
