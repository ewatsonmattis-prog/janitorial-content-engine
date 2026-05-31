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

  const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);

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
